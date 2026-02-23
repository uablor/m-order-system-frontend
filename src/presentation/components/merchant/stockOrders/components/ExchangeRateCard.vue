<template>
  <a-card :bordered="false" class="panel-card mb-4">
    <div class="panel-header-row">
      <div class="panel-title" style="margin-bottom:0">
        <SwapOutlined class="icon-blue" />
        <span>{{ $t('merchant.orders.exchangeRate.title') }}</span>
      </div>
      <a-button type="primary" class="add-btn" @click="$emit('edit')">
        <template #icon><EditOutlined /></template>
        {{ $t('merchant.orders.exchangeRate.edit') }}
      </a-button>
    </div>
    <a-row :gutter="[12, 0]">
      <a-col :xs="12" :md="6">
        <div class="rate-label buy-rate-label">{{ $t('merchant.orders.exchangeRate.buyLabel') }}</div>
        <a-input :value="buyRateDisplay" disabled />
      </a-col>
      <a-col :xs="12" :md="6">
        <div class="rate-label sell-rate-label">{{ $t('merchant.orders.exchangeRate.sellLabel') }}</div>
        <a-input :value="sellRateDisplay" disabled />
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup lang="ts">
import { SwapOutlined, EditOutlined } from '@ant-design/icons-vue';

defineProps<{ buyRateDisplay: string; sellRateDisplay: string }>();
defineEmits<{ (e: 'edit'): void }>();
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }
.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.panel-header-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.panel-title { font-size: 16px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.icon-blue { color: #1d4ed8; font-size: 18px; }
.add-btn { border-radius: 12px; font-weight: 700; }
.rate-label { font-size: 11px; font-weight: 700; margin-bottom: 4px; letter-spacing: 0.3px; }
.buy-rate-label { color: #1bc908; }
.sell-rate-label { color: #d97706; }
:deep(.ant-input[disabled]) { color: #0f172a !important; font-weight: 600; background: #f1f5f9; font-size: 13px; }
@media (max-width: 767px) {
  .panel-card { border-radius: 10px; }
  .panel-card :deep(.ant-card-body) { padding: 12px !important; }
}
</style>
