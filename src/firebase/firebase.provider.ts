import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export const FirebaseProvider = {
  provide: 'FIREBASE_APP',
  useFactory: (config: ConfigService) => {
    // Nếu app đã tồn tại, trả về app cũ
    if (admin.apps.length > 0) {
      return admin.app();
    }

    const projectId = config.get<string>('database.firebase_project_id');
    const clientEmail = config.get<string>('database.firebase_client_email');
    let privateKey = config.get<string>('database.firebase_private_key');

    // Convert \n thành newline thật
    privateKey = privateKey?.replace(/\\n/g, '\n');

    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: config.get('firebase_storage_bucket'),
    });
  },
  inject: [ConfigService],
};
