<template>
  <div>
    <a-table :columns="columns" :data-source="mockOrders" :pagination="{ pageSize: 10 }" row-key="id" />
  </div>
</template>

<script setup lang="ts">
import { mockOrders } from '../../../shared/mock';

const columns = [
  { title: 'Order Code', dataIndex: 'orderCode', key: 'orderCode' },
  { title: 'Customer', dataIndex: 'customerName', key: 'customerName' },
  { title: 'Amount', dataIndex: 'totalAmount', key: 'totalAmount' },
  { title: 'Payment Status', dataIndex: 'paymentStatus', key: 'paymentStatus' },
];
</script>
