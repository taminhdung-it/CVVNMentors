import {
  BadRequestException, ForbiddenException,
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
import { async } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly apiKey: any;
  constructor(
    private firebaseService: FirebaseService, 
    private configService: ConfigService,

  ) {
    this.apiKey = this.configService.get<string>("database.firebase_api_key");
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
    } catch (error) {
      const firebaseError = error.response?.data?.error?.message;

      console.error('Firebase Login Error:', firebaseError);

      // Case 1: Tài khoản bị vô hiệu hóa (Disabled)
      if (firebaseError === 'USER_DISABLED') {
        throw new ForbiddenException('Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.');
      }

      // Case 2: Sai thông tin đăng nhập (Email không tồn tại hoặc sai pass)
      const invalidCredentialsErrors = [
        'EMAIL_NOT_FOUND',
        'INVALID_PASSWORD',
        'INVALID_LOGIN_CREDENTIALS' // Firebase bản mới có thể trả về mã chung này
      ];

      if (invalidCredentialsErrors.includes(firebaseError)) {
        throw new UnauthorizedException('Email hoặc mật khẩu không chính xác.');
      }

      // Case 3: Các lỗi khác (Lỗi server, quá nhiều lần thử, v.v.)
      throw new InternalServerErrorException(`Đăng nhập thất bại: ${firebaseError || 'Lỗi không xác định'}`);
    }

  }

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
