import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './mudules/auth/auth.module';
import { CvModule } from './mudules/cv/cv.module';
import configuration from './config/configuration';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
