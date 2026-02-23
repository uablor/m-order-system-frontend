<template>
  <div class="notification-list-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="title-block">
        <div class="page-title">{{ $t('merchant.notifications.title') }}</div>
        <div class="page-subtitle">{{ $t('merchant.notifications.subtitle') }}</div>
      </div>
      <a-button
        v-if="isMobile"
        type="default"
        class="filter-toggle-btn"
        :class="{ active: showFilters }"
        @click="showFilters = !showFilters"
      >
        <FilterOutlined />
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
          v-model:value="filters.notificationType"
          allow-clear
          class="filter-select"
          :placeholder="$t('merchant.notifications.typeFilter')"
        >
          <a-select-option value="ARRIVAL">{{ $t('merchant.notifications.typeArrival') }}</a-select-option>
          <a-select-option value="PAYMENT">{{ $t('merchant.notifications.typePayment') }}</a-select-option>
          <a-select-option value="REMINDER">{{ $t('merchant.notifications.typeReminder') }}</a-select-option>
        </a-select>
        <a-select
          v-model:value="filters.status"
          allow-clear
          class="filter-select"
          :placeholder="$t('merchant.notifications.statusFilter')"
        >
          <a-select-option value="SENT">{{ $t('merchant.notifications.statusSent') }}</a-select-option>
          <a-select-option value="FAILED">{{ $t('merchant.notifications.statusFailed') }}</a-select-option>
        </a-select>
        <a-button type="primary" @click="applyFilters">
          <SearchOutlined /> {{ $t('common.search') }}
        </a-button>
        <a-button @click="resetFilters">{{ $t('common.reset') }}</a-button>
      </div>
    </a-card>

    <!-- Desktop Table -->
    <a-card v-if="!isMobile" :bordered="false" class="panel-card">
      <a-table
        :columns="columns"
        :data-source="notifications"
        :pagination="paginationConfig"
        row-key="id"
        size="middle"
        :loading="loading"
        :scroll="{ x: 1300 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'index'">
            {{ (currentPage - 1) * pageSize + notifications.indexOf(record) + 1 }}
          </template>
          <template v-else-if="column.key === 'notificationType'">
            <a-tag :color="typeColor(record.notificationType)" class="pill-tag">
              {{ typeLabel(record.notificationType) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'channel'">
            <a-tag color="blue" class="pill-tag">{{ record.channel }}</a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="statusColor(record.status)" class="pill-tag">
              {{ statusLabel(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'messageContent'">
            <a-tooltip :title="record.messageContent">
              <span class="msg-truncate">{{ record.messageContent }}</span>
            </a-tooltip>
          </template>
          <template v-else-if="column.key === 'notificationLink'">
            <a v-if="record.notificationLink" :href="record.notificationLink" target="_blank" class="link-cell">
              {{ record.notificationLink }}
            </a>
            <span v-else>—</span>
          </template>
          <template v-else-if="column.key === 'sentAt'">
            {{ record.sentAt ? formatDateTime(record.sentAt) : '—' }}
          </template>
          <template v-else-if="column.key === 'actions'">
            <div class="flex items-center justify-end gap-2">
              <a-popconfirm :title="$t('merchant.notifications.confirmDelete')" @confirm="handleDelete(record.id)">
                <a-button type="text" danger class="icon-action"><DeleteOutlined /></a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Mobile Card List -->
    <div v-else class="notifications-mobile">
      <a-spin :spinning="loading">
        <a-empty v-if="notifications.length === 0 && !loading" :description="$t('merchant.notifications.noNotifications')" />

        <a-collapse accordion ghost class="notifications-collapse">
          <template #expandIcon="{ isActive }">
            <DownOutlined class="expand-icon" :class="{ rotated: isActive }" />
          </template>

          <a-collapse-panel v-for="notif in notifications" :key="notif.id" class="notif-panel">
            <template #header>
              <div class="card-row">
                <div class="notif-avatar-wrap">
                  <a-avatar class="notif-avatar" :size="44">
                    <BellOutlined />
                  </a-avatar>
                </div>
                <div class="notif-info">
                  <div class="notif-name">{{ notif.recipientContact }}</div>
                  <div class="notif-date">{{ notif.sentAt ? formatDateTime(notif.sentAt) : '—' }}</div>
                </div>
                <div class="status-side">
                  <a-tag :color="statusColor(notif.status)" class="status-tag">
                    {{ statusLabel(notif.status) }}
                  </a-tag>
                </div>
              </div>
            </template>

            <div class="card-detail">
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.notifications.colType') }}</span>
                <a-tag :color="typeColor(notif.notificationType)" class="pill-tag">
                  {{ typeLabel(notif.notificationType) }}
                </a-tag>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.notifications.colChannel') }}</span>
                <a-tag color="blue" class="pill-tag">{{ notif.channel }}</a-tag>
              </div>
              <div class="detail-row border-none pt-2">
                <a-popconfirm :title="$t('merchant.notifications.confirmDelete')" @confirm="handleDelete(notif.id)">
                  <a-button type="text" danger size="small" class="delete-btn">
                    <DeleteOutlined /> {{ $t('common.delete') }}
                  </a-button>
                </a-popconfirm>
              </div>
            </div>
          </a-collapse-panel>
        </a-collapse>

        <div v-if="notifications.length > 0" class="pagination-row">
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import type { TableColumnsType } from 'ant-design-vue';
import {
  SearchOutlined,
  FilterOutlined,
  DownOutlined,
  DeleteOutlined,
  BellOutlined,
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { notificationRepository, type NotificationItem } from '@/infrastructure/repositories/notification.repository';
import { useAuthStore } from '@/store/auth.store';
import { storeToRefs } from 'pinia';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import { handleApiError } from '@/shared/utils/error';

const { t } = useI18n();
const { isMobile } = useIsMobile();
const authStore = useAuthStore();
const { authPayload } = storeToRefs(authStore);

const loading = ref(false);
const notifications = ref<NotificationItem[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const showFilters = ref(false);

const filters = reactive<{
  notificationType: string | undefined;
  status: string | undefined;
}>({
  notificationType: undefined,
  status: undefined,
});

const columns = computed<TableColumnsType>(() => [
  { title: t('merchant.notifications.colId'), key: 'index', width: 55 },
  { title: t('merchant.notifications.colType'), key: 'notificationType', dataIndex: 'notificationType', width: 120, align: 'center' as const },
  { title: t('merchant.notifications.colChannel'), key: 'channel', dataIndex: 'channel', width: 100, align: 'center' as const },
  { title: t('merchant.notifications.colRecipient'), key: 'recipientContact', dataIndex: 'recipientContact', width: 170 },
  { title: t('merchant.notifications.colMessage'), key: 'messageContent', dataIndex: 'messageContent', width: 250 },
  { title: t('merchant.notifications.colLink'), key: 'notificationLink', dataIndex: 'notificationLink', width: 180 },
  { title: t('merchant.notifications.colRetry'), key: 'retryCount', dataIndex: 'retryCount', width: 80, align: 'center' as const },
  { title: t('merchant.notifications.colStatus'), key: 'status', dataIndex: 'status', width: 100, align: 'center' as const },
  { title: t('merchant.notifications.colSentAt'), key: 'sentAt', dataIndex: 'sentAt', width: 150 },
  { title: t('merchant.notifications.colActions'), key: 'actions', fixed: 'right' as const, width: 80, align: 'right' as const },
]);

const paginationConfig = computed((): TablePaginationConfig => ({
  current: currentPage.value,
  pageSize: pageSize.value,
  total: total.value,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: (tot: number) => `Total ${tot}`,
}));

const typeColor = (type: string): string => {
  const map: Record<string, string> = {
    ARRIVAL: 'cyan',
    PAYMENT: 'green',
    REMINDER: 'orange',
  };
  return map[type] ?? 'default';
};

const typeLabel = (type: string): string => {
  const map: Record<string, string> = {
    ARRIVAL: t('merchant.notifications.typeArrival'),
    PAYMENT: t('merchant.notifications.typePayment'),
    REMINDER: t('merchant.notifications.typeReminder'),
  };
  return map[type] ?? type;
};

const statusColor = (status: string): string => {
  return status === 'SENT' ? 'success' : 'error';
};

const statusLabel = (status: string): string => {
  return status === 'SENT'
    ? t('merchant.notifications.statusSent')
    : t('merchant.notifications.statusFailed');
};

const formatDateTime = (dt: string | null): string => {
  if (!dt) return '—';
  return dayjs(dt).format('DD/MM/YYYY HH:mm');
};

const buildQuery = () => ({
  page: currentPage.value,
  limit: pageSize.value,
  merchantId: authPayload.value?.merchantId,
  ...(filters.notificationType ? { notificationType: filters.notificationType } : {}),
  ...(filters.status ? { status: filters.status } : {}),
});

const fetchNotifications = async () => {
  loading.value = true;
  try {
    const res = await notificationRepository.getList(buildQuery());
    notifications.value = res.results ?? [];
    total.value = res.pagination?.total ?? 0;
  } catch (err) {
    handleApiError(err, t);
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  currentPage.value = 1;
  fetchNotifications();
};

const resetFilters = () => {
  filters.notificationType = undefined;
  filters.status = undefined;
  currentPage.value = 1;
  fetchNotifications();
};

const onPageChange = (page: number, size: number) => {
  currentPage.value = page;
  pageSize.value = size;
  fetchNotifications();
};

const handleTableChange = (pagination: TablePaginationConfig) => {
  currentPage.value = pagination.current ?? 1;
  pageSize.value = pagination.pageSize ?? 10;
  fetchNotifications();
};

const handleDelete = async (id: number) => {
  try {
    await notificationRepository.delete(id);
    message.success(t('merchant.notifications.deleteSuccess'));
    await fetchNotifications();
  } catch (err) {
    handleApiError(err, t);
  }
};

onMounted(() => {
  fetchNotifications();
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
  .search-input { order: 3; flex: 1 1 100%; width: 100%; }
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
.pill-tag { border-radius: 999px; padding: 2px 10px; font-weight: 800; font-size: 12px; }
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
.notifications-mobile { display: flex; flex-direction: column; gap: 12px; }
.notifications-collapse { background: transparent !important; border: none !important; }
.notifications-collapse :deep(.ant-collapse-item) {
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.06) !important;
  border: 1px solid rgba(148, 163, 184, 0.15) !important;
  overflow: hidden;
  margin-bottom: 10px !important;
}
.notifications-collapse :deep(.ant-collapse-header) {
  padding: 14px 14px !important; align-items: center !important;
}
.notifications-collapse :deep(.ant-collapse-content) {
  background: transparent !important;
  border-top: 1px solid rgba(148, 163, 184, 0.18) !important;
}
.notifications-collapse :deep(.ant-collapse-content-box) {
  padding: 0 14px 14px !important;
}
.expand-icon { font-size: 13px; color: #94a3b8; transition: transform 260ms ease; }
.expand-icon.rotated { transform: rotate(180deg); }
.card-row { display: flex; align-items: center; gap: 12px; padding-right: 4px; }
.status-side { flex-shrink: 0; margin-left: auto; }
.notif-avatar-wrap { position: relative; flex-shrink: 0; }
.notif-avatar {
  background: rgba(22, 119, 255, 0.1); color: #1677ff;
  font-weight: 800; font-size: 16px;
}
.notif-info { flex: 1; min-width: 0; }
.notif-name { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.3; }
.notif-date { font-size: 13px; color: #64748b; margin-top: 2px; }
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
.pagination-row { display: flex; justify-content: center; margin-top: 16px; padding-top: 12px; }
.msg-truncate {
  display: inline-block; max-width: 220px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  vertical-align: middle; cursor: default;
}
.link-cell {
  color: #1d4ed8; font-size: 12px;
  display: inline-block; max-width: 160px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  vertical-align: middle;
}
</style>
