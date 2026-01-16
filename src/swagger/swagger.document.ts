import { OpenAPIObject } from '@nestjs/swagger';
export const document: OpenAPIObject = {
  openapi: '3.0.0',
  info: {
    title: 'QLCV Backend Api',
    version: '1.1.4',
    description: 'Tài liệu api dành cho frontend QLCV Web',
  },
  servers: [
    { url: 'https://cvvnmentors.onrender.com/', description: 'Server Render' },
    { url: 'http://localhost:9999/', description: 'Server local' },
  ],
  tags: [
    { name: 'Tài khoản', description: 'Trang quản lý' },
    { name: 'Quản lý CV', description: 'Trang quản lý' },
    { name: 'Quản lý Job', description: 'Trang quản lý' },
    { name: 'Quản lý Phòng ban', description: 'Trang quản lý' },
    {
      name: 'Quản lý Ứng tuyển',
      description: 'Trang quản lý Ứng tuyển(application)',
    },
    {
      name: 'Quản lý Nhân viên',
      description: 'Trang quản lý',
    },
    {
      name: 'Quản lý quyền truy cập',
      description: 'Trang quản lý',
    },
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
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
          '401': {
            description: 'Đăng nhập thất bại. Báo lỗi: ...',
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
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
          {
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'account/logout' },
            description: 'router',
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
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
          '400': {
            description: 'Đăng xuất thất bại. Báo lỗi: ...',
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
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
          {
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'cv/readpdfdoc' },
            description: 'router',
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
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
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
          {
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'cv/readexcel' },
            description: 'router',
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
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
        },
      },
    },
    '/cv/addcvexcel': {
      post: {
        tags: ['Quản lý CV'],
        summary: 'Thêm cv khi xem trước file excel vào database',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1Ni...',
            },
            description: 'Refresh Token',
          },
          {
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'cv/addexcel' },
            description: 'router',
          },
        ],

        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                // ✅ BODY LÀ ARRAY
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    full_name: {
                      type: 'string',
                      description: 'Họ và tên',
                    },
                    position: {
                      type: 'string',
                      description: 'Vị trí',
                    },
                    level: {
                      type: 'string',
                      description: 'Cấp độ',
                    },
                    experience_year: {
                      type: 'integer',
                      description: 'Số năm kinh nghiệm',
                    },
                    phone: {
                      type: 'string',
                      description: 'Số điện thoại',
                    },
                    email: {
                      type: 'string',
                      description: 'Email',
                    },
                  },
                  required: [
                    'full_name',
                    'position',
                    'level',
                    'experience_year',
                    'phone',
                    'email',
                  ],
                },

                // ✅ example đặt ở schema level
                example: [
                  {
                    full_name: 'Nguyen Van 1',
                    position: 'Software Engineer',
                    level: 'Junior',
                    experience_year: 3,
                    phone: '0900000001',
                    email: 'user1@example.com',
                  },
                  {
                    full_name: 'Nguyen Van 2',
                    position: 'Software Engineer',
                    level: 'Junior',
                    experience_year: 3,
                    phone: '0900000002',
                    email: 'user2@example.com',
                  },
                  {
                    full_name: 'Nguyen Van 3',
                    position: 'Software Engineer',
                    level: 'Junior',
                    experience_year: 3,
                    phone: '0900000003',
                    email: 'user3@example.com',
                  },
                  {
                    full_name: 'Nguyen Van 4',
                    position: 'Software Engineer',
                    level: 'Junior',
                    experience_year: 4,
                    phone: '0900000004',
                    email: 'user4@example.com',
                  },
                ],
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
                  type: 'object',
                  example: {
                    success: true,
                    message: 'Thêm CV thành công',
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
        },
      },
    },


    '/cv': {
      post: {
        tags: ['Quản lý CV'],
        summary: 'Tạo CV thủ công (Form Data)',
        description: `
      **Lưu ý quan trọng cho Frontend (Multipart/Form-data):**

      1. **File:** Gửi field tên là \`file\` (Binary).
      2. **Experience (Mảng Object):** Vì FormData không chuẩn hóa việc gửi mảng object, hãy **JSON.stringify()** mảng experience thành chuỗi rồi mới append.
         - VD: \`formData.append('experience', JSON.stringify([{title: 'Dev', dates: '2022'}]));\`
      3. **Skills / Education:** Có thể gửi theo 2 cách:
         - Cách 1 (Mảng): \`formData.append('skills', 'Java'); formData.append('skills', 'Node');\`
         - Cách 2 (Chuỗi): \`formData.append('skills', 'Java, Node, SQL');\` (Backend tự split)
      4. **ExperienceYears:** Gửi dạng chuỗi số, backend tự convert.
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
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'cv/addcv' },
            description: 'router',
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
                    description: 'File CV đính kèm (PDF, DOCX).',
                  },
                  fullName: { type: 'string', example: 'Nguyễn Văn A' },
                  email: { type: 'string', example: 'a@gmail.com' },
                  phone: { type: 'string', example: '0909123456' },
                  cccd:{ type: 'string', example: '123456789012' },
                  cvType: { type: 'string', example: 'Manual Entry' },
                  position: { type: 'string', example: 'Backend Developer' },
                  level: { type: 'string', example: 'Junior' },
                  experienceYears: {
                    type: 'number',
                    example: 2,
                    description: 'Số năm kinh nghiệm (Backend tự ép kiểu từ string)'
                  },
                  skills: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Java', 'NestJS', 'MySQL'],
                    description: 'Có thể gửi mảng hoặc chuỗi cách nhau dấu phẩy',
                  },
                  education: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Đại học FPT'],
                  },
                  experience: {
                    type: 'string',
                    description: 'Chuỗi JSON của mảng kinh nghiệm. VD: "[{\\"title\\":\\"Dev\\",\\"organization\\":\\"FPT\\"}]"',
                    example: '[{"title":"Java Dev","dates":"2022-2023","organization":"FPT Software","location":"HCM"}]'
                  }
                },
                required: ['fullName', 'email', 'phone', "cccd"],
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
                    id: 'cv_new_001',
                    fullName: 'Nguyễn Văn A',
                    cvFileUrl: 'https://res.cloudinary.com/...',
                    status: 'NEW'
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
          '400': {
            description: 'Lỗi Validation hoặc Trùng lặp',
            content: {
              'application/json': {
                schema: { example: { message: 'Email hoặc SĐT đã tồn tại / Upload file thất bại' } }
              }
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          }
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
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'cv/get' },
            description: 'router',
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
                        "id": "WnLu5aPcFCwADV2KmyL1",
                        "createdBy": null,
                        "cvType": "Parsed Resume",
                        "fullName": "Unknown",
                        "email": "kazki_example@vietcv.io",
                        "phone": null,
                        "position": "N/A",
                        "level": "N/A",
                        "status": "NEW",
                        "cvFileUrl": "https://res.cloudinary.com/dyedoswp3/image/upload/v1768191075/CV/qxkwormtso9gz7ouk3pb.pdf",
                        "publicId": "CV/qxkwormtso9gz7ouk3pb",
                        "createdAt": {
                          "_seconds": 1768191076,
                          "_nanoseconds": 261000000
                        },
                        "updatedAt": "2026-01-12T04:12:04.058Z",
                        "skills": [
                          "Pr",
                          "P",
                          "Php",
                          "Github",
                          "Adobe",
                          "Illustrator",
                          "Html",
                          "Javascript",
                          "Seo",
                          "Ruby",
                          "Programming",
                          "Html5",
                          "Ux",
                          "Xml",
                          "Ui",
                          "Facebook",
                          "R",
                          "Css"
                        ],
                        "education": [],
                        "experienceYears": 2,
                        "experience": [
                          {
                            "title": "CTO",
                            "dates": null,
                            "location": null,
                            "organization": "VietCV 2"
                          },
                          {
                            "title": "Web Developer",
                            "dates": "February 2001 - February 2001",
                            "location": null,
                            "organization": "VietCV 1"
                          }
                        ]
                      },
                    ],
                    meta: { total: 50, page: 1, limit: 10 },
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
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
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'cv/getone' },
            description: 'router',
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
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
        },
      },
      patch: {
        tags: ['Quản lý CV'],
        summary: 'Cập nhật thông tin CV (JSON)',
        description: `
      **Lưu ý:**
      - Các trường như education, skill có thể gửi dạng Array hoặc String cách nhau bởi dấu phẩy (vd: "Java, AWS")
      - Dữ liệu gửi lên là Partial (gửi trường nào update trường đó).
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
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'cv/edit' },
            description: 'router',
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
                  fullName: { type: 'string', example: 'Nguyễn Văn A (Updated)' },
                  email: { type: 'string', example: 'new_email@gmail.com' },
                  phone: { type: 'string', example: '0988888888' },
                  cccd:{ type: 'string', example: '123456789012' },
                  position: { type: 'string', example: 'Fullstack Dev' },
                  level: { type: 'string', example: 'Senior' },
                  experienceYears: { type: 'number', example: 5 },
                  // JSON Body hỗ trợ mảng trực tiếp, không cần stringify như FormData
                  skills: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Java', 'Go', 'AWS']
                  },
                  education: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Thạc sĩ KHMT']
                  },
                  experience: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        dates: { type: 'string' },
                        location: { type: 'string' },
                        organization: { type: 'string' }
                      }
                    },
                    example: [
                      {
                        title: "Tech Lead",
                        dates: "2023 - Present",
                        organization: "VNG",
                        location: "HCM"
                      }
                    ]
                  }
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
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
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
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'cv/changestatus' },
            description: 'router',
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
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
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
          {
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'cv/assign' },
            description: 'router',
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
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
        },
      },
    },

    // --- MODULE: QUẢN LÝ JOB (CẬP NHẬT UI/UX EXAMPLE) ---
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
            description: 'Refresh Token để xác thực',
          },
          {
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'job/get' },
            description: 'router',
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
            description: 'Số lượng item mỗi trang (Mặc định 10)',
          },
        ],
        responses: {
          '200': {
            description: 'Lấy dữ liệu thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { type: 'object' } },
                    meta: { type: 'object' },
                  },
                  example: {
                    data: [
                      {
                        id: 'job_001',
                        name: 'Senior Java Developer',
                        status: 'OPEN',
                        headcountTarget: 5,
                        headcountHired: 1,
                        jdFileUrl: 'https://res.cloudinary.com/.../jd.pdf',
                        createdAt: '2025-01-01T00:00:00.000Z',
                      },
                    ],
                    meta: { total: 20, page: 1, limit: 10, totalPages: 2 },
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
        },
      },
      post: {
        tags: ['Quản lý Job'],
        summary: 'Tạo Job mới (Có upload file JD)',
        description:
          'Tạo job mới kèm theo file JD (PDF/Doc). Sử dụng form-data.',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'job/add' },
            description: 'router',
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
                    description:
                      'File mô tả công việc (JD) - Định dạng PDF, DOCX',
                  },
                  departmentId: {
                    type: 'string',
                    example: '4aqhaIY6UmtfRCxdJKuK',
                    description: 'ID của phòng ban cần tuyển',
                  },
                  name: {
                    type: 'string',
                    example: 'Backend NodeJS Developer',
                    description: 'Tên vị trí tuyển dụng',
                  },
                  description: {
                    type: 'string',
                    example: 'Xây dựng API cho hệ thống ERP, tối ưu DB...',
                    description: 'Mô tả chi tiết công việc',
                  },
                  skills: {
                    type: 'array',
                    items: { type: 'string', example: 'NodeJS' },
                    example: ['NodeJS', 'NestJS', 'PostgreSQL'],
                    description: 'Danh sách kỹ năng yêu cầu',
                  },
                  headcountTarget: {
                    type: 'number',
                    example: 3,
                    minimum: 1,
                    description: 'Số lượng cần tuyển',
                  },
                  applyStart: {
                    type: 'string',
                    format: 'date',
                    example: '2025-01-05',
                    description: 'Ngày bắt đầu nhận hồ sơ (YYYY-MM-DD)',
                  },
                  applyEnd: {
                    type: 'string',
                    format: 'date',
                    example: '2025-02-28',
                    description: 'Hạn chót nhận hồ sơ (YYYY-MM-DD)',
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
            description: 'Tạo job thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  example: {
                    id: 'job_new_01',
                    departmentId: 'dept_cntt_01',
                    name: 'Backend NodeJS Developer',
                    status: 'OPEN',
                    jdFileUrl: 'https://res.cloudinary.com/.../file.pdf',
                    warning: null,
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
        },
      },
    },
    '/jobs/search': {
      get: {
        tags: ['Quản lý Job'],
        summary: 'Tìm kiếm Job nâng cao (Filter)',
        description:
          'Hỗ trợ tìm theo từ khóa, phòng ban, trạng thái, người tạo, ngày tạo, ngày hết hạn.',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'job/search' },
            description: 'router',
          },
          {
            in: 'query',
            name: 'keyword',
            schema: { type: 'string', example: 'Java' },
            description: 'Từ khóa tìm kiếm (Tên Job)',
          },
          {
            in: 'query',
            name: 'departmentId',
            schema: { type: 'string', example: 'dept_01' },
            description: 'Lọc theo ID phòng ban',
          },
          {
            in: 'query',
            name: 'status',
            schema: {
              type: 'string',
              enum: ['OPEN', 'CLOSED', 'LOCKED'],
              example: 'OPEN',
            },
            description: 'Trạng thái Job (OPEN, CLOSED, LOCKED)',
          },
          {
            in: 'query',
            name: 'createdBy',
            schema: { type: 'string', example: 'user_id_123' },
            description: 'Lọc theo ID người tạo',
          },
          {
            in: 'query',
            name: 'createdFrom',
            schema: { type: 'string', format: 'date', example: '2025-01-01' },
            description: 'Ngày tạo từ (YYYY-MM-DD)',
          },
          {
            in: 'query',
            name: 'createdTo',
            schema: { type: 'string', format: 'date', example: '2025-01-31' },
            description: 'Ngày tạo đến (YYYY-MM-DD)',
          },
          {
            in: 'query',
            name: 'deadlineFrom',
            schema: { type: 'string', format: 'date', example: '2025-02-01' },
            description: 'Hạn ứng tuyển từ (YYYY-MM-DD)',
          },
          {
            in: 'query',
            name: 'deadlineTo',
            schema: { type: 'string', format: 'date', example: '2025-02-28' },
            description: 'Hạn ứng tuyển đến (YYYY-MM-DD)',
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
            description: 'Trả về danh sách kết quả',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  example: {
                    data: [
                      { id: 'job_001', name: 'Java Developer', status: 'OPEN' },
                    ],
                    meta: { total: 5, page: 1, limit: 10 },
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
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
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'job/getone' },
            description: 'router',
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', example: 'job_001' },
            description: 'ID của Job cần xem',
          },
        ],
        responses: {
          '200': {
            description: 'Thông tin chi tiết Job',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  example: {
                    id: 'job_001',
                    name: 'Java Developer',
                    description: 'Full description...',
                    skills: ['Java', 'Spring'],
                    headcountTarget: 5,
                    headcountHired: 2,
                    status: 'OPEN',
                    jdFileUrl: 'https://cloudinary...',
                    applyStart: '2025-01-01',
                    applyEnd: '2025-02-01',
                    createdAt: '2025-01-01T08:00:00Z',
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
        },
      },
      patch: {
        tags: ['Quản lý Job'],
        summary: 'Cập nhật thông tin Job (Có upload file)',
        description:
          'Dùng multipart/form-data. Gửi file mới để thay thế file cũ. Field nào không gửi sẽ giữ nguyên giá trị cũ.',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'job/edit' },
            description: 'router',
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
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File JD mới (Nếu muốn cập nhật file)',
                  },
                  name: {
                    type: 'string',
                    example: 'Java Developer (Updated)',
                    description: 'Tên mới',
                  },
                  description: {
                    type: 'string',
                    example: 'Mô tả mới...',
                    description: 'Mô tả mới',
                  },
                  skills: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Java', 'Microservices'],
                    description: 'Danh sách skill mới',
                  },
                  headcountTarget: {
                    type: 'number',
                    example: 10,
                    description: 'Số lượng cần tuyển mới',
                  },
                  headcountHired: {
                    type: 'number',
                    example: 2,
                    description:
                      'Số lượng đã tuyển (Thường cập nhật tự động, nhưng cho phép sửa nếu cần)',
                  },
                  applyEnd: {
                    type: 'string',
                    format: 'date',
                    example: '2025-03-30',
                    description: 'Gia hạn ngày kết thúc',
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
                  type: 'object',
                  example: {
                    id: 'job_001',
                    message: 'Cập nhật Job thành công',
                    warning: 'Cập nhật text thành công nhưng file lỗi (nếu có)',
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
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
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'job/close' },
            description: 'router',
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
                  reason: {
                    type: 'string',
                    example: 'Đã tuyển đủ người',
                    description: 'Lý do đóng Job',
                  },
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
                schema: {
                  type: 'object',
                  example: { id: 'job_001', status: 'CLOSED' },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
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
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'job/open' },
            description: 'router',
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
                  type: 'object',
                  example: {
                    id: 'job_001',
                    status: 'OPEN',
                    message: 'Đã mở lại Job thành công',
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
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
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'job/lock' },
            description: 'router',
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
                  type: 'object',
                  example: {
                    id: 'job_001',
                    status: 'LOCKED',
                    message: 'Đã khóa Job tạm thời',
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
        },
      },
    },
    // --- MODULE: QUẢN LÝ PHÒNG BAN (DEPARTMENT) ---
    '/departments': {
      get: {
        tags: ['Quản lý Phòng ban'],
        summary: 'Lấy danh sách Phòng ban (Cơ bản)',
        description:
          'Lấy danh sách có phân trang, sắp xếp theo ngày tạo mới nhất.',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'department/get' },
            description: 'router',
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
              links: {
                // GetUserDetail: {
                //   operationId: 'getUser',
                //   parameters: {
                //     id: '$response.body#/user_id'
                //   },
                //   description: 'Lấy thông tin user vừa đăng nhập'
                // }
              }
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
          {
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'department/add' },
            description: 'router',
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
                  description: {
                    type: 'string',
                    example: 'Phụ trách truyền thông & quảng cáo',
                  },
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
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
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
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'department/search' },
            description: 'router',
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
            schema: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE'],
              example: 'ACTIVE',
            },
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
                    data: [
                      {
                        id: 'dept_001',
                        name: 'Phòng Công nghệ',
                        status: 'ACTIVE',
                      },
                    ],
                    meta: { total: 1, page: 1, limit: 10 },
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
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
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'department/getone' },
            description: 'router',
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
              links: {
                // GetUserDetail: {
                //   operationId: 'getUser',
                //   parameters: {
                //     id: '$response.body#/user_id'
                //   },
                //   description: 'Lấy thông tin user vừa đăng nhập'
                // }
              }
            },
          },
          '404': {
            description: 'Không tìm thấy phòng ban',
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
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
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'department/edit' },
            description: 'router',
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
                schema: {
                  example: {
                    id: 'dept_001',
                    message: 'Cập nhật thông tin thành công',
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
        },
      },
    },
    '/departments/{id}/status': {
      patch: {
        tags: ['Quản lý Phòng ban'],
        summary: 'Đổi trạng thái (Active/Inactive)',
        description:
          'Lưu ý: Không thể chuyển sang INACTIVE nếu phòng ban đó còn Job đang mở (Status: OPEN).',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'department/changestatus' },
            description: 'router',
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
                    example: 'INACTIVE',
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
                    message:
                      'Đã chuyển trạng thái phòng ban sang INACTIVE thành công',
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
          '400': {
            description: 'Lỗi nghiệp vụ (Vẫn còn Job đang tuyển)',
            content: {
              'application/json': {
                schema: {
                  example: {
                    statusCode: 400,
                    message:
                      'Không thể đóng phòng ban này vì còn 2 công việc đang tuyển dụng...',
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
        },
      },
    },
    // --- MODULE: QUẢN LÝ ỨNG TUYỂN (APPLICATION FLOW) ---
    '/applications/job/{jobId}': {
      get: {
        tags: ['Quản lý Ứng tuyển'],
        summary: 'Lấy danh sách ứng viên theo Job',
        description:
          'Xem ai đang ứng tuyển vào Job này. Có thể lọc theo trạng thái (VD: chỉ xem ai đang Phỏng vấn).',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'application/get' },
            description: 'router',
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
              enum: [
                'APPLIED',
                'SCREENING',
                'INTERVIEW',
                'OFFERED',
                'HIRED',
                'REJECTED',
              ],
              example: 'INTERVIEW',
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
                              "id": "hstg7XswfQIV....",
                              "status": "APPLIED",
                              "interviewScheduled": null,
                              "feedback": null,
                              "rating": null,
                              "rejectionReason": null,
                              "appliedAt": "2026-01-03T02:26:07.609Z",
                              "updatedAt": "2026-01-03T02:26:07.609Z",
                              "cv": {
                                  "cvId": "yCJfvY8B7.....",
                                  "fullName": "Dũng Họ Cao",
                                  "email": "kazki_example@vietcv.io",
                                  "phone": "0912345678",
                                  "cvFileUrl": "https://res.cloudinary.com/dgfwcrbyg/image/upload/v1768362509/CV/oes1ds2fuary45q7d0wn.pdf",
                                  "position": "Backend Developer",
                                  "experienceYears": 1
                              }
                          },
                          {
                              "id": "aJHSMrGmppx....",
                              "status": "HIRED",
                              "interviewScheduled": "2025-01-15T09:00:00.000Z",
                              "feedback": "Kỹ thuật tốt nhưng expect lương hơi cao",
                              "rating": 4,
                              "rejectionReason": "Không phù hợp văn hóa",
                              "appliedAt": "2026-01-03T02:25:10.555Z",
                              "updatedAt": "2026-01-05T10:03:17.648Z",
                              "cv": {
                                  "cvId": "yCJfvY8B7Bm4ZPBx5w0G",
                                  "fullName": "Dũng Họ Cao",
                                  "email": "kazki_example@vietcv.io",
                                  "phone": "0912345678",
                                  "cvFileUrl": "https://res.cloudinary.com/dgfwcrbyg/image/upload/v1768362509/CV/oes1ds2fuary45q7d0wn.pdf",
                                  "position": "Backend Developer",
                                  "experienceYears": 1
                              }
                          },
                          {
                              "id": "aX8laggddZ81T....",
                              "status": "REJECTED",
                              "interviewScheduled": null,
                              "feedback": "Quá xuất sắc",
                              "rating": 4,
                              "rejectionReason": "Ứng viên không đồng ý với mức lương đề xuất (Budget tối đa 1500$, ứng viên expect 2000$).",
                              "appliedAt": "2026-01-03T02:25:09.304Z",
                              "updatedAt": "2026-01-03T05:05:19.124Z",
                              "cv": {
                                  "cvId": "xk7xiZBnAorjxmYpXec1",
                                  "fullName": "Unknown",
                                  "email": "kazki_example@vietcv.io",
                                  "phone": null,
                                  "cvFileUrl": "https://res.cloudinary.com/dgfwcrbyg/image/upload/v1768313955/CV/uvwcjjm8qtuzbabd4tuw.pdf",
                                  "position": "N/A",
                                  "experienceYears": 2
                              }
                          },
                          {
                              "id": "g4ErmO0yQmb.....",
                              "status": "REJECTED",
                              "interviewScheduled": null,
                              "feedback": null,
                              "rating": null,
                              "rejectionReason": "Chuyên môn chưa đạt yêu cầu",
                              "appliedAt": "2026-01-03T02:25:07.899Z",
                              "updatedAt": "2026-01-05T10:16:13.288Z",
                              "cv": null
                          }
                      ],

                    meta: { total: 15, page: 1, limit: 10, totalPages: 2 },
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
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
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'application/getone' },
            description: 'router',
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
                        "id": "aX8laggddZ81T450UuuW",
                        "status": "REJECTED",
                        "interviewScheduled": null,
                        "feedback": "Quá xuất sắc",
                        "rating": 4,
                        "rejectionReason": "Ứng viên không đồng ý với mức lương đề xuất (Budget tối đa 1500$, ứng viên expect 2000$).",
                        "appliedAt": "2026-01-03T02:25:09.304Z",
                        "updatedAt": "2026-01-03T05:05:19.124Z",
                        "cv": {
                            "id": "xk7xiZBnAorjxmYpXec1",
                            "fullName": "Unknown",
                            "email": "kazki_example@vietcv.io",
                            "phone": null,
                            "cvFileUrl": "https://res.cloudinary.com/dgfwcrbyg/image/upload/v1768313955/CV/uvwcjjm8qtuzbabd4tuw.pdf",
                            "position": "N/A",
                            "experienceYears": 2,
                            "skills": [
                                "Html5",
                                "P",
                                "Html",
                                "Seo",
                                "Github",
                                "R",
                                "Ui"
                            ]
                        },
                        "job": {
                            "id": "8TIYeQQGiRH1qHjtodrA",
                            "name": "Senior Java Backend Developer",
                            "status": "LOCKED",
                            "departmentId": "5JC7QkMSzsUaCev8SIi5",
                            "headcountTarget": 5,
                            "applyEnd": "2024-03-31T00:00:00.000Z"
                        }
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
        },
      },
      patch: {
        tags: ['Quản lý Ứng tuyển'],
        summary: 'Cập nhật thông tin chi tiết (Lịch PV/Feedback)',
        description:
          'Dùng để set lịch phỏng vấn, đánh giá sao, viết nhận xét sau phỏng vấn.',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'application/edit' },
            description: 'router',
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
                  interviewScheduled: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-01-15T09:00:00Z',
                    description: 'Hẹn lịch phỏng vấn',
                  },
                  feedback: {
                    type: 'string',
                    example: 'Kỹ thuật tốt nhưng expect lương hơi cao',
                  },
                  rating: { type: 'number', example: '4 (min: 1, max: 5)' },
                  rejectionReason: {
                    type: 'string',
                    example: 'Không phù hợp văn hóa',
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
                    id: 'app_001',
                    message: 'Cập nhật thông tin thành công',
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
        },
      },
    },
      '/applications/cv/{cvId}': {
          get: {
              tags: ['Quản lý Ứng tuyển'],
              summary: 'Xem lịch sử ứng tuyển của CV',
              description:
                  'Lấy danh sách các Job mà CV này đã ứng tuyển. Giúp HR xem lịch sử "chinh chiến" của ứng viên.',
              parameters: [
                  {
                      in: 'header',
                      name: 'refreshtoken',
                      required: true,
                      schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                      description: 'Refresh Token',
                  },
                  {
                      in: 'header',
                      name: 'accountid',
                      required: true,
                      schema: { type: 'string', example: '<Nhập accountid>' },
                      description: 'accountid',
                  },
                  {
                      in: 'header',
                      name: 'router',
                      required: true,
                      schema: { type: 'string', example: 'application/get' },
                      description: 'router',
                  },
                  {
                      in: 'path',
                      name: 'cvId',
                      required: true,
                      schema: { type: 'string', example: 'cv_123' },
                      description: 'ID của CV cần xem lịch sử',
                  },
                  {
                      in: 'query',
                      name: 'status',
                      schema: {
                          type: 'string',
                          enum: [
                              'APPLIED',
                              'SCREENING',
                              'INTERVIEW',
                              'OFFERED',
                              'HIRED',
                              'REJECTED',
                          ],
                          example: 'INTERVIEW',
                      },
                      description: 'Lọc theo trạng thái hồ sơ (Optional)',
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
                      description: 'Danh sách lịch sử ứng tuyển',
                      content: {
                          'application/json': {
                              schema: {
                                  example: {
                                      data: [
                                          {
                                              id: 'app_005',
                                              status: 'INTERVIEW',
                                              appliedAt: '2025-01-10T09:00:00.000Z',
                                              updatedAt: '2025-01-12T09:00:00.000Z',
                                              interviewScheduled: '2025-01-15T14:00:00.000Z',
                                              rating: null,
                                              // Thông tin Job được map vào
                                              job: {
                                                  id: 'job_001',
                                                  name: 'Senior Node.js Developer',
                                                  status: 'OPEN',
                                                  applyEnd: '2025-02-28T00:00:00.000Z',
                                                  headcountTarget: 5,
                                                  headcountHired: 1
                                              }
                                          },
                                          {
                                              id: 'app_002',
                                              status: 'REJECTED',
                                              appliedAt: '2024-12-01T08:00:00.000Z',
                                              updatedAt: '2024-12-05T10:00:00.000Z',
                                              rejectionReason: 'Chưa đủ kinh nghiệm thực tế',
                                              job: {
                                                  id: 'job_099',
                                                  name: 'Junior React Developer',
                                                  status: 'CLOSED', // Job này đã đóng
                                                  applyEnd: '2024-12-31T00:00:00.000Z',
                                                  headcountTarget: 2,
                                                  headcountHired: 2
                                              }
                                          }
                                      ],
                                      meta: {
                                          total: 2,
                                          page: 1,
                                          limit: 10,
                                          totalPages: 1
                                      },
                                  },
                              },
                          },
                      },
                      links: {
                          // GetUserDetail: {
                          //   operationId: 'getUser',
                          //   parameters: {
                          //     id: '$response.body#/user_id'
                          //   },
                          //   description: 'Lấy thông tin user vừa đăng nhập'
                          // }
                      }
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
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'application/changestatus' },
            description: 'router',
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
                    enum: [
                      'APPLIED',
                      'SCREENING',
                      'INTERVIEW',
                      'OFFERED',
                      'HIRED',
                      'REJECTED',
                    ],
                    example: 'INTERVIEW',
                  },
                  rejectionReason: {
                    type: 'string',
                    example: 'Chuyên môn chưa đạt yêu cầu',
                    description: 'Bắt buộc nếu status là REJECTED',
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
                    message: 'Cập nhật trạng thái thành công',
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
          '400': {
            description: 'Lỗi quy trình (Đi sai bước hoặc thiếu lý do từ chối)',
            content: {
              'application/json': {
                schema: {
                  example: {
                    statusCode: 400,
                    message:
                      'Không thể chuyển trạng thái từ APPLIED sang OFFERED...',
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
        },
      },
    },

    // --- MODULE: QUẢN LÝ NHÂN VIÊN (USER) ---
    '/users': {
      post: {
        tags: ['Quản lý Nhân viên'],
        summary: 'Tạo nhân viên mới',
        description: `
        Tạo tài khoảnvới mật khẩu mặc định: **123456**
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
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'user/add' },
            description: 'router',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Nguyễn Văn B' },
                  email: { type: 'string', example: 'nguyenvanb@company.com' },
                  phone: { type: 'string', example: '0909111222' },
                  address: { type: 'string', example: '123 Lê Lợi, Q1, HCM' },
                  dob: {
                    type: 'string',
                    format: 'date',
                    example: '1998-05-20',
                    description: 'Ngày sinh (YYYY-MM-DD hoặc ISO String)'
                  },
                  gender: { type: 'string', example: 'Nam' },
                  role: { type: 'string', example: 'Kế toán' },
                  departmentId: { type: 'string', example: 'dept_001' },
                },
                required: ['name', 'email', 'phone', 'address', 'dob', 'role', 'gender', 'departmentId'],
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
                    id: 'firebase_uid_123456',
                    message: 'Tạo nhân viên thành công',
                    defaultPassword: 'User@123'
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
          '400': {
            description: 'Lỗi Validation hoặc Trùng lặp',
            content: {
              'application/json': {
                schema: { example: { message: 'Email hoặc Số điện thoại đã tồn tại trong hệ thống.' } }
              }
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          }
        },
      },
      get: {
        tags: ['Quản lý Nhân viên'],
        summary: 'Lấy danh sách nhân viên (Cơ bản)',
        description: 'Lấy danh sách tất cả nhân viên, sắp xếp theo ngày tạo mới nhất (createdAt desc).',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'user/get' },
            description: 'router',
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
            description: 'Số lượng item/trang (Mặc định 10)',
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
                        id: 'user_001',
                        name: 'Nguyễn Văn A',
                        email: 'a@gmail.com',
                        phone: '0909000111',
                        role: 'Dev',
                        status: 'ACTIVE',
                        departmentId: 'dept_tech',
                        createdAt: '2025-01-10T08:00:00.000Z'
                      },
                    ],
                    meta: { total: 50, page: 1, limit: 10, totalPages: 5 },
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
        },
      },
    },
    '/users/search': {
      get: {
        tags: ['Quản lý Nhân viên'],
        summary: 'Tìm kiếm nhân viên nâng cao',
        description: `
          **Cơ chế tìm kiếm:**
          - **keyword:** Tìm theo tên (Name), cơ chế Prefix Search (vd: gõ "Nguy" ra "Nguyễn").
          - **Các trường còn lại:** Tìm chính xác (Exact Match).
          - Nếu có **keyword**, danh sách sẽ sắp xếp theo Tên (A-Z).
          - Nếu **không có keyword**, danh sách sắp xếp theo Ngày tạo mới nhất.
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
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'user/search' },
            description: 'router',
          },
          {
            in: 'query',
            name: 'keyword',
            schema: { type: 'string', example: 'Nguyễn' },
            description: 'Tìm theo tên nhân viên',
          },
          {
            in: 'query',
            name: 'email',
            schema: { type: 'string', example: 'nguyenvanb@company.com' },
            description: 'Tìm chính xác Email',
          },
          {
            in: 'query',
            name: 'phone',
            schema: { type: 'string', example: '0909111222' },
            description: 'Tìm chính xác SĐT',
          },
          {
            in: 'query',
            name: 'status',
            schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' },
            description: 'Lọc theo trạng thái',
          },
          {
            in: 'query',
            name: 'departmentId',
            schema: { type: 'string', example: 'dept_001' },
            description: 'Lọc theo phòng ban',
          },
          {
            in: 'query',
            name: 'role',
            schema: { type: 'string', example: 'Kế toán' },
            description: 'Lọc theo vai trò',
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
            description: 'Trả về kết quả tìm kiếm',
            content: {
              'application/json': {
                schema: {
                  example: {
                    data: [
                      {
                        id: 'user_002',
                        name: 'Nguyễn Văn B',
                        email: 'nguyenvanb@company.com',
                        status: 'ACTIVE'
                      }
                    ],
                    meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
        },
      },
    },

    '/users/{id}': {
      get: {
        tags: ['Quản lý Nhân viên'],
        summary: 'Xem chi tiết nhân viên',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'user/getone' },
            description: 'router',
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', example: 'user_001' },
          },
        ],
        responses: {
          '200': {
            description: 'Thông tin chi tiết',
            content: {
              'application/json': {
                schema: {
                  example: {
                    id: 'user_001',
                    name: 'Nguyễn Văn B',
                    email: 'nguyenvanb@company.com',
                    phone: '0909111222',
                    address: 'HCM',
                    dob: '1998-05-20T00:00:00.000Z',
                    role: 'Kế toán',
                    gender: 'Nam',
                    status: 'ACTIVE',
                    departmentId: 'dept_001',
                    createdAt: '2025-01-12T10:00:00.000Z',
                    updatedAt: '2025-01-12T10:00:00.000Z'
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
          '404': {
            description: 'Không tìm thấy',
            content: {
              'application/json': { schema: { example: { message: 'Không tìm thấy nhân viên' } } }
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          }
        },
      },
      patch: {
        tags: ['Quản lý Nhân viên'],
        summary: 'Cập nhật thông tin nhân viên',
        description: `
          **Lưu ý:**
          - Chỉ cần gửi các trường muốn thay đổi (Partial Update).
          - Nếu thay đổi **Email**, hệ thống sẽ tự động đồng bộ sang Firebase Authentication (để user đăng nhập bằng email mới).
          - Hệ thống sẽ chặn nếu Email hoặc SĐT mới bị trùng với nhân viên khác.
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
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'user/edit' },
            description: 'router',
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', example: 'user_001' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Nguyễn Văn B (Updated)' },
                  email: { type: 'string', example: 'new_email@company.com' },
                  phone: { type: 'string', example: '0999888777' },
                  address: { type: 'string', example: 'Hà Nội' },
                  role: { type: 'string', example: 'Trưởng phòng Kế toán' },
                  departmentId: { type: 'string', example: 'dept_002' },
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
                    id: 'user_001',
                    message: 'Cập nhật thành công'
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
          '400': {
            description: 'Lỗi trùng lặp dữ liệu',
            content: {
              'application/json': {
                schema: { example: { message: "Email 'new_email@company.com' đã được sử dụng bởi nhân viên khác." } }
              }
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          }
        },
      },
    },

    '/users/{id}/status': {
      patch: {
        tags: ['Quản lý Nhân viên'],
        summary: 'Đổi trạng thái (Khóa/Mở khóa tài khoản)',
        description: `
          **Tác động:**
          - **INACTIVE**: Cập nhật DB và **Disabled** tài khoản bên Auth (User không thể đăng nhập).
          - **ACTIVE**: Cập nhật DB và **Enabled** tài khoản bên Auth (Cho phép đăng nhập lại).
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
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'user/changestatus' },
            description: 'router',
          },
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', example: 'user_001' },
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
                    example: 'INACTIVE',
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
                    id: 'user_001',
                    previousStatus: 'ACTIVE',
                    currentStatus: 'INACTIVE',
                    message: 'Đã chuyển trạng thái tài khoản sang INACTIVE'
                  },
                },
              },
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          },
          '400': {
            description: 'Lỗi Logic',
            content: {
              'application/json': {
                schema: { example: { message: "Tài khoản đang ở trạng thái INACTIVE, không cần cập nhật." } }
              }
            },
            links: {
              // GetUserDetail: {
              //   operationId: 'getUser',
              //   parameters: {
              //     id: '$response.body#/user_id'
              //   },
              //   description: 'Lấy thông tin user vừa đăng nhập'
              // }
            }
          }
        },
      },
    },
      '/users/{id}/password': {
          patch: {
              tags: ['Quản lý Nhân viên'],
              summary: 'Cập nhật mật khẩu (Reset Password)',
              description: `
          **Validation:** Mật khẩu bắt buộc tối thiểu 6 ký tự.
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
                      in: 'header',
                      name: 'accountid',
                      required: true,
                      schema: { type: 'string', example: '<Nhập accountid>' },
                      description: 'accountid',
                  },
                  {
                      in: 'header',
                      name: 'router',
                      required: true,
                      schema: { type: 'string', example: 'user/edit' },
                      description: 'router',
                  },
                  {
                      in: 'path',
                      name: 'id',
                      required: true,
                      schema: { type: 'string', example: 'user_001' },
                      description: 'ID của nhân viên cần đổi mật khẩu',
                  },
              ],
              requestBody: {
                  required: true,
                  content: {
                      'application/json': {
                          schema: {
                              type: 'object',
                              properties: {
                                  password: {
                                      type: 'string',
                                      example: 'NewStrongPass@2025',
                                      minLength: 6,
                                      description: 'Mật khẩu mới (Ít nhất 6 ký tự)'
                                  },
                              },
                              required: ['password'],
                          },
                      },
                  },
              },
              responses: {
                  '200': {
                      description: 'Đổi mật khẩu thành công',
                      content: {
                          'application/json': {
                              schema: {
                                  example: {
                                      id: 'user_001',
                                      message: 'Cập nhật mật khẩu thành công',
                                  },
                              },
                          },
                      },
                  },
                  '400': {
                      description: 'Mật khẩu quá yếu hoặc lỗi từ Firebase',
                      content: {
                          'application/json': {
                              schema: {
                                  example: {
                                      statusCode: 400,
                                      message: 'Mật khẩu phải có ít nhất 6 ký tự',
                                  },
                              },
                          },
                      },
                  },
                  '404': {
                      description: 'Không tìm thấy nhân viên',
                      content: {
                          'application/json': {
                              schema: {
                                  example: {
                                      statusCode: 404,
                                      message: 'Không tìm thấy nhân viên',
                                  },
                              },
                          },
                      },
                  },
              },
          },
      },




    '/role/get': {
      get: {
        tags: ['Quản lý quyền truy cập'],
        summary: 'Lấy toàn bộ danh sách nhóm quyền và phân quyền',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'role/get' },
            description: 'router',
          },
        ],
        responses: {
          '200': {
            description: 'Lấy danh sách role thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  example: {
                    role: {
                      user: {
                        account: {
                          logout: 0
                        },
                        application: {
                          changestatus: 0,
                          edit: 0,
                          get: 0,
                          getone: 0
                        },
                        user: {
                          search: 1
                        }
                      }
                    }, links: {
                      // GetUserDetail: {
                      //   operationId: 'getUser',
                      //   parameters: {
                      //     id: '$response.body#/user_id'
                      //   },
                      //   description: 'Lấy thông tin user vừa đăng nhập'
                      // }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/role/add': {
      post: {
        tags: ['Quản lý quyền truy cập'],
        summary: 'Tạo mới một nhóm quyền',
        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
            description: 'Refresh Token',
          },
          {
            in: 'header',
            name: 'accountid',
            required: true,
            schema: { type: 'string', example: '<Nhập accountid>' },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: { type: 'string', example: 'role/add' },
            description: 'router',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Tên nhóm quyền (role/<groupName>)',
                  },
                },
                required: ['name'],
                example: {
                  name: 'user',
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Tạo nhóm quyền thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  example: {
                    message: 'Tạo nhóm role thành công',
                    groupName: 'user',
                  },
                },
              },
              links: {
                // GetUserDetail: {
                //   operationId: 'getUser',
                //   parameters: {
                //     id: '$response.body#/user_id'
                //   },
                //   description: 'Lấy thông tin user vừa đăng nhập'
                // }
              }
            },
          },
        },
      },
    },
    '/role/edit': {
      put: {
        tags: ['Quản lý quyền truy cập'],
        summary: 'Cập nhật quyền (bật / tắt chức năng) cho nhóm',
        description:
          'API dùng để cập nhật quyền cho một nhóm role. ' +
          'Dữ liệu gửi lên là cây phân quyền, mỗi chức năng có giá trị 0 (không cho) hoặc 1 (cho).',

        parameters: [
          {
            in: 'header',
            name: 'refreshtoken',
            required: true,
            schema: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1Ni...',
            },
            description: 'Refresh Token',
          },
          {
            in: 'header',
            name: 'accountid',
            required: true,
            schema: {
              type: 'string',
              example: '<Nhập accountid>',
            },
            description: 'accountid',
          },
          {
            in: 'header',
            name: 'router',
            required: true,
            schema: {
              type: 'string',
              example: 'role/edit',
            },
            description: 'router',
          },
        ],

        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  groupName: {
                    type: 'string',
                    description: 'Tên nhóm quyền (document trong collection role)',
                    example: 'default',
                  },
                  data: {
                    type: 'object',
                    description:
                      'Cây phân quyền. Key là module (account, application, cv, ...), ' +
                      'value là các chức năng với giá trị 0 hoặc 1.',
                    additionalProperties: {
                      type: 'object',
                      additionalProperties: {
                        type: 'integer',
                        enum: [0, 1],
                      },
                    },
                  },
                },
                required: ['groupName', 'data'],
                example: {
                  groupName: 'default',
                  data: {
                    account: {
                      logout: 1,
                    },
                    application: {
                      changestatus: 1,
                      edit: 1,
                      get: 1,
                      getone: 1,
                    },
                    cv: {
                      addcv: 1,
                      addexcel: 1,
                      assign: 1,
                      changestatus: 1,
                      edit: 1,
                      get: 1,
                      getone: 1,
                      readexcel: 1,
                      readpdfdoc: 1,
                    },
                    department: {
                      add: 1,
                      changestatus: 1,
                      edit: 1,
                      get: 1,
                      getone: 1,
                      search: 1,
                    },
                    job: {
                      add: 1,
                      close: 1,
                      edit: 1,
                      get: 1,
                      getone: 1,
                      lock: 1,
                      open: 1,
                      search: 1,
                    },
                    role: {
                      add: 1,
                      delete: 1,
                      edit: 1,
                      get: 1,
                    },
                    user: {
                      add: 1,
                      changestatus: 1,
                      edit: 1,
                      get: 1,
                      getone: 1,
                      search: 1,
                    },
                  },
                },
              },
            },
          },
        },

        responses: {
          '200': {
            description: 'Cập nhật quyền cho nhóm thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Cập nhật quyền cho nhóm thành công',
                    },
                    groupName: {
                      type: 'string',
                      example: 'default',
                    },
                  },
                },
              },
              links: {
                // GetUserDetail: {
                //   operationId: 'getUser',
                //   parameters: {
                //     id: '$response.body#/user_id'
                //   },
                //   description: 'Lấy thông tin user vừa đăng nhập'
                // }
              }
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
