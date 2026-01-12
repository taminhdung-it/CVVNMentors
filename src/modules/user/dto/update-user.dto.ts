import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
@IsString()
name: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsDateString()
  dob: string;

  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsString()
  departmentId: string;}
