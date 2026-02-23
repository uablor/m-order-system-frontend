<template>
  <div class="merchant-detail">
    <!-- Header -->
    <div class="detail-header">
      <a-button type="text" class="back-btn" @click="goBack">
        <ArrowLeftOutlined />
        <span class="back-text">{{ $t('merchants.detail.back') }}</span>
      </a-button>
      <div class="header-title">
        <h2 class="page-title">{{ $t('merchants.detail.pageTitle') }}</h2>
        <a-tag v-if="merchant" :color="merchant.isActive ? 'success' : 'default'" class="status-pill">
          {{ merchant.isActive ? $t('merchants.active') : $t('merchants.inactive') }}
        </a-tag>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-wrap">
      <a-spin size="large" />
    </div>

    <!-- Error -->
    <a-result v-else-if="error" status="error" :title="$t('error.unknown')" :sub-title="$t('merchants.detail.back')">
      <template #extra>
        <a-button type="primary" @click="goBack">{{ $t('merchants.detail.back') }}</a-button>
      </template>
    </a-result>

    <!-- Content -->
    <template v-else-if="merchant">
      <!-- Row 1: Shop info + Owner -->
      <a-row :gutter="[16, 16]" class="section-row">
        <!-- Shop info -->
        <a-col :xs="24" :lg="14" >
          <a-card :bordered="false" class="info-card shop-card">
            <template #title>
              <div class="card-title-row">
                <ShopOutlined class="card-icon shop-icon" />
                <span>{{ $t('merchants.detail.shopInfo') }}</span>
              </div>
            </template>
            <div class="shop-header-block">
              <a-avatar :size="56" shape="square" :src="merchant.shopLogoUrl || undefined" class="shop-avatar-lg">
                <template #icon><ShopOutlined /></template>
              </a-avatar>
              <div class="shop-name-block">
                <div class="shop-name">{{ merchant.shopName }}</div>
                <div class="shop-currency">
                  <a-tag color="blue">{{ merchant.defaultCurrency }}</a-tag>
                </div>
              </div>
            </div>
            <a-divider style="margin: 12px 0" />
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">{{ $t('merchants.shopAddress') }}</span>
                <span class="info-value">{{ merchant.shopAddress || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('merchants.contactPhone') }}</span>
                <span class="info-value">{{ merchant.contactPhone || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('merchants.contactEmail') }}</span>
                <span class="info-value">{{ merchant.contactEmail || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Facebook</span>
                <span class="info-value">{{ merchant.contactFacebook || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Line</span>
                <span class="info-value">{{ merchant.contactLine || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">WhatsApp</span>
                <span class="info-value">{{ merchant.contactWhatsapp || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('merchants.createdAt') }}</span>
                <span class="info-value">{{ formatDate(merchant.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('merchants.updatedAt') }}</span>
                <span class="info-value">{{ formatDate(merchant.updatedAt) }}</span>
              </div>
            </div>
          </a-card>
        </a-col>

        <!-- Owner info -->
        <a-col :xs="24" :lg="10">
          <a-card :bordered="false" class="info-card owner-card">
            <template #title>
              <div class="card-title-row">
                <UserOutlined class="card-icon owner-icon" />
                <span>{{ $t('merchants.detail.ownerInfo') }}</span>
              </div>
            </template>
            <template v-if="owner">
              <div class="owner-header">
                <a-avatar :size="48" class="owner-avatar">
                  {{ ownerInitials }}
                </a-avatar>
                <div class="owner-meta">
                  <div class="owner-name">{{ owner.fullName }}</div>
                  <div class="owner-email">{{ owner.email }}</div>
                </div>
                <a-tag :color="owner.isActive ? 'success' : 'default'" class="status-pill">
                  {{ owner.isActive ? $t('merchants.active') : $t('merchants.inactive') }}
                </a-tag>
              </div>
              <a-divider style="margin: 12px 0" />
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">{{ $t('merchants.detail.ownerRole') }}</span>
                  <span class="info-value">{{ owner.roleName || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">{{ $t('merchants.detail.ownerLastLogin') }}</span>
                  <span class="info-value">{{ owner.lastLogin ? formatDate(owner.lastLogin) : $t('merchants.detail.neverLoggedIn') }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">{{ $t('merchants.detail.ownerCreatedAt') }}</span>
                  <span class="info-value">{{ formatDate(owner.createdAt) }}</span>
                </div>
              </div>
            </template>
            <a-empty v-else :description="$t('merchants.detail.noOwner')" />
          </a-card>
        </a-col>
      </a-row>

      <!-- Row 2: Customer summary + Financial summary -->
      <a-row :gutter="[16, 16]" class="section-row summary-equal-row">
        <!-- Customer summary -->
        <a-col :xs="24" :lg="10" class="define-top-margin">
          <a-card :bordered="false" class="info-card summary-card">
            <template #title>
              <div class="card-title-row">
                <TeamOutlined class="card-icon cust-icon" />
                <span>{{ $t('merchants.detail.customerSummary') }}</span>
              </div>
            </template>
            <div class="stat-grid" v-if="summary">
              <div class="stat-item primary">
                <div class="stat-num">{{ summary.totalCustomers }}</div>
                <div class="stat-label">{{ $t('merchants.detail.totalCustomers') }}</div>
              </div>
              <div class="stat-item success">
                <div class="stat-num">{{ summary.activeCustomers }}</div>
                <div class="stat-label">{{ $t('merchants.detail.activeCustomers') }}</div>
              </div>
              <div class="stat-item muted">
                <div class="stat-num">{{ summary.inactiveCustomers }}</div>
                <div class="stat-label">{{ $t('merchants.detail.inactiveCustomers') }}</div>
              </div>
              <div class="stat-item purple">
                <div class="stat-num">{{ summary.customerTypeCustomer }}</div>
                <div class="stat-label">{{ $t('merchants.detail.typeCustomer') }}</div>
              </div>
              <div class="stat-item orange">
                <div class="stat-num">{{ summary.customerTypeAgent }}</div>
                <div class="stat-label">{{ $t('merchants.detail.typeAgent') }}</div>
              </div>
            </div>
          </a-card>
        </a-col>

        <!-- Financial summary -->
        <a-col :xs="24" :lg="14" class="define-top-margin">
          <a-card :bordered="false" class="info-card finance-card">
            <template #title>
              <div class="card-title-row">
                <DollarOutlined class="card-icon fin-icon" />
                <span>{{ $t('merchants.detail.financialSummary') }}</span>
              </div>
            </template>
            <div v-if="financial" class="fin-content">
              <!-- Order stats row -->
              <div class="fin-orders-row">
                <div class="fin-pill total">
                  <span class="fin-pill-num">{{ financial.totalOrders }}</span>
                  <span class="fin-pill-label">{{ $t('merchants.detail.totalOrders') }}</span>
                </div>
                <div class="fin-pill unpaid">
                  <span class="fin-pill-num">{{ financial.ordersUnpaid }}</span>
                  <span class="fin-pill-label">{{ $t('merchants.detail.ordersUnpaid') }}</span>
                </div>
                <div class="fin-pill partial">
                  <span class="fin-pill-num">{{ financial.ordersPartial }}</span>
                  <span class="fin-pill-label">{{ $t('merchants.detail.ordersPartial') }}</span>
                </div>
                <div class="fin-pill paid">
                  <span class="fin-pill-num">{{ financial.ordersPaid }}</span>
                  <span class="fin-pill-label">{{ $t('merchants.detail.ordersPaid') }}</span>
                </div>
              </div>

              <a-divider style="margin: 12px 0" />

              <!-- Money table -->
              <div class="fin-table">
                <div class="fin-row head">
                  <span class="fin-cell"></span>
                  <span class="fin-cell">{{ $t('merchants.detail.lak') }}</span>
                  <span class="fin-cell">{{ $t('merchants.detail.thb') }}</span>
                </div>
                <div class="fin-row income">
                  <span class="fin-cell label">{{ $t('merchants.detail.totalIncome') }}</span>
                  <span class="fin-cell num">{{ fmtMoney(financial.totalIncomeLak) }}</span>
                  <span class="fin-cell num">{{ fmtMoney(financial.totalIncomeThb) }}</span>
                </div>
                <div class="fin-row expense">
                  <span class="fin-cell label">{{ $t('merchants.detail.totalExpense') }}</span>
                  <span class="fin-cell num">{{ fmtMoney(financial.totalExpenseLak) }}</span>
                  <span class="fin-cell num">{{ fmtMoney(financial.totalExpenseThb) }}</span>
                </div>
                <div class="fin-row profit">
                  <span class="fin-cell label">{{ $t('merchants.detail.totalProfit') }}</span>
                  <span class="fin-cell num bold">{{ fmtMoney(financial.totalProfitLak) }}</span>
                  <span class="fin-cell num bold">{{ fmtMoney(financial.totalProfitThb) }}</span>
                </div>
              </div>

              <a-divider style="margin: 12px 0" />

              <div class="fin-bottom-row">
                <div class="fin-bottom-item success">
                  <span class="fin-bottom-label">{{ $t('merchants.detail.totalPaidAmount') }}</span>
                  <span class="fin-bottom-num">{{ fmtMoney(financial.totalPaidAmount) }}</span>
                </div>
                <div class="fin-bottom-item danger">
                  <span class="fin-bottom-label">{{ $t('merchants.detail.totalRemainingAmount') }}</span>
                  <span class="fin-bottom-num">{{ fmtMoney(financial.totalRemainingAmount) }}</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import {
  ArrowLeftOutlined,
  ShopOutlined,
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
} from '@ant-design/icons-vue';
import { useMerchantDetail } from '@/presentation/composables/super-admin/useMerchantDetail';

const route = useRoute();
const router = useRouter();
useI18n();
const {
  loading,
  error,
  merchant,
  summary,
  financial,
  owner,
  fetchDetail,
} = useMerchantDetail();

const merchantId = computed(() => Number(route.params.id));

const ownerInitials = computed(() => {
  if (!owner.value?.fullName) return '?';
  return owner.value.fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const formatDate = (d: string) => dayjs(d).format('YYYY-MM-DD HH:mm');

const fmtMoney = (v: number) => {
  if (v == null) return '0';
  return v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const goBack = () => router.push({ name: 'super-admin-merchants' });

onMounted(() => {
  if (merchantId.value) fetchDetail(merchantId.value);
});
</script>

<style scoped>
.merchant-detail {
  max-width: 1200px;
  margin: 0 auto;
}

/* === Header === */
.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.back-btn {
  border-radius: 10px;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
}
.back-btn:hover { color: #1d4ed8; background: rgba(29, 78, 216, 0.06); }
.header-title { display: flex; align-items: center; gap: 10px; flex: 1; }
.page-title { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0; }
.status-pill { border-radius: 999px; font-weight: 700; font-size: 12px; }

.define-top-margin {
  padding-top: 10px;
}

/* === Loading === */
.loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 0;
}

/* === Cards === */
.section-row { margin-bottom: 0; }
.info-card {
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 6px 20px rgba(15, 23, 42, 0.04);
  
  height: 100%;
}
.info-card :deep(.ant-card-head) {
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  padding: 12px 20px;
  min-height: auto;
}
.info-card :deep(.ant-card-head-title) { padding: 0; }
.info-card :deep(.ant-card-body) { padding: 16px 20px; }

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}
.card-icon { font-size: 18px; }
.shop-icon { color: #6366f1; }
.owner-icon { color: #0ea5e9; }
.cust-icon { color: #f59e0b; }
.fin-icon { color: #22c55e; }

/* === Shop info === */
.shop-header-block {
  display: flex;
  align-items: center;
  gap: 14px;
}
.shop-avatar-lg {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  flex-shrink: 0;
}
.shop-name-block { flex: 1; min-width: 0; }
.shop-name { font-size: 18px; font-weight: 700; color: #0f172a; }
.shop-currency { margin-top: 4px; }

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 24px;
}
.info-item { display: flex; flex-direction: column; gap: 2px; }
.info-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.3px; }
.info-value { font-size: 14px; font-weight: 600; color: #1e293b; word-break: break-word; }

/* === Owner === */
.owner-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.owner-avatar {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}
.owner-meta { flex: 1; min-width: 0; }
.owner-name { font-size: 16px; font-weight: 700; color: #0f172a; }
.owner-email { font-size: 13px; color: #64748b; margin-top: 2px; }

/* === Summary equal height === */
.summary-equal-row :deep(.ant-col) { display: flex; }
.summary-equal-row .info-card { flex: 1; display: flex; flex-direction: column; }
.summary-equal-row .info-card :deep(.ant-card-body) { flex: 1; }

/* === Stat grid === */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.stat-item {
  text-align: center;
  padding: 14px 8px;
  border-radius: 12px;
  background: #f8fafc;
}
.stat-item.primary { background: rgba(59, 130, 246, 0.08); }
.stat-item.success { background: rgba(34, 197, 94, 0.08); }
.stat-item.muted { background: rgba(148, 163, 184, 0.1); }
.stat-item.purple { background: rgba(139, 92, 246, 0.08); }
.stat-item.orange { background: rgba(245, 158, 11, 0.08); }
.stat-num { font-size: 26px; font-weight: 800; color: #0f172a; line-height: 1.2; }
.stat-label { font-size: 11px; font-weight: 600; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.2px; }

/* === Financial === */
.fin-orders-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.fin-pill {
  flex: 1 1 0;
  min-width: 80px;
  text-align: center;
  padding: 10px 6px;
  border-radius: 12px;
  background: #f8fafc;
}
.fin-pill.total { background: rgba(59, 130, 246, 0.08); }
.fin-pill.unpaid { background: rgba(239, 68, 68, 0.08); }
.fin-pill.partial { background: rgba(245, 158, 11, 0.08); }
.fin-pill.paid { background: rgba(34, 197, 94, 0.08); }
.fin-pill-num { font-size: 22px; font-weight: 800; color: #0f172a; display: block; }
.fin-pill-label { font-size: 11px; font-weight: 600; color: #64748b; display: block; margin-top: 2px; }

.fin-table { display: flex; flex-direction: column; gap: 0; }
.fin-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}
.fin-row.head { border-bottom: 2px solid rgba(148, 163, 184, 0.2); }
.fin-row:last-child { border-bottom: none; }
.fin-cell { font-size: 13px; color: #64748b; font-weight: 600; }
.fin-cell.label { color: #334155; }
.fin-cell.num { text-align: right; color: #0f172a; font-variant-numeric: tabular-nums; }
.fin-cell.bold { font-weight: 800; }
.fin-row.head .fin-cell { font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; color: #94a3b8; text-align: right; }
.fin-row.head .fin-cell:first-child { text-align: left; }
.fin-row.income .fin-cell.label { color: #22c55e; }
.fin-row.expense .fin-cell.label { color: #ef4444; }
.fin-row.profit .fin-cell.label { color: #3b82f6; font-weight: 800; }

.fin-bottom-row {
  display: flex;
  gap: 12px;
}
.fin-bottom-item {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  text-align: center;
}
.fin-bottom-item.success { background: rgba(34, 197, 94, 0.08); }
.fin-bottom-item.danger { background: rgba(239, 68, 68, 0.08); }
.fin-bottom-label { font-size: 11px; font-weight: 600; color: #64748b; display: block; text-transform: uppercase; }
.fin-bottom-num { font-size: 20px; font-weight: 800; display: block; margin-top: 4px; }
.fin-bottom-item.success .fin-bottom-num { color: #16a34a; }
.fin-bottom-item.danger .fin-bottom-num { color: #dc2626; }


/* === Mobile responsive === */
@media (max-width: 767px) {
  .merchant-detail { padding: 0 2px; }
  .page-title { font-size: 16px; }
  .back-text { display: none; }
  .back-btn { padding: 4px 8px; }

  .info-card :deep(.ant-card-head) { padding: 10px 14px; }
  .info-card :deep(.ant-card-body) { padding: 12px 14px; }

  .info-grid { grid-template-columns: 1fr; gap: 8px; }

  .shop-header-block { flex-wrap: wrap; }

  .owner-header { flex-wrap: wrap; }

  .stat-grid { grid-template-columns: repeat(2, 1fr); }

  .fin-orders-row { flex-wrap: wrap; }
  .fin-pill { min-width: calc(50% - 4px); }
  .fin-row { grid-template-columns: 1fr 1fr 1fr; gap: 4px; }
  .fin-cell { font-size: 12px; }
  .fin-bottom-row { flex-direction: column; gap: 8px; }
}
</style>
