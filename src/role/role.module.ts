import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { AuthModule } from 'src/modules/auth/auth.module';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports:[AuthModule,FirebaseModule],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
