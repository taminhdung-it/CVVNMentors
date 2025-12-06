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

    return { path: 'QuanLyCV/information', data };
  }

  async onModuleInit() {
    try {
      const check_connect_firestorage = await this.write_information_website();
      console.log('🔥Đã kết nối firestore thành công');
    } catch (e) {
      console.error('🔥Kết nối firebase thất bại. Báo lỗi', e);
      process.exit(1);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
