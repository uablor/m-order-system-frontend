<template>
  <a-card :bordered="false" class="panel-card mb-4">
    <div class="panel-title">
      <FileTextOutlined class="icon-blue" />
      <span>{{ $t('merchant.orders.form.orderCode') }}</span>
    </div>
    <a-input
      :value="modelValue"
      :placeholder="$t('merchant.orders.form.orderCodePlaceholder')"
      allow-clear
      size="large"
      @update:value="$emit('update:modelValue', $event)"
    />
  </a-card>
</template>

<script setup lang="ts">
import { FileTextOutlined } from '@ant-design/icons-vue';

defineProps<{ modelValue: string }>();
defineEmits<{ (e: 'update:modelValue', val: string): void }>();
</script>

<style scoped>
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
@media (max-width: 767px) {
  .panel-card { border-radius: 10px; }
  .panel-card :deep(.ant-card-body) { padding: 12px !important; }
}
</style>
