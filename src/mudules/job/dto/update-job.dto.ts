
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateJobDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() skills?: string[];
  @IsOptional() @IsNumber() headcountTarget?: number;
  @IsOptional() @IsDateString() applyEnd?: string;
}