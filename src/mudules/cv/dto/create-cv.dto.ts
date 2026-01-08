import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { ExperienceDto } from './experience.dto';

export class CreateCvDto {
  @IsOptional()
  @IsString()
  cvType?: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    // Nếu gửi nhiều dòng skills trong Postman -> Multer tự gộp thành mảng -> Giữ nguyên
    if (Array.isArray(value)) return value;
    // Nếu gửi 1 dòng hoặc gửi dạng chuỗi "Java, Node" -> Chuyển thành mảng
    if (typeof value === 'string') {
      // Thử parse JSON trước (trường hợp gửi ["Java", "Node"])
      try { return JSON.parse(value); } catch(e) {}
      // Fallback: split dấu phẩy hoặc trả về mảng 1 phần tử
      return value.includes(',') ? value.split(',').map(s => s.trim()) : [value];
    }
    return value;
  })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch(e) {}
      return value.includes(',') ? value.split(',').map(s => s.trim()) : [value];
    }
    return value;
  })
  education?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  experienceYears?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true }) // Validate từng phần tử trong mảng
  @Type(() => ExperienceDto) // Chuyển đổi JSON object thành instance ExperienceDto
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(ExperienceDto, parsed);

      } catch (error) {
        return [];
      }
    }
    return plainToInstance(ExperienceDto, value);
  })
  experience?: ExperienceDto[];
}