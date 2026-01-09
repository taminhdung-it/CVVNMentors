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
    this.apiKey = this.configService.get("firebase_api_key");
  }
  async register(registerDto: RegisterDto) {
    try {
      // Dùng Admin SDK để tạo user
      const userRecord = await this.firebaseService.auth.createUser({
        email: registerDto.email,
        password: registerDto.password,
      });
      return {
        message: 'Đăng ký thành công',
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
    } catch (error: any) {
      const firebaseError = error.response?.data;

      console.error('🔥 FIREBASE ERROR RAW =====>');
      console.error(JSON.stringify(firebaseError, null, 2));

      throw new UnauthorizedException({
        message: `Firebase login failed,  ${this.apiKey}`,
        firebase: firebaseError,
      });
    }}

  async logout(uid: string) {
      try {
        await this.firebaseService.auth.revokeRefreshTokens(uid);

        return { message: 'Đăng xuất thành công' };
      } catch (error) {
        throw new BadRequestException('Lỗi khi đăng xuất');
      }
    }

    // Hàm này trả về DecodedIdToken nếu đúng, ném lỗi nếu sai.
  }
