import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';

import { ExperienceDto } from './experience.dto';

export class UpdateCvDto {
  @IsOptional()
  @IsString()
  fullName?: string;
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber('VN')
  phone?: string;
  @IsOptional()
  @IsString()
  position?: string;
  @IsOptional()
  @IsString()
  level?: string;
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
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
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
