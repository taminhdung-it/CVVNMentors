import { IsNotEmpty, IsString } from 'class-validator';

export class CloseJobDto {
    @IsNotEmpty()
    @IsString()
    reason: string;
    
    @IsNotEmpty()
    refreshtoken: string;
}