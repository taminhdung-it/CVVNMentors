import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
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
  @Type(() => ExperienceDto) // Chuyển đổi JSON object thành instance ExperienceDto
  experience?: ExperienceDto[];

    @IsNotEmpty()
    refreshtoken: string;
}