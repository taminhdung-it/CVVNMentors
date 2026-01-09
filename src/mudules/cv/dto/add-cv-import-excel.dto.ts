import { IsEmail, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class Addcvimportexcel{
    @IsOptional()
    @IsString()
    fullName:string

    @IsOptional()
    @IsString()
    position:string

    @IsOptional()
    @IsString()
    level:string
    
    @IsOptional()
    @IsString()
    experience:string
    
    @IsOptional()
    @IsString()
    @IsPhoneNumber("VN")
    phone:string
    
    @IsOptional()
    @IsString()
    @IsEmail()
    email:string

}