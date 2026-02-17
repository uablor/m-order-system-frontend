<template>
  <div>
    <h3>{{ $t('menus.customer.itemArrived') }}</h3>
    <a-table :columns="columns" :data-source="mockOrders" :pagination="{ pageSize: 10 }" row-key="id" />
  </div>
</template>

<script setup lang="ts">
import { mockOrders } from '../../../shared/mock';

const columns = [
  { title: 'Order Code', dataIndex: 'orderCode', key: 'orderCode' },
  { title: 'Date', dataIndex: 'orderDate', key: 'orderDate' },
  { title: 'Amount', dataIndex: 'totalAmount', key: 'totalAmount' },
  { title: 'Status', dataIndex: 'arrivalStatus', key: 'arrivalStatus' },
];
</script>
