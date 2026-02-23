<template>
  <div class="order-detail-page">
    <a-breadcrumb class="mb-3">
      <a-breadcrumb-item>{{ $t('merchant.breadcrumbs.home') }}</a-breadcrumb-item>
      <a-breadcrumb-item>
        <router-link to="/merchant/orders">{{ $t('merchant.orderDetail.breadcrumbOrders') }}</router-link>
      </a-breadcrumb-item>
      <a-breadcrumb-item>{{ $t('merchant.orderDetail.breadcrumbDetail') }}</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-head">
      <a-button type="text" class="back-btn" @click="goBack">
        <ArrowLeftOutlined />
        {{ $t('merchant.orderDetail.back') }}
      </a-button>
    </div>

    <a-spin :spinning="loading">
      <a-empty v-if="!loading && !order" :description="$t('merchant.orderDetail.notFound')" />

      <template v-if="order">
        <!-- Order Info Card -->
        <a-card :bordered="false" class="panel-card mb-4">
          <div class="panel-title">
            <FileTextOutlined class="icon-blue" />
            <span>{{ $t('merchant.orderDetail.orderInfo') }}</span>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">{{ $t('merchant.orderDetail.orderCode') }}</span>
              <span class="info-value order-code">{{ order.orderCode }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('merchant.orderDetail.orderDate') }}</span>
              <span class="info-value">{{ formatDate(order.orderDate) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('merchant.orderDetail.arrivalStatus') }}</span>
              <span class="info-value">
                <a-tag :color="order.arrivalStatus === 'ARRIVED' ? 'green' : 'default'" class="pill-tag">
                  {{ order.arrivalStatus === 'ARRIVED' ? $t('merchant.orderDetail.arrivalArrived') : $t('merchant.orderDetail.arrivalNotArrived') }}
                </a-tag>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('merchant.orderDetail.paymentStatus') }}</span>
              <span class="info-value">
                <a-tag :color="paymentColor(order.paymentStatus)" class="pill-tag">
                  {{ paymentLabel(order.paymentStatus) }}
                </a-tag>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('merchant.orderDetail.createdBy') }}</span>
              <span class="info-value">{{ order.createdByUser?.fullName || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('merchant.orderDetail.createdAt') }}</span>
              <span class="info-value">{{ formatDateTime(order.createdAt) }}</span>
            </div>
            <div v-if="order.arrivedAt" class="info-item">
              <span class="info-label">{{ $t('merchant.orderDetail.arrivedAt') }}</span>
              <span class="info-value">{{ formatDateTime(order.arrivedAt) }}</span>
            </div>
            <div v-if="order.notifiedAt" class="info-item">
              <span class="info-label">{{ $t('merchant.orderDetail.notifiedAt') }}</span>
              <span class="info-value">{{ formatDateTime(order.notifiedAt) }}</span>
            </div>
          </div>
        </a-card>

        <!-- Financial Summary: Purchase Cost -->
        <a-card :bordered="false" class="panel-card mb-4">
          <div class="panel-title">
            <DollarOutlined class="icon-blue" />
            <span>{{ $t('merchant.orderDetail.financialSummary') }} — {{ $t('merchant.orderDetail.purchaseCostTitle') }}</span>
          </div>
          <div class="finance-grid">
            <div class="finance-item">
              <span class="finance-label">{{ $t('merchant.orderDetail.totalPurchaseCost') }}</span>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.totalPurchaseCostLak) }} LAK</template><span class="finance-value num-truncate">{{ truncNum(order.totalPurchaseCostLak) }} LAK</span></a-tooltip>
            </div>
            <div class="finance-item">
              <span class="finance-label">{{ $t('merchant.orderDetail.totalShippingCost') }}</span>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.totalShippingCostLak) }} LAK</template><span class="finance-value num-truncate">{{ truncNum(order.totalShippingCostLak) }} LAK</span></a-tooltip>
            </div>
            <div class="finance-item">
              <span class="finance-label">{{ $t('merchant.orderDetail.totalCostBeforeDiscount') }}</span>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.totalCostBeforeDiscountLak) }} LAK</template><span class="finance-value num-truncate">{{ truncNum(order.totalCostBeforeDiscountLak) }} LAK</span></a-tooltip>
            </div>
            <div class="finance-item">
              <span class="finance-label">{{ $t('merchant.orderDetail.totalDiscount') }}</span>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.totalDiscountLak) }} LAK</template><span class="finance-value num-truncate">-{{ truncNum(order.totalDiscountLak) }} LAK</span></a-tooltip>
            </div>
            <div class="finance-item highlight">
              <span class="finance-label">{{ $t('merchant.orderDetail.totalFinalCost') }}</span>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.totalFinalCostLak) }} LAK</template><span class="finance-value num-truncate">{{ truncNum(order.totalFinalCostLak) }} LAK</span></a-tooltip>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.totalFinalCostThb) }} THB</template><span class="finance-sub num-truncate">{{ truncNum(order.totalFinalCostThb) }} THB</span></a-tooltip>
            </div>
          </div>
        </a-card>

        <!-- Financial Summary: Selling & Profit -->
        <a-card :bordered="false" class="panel-card mb-4">
          <div class="panel-title">
            <DollarOutlined class="icon-blue" />
            <span>{{ $t('merchant.orderDetail.financialSummary') }} — {{ $t('merchant.orderDetail.sellingProfitTitle') }}</span>
          </div>
          <div class="finance-grid">
            <div class="finance-item">
              <span class="finance-label">{{ $t('merchant.orderDetail.totalSellingAmount') }}</span>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.totalSellingAmountLak) }} LAK</template><span class="finance-value num-truncate">{{ truncNum(order.totalSellingAmountLak) }} LAK</span></a-tooltip>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.totalSellingAmountThb) }} THB</template><span class="finance-sub num-truncate">{{ truncNum(order.totalSellingAmountThb) }} THB</span></a-tooltip>
            </div>
            <div class="finance-item" :class="{ 'profit-positive-bg': Number(order.totalProfitLak) >= 0, 'profit-negative-bg': Number(order.totalProfitLak) < 0 }">
              <span class="finance-label">{{ $t('merchant.orderDetail.totalProfit') }}</span>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.totalProfitLak) }} LAK</template><span class="finance-value num-truncate">{{ truncNum(order.totalProfitLak) }} LAK</span></a-tooltip>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.totalProfitThb) }} THB</template><span class="finance-sub num-truncate">{{ truncNum(order.totalProfitThb) }} THB</span></a-tooltip>
            </div>
            <div class="finance-item">
              <span class="finance-label">{{ $t('merchant.orderDetail.depositAmount') }}</span>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.depositAmount) }} LAK</template><span class="finance-value num-truncate">{{ truncNum(order.depositAmount) }} LAK</span></a-tooltip>
            </div>
            <div class="finance-item">
              <span class="finance-label">{{ $t('merchant.orderDetail.paidAmount') }}</span>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.paidAmount) }} LAK</template><span class="finance-value num-truncate">{{ truncNum(order.paidAmount) }} LAK</span></a-tooltip>
            </div>
            <div class="finance-item">
              <span class="finance-label">{{ $t('merchant.orderDetail.remainingAmount') }}</span>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.remainingAmount) }} LAK</template><span class="finance-value remaining num-truncate">{{ truncNum(order.remainingAmount) }} LAK</span></a-tooltip>
            </div>
          </div>
        </a-card>

        <!-- Order Items Card -->
        <a-card :bordered="false" class="panel-card mb-4">
          <div class="panel-title">
            <ShoppingOutlined class="icon-blue" />
            <span>{{ $t('merchant.orderDetail.orderItems') }}</span>
            <a-tag class="count-tag">{{ order.orderItems?.length || 0 }}</a-tag>
          </div>

          <a-empty v-if="!order.orderItems || order.orderItems.length === 0" :description="$t('merchant.orderDetail.noItems')" />

          <div v-if="order.orderItems && order.orderItems.length > 0" class="items-cards">
            <div v-for="(item, idx) in order.orderItems" :key="item.id" class="oi-card">
              <div class="oi-card-header">
                <span class="item-num">#{{ idx + 1 }}</span>
                <span class="item-name">{{ item.productName }}</span>
                <span v-if="item.variant" class="item-variant">({{ item.variant }})</span>
              </div>

              <div class="oi-info-row">
                <div class="oi-info-item"><span class="oi-label">{{ $t('merchant.orderDetail.quantity') }}</span><span class="oi-val">{{ item.quantity }}</span></div>
                <div class="oi-info-item"><span class="oi-label">{{ $t('merchant.orderDetail.quantityRemaining') }}</span><span class="oi-val">{{ item.quantityRemaining ?? '-' }}</span></div>
              </div>

              <!-- Purchase Section -->
              <div class="oi-section">
                <div class="oi-section-title purchase">{{ $t('merchant.orderDetail.sectionPurchase') }}</div>
                <div class="oi-info-row">
                  <div class="oi-info-item"><span class="oi-label">{{ $t('merchant.orderDetail.purchasePrice') }} ({{ item.purchaseCurrency || '-' }})</span><span class="oi-val">{{ formatNumber(item.purchasePrice) }}</span></div>
                  <div class="oi-info-item"><span class="oi-label">{{ $t('merchant.orderDetail.purchaseExchangeRate') }}</span><span class="oi-val">{{ formatNumber(item.purchaseExchangeRate) }}</span></div>
                  <div class="oi-info-item"><span class="oi-label">{{ $t('merchant.orderDetail.purchaseTotalLak') }}</span><span class="oi-val">{{ formatNumber(item.purchaseTotalLak) }}</span></div>
                </div>
                <div class="oi-info-row">
                  <div class="oi-info-item"><span class="oi-label">{{ $t('merchant.orderDetail.shippingPrice') }} ({{ item.purchaseCurrency || '-' }})</span><span class="oi-val">{{ formatNumber(item.shippingPrice) }}</span></div>
                  <div class="oi-info-item"><span class="oi-label">{{ $t('merchant.orderDetail.shippingLak') }}</span><span class="oi-val">{{ formatNumber(item.shippingLak) }}</span></div>
                  <div class="oi-info-item"><span class="oi-label">{{ $t('merchant.orderDetail.costBeforeDiscount') }}</span><span class="oi-val">{{ formatNumber(item.totalCostBeforeDiscountLak) }}</span></div>
                </div>
              </div>

              <!-- Discount Section -->
              <div v-if="item.discountType" class="oi-section">
                <div class="oi-section-title discount">{{ $t('merchant.orderDetail.sectionDiscount') }}</div>
                <div class="oi-info-row">
                  <div class="oi-info-item"><span class="oi-label">{{ $t('merchant.orderDetail.discountType') }}</span><span class="oi-val">{{ item.discountType }}</span></div>
                  <div class="oi-info-item"><span class="oi-label">{{ $t('merchant.orderDetail.discountValue') }}</span><span class="oi-val">{{ formatNumber(item.discountValue) }}</span></div>
                  <div class="oi-info-item"><span class="oi-label">{{ $t('merchant.orderDetail.discountAmount') }}</span><span class="oi-val">-{{ formatNumber(item.discountAmountLak) }}</span></div>
                </div>
              </div>

              <!-- Final Cost -->
              <div class="oi-info-row highlight-row">
                <div class="oi-info-item"><span class="oi-label">{{ $t('merchant.orderDetail.finalCostLak') }}</span><span class="oi-val highlight-val">{{ formatNumber(item.finalCostLak) }}</span></div>
                <div class="oi-info-item"><span class="oi-label">{{ $t('merchant.orderDetail.finalCostThb') }}</span><span class="oi-val highlight-val">{{ formatNumber(item.finalCostThb) }}</span></div>
              </div>

              <!-- Selling Section -->
              <div class="oi-section">
                <div class="oi-section-title selling">{{ $t('merchant.orderDetail.sectionSelling') }}</div>
                <div class="oi-info-row">
                  <div class="oi-info-item"><span class="oi-label">{{ $t('merchant.orderDetail.sellingPrice') }}</span><span class="oi-val">{{ formatNumber(item.sellingPriceForeign) }}</span></div>
                  <div class="oi-info-item"><span class="oi-label">{{ $t('merchant.orderDetail.sellingRate') }}</span><span class="oi-val">{{ formatNumber(item.sellingExchangeRate) }}</span></div>
                  <div class="oi-info-item"><span class="oi-label">{{ $t('merchant.orderDetail.sellingTotalLak') }}</span><span class="oi-val">{{ formatNumber(item.sellingTotalLak) }}</span></div>
                </div>
              </div>

              <!-- Profit -->
              <div class="oi-info-row" :class="{ 'profit-pos-row': Number(item.profitLak) >= 0, 'profit-neg-row': Number(item.profitLak) < 0 }">
                <div class="oi-info-item"><span class="oi-label">{{ $t('merchant.orderDetail.profitLak') }}</span><span class="oi-val profit-val">{{ formatNumber(item.profitLak) }}</span></div>
                <div class="oi-info-item"><span class="oi-label">{{ $t('merchant.orderDetail.profitThb') }}</span><span class="oi-val profit-val">{{ formatNumber(item.profitThb) }}</span></div>
              </div>
            </div>
          </div>
        </a-card>

        <!-- Customer Orders Card -->
        <a-card :bordered="false" class="panel-card mb-4">
          <div class="panel-title">
            <TeamOutlined class="icon-blue" />
            <span>{{ $t('merchant.orderDetail.customerOrders') }}</span>
            <a-tag class="count-tag">{{ order.customerOrders?.length || 0 }}</a-tag>
          </div>

          <a-empty v-if="!order.customerOrders || order.customerOrders.length === 0" :description="$t('merchant.orderDetail.noCustomerOrders')" />

          <div v-for="co in order.customerOrders" :key="co.id" class="co-block">
            <div class="co-header">
              <div class="co-customer-info">
                <span class="co-customer-name">{{ co.customer?.customerName || $t('merchant.orderDetail.unknownCustomer') }}</span>
                <a-tag v-if="co.customer?.customerType" :color="co.customer.customerType === 'AGENT' ? 'purple' : 'blue'" class="pill-tag">
                  {{ co.customer.customerType }}
                </a-tag>
              </div>
              <a-tag :color="paymentColor(co.paymentStatus)" class="pill-tag">
                {{ paymentLabel(co.paymentStatus) }}
              </a-tag>
            </div>

            <div class="co-finance-row">
              <div class="co-fin-item">
                <span class="co-fin-label">{{ $t('merchant.orderDetail.sellingAmountLak') }}</span>
                <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(co.totalSellingAmountLak) }}</template><span class="co-fin-value num-truncate">{{ truncNum(co.totalSellingAmountLak) }}</span></a-tooltip>
              </div>
              <div class="co-fin-item">
                <span class="co-fin-label">{{ $t('merchant.orderDetail.paid') }}</span>
                <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(co.paidAmount) }}</template><span class="co-fin-value num-truncate">{{ truncNum(co.paidAmount) }}</span></a-tooltip>
              </div>
              <div class="co-fin-item">
                <span class="co-fin-label">{{ $t('merchant.orderDetail.remaining') }}</span>
                <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(co.remainingAmount) }}</template><span class="co-fin-value remaining num-truncate">{{ truncNum(co.remainingAmount) }}</span></a-tooltip>
              </div>
            </div>

            <!-- Customer Order Items -->
            <template v-if="co.customerOrderItems && co.customerOrderItems.length > 0">
              <div class="co-items-title">{{ $t('merchant.orderDetail.items') }}</div>

              <a-table
                v-if="!isMobile"
                :columns="coItemColumns"
                :data-source="co.customerOrderItems"
                :pagination="false"
                row-key="id"
                size="small"
              >
                <template #bodyCell="{ column, record: coItem }">
                  <template v-if="column.key === 'orderItem'">
                    {{ getCoItemProductName(coItem) }}
                  </template>
                  <template v-else-if="column.key === 'sellingPriceLak'">
                    {{ formatNumber(coItem.sellingTotalLak) }}
                  </template>
                  <template v-else-if="column.key === 'profitLak'">
                    <span :class="{ 'profit-positive': Number(coItem.profitLak) >= 0, 'profit-negative': Number(coItem.profitLak) < 0 }">
                      {{ formatNumber(coItem.profitLak) }}
                    </span>
                  </template>
                </template>
              </a-table>

              <div v-if="isMobile" class="co-items-mobile">
                <div v-for="coItem in co.customerOrderItems" :key="coItem.id" class="co-item-card">
                  <div class="co-item-name">{{ getCoItemProductName(coItem) }}</div>
                  <div class="co-item-details">
                    <span>{{ $t('merchant.orderDetail.qty') }}: {{ coItem.quantity }}</span>
                    <span>{{ formatNumber(coItem.sellingTotalLak) }} LAK</span>
                  </div>
                  <div class="co-item-details">
                    <span>{{ $t('merchant.orderDetail.profitLak') }}</span>
                    <span :class="{ 'profit-positive': Number(coItem.profitLak) >= 0, 'profit-negative': Number(coItem.profitLak) < 0 }">{{ formatNumber(coItem.profitLak) }} LAK</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </a-card>
      </template>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  DollarOutlined,
  ShoppingOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue';
