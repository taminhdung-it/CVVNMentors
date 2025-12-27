import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import {LoginDto} from "./dto/login.dto";
import { RefreshTokenDto } from './dto/refresh.dto';
import {RegisterDto} from "./dto/register.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refresh_token);
  }

  // API test để kiểm tra việc verify token
  @UseGuards(AuthGuard)
  @Get('/me')
  getProfile(@Req() req) {
    return {
      message: 'This is a protected route',
      user: req.user,
    };
  }

  @UseGuards(AuthGuard) // Bắt buộc phải login mới được logout
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req) {
    // req.user được gán từ AuthGuard (là decoded token chứa uid)
    return this.authService.logout(req.user.uid);
  }
}
