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
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { SearchDepartmentDto } from './dto/search-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ChangeDepartmentStatusDto } from './dto/change-department-status.dto';

@Controller('departments')
export class DepartmentController {
  constructor(private readonly deptService: DepartmentService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreateDepartmentDto, @Req() req) {
    const userId = req.user?.uid || 'admin_test'; // Giả lập user id
    return this.deptService.create(dto, userId);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.deptService.findAll(pagination);
  }

  @UseGuards(AuthGuard)
  @Get('search')
  search(@Query() filter: SearchDepartmentDto) {
    return this.deptService.search(filter);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deptService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.deptService.update(id, dto);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeDepartmentStatusDto,
  ) {
    return this.deptService.changeStatus(id, dto);
  }
  
}