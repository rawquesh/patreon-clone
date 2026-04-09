import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import Stripe from 'stripe';
import * as bcrypt from 'bcrypt';
import { User, AuthProvider } from '@/database/schemas/user';

export interface StatusCheck {
  name: string;
  status: 'pending' | 'checking' | 'success' | 'error';
  message: string;
  error?: string;
}

export interface CreateAdminDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class ServerStatusService {
  private s3Client: S3Client;
  private stripe: Stripe;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_DEFAULT_REGION') || 'auto',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_KEY') || '',
      },
      ...(this.configService.get<string>('AWS_ENDPOINT_URL') && {
        endpoint: this.configService.get<string>('AWS_ENDPOINT_URL'),
        forcePathStyle: true,
      }),
    });

    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async runAllChecks(): Promise<{
    checks: StatusCheck[];
    allPassed: boolean;
    adminExists: boolean;
  }> {
    const checks: StatusCheck[] = [
      { name: 'MongoDB Database', status: 'pending', message: 'Connecting...' },
      { name: 'S3 Storage', status: 'pending', message: 'Connecting...' },
      { name: 'Stripe API', status: 'pending', message: 'Validating...' },
      { name: 'Environment Variables', status: 'pending', message: 'Scanning...' },
      { name: 'JWT Secret', status: 'pending', message: 'Checking...' },
      { name: 'Admin User', status: 'pending', message: 'Checking...' },
    ];

    // MongoDB
    try {
      checks[0].status = 'checking';
      checks[0].message = 'Pinging database...';
      await this.userModel.findOne({}, { _id: 1 }).lean();
      checks[0].status = 'success';
      checks[0].message = 'Connected successfully';
    } catch (err: any) {
      checks[0].status = 'error';
      checks[0].message = 'Failed to connect to MongoDB';
      checks[0].error = err.message;
    }

    // S3
    try {
      checks[1].status = 'checking';
      checks[1].message = 'Testing S3 connection...';
      const bucketName = this.configService.get<string>('S3_BUCKET_NAME') || '';
      if (!bucketName) {
        throw new Error('S3_BUCKET_NAME is not configured');
      }
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      checks[1].status = 'success';
      checks[1].message = `Connected to bucket: ${bucketName}`;
    } catch (err: any) {
      const bucketName = this.configService.get<string>('S3_BUCKET_NAME') || '';
      checks[1].status = 'error';
      checks[1].message = 'Failed to connect to S3 storage';
      checks[1].error = err.name === 'NoSuchBucket' ? `Bucket does not exist: ${bucketName}` : err.message;
    }

    // Stripe
    try {
      checks[2].status = 'checking';
      checks[2].message = 'Validating Stripe key...';
      const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
      if (!stripeKey) {
        throw new Error('STRIPE_SECRET_KEY is not configured');
      }
      if (stripeKey.startsWith('sk_live') || stripeKey.startsWith('sk_test_')) {
        await this.stripe.balance.retrieve();
        checks[2].status = 'success';
        checks[2].message = 'Stripe API key is valid';
      } else {
        throw new Error('STRIPE_SECRET_KEY format is invalid (should start with sk_live or sk_test_)');
      }
    } catch (err: any) {
      checks[2].status = 'error';
      checks[2].message = 'Stripe validation failed';
      checks[2].error = err.message;
    }

    // Environment Variables
    try {
      checks[3].status = 'checking';
      checks[3].message = 'Scanning required variables...';
      const requiredVars = [
        'PORT',
        'MONGODB_URI',
        'JWT_SECRET',
        'STRIPE_SECRET_KEY',
        'AWS_ACCESS_KEY',
        'AWS_SECRET_KEY',
        'AWS_ENDPOINT_URL',
        'S3_BUCKET_NAME',
        'FRONTEND_URL',
        'ALLOWED_ORIGINS',
      ];
      const missing: string[] = [];
      for (const v of requiredVars) {
        const val = this.configService.get<string>(v);
        if (!val || val.trim() === '' || val.startsWith('your-')) {
          missing.push(v);
        }
      }
      if (missing.length > 0) {
        checks[3].status = 'error';
        checks[3].message = `${missing.length} required variable(s) missing or not configured:`;
        checks[3].error = missing.join(', ');
      } else {
        checks[3].status = 'success';
        checks[3].message = 'All required environment variables are set';
      }
    } catch (err: any) {
      checks[3].status = 'error';
      checks[3].message = 'Failed to scan environment variables';
      checks[3].error = err.message;
    }

    // JWT Secret
    try {
      checks[4].status = 'checking';
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret || jwtSecret.trim() === '' || jwtSecret === 'change-me') {
        checks[4].status = 'error';
        checks[4].message = 'JWT_SECRET is not properly configured';
        checks[4].error = 'JWT_SECRET appears to be a placeholder value. Please set a strong secret.';
      } else if (jwtSecret.length < 32) {
        checks[4].status = 'error';
        checks[4].message = 'JWT_SECRET is too short';
        checks[4].error = `JWT_SECRET should be at least 32 characters (current: ${jwtSecret.length})`;
      } else {
        checks[4].status = 'success';
        checks[4].message = `JWT_SECRET is strong (${jwtSecret.length} chars)`;
      }
    } catch (err: any) {
      checks[4].status = 'error';
      checks[4].message = 'Failed to check JWT_SECRET';
      checks[4].error = err.message;
    }

    // Admin User
    try {
      checks[5].status = 'checking';
      checks[5].message = 'Querying database...';
      const admin = await this.userModel.findOne({ isAdmin: true }).lean();
      if (admin) {
        checks[5].status = 'success';
        checks[5].message = `Admin user found: ${admin.email}`;
      } else {
        checks[5].status = 'success';
        checks[5].message = 'No admin user found — safe to create one';
      }
    } catch (err: any) {
      checks[5].status = 'error';
      checks[5].message = 'Failed to check for admin users';
      checks[5].error = err.message;
    }

    const allPassed = checks
      .filter((c) => c.name !== 'Admin User')
      .every((c) => c.status === 'success');

    const adminExists = checks[5].status === 'success' && checks[5].message.includes('Admin user found');

    return { checks, allPassed, adminExists };
  }

  async createAdmin(data: CreateAdminDto): Promise<{ user: { id: string; email: string; firstName: string; lastName: string; isAdmin: boolean } }> {
    const existing = await this.userModel.findOne({ email: data.email }).lean();
    if (existing) {
      throw new Error('A user with this email already exists');
    }

    const adminExists = await this.userModel.findOne({ isAdmin: true }).lean();
    if (adminExists) {
      throw new Error('An admin user already exists. Only one admin is allowed.');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await this.userModel.create({
      email: data.email,
      password: passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      provider: AuthProvider.LOCAL,
      isAdmin: true,
    });

    return {
      user: {
        id: (user._id as any).toString(),
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        isAdmin: user.isAdmin || false,
      },
    };
  }
}