import { orderRepository } from '@/infrastructure/repositories/order.repository';
import type { Order, PaymentStatusEnum } from '@/domain/entities/user.entity';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import { handleApiError } from '@/shared/utils/error';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { isMobile } = useIsMobile();

const loading = ref(false);
const order = ref<Order | null>(null);

const coItemColumns = computed(() => [
  { title: t('merchant.orderDetail.colProduct'), key: 'orderItem' },
  { title: t('merchant.orderDetail.quantity'), key: 'quantity', dataIndex: 'quantity', width: 80, align: 'center' as const },
  { title: t('merchant.orderDetail.sellingPriceLak'), key: 'sellingPriceLak', width: 150, align: 'right' as const },
  { title: t('merchant.orderDetail.profitLak'), key: 'profitLak', width: 150, align: 'right' as const },
]);

const paymentColor = (status: PaymentStatusEnum) => {
  if (status === 'PAID') return 'green';
  if (status === 'PARTIAL') return 'orange';
  return 'red';
};
const paymentLabel = (status: PaymentStatusEnum) => {
  if (status === 'PAID') return t('merchant.orderDetail.paymentPaid');
  if (status === 'PARTIAL') return t('merchant.orderDetail.paymentPartial');
  return t('merchant.orderDetail.paymentUnpaid');
};

