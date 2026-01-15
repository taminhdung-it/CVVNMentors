import { IsObject, IsString } from 'class-validator';

export class UpdateRoleGroupDto {
  @IsString()
  groupName: string;

  @IsObject()
  data: {
    [itemName: string]: {
      [permissionName: string]: 0 | 1;
    };
  };
}
