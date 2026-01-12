import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto'; // Sử dụng lại pagination chung
import { UserStatus } from '../../../entities/user.entity';

export class FilterUserDto extends PaginationDto {
    @IsOptional() @IsString() keyword?: string; // Tìm theo Tên
    @IsOptional() @IsString() email?: string;   // Tìm chính xác Email
    @IsOptional() @IsString() phone?: string;   // Tìm chính xác SĐT

    @IsOptional() @IsEnum(UserStatus) status?: string;
    @IsOptional() @IsString() departmentId?: string;
    @IsOptional() @IsString() role?: string;
}