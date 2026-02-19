<template>
  <div class="manage-order">
    <a-breadcrumb class="mb-3">
      <a-breadcrumb-item>{{ $t('merchant.breadcrumbs.home') }}</a-breadcrumb-item>
      <a-breadcrumb-item>{{ $t('merchant.orders.breadcrumb') }}</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-head">
      <div class="head-left">
        <div class="page-title">{{ $t('merchant.orders.title') }}</div>
        <div class="page-subtitle">{{ $t('merchant.orders.subtitle') }}</div>
      </div>

      <div class="tabs-wrap">
        <div class="tab-pills" role="tablist" aria-label="Manage order tabs">
          <button
            class="tab-pill"
            :class="{ active: tab === 'single' }"
            role="tab"
            :aria-selected="tab === 'single'"
            tabindex="0"
            @click="tab = 'single'"
          >
            {{ $t('merchant.orders.tabs.single') }}
          </button>
          <button
            class="tab-pill"
            :class="{ active: tab === 'group' }"
            role="tab"
            :aria-selected="tab === 'group'"
            tabindex="0"
            @click="tab = 'group'"
          >
            {{ $t('merchant.orders.tabs.group') }}
          </button>
        </div>
      </div>
    </div>

    <!-- TAB: SINGLE -->
    <div v-if="tab === 'single'">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :lg="16">
          <a-card :bordered="false" class="panel-card">
            <div class="panel-title">
              <div class="flex items-center gap-2">
                <UserOutlined class="text-blue-600" />
                <span>{{ $t('merchant.orders.panels.customerProduct') }}</span>
              </div>
            </div>

            <a-form layout="vertical">
              <a-form-item :label="$t('merchant.orders.form.searchCustomer')">
                <a-input
                  v-model:value="single.customerSearch"
                  :placeholder="$t('merchant.orders.form.searchCustomerPlaceholder')"
                  allow-clear
                >
                  <template #prefix><SearchOutlined /></template>
                </a-input>
              </a-form-item>

              <a-row :gutter="[12, 12]">
                <a-col :xs="24" :md="12">
                  <a-form-item :label="$t('merchant.orders.form.orderCode')">
                    <a-input :value="orderCodeDisplay" disabled />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="12">
                  <a-form-item :label="$t('merchant.orders.form.sku')">
                    <a-input v-model:value="single.sku" :placeholder="$t('merchant.orders.form.skuPlaceholder')" allow-clear />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="[12, 12]">
                <a-col :xs="24" :md="12">
                  <a-form-item :label="$t('merchant.orders.form.qty')">
                    <a-input-number v-model:value="single.qty" :min="1" class="w-full" />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-form-item :label="$t('merchant.orders.form.upload')">
                <a-upload :before-upload="preventUpload" :show-upload-list="false">
                  <div class="upload-box">
                    <CameraOutlined class="upload-icon" />
                    <div class="text-slate-600 font-medium">{{ $t('merchant.orders.form.uploadHint1') }}</div>
                    <div class="text-slate-400 text-sm">{{ $t('merchant.orders.form.uploadHint2') }}</div>
                  </div>
                </a-upload>
              </a-form-item>
            </a-form>
          </a-card>

          <a-card :bordered="false" class="panel-card mt-4">
            <div class="panel-title">
              <div class="flex items-center gap-2">
                <ReloadOutlined class="text-blue-600" />
                <span>{{ $t('merchant.orders.panels.currency') }}</span>
              </div>
            </div>

            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50 rounded-2xl p-4">
              <div>
                <div class="text-slate-700 font-medium">{{ $t('merchant.orders.form.sellForeignTitle') }}</div>
                <div class="text-slate-500 text-sm">{{ $t('merchant.orders.form.sellForeignSubtitle') }}</div>
              </div>
              <a-switch v-model:checked="single.useForeign" />
            </div>

            <div class="rate-box mt-4">
              <div class="text-blue-700 font-semibold">{{ $t('merchant.orders.form.exchangeRateLabel') }}:</div>
              <div class="text-blue-700 font-semibold">1 CNY = 5.25 THB</div>
            </div>
          </a-card>
        </a-col>

        <a-col :xs="24" :lg="8">
          <a-card :bordered="false" class="panel-card sticky-card">
            <div class="panel-title">
              <div class="flex items-center gap-2">
                <FileTextOutlined class="text-blue-600" />
                <span>{{ $t('merchant.orders.panels.priceDetails') }}</span>
              </div>
              <div class="text-slate-500 text-sm">{{ $t('merchant.orders.form.pricePerPiece') }}</div>
            </div>

            <a-form layout="vertical" class="price-details-form">
              <a-form-item :label="$t('merchant.orders.form.pricePerPiece')">
                <a-input-number v-model:value="single.priceThb" :min="0" class="w-full" />
              </a-form-item>
              <a-form-item :label="$t('merchant.orders.form.totalAuto')">
                <div class="auto-price">{{ n(single.priceThb * single.qty, 'currency') }}</div>
              </a-form-item>
              <a-form-item :label="$t('merchant.orders.form.costCny')">
                <a-input-number v-model:value="single.costCny" :min="0" class="w-full" />
              </a-form-item>

              <a-row :gutter="priceDetailsGutter">
                <a-col :xs="12">
                  <a-form-item :label="$t('merchant.orders.form.shippingThb')">
                    <a-input-number v-model:value="single.shipping" :min="0" class="w-full" />
                  </a-form-item>
                </a-col>
                <a-col :xs="12">
                  <a-form-item :label="$t('merchant.orders.form.discountThb')">
                    <a-input-number v-model:value="single.discount" :min="0" class="w-full" />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-form-item :label="$t('merchant.orders.form.depositThb')">
                <a-input-number v-model:value="single.deposit" :min="0" class="w-full" />
              </a-form-item>

              <div class="remaining-box">
                <div class="text-white/80 font-semibold">{{ $t('merchant.orders.remaining.title') }}</div>
                <div class="remaining-amount">{{ n(singleRemaining, 'currency') }}</div>
              </div>

              <a-button type="primary" block class="save-btn" @click="() => {}">
                <template #icon><SaveOutlined /></template>
                {{ $t('merchant.orders.buttons.saveOrder') }}
              </a-button>
            </a-form>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- TAB: GROUP -->
    <div v-else>
      <a-card :bordered="false" class="panel-card mb-4">
        <div class="panel-title">
          <div class="flex items-center gap-2">
            <ShoppingOutlined class="text-blue-600" />
            <span>{{ $t('merchant.orders.panels.mainProduct') }}</span>
          </div>
        </div>

        <a-form layout="vertical">
          <a-row :gutter="mainProductGutter" class="main-product-form">
            <!-- SKU: full width on mobile/tablet, quarter on desktop -->
            <a-col :xs="24" :sm="24" :md="6">
              <a-form-item :label="$t('merchant.orders.form.sku')">
                <a-input v-model:value="group.sku" placeholder="SKU-2024-MODERN" />
              </a-form-item>
            </a-col>
            <!-- Cost + Base price: same row on mobile (half + half) -->
            <a-col :xs="12" :sm="12" :md="6">
              <a-form-item :label="$t('merchant.orders.form.costCny')">
                <a-input-number v-model:value="group.costCny" :min="0" class="w-full" />
              </a-form-item>
            </a-col>
            <a-col :xs="12" :sm="12" :md="6">
              <a-form-item :label="$t('merchant.orders.form.basePriceThb')">
                <a-input-number v-model:value="group.basePriceThb" :min="0" class="w-full" />
              </a-form-item>
            </a-col>
            <!-- Default shipping: full width on mobile/tablet, quarter on desktop -->
            <a-col :xs="24" :sm="24" :md="6">
              <a-form-item :label="$t('merchant.orders.form.defaultShippingThb')">
                <a-input-number v-model:value="group.defaultShipping" :min="0" class="w-full" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-card>

      <a-card :bordered="false" class="panel-card mb-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div class="panel-title" style="margin-bottom: 0;">
            <div class="flex items-center gap-2">
              <TeamOutlined class="text-blue-600" />
              <span>{{ $t('merchant.orders.panels.customerList') }}</span>
            </div>
          </div>
          <a-button type="primary" class="add-btn sm:self-end" @click="addGroupRow">
            <template #icon><PlusOutlined /></template>
            {{ $t('merchant.orders.buttons.addRow') }}
          </a-button>
        </div>

        <!-- Desktop grid -->
        <template v-if="!isMobile">
          <div class="group-grid header">
            <div>{{ $t('merchant.orders.groupColumns.customer') }}</div>
            <div>{{ $t('merchant.orders.groupColumns.qty') }}</div>
            <div>{{ $t('merchant.orders.groupColumns.discount') }}</div>
            <div>{{ $t('merchant.orders.groupColumns.deposit') }}</div>
            <div class="text-right">{{ $t('merchant.orders.groupColumns.remaining') }}</div>
            <div class="text-right">{{ $t('merchant.orders.groupColumns.delete') }}</div>
          </div>

          <div v-for="row in groupRows" :key="row.id" class="group-grid row">
            <div>
              <a-input v-model:value="row.customer" placeholder="John Doe (คุณจอห์น)" allow-clear>
                <template #prefix><SearchOutlined /></template>
              </a-input>
            </div>
            <div><a-input-number v-model:value="row.qty" :min="1" class="w-full" /></div>
            <div><a-input-number v-model:value="row.discount" :min="0" class="w-full" /></div>
            <div><a-input-number v-model:value="row.deposit" :min="0" class="w-full" /></div>
            <div class="text-right font-semibold text-blue-700">{{ n(groupRemaining(row), 'currency') }}</div>
            <div class="text-right">
              <a-button type="text" danger class="icon-action" @click="removeGroupRow(row.id)">
                <DeleteOutlined />
              </a-button>
            </div>
          </div>
        </template>

        <!-- Mobile cards -->
        <div v-else class="group-mobile">
          <a-collapse accordion ghost class="group-collapse">
            <a-collapse-panel v-for="row in groupRows" :key="row.id">
              <template #header>
                <div class="mobile-header">
                  <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <div class="font-semibold text-slate-900 truncate">
                        {{ row.customer || $t('merchant.orders.groupColumns.customer') }}
                      </div>
                      <div class="text-slate-500 text-sm">
                        {{ $t('merchant.orders.groupColumns.remaining') }}:
                        <span class="font-extrabold text-blue-700">{{ n(groupRemaining(row), 'currency') }}</span>
                      </div>
                    </div>
                    <a-button type="text" danger class="icon-action shrink-0" @click.stop="removeGroupRow(row.id)">
                      <DeleteOutlined />
                    </a-button>
                  </div>
                </div>
              </template>

              <div class="mobile-body">
                <div class="group-kv">
                  <a-form layout="vertical">
                    <a-form-item :label="$t('merchant.orders.groupColumns.customer')">
                      <a-input v-model:value="row.customer" placeholder="John Doe" allow-clear>
                        <template #prefix><SearchOutlined /></template>
                      </a-input>
                    </a-form-item>

                    <div class="triple-grid">
                      <a-form-item :label="$t('merchant.orders.groupColumns.qty')">
                        <a-input-number v-model:value="row.qty" :min="1" class="w-full" />
                      </a-form-item>
                      <a-form-item :label="$t('merchant.orders.groupColumns.discount')">
                        <a-input-number v-model:value="row.discount" :min="0" class="w-full" />
                      </a-form-item>
                      <a-form-item :label="$t('merchant.orders.groupColumns.deposit')">
                        <a-input-number v-model:value="row.deposit" :min="0" class="w-full" />
                      </a-form-item>
                    </div>

                    <div class="remaining-mini">
                      <div class="text-slate-500 text-sm font-semibold">{{ $t('merchant.orders.groupColumns.remaining') }}</div>
                      <div class="text-blue-700 font-extrabold">{{ n(groupRemaining(row), 'currency') }}</div>
                    </div>
                  </a-form>
                </div>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>

        <div class="flex justify-end mt-4">
          <a-button type="primary" class="save-all-btn" @click="() => {}">
            <template #icon><SaveOutlined /></template>
            {{ $t('merchant.orders.buttons.saveAll') }}
          </a-button>
        </div>
      </a-card>
    </div>

    <!-- TODAY LIST -->
    <a-card :bordered="false" class="panel-card today-section">
      <div class="flex items-center justify-between mb-3">
        <div class="panel-title" style="margin-bottom: 0;">
          <div class="flex items-center gap-2">
            <ClockCircleOutlined class="text-blue-600" />
            <span>{{ $t('merchant.orders.panels.today') }}</span>
          </div>
        </div>
        <a-tag class="pill-tag">{{ $t('merchant.orders.countAll', { count: todayOrders.length }) }}</a-tag>
      </div>

      <!-- Desktop table -->
      <a-table
        v-if="!isMobile"
        :columns="todayColumns"
        :data-source="todayOrders"
        :pagination="false"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'item'">
            <div class="flex items-center gap-3">
              <div class="thumb">
                <PictureOutlined />
              </div>
              <div>
                <div class="font-semibold text-slate-900">{{ record.customerName }}</div>
                <div class="text-slate-500 text-sm">{{ record.orderCode }}</div>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'total'">
            <div class="font-semibold text-slate-900">{{ n(record.totalAmount, 'currency') }}</div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.arrivalStatus === 'arrived' ? 'orange' : 'blue'" class="pill-tag">
              {{ record.arrivalStatus === 'arrived' ? $t('merchant.orders.todayStatus.arrived') : $t('merchant.orders.todayStatus.notArrived') }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <div class="flex items-center justify-end gap-1">
              <a-button type="text" class="icon-action" @click="() => {}"><EditOutlined /></a-button>
              <a-button type="text" danger class="icon-action" @click="() => {}"><DeleteOutlined /></a-button>
            </div>
          </template>
        </template>
      </a-table>

      <!-- Mobile accordion list -->
      <div v-else class="today-mobile">
        <a-collapse accordion ghost class="today-collapse">
          <a-collapse-panel v-for="o in todayOrders" :key="o.id">
            <template #header>
              <div class="mobile-header">
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <div class="font-semibold text-slate-900 truncate">#{{ o.orderCode }}</div>
                    <div class="text-slate-500 text-sm truncate">{{ o.customerName }}</div>
                  </div>
                  <a-tag :color="o.arrivalStatus === 'arrived' ? 'orange' : 'blue'" class="pill-tag shrink-0">
                    {{ o.arrivalStatus === 'arrived' ? $t('merchant.orders.todayStatus.arrived') : $t('merchant.orders.todayStatus.notArrived') }}
                  </a-tag>
                </div>
              </div>
            </template>

            <div class="mobile-body">
              <div class="mobile-kv">
                <div class="kv-row">
                  <div class="kv-label">{{ $t('merchant.orders.todayTable.total') }}</div>
                  <div class="kv-value">{{ n(o.totalAmount, 'currency') }}</div>
                </div>
                <div class="kv-row">
                  <div class="kv-label">{{ $t('merchant.orders.todayTable.manage') }}</div>
                  <div class="kv-actions">
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
import { mockOrders } from '../../../shared/mock';
import { useIsMobile } from '../../../shared/composables/useIsMobile';
import {
  UserOutlined,
  SearchOutlined,
  CameraOutlined,
  ReloadOutlined,
  FileTextOutlined,
  SaveOutlined,
  ShoppingOutlined,
  TeamOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ClockCircleOutlined,
  PictureOutlined,
} from '@ant-design/icons-vue';

const { n, t } = useI18n();
const { isMobile } = useIsMobile();

const mainProductGutter = computed<[number, number]>(() => [isMobile.value ? 8 : 12, 12]);
const priceDetailsGutter = computed<[number, number]>(() => [isMobile.value ? 10 : 12, 12]);

const tab = ref<'single' | 'group'>('single');

const single = ref({
  customerSearch: '',
  sku: '',
  qty: 1,
  useForeign: true,
  priceThb: 0,
  costCny: 0,
  shipping: 0,
  discount: 0,
  deposit: 0,
});

const orderCodeDisplay = computed(() => t('merchant.orders.form.orderCodeAuto'));

const singleRemaining = computed(() => {
  const total = single.value.priceThb * single.value.qty;
  return Math.max(0, total + single.value.shipping - single.value.discount - single.value.deposit);
});

const preventUpload = () => false;

const group = ref({
  sku: 'SKU-2024-MODERN',
  costCny: 0,
  basePriceThb: 0,
  defaultShipping: 0,
});

type GroupRow = { id: string; customer: string; qty: number; discount: number; deposit: number };
const groupRows = ref<GroupRow[]>([
  { id: '1', customer: 'John Doe (คุณจอห์น)', qty: 1, discount: 0, deposit: 500 },
  { id: '2', customer: 'Ploy L. (คุณพลอย)', qty: 2, discount: 100, deposit: 0 },
]);

const addGroupRow = () => {
  const id = String(Date.now());
  groupRows.value.push({ id, customer: '', qty: 1, discount: 0, deposit: 0 });
};
const removeGroupRow = (id: string) => {
  groupRows.value = groupRows.value.filter((r) => r.id !== id);
};

const groupRemaining = (row: GroupRow) => {
  const perItem = group.value.basePriceThb || 0;
  const total = perItem * (row.qty || 1) + (group.value.defaultShipping || 0);
  return Math.max(0, total - (row.discount || 0) - (row.deposit || 0));
};

const todayColumns = computed(() => ([
  { title: t('merchant.orders.todayTable.item'), key: 'item' },
  { title: t('merchant.orders.todayTable.total'), key: 'total', align: 'right' as const, width: 160 },
  { title: t('merchant.orders.todayTable.status'), key: 'status', align: 'center' as const, width: 140 },
  { title: t('merchant.orders.todayTable.manage'), key: 'actions', align: 'right' as const, width: 120 },
]));

const todayOrders = computed(() => mockOrders.slice(0, 3));
</script>

<style scoped>
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mb-5 { margin-bottom: 20px; }
.mt-4 { margin-top: 16px; }

.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.head-left { flex: 1; min-width: 0; }
.page-title { font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.25; }
.page-subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }
.tabs-wrap { display: flex; justify-content: flex-end; flex-shrink: 0; }

