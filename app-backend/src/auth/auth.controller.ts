import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SignUpDto, LoginDto, RegisterDto, GoogleTokenDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  async getCurrentUser(@Req() req) {
    return this.authService.getCurrentUser(req.user.userId);
  }

  @Post('signup')
  async signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signup(signUpDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res) {
    const { token } = await this.authService.googleLogin(req.user);
    console.log('FRONTEND_URL');
    console.log(process.env.FRONTEND_URL);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }

  @Post('google/mobile')
  async googleMobileLogin(@Body() googleTokenDto: GoogleTokenDto) {
    return this.authService.verifyGoogleAccessToken(googleTokenDto.accessToken);
  }

  @Get('check-username/:username')
  async checkUsername(@Param('username') username: string) {
    const isInUse = await this.authService.isUsernameInUse(username);
    return { isInUse };
  }

  @Get('check-email/:email')
  async checkEmail(@Param('email') email: string) {
    const { isInUse, passwordSet } = await this.authService.isEmailInUse(email);
    return { isInUse, passwordSet };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
