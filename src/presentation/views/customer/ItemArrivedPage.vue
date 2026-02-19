<template>
  <div class="customer-page-root">
    <CustomerItemArrivedContent />
  </div>
</template>

<script setup lang="ts">
import CustomerItemArrivedContent from '../../components/customer/CustomerItemArrivedContent.vue';
</script>

<style scoped>
.customer-page-root {
  min-height: 100vh;
  background: #f5f7fa;
}
</style>
