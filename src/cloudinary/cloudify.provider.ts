import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
    provide: 'CLOUDINARY',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        return cloudinary.config({
            cloud_name: configService.get<string>('cloudinary.name'),
            api_key: configService.get<string>('cloudinary.api_key'),
            api_secret: configService.get<string>('cloudinary.api_secret'),
        });
    },
};