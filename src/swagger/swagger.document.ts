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
    tags: [
        { name: "Tài khoản", description: "Trang quản lý" },
    ],
    paths: {
        '/auth/get_account': {
            post: {
                tags: ['Tài khoản'],
                summary: 'Lấy thông tin tài khoản',
                "parameters": [
                    {
                        "in": "header",
                        "name": "tokenrefresh",
                        "required": true,
                        "schema": { "type": "string", example: "<Nhập token refresh>" },
                        "description": "Refresh Token"
                    },
                    {
                        "in": "header",
                        "name": "router",
                        "required": true,
                        "schema": { "type": "string", example: "/auth/get_account" },
                        "description": "router"
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: "object",
                                properties: {
                                    id: { example: "<Nhập id người dùng>", description: "id người dùng.", type: "string" },
                                },
                                required: ["id"]
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: "Lấy dữ liệu thành công.",
                        content: {
                            'application/json': {
                                examples: {
                                    success: {
                                        summary: "Dữ liệu trả về.",
                                        value: {
                                            "message": "Lấy dữ liệu thành công.",
                                            "data": [
                                                {
                                                    "id": "00000000-0000-0000-0000-000000000000",
                                                    "email": "admin@gmail.com",
                                                    "password": "$2b$10$NKfjxIvY.BvsL0l11c/iHekw1xfsjlLmA3.8qvzqoWb9WCN6mTnHm",
                                                    "phonenumber": "0123456789",
                                                    "status": "NotLoggedIn",
                                                    "createdAt": "2025-12-03 19:13:37.804000",
                                                    "updatedAt": "2025-12-03 19:13:37.804000",
                                                    "roleid": 4,
                                                    "userid": 1,
                                                    "creatorid": 1,
                                                }, {
                                                    "id": "00000000-0000-0000-0000-000000000001",
                                                    "email": "admin1@gmail.com",
                                                    "password": "$2b$10$NKfjxIvY.BvsL0l11c/iHekw1xfsjlLmA3.8qvzqoWb9WCN6mTnHm",
                                                    "phonenumber": "0123456789",
                                                    "status": "NotLoggedIn",
                                                    "createdAt": "2025-12-03 19:13:37.804000",
                                                    "updatedAt": "2025-12-03 19:13:37.804000",
                                                    "roleid": 3,
                                                    "userid": 2,
                                                    "creatorid": 1,
                                                }, {
                                                    "id": "00000000-0000-0000-0000-000000000002",
                                                    "email": "admin2@gmail.com",
                                                    "password": "$2b$10$NKfjxIvY.BvsL0l11c/iHekw1xfsjlLmA3.8qvzqoWb9WCN6mTnHm",
                                                    "phonenumber": "0123456789",
                                                    "status": "NotLoggedIn",
                                                    "createdAt": "2025-12-03 19:13:37.804000",
                                                    "updatedAt": "2025-12-03 19:13:37.804000",
                                                    "roleid": 2,
                                                    "userid": 3,
                                                    "creatorid": 1,
                                                }, {
                                                    "id": "00000000-0000-0000-0000-000000000003",
                                                    "email": "admin3@gmail.com",
                                                    "password": "$2b$10$NKfjxIvY.BvsL0l11c/iHekw1xfsjlLmA3.8qvzqoWb9WCN6mTnHm",
                                                    "phonenumber": "0123456789",
                                                    "status": "NotLoggedIn",
                                                    "createdAt": "2025-12-03 19:13:37.804000",
                                                    "updatedAt": "2025-12-03 19:13:37.804000",
                                                    "roleid": 1,
                                                    "userid": 4,
                                                    "creatorid": 1,
                                                }, {}
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '500': { description: "Không tìm thấy tài khoản nào cả." }
                },
            }
        },
        '/auth/register_admin': {
            post: {
                tags: ["Tài khoản"],
                summary: 'Tạo tài khoản',
                "parameters": [
                    {
                        "in": "header",
                        "name": "tokenrefresh",
                        "required": true,
                        "schema": { "type": "string", example: "<Nhập token refresh>" },
                        "description": "Refresh Token"
                    },
                    {
                        "in": "header",
                        "name": "router",
                        "required": true,
                        "schema": { "type": "string", example: "/auth/register_admin" },
                        "description": "router"
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: "object",
                                properties: {
                                    id: { example: "1", description: "id tài khoản quản lý đang đăng nhập.", type: "number" },
                                    name: { example: "Nguyễn Văn An", description: "Tên phải có ít nhất 3 từ, mỗi từ ít nhất 2 chữ cái, không số, không ký tự đặc biệt, không khoảng trắng thừa.", type: "number" },
                                    birthdate: { example: "1900-01-01", description: "Ngày sinh phải theo định dạng YYYY-MM-DD.", type: "string" },
                                    gender: { example: "Nam", description: "Giới tính nam hoặc nữ.", type: "string" },
                                    email: { example: "nguyenvanan@gmail.com", description: "email phải là email thật", type: "string" },
                                    phone: { example: "0312345678", description: "Số điện thoại phải là số điện thoại thật", type: "string" },
                                    cccd: { example: "012345678901", description: "Số căn cước công dân phải là số căn cước công dân thật", type: "string" },
                                    chucvu: { example: "quản lý", description: "tên chức vụ phải là quản lý hoặc nhân viên", type: "string" },
                                    address: { example: "0123/456/789, đường mây, khu phố trời, phường gió, thành phố bồng lai", description: "địa chỉ", type: "string" },
                                },
                                required: ["id", "name", "birthdate", "gender", "email", "phone", "cccd", "chucvu"]
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: "Đăng ký thành công." },
                    '500': { description: "Đăng ký không thành công. Báo lỗi: ..." }
                },
            }
        },
        '/auth/login_admin': {
            post: {
                tags: ['Tài khoản'],
                summary: 'Đăng nhập tài khoản',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: "object",
                                properties: {
                                    email: { example: "nguyenvanan@gmail.com", description: "Email.", type: "string" },
                                    password: { example: "123456", description: "Mật khẩu", type: "string" },
                                },
                                required: ["email", "password"]
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: "Đăng nhập thành công",
                        content: {
                            'application/json': {
                                examples: {
                                    success: {
                                        summary: "Dữ liệu trả về.",
                                        value: {
                                            message: "Đăng nhập thành công.",
                                            account_id: "0ba83fda-1928-46a1-a0bd-1a7c51a5cb7d",
                                            userid: 2,
                                            name_display: "Nguyễn Văn An",
                                            token_access: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                                            token_refresh: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '401': { description: "Đăng nhập thất bại. Báo lỗi: ..." }
                },
            }
        },
        '/auth/logout_admin': {
            post: {
                tags: ['Tài khoản'],
                summary: 'Đăng xuất tài khoản',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: "object",
                                properties: {
                                    accountid: { example: "<Nhập id tài khoản>", description: "id tài khoản.", type: "string" },
                                    tokenaccess: { example: "<Nhập token access>", description: "token access", type: "string" },
                                    tokenrefresh: { example: "<Nhập token refresh>", description: "token refresh", type: "string" },
                                },
                                required: ["accountid", "tokenaccess", "tokenrefresh"]
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: "Đăng xuất thành công",
                    },
                    '400': { description: "Đăng xuất thất bại. Báo lỗi: ..." }
                },
            }
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