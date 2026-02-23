<template>
  <a-card v-if="visible" :bordered="false" class="panel-card mb-4 summary-card">
    <div class="panel-title">
      <CalculatorOutlined class="icon-blue" />
      <span>{{ $t('merchant.orders.summary.title') }}</span>
    </div>
    <a-form layout="vertical">
      <!-- Desktop: 4 cols per row -->
      <template v-if="!isMobile">
        <a-row :gutter="[16, 0]">
          <a-col :md="6">
            <a-form-item :label="`${$t('merchant.orders.summary.purchaseTotalForeign')} (${buyBaseCcy})`">
              <a-input :value="fmtNum(purchaseTotalForeign)" disabled class="w-full" />
            </a-form-item>
          </a-col>
          <a-col :md="6">
            <a-form-item :label="`${$t('merchant.orders.summary.purchaseTotalLak')} (${buyTargetCcy})`">
              <a-input :value="fmtNum(purchaseTotalLak)" disabled class="w-full" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="[16, 0]">
          <a-col :md="6">
            <a-form-item :label="`${$t('merchant.orders.summary.sellingTotalForeign')} (${sellBaseCcy})`">
              <a-input :value="fmtNum(sellingTotalForeign)" disabled class="w-full" />
            </a-form-item>
          </a-col>
          <a-col :md="6">
            <a-form-item :label="`${$t('merchant.orders.summary.sellingTotalLak')} (${sellTargetCcy})`">
              <a-input :value="fmtNum(sellingTotalLak)" disabled class="w-full" />
            </a-form-item>
          </a-col>
          <a-col :md="6">
            <a-form-item :label="`${$t('merchant.orders.summary.profitForeign')} (${sellBaseCcy})`">
              <a-input :value="fmtNum(profitForeign)" disabled class="w-full summary-profit" />
            </a-form-item>
          </a-col>
          <a-col :md="6">
            <a-form-item :label="`${$t('merchant.orders.summary.profitLak')} (${sellTargetCcy})`">
              <a-input :value="fmtNum(profitLak)" disabled class="w-full summary-profit" />
            </a-form-item>
          </a-col>
        </a-row>
      </template>
      <!-- Mobile: 2 cols per row -->
      <template v-else>
        <a-row :gutter="[12, 0]">
          <a-col :span="12">
            <a-form-item :label="`${$t('merchant.orders.summary.purchaseTotalForeign')} (${buyBaseCcy})`">
              <a-input :value="fmtNum(purchaseTotalForeign)" disabled class="w-full" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="`${$t('merchant.orders.summary.purchaseTotalLak')} (${buyTargetCcy})`">
              <a-input :value="fmtNum(purchaseTotalLak)" disabled class="w-full" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="[12, 0]">
          <a-col :span="12">
            <a-form-item :label="`${$t('merchant.orders.summary.sellingTotalForeign')} (${sellBaseCcy})`">
              <a-input :value="fmtNum(sellingTotalForeign)" disabled class="w-full" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="`${$t('merchant.orders.summary.sellingTotalLak')} (${sellTargetCcy})`">
              <a-input :value="fmtNum(sellingTotalLak)" disabled class="w-full" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="[12, 0]">
          <a-col :span="12">
            <a-form-item :label="`${$t('merchant.orders.summary.profitLak')} (${sellTargetCcy})`">
              <a-input :value="fmtNum(profitLak)" disabled class="w-full summary-profit" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="`${$t('merchant.orders.summary.profitForeign')} (${sellBaseCcy})`">
              <a-input :value="fmtNum(profitForeign)" disabled class="w-full summary-profit" />
            </a-form-item>
          </a-col>
        </a-row>
      </template>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { CalculatorOutlined } from '@ant-design/icons-vue';
import { fmtNumber } from '@/shared/utils/format';

defineProps<{
  visible: boolean;
  isMobile: boolean;
  buyBaseCcy: string;
  buyTargetCcy: string;
  sellBaseCcy: string;
  sellTargetCcy: string;
  purchaseTotalForeign: number;
  purchaseTotalLak: number;
  sellingTotalForeign: number;
  sellingTotalLak: number;
  profitForeign: number;
  profitLak: number;
}>();

const fmtNum = fmtNumber;
</script>

<style scoped>
.w-full { width: 100%; }
.mb-4 { margin-bottom: 16px; }
.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.panel-title {
  font-size: 16px; font-weight: 800; color: #0f172a;
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
}
.icon-blue { color: #1d4ed8; font-size: 18px; }
:deep(.ant-input[disabled]) { color: #0f172a !important; font-weight: 600; background: #f1f5f9; font-size: 13px; }
.summary-card {
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(30, 64, 175, 0.07);
  background: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 60%, #eff6ff 100%);
  margin-bottom: 18px;
  border: 1.5px solid rgba(34, 197, 94, 0.18);
}
.summary-card :deep(.ant-card-head) { border-bottom: 1.5px solid rgba(34, 197, 94, 0.12); background: transparent; }
.summary-card :deep(.ant-card-head-title) { font-size: 16px; font-weight: 800; color: #16a34a; }
.summary-card :deep(.ant-card-body) { padding: 18px 20px 6px; }
.summary-profit:deep(input) { color: #16a34a !important; font-weight: 800; background: #f0fdf4 !important; border-color: rgba(34, 197, 94, 0.25) !important; }
@media (max-width: 767px) {
  .panel-card { border-radius: 10px; }
  .summary-card { border-radius: 12px; }
  .summary-card :deep(.ant-card-body) { padding: 12px 12px 4px !important; }
  .summary-card :deep(.ant-card-head-title) { font-size: 14px; }
}
</style>
