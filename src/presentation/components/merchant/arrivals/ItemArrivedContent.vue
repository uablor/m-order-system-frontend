<template>
  <div>
    <a-table :columns="columns" :data-source="mockOrders" :pagination="{ pageSize: 10 }" row-key="id" />
  </div>
</template>

<script setup lang="ts">
import { mockOrders } from '../../../../shared/mock';

const columns = [
  { title: 'Order Code', dataIndex: 'orderCode', key: 'orderCode' },
  { title: 'Date', dataIndex: 'orderDate', key: 'orderDate' },
  { title: 'Customer', dataIndex: 'customerName', key: 'customerName' },
  { title: 'Amount', dataIndex: 'totalAmount', key: 'totalAmount' },
  { title: 'Arrival Status', dataIndex: 'arrivalStatus', key: 'arrivalStatus' },
];
</script>
