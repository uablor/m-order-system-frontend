<template>
  <div class="settings-content">
    <a-tabs>
      <a-tab-pane key="roles" :tab="$t('access.roles.title')">
        <RoleTable
          :roles="roles"
          :loading="rolesLoading"
          :pagination="rolesPagination"
          @create="openCreateRole"
          @edit="openEditRole"
          @delete="confirmDeleteRole"
          @page-change="handleRolesPageChange"
        />

        <RoleFormModal
          :open="roleModalOpen"
          :loading="rolesLoading"
          :mode="roleModalMode"
          :initial-role="editingRole"
          @submit="submitRoleForm"
          @cancel="closeRoleModal"
        />
      </a-tab-pane>

      <a-tab-pane key="permissions" :tab="$t('access.permissions.title')">
        <PermissionTable
          :permissions="permissions"
          :loading="permissionsLoading"
          :pagination="permissionsPagination"
          @create="openCreatePermission"
          @generate="handleGeneratePermissions"
          @edit="openEditPermission"
          @delete="confirmDeletePermission"
          @page-change="handlePermissionsPageChange"
        />

        <PermissionFormModal
          :open="permissionModalOpen"
          :loading="permissionsLoading"
          :mode="permissionModalMode"
          :initial-permission="editingPermission"
          @submit="submitPermissionForm"
          @cancel="closePermissionModal"
        />
      </a-tab-pane>

      <a-tab-pane key="role-permissions" :tab="$t('access.rolePermissions.title')">
        <RolePermissionManager />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Role, Permission } from '@/domain/entities/user.entity';
import type { RoleCreateDto, RoleUpdateDto } from '@/application/dto/role.dto';
import type { PermissionCreateDto, PermissionUpdateDto } from '@/application/dto/permission.dto';
import RoleTable from '@/presentation/components/super-admin/settings/table/RoleTable.vue';
import RoleFormModal from '@/presentation/components/super-admin/settings/modal/RoleFormModal.vue';
import PermissionTable from '@/presentation/components/super-admin/settings/table/PermissionTable.vue';
import PermissionFormModal from '@/presentation/components/super-admin/settings/modal/PermissionFormModal.vue';
import RolePermissionManager from '@/presentation/components/super-admin/settings/table/RolePermissionManager.vue';
import { useSuperAdminRolesCrud } from '@/presentation/composables/super-admin/useSuperAdminRolesCrud';
import { useSuperAdminPermissions } from '@/presentation/composables/super-admin/useSuperAdminPermissions';

const {
  loading: rolesLoading,
  roles,
  pagination: rolesPagination,
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  changePage: changeRolesPage,
} = useSuperAdminRolesCrud();

const {
  loading: permissionsLoading,
  permissions,
  pagination: permissionsPagination,
  fetchPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  generatePermissions,
  changePage: changePermissionsPage,
} = useSuperAdminPermissions();

// Role modal state
const roleModalOpen = ref(false);
const roleModalMode = ref<'create' | 'edit'>('create');
const editingRole = ref<Role | null>(null);

const openCreateRole = () => {
  roleModalMode.value = 'create';
  editingRole.value = null;
  roleModalOpen.value = true;
};
const openEditRole = (role: Role) => {
  roleModalMode.value = 'edit';
  editingRole.value = role;
  roleModalOpen.value = true;
};
const closeRoleModal = () => { roleModalOpen.value = false; };

const submitRoleForm = async (payload: RoleCreateDto | RoleUpdateDto) => {
  if (roleModalMode.value === 'edit' && editingRole.value) {
    const ok = await updateRole(editingRole.value.id, payload as RoleUpdateDto);
    if (ok) closeRoleModal();
    return;
  }
  const ok = await createRole(payload as RoleCreateDto);
  if (ok) closeRoleModal();
};

const confirmDeleteRole = async (role: Role) => {
  await deleteRole(role.id);
};

const handleRolesPageChange = async (page: number, pageSize: number) => {
  await changeRolesPage(page, pageSize);
};

// Permission modal state
const permissionModalOpen = ref(false);
const permissionModalMode = ref<'create' | 'edit'>('create');
const editingPermission = ref<Permission | null>(null);

const openCreatePermission = () => {
  permissionModalMode.value = 'create';
  editingPermission.value = null;
  permissionModalOpen.value = true;
};
const openEditPermission = (permission: Permission) => {
  permissionModalMode.value = 'edit';
  editingPermission.value = permission;
  permissionModalOpen.value = true;
};
const closePermissionModal = () => { permissionModalOpen.value = false; };

const submitPermissionForm = async (payload: PermissionCreateDto | PermissionUpdateDto) => {
  if (permissionModalMode.value === 'edit' && editingPermission.value) {
    const ok = await updatePermission(editingPermission.value.id, payload as PermissionUpdateDto);
    if (ok) closePermissionModal();
    return;
  }
  const ok = await createPermission(payload as PermissionCreateDto);
  if (ok) closePermissionModal();
};

const confirmDeletePermission = async (permission: Permission) => {
  await deletePermission(permission.id);
};

const handlePermissionsPageChange = async (page: number, pageSize: number) => {
  await changePermissionsPage(page, pageSize);
};

const handleGeneratePermissions = async () => {
  await generatePermissions();
};

onMounted(async () => {
  await Promise.allSettled([fetchRoles(), fetchPermissions()]);
});
</script>

<style scoped>
.settings-content :deep(.ant-tabs-nav) {
  margin-bottom: 16px;
}
</style>
