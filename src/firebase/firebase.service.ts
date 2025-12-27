import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
    constructor(@Inject('FIREBASE_APP') private firebaseApp: admin.app.App) {}

    // Getter cho Auth instance
    get auth() {
        return this.firebaseApp.auth();
    }

    // Getter cho Firestore (nếu sau này bạn dùng)
    get firestore() {
        return this.firebaseApp.firestore();
    }

    // Getter cho Storage (nếu sau này bạn dùng upload CV)
    get storage() {
        return this.firebaseApp.storage();
    }
}