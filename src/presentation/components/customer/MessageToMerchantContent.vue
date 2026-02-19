<template>
  <div class="redirect-note">
    <a-result
      status="info"
      title="ฟีเจอร์ข้อความถูกรวมเข้ากับหน้ารายละเอียดสินค้าแล้ว"
      sub-title="กรุณากลับไปที่หน้าสินค้าที่มาถึง และกดเลือกสินค้าที่ต้องการส่งข้อความ"
    >
      <template #extra>
        <a-button type="primary" @click="goToItemArrived">ไปหน้าสินค้าที่มาถึง</a-button>
      </template>
    </a-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
const goToItemArrived = () => router.push({ name: 'customer-item-arrived' });
</script>

<style scoped>
.redirect-note { padding: 40px 20px; }
</style>
