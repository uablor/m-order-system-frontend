<template>
  <div class="auth-page">
    <a-card class="auth-card">
      <h2 class="title">{{ $t('register.title') }}</h2>

      <a-result status="info" :sub-title="$t('register.notImplemented')">
        <template #extra>
          <a-button type="primary" @click="$router.push('/login')">
            {{ $t('register.backToLogin') }}
          </a-button>
        </template>
      </a-result>
    </a-card>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7ff, #ffffff);
}

.auth-card {
  width: 100%;
  max-width: 520px;
}

.title {
  margin: 0 0 16px 0;
  font-size: 22px;
  font-weight: 700;
  text-align: center;
}
</style>

