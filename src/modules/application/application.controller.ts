import {
  Controller,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Get,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import {AuthGuard} from "../auth/guards/auth.guard";
import { UpdateApplicationDetailsDto } from './dto/update-application.dto';
import { FilterApplicationDto } from './dto/filter-application.dto';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly appService: ApplicationService) {}
    @UseGuards(AuthGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateApplicationStatusDto) {
    return this.appService.updateStatus(id, dto);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  updateDetails(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDetailsDto,
  ) {
    return this.appService.updateDetails(id, dto);
  }

  @UseGuards(AuthGuard)
  @Get('job/:jobId')
  findAllByJob(
    @Param('jobId') jobId: string,
    @Query() filter: FilterApplicationDto,
  ) {
    return this.appService.findAllByJob(jobId, filter);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appService.findOne(id);
  }

  /**
   * Xem lịch sử ứng tuyển của một CV
   * GET /applications/cv/:cvId
   */
  @UseGuards(AuthGuard)
  @Get('cv/:cvId')
  findAllByCv(
    @Param('cvId') cvId: string,
    @Query() filter: FilterApplicationDto,
  ) {
    return this.appService.findAllByCv(cvId, filter);
  }
}