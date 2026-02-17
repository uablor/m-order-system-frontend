<template>
  <div class="page-placeholder">
    <a-card>
      <a-empty :description="description">
        <template #image>
          <component :is="icon" class="placeholder-icon" />
        </template>
        <a-button v-if="showAction" type="primary" @click="$emit('action')">
          {{ actionText }}
        </a-button>
      </a-empty>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { FileTextOutlined } from '@ant-design/icons-vue';

withDefaults(defineProps<{
  description?: string;
  icon?: any;
  showAction?: boolean;
  actionText?: string;
}>(), {
  description: 'ຂໍ້ມູນຈະຖືກເພີ່ມໃນອະນາຄົດ',
  icon: FileTextOutlined,
  showAction: false,
  actionText: 'ເພີ່ມ',
});
</script>

<style scoped>
.page-placeholder {
  padding: 24px;
}
.placeholder-icon {
  font-size: 64px;
  color: #d9d9d9;
}
</style>
