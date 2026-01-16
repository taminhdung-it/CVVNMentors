import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, IsDateString, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateJobDto {
  @IsNotEmpty()
  @IsString()
  departmentId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
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
  skills: string[];

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  headcountTarget: number;

  @IsNotEmpty()
  @IsDateString() // YYYY-MM-DD
  applyStart: string;

  @IsNotEmpty()
  @IsDateString()
  applyEnd: string;
}
