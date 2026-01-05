import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AuthGuard implements CanActivate {
  firebaseService: any;
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;// access token
    // lấy từ body lên refresh token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token không tồn tại');
    }
    try {
      // checkRevoked: true trong verifyIdToken để chặn token nếu user đã đăng xuất hoặc đổi pass
      const decodedToken = await this.firebaseService.auth.verifyIdToken(
        token,
        true,
      );
      return true;
    } catch (err) {
      if (err?.name !== 'TokenExpiredError') {
        throw new UnauthorizedException('Token access hết hạn.');
      }
    }

    const refresh_token = request.body.refreshtoken;
    if (!refresh_token) {
      throw new UnauthorizedException('Token không tồn tại');
    }
    const apiKey = this.configService.get("firebase_api_key");
    const url = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;

    try {
      const response = await axios.post(url, {
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
      });
      return true;
    } catch (error) {
      throw new UnauthorizedException('Thông tin token không hợp lệ');
    }
  }
}
