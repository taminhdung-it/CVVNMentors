import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateJobDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() skills?: string[];
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
