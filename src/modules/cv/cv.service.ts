import { CvStatus, CvEntity } from './../../entities/cv.entity';
import { Addcvimportexcel } from './dto/add-cv-import-excel.dto';
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
import {
  CV_COLLECTION_NAME,
} from '../../entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvStatusDto } from './dto/update-cv-status.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AssignJobDto } from './dto/assign-job.dto';
import { FirebaseService } from '../../firebase/firebase.service';
import * as XLSX from 'xlsx';
import {
  JOB_COLLECTION_NAME,
  JobEntity,
  JobStatus,
} from '../../entities/job.entity';
import {
  APPLICATION_COLLECTION_NAME,
  ApplicationEntity,
  ApplicationStatus,
} from '../../entities/application.entity';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { instanceToPlain } from 'class-transformer';
import { firestore } from 'firebase-admin';
import { error } from 'console';
import { Filter } from 'firebase-admin/firestore';

@Injectable()
export class CvService {
  private readonly logger = new Logger(CvService.name);
  private readonly cvCollection = CV_COLLECTION_NAME;
  private readonly jobCollection = JOB_COLLECTION_NAME;
  private readonly applicationCollection = APPLICATION_COLLECTION_NAME;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly firebaseService: FirebaseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {
    this.firebaseService.firestore.settings({
      ignoreUndefinedProperties: true,
    });
  }

