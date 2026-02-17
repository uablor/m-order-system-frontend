<template>
  <div class="dashboard">
    <h2>{{ $t('menus.superAdmin.dashboard') }}</h2>
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card><a-statistic title="ຈຳນວນຜູ້ຄ້າສົ່ງ" :value="12" /></a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card><a-statistic title="ລາຍງານວັນນີ້" :value="5" /></a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.dashboard { padding: 16px 0; }
</style>
