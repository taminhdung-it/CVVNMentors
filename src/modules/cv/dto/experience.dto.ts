import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ExperienceDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  dates: string;

  @IsOptional()
  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  organization: string;

}