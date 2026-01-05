import {
  IsArray,
  isEmail,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ExperienceDto } from './experience.dto';

export class UpdateCvDto {
  @IsOptional()
  @IsString()
  fullName?: string;
  @IsOptional()
  @IsString()
  cvType?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber("VN")
  phone?: string;
  @IsOptional()
  @IsString()
  position?: string;
  @IsOptional()
  @IsString()
  level?: string;
  @IsOptional()
  @IsString()
  cvFileUrl?: string;
  @IsOptional()
  @IsArray()
  skills?: string[];
  @IsOptional()
  @IsArray()
  education?: string[];
  @IsOptional()
  @IsNumber()
  experienceYears?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true }) // Validate từng phần tử trong mảng
  @Type(() => ExperienceDto)      // Chuyển đổi JSON object thành instance ExperienceDto
  experience?: ExperienceDto[];
}
