import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateJobDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
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
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  headcountTarget?: number;
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  headcountHired?: number;
  @IsOptional() @IsDateString() applyStart?: string;
  @IsOptional() @IsDateString() applyEnd?: string;
}
