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

    // BATCH PROCESSING
    const batch = this.firebaseService.firestore.batch();
    let hasValidDataToSave = false;

    await Promise.all(
      files.map(async (file) => {
        const fileName = file.originalname;
        try {
          //Parse AI
          // Nếu parse thất bại, nó sẽ throw Error và nhảy xuống catch -> Không upload
          const rawData = await this.parseSingleFile(file);

          //Check trùng lặp
          const duplicateInfo = await this.checkDuplicate(
            rawData.email,
            rawData.phone,
          );

          // Upload Cloudinary (Chỉ chạy khi Parse thành công)
          let uploadResult;
          try {
            uploadResult = await this.cloudinaryService.uploadFile(file, 'CV');
          } catch (uploadError) {
            // Upload thất bại -> Không lưu DB -> Throw error để nhảy xuống catch ngoài cùng
            throw new Error(
              `Upload Cloudinary thất bại: ${uploadError.message}`,
            );
          }

          // BƯỚC 4: Map Entity & Chuẩn bị lưu DB
          // Chỉ chạy tới đây khi Upload thành công
          const rawExperience = Array.isArray(rawData.experience)
            ? rawData.experience
            : [];

          const mappedExperience = rawExperience.map((exp: any) => ({
            title: exp.title || exp.jobTitle || null,
            location: exp.location || exp.place || null,
            organization:
              exp.organization || exp.company || exp.companyName || null,
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
            cvFileUrl: uploadResult.secure_url, // URL từ Cloudinary
            publicId: uploadResult.public_id, // Public ID để xóa sau này
            skills: rawData.skills,
            education: rawData.education,
            experienceYears: rawData.experienceYears,
            status: CvStatus.NEW,
            experience: mappedExperience || [],
          });

          // Thêm vào batch
          const docRef = this.firebaseService.firestore
            .collection(this.cvCollection)
            .doc();
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
        } catch (error) {
          // Xử lý lỗi (Parse lỗi hoặc Upload lỗi)
          summary.failed++;
          summary.details.push({
            fileName,
            status: 'FAILED',
            error: error.message || 'Unknown Error',
          });
          this.logger.error(`Failed processing ${fileName}: ${error.message}`);
        }
      }),
    );

    // BƯỚC 5: Commit Batch (Chỉ lưu những CV thành công trọn vẹn)
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

  private async checkDuplicate(
    email?: string,
    phone?: string,
  ): Promise<string | null> {
    if (!email && !phone) return null;

    const queries: Promise<FirebaseFirestore.QuerySnapshot>[] = [];
    if (email)
      queries.push(
        this.firebaseService.firestore
          .collection(this.cvCollection)
          .where('email', '==', email)
          .limit(1)
          .get(),
      );
    if (phone)
      queries.push(
        this.firebaseService.firestore
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

  async create(
    createCvDto: CreateCvDto,
    userId: string,
    file?: Express.Multer.File,
  ) {
    // 1. Check trùng lặp
    const dup = await this.checkDuplicate(createCvDto.email, createCvDto.phone);
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
      cvFileUrl: cvFileUrl, // Lưu URL
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
    const docRef = this.firebaseService.firestore
      .collection(this.cvCollection)
      .doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Không tìm thấy cv');

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

    // Đọc Excel từ buffer
    const workbook = XLSX.read(file.buffer, {
      type: 'buffer',
    });

    // Lấy sheet đầu tiên
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Sheet → JSON
    const data = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];
    const list_cv = data.map(row => ({
      id: row["Họ và tên"],
      data: row
    }))
    const list_email:string[]=[];
    const list_phone:string[]=[];
    let count=0;
    for (let i in list_cv){
      list_email[count]=list_cv[count].data["email"];
      list_phone[count]=list_cv[count].data["Số điện thoại"];
      count++;
    }
    if (list_email.length!== new Set(list_email).size){
      throw new Error("Email bị trùng lặp")
    }
    if (list_phone.length!== new Set(list_phone).size){
      throw new Error("Số điện thoại bị trùng lặp")
    }
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