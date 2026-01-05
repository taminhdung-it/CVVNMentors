import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedException('Token không tồn tại');
    }

    /** =======================
     * 1️⃣ VERIFY ACCESS TOKEN
     ======================= */
    try {
      await admin.auth().verifyIdToken(accessToken, true);
      return true; // ✅ token còn hạn
    } catch (err: any) {
      // ❌ token sai → reject ngay
      if (err?.code !== 'auth/id-token-expired') {
        throw new UnauthorizedException('Access token không hợp lệ');
      }
      // ✅ token hết hạn → cho refresh
    }

    /** =======================
     * 2️⃣ REFRESH TOKEN
     ======================= */
    const refreshToken = request.headers['tokenrefresh'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token không tồn tại');
    }

    const apiKey = this.configService.get<string>('firebase_api_key');
    const url = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;

    try {
      await axios.post(url, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      // ✅ refresh token hợp lệ
      return true;
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }
}
