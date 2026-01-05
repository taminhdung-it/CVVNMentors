import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
export const document: OpenAPIObject = {
  openapi: '3.0.0',
  info: {
    title: 'QLCV Backend Api',
    version: '1.1.4',
    description: 'Tài liệu api dành cho frontend QLCV Web',
  },
  servers: [
    //{ url: 'https://tungo-web.onrender.com/', description: 'Server Render' },
    { url: 'http://localhost:9999/', description: 'Server local' },
  ],
  tags: [
    { name: 'Tài khoản', description: 'Trang quản lý' },
    { name: 'Quản lý CV', description: 'Trang quản lý' },
    { name: 'Quản lý Job', description: 'Trang quản lý' },
    { name: 'Quản lý Phòng ban', description: 'Trang quản lý' },
    { name: 'Quản lý Ứng tuyển', description: 'Trang quản lý Ứng tuyển(application)' },
  ],
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
                    value: {
                      access_token:
                        'eyJhbGciOiJSUzI1NiIsImtpZCI6ImEzOGVhNmEwND...',
                      refresh_token:
                        'AMf-vBwzoUQbCP4TnJaFj14WNz-UKTc6l8VkIyA_3...',
                      user_id: 'It6H9popx7XiNJRHmLtxzVYQmXc2',
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
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: '<Nhập token refresh>' },
            description: 'Refresh Token',
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
    // --- MODULE: QUẢN LÝ cv ---
    '/cv/upload': {
      post: {
        tags: ['Quản lý CV'],
        summary: 'Upload CV (PDF/Word) - AI tự trích xuất thông tin',
        description:
          'Upload tối đa 10 file một lúc. Hệ thống sẽ parse nội dung và lưu vào DB.',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  files: {
                    type: 'array',
                    items: {
                      type: 'string',
                      format: 'binary',
                    },
                    description: 'Chọn nhiều file (PDF, DOC, DOCX)',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Xử lý thành công',
            content: {
              'application/json': {
                schema: {
                  example: {
                    total: 2,
                    success: 1,
                    failed: 1,
                    details: [
                      {
                        fileName: 'nguyen_van_a.pdf',
                        status: 'SUCCESS',
                        id: 'cv_123',
                      },
                      {
                        fileName: 'file_loi.docx',
                        status: 'FAILED',
                        error: 'Lỗi định dạng',
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    '/cv/Readcvexcel': {
      post: {
        tags: ['Quản lý CV'],
        summary: 'Đọc file Excel để xem trước (Preview Import)',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File Excel (.xlsx, .xls)',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Đọc file thành công',
            content: {
              'application/json': {
                schema: {
                  example: {
                    sheetName: 'Sheet1',
                    data: [
                      {
                        id: 'Nguyễn Văn A',
                        data: {
                          full_name: 'Nguyễn Văn A',
                          email: 'a@gmail.com',
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    '/cv': {
      post: {
        tags: ['Quản lý CV'],
        summary: 'Tạo CV thủ công (Full Fields)',
        description:
          'Tạo CV với đầy đủ thông tin chi tiết bao gồm cả kinh nghiệm làm việc.',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string', example: 'Nguyễn Văn A' },
                  email: { type: 'string', example: 'nguyenvana@email.com' },
                  phone: { type: 'string', example: '0909123456' },
                  cvType: {
                    type: 'string',
                    example: 'Manual Entry',
                    description: 'Loại CV (Parsed/Manual)',
                  },
                  position: {
                    type: 'string',
                    example: 'Backend Developer',
                    description: 'Vị trí ứng tuyển/chuyên môn',
                  },
                  level: {
                    type: 'string',
                    example: 'Junior',
                    description: 'Trình độ (Intern, Junior, Senior...)',
                  },
                  cvFileUrl: {
                    type: 'string',
                    example: 'https://storage.googleapis.com/.../file.pdf',
                    description: 'Link file gốc (nếu có)',
                  },
                  experienceYears: {
                    type: 'number',
                    example: 2,
                    description: 'Số năm kinh nghiệm',
                  },
                  skills: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Java', 'Spring Boot', 'MySQL', 'Docker'],
                  },
                  education: {
                    type: 'array',
                    items: { type: 'string' },
                    example: [
                      'Đại học FPT - Kỹ thuật phần mềm',
                      'Chứng chỉ AWS Cloud Practitioner',
                    ],
                  },
                  experience: {
                    type: 'array',
                    description: 'Danh sách kinh nghiệm làm việc',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string', example: 'Java Developer' },
                        organization: {
                          type: 'string',
                          example: 'FPT Software',
                        },
                        dates: { type: 'string', example: '2022 - 2024' },
                        location: { type: 'string', example: 'Hồ Chí Minh' },
                      },
                    },
                  },
                },
                required: ['fullName', 'email', 'phone'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Tạo thành công',
            content: {
              'application/json': {
                schema: {
                  example: { id: 'cv_new_001', message: 'Tạo CV thành công' },
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Quản lý CV'],
        summary: 'Lấy danh sách CV (Phân trang)',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'number', example: 1 },
            description: 'Trang số (mặc định 1)',
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'number', example: 10 },
            description: 'Số lượng item/trang (mặc định 10)',
          },
        ],
        responses: {
          '200': {
            description: 'Thành công',
            content: {
              'application/json': {
                schema: {
                  example: {
                    data: [
                      {
                        id: 'cv_001',
                        fullName: 'Nguyễn Văn A',
                        email: 'a@gmail.com',
                        position: 'Dev',
                        skills: ['Java'],
                      },
                    ],
                    meta: { total: 50, page: 1, limit: 10 },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/cv/{id}': {
      get: {
        tags: ['Quản lý CV'],
        summary: 'Xem chi tiết một CV',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', example: 'cv_123' },
          },
        ],
        responses: {
          '200': {
            description: 'Trả về object CV đầy đủ',
            content: {
              'application/json': {
                schema: { example: { id: 'cv_123', fullName: 'Trần Văn C' } },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Quản lý CV'],
        summary: 'Cập nhật thông tin CV',
        description:
          'Cập nhật các trường thông tin (Partial Update). Gửi trường nào cập nhật trường đó.',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', example: 'cv_123' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string', example: 'Trần Văn C' },
                  cvType: { type: 'string', example: 'Parsed Resume' },
                  email: { type: 'string', example: 'c.tran@gmail.com' },
                  phone: { type: 'string', example: '0912345678' },
                  position: { type: 'string', example: 'Backend Developer' },
                  level: { type: 'string', example: 'Senior' },
                  skills: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['NestJS', 'Firebase', 'Docker'],
                  },
                  education: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Đại học Bách Khoa - CNTT', 'IELTS 7.0'],
                  },
                  experienceYears: { type: 'number', example: 4 },
                  experience: {
                    type: 'array',
                    description: 'Danh sách kinh nghiệm làm việc',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string', example: 'Senior Java Dev' },
                        dates: { type: 'string', example: '2022 - Present' },
                        location: { type: 'string', example: 'Hồ Chí Minh' },
                        organization: {
                          type: 'string',
                          example: 'FPT Software',
                        },
                      },
                    },
                    example: [
                      {
                        title: 'Senior Java Dev',
                        dates: '2022 - Present',
                        location: 'Hồ Chí Minh',
                        organization: 'FPT Software',
                      },
                      {
                        title: 'Junior Dev',
                        dates: '2020 - 2022',
                        location: 'Đà Nẵng',
                        organization: 'VNG',
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Cập nhật thành công',
            content: {
              'application/json': {
                schema: {
                  example: { id: 'cv_123', message: 'Cập nhật thành công' },
                },
              },
            },
          },
        },
      },
    },
    '/cv/{id}/status': {
      patch: {
        tags: ['Quản lý CV'],
        summary: 'Đổi trạng thái CV (Duyệt/Loại)',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', example: 'cv_123' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['NEW', 'APPROVED', 'REJECTED', 'ARCHIVED'],
                    example: 'APPROVED',
                  },
                },
                required: ['status'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Thành công',
            content: {
              'application/json': {
                schema: { example: { id: 'cv_123', status: 'APPROVED' } },
              },
            },
          },
        },
      },
    },
    '/cv/assign-job': {
      post: {
        tags: ['Quản lý CV'],
        summary: 'Gán CV vào Job (Ứng tuyển)',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  jobId: { type: 'string', example: 'job_01' },
                  cvIds: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['cv_1', 'cv_2'],
                  },
                },
                required: ['jobId', 'cvIds'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Gán thành công',
            content: {
              'application/json': {
                schema: {
                  example: { success: true, assignedCount: 1, errors: [] },
                },
              },
            },
          },
        },
      },
    },

    // --- MODULE: QUẢN LÝ JOB (VỊ TRÍ TUYỂN DỤNG) ---
    '/jobs': {
      get: {
        tags: ['Quản lý Job'],
        summary: 'Lấy danh sách Job (Cơ bản)',
        description:
          'Lấy danh sách Job có phân trang, sắp xếp theo ngày tạo mới nhất.',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'number', example: 1 },
            description: 'Trang hiện tại (Mặc định 1)',
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'number', example: 10 },
            description: 'Số lượng/trang (Mặc định 10)',
          },
        ],
        responses: {
          '200': {
            description: 'Thành công',
            content: {
              'application/json': {
                schema: {
                  example: {
                    data: [
                      {
                        id: 'job_001',
                        name: 'Senior Java Developer',
                        status: 'OPEN',
                        headcountTarget: 5,
                        headcountHired: 1,
                        createdAt: '2025-01-01T00:00:00.000Z',
                      },
                    ],
                    meta: { total: 20, page: 1, limit: 10, totalPages: 2 },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Quản lý Job'],
        summary: 'Tạo Job mới',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  departmentId: { type: 'string', example: 'dept_cntt_01' },
                  name: { type: 'string', example: 'Backend NodeJS Developer' },
                  description: {
                    type: 'string',
                    example: 'Xây dựng API cho hệ thống ERP...',
                  },
                  skills: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['NodeJS', 'NestJS', 'PostgreSQL'],
                  },
                  headcountTarget: { type: 'number', example: 3, minimum: 1 },
                  applyStart: {
                    type: 'string',
                    format: 'date',
                    example: '2025-01-05',
                  },
                  applyEnd: {
                    type: 'string',
                    format: 'date',
                    example: '2025-02-28',
                  },
                },
                required: [
                  'departmentId',
                  'name',
                  'description',
                  'headcountTarget',
                  'applyStart',
                  'applyEnd',
                ],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Tạo thành công',
            content: {
              'application/json': {
                schema: {
                  example: {
                    id: 'job_new_01',
                    departmentId: 'dept_cntt_01',
                    name: 'Backend NodeJS Developer',
                    status: 'OPEN',
                    headcountHired: 0,
                  },
                },
              },
            },
          },
        },
      },
    },
    '/jobs/search': {
      get: {
        tags: ['Quản lý Job'],
        summary: 'Tìm kiếm Job nâng cao (Filter)',
        description:
          'Hỗ trợ tìm theo từ khóa, phòng ban, trạng thái, ngày tạo, ngày hết hạn.',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'query',
            name: 'keyword',
            schema: { type: 'string', example: 'Java' },
            description: 'Tìm theo tên Job',
          },
          {
            in: 'query',
            name: 'departmentId',
            schema: { type: 'string', example: 'dept_01' },
            description: 'Lọc theo phòng ban',
          },
          {
            in: 'query',
            name: 'status',
            schema: {
              type: 'string',
              enum: ['OPEN', 'CLOSED', 'LOCKED'],
              example: 'OPEN',
            },
            description: 'Trạng thái Job',
          },
          {
            in: 'query',
            name: 'createdFrom',
            schema: { type: 'string', format: 'date', example: '2025-01-01' },
            description: 'Ngày tạo từ',
          },
          {
            in: 'query',
            name: 'createdTo',
            schema: { type: 'string', format: 'date', example: '2025-01-31' },
            description: 'Ngày tạo đến',
          },
          {
            in: 'query',
            name: 'deadlineFrom',
            schema: { type: 'string', format: 'date', example: '2025-02-01' },
            description: 'Hạn ứng tuyển từ',
          },
          {
            in: 'query',
            name: 'deadlineTo',
            schema: { type: 'string', format: 'date', example: '2025-02-28' },
            description: 'Hạn ứng tuyển đến',
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'number', example: 1 },
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'number', example: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'Kết quả tìm kiếm',
            content: {
              'application/json': {
                schema: {
                  example: {
                    data: [
                      { id: 'job_001', name: 'Java Developer', status: 'OPEN' },
                    ],
                    meta: { total: 5, page: 1, limit: 10 },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/jobs/{id}': {
      get: {
        tags: ['Quản lý Job'],
        summary: 'Xem chi tiết Job',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', example: 'job_001' },
          },
        ],
        responses: {
          '200': {
            description: 'Thông tin chi tiết',
            content: {
              'application/json': {
                schema: {
                  example: {
                    id: 'job_001',
                    name: 'Java Developer',
                    description: 'Full description...',
                    skills: ['Java', 'Spring'],
                    headcountTarget: 5,
                    headcountHired: 2,
                    status: 'OPEN',
                    applyStart: '2025-01-01',
                    applyEnd: '2025-02-01',
                    createdAt: '2025-01-01T08:00:00Z',
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Quản lý Job'],
        summary: 'Cập nhật thông tin Job',
        description: 'Không thể cập nhật nếu Job đã đóng (CLOSED).',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', example: 'job_001' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Java Developer (Updated)' },
                  description: { type: 'string', example: 'Mô tả mới...' },
                  skills: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Java', 'Microservices'],
                  },
                  headcountTarget: { type: 'number', example: 10 },
                  applyEnd: {
                    type: 'string',
                    format: 'date',
                    example: '2025-03-30',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Cập nhật thành công',
            content: {
              'application/json': {
                schema: {
                  example: {
                    id: 'job_001',
                    message: 'Cập nhật Job thành công',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/jobs/{id}/close': {
      patch: {
        tags: ['Quản lý Job'],
        summary: 'Đóng Job (Close)',
        description: 'Chuyển trạng thái sang CLOSED. Cần nhập lý do đóng.',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', example: 'job_001' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reason: { type: 'string', example: 'Đã tuyển đủ người' },
                },
                required: ['reason'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Đóng thành công',
            content: {
              'application/json': {
                schema: { example: { id: 'job_001', status: 'CLOSED' } },
              },
            },
          },
        },
      },
    },
    '/jobs/{id}/open': {
      patch: {
        tags: ['Quản lý Job'],
        summary: 'Mở lại Job (Re-open)',
        description: 'Chuyển trạng thái từ CLOSED/LOCKED sang OPEN.',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', example: 'job_001' },
          },
        ],
        responses: {
          '200': {
            description: 'Mở lại thành công',
            content: {
              'application/json': {
                schema: {
                  example: {
                    id: 'job_001',
                    status: 'OPEN',
                    message: 'Đã mở lại Job thành công',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/jobs/{id}/lock': {
      patch: {
        tags: ['Quản lý Job'],
        summary: 'Tạm khóa Job (Lock)',
        description: 'Chuyển trạng thái sang LOCKED (Tạm ngưng tuyển).',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', example: 'job_001' },
          },
        ],
        responses: {
          '200': {
            description: 'Khóa thành công',
            content: {
              'application/json': {
                schema: {
                  example: {
                    id: 'job_001',
                    status: 'LOCKED',
                    message: 'Đã khóa Job tạm thời',
                  },
                },
              },
            },
          },
        },
      },
    },
    // --- MODULE: QUẢN LÝ PHÒNG BAN (DEPARTMENT) ---
    '/departments': {
      get: {
        tags: ['Quản lý Phòng ban'],
        summary: 'Lấy danh sách Phòng ban (Cơ bản)',
        description: 'Lấy danh sách có phân trang, sắp xếp theo ngày tạo mới nhất.',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'number', example: 1 },
            description: 'Trang số (Mặc định 1)',
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'number', example: 10 },
            description: 'Số lượng/trang (Mặc định 10)',
          },
        ],
        responses: {
          '200': {
            description: 'Thành công',
            content: {
              'application/json': {
                schema: {
                  example: {
                    data: [
                      {
                        id: 'dept_001',
                        name: 'Phòng Công nghệ',
                        status: 'ACTIVE',
                        description: 'Phụ trách kỹ thuật',
                        createdAt: '2025-01-01T00:00:00.000Z',
                      },
                    ],
                    meta: { total: 5, page: 1, limit: 10, totalPages: 1 },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Quản lý Phòng ban'],
        summary: 'Tạo Phòng ban mới',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Phòng Marketing' },
                  description: { type: 'string', example: 'Phụ trách truyền thông & quảng cáo' },
                },
                required: ['name'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Tạo thành công',
            content: {
              'application/json': {
                schema: {
                  example: {
                    id: 'dept_new_01',
                    name: 'Phòng Marketing',
                    status: 'ACTIVE',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/departments/search': {
      get: {
        tags: ['Quản lý Phòng ban'],
        summary: 'Tìm kiếm Phòng ban (Filter)',
        description: 'Tìm theo tên (Keyword) và lọc theo trạng thái (Status).',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'query',
            name: 'keyword',
            schema: { type: 'string', example: 'Công nghệ' },
            description: 'Tìm theo tên phòng ban',
          },
          {
            in: 'query',
            name: 'status',
            schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' },
            description: 'Lọc trạng thái',
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'number', example: 1 },
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'number', example: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'Kết quả tìm kiếm',
            content: {
              'application/json': {
                schema: {
                  example: {
                    data: [{ id: 'dept_001', name: 'Phòng Công nghệ', status: 'ACTIVE' }],
                    meta: { total: 1, page: 1, limit: 10 },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/departments/{id}': {
      get: {
        tags: ['Quản lý Phòng ban'],
        summary: 'Xem chi tiết Phòng ban',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', example: 'dept_001' },
          },
        ],
        responses: {
          '200': {
            description: 'Thông tin chi tiết',
            content: {
              'application/json': {
                schema: {
                  example: {
                    id: 'dept_001',
                    name: 'Phòng Công nghệ',
                    description: 'Full description...',
                    status: 'ACTIVE',
                    createdBy: 'admin_01',
                    createdAt: '2025-01-01T00:00:00.000Z',
                  },
                },
              },
            },
          },
          '404': { description: 'Không tìm thấy phòng ban' },
        },
      },
      patch: {
        tags: ['Quản lý Phòng ban'],
        summary: 'Cập nhật thông tin (Tên, Mô tả)',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', example: 'dept_001' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Phòng R&D (Updated)' },
                  description: { type: 'string', example: 'Mô tả mới...' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Cập nhật thành công',
            content: {
              'application/json': {
                schema: { example: { id: 'dept_001', message: 'Cập nhật thông tin thành công' } },
              },
            },
          },
        },
      },
    },
    '/departments/{id}/status': {
      patch: {
        tags: ['Quản lý Phòng ban'],
        summary: 'Đổi trạng thái (Active/Inactive)',
        description: 'Lưu ý: Không thể chuyển sang INACTIVE nếu phòng ban đó còn Job đang mở (Status: OPEN).',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', example: 'dept_001' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['ACTIVE', 'INACTIVE'],
                    example: 'INACTIVE'
                  },
                },
                required: ['status'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Đổi trạng thái thành công',
            content: {
              'application/json': {
                schema: {
                  example: {
                    id: 'dept_001',
                    status: 'INACTIVE',
                    message: 'Đã chuyển trạng thái phòng ban sang INACTIVE thành công'
                  }
                },
              },
            },
          },
          '400': {
            description: 'Lỗi nghiệp vụ (Vẫn còn Job đang tuyển)',
            content: {
              'application/json': {
                schema: {
                  example: {
                    statusCode: 400,
                    message: 'Không thể đóng phòng ban này vì còn 2 công việc đang tuyển dụng...'
                  }
                },
              },
            },
          },
        },
      },
    },
    // --- MODULE: QUẢN LÝ ỨNG TUYỂN (APPLICATION FLOW) ---
    '/applications/job/{jobId}': {
      get: {
        tags: ['Quản lý Ứng tuyển'],
        summary: 'Lấy danh sách ứng viên theo Job',
        description: 'Xem ai đang ứng tuyển vào Job này. Có thể lọc theo trạng thái (VD: chỉ xem ai đang Phỏng vấn).',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'path',
            name: 'jobId',
            required: true,
            schema: { type: 'string', example: 'job_001' },
            description: 'ID của Job cần xem',
          },
          {
            in: 'query',
            name: 'status',
            schema: {
              type: 'string',
              enum: ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'],
              example: 'INTERVIEW'
            },
            description: 'Lọc theo trạng thái hồ sơ',
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'number', example: 1 },
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'number', example: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'Danh sách hồ sơ ứng tuyển',
            content: {
              'application/json': {
                schema: {
                  example: {
                    data: [
                      {
                        id: 'app_001',
                        cvId: 'cv_123',
                        jobId: 'job_001',
                        status: 'INTERVIEW',
                        appliedAt: '2025-01-02T08:00:00.000Z',
                        rating: 4,
                      },
                    ],
                    meta: { total: 15, page: 1, limit: 10, totalPages: 2 },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/applications/{id}': {
      get: {
        tags: ['Quản lý Ứng tuyển'],
        summary: 'Xem chi tiết một hồ sơ ứng tuyển',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', example: 'app_001' },
            description: 'ID của Application (Không phải ID CV)',
          },
        ],
        responses: {
          '200': {
            description: 'Chi tiết hồ sơ',
            content: {
              'application/json': {
                schema: {
                  example: {
                    id: 'app_001',
                    cvId: 'cv_123',
                    status: 'INTERVIEW',
                    interviewScheduled: '2025-01-10T14:00:00.000Z',
                    feedback: 'Ứng viên giao tiếp tốt, tiếng Anh khá.',
                    rating: 4,
                    appliedAt: '2025-01-01T00:00:00.000Z',
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Quản lý Ứng tuyển'],
        summary: 'Cập nhật thông tin chi tiết (Lịch PV/Feedback)',
        description: 'Dùng để set lịch phỏng vấn, đánh giá sao, viết nhận xét sau phỏng vấn.',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', example: 'app_001' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  interviewScheduled: { type: 'string', format: 'date-time', example: '2025-01-15T09:00:00Z', description: 'Hẹn lịch phỏng vấn' },
                  feedback: { type: 'string', example: 'Kỹ thuật tốt nhưng expect lương hơi cao' },
                  rating: { type: 'number', example: "4 (min: 1, max: 5)" },
                  rejectionReason: { type: 'string', example: 'Không phù hợp văn hóa' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Cập nhật thành công',
            content: {
              'application/json': {
                schema: { example: { id: 'app_001', message: 'Cập nhật thông tin thành công' } },
              },
            },
          },
        },
      },
    },
    '/applications/{id}/status': {
      patch: {
        tags: ['Quản lý Ứng tuyển'],
        summary: 'Chuyển trạng thái tuyển dụng (Quy trình)',
        description: `
          **Quy tắc chuyển trạng thái (Workflow):**
          - APPLIED -> SCREENING (Sàng lọc) hoặc REJECTED
          - SCREENING -> INTERVIEW (Phỏng vấn) hoặc REJECTED
          - INTERVIEW -> OFFERED (Mời nhận việc) hoặc REJECTED
          - OFFERED -> HIRED (Đã tuyển) hoặc REJECTED
          
          *Lưu ý: Nếu chọn REJECTED, bắt buộc phải gửi kèm 'rejectionReason'.*
        `,
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', example: 'app_001' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'],
                    example: 'INTERVIEW'
                  },
                  rejectionReason: {
                    type: 'string',
                    example: 'Chuyên môn chưa đạt yêu cầu',
                    description: 'Bắt buộc nếu status là REJECTED'
                  },
                },
                required: ['status'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Chuyển trạng thái thành công',
            content: {
              'application/json': {
                schema: {
                  example: {
                    id: 'app_001',
                    oldStatus: 'SCREENING',
                    newStatus: 'INTERVIEW',
                    message: 'Cập nhật trạng thái thành công'
                  }
                },
              },
            },
          },
          '400': {
            description: 'Lỗi quy trình (Đi sai bước hoặc thiếu lý do từ chối)',
            content: {
              'application/json': {
                schema: { example: { statusCode: 400, message: 'Không thể chuyển trạng thái từ APPLIED sang OFFERED...' } },
              },
            },
          },
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