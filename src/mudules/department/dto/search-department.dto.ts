import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from "../../../common/dto/pagination.dto";
import { DepartmentStatus } from "../../../entities/department.entity";

export class SearchDepartmentDto extends PaginationDto {
    @IsOptional()
    @IsString()
    keyword?: string; // Tìm theo tên

    @IsOptional()
    @IsEnum(DepartmentStatus)
    status?: DepartmentStatus;

}