import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { FirebaseModule } from '../../firebase/firebase.module';

@Module({
  imports:[HttpModule,AuthModule, FirebaseModule],
  controllers: [CvController],
  providers: [CvService],
})
export class CvModule {}
