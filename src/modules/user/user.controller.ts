import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ChangeUserStatusDto } from './dto/change-user-status.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.userService.findAll(pagination);
  }


  @UseGuards(AuthGuard)
  @Get('search')
  search(@Query() filter: FilterUserDto) {
    return this.userService.search(filter);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: ChangeUserStatusDto
  ) {
    return this.userService.updateStatus(id, dto);
  }
}