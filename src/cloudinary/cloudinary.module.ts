import { Module, Global } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from './cloudify.provider';
import { ConfigModule } from '@nestjs/config';

@Global() // Để dùng ở mọi nơi không cần import lại
@Module({
    imports: [ConfigModule],
    providers: [CloudinaryProvider, CloudinaryService],
    exports: [CloudinaryService, CloudinaryProvider],
})
export class CloudinaryModule {}