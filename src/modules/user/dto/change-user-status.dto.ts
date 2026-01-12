import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatus } from '../../../entities/user.entity';

export class ChangeUserStatusDto {
    @IsNotEmpty()
    @IsEnum(UserStatus, { message: 'Trạng thái phải là ACTIVE hoặc INACTIVE' })
    status: string;
}