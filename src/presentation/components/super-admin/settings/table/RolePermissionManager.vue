<template>
  <div class="rp-container">
    <div class="page-header">
      <div class="title-block">
        <div class="page-title">{{ $t('access.rolePermissions.title') }}</div>
      </div>

      <a-select
        v-model:value="selectedRoleId"
        :placeholder="$t('access.rolePermissions.selectRole')"
        class="role-select"
        :loading="loadingRoles"
        allow-clear
        @change="handleRoleChange"
      >
        <a-select-option v-for="r in roles" :key="r.id" :value="r.id">
          {{ r.roleName }}
        </a-select-option>
      </a-select>

      <a-button type="primary" class="add-btn" :disabled="!selectedRoleId" @click="openAssignModal">
        <template #icon><PlusOutlined /></template>
        {{ $t('access.rolePermissions.assign') }}
      </a-button>
    </div>

    <!-- Desktop: table inside card -->
    <a-card v-if="!isMobile" :bordered="false" class="panel-card">
      <div class="rp-subtitle mb-3">{{ $t('access.rolePermissions.assignedList') }}</div>

      <a-table
        :columns="columns"
        :data-source="assignedPermissions"
        :pagination="false"
        row-key="id"
        size="middle"
        :loading="loadingAssigned"
        :scroll="{ x: 900 }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ index + 1 }}
          </template>
          <template v-else-if="column.key === 'actions'">
            <div class="flex items-center justify-end gap-2">
              <a-popconfirm :title="$t('access.rolePermissions.confirmUnassign')" @confirm="unassign(record.id)">
                <a-button type="text" danger class="icon-action">{{ $t('common.delete') }}</a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Mobile: card collapse list -->
    <div v-else class="rp-mobile">
      <div class="rp-subtitle mb-2">{{ $t('access.rolePermissions.assignedList') }}</div>
      <a-collapse class="rp-collapse" :expand-icon="expandCollapseIcon">
        <a-collapse-panel v-for="p in assignedPermissions" :key="p.id">
          <template #header>
            <div class="card-row">
              <div class="item-info">
                <div class="item-name">{{ p.permissionCode }}</div>
                <div class="item-sub">{{ p.description || '-' }}</div>
              </div>
            </div>
          </template>

          <div class="card-detail">
            <div class="detail-row action-row">
              <a-popconfirm :title="$t('access.rolePermissions.confirmUnassign')" @confirm="unassign(p.id)">
                <a-button danger size="small" class="action-btn">{{ $t('common.delete') }}</a-button>
              </a-popconfirm>
            </div>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </div>

    <a-modal
      :open="assignModalOpen"
      :title="$t('access.rolePermissions.assign')"
      :confirm-loading="loadingAssign"
      width="560px"
      @ok="confirmAssign"
      @cancel="closeAssignModal"
    >
      <a-form layout="vertical">
        <a-form-item :label="$t('access.rolePermissions.permission')">
          <a-select
            v-model:value="selectedPermissionId"
            show-search
            :filter-option="filterPermissionOption"
            :loading="loadingPermissions"
            :placeholder="$t('access.rolePermissions.permission')"
          >
            <a-select-option v-for="p in permissions" :key="p.id" :value="p.id">
              {{ p.permissionCode }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import type { TableColumnsType } from 'ant-design-vue';
import { PlusOutlined, DownOutlined } from '@ant-design/icons-vue';

const expandCollapseIcon = ({ isActive }: { isActive: boolean }) =>
  h(DownOutlined, { class: 'expand-icon', style: { transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)' } });
import { roleRepository } from '@/infrastructure/repositories/role.repository';
import { permissionRepository } from '@/infrastructure/repositories/permission.repository';
import { rolePermissionRepository } from '@/infrastructure/repositories/role-permission.repository';
import type { Role, Permission } from '@/domain/entities/user.entity';
import { handleApiError } from '@/shared/utils/error';
import { useIsMobile } from '@/shared/composables/useIsMobile';

const { t } = useI18n();
const { isMobile } = useIsMobile();

const roles = ref<Role[]>([]);
const permissions = ref<Permission[]>([]);

const loadingRoles = ref(false);
const loadingPermissions = ref(false);
const loadingAssigned = ref(false);
const loadingAssign = ref(false);

const selectedRoleId = ref<number | undefined>(undefined);
const assignedPermissions = ref<Permission[]>([]);

const assignModalOpen = ref(false);
const selectedPermissionId = ref<number | undefined>(undefined);

const columns = computed<TableColumnsType>(() => [
  { title: '#', key: 'index', width: 70 },
  { title: 'Code', dataIndex: 'permissionCode', key: 'permissionCode', width: 260 },
  { title: 'Description', dataIndex: 'description', key: 'description', width: 380 },
  { title: 'Actions', key: 'actions', fixed: 'right' as const, width: 120 },
]);

const loadRoles = async () => {
  loadingRoles.value = true;
  try {
    const res = await roleRepository.getList({ page: 1, limit: 100 });
    roles.value = res.results || [];
  } catch (error) {
    handleApiError(error, t);
  } finally {
    loadingRoles.value = false;
  }
};

const loadPermissions = async () => {
  loadingPermissions.value = true;
  try {
    // backend จำกัด limit ไม่เกิน 100
    const res = await permissionRepository.getList({ page: 1, limit: 100 });
    permissions.value = res.results || [];
  } catch (error) {
    handleApiError(error, t);
  } finally {
    loadingPermissions.value = false;
  }
};

const loadAssigned = async (roleId: number) => {
  loadingAssigned.value = true;
  try {
    const res = await rolePermissionRepository.getByRoleId(roleId);
    assignedPermissions.value = res.results || [];
  } catch (error) {
    handleApiError(error, t);
  } finally {
    loadingAssigned.value = false;
  }
};

const handleRoleChange = async (roleId: number | undefined) => {
  if (!roleId) {
    assignedPermissions.value = [];
    return;
  }
  await loadAssigned(roleId);
};

const openAssignModal = () => {
  selectedPermissionId.value = undefined;
  assignModalOpen.value = true;
};
const closeAssignModal = () => { assignModalOpen.value = false; };

const confirmAssign = async () => {
  if (!selectedRoleId.value || !selectedPermissionId.value) {
    message.error(t('access.validation.required'));
    return;
  }

  loadingAssign.value = true;
  try {
    await rolePermissionRepository.assign({ roleId: selectedRoleId.value, permissionId: selectedPermissionId.value });
    message.success(t('access.rolePermissions.assignSuccess'));
    assignModalOpen.value = false;
    await loadAssigned(selectedRoleId.value);
  } catch (error) {
    handleApiError(error, t);
  } finally {
    loadingAssign.value = false;
  }
};

const unassign = async (permissionId: number) => {
  if (!selectedRoleId.value) return;
  try {
    await rolePermissionRepository.unassign(selectedRoleId.value, permissionId);
    message.success(t('access.rolePermissions.unassignSuccess'));
    await loadAssigned(selectedRoleId.value);
  } catch (error) {
    handleApiError(error, t);
  }
};

const filterPermissionOption = (input: string, option: any) => {
  const label = (option?.children?.toString?.() || '').toLowerCase();
  return label.includes(input.toLowerCase());
};

onMounted(async () => {
  await Promise.allSettled([loadRoles(), loadPermissions()]);
});
</script>

<style scoped>
.rp-container { display: flex; flex-direction: column; gap: 12px; }
.rp-subtitle { font-weight: 600; }

/* ===== Page header ===== */
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}
.title-block { flex: 1 1 auto; min-width: 0; }
.page-title { font-size: 22px; font-weight: 600; color: #0f172a; line-height: 1.25; }
.role-select { width: min(220px, 100%); }
.add-btn { height: 44px; border-radius: 12px; font-weight: 700; flex-shrink: 0; }

/* Mobile: title+button on row 1, select full-width on row 2 */
@media (max-width: 767px) {
  .page-header { flex-wrap: wrap; }
  .title-block { order: 1; flex: 1 1 auto; }
  .add-btn { order: 2; flex-shrink: 0; height: 36px; font-size: 12px; padding: 0 10px; }
  .role-select { order: 3; flex: 1 1 100%; width: 100%; }
  .page-title { font-size: 15px; }
}

/* ===== Desktop card ===== */
.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.icon-action { border-radius: 10px; }
.icon-action:hover { background: rgba(29, 78, 216, 0.08) !important; color: #1d4ed8; }

/* ===== Mobile card list ===== */
.rp-mobile { display: flex; flex-direction: column; }
.rp-collapse { background: transparent !important; border: none !important; }
.rp-collapse :deep(.ant-collapse-item) {
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.06) !important;
  border: 1px solid rgba(148, 163, 184, 0.15) !important;
  overflow: hidden;
  margin-bottom: 10px !important;
}
.rp-collapse :deep(.ant-collapse-header) { padding: 14px 14px !important; align-items: center !important; }
.rp-collapse :deep(.ant-collapse-content) { background: transparent !important; border-top: 1px solid rgba(148, 163, 184, 0.18) !important; }
.rp-collapse :deep(.ant-collapse-content-box) { padding: 0 14px 14px !important; }

.expand-icon { font-size: 13px; color: #94a3b8; transition: transform 260ms ease; }

.card-row { display: flex; align-items: center; gap: 12px; min-width: 0; width: 100%; }
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 14px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-sub { font-size: 12px; color: #64748b; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.card-detail { padding-top: 12px; display: flex; flex-direction: column; gap: 8px; }
.detail-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
.action-row { justify-content: flex-end; gap: 8px; margin-top: 4px; }
.action-btn { border-radius: 8px; font-weight: 600; }
</style>

