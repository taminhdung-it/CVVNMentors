import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
export const document: OpenAPIObject = {
  openapi: '3.0.0',
  info: {
    title: 'Tungo Backend Api',
    version: '1.1.4',
    description: 'Tài liệu api dành cho frontend Tungo Web',
  },
  servers: [
    { url: 'https://tungo-web.onrender.com/', description: 'Server Render' },
    { url: 'http://localhost:9999/', description: 'Server local' },
  ],
  tags: [{ name: 'Tài khoản', description: 'Trang quản lý' }],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Tài khoản'],
        summary: 'Đăng nhập tài khoản',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: {
                    example: 'admin@gmail.com',
                    description: 'Email.',
                    type: 'string',
                  },
                  password: {
                    example: '123456',
                    description: 'Mật khẩu',
                    type: 'string',
                  },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Đăng nhập thành công',
            content: {
              'application/json': {
                examples: {
                  success: {
                    summary: 'Dữ liệu trả về.',
                    value:{
                      access_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImEzOGVhNmEwND...",
                      refresh_token: "AMf-vBwzoUQbCP4TnJaFj14WNz-UKTc6l8VkIyA_3...",
                      user_id: "It6H9popx7XiNJRHmLtxzVYQmXc2"
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Đăng nhập thất bại. Báo lỗi: ...' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Tài khoản'],
        summary: 'Đăng xuất tài khoản',
        parameters: [
          {
            "in": "header",
            "name": "refreshtoken",
            "required": true,
            "schema": { "type": "string", example: "<Nhập token refresh>" },
            "description": "Refresh Token"
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: {
                    example: '<Nhập id tài khoản>',
                    description: 'id tài khoản.',
                    type: 'string',
                  },
                },
                required: ['accountid'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Đăng xuất thành công',
          },
          '400': { description: 'Đăng xuất thất bại. Báo lỗi: ...' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};