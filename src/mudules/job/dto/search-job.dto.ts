import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { JobStatus } from '../../../entities/job.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';


export class SearchJobDto extends PaginationDto {
  @IsOptional()
  @IsString()
  keyword?: string; // Tìm theo Tên Job hoặc Job ID

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsString()
  createdBy?: string; // Lọc theo người tạo

  // Lọc theo khoảng Ngày tạo (Created Date)
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @IsOptional()
  @IsDateString()
  createdTo?: string;

  // Lọc theo khoảng Thời hạn ứng tuyển (Deadline / Apply End)
  @IsOptional()
  @IsDateString()
  deadlineFrom?: string;

  @IsOptional()
  @IsDateString()
  deadlineTo?: string;
}