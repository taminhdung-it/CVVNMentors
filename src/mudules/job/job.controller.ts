import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { JobService } from './job.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { SearchJobDto } from './dto/search-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CloseJobDto } from './dto/close-job.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(@Body() dto: CreateJobDto, @Req() req, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user?.uid || 'hr_admin';
    return this.jobService.create(dto, userId, file);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.jobService.findAll(pagination);
  }

  @UseGuards(AuthGuard)
  @Get('search')
  search(@Query() filter: SearchJobDto) {
    return this.jobService.search(filter);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(@Param('id') id: string, @Body() dto: UpdateJobDto,  @UploadedFile() file: Express.Multer.File) {
    return this.jobService.update(id, dto, file);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/close')
  closeJob(@Param('id') id: string, @Body() dto: CloseJobDto) {
    return this.jobService.closeJob(id, dto);
  }

  @Patch(':id/open')
  openJob(@Param('id') id: string) {
    return this.jobService.openJob(id);
  }

  @Patch(':id/lock')
  lockJob(@Param('id') id: string) {
    return this.jobService.lockJob(id);
  }
}
