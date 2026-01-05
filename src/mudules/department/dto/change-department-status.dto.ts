import { IsEnum, IsNotEmpty } from 'class-validator';
import { DepartmentStatus } from '../../../entities/department.entity';

export class ChangeDepartmentStatusDto {
    @IsNotEmpty()
    @IsEnum(DepartmentStatus)
    status: DepartmentStatus;}