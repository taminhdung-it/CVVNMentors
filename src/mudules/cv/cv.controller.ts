// src/modules/cv/cv.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipeBuilder,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CvService } from './cv.service';
import { CreateCvDto, } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { UpdateCvStatusDto } from './dto/update-cv-status.dto';
import { FilterCvDto } from "./dto/filter-cv.dto";
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  //upload n file & dùng ai để lấy thông tin
  @UseGuards(AuthGuard)
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadCvs(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(pdf|msword|wordprocessingml)/,
        }) // Chỉ nhận file văn bản
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    files: Express.Multer.File[],
    @Req() req,
  ) {
    const userId = req.user?.uid || null;
    return this.cvService.processAndSaveCvs(files, userId);
  }

  //tạo thủ công
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createCvDto: CreateCvDto,
         @Req() req,
  ) {
    const userId = req.user?.uid || null;
    return this.cvService.create(createCvDto, userId);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() filter: FilterCvDto) {
    return this.cvService.findAll(filter);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cvService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCvDto: UpdateCvDto) {
    return this.cvService.update(id, updateCvDto);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateCvStatusDto) {
    return this.cvService.updateStatus(id, dto);
  }
}