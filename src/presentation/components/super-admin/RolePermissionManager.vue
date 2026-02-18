<template>
  <div class="rp-container">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
      <div>
        <div class="text-3xl font-semibold text-slate-900">{{ $t('access.rolePermissions.title') }}</div>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
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

        <a-button type="primary" class="add-btn sm:shrink-0" :disabled="!selectedRoleId" @click="openAssignModal">
          <template #icon><PlusOutlined /></template>
          {{ $t('access.rolePermissions.assign') }}
        </a-button>
      </div>
    </div>

    <a-card :bordered="false" class="panel-card">
      <div class="rp-subtitle mb-3">{{ $t('access.rolePermissions.assignedList') }}</div>

      <a-table
        v-if="!isMobile"
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

      <div v-else class="mobile-list">
        <a-collapse accordion ghost class="mobile-collapse">
          <a-collapse-panel v-for="p in assignedPermissions" :key="p.id">
            <template #header>
              <div class="mobile-header">
                <div class="font-semibold text-slate-900 truncate">{{ p.permissionCode }}</div>
                <div class="text-slate-500 text-sm truncate">{{ p.description || '-' }}</div>
              </div>
            </template>
            <div class="mobile-body">
              <div class="mobile-kv">
                <div class="info-item last">
                  <div class="info-label">Actions</div>
                  <div class="info-actions">
                    <a-popconfirm :title="$t('access.rolePermissions.confirmUnassign')" @confirm="unassign(p.id)">
                      <a-button type="text" danger class="icon-action">{{ $t('common.delete') }}</a-button>
                    </a-popconfirm>
                  </div>
                </div>
              </div>
            </div>
          </a-collapse-panel>
        </a-collapse>
      </div>
    </a-card>

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
import { computed, onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import type { TableColumnsType } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
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
.rp-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rp-subtitle {
  font-weight: 600;
}

.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.add-btn { height: 44px; border-radius: 12px; font-weight: 700; }
.role-select { min-width: 220px; }
.icon-action { border-radius: 10px; }
.icon-action:hover { background: rgba(29, 78, 216, 0.08) !important; color: #1d4ed8; }

@media (max-width: 768px) {
  .role-select {
    width: 100%;
  }
}

.mobile-list { margin-top: 4px; }
.mobile-header { padding-right: 8px; min-width: 0; }
.mobile-body { padding: 8px 4px 4px; }
.mobile-kv { display: grid; gap: 10px; }
.info-item { display: grid; grid-template-columns: 120px 1fr; gap: 10px; align-items: start; }
.info-item.last { grid-template-columns: 120px 1fr; }
.info-label { font-size: 12px; color: #64748b; }
.info-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
</style>

