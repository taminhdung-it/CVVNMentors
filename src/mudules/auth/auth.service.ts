import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { auth } from 'firebase-admin';
import DecodedIdToken = auth.DecodedIdToken;
import { FirebaseService } from '../../firebase/firebase.service';
import { LoginDto } from './dto/login.dto';

import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly apiKey: any;
  constructor(
    private firebaseService: FirebaseService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get('database.firebase_api_key');

    if (!this.apiKey) {
      throw new InternalServerErrorException(
        'Firebase API Key is missing in configuration',
      );
    }
  }
  async register(registerDto: RegisterDto) {
    try {
      // Dùng Admin SDK để tạo user
      const userRecord = await this.firebaseService.auth.createUser({
        email: registerDto.email,
        password: registerDto.password,
      });
      return {
        message: 'User registered successfully',
        uid: userRecord.uid,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async login(loginDto: LoginDto) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`;

    try {
      // Gọi REST API của Firebase để verify password và lấy token
      const response = await axios.post(url, {
        email: loginDto.email,
        password: loginDto.password,
        returnSecureToken: true,
      });

      return {
        access_token: response.data.idToken,
        refresh_token: response.data.refreshToken,
        user_id: response.data.localId,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async refresh(refreshToken: string) {
    const url = `https://securetoken.googleapis.com/v1/token?key=${this.apiKey}`;

    try {
      const response = await axios.post(url, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      return {
        access_token: response.data.id_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
        user_id: response.data.user_id,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(uid: string) {
    try {
      // revokeRefreshTokens: Hủy tất cả refresh token của user này.
      // Đồng thời, nó cập nhật "tokensValidAfterTime" của user.
      await this.firebaseService.auth.revokeRefreshTokens(uid);

      return { message: 'Đăng xuất thành công' };
    } catch (error) {
      throw new BadRequestException('Lỗi khi đăng xuất');
    }
  }

  // Hàm này trả về DecodedIdToken nếu đúng, ném lỗi nếu sai.
  async verifyToken(token: string): Promise<DecodedIdToken> {
    if (!token) {
      throw new UnauthorizedException('Token not exist');
    }
    try {
      // checkRevoked: true trong verifyIdToken để chặn token nếu user đã đăng xuất hoặc đổi pass
      const decodedToken = await this.firebaseService.auth.verifyIdToken(
        token,
        true,
      );
      return decodedToken;
    } catch (error) {
      if (error.code === 'auth/id-token-expired') {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