const formatNumber = (val: string | number) => Number(val || 0).toLocaleString();
const truncNum = (val: string | number, maxLen = 12) => {
  const formatted = Number(val || 0).toLocaleString();
  return formatted.length > maxLen ? formatted.slice(0, maxLen) + '…' : formatted;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
};

const getOrderItemName = (orderItemId: number) => {
  const item = order.value?.orderItems?.find(i => i.id === orderItemId);
  if (!item) return `#${orderItemId}`;
  return item.variant ? `${item.productName} (${item.variant})` : item.productName;
};

const getCoItemProductName = (coItem: any) => {
  if (coItem.orderItem?.productName) {
    const oi = coItem.orderItem;
    return oi.variant ? `${oi.productName} (${oi.variant})` : oi.productName;
  }
  if (coItem.productName) {
    return coItem.variant ? `${coItem.productName} (${coItem.variant})` : coItem.productName;
  }
  return getOrderItemName(coItem.orderItemId);
};

const goBack = () => {
  router.push('/merchant/orders');
};

const fetchOrder = async () => {
  const id = Number(route.params.id);
  if (!id) return;
  loading.value = true;
  try {
    order.value = await orderRepository.getById(id);
  } catch (err) {
    handleApiError(err, t);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchOrder();
});
</script>

<style scoped>
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }

