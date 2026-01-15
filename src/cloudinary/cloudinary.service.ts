import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);

    /**
     * Upload file lên Cloudinary
     * @param file File từ Multer
     * @param folder Tên folder trên Cloudinary (VD: 'cvs', 'avatars')
     */
    async uploadFile(file: Express.Multer.File, folder: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: 'raw',
                  format: file.originalname.split('.').pop(), // Hoặc để Cloudinary tự lấy đuôi file
                  unique_filename: true,
                  access_mode: 'public'
                },
                (error, result) => {
                    if (error) {
                        this.logger.error(`Upload failed for file ${file.originalname}: ${error.message}`);
                        return reject(error);
                    }
                    if (!result) {
                        const err = new Error('Cloudinary upload successful but returned no result');
                        this.logger.error(err.message);
                        return reject(err);
                    }
                    resolve(result);
                },
            );

            // Convert buffer sang stream để upload
            const stream = new Readable();
            stream.push(file.buffer);
            stream.push(null);
            stream.pipe(uploadStream);
        });
    }

    /**
     * Xóa file trên Cloudinary
     * @param publicId Public ID của file (VD: 'cvs/abc-xyz')
     */
    async deleteFile(publicId: string): Promise<any> {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            if (result.result !== 'ok') {
                this.logger.warn(`Cloudinary delete result: ${result.result} for ID: ${publicId}`);
            }
            return result;
        } catch (error) {
            this.logger.error(`Delete failed for ID ${publicId}: ${error.message}`);
            throw error;
        }
    }
}