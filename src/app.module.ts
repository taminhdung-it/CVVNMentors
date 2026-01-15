import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './modules/auth/auth.module';
import { CvModule } from './modules/cv/cv.module';
import { JobModule } from './modules/job/job.module';
import { ApplicationModule } from './modules/application/application.module';
import { RoleModule } from './role/role.module';
import configuration from './config/configuration';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,               // <--- làm ENV dùng được ở mọi nơi
      envFilePath: ['.env'],        // đọc file .env ở root
      load: [configuration],
    }),
    FirebaseModule,
    AuthModule,
    CvModule,
    JobModule,
    ApplicationModule,
    RoleModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