.page-head {
  margin-bottom: 16px;
}
.back-btn {
  font-weight: 700;
  color: #1d4ed8;
  border-radius: 10px;
  padding: 4px 12px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.back-btn:hover { background: rgba(29, 78, 216, 0.08) !important; }

.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.panel-title {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.icon-blue { color: #1d4ed8; font-size: 18px; }
.count-tag {
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  background: #eff6ff;
  color: #1d4ed8;
  border: none;
}

.order-code { font-weight: 700; color: #1d4ed8; }
.pill-tag { border-radius: 999px; padding: 2px 10px; font-weight: 800; font-size: 12px; }

/* Order Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-label {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.info-value {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}
/* Financial Grid */
.finance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.finance-item {
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.finance-item.highlight {
  background: #eff6ff;
  border-color: rgba(29, 78, 216, 0.15);
}
.finance-item.profit-positive-bg {
  background: #f0fdf4;
  border-color: rgba(22, 163, 74, 0.15);
}
.finance-item.profit-negative-bg {
  background: #fef2f2;
  border-color: rgba(220, 38, 38, 0.15);
}
.finance-label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.finance-value {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}
.finance-value.remaining { color: #dc2626; }
.finance-sub {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

/* Order Items */
.item-name { font-weight: 700; color: #0f172a; }
.item-variant { color: #64748b; font-size: 13px; margin-left: 4px; }
.item-num { font-weight: 800; color: #1d4ed8; font-size: 13px; }

.items-cards { display: flex; flex-direction: column; gap: 14px; }
.oi-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 18px 20px 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  transition: box-shadow 0.15s ease;
}
.oi-card:hover { box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06); }
.oi-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.oi-section {
  margin: 8px 0;
  padding: 10px 14px 6px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.oi-section-title {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.oi-section-title.purchase { color: #1d4ed8; }
.oi-section-title.selling { color: #059669; }
.oi-section-title.discount { color: #d97706; }

.oi-info-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px 16px;
  margin-bottom: 8px;
}
.oi-info-item { display: flex; flex-direction: column; gap: 2px; }
.oi-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.2px; }
.oi-val { font-size: 13px; font-weight: 700; color: #1e293b; }

.highlight-row {
  background: #eff6ff;
  border-radius: 8px;
  padding: 10px 14px;
  margin: 8px 0;
  border: 1px solid rgba(29, 78, 216, 0.12);
}
.highlight-val { color: #1d4ed8 !important; font-weight: 800; }

.profit-pos-row { background: #f0fdf4; border-radius: 8px; padding: 10px 14px; margin: 4px 0; border: 1px solid rgba(22, 163, 74, 0.12); }
.profit-neg-row { background: #fef2f2; border-radius: 8px; padding: 10px 14px; margin: 4px 0; border: 1px solid rgba(220, 38, 38, 0.12); }
.profit-val { font-weight: 800; }
.profit-positive { color: #16a34a; font-weight: 800; }
.profit-negative { color: #dc2626; font-weight: 800; }

/* Customer Order Blocks */
.co-block {
  background: #f8fafc;
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  transition: box-shadow 0.15s ease;
}
.co-block:last-child { margin-bottom: 0; }
.co-block:hover { box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06); }
.co-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.co-customer-info { display: flex; align-items: center; gap: 8px; }
.co-customer-name { font-weight: 800; color: #0f172a; font-size: 15px; }

.co-finance-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}
.co-fin-item { display: flex; flex-direction: column; align-items: center; }
.co-fin-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.3px; }
.co-fin-value { font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px; }
.co-fin-value.remaining { color: #dc2626; }

.co-items-title {
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  margin: 8px 0;
  padding-top: 8px;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
}

.co-items-mobile { display: flex; flex-direction: column; gap: 6px; }
.co-item-card {
  background: #fff;
  border-radius: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.co-item-name { font-weight: 700; color: #0f172a; font-size: 13px; margin-bottom: 4px; }
.co-item-details {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.num-truncate {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Mobile overrides */
@media (max-width: 767px) {
  .panel-card { border-radius: 10px; }
  .panel-card :deep(.ant-card-body) { padding: 12px !important; }
  .info-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
  .finance-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
  .finance-item { padding: 10px 12px; }
  .finance-value { font-size: 14px; }
  .co-block { padding: 14px 12px; border-radius: 12px; }
  .co-finance-row { gap: 6px; }
}
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