  async processAndSaveCvs(
    files: Express.Multer.File[],
    userId: string,
  ): Promise<any> {
    if (!files || files.length === 0)
      throw new Error('Không có file nào được cung cấp');

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
    const batch = this.firebaseService.firestore.batch();
    let hasValidDataToSave = false;

    // BƯỚC 1: Parse AI toàn bộ file song song (Chưa gọi DB)
    const parsePromises = files.map(async (file) => {
      try {
        const data = await this.parseSingleFile(file);
        return { success: true, file, data };
      } catch (error) {
        return { success: false, file, error: error.message };
      }
    });
    const parsedResults = await Promise.all(parsePromises);

    // BƯỚC 2: Chuẩn bị dữ liệu check trùng (Chỉ Email & Phone, KHÔNG check CCCD)
    const validResults = parsedResults.filter((r) => r.success);

    const emailsToCheck = [
      ...new Set(validResults.map((r) => r.data?.email).filter((e) => e)),
    ] as string[];

    const phonesToCheck = [
      ...new Set(validResults.map((r) => r.data?.phone).filter((p) => p)),
    ] as string[];

    // Gọi hàm check tối ưu (1-2 request DB thay vì N request)
    const { existingEmails, existingPhones } = await this.findExistingIdentifiers(
      emailsToCheck,
      phonesToCheck,
      []//không cần check cccd vì ai không có trả về dữ liệu cccd
    );

    // BƯỚC 3: Xử lý từng file (Upload & Map Entity)
    await Promise.all(
      parsedResults.map(async (result) => {
        const fileName = result.file.originalname;

        // 3.1 Nếu Parse lỗi -> Skip
        if (!result.success ||!result.data) {
          summary.failed++;
          summary.details.push({ fileName, status: 'FAILED', error: result.error });
          return;
        }

        const rawData = result.data;

        // 3.2 Check trùng (Dùng kết quả đã lấy ở Bước 2)
        let duplicateInfo: string | null = null;
        if (rawData.email && existingEmails.has(rawData.email)) {
          duplicateInfo = `Email (${rawData.email})`;
        } else if (rawData.phone && existingPhones.has(rawData.phone)) {
          duplicateInfo = `SĐT (${rawData.phone})`;
        }

        // 3.3 Upload Cloudinary
        let uploadResult;
        try {
          uploadResult = await this.cloudinaryService.uploadFile(result.file, 'CV');
        } catch (uploadError) {
          summary.failed++;
          summary.details.push({ fileName, status: 'FAILED', error: 'Upload Failed' });
          return;
        }

        // 3.4 Map Entity
        const rawExperience = Array.isArray(rawData.experience)
          ? rawData.experience
          : [];
        const mappedExperience = rawExperience.map((exp: any) => ({
          title: exp.title || exp.jobTitle || null,
          location: exp.location || exp.place || null,
          organization: exp.organization || exp.company || exp.companyName || null,
          dates: this.normalizeDate(exp.dates || exp.date),
        }));

        const cvEntity = new CvEntity({
          createdBy: userId,
          cvType: 'Parsed Resume',
          fullName: rawData.fullName,
          email: rawData.email,
          phone: rawData.phone,
          position: rawData.position || 'N/A',
          level: rawData.level || 'N/A',
          cvFileUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          skills: rawData.skills,
          education: rawData.education,
          experienceYears: rawData.experienceYears,
          status: CvStatus.NEW,
          experience: mappedExperience || [],
        });

        // 3.5 Thêm vào Batch
        const docRef = this.firebaseService.firestore.collection(this.cvCollection).doc();
        batch.set(docRef, cvEntity.toFirestore());

        hasValidDataToSave = true;
        summary.success++;
        summary.details.push({
          fileName,
          status: 'SUCCESS',
          id: docRef.id,
          data: cvEntity,
          warning: duplicateInfo ? `Trùng lặp: ${duplicateInfo}` : null,
        });
      }),
    );

    // BƯỚC 4: Commit
    if (hasValidDataToSave) {
      await batch.commit();
    }

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
      console.log(error);
      throw new Error(`Có lỗi xảy ra khi đọc file: ${msg}`);
    }
  }

  private async findExistingIdentifiers(
    emails: string[],
    phones: string[],
    cccds: string[], // <--- Thêm tham số cccds
  ): Promise<{
    existingEmails: Set<string>;
    existingPhones: Set<string>;
    existingCccds: Set<string>
  }> {

    // Chạy 3 luồng kiểm tra song song để tiết kiệm thời gian
    const [existingEmails, existingPhones, existingCccds] = await Promise.all([
      this.checkFieldBatch('email', emails),
      this.checkFieldBatch('phone', phones),
      this.checkFieldBatch('cccd', cccds),
    ]);

    return { existingEmails, existingPhones, existingCccds };
  }

  /**
   * Helper function: Chia nhỏ mảng và kiểm tra tồn tại trong DB theo từng trường
   */
  private async checkFieldBatch(field: string, values: string[]): Promise<Set<string>> {
    const foundSet = new Set<string>();

    // Nếu mảng rỗng thì trả về Set rỗng luôn
    if (!values || values.length === 0) return foundSet;

    const CHUNK_SIZE = 30; // Firestore giới hạn toán tử 'in' tối đa 30
    const chunks: string[][] = [];

    // 1. Chia mảng thành các chunk nhỏ
    for (let i = 0; i < values.length; i += CHUNK_SIZE) {
      chunks.push(values.slice(i, i + CHUNK_SIZE));
    }

    // 2. Tạo danh sách Query
    const queries = chunks.map((chunk) =>
      this.firebaseService.firestore
        .collection(this.cvCollection)
        .where(field, 'in', chunk)
        .get(),
    );

    // 3. Thực thi song song
    const snapshots = await Promise.all(queries);

    // 4. Gom kết quả vào Set
    snapshots.forEach((snap) => {
      snap.docs.forEach((doc) => {
        const data = doc.data();
        // Kiểm tra data[field] tồn tại để tránh lỗi undefined
        if (data[field]) {
          foundSet.add(data[field]);
        }
      });
    });

    return foundSet;
  }


  private async checkDuplicate(
    email?: string,
    phone?: string,
    cccd?: string, // <--- Thêm tham số cccd
  ): Promise<string | null> {
    if (!email && !phone && !cccd) return null;

    const filters: any[] = [];

    if (email) filters.push(Filter.where('email', '==', email));
    if (phone) filters.push(Filter.where('phone', '==', phone));
    if (cccd)  filters.push(Filter.where('cccd', '==', cccd));

    if (filters.length === 0) return null;

    // Chỉ tốn 1 Request duy nhất để kiểm tra tất cả
    const querySnapshot = await this.firebaseService.firestore
      .collection(this.cvCollection)
      .where(Filter.or(...filters))
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      if (email && data.email === email) return `Email (${email}) đã tồn tại`;
      if (phone && data.phone === phone) return `SĐT (${phone}) đã tồn tại`;
      if (cccd && data.cccd === cccd)    return `CCCD (${cccd}) đã tồn tại`;
      return 'Thông tin định danh (Email/Phone/CCCD) đã tồn tại';
    }

    return null;
  }

  async create(
    createCvDto: CreateCvDto,
    userId: string,
    file?: Express.Multer.File,
  ) {
    // 1. Check trùng lặp
    const dup = await this.checkDuplicate(
      createCvDto.email,
      createCvDto.phone,
      createCvDto.cccd);
    if (dup) throw new BadRequestException(dup);

    let cvFileUrl = '';
    let publicId = null;

    if (file) {
      try {
        const uploadResult = await this.cloudinaryService.uploadFile(
          file,
          'CV',
        );
        cvFileUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
      } catch (error) {
        throw new BadRequestException(`Upload file thất bại: ${error.message}`);
      }
    }

    // 3. Tạo Entity với thông tin file
    const newCv = new CvEntity({
      ...createCvDto,
      createdBy: userId,
      status: CvStatus.NEW,
      cvFileUrl: cvFileUrl,
      publicId: publicId, // Lưu Public ID để xóa sau này
    });

    // 4. Lưu xuống Firestore
    const docRef = await this.firebaseService.firestore
      .collection(this.cvCollection)
      .add(newCv.toFirestore());

    newCv.id = docRef.id;
    return { ...newCv };
  }

  async findAll(filter: PaginationDto) {
    const { page = 1, limit = 10 } = filter;
    const offset = (page - 1) * limit;

    // 1. Tạo Query cơ bản
    let query = this.firebaseService.firestore
      .collection(this.cvCollection)
      .orderBy('updatedAt', 'desc');

    // 2. Đếm tổng số record (Dùng Aggregation Query để tối ưu chi phí đọc)
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // 3. Lấy dữ liệu phân trang
    const snapshot = await query.offset(offset).limit(limit).get();

    const data = snapshot.docs.map((doc) => CvEntity.fromFirestore(doc));

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
    const doc = await this.firebaseService.firestore
      .collection(this.cvCollection)
      .doc(id)
      .get();
    if (!doc.exists) throw new NotFoundException('Không tìm thấy cv');

    return CvEntity.fromFirestore(doc);
  }

  async update(id: string, updateCvDto: UpdateCvDto) {
    const docRef = this.firebaseService.firestore.collection(this.cvCollection).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Không tìm thấy cv');

    // Logic Check Trùng khi Update (Tối ưu)
    const { email, phone, cccd } = updateCvDto;

    if (email || phone || cccd) {
      const filters: any[] = [];
      if (email) filters.push(Filter.where('email', '==', email));
      if (phone) filters.push(Filter.where('phone', '==', phone));
      if (cccd)  filters.push(Filter.where('cccd', '==', cccd));

      if (filters.length > 0) {
        const duplicateSnapshot = await this.firebaseService.firestore
          .collection(this.cvCollection)
          .where(Filter.or(...filters))
          .get();

        // Duyệt qua kết quả tìm thấy
        for (const d of duplicateSnapshot.docs) {
          // Nếu tìm thấy trùng, nhưng ID khác ID đang sửa -> Báo lỗi
          if (d.id !== id) {
            const data = d.data();
            if (email && data.email === email) throw new BadRequestException(`Email (${email}) đã tồn tại`);
            if (phone && data.phone === phone) throw new BadRequestException(`SĐT (${phone}) đã tồn tại`);
            if (cccd && data.cccd === cccd)    throw new BadRequestException(`CCCD (${cccd}) đã tồn tại`);
          }
        }
      }
    }

    // Convert sang Plain Object để lưu Firestore (Fix lỗi prototype lần trước)
    const updateData = instanceToPlain(updateCvDto);

    await docRef.update({
      ...updateData,
      updatedAt: new Date(),
    });

    return { id, message: 'Cập nhật thành công' };
  }

  async updateStatus(id: string, dto: UpdateCvStatusDto) {
    const docRef = this.firebaseService.firestore
      .collection(this.cvCollection)
      .doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Không tìm thấy cv');

    await this.firebaseService.firestore
      .collection(this.cvCollection)
      .doc(id)
      .update({
        status: dto.status,
        updatedAt: new Date(),
      });
    return { id, status: dto.status };
  }
  async Readexcel(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không có file');
    }
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];

    const list_cv = data.map(row => ({
      id: row['Họ và tên'],
      data: row,
    }));

  return {
  sheetName,
  list_cv,
};
}


  async assignJob(dto: AssignJobDto) {
  const { jobId, cvIds } = dto;
  const batch = this.firebaseService.firestore.batch();

  //check Job có tồn tại và đang OPEN không
  const jobRef = this.firebaseService.firestore
    .collection(this.jobCollection)
    .doc(jobId);
  const jobDoc = await jobRef.get();

  if (!jobDoc.exists) {
    throw new NotFoundException(`Job ID ${jobId} không tồn tại`);
  }

  const jobData = JobEntity.fromFirestore(jobDoc);
  //Không assign CV vào Job đã đóng hoặc lock
  if (jobData.status !== JobStatus.OPEN) {
    throw new BadRequestException(
      'Không thể gán CV vào Job đã đóng hoặc bị khóa',
    );
  }

  const successIds: string[] = [];
  const errors: string[] = [];

  // 2. Duyệt qua từng CV để xử lý
  for (const cvId of cvIds) {
    const cvRef = this.firebaseService.firestore
      .collection(this.cvCollection)
      .doc(cvId);
    const cvDoc = await cvRef.get();

    if (!cvDoc.exists) {
      errors.push(`CV ID ${cvId} không tồn tại`);
      continue;
    }

    const cvData = CvEntity.fromFirestore(cvDoc);

    if (cvData.status !== CvStatus.APPROVED) {
      errors.push(
        `CV ${cvData.fullName} chưa được duyệt (Trạng thái: ${cvData.status})`,
      );
      continue;
    }

    //check trùng lặp (Đã apply job này chưa)
    const duplicateCheck = await this.firebaseService.firestore
      .collection(this.applicationCollection)
      .where('jobId', '==', jobId)
      .where('cvId', '==', cvId)
      .limit(1)
      .get();

    if (!duplicateCheck.empty) {
      errors.push(`CV ${cvData.fullName} đã ứng tuyển vào Job này rồi`);
      continue;
    }

    const newAppRef = this.firebaseService.firestore
      .collection(this.applicationCollection)
      .doc();
    const newApp = new ApplicationEntity({
      cvId: cvId,
      jobId: jobId,
      status: ApplicationStatus.APPLIED, //  Default status
      appliedAt: new Date(),
      updatedAt: new Date(),
    });

    batch.set(newAppRef, newApp.toFirestore());
    successIds.push(cvId);
  }

  // 5. Commit batch nếu có ít nhất 1 CV hợp lệ
  if (successIds.length > 0) {
    await batch.commit();
  }

  return {
    success: successIds.length > 0,
    assignedCount: successIds.length,
    successIds,
    errors, // Trả về danh sách lỗi để FE hiển thị
  };
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
    return dateInput.filter((d) => d).join(' - ');
  }

  // Trường hợp 3: Là Object (VD: { startDate: "2015-01", endDate: "2020-12" })
  if (typeof dateInput === 'object') {
    const start = dateInput.startDate || dateInput.start || '';
    const end =
      dateInput.endDate ||
      dateInput.end ||
      (dateInput.isCurrent ? 'Present' : '');

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
  async add_cv_excel(addcvimportexcel: Addcvimportexcel[]) {
  try {
    const list_id: string[] = [];
    const batch = await this.firebaseService.firestore.batch();
    for (let i = 0; i < addcvimportexcel.length; i++) {
      const createData = instanceToPlain(addcvimportexcel[i]);
      const newCv = {
        ...createData,
        status: CvStatus.NEW,
        createdAt: new Date(),
        cvType: "excel",
        updatedAt: new Date()
      }
      const docref = await this.firebaseService.firestore.collection(this.cvCollection).doc()
      list_id[i] = docref.id;
      batch.set(docref, newCv);
    }
    await batch.commit();
    return { message: "thêm thành công", data: list_id }
  } catch (error) {
    return { message: error, data: [] }
  }
}
}

function findDuplicatesWithPositions(list_phone: string[]) {
  throw new Error('Function not implemented.');
}
