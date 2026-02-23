<template>
  <div class="merchant-users-page">
    <div class="page-header">
      <div class="title-block">
        <div class="page-title">{{ $t('merchant.teamMembers.title') }}</div>
        <div class="page-subtitle">{{ $t('merchant.teamMembers.subtitle') }}</div>
      </div>

      <a-input
        v-model:value="filters.search"
        allow-clear
        class="search-input"
        :placeholder="$t('merchant.teamMembers.searchPlaceholder')"
        @pressEnter="triggerSearch"
      >
        <template #prefix><SearchOutlined /></template>
      </a-input>

      <a-button
        v-if="isMobile"
        type="default"
        class="filter-toggle-btn"
        :class="{ active: showFilters }"
        @click="showFilters = !showFilters"
      >
        <FilterOutlined />
      </a-button>

      <a-button type="primary" class="add-btn" @click="showCreateModal = true">
        <template #icon><UserAddOutlined /></template>
        {{ $t('merchant.teamMembers.addUser') }}
      </a-button>
    </div>

    <!-- Filter Panel -->
    <a-card
      v-if="!isMobile || showFilters"
      :bordered="false"
      class="filter-card mb-4"
    >
      <div class="filter-bar">
        <a-select
          v-model:value="filters.isActive"
          allow-clear
          class="filter-select"
          :placeholder="$t('merchant.teamMembers.statusFilter')"
          @change="onFilterChange"
        >
          <a-select-option :value="true">{{ $t('merchant.teamMembers.statusActive') }}</a-select-option>
          <a-select-option :value="false">{{ $t('merchant.teamMembers.statusInactive') }}</a-select-option>
        </a-select>

        <a-date-picker
          v-model:value="startDate"
          class="filter-date-single"
          :placeholder="$t('merchant.teamMembers.startDate')"
          :popup-class-name="'blue-picker-popup'"
          @change="onFilterChange"
        />
        <a-date-picker
          v-model:value="endDate"
          class="filter-date-single"
          :placeholder="$t('merchant.teamMembers.endDate')"
          :popup-class-name="'blue-picker-popup'"
          @change="onFilterChange"
        />
      </div>
    </a-card>

    <!-- Summary Cards -->
    <div class="summary-grid mb-4">
      <div class="summary-card">
        <div class="summary-icon total-icon"><TeamOutlined /></div>
        <div class="summary-body">
          <div class="summary-label">{{ $t('merchant.teamMembers.summaryTotalUsers') }}</div>
          <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ summary.totalUsers }}</template><div class="summary-value num-truncate">{{ truncNum(summary.totalUsers) }}</div></a-tooltip>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon active-icon"><UserOutlined /></div>
        <div class="summary-body">
          <div class="summary-label">{{ $t('merchant.teamMembers.summaryActive') }}</div>
          <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ summary.totalActive }}</template><div class="summary-value num-truncate">{{ truncNum(summary.totalActive) }}</div></a-tooltip>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon inactive-icon"><StopOutlined /></div>
        <div class="summary-body">
          <div class="summary-label">{{ $t('merchant.teamMembers.summaryInactive') }}</div>
          <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ summary.totalInactive }}</template><div class="summary-value num-truncate">{{ truncNum(summary.totalInactive) }}</div></a-tooltip>
        </div>
      </div>
    </div>

    <!-- Desktop: table inside card -->
    <a-card v-if="!isMobile" :bordered="false" class="panel-card">
      <a-table
        :columns="columns"
        :data-source="users"
        :pagination="paginationConfig"
        row-key="id"
        size="middle"
        :loading="loading"
        :scroll="{ x: 1000 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'fullName'">
            <div class="user-name-cell">
              <a-avatar :size="32" :style="{ backgroundColor: avatarColor(record.id) }">
                {{ avatarText(record.fullName) }}
              </a-avatar>
              <span class="user-name-text">{{ record.fullName }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'roleName'">
            <a-tag color="blue" class="pill-tag">{{ record.roleName || '-' }}</a-tag>
          </template>
          <template v-else-if="column.key === 'isActive'">
            <a-tag
              :color="record.isActive ? 'success' : 'default'"
              class="status-toggle"
              @click="toggleActive(record)"
            >
              {{ record.isActive ? $t('merchant.teamMembers.statusActive') : $t('merchant.teamMembers.statusInactive') }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'lastLogin'">
            {{ record.lastLogin ? formatDate(record.lastLogin) : '-' }}
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'actions'">
            <div class="flex items-center justify-end gap-2">
              <a-popconfirm :title="$t('merchant.teamMembers.confirmDelete')" @confirm="handleDelete(record.id)">
                <a-button type="text" danger class="icon-action"><DeleteOutlined /></a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Mobile: collapse cards -->
    <div v-else class="users-mobile">
      <a-spin :spinning="loading">
        <a-empty v-if="users.length === 0 && !loading" :description="$t('merchant.teamMembers.noUsers')" />

        <a-collapse accordion ghost class="users-collapse">
          <template #expandIcon="{ isActive }">
            <DownOutlined class="expand-icon" :class="{ rotated: isActive }" />
          </template>

          <a-collapse-panel v-for="u in users" :key="u.id" class="user-panel">
            <template #header>
              <div class="card-row">
                <div class="avatar-wrap">
                  <a-avatar class="user-avatar" :size="48" :style="{ backgroundColor: avatarColor(u.id) }">
                    {{ avatarText(u.fullName) }}
                  </a-avatar>
                  <span v-if="u.isActive" class="active-dot" />
                </div>
                <div class="user-info">
                  <div class="user-name">{{ u.fullName || '-' }}</div>
                  <div class="user-email">{{ u.email }}</div>
                </div>
                <div class="status-side">
                  <a-tag :color="u.isActive ? 'success' : 'default'" class="status-tag">
                    {{ u.isActive ? $t('merchant.teamMembers.statusActive') : $t('merchant.teamMembers.statusInactive') }}
                  </a-tag>
                </div>
              </div>
            </template>

            <div class="card-detail">
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.teamMembers.colRole') }}</span>
                <a-tag color="blue" class="pill-tag">{{ u.roleName || '-' }}</a-tag>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.teamMembers.colLastLogin') }}</span>
                <span class="detail-val">{{ u.lastLogin ? formatDate(u.lastLogin) : '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.teamMembers.colCreatedAt') }}</span>
                <span class="detail-val">{{ formatDate(u.createdAt) }}</span>
              </div>
              <div class="detail-row border-none pt-2">
                <a-popconfirm :title="$t('merchant.teamMembers.confirmDelete')" @confirm="handleDelete(u.id)">
                  <a-button type="text" danger size="small" class="delete-btn">
                    <DeleteOutlined /> {{ $t('common.delete') }}
                  </a-button>
                </a-popconfirm>
              </div>
            </div>
          </a-collapse-panel>
        </a-collapse>

        <div v-if="users.length > 0" class="pagination-row">
          <a-pagination
            v-model:current="currentPage"
            v-model:pageSize="pageSize"
            :total="total"
            simple
            @change="onPageChange"
          />
        </div>
      </a-spin>
    </div>

    <!-- Create User Modal -->
    <a-modal
      v-model:open="showCreateModal"
      :title="$t('merchant.teamMembers.createTitle')"
      :ok-text="$t('merchant.teamMembers.createSubmit')"
      :cancel-text="$t('merchant.teamMembers.createCancel')"
      :confirm-loading="creating"
      :mask-closable="false"
      destroy-on-close
      @ok="handleCreate"
    >
      <a-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        layout="vertical"
        class="create-form"
      >
        <a-form-item :label="$t('merchant.teamMembers.fieldFullName')" name="fullName">
          <a-input
            v-model:value="createForm.fullName"
            :placeholder="$t('merchant.teamMembers.fieldFullNamePlaceholder')"
          />
        </a-form-item>

        <a-form-item :label="$t('merchant.teamMembers.fieldEmail')" name="email">
          <a-input
            v-model:value="createForm.email"
            :placeholder="$t('merchant.teamMembers.fieldEmailPlaceholder')"
          />
        </a-form-item>

        <a-form-item :label="$t('merchant.teamMembers.fieldPassword')" name="password">
          <a-input-password
            v-model:value="createForm.password"
            :placeholder="$t('merchant.teamMembers.fieldPasswordPlaceholder')"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import type { FormInstance, TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import type { Rule } from 'ant-design-vue/es/form';
import {
  SearchOutlined,
  UserAddOutlined,
  DeleteOutlined,
  FilterOutlined,
  DownOutlined,
  TeamOutlined,
  UserOutlined,
  StopOutlined,
} from '@ant-design/icons-vue';
import { userRepository } from '@/infrastructure/repositories/user.repository';
import type { User } from '@/domain/entities/user.entity';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import { handleApiError } from '@/shared/utils/error';

const { t } = useI18n();
const { isMobile } = useIsMobile();

const loading = ref(false);
const users = ref<User[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const startDate = ref<Dayjs | null>(null);
const endDate = ref<Dayjs | null>(null);
const showFilters = ref(false);

const summary = ref({
  totalUsers: 0,
  totalActive: 0,
  totalInactive: 0,
});

const filters = reactive<{
  search: string;
  isActive: boolean | undefined;
}>({
  search: '',
  isActive: undefined,
});

const showCreateModal = ref(false);
const creating = ref(false);
const createFormRef = ref<FormInstance>();
const createForm = reactive({
  email: '',
  password: '',
  fullName: '',
});

const createRules = computed<Record<string, Rule[]>>(() => ({
  fullName: [{ required: true, message: t('merchant.teamMembers.validationFullName'), trigger: 'blur' }],
  email: [
    { required: true, message: t('merchant.teamMembers.validationEmail'), trigger: 'blur' },
    { type: 'email', message: t('merchant.teamMembers.validationEmailFormat'), trigger: 'blur' },
  ],
  password: [
    { required: true, message: t('merchant.teamMembers.validationPassword'), trigger: 'blur' },
    { min: 6, message: t('merchant.teamMembers.validationPasswordMin'), trigger: 'blur' },
  ],
}));

const AVATAR_COLORS = ['#2563eb', '#f97316', '#ec4899', '#22c55e', '#a855f7', '#06b6d4', '#ef4444', '#8b5cf6'];
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const avatarText = (name: string) =>
  (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const columns = computed<TableColumnsType>(() => [
  { title: t('merchant.teamMembers.colFullName'), key: 'fullName', dataIndex: 'fullName', width: 220 },
  { title: t('merchant.teamMembers.colEmail'), key: 'email', dataIndex: 'email', width: 260 },
  { title: t('merchant.teamMembers.colRole'), key: 'roleName', dataIndex: 'roleName', width: 130, align: 'center' as const },
  { title: t('merchant.teamMembers.colStatus'), key: 'isActive', dataIndex: 'isActive', width: 120, align: 'center' as const },
  { title: t('merchant.teamMembers.colLastLogin'), key: 'lastLogin', dataIndex: 'lastLogin', width: 160 },
  { title: t('merchant.teamMembers.colCreatedAt'), key: 'createdAt', dataIndex: 'createdAt', width: 160 },
  { title: t('merchant.teamMembers.colActions'), key: 'actions', fixed: 'right' as const, width: 80, align: 'right' as const },
]);

const paginationConfig = computed(() => ({
  current: currentPage.value,
  pageSize: pageSize.value,
  total: total.value,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
}));

const handleTableChange = (p: TablePaginationConfig) => {
  if (p.current && p.pageSize) {
    currentPage.value = p.current;
    pageSize.value = p.pageSize;
    fetchUsers();
  }
};

const truncNum = (val: string | number, maxLen = 12) => {
  const formatted = Number(val || 0).toLocaleString();
  return formatted.length > maxLen ? formatted.slice(0, maxLen) + '…' : formatted;
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

const onFilterChange = () => {
  currentPage.value = 1;
  fetchUsers();
};

let searchTimer: ReturnType<typeof setTimeout> | undefined;
const triggerSearch = () => {
  clearTimeout(searchTimer);
  currentPage.value = 1;
  fetchUsers();
};
watch(() => filters.search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    fetchUsers();
  }, 450);
});

const buildQuery = (): Record<string, any> => {
  const query: Record<string, any> = {
    page: currentPage.value,
    limit: pageSize.value,
  };
  if (filters.search?.trim()) query.search = filters.search.trim();
  if (filters.isActive !== undefined && filters.isActive !== null) query.isActive = filters.isActive;
  if (startDate.value) query.startDate = startDate.value.format('YYYY-MM-DD');
  if (endDate.value) query.endDate = endDate.value.format('YYYY-MM-DD');
  return query;
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const query = buildQuery();
    const res = await userRepository.getByMerchant(query);
    users.value = res.results ?? [];
    total.value = res.pagination?.total ?? 0;
    if ((res as any).summary) {
      summary.value = {
        totalUsers: (res as any).summary.totalUsers ?? 0,
        totalActive: (res as any).summary.totalActive ?? 0,
        totalInactive: (res as any).summary.totalInactive ?? 0,
      };
    }
  } catch (err) {
    handleApiError(err, t);
  } finally {
    loading.value = false;
  }
};

const onPageChange = (page: number, size: number) => {
  currentPage.value = page;
  pageSize.value = size;
  fetchUsers();
};

const toggleActive = async (record: User) => {
  try {
    await userRepository.setActive(record.id, !record.isActive);
    record.isActive = !record.isActive;
    message.success(
      record.isActive
        ? t('merchant.teamMembers.activatedSuccess')
        : t('merchant.teamMembers.deactivatedSuccess'),
    );
  } catch (err) {
    handleApiError(err, t);
  }
};

const handleDelete = async (id: number) => {
  try {
    await userRepository.delete(id);
    message.success(t('merchant.teamMembers.deleteSuccess'));
    await fetchUsers();
  } catch (err) {
    handleApiError(err, t);
  }
};

const handleCreate = async () => {
  try {
    await createFormRef.value?.validate();
  } catch {
    return;
  }

  creating.value = true;
  try {
    await userRepository.merchantCreate({ ...createForm });
    message.success(t('merchant.teamMembers.createSuccess'));
    showCreateModal.value = false;
    resetCreateForm();
    await fetchUsers();
  } catch (err) {
    handleApiError(err, t);
  } finally {
    creating.value = false;
  }
};

const resetCreateForm = () => {
  createForm.email = '';
  createForm.password = '';
  createForm.fullName = '';
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }

/* ===== Page header ===== */
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.title-block { flex: 1 1 auto; min-width: 0; }
.page-title { font-size: 22px; font-weight: 600; color: #0f172a; line-height: 1.25; }
.page-subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }

.search-input { height: 44px; border-radius: 12px; width: min(320px, 100%); }
.add-btn { height: 44px; border-radius: 12px; font-weight: 700; flex-shrink: 0; }

.filter-toggle-btn {
  height: 44px; width: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 18px;
}
.filter-toggle-btn.active {
  background: #1677ff; color: #fff; border-color: #1677ff;
}

@media (max-width: 767px) {
  .page-header { flex-wrap: wrap; }
  .title-block { order: 1; flex: 1 1 auto; }
  .filter-toggle-btn { order: 2; }
  .add-btn { order: 3; flex-shrink: 0; height: 36px; font-size: 12px; padding: 0 10px; }
  .search-input { order: 4; flex: 1 1 100%; width: 100%; }
  .page-title { font-size: 15px; }
  .page-subtitle { display: none; }
}

/* ===== Filter Card ===== */
.filter-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.filter-bar {
  display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
}
.filter-date-single { border-radius: 10px; min-width: 160px; }
.filter-date-single :deep(.ant-picker) { border-radius: 10px !important; }
.filter-select { min-width: 160px; }
.filter-select :deep(.ant-select-selector) { border-radius: 10px !important; }

@media (max-width: 767px) {
  .filter-card { border-radius: 10px; }
  .filter-card :deep(.ant-card-body) { padding: 12px !important; }
  .filter-bar { flex-direction: column; }
  .filter-date-single { width: 100%; }
  .filter-select { width: 100%; }
}

/* ===== Desktop card ===== */
.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.user-name-cell { display: flex; align-items: center; gap: 10px; }
.user-name-text { font-weight: 600; color: #0f172a; }
.pill-tag { border-radius: 999px; padding: 2px 10px; font-weight: 800; font-size: 12px; }
.status-toggle { cursor: pointer; transition: opacity 0.15s ease; border-radius: 999px; font-weight: 700; font-size: 12px; }
.status-toggle:hover { opacity: 0.8; }
.icon-action { border-radius: 10px; }
.icon-action:hover { background: rgba(29, 78, 216, 0.08) !important; color: #1d4ed8; }

:deep(.ant-table) { width: 100%; }
:deep(.ant-table-thead > tr > th) {
  background: #f8fafc !important; color: #0f172a; font-weight: 700;
}
:deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(24, 144, 255, 0.06) !important;
}

/* ===== Mobile card list ===== */
.users-mobile { display: flex; flex-direction: column; gap: 12px; }

.users-collapse { background: transparent !important; border: none !important; }
.users-collapse :deep(.ant-collapse-item) {
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.06) !important;
  border: 1px solid rgba(148, 163, 184, 0.15) !important;
  overflow: hidden; margin-bottom: 10px !important;
}
.users-collapse :deep(.ant-collapse-header) {
  padding: 14px 14px !important; align-items: center !important;
}
.users-collapse :deep(.ant-collapse-content) {
  background: transparent !important;
  border-top: 1px solid rgba(148, 163, 184, 0.18) !important;
}
.users-collapse :deep(.ant-collapse-content-box) {
  padding: 0 14px 14px !important;
}

.expand-icon { font-size: 13px; color: #94a3b8; transition: transform 260ms ease; }
.expand-icon.rotated { transform: rotate(180deg); }

.card-row { display: flex; align-items: center; gap: 12px; padding-right: 4px; }
.status-side { flex-shrink: 0; margin-left: auto; }

.avatar-wrap { position: relative; flex-shrink: 0; }
.user-avatar { font-weight: 800; font-size: 18px; color: #fff; }
.active-dot {
  position: absolute; bottom: 2px; left: 2px;
  width: 11px; height: 11px; background: #22c55e;
  border-radius: 999px; border: 2px solid #fff;
}
.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.3; }
.user-email { font-size: 13px; color: #64748b; margin-top: 2px; word-break: break-all; }
.status-tag { border-radius: 999px; font-weight: 700; font-size: 12px; }

.card-detail { padding-top: 10px; }
.detail-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 0; border-bottom: 1px solid rgba(148, 163, 184, 0.2); gap: 8px;
}
.detail-row.border-none { border-bottom: none; justify-content: flex-end; }
.detail-label { font-size: 12px; font-weight: 600; color: #94a3b8; }
.detail-val { font-size: 13px; font-weight: 600; color: #1e293b; text-align: right; }
.delete-btn { border-radius: 8px; font-size: 13px; }

.pagination-row {
  display: flex; justify-content: center; margin-top: 16px; padding-top: 12px;
}

/* ===== Summary Cards ===== */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.summary-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.summary-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
}
.total-icon { background: rgba(29, 78, 216, 0.1); color: #1d4ed8; }
.active-icon { background: rgba(22, 163, 74, 0.1); color: #16a34a; }
.inactive-icon { background: rgba(220, 38, 38, 0.1); color: #dc2626; }
.summary-body { flex: 1; min-width: 0; }
.summary-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.4px; }
.summary-value { font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1.3; }
.num-truncate {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media (max-width: 767px) {
  .summary-grid { grid-template-columns: 1fr; gap: 10px; }
  .summary-card { padding: 12px 14px; border-radius: 10px; }
  .summary-value { font-size: 15px; }
}

/* ===== Create form ===== */
.create-form :deep(.ant-form-item) { margin-bottom: 16px; }
.create-form :deep(.ant-input),
.create-form :deep(.ant-input-password) { border-radius: 10px; }
</style>

<style>
.blue-tooltip .ant-tooltip-inner {
  background: #1d4ed8 !important;
  color: #fff !important;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 12px;
  max-width: 320px;
  word-break: break-word;
}
.blue-tooltip .ant-tooltip-arrow::before {
  background: #1d4ed8 !important;
}
</style>
