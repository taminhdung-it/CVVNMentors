// src/app.service.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly config: ConfigService,
    @Inject('FIREBASE_APP') private readonly firebaseApp: admin.app.App,
  ) { }

  private async write_information_website() {
    const name = this.config.get('app.name') || 'unknown';
    const mode = this.config.get('app.env') || 'unknown';
    const debug = this.config.get('app.debug') || 'unknown';
    const host = this.config.get('app.host') || 'localhost';
    const port = this.config.get("app.port") || 9999;


    const data = {
      name,
      mode,
      debug,
      host,
      port,
      launch_date: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = this.firebaseApp.firestore().doc('QuanLyCV/information');

    // Ghi đè hoàn toàn
    await docRef.set(data);
  }

  private async login_website() {
    const api_key = this.config.get("database.firebase_api_key")
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${api_key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: "admin@gmail.com", password: "123456789", returnSecureToken: true }),
    });
    const data = await res.json();

    if (!res.ok) {
      console.error('❌Lỗi kết nối fireauth. Báo lỗi: Không trùng khớp dữ liệu');
      throw new Error()
    }

    const idToken: string = data.idToken;
    if (!idToken) {
      console.error('❌Lỗi kết nối fireauth. Báo lỗi: Không tìm thấy token');
      throw new Error()
    }           

    const decoded = await this.firebaseApp
      .auth()
      .verifyIdToken(idToken)
      .catch((err) => {
        console.error('❌Lỗi kết nối fireauth. Báo lỗi: Không tìm thấy token không tồn tại');
        throw new Error()
      });
  };

  async onModuleInit() {
    try {
      await this.login_website()
      console.log('🔥Đã kết nối fireauth thành công');
      await this.write_information_website();
      console.log('🔥Đã kết nối firestore thành công');
    } catch (e) {
      console.error('🔥Kết nối firebase thất bại. Báo lỗi:', e);
      process.exit(1);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
