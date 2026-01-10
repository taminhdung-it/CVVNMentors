import { IsOptional, IsString, IsNumber, Min, Max, IsDateString } from 'class-validator';

export class UpdateApplicationDetailsDto {
    @IsOptional()
    @IsDateString()
    interviewScheduled?: string;

    @IsOptional()
    @IsString()
    feedback?: string;

    @IsOptional()
    @IsNumber()
    @Min(1) @Max(5)
    rating?: number;

    @IsOptional()
    @IsString()
    rejectionReason?: string;
}