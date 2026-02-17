<template>
  <div class="merchant-customers">
    <a-breadcrumb class="mb-3">
      <a-breadcrumb-item>{{ $t('merchant.breadcrumbs.home') }}</a-breadcrumb-item>
      <a-breadcrumb-item>{{ $t('merchant.customers.breadcrumb') }}</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
      <div>
        <div class="text-3xl font-semibold text-slate-900">{{ $t('merchant.customers.title') }}</div>
        <div class="text-slate-500 mt-1">{{ $t('merchant.customers.subtitle') }}</div>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
        <a-input
          v-model:value="q"
          allow-clear
          class="search-input"
          :placeholder="$t('merchant.customers.searchPlaceholder')"
        >
          <template #prefix><SearchOutlined /></template>
        </a-input>
        <a-button type="primary" class="add-btn sm:shrink-0" @click="() => {}">
          <template #icon><UserAddOutlined /></template>
          {{ $t('merchant.customers.addButton') }}
        </a-button>
      </div>
    </div>

    <a-card :bordered="false" class="panel-card">
      <!-- Desktop table -->
      <a-table
        v-if="!isMobile"
        :columns="columns"
        :data-source="filteredCustomers"
        :pagination="{ pageSize: 8 }"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'customer'">
            <div class="flex items-center gap-3">
              <a-avatar :size="40" :style="{ backgroundColor: record.avatarColor }">{{ record.avatarText }}</a-avatar>
              <div>
                <div class="font-semibold text-slate-900 leading-tight">{{ record.name }}</div>
                <div class="text-slate-500 text-sm">{{ record.code }}</div>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'address'">
            <div class="flex items-center gap-2">
              <a-tag color="blue" class="pill-tag">{{ record.shipTag }}</a-tag>
              <span class="text-slate-700">{{ record.address }}</span>
            </div>
          </template>

          <template v-else-if="column.key === 'pay'">
            <span class="text-slate-700">{{ record.paymentMethod }}</span>
          </template>

          <template v-else-if="column.key === 'contact'">
            <div class="flex items-center gap-3">
              <a-button type="text" class="icon-action" @click="() => {}"><MessageOutlined /></a-button>
              <a-button type="text" class="icon-action" @click="() => {}"><PhoneOutlined /></a-button>
              <span class="text-slate-700">{{ record.contactPhone }}</span>
            </div>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'green' : 'default'" class="pill-tag">
              {{ record.status === 'active' ? $t('merchant.customers.status.active') : $t('merchant.customers.status.inactive') }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'actions'">
            <div class="flex items-center justify-end gap-2">
              <a-button type="text" class="icon-action" @click="() => {}"><EditOutlined /></a-button>
              <a-button type="text" danger class="icon-action" @click="() => {}"><DeleteOutlined /></a-button>
            </div>
          </template>
        </template>
      </a-table>

      <!-- Mobile accordion/list -->
      <div v-else class="customers-mobile">
        <a-collapse accordion ghost class="customers-collapse">
          <a-collapse-panel v-for="c in filteredCustomers" :key="c.id">
            <template #header>
              <div class="mobile-header">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <a-avatar :size="36" :style="{ backgroundColor: c.avatarColor }">{{ c.avatarText }}</a-avatar>
                    <div class="min-w-0">
                      <div class="font-semibold text-slate-900 truncate">{{ c.name }}</div>
                      <div class="text-slate-500 text-sm truncate">{{ c.code }}</div>
                    </div>
                  </div>
                  <a-tag :color="c.status === 'active' ? 'green' : 'default'" class="pill-tag shrink-0">
                    {{ c.status === 'active' ? $t('merchant.customers.status.active') : $t('merchant.customers.status.inactive') }}
                  </a-tag>
                </div>
              </div>
            </template>

            <div class="mobile-body">
              <div class="mobile-kv">
                <div class="info-item">
                  <div class="info-label">{{ $t('merchant.customers.table.address') }}</div>
                  <div class="info-value">
                    <a-tag color="blue" class="pill-tag mr-2">{{ c.shipTag }}</a-tag>
                    <span class="text-slate-700">{{ c.address }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-label">{{ $t('merchant.customers.table.pay') }}</div>
                  <div class="info-value text-slate-900">{{ c.paymentMethod }}</div>
                </div>

                <div class="info-item">
                  <div class="info-label">{{ $t('merchant.customers.table.contact') }}</div>
                  <div class="info-actions">
                    <a-button type="text" class="icon-action" @click="() => {}"><MessageOutlined /></a-button>
                    <a-button type="text" class="icon-action" @click="() => {}"><PhoneOutlined /></a-button>
                    <span class="text-slate-900 font-extrabold">{{ c.contactPhone }}</span>
                  </div>
                </div>

                <div class="info-item last">
                  <div class="info-label">{{ $t('merchant.customers.table.manage') }}</div>
                  <div class="info-actions">
                    <a-button type="text" class="icon-action" @click="() => {}"><EditOutlined /></a-button>
                    <a-button type="text" danger class="icon-action" @click="() => {}"><DeleteOutlined /></a-button>
                  </div>
                </div>
              </div>
            </div>
          </a-collapse-panel>
        </a-collapse>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { mockCustomers } from '../../../shared/mock';
import { useIsMobile } from '../../../shared/composables/useIsMobile';
import {
  SearchOutlined,
  UserAddOutlined,
  MessageOutlined,
  PhoneOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue';

const q = ref('');
const { t } = useI18n();
const { isMobile } = useIsMobile();

const columns = computed(() => ([
  { title: t('merchant.customers.table.customer'), key: 'customer' },
  { title: t('merchant.customers.table.address'), key: 'address' },
  { title: t('merchant.customers.table.pay'), key: 'pay', width: 140 },
  { title: t('merchant.customers.table.contact'), key: 'contact', width: 220 },
  { title: t('merchant.customers.table.status'), key: 'status', width: 120, align: 'center' as const },
  { title: t('merchant.customers.table.manage'), key: 'actions', width: 120, align: 'right' as const },
]));

const uiCustomers = computed(() => mockCustomers.map((c, idx) => {
  const colors = ['#2563eb', '#f97316', '#ec4899', '#22c55e', '#a855f7'];
  const avatarText = (c.name || 'C')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0])
    .join('')
    .toUpperCase();

  return {
    ...c,
    code: `CUST-${String(c.id).padStart(3, '0')}`,
    shipTag: idx % 3 === 0 ? 'HAL' : idx % 3 === 1 ? 'ANS' : 'Mixay',
    address: idx % 3 === 0 ? 'กรุงเทพฯ - คลองเตย' : idx % 3 === 1 ? 'นนทบุรี - ปากเกร็ด' : 'ขอนแก่น - เมือง',
    paymentMethod: idx % 2 === 0 ? t('merchant.customers.payment.origin') : t('merchant.customers.payment.destination'),
    avatarColor: colors[idx % colors.length],
    avatarText: avatarText || 'C',
  };
}));

const filteredCustomers = computed(() => {
  const needle = q.value.trim().toLowerCase();
  if (!needle) return uiCustomers.value;
  return uiCustomers.value.filter((c) =>
    String(c.name).toLowerCase().includes(needle) ||
    String(c.contactPhone).toLowerCase().includes(needle) ||
    String(c.code).toLowerCase().includes(needle)
  );
});
</script>

<style scoped>
.mb-3 { margin-bottom: 12px; }
.mb-5 { margin-bottom: 20px; }

.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}

