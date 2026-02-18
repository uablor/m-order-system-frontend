<template>
  <div class="forbidden">
    <a-result status="403" title="403" :sub-title="$t('error.forbidden')">
      <template #extra>
        <a-button type="primary" @click="$router.push('/')">
          {{ $t('common.backHome') }}
        </a-button>
      </template>
    </a-result>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.forbidden {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>

