import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
//để sử dụng cho phân trang
export class FilterCvDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1; // Mặc định trang 1

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10; // Mặc định 10 item/trang

}