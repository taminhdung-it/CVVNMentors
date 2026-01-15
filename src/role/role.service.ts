import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UpdateRoleGroupDto } from './dto/update-role-group.dto';
import * as admin from 'firebase-admin';
@Injectable()
export class RoleService {
    constructor(private readonly firebaseService: FirebaseService,
    ) { }
async get() {
  const result: any = {
    role: {}
  };

  const groupSnap = await this.firebaseService.firestore
    .collection("role")
    .get();

  for (const groupDoc of groupSnap.docs) {
    const groupName = groupDoc.id;
    result.role[groupName] = {};

    const itemCollections = await groupDoc.ref.listCollections();

    for (const itemCol of itemCollections) {
      const itemName = itemCol.id;
      result.role[groupName][itemName] = {};

      const permissionSnap = await itemCol.get();

      for (const permissionDoc of permissionSnap.docs) {
        const permissionName = permissionDoc.id;
        const active = permissionDoc.data()?.active ?? 0;

        result.role[groupName][itemName][permissionName] = active;
      }
    }
  }

  return result;
}

async createRoleGroup(groupName: string) {
  if (!groupName && groupName !== "") {
    throw new Error("groupName không hợp lệ");
  }

  const firestore = this.firebaseService.firestore;

  const roleStructure: Record<string, string[]> = {
    account: ["logout"],
    application: ["changestatus", "edit", "get", "getone"],
    cv: [
      "addcv",
      "addexcel",
      "assign",
      "changestatus",
      "edit",
      "get",
      "getone",
      "readexcel",
      "readpdfdoc",
    ],
    department: ["add", "changestatus", "edit", "get", "getone", "search"],
    job: ["add", "close", "edit", "get", "getone", "lock", "open", "search"],
    role: ["add", "delete", "edit", "get"],
    user: ["add", "changestatus", "edit", "get", "getone", "search"],
  };

  const groupRef = firestore.collection("role").doc(groupName);
  await groupRef.set({}, { merge: true });

  for (const itemName of Object.keys(roleStructure)) {
    for (const permission of roleStructure[itemName]) {
      await groupRef
        .collection(itemName)
        .doc(permission)
        .set({
          active: 0, // ❗ mặc định tắt
        });
    }
  }

  return {
    message: "Tạo nhóm role thành công",
    groupName,
  };
}

async updateRoleGroup(dto: UpdateRoleGroupDto) {
  const { groupName, data } = dto;

  // ===== VALIDATE =====
  if (!groupName) {
    throw new Error('groupName không hợp lệ');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('data không hợp lệ');
  }

  const firestore = this.firebaseService.firestore;
  const groupRef = firestore.collection('role').doc(groupName);
  const batch = firestore.batch();

  // ===== DUYỆT ITEM =====
  for (const itemName of Object.keys(data)) {
    const permissions = data[itemName];

    if (!permissions || typeof permissions !== 'object') continue;

    // ===== DUYỆT PERMISSION =====
    for (const permissionName of Object.keys(permissions)) {
      const active = permissions[permissionName];

      if (active !== 0 && active !== 1) continue;

      const permissionRef = groupRef
        .collection(itemName)
        .doc(permissionName);

      batch.set(
        permissionRef,
        { active },
        { merge: true }
      );
    }
  }

  await batch.commit();

  return {
    message: 'Cập nhật quyền cho nhóm thành công',
    groupName,
  };
}


}
