import {
  ConflictException,
  Injectable,
  BadRequestException,
  Logger,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, AuthProvider } from '@/database/schemas/user';
import { SignUpDto, LoginDto, RegisterDto } from './auth.dto';
import { PaymentsService } from '@/payments/payments.service';
import { branding } from '@/config';
import axios from 'axios';
import { SettingsService } from '@/admin/services/settings.service';

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private paymentsService: PaymentsService,
    private readonly settingsService: SettingsService,
  ) {}

  private async isRegistrationsEnabled(): Promise<boolean> {
    try {
      return await this.settingsService.get<boolean>('enableRegistrations', true);
    } catch {
      return true;
    }
  }

  async verifyGoogleAccessToken(accessToken: string) {
    try {
      this.logger.log('Attempting to verify Google access token...');
      const response = await axios.get(
        branding.google.userInfoUrl,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const profile = response.data;
      if (!profile || !profile.email) {
        throw new Error('Could not retrieve profile from Google.');
      }

      this.logger.log(`Google profile retrieved for email: ${profile.email}`);

      let user = await this.userModel.findOne({ email: profile.email });

      if (!user) {
        if (!(await this.isRegistrationsEnabled())) {
          throw new BadRequestException('New registrations are currently disabled');
        }
        this.logger.log(
          `No user found for ${profile.email}, creating a new one.`,
        );
        user = await this.userModel.create({
          email: profile.email,
          firstName: profile.given_name,
          lastName: profile.family_name,
          profilePicture: profile.picture,
          provider: AuthProvider.GOOGLE,
          providerId: profile.id,
        });
      }

      const token = this.generateToken(user);

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
      };
    } catch (error) {
      this.logger.error(
        `Google Access Token verification failed: ${error.message}`,
        error.stack,
      );
      if (error.response) {
        this.logger.error(
          `Google API Error: ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new BadRequestException('Failed to verify Google access token.');
    }
  }

  // --- All other methods from your auth.service.ts go here ---
  // (signup, login, validateUser, googleLogin, generateToken, etc.)

  async signup(signUpDto: SignUpDto): Promise<any> {
    const { email, password, firstName, lastName } = signUpDto;

    if (!(await this.isRegistrationsEnabled())) {
      throw new BadRequestException('New registrations are currently disabled');
    }

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      provider: AuthProvider.LOCAL,
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin || false,
      },
      token,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async googleLogin(profile: any) {
    const { email, firstName, lastName, picture } = profile;
    let user = await this.userModel.findOne({ email });

    if (!user) {
      if (!(await this.isRegistrationsEnabled())) {
        throw new BadRequestException('New registrations are currently disabled');
      }
      user = await this.userModel.create({
        email,
        firstName,
        lastName,
        profilePicture: picture,
        provider: AuthProvider.GOOGLE,
        providerId: profile.id,
      });
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    };
  }

  private generateToken(user: User): string {
    const payload = { email: user.email, sub: user._id };
    return this.jwtService.sign(payload);
  }

  async getCurrentUser(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async isUsernameInUse(displayName: string): Promise<boolean> {
    const user = await this.userModel.findOne({ displayName });
    return !!user;
  }

  async isEmailInUse(email: string): Promise<{
    isInUse: boolean;
    passwordSet: boolean;
  }> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });

    if (user) {
      return {
        isInUse: true,
        passwordSet: !!user.password,
      };
    } else {
      return {
        isInUse: false,
        passwordSet: false,
      };
    }
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, firstName, lastName, gender } = registerDto;

    if (!(await this.isRegistrationsEnabled())) {
      throw new BadRequestException('New registrations are currently disabled');
    }

    const existingUser = await this.userModel.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userModel.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      gender,
      provider: AuthProvider.LOCAL,
    });

    const token = this.generateToken(newUser);

    return {
      user: newUser,
      token,
    };
  }
}
