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
import {RegisterDto} from "./dto/register.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard) // Bắt buộc phải login mới được logout
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body:{id:string} ) {
    // req.user được gán từ AuthGuard (là decoded token chứa uid)
    return this.authService.logout(body.id);
  }
}
