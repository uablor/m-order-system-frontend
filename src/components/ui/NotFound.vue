<template>
  <div class="not-found">
    <a-result status="404" :title="$t('common.notFound')">
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
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>
