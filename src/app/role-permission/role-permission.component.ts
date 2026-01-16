// role-permission.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from '../services/employee.service';
import { PermissionGroup, Permission, RolePermissions } from '../models/role.model';

@Component({
  selector: 'app-role-permission',
  templateUrl: './role-permission.component.html',
  styleUrls: ['./role-permission.component.css']
})
export class RolePermissionComponent implements OnInit {
  roleId: string = '';
  roleName: string = '';
  loading = false;
  saving = false;

  permissionGroups: PermissionGroup[] = [];

  // Mapping tên module sang tiếng Việt
  private moduleNameMap: { [key: string]: string } = {
    'account': 'Quản lý tài khoản',
    'application': 'Quản lý ứng dụng',
    'cv': 'Quản lý CV',
    'department': 'Quản lý phòng ban',
    'job': 'Quản lý công việc',
    'role': 'Quản lý vai trò',
    'user': 'Quản lý người dùng'
  };

  // Mapping tên action sang tiếng Việt
  private actionNameMap: { [key: string]: string } = {
    'logout': 'Đăng xuất',
    'changestatus': 'Thay đổi trạng thái',
    'edit': 'Chỉnh sửa',
    'get': 'Xem danh sách',
    'getone': 'Xem chi tiết',
    'add': 'Thêm mới',
    'addcv': 'Thêm CV',
    'addexcel': 'Thêm từ Excel',
    'assign': 'Phân công',
    'readexcel': 'Đọc Excel',
    'readpdfdoc': 'Đọc PDF/DOC',
    'search': 'Tìm kiếm',
    'delete': 'Xóa',
    'close': 'Đóng',
    'lock': 'Khóa',
    'open': 'Mở'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.roleId = params['id'];
      this.loadRolePermissions();
    });
  }

  loadRolePermissions(): void {
    this.loading = true;
    
    this.employeeService.getRolePermissions(this.roleId).subscribe({
      next: (permissions) => {
        this.roleName = this.formatRoleName(this.roleId);
        this.permissionGroups = this.transformPermissionsToGroups(permissions);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading role permissions:', err);
        this.loading = false;
        this.snackBar.open('Không thể tải quyền của vai trò', 'Đóng', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  transformPermissionsToGroups(permissions: RolePermissions): PermissionGroup[] {
    const groups: PermissionGroup[] = [];
    let groupIndex = 0;

    Object.keys(permissions).forEach(moduleName => {
      const modulePermissions = permissions[moduleName];
      const permissionList: Permission[] = [];

      Object.keys(modulePermissions).forEach(action => {
        permissionList.push({
          id: `${moduleName}-${action}`,
          name: this.actionNameMap[action] || action,
          module: moduleName,
          action: action,
          checked: modulePermissions[action] === 1
        });
      });

      const group: PermissionGroup = {
        id: (groupIndex++).toString(),
        name: this.moduleNameMap[moduleName] || moduleName,
        module: moduleName,
        permissions: permissionList,
        allChecked: false,
        indeterminate: false
      };

      this.updateGroupState(group);
      groups.push(group);
    });

    return groups;
  }

  transformGroupsToPermissions(): RolePermissions {
    const permissions: RolePermissions = {};

    this.permissionGroups.forEach(group => {
      permissions[group.module] = {};
      
      group.permissions.forEach(permission => {
        permissions[group.module][permission.action] = permission.checked ? 1 : 0;
      });
    });

    return permissions;
  }

  updateGroupState(group: PermissionGroup): void {
    const checkedCount = group.permissions.filter(p => p.checked).length;
    group.allChecked = checkedCount === group.permissions.length;
    group.indeterminate = checkedCount > 0 && checkedCount < group.permissions.length;
  }

  onGroupCheckChange(group: PermissionGroup): void {
    group.permissions.forEach(permission => {
      permission.checked = group.allChecked;
    });
    this.updateGroupState(group);
  }

  onPermissionChange(group: PermissionGroup): void {
    this.updateGroupState(group);
  }

  getCheckedCount(group: PermissionGroup): number {
    return group.permissions.filter(p => p.checked).length;
  }

  getTotalPermissions(group: PermissionGroup): number {
    return group.permissions.length;
  }

  onSave(): void {
    this.saving = true;
    
    const permissions = this.transformGroupsToPermissions();
    
    this.employeeService.updateRolePermissions(this.roleId, permissions).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Lưu quyền thành công!', 'Đóng', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        console.error('Error saving permissions:', err);
        this.saving = false;
        this.snackBar.open('Lưu quyền thất bại!', 'Đóng', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/employees']);
  }

  private formatRoleName(roleId: string): string {
    const roleMap: { [key: string]: string } = {
      'user': 'Người dùng',
      'admin': 'Quản trị viên',
      'accountant': 'Kế toán',
      'customer_service': 'CSKH',
      'cashier': 'Thu ngân',
      'viewer': 'Người xem',
      'default': 'Mặc định'
    };
    
    return roleMap[roleId] || roleId;
  }
}