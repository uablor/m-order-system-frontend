<template>
  <div>
    <a-button type="primary" class="mb-4" @click="() => {}">{{ $t('menus.superAdmin.addMerchant') }}</a-button>
    <a-table
      :columns="columns"
      :data-source="mockMerchants"
      :pagination="{ pageSize: 10 }"
      row-key="id"
    />
  </div>
</template>

<script setup lang="ts">
import { mockMerchants } from '../../../shared/mock';

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Shop Name', dataIndex: 'shopName', key: 'shopName' },
  { title: 'Owner', dataIndex: 'ownerName', key: 'ownerName' },
  { title: 'Email', dataIndex: 'contactEmail', key: 'contactEmail' },
  { title: 'Phone', dataIndex: 'contactPhone', key: 'contactPhone' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
];
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }
</style>
