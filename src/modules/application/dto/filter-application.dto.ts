import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ApplicationStatus } from '../../../entities/application.entity';

export class FilterApplicationDto extends PaginationDto {
    @IsOptional()
    @IsEnum(ApplicationStatus)
    status?: ApplicationStatus;
}