import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import * as admin from 'firebase-admin';
import {
  CV_COLLECTION_NAME,
  CvEntity,
  CvStatus, Experience,
} from '../../entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvStatusDto } from './dto/update-cv-status.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { instanceToPlain } from 'class-transformer';
import { FilterCvDto } from './dto/filter-cv.dto';

@Injectable()
export class CvService {
  private readonly db = admin.firestore();
  private readonly cvCollection = CV_COLLECTION_NAME;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.db.settings({ ignoreUndefinedProperties: true });
  }

  async processAndSaveCvs(
    files: Express.Multer.File[],
    userId: string,
  ): Promise<any> {
    if (!files || files.length === 0) throw new Error('Không có file nào được cung cấp');

    const parseResults = await Promise.allSettled(
      files.map((file) => this.parseSingleFile(file)),
    );

    // 2. Check trùng & Prepare Data
    const processedResults = await Promise.all(
      parseResults.map(async (result, index) => {
        const fileName = files[index].originalname;
        if (result.status === 'rejected') {
          return { fileName, success: false, error: result.reason.message };
        }

        const rawData = result.value;
        const duplicateInfo = await this.checkDuplicate(
          rawData.email,
          rawData.phone,
        );
        const rawExperience = Array.isArray(rawData.experience) ? rawData.experience : [];

        // Map và chuẩn hóa dữ liệu experience
        const mappedExperience = rawExperience.map((exp: any) => ({
          title: exp.title || exp.jobTitle || null, // Thử map nhiều key khác nhau
          location: exp.location || exp.place || null,
          organization: exp.organization || exp.company || exp.companyName || null,
          // GỌI HÀM HELPER ĐỂ XỬ LÝ DATE
          dates: this.normalizeDate(exp.dates || exp.date)
        }));

        // Map sang Entity chuẩn DB ngay tại đây
        const cvEntity = new CvEntity({
          createdBy: userId,
          cvType: 'Parsed Resume',
          fullName: rawData.fullName,
          email: rawData.email,
          phone: rawData.phone,
          position: rawData.position || 'N/A',
          level: rawData.level || 'N/A',
          cvFileUrl: files[index].originalname,
          skills: rawData.skills,
          education: rawData.education,
          experienceYears: rawData.experienceYears,
          status: CvStatus.NEW,
          experience: mappedExperience || [],
        });

        return {
          fileName,
          success: true,
          data: cvEntity, // Đã là object chuẩn
          duplicateInfo,
        };
      }),
    );

    // 3. Batch Write
    const batch = this.db.batch();
    const summary: {
      total: number;
      success: number;
      failed: number;
      details: Array<{
        fileName: string;
        status: string;
        data?: any;
        id?: string;
        error?: any;
        warning?: any;
      }>;
    } = {
      total: files.length,
      success: 0,
      failed: 0,
      details: [],
    };
    processedResults.forEach((result) => {
      if (result.success && result.data) {
        const cvData = result.data;

        // Tạo docRef
        const docRef = this.db.collection(this.cvCollection).doc();

        batch.set(docRef, cvData.toFirestore());

        summary.success++;
        summary.details.push({
          fileName: result.fileName,
          status: 'SUCCESS',
          id: docRef.id,
          warning: result.duplicateInfo
            ? `Trùng lặp: ${result.duplicateInfo}`
            : null,
        });
      } else {
        summary.failed++;
        summary.details.push({
          fileName: result.fileName,
          status: 'FAILED',
          error: result.error,
        });
      }
    });

    if (summary.success > 0) await batch.commit();
    return summary;
  }

  //lấy dữ liệu trả về từ AI
  private async parseSingleFile(
    file: Express.Multer.File,
  ): Promise<Partial<CvEntity>> {
    try {
      const apiKey = this.configService.get<string>('apilayer.key');
      const url = this.configService.get<string>('apilayer.url');
      if (!apiKey || !url) {
        throw new InternalServerErrorException(
          'Missing APILAYER configuration (KEY or URL)',
        );
      }
      const { data } = await lastValueFrom(
        this.httpService.post(url, file.buffer, {
          headers: {
            apikey: apiKey,
            'Content-Type': 'application/octet-stream',
            'Content-Description': file.originalname,
          },
        }),
      );
      // Mapping response từ APILayer sang cấu trúc của ta
      return {
        fullName: data.name || 'Unknown',
        email: data.email || null,
        phone: data.phone || null,
        skills: data.skills || [],
        education: data.education || [],
        experience: data.experience || [],
        experienceYears: data.experience ? data.experience.length : 0,
      };
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      throw new Error(msg);
    }
  }

  private async checkDuplicate(
    email?: string,
    phone?: string,
  ): Promise<string | null> {
    if (!email && !phone) return null;

    const queries: Promise<FirebaseFirestore.QuerySnapshot>[] = [];
    if (email)
      queries.push(
        this.db
          .collection(this.cvCollection)
          .where('email', '==', email)
          .limit(1)
          .get(),
      );
    if (phone)
      queries.push(
        this.db
          .collection(this.cvCollection)
          .where('phone', '==', phone)
          .limit(1)
          .get(),
      );

    const snapshots = await Promise.all(queries);
    // Logic check đơn giản: nếu bất kỳ query nào có docs -> trùng
    const isDup = snapshots.some((snap) => !snap.empty);

    return isDup ? `Email hoặc SĐT đã tồn tại` : null;
  }

  async create(createCvDto: CreateCvDto, userId: string) {
    const dup = await this.checkDuplicate(createCvDto.email, createCvDto.phone);
    if (dup) throw new BadRequestException(dup);

    const newCv = new CvEntity({
      ...createCvDto,
      createdBy: userId,
      status: CvStatus.NEW,
    });

    const docRef = await this.db
      .collection(this.cvCollection)
      .add(newCv.toFirestore());
    return { id: docRef.id, ...newCv };
  }

  async findAll(filter: FilterCvDto) {
    const { page = 1, limit = 10 } = filter;
    const offset = (page - 1) * limit;

    // 1. Tạo Query cơ bản
    let query = this.db
      .collection(this.cvCollection)
      .orderBy('updatedAt', 'desc');

    // 2. Đếm tổng số record (Dùng Aggregation Query để tối ưu chi phí đọc)
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // 3. Lấy dữ liệu phân trang
    const snapshot = await query.offset(offset).limit(limit).get();

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as CvEntity),
    }));

    // 4. Trả về cấu trúc chuẩn cho Frontend
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const doc = await this.db.collection(this.cvCollection).doc(id).get();
    if (!doc.exists) throw new NotFoundException('Không tìm thấy cv');
    return { id: doc.id, ...doc.data() };
  }

  async update(id: string, updateCvDto: UpdateCvDto) {
    const docRef = this.db.collection(this.cvCollection).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Không tìm thấy cv');

    await docRef.update({
      ...updateCvDto,
      updatedAt: new Date(),
    });
    return { id, message: 'Cập nhật thành công' };
  }

  async updateStatus(id: string, dto: UpdateCvStatusDto) {
    const docRef = this.db.collection(this.cvCollection).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Không tìm thấy cv');

    await this.db.collection(this.cvCollection).doc(id).update({
      status: dto.status,
      updatedAt: new Date(),
    });
    return { id, status: dto.status };
  }


  private normalizeDate(dateInput: any): string | null {
    if (!dateInput) return null;

    // Trường hợp 1: Đã là String (VD: "2015 - 2017")
    if (typeof dateInput === 'string') {
      return dateInput.trim() === '' ? null : dateInput;
    }

    // Trường hợp 2: Là Mảng (VD: ["2015", "2017"])
    if (Array.isArray(dateInput)) {
      if (dateInput.length === 0) return null;
      // Nối mảng thành chuỗi "Start - End"
      return dateInput.filter(d => d).join(' - ');
    }

    // Trường hợp 3: Là Object (VD: { startDate: "2015-01", endDate: "2020-12" })
    if (typeof dateInput === 'object') {
      const start = dateInput.startDate || dateInput.start || '';
      const end = dateInput.endDate || dateInput.end || (dateInput.isCurrent ? 'Present' : '');

      // Nếu cả 2 đều rỗng
      if (!start && !end) return null;

      // Nếu chỉ có start (VD: "2015 - ") -> format lại thành "2015"
      if (start && !end) return start.toString();

      // Nếu chỉ có end (ít gặp)
      if (!start && end) return end.toString();

      return `${start} - ${end}`;
    }

    return null;
  }
}
