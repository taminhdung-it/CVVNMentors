// models/role.model.ts
export interface RolePermissions {
  [key: string]: {
    [action: string]: number; // 0 = không có quyền, 1 = có quyền
  };
}

export interface RoleApiResponse {
  role: {
    [roleName: string]: RolePermissions;
  };
  links: any;
}

export interface RoleEditRequest {
  groupName: string;
  data: RolePermissions;
}

export interface RoleAddRequest {
  name: string;
}

// Model hiển thị trong UI
export interface Role {
  id: string;
  name: string;
  employeeCount: number;
}

// Permission structure cho UI
export interface Permission {
  id: string;
  name: string;
  module: string; // account, application, cv, etc.
  action: string; // logout, edit, get, etc.
  checked: boolean;
}

export interface PermissionGroup {
  id: string;
  name: string;
  module: string; // Tên module trong API (account, cv, user, etc.)
  permissions: Permission[];
  allChecked: boolean;
  indeterminate: boolean;
}