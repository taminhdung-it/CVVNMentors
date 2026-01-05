import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, IsDateString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

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


  @IsNotEmpty()
  refreshtoken: string;
}
