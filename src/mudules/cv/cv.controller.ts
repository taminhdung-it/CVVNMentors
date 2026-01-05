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
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CvService } from './cv.service';
import { CreateCvDto, } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { UpdateCvStatusDto } from './dto/update-cv-status.dto';
import { PaginationDto } from "../../common/dto/pagination.dto";
import { AuthGuard } from '../auth/guards/auth.guard';
import { AssignJobDto } from './dto/assign-job.dto';
import express from 'express';
@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) { }

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
  findAll(@Query() filter: PaginationDto) {
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

  @UseGuards(AuthGuard)
  @Post('assign-job')
  assignJob(@Body() dto: AssignJobDto) {
    return this.cvService.assignJob(dto);
  }

  @UseGuards(AuthGuard)
  @Post("Readcvexcel")
  @UseInterceptors(FileInterceptor('file'))
  async read(@UploadedFile() file: Express.Multer.File, @Res() res: express.Response) {
    const data = await this.cvService.Readexcel(file);
    res.status(HttpStatus.OK).json({ sheetName: data.sheetName, data: data.list_cv })
  }
}