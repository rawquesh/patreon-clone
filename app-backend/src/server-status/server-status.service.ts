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
  status: 'pending' | 'checking' | 'success' | 'error' | 'warning';
  message: string;
  error?: string;
  description?: string;
  isOptional?: boolean;
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
    adminCreationReady: boolean;
  }> {
    // Define all env var checks with descriptions
    const envVarChecks: StatusCheck[] = [
      {
        name: 'PORT',
        description: 'The port number the backend server listens on (default: 8080)',
        status: 'pending',
        message: 'Checking...',
      },
      {
        name: 'MONGODB_URI',
        description: 'MongoDB connection string — the database that stores all app data',
        status: 'pending',
        message: 'Checking...',
      },
      {
        name: 'JWT_SECRET',
        description: 'A cryptographic string used to sign and verify JSON Web Tokens (JWT). Keep this secret and make it strong (32+ characters)',
        status: 'pending',
        message: 'Checking...',
      },
      {
        name: 'STRIPE_SECRET_KEY',
        description: 'Your Stripe secret API key (starts with sk_live_ or sk_test_) — required for payment processing',
        status: 'pending',
        message: 'Checking...',
      },
      {
        name: 'STRIPE_WEBHOOK_SECRET',
        description: 'Stripe webhook signing secret — validates incoming Stripe events. Required for live payments',
        status: 'pending',
        message: 'Checking...',
        isOptional: true,
      },
      {
        name: 'STRIPE_WEBHOOK_CONNECT_SECRET',
        description: 'Stripe Connect webhook signing secret — validates payout-related events. Required for creator payouts',
        status: 'pending',
        message: 'Checking...',
        isOptional: true,
      },
      {
        name: 'AWS_ACCESS_KEY',
        description: 'AWS / S3-compatible storage access key — used to upload and serve media files (images, videos)',
        status: 'pending',
        message: 'Checking...',
      },
      {
        name: 'AWS_SECRET_KEY',
        description: 'AWS / S3-compatible storage secret key — paired with the access key above',
        status: 'pending',
        message: 'Checking...',
      },
      {
        name: 'AWS_ENDPOINT_URL',
        description: 'S3-compatible storage endpoint URL (e.g. https://s3.amazonaws.com or your MinIO/Railway endpoint)',
        status: 'pending',
        message: 'Checking...',
      },
      {
        name: 'S3_BUCKET_NAME',
        description: 'The primary S3 bucket name for storing user-uploaded media files',
        status: 'pending',
        message: 'Checking...',
      },
      {
        name: 'S3_COLLECTIONS_BUCKET',
        description: 'S3 bucket for creator collections — additional media storage',
        status: 'pending',
        message: 'Checking...',
        isOptional: true,
      },
      {
        name: 'S3_TEST_BUCKET',
        description: 'S3 bucket for test/cover images — used during development and testing',
        status: 'pending',
        message: 'Checking...',
        isOptional: true,
      },
      {
        name: 'GOOGLE_CLIENT_ID',
        description: 'Google OAuth Client ID — enables "Sign in with Google" for creators and members. Without this, Google OAuth will not work in the app',
        status: 'pending',
        message: 'Checking...',
        isOptional: true,
      },
      {
        name: 'GOOGLE_CLIENT_SECRET',
        description: 'Google OAuth Client Secret — paired with the Client ID above for OAuth flows',
        status: 'pending',
        message: 'Checking...',
        isOptional: true,
      },
      {
        name: 'BACKEND_URL',
        description: 'Public backend URL — required for Google OAuth redirects to work. Without this, sign-in with Google will fail',
        status: 'pending',
        message: 'Checking...',
        isOptional: true,
      },
      {
        name: 'FRONTEND_URL',
        description: 'Public URL of the app-web frontend — used for Stripe callbacks and OAuth redirects',
        status: 'pending',
        message: 'Checking...',
      },
      {
        name: 'ALLOWED_ORIGINS',
        description: 'Comma-separated list of allowed frontend/dashboard URLs — must include your deployed app and dashboard URLs for CORS to work',
        status: 'pending',
        message: 'Checking...',
      },
      {
        name: 'BRAND_LOGO_URL',
        description: 'Custom logo image URL for the dashboard — leave blank to use the default',
        status: 'pending',
        message: 'Checking...',
        isOptional: true,
      },
      {
        name: 'BRAND_EMAIL_HEADER_URL',
        description: 'Email header logo URL — shown at the top of transactional emails',
        status: 'pending',
        message: 'Checking...',
        isOptional: true,
      },
      {
        name: 'BRAND_EMAIL_FOOTER_URL',
        description: 'Email footer logo URL — shown at the bottom of transactional emails',
        status: 'pending',
        message: 'Checking...',
        isOptional: true,
      },
      {
        name: 'BRAND_FAVICON_URL',
        description: 'Favicon image URL — shown in the browser tab',
        status: 'pending',
        message: 'Checking...',
        isOptional: true,
      },
    ];

    const checks: StatusCheck[] = [];
    let mongodbReady = false;
    let s3Ready = false;
    let jwtSecretReady = false;
    let adminExists = false;

    // --- MONGODB ---
    const mongoIdx = envVarChecks.findIndex((c) => c.name === 'MONGODB_URI');
    try {
      envVarChecks[mongoIdx].status = 'checking';
      envVarChecks[mongoIdx].message = 'Pinging database...';
      await this.userModel.findOne({}, { _id: 1 }).lean();
      envVarChecks[mongoIdx].status = 'success';
      envVarChecks[mongoIdx].message = 'Connected successfully';
      mongodbReady = true;
    } catch (err: any) {
      const uri = this.configService.get<string>('MONGODB_URI') || '';
      if (!uri || uri.startsWith('your-') || uri.trim() === '') {
        envVarChecks[mongoIdx].status = 'error';
        envVarChecks[mongoIdx].message = 'MONGODB_URI is not configured';
        envVarChecks[mongoIdx].error = 'Please set your MongoDB connection string (e.g. mongodb+srv://user:password@host:port/database)';
      } else {
        envVarChecks[mongoIdx].status = 'error';
        envVarChecks[mongoIdx].message = 'Cannot connect to MongoDB';
        envVarChecks[mongoIdx].error = err.message;
      }
    }

    // --- JWT SECRET ---
    const jwtIdx = envVarChecks.findIndex((c) => c.name === 'JWT_SECRET');
    try {
      envVarChecks[jwtIdx].status = 'checking';
      envVarChecks[jwtIdx].message = 'Validating...';
      const jwtSecret = this.configService.get<string>('JWT_SECRET') || '';
      if (!jwtSecret || jwtSecret === 'your-jwt-secret' || jwtSecret.trim() === '') {
        envVarChecks[jwtIdx].status = 'error';
        envVarChecks[jwtIdx].message = 'JWT_SECRET is a placeholder value';
        envVarChecks[jwtIdx].error = 'JWT Secret is a cryptographic string used to sign and verify JSON Web Tokens. Please set a strong, unique secret (32+ characters). Generate one with: node -e "console.log(require("crypto").randomBytes(64).toString("hex"))"';
      } else if (jwtSecret.length < 32) {
        envVarChecks[jwtIdx].status = 'error';
        envVarChecks[jwtIdx].message = 'JWT_SECRET is too short';
        envVarChecks[jwtIdx].error = `JWT Secret should be at least 32 characters for security (current: ${jwtSecret.length}). A longer secret is more secure.`;
      } else {
        envVarChecks[jwtIdx].status = 'success';
        envVarChecks[jwtIdx].message = `Strong secret configured (${jwtSecret.length} characters)`;
        jwtSecretReady = true;
      }
    } catch (err: any) {
      envVarChecks[jwtIdx].status = 'error';
      envVarChecks[jwtIdx].message = 'Failed to check JWT_SECRET';
      envVarChecks[jwtIdx].error = err.message;
    }

    // --- S3 BUCKETS & CREDENTIALS ---
    const s3Vars = ['AWS_ACCESS_KEY', 'AWS_SECRET_KEY', 'AWS_ENDPOINT_URL', 'S3_BUCKET_NAME'];
    let s3ConfigValid = true;
    for (const s3var of s3Vars) {
      const idx = envVarChecks.findIndex((c) => c.name === s3var);
      const val = this.configService.get<string>(s3var) || '';
      if (!val || val.startsWith('your-') || val.trim() === '') {
        envVarChecks[idx].status = 'error';
        envVarChecks[idx].message = `${s3var} is not configured`;
        envVarChecks[idx].error = `Please set your ${s3var} in the .env file. Without it, file uploads (profile photos, posts, videos) will not work.`;
        s3ConfigValid = false;
      } else {
        envVarChecks[idx].status = 'success';
        envVarChecks[idx].message = 'Configured';
      }
    }

    // S3 actual connection test
    if (s3ConfigValid) {
      const bucketIdx = envVarChecks.findIndex((c) => c.name === 'S3_BUCKET_NAME');
      try {
        const bucketName = this.configService.get<string>('S3_BUCKET_NAME') || '';
        await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
        envVarChecks[bucketIdx].status = 'success';
        envVarChecks[bucketIdx].message = `Connected to bucket: ${bucketName}`;
        s3Ready = true;
      } catch (err: any) {
        const bucketName = this.configService.get<string>('S3_BUCKET_NAME') || '';
        envVarChecks[bucketIdx].status = 'error';
        if (err.name === 'NoSuchBucket') {
          envVarChecks[bucketIdx].message = `Bucket "${bucketName}" does not exist`;
          envVarChecks[bucketIdx].error = `The S3 bucket "${bucketName}" was not found. Create it in your S3-compatible storage provider, or update S3_BUCKET_NAME in your .env to an existing bucket.`;
        } else if (err.name === 'AccessDenied') {
          envVarChecks[bucketIdx].message = 'Access denied to S3 bucket';
          envVarChecks[bucketIdx].error = `The provided AWS credentials do not have permission to access the bucket "${bucketName}". Check your AWS_ACCESS_KEY and AWS_SECRET_KEY, and ensure the IAM user has s3:GetObject and s3:PutObject permissions.`;
        } else {
          envVarChecks[bucketIdx].message = 'Cannot connect to S3 storage';
          envVarChecks[bucketIdx].error = err.message;
        }
      }
    }

    // S3 optional buckets
    const optionalBuckets = ['S3_COLLECTIONS_BUCKET', 'S3_TEST_BUCKET'];
    for (const bucket of optionalBuckets) {
      const idx = envVarChecks.findIndex((c) => c.name === bucket);
      const val = this.configService.get<string>(bucket) || '';
      if (!val || val.startsWith('your-') || val.trim() === '') {
        envVarChecks[idx].status = 'warning';
        envVarChecks[idx].message = 'Not configured (optional)';
        envVarChecks[idx].error = `${bucket} is not set. Some features may be limited, but core functionality will work.`;
      } else {
        envVarChecks[idx].status = 'success';
        envVarChecks[idx].message = 'Configured';
      }
    }

    // --- STRIPE ---
    const stripeIdx = envVarChecks.findIndex((c) => c.name === 'STRIPE_SECRET_KEY');
    try {
      envVarChecks[stripeIdx].status = 'checking';
      envVarChecks[stripeIdx].message = 'Validating Stripe key...';
      const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY') || '';
      if (!stripeKey || stripeKey.startsWith('your-') || stripeKey.trim() === '') {
        envVarChecks[stripeIdx].status = 'error';
        envVarChecks[stripeIdx].message = 'STRIPE_SECRET_KEY is not configured';
        envVarChecks[stripeIdx].error = 'Stripe API key is required for payment processing. Without it, subscriptions, memberships, and payouts will not work. Get your keys from https://dashboard.stripe.com/apikeys';
      } else if (stripeKey.startsWith('sk_live') || stripeKey.startsWith('sk_test_')) {
        await this.stripe.balance.retrieve();
        envVarChecks[stripeIdx].status = 'success';
        envVarChecks[stripeIdx].message = 'Stripe API key is valid';
      } else {
        envVarChecks[stripeIdx].status = 'error';
        envVarChecks[stripeIdx].message = 'STRIPE_SECRET_KEY format is invalid';
        envVarChecks[stripeIdx].error = 'Stripe secret key should start with "sk_live_" (production) or "sk_test_" (test). Check your key at https://dashboard.stripe.com/apikeys';
      }
    } catch (err: any) {
      envVarChecks[stripeIdx].status = 'error';
      envVarChecks[stripeIdx].message = 'Stripe validation failed';
      envVarChecks[stripeIdx].error = err.message;
    }

    // Stripe webhook secrets (optional)
    const stripeWebhookVars = ['STRIPE_WEBHOOK_SECRET', 'STRIPE_WEBHOOK_CONNECT_SECRET'];
    for (const v of stripeWebhookVars) {
      const idx = envVarChecks.findIndex((c) => c.name === v);
      const val = this.configService.get<string>(v) || '';
      if (!val || val.startsWith('your-') || val.trim() === '') {
        envVarChecks[idx].status = 'warning';
        envVarChecks[idx].message = 'Not configured (optional for dev)';
        envVarChecks[idx].error = `${v} is not set. This is required for live mode to validate incoming Stripe webhook events. Stripe webhooks will be skipped if not configured.`;
      } else {
        envVarChecks[idx].status = 'success';
        envVarChecks[idx].message = 'Configured';
      }
    }

    // --- GOOGLE OAUTH ---
    const googleVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'BACKEND_URL'];

    for (const v of googleVars) {
      const idx = envVarChecks.findIndex((c) => c.name === v);
      const val = this.configService.get<string>(v) || '';
      if (!val || val.startsWith('your-') || val.trim() === '') {
        envVarChecks[idx].status = 'warning';
        envVarChecks[idx].message = 'Not configured — Google OAuth disabled';
        if (v === 'BACKEND_URL') {
          envVarChecks[idx].error = `BACKEND_URL is not set. Google OAuth will not work without the public backend URL. Set this to your deployed backend URL (e.g. https://api.yourdomain.com). OAuth redirect URLs must match this.`;
        } else {
          envVarChecks[idx].error = `${v} is not set. "Sign in with Google" will be disabled. Configure it at https://console.cloud.google.com/apis/credentials`;
        }
      } else {
        envVarChecks[idx].status = 'success';
        envVarChecks[idx].message = 'Configured';
      }
    }

    // --- FRONTEND_URL ---
    const frontendIdx = envVarChecks.findIndex((c) => c.name === 'FRONTEND_URL');
    const frontendVal = this.configService.get<string>('FRONTEND_URL') || '';
    if (!frontendVal || frontendVal.startsWith('your-') || frontendVal.trim() === '') {
      envVarChecks[frontendIdx].status = 'error';
      envVarChecks[frontendIdx].message = 'FRONTEND_URL is not configured';
      envVarChecks[frontendIdx].error = 'Set this to your deployed app-web URL (e.g. https://yourdomain.com). Used for Stripe payment redirects and OAuth callbacks.';
    } else {
      envVarChecks[frontendIdx].status = 'success';
      envVarChecks[frontendIdx].message = `Configured: ${frontendVal}`;
    }

    // --- ALLOWED_ORIGINS ---
    const corsIdx = envVarChecks.findIndex((c) => c.name === 'ALLOWED_ORIGINS');
    const corsVal = this.configService.get<string>('ALLOWED_ORIGINS') || '';
    if (!corsVal || corsVal.startsWith('your-') || corsVal.trim() === '') {
      envVarChecks[corsIdx].status = 'error';
      envVarChecks[corsIdx].message = 'ALLOWED_ORIGINS is not configured';
      envVarChecks[corsIdx].error = 'Set this to a comma-separated list of allowed frontend and dashboard URLs (e.g. https://yourdomain.com,https://dashboard.yourdomain.com). The app will not work without CORS configured.';
    } else {
      envVarChecks[corsIdx].status = 'success';
      envVarChecks[corsIdx].message = `Configured: ${corsVal}`;
    }

    // --- PORT ---
    const portIdx = envVarChecks.findIndex((c) => c.name === 'PORT');
    const portVal = this.configService.get<string>('PORT') || '';
    if (!portVal || portVal.trim() === '') {
      envVarChecks[portIdx].status = 'warning';
      envVarChecks[portIdx].message = 'Not set — defaults to 8080';
    } else {
      envVarChecks[portIdx].status = 'success';
      envVarChecks[portIdx].message = `Port ${portVal}`;
    }

    // --- BRANDING ---
    const brandVars = ['BRAND_LOGO_URL', 'BRAND_EMAIL_HEADER_URL', 'BRAND_EMAIL_FOOTER_URL', 'BRAND_FAVICON_URL'];
    for (const v of brandVars) {
      const idx = envVarChecks.findIndex((c) => c.name === v);
      const val = this.configService.get<string>(v) || '';
      if (!val || val.startsWith('your-') || val.trim() === '') {
        envVarChecks[idx].status = 'warning';
        envVarChecks[idx].message = 'Not set — using default branding';
      } else {
        envVarChecks[idx].status = 'success';
        envVarChecks[idx].message = 'Custom branding configured';
      }
    }

    // --- ADMIN USER CHECK ---
    let adminCheck: StatusCheck = {
      name: 'Admin User',
      description: 'Checks whether a user with admin privileges exists in the database',
      status: 'pending',
      message: 'Checking...',
    };
    try {
      adminCheck.status = 'checking';
      adminCheck.message = 'Querying database...';
      const admin = await this.userModel.findOne({ isAdmin: true }).lean();
      if (admin) {
        adminCheck.status = 'success';
        adminCheck.message = `Admin user found: ${admin.email}`;
        adminExists = true;
      } else {
        adminCheck.status = 'success';
        adminCheck.message = 'No admin user found — safe to create one';
      }
    } catch (err: any) {
      adminCheck.status = 'error';
      adminCheck.message = 'Failed to check for admin users';
      adminCheck.error = err.message;
    }

    // Assemble checks in logical groups
    checks.push(
      // Core Infrastructure
      envVarChecks.find((c) => c.name === 'PORT')!,
      envVarChecks.find((c) => c.name === 'MONGODB_URI')!,
      envVarChecks.find((c) => c.name === 'JWT_SECRET')!,
      // S3 Storage
      envVarChecks.find((c) => c.name === 'AWS_ACCESS_KEY')!,
      envVarChecks.find((c) => c.name === 'AWS_SECRET_KEY')!,
      envVarChecks.find((c) => c.name === 'AWS_ENDPOINT_URL')!,
      envVarChecks.find((c) => c.name === 'S3_BUCKET_NAME')!,
      envVarChecks.find((c) => c.name === 'S3_COLLECTIONS_BUCKET')!,
      envVarChecks.find((c) => c.name === 'S3_TEST_BUCKET')!,
      // Stripe Payments
      envVarChecks.find((c) => c.name === 'STRIPE_SECRET_KEY')!,
      envVarChecks.find((c) => c.name === 'STRIPE_WEBHOOK_SECRET')!,
      envVarChecks.find((c) => c.name === 'STRIPE_WEBHOOK_CONNECT_SECRET')!,
      // Google OAuth
      envVarChecks.find((c) => c.name === 'GOOGLE_CLIENT_ID')!,
      envVarChecks.find((c) => c.name === 'GOOGLE_CLIENT_SECRET')!,
      envVarChecks.find((c) => c.name === 'BACKEND_URL')!,
      // URLs & CORS
      envVarChecks.find((c) => c.name === 'FRONTEND_URL')!,
      envVarChecks.find((c) => c.name === 'ALLOWED_ORIGINS')!,
      // Branding
      envVarChecks.find((c) => c.name === 'BRAND_LOGO_URL')!,
      envVarChecks.find((c) => c.name === 'BRAND_EMAIL_HEADER_URL')!,
      envVarChecks.find((c) => c.name === 'BRAND_EMAIL_FOOTER_URL')!,
      envVarChecks.find((c) => c.name === 'BRAND_FAVICON_URL')!,
      // Admin
      adminCheck,
    );

    // allPassed: everything except admin and optional/warning checks passes
    const criticalChecks = checks.filter(
      (c) => !c.isOptional && c.name !== 'Admin User'
    );
    const allPassed = criticalChecks.every((c) => c.status === 'success');

    // adminCreationReady: only MONGODB, S3, and JWT_SECRET need to be valid
    const adminCreationReady =
      mongodbReady &&
      s3Ready &&
      jwtSecretReady &&
      adminCheck.status !== 'error';

    return { checks, allPassed, adminExists, adminCreationReady };
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
