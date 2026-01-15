import { document } from './../../../swagger/swagger.document';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as admin from 'firebase-admin';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly firebaseService: FirebaseService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const router = request.headers['router'] as string;
    const account_id = request.headers["accountid"] as string;
    if (!router) {
      throw new UnauthorizedException('quyền không tồn tại');
    }
    if (!account_id) {
      throw new UnauthorizedException('accountid không tồn tại');
    }
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedException('Token không tồn tại');
    }
    const refreshToken = request.headers['refreshtoken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token không tồn tại');
    }
    try {
      await admin.auth().verifyIdToken(accessToken, true);

      //Kiểm tra quyền
      const item = router.split("/")[0];
      const permission = router.split("/")[1];
      const doc = await this.firebaseService.firestore.collection("users").doc(String(account_id)).get()
      const data = doc.data();
      const doc1 = await this.firebaseService.firestore.collection("role").doc(String(data?.role)).collection(String(item)).doc(String(permission)).get()
      const data1 = doc1.data()
      if (data1?.active!=0){
        throw new UnauthorizedException('Không có quyền truy cập');
      }
      return true;
    } catch (err: any) {
      // ❌ token sai → reject ngay
      if (err?.code !== 'auth/id-token-expired') {
        throw new UnauthorizedException(`Access token không hợp lệ ${err}`);
      }
    }

    const apiKey = this.configService.get<string>('firebase_api_key');
    const url = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;

    try {
      await axios.post(url, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      //Kiểm tra quyền
      const item = router.split("/")[0];
      const permission = router.split("/")[1];
      const doc = await this.firebaseService.firestore.collection("users").doc(String(account_id)).get()
      const data = doc.data();
      const doc1 = await this.firebaseService.firestore.collection("role").doc(String(data?.role)).collection(String(item)).doc(String(permission)).get()
      const data1 = doc1.data()
      if (data1?.active!=0){
        throw new UnauthorizedException('Không có quyền truy cập');
      }
      return true;
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

  }
}
