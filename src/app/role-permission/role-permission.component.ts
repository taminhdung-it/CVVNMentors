// role-permission.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Permission {
  id: string;
  name: string;
  checked: boolean;
}

interface PermissionGroup {
  id: string;
  name: string;
  permissions: Permission[];
  allChecked: boolean;
  indeterminate: boolean;
}

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

  permissionGroups: PermissionGroup[] = [
    {
      id: '1',
      name: 'Quản lý khách hàng',
      permissions: [
        { id: '1-1', name: 'Chức năng 1', checked: false },
        { id: '1-2', name: 'Chức năng 2', checked: false },
        { id: '1-3', name: 'Chức năng 3', checked: false },
        { id: '1-4', name: 'Chức năng 4', checked: false },
        { id: '1-5', name: 'Chức năng 5', checked: false },
        { id: '1-6', name: 'Chức năng 6', checked: false },
        { id: '1-7', name: 'Chức năng 7', checked: false },
        { id: '1-8', name: 'Chức năng 8', checked: false }
      ],
      allChecked: false,
      indeterminate: false
    },
    {
      id: '2',
      name: 'Quản lý CV',
      permissions: [
        { id: '2-1', name: 'Chức năng 1', checked: true },
        { id: '2-2', name: 'Chức năng 2', checked: true },
        { id: '2-3', name: 'Chức năng 3', checked: true },
        { id: '2-4', name: 'Chức năng 4', checked: true },
        { id: '2-5', name: 'Chức năng 5', checked: false },
        { id: '2-6', name: 'Chức năng 6', checked: false },
        { id: '2-7', name: 'Chức năng 7', checked: false },
        { id: '2-8', name: 'Chức năng 8', checked: false }
      ],
      allChecked: false,
      indeterminate: true
    },
    {
      id: '3',
      name: 'Quản lý nhân viên',
      permissions: [
        { id: '3-1', name: 'Xem danh sách', checked: false },
        { id: '3-2', name: 'Thêm nhân viên', checked: false },
        { id: '3-3', name: 'Chỉnh sửa nhân viên', checked: false },
        { id: '3-4', name: 'Xóa nhân viên', checked: false }
      ],
      allChecked: false,
      indeterminate: false
    },
    {
      id: '4',
      name: 'Quản lý báo cáo',
      permissions: [
        { id: '4-1', name: 'Xem báo cáo', checked: false },
        { id: '4-2', name: 'Xuất báo cáo', checked: false },
        { id: '4-3', name: 'Tạo báo cáo', checked: false }
      ],
      allChecked: false,
      indeterminate: false
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.roleId = params['id'];
      this.loadRolePermissions();
    });
  }

  loadRolePermissions(): void {
    this.loading = true;
    
    // Giả lập API call
    setTimeout(() => {
      // Mock data - role name
      const roleNames: { [key: string]: string } = {
        '1': 'Chủ cơ sở',
        '2': 'Admin',
        '3': 'Kế toán',
        '4': 'CSKH',
        '5': 'Thu ngân',
        '6': 'Người xem'
      };
      
      this.roleName = roleNames[this.roleId] || 'Admin';
      
      // Update group states
      this.permissionGroups.forEach(group => {
        this.updateGroupState(group);
      });
      
      this.loading = false;
    }, 500);
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
    
    // Collect all checked permissions
    const selectedPermissions = this.permissionGroups.flatMap(group => 
      group.permissions.filter(p => p.checked).map(p => ({
        groupId: group.id,
        groupName: group.name,
        permissionId: p.id,
        permissionName: p.name
      }))
    );
    
    console.log('Saving permissions for role:', this.roleName);
    console.log('Selected permissions:', selectedPermissions);
    
    // Giả lập API call
    setTimeout(() => {
      this.saving = false;
      this.snackBar.open('Lưu quyền thành công!', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
    }, 1000);
  }

  onBack(): void {
    this.router.navigate(['/employees']);
  }
}