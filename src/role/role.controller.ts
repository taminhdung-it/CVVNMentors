import { Body, Controller, HttpStatus, Post, Put, Res, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import express from 'express';
import { UpdateRoleGroupDto } from './dto/update-role-group.dto';
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }
  @UseGuards(AuthGuard)
  @Post('get')
  async get_role(@Res() res: express.Response) {
    const data = await this.roleService.get();
    return res.status(HttpStatus.OK).json(data);
  }

  @UseGuards(AuthGuard)
  @Post('add')
  async createGroup(
    @Body('name') name: string,
    @Res() res: express.Response,
  ) {
    try {
      const result = await this.roleService.createRoleGroup(name);
      return res.status(HttpStatus.OK).json(result);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Thêm nhóm role thất bại',
        error: e.message ?? e,
      });
    }
  }

  @UseGuards(AuthGuard)
  @Put('edit')
  async updateGroup(
    @Body() dto: UpdateRoleGroupDto,
    @Res() res: express.Response,
  ) {
    try {
      const result = await this.roleService.updateRoleGroup(dto);
      return res.status(HttpStatus.OK).json(result);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Cập nhật quyền thất bại',
        error: e.message ?? e,
      });
    }
  }
}
