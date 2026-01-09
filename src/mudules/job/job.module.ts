import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { AuthModule } from '../auth/auth.module';
import { FirebaseModule } from '../../firebase/firebase.module';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';

@Module({
  imports:[AuthModule, FirebaseModule, CloudinaryModule],
  controllers: [JobController],
  providers: [JobService],
})
export class JobModule {}
