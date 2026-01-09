import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Post } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { document } from './swagger/swagger.document'
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000', //backend mặc định
      'http://localhost:9999',// backend cổng 9999
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization','tokenrefresh'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

    SwaggerModule.setup("/doc_api", app, document, {
    swaggerOptions: {
      docExpansion: 'none', //Kiểu hiện thị danh sách khi mở lên 
      // operationsSorter: 'alpha',//Sắp xếp chức năng theo bảng chữ cái
      // tagsSorter: 'alpha',//Sắp xếp tên tags theo bảng chữ cái 
    },
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // loại bỏ các field không có trong DTO
    forbidNonWhitelisted: true, // báo lỗi nếu gửi thêm field lạ
    transform: true, // tự động chuyển kiểu dữ liệu nếu cần
  }));

  await app.listen(process.env.SERVER_PORT ?? process.env.PORT ?? 3000);
  const url = await app.getUrl()
  console.log(`🎉Link Render: https://webquanlycv.onrender.com/doc_api`)
  console.log(`🎉Link localhost: ${url.replace("[::1]", "localhost")}/doc_api`)
}
bootstrap();
