import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { FirebaseModule } from '../../firebase/firebase.module';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';

@Module({
  imports:[HttpModule,AuthModule, FirebaseModule, CloudinaryModule],
  controllers: [CvController],
  providers: [CvService],
})
export class CvModule {}
