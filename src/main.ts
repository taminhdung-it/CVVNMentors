import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Post } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000', //backend mặc định
      'http://localhost:9999',// backend cổng 9999
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // loại bỏ các field không có trong DTO
    forbidNonWhitelisted: true, // báo lỗi nếu gửi thêm field lạ
    transform: true, // tự động chuyển kiểu dữ liệu nếu cần
  }));

  await app.listen(process.env.SERVER_PORT ?? process.env.PORT ?? 3000);
  const server = app.getHttpServer();
  const address = server.address();
  const url = await app.getUrl()
  if (address.port == 10000) {
    console.log(`🎉Server Render đang chạy trên link: https://tungo-web.onrender.com/doc_api`)
  } else {
    console.log(`🎉Server Render đang chạy trên link: ${url.replace("[::1]", "localhost")}`)
  }
}
bootstrap();