.search-input { width: min(420px, 100%); height: 44px; border-radius: 12px; }
.add-btn { height: 44px; border-radius: 12px; font-weight: 700; }
.pill-tag { border-radius: 999px; padding: 2px 10px; font-weight: 800; }
.icon-action { border-radius: 10px; }
.icon-action:hover { background: rgba(29, 78, 216, 0.08) !important; color: #1d4ed8; }

/* Mobile list style */
.customers-mobile { margin-top: 4px; }
.mobile-header { padding-right: 8px; }
.mobile-body { padding: 2px 0 6px; }
.mobile-kv {
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.35);
}
.info-item.last { border-bottom: none; padding-bottom: 2px; }
.info-label { color: #64748b; font-weight: 800; font-size: 12px; min-width: 120px; }
.info-value { color: #0f172a; font-weight: 800; text-align: right; flex: 1; }
.info-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; flex: 1; }

.customers-collapse :deep(.ant-collapse-item) {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
  margin-bottom: 12px;
}
.customers-collapse :deep(.ant-collapse-header) { padding: 14px 14px !important; }
.customers-collapse :deep(.ant-collapse-content-box) { padding: 0 14px 14px !important; }
.customers-collapse :deep(.ant-collapse-arrow) { inset-inline-end: 14px !important; }

@media (max-width: 480px) {
  .info-item { flex-direction: column; align-items: flex-start; }
  .info-label { min-width: 0; }
  .info-value, .info-actions { justify-content: flex-start; text-align: left; }
}
</style>
