import { IsEnum, IsNotEmpty } from 'class-validator';
import { CvStatus } from '../../../entities/cv.entity';

export class UpdateCvStatusDto {
  @IsNotEmpty()
  @IsEnum(CvStatus)
  status: CvStatus;
}