import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './mudules/auth/auth.module';
import { CvModule } from './mudules/cv/cv.module';
import { JobModule } from './mudules/job/job.module';
import { ApplicationModule } from './mudules/application/application.module';
import configuration from './config/configuration';
import {DepartmentModule} from "./mudules/department/department.module";

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
      DepartmentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