.tab-pills {
  display: inline-flex;
  gap: 10px;
  background: #ffffff;
  border-radius: 14px;
  padding: 8px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.tab-pill {
  border: none;
  background: transparent;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 900;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}
.tab-pill:hover { background: rgba(29, 78, 216, 0.06); color: #1d4ed8; }
.tab-pill.active {
  background: #ffffff;
  color: #1d4ed8;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 18px rgba(15, 23, 42, 0.06);
}

@media (max-width: 767px) {
  .head-left { display: none; }
  .tabs-wrap { width: 100%; }
  .tab-pills { width: 100%; gap: 6px; padding: 6px; border-radius: 12px; }
  .tab-pill { flex: 1; text-align: center; padding: 8px 4px; font-size: 13px; border-radius: 9px; }
}

.panel-title {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.upload-box {
  border: 2px dashed rgba(148, 163, 184, 0.6);
  border-radius: 16px;
  padding: 28px;
  background: #f8fafc;
  display: grid;
  place-items: center;
  text-align: center;
  gap: 6px;
}
.upload-icon { font-size: 28px; color: #94a3b8; margin-bottom: 4px; }

.rate-box {
  background: rgba(37, 99, 235, 0.06);
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sticky-card { position: sticky; top: 92px; }

.auto-price {
  font-size: 22px;
  font-weight: 900;
  color: #1d4ed8;
}

.remaining-box {
  background: #1d4ed8;
  border-radius: 16px;
  padding: 14px 16px;
  margin: 10px 0 14px;
}
.remaining-amount { color: white; font-weight: 900; font-size: 26px; margin-top: 4px; }
.save-btn { height: 46px; border-radius: 14px; font-weight: 900; }
.save-all-btn { height: 46px; border-radius: 14px; font-weight: 900; }
.add-btn { border-radius: 12px; font-weight: 900; }

.pill-tag { border-radius: 999px; padding: 2px 10px; font-weight: 900; }
.icon-action { border-radius: 10px; }
.icon-action:hover { background: rgba(29, 78, 216, 0.08) !important; color: #1d4ed8; }

.group-grid {
  display: grid;
  grid-template-columns: 2.2fr 1fr 1fr 1fr 1fr 0.5fr;
  gap: 10px;
  align-items: center;
}
.group-grid.header {
  color: #64748b;
  font-weight: 800;
  font-size: 12px;
  padding: 10px 6px;
}
.group-grid.row {
  background: #f8fafc;
  border-radius: 14px;
  padding: 10px 6px;
  margin-top: 10px;
}

.thumb {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.06);
  display: grid;
  place-items: center;
  color: #475569;
}

/* Group list mobile cards */
.group-mobile { margin-top: 4px; }
.group-collapse :deep(.ant-collapse-item) {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
  margin-bottom: 12px;
}
.group-collapse :deep(.ant-collapse-header) { padding: 14px 14px !important; }
.group-collapse :deep(.ant-collapse-content-box) { padding: 0 14px 14px !important; }
.group-collapse :deep(.ant-collapse-arrow) { inset-inline-end: 14px !important; }
.remaining-mini {
  background: rgba(37, 99, 235, 0.06);
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 14px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.group-kv {
  background: #f8fafc;
  border-radius: 14px;
  padding: 14px; /* a bit more than other cards */
}

.triple-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px; /* bigger gap so inputs aren't cramped */
}

@media (max-width: 380px) {
  .triple-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

:deep(.group-kv .ant-input-number),
:deep(.group-kv .ant-input) {
  width: 100%;
}

:deep(.group-kv .ant-form-item) {
  margin-bottom: 10px;
}

/* Main product info: force InputNumber full width on mobile */
.main-product-form :deep(.ant-input-number),
.main-product-form :deep(.ant-input) {
  width: 100%;
}

/* Price details (single tab): make InputNumber truly full width on mobile */
.price-details-form :deep(.ant-input-number),
.price-details-form :deep(.ant-input) {
  width: 100%;
}
.price-details-form :deep(.ant-input-number-input) {
  width: 100%;
}

/* Added today spacing */
.today-section { margin-top: 20px; }

/* Mobile "Added today" list style */
.today-mobile { margin-top: 4px; }
.mobile-header { padding-right: 8px; }
.mobile-body { padding: 2px 0 6px; }
.mobile-kv {
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px;
}
.kv-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; }
.kv-label { color: #64748b; font-weight: 800; font-size: 12px; }
.kv-value { color: #0f172a; font-weight: 900; }
.kv-actions { display: flex; justify-content: flex-end; gap: 6px; }

.today-collapse :deep(.ant-collapse-item) {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
  margin-bottom: 12px;
}
.today-collapse :deep(.ant-collapse-header) {
  padding: 14px 14px !important;
}
.today-collapse :deep(.ant-collapse-content-box) {
  padding: 0 14px 14px !important;
}
.today-collapse :deep(.ant-collapse-arrow) {
  inset-inline-end: 14px !important;
}

@media (max-width: 768px) {
  .sticky-card { position: static; }
  .group-grid { grid-template-columns: 1fr; }
  .group-grid.header { display: none; }
}
</style>
