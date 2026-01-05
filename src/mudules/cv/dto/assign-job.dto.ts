import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AssignJobDto {
    @IsNotEmpty()
    @IsString()
    jobId: string;

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    cvIds: string[]; //gán nhiều CV cùng lúc
}