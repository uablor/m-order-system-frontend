<template>
  <div class="auth-page">
    <a-card class="auth-card">
      <h2 class="title">{{ $t('login.title') }}</h2>

      <a-form ref="formRef" :model="formState" layout="vertical" @finish="onSubmit">
        <a-form-item
          name="email"
          :label="$t('login.email')"
          :rules="[
            { required: true, message: $t('login.emailRequired') },
            { type: 'email', message: $t('login.emailInvalid') },
          ]"
        >
          <a-input v-model:value="formState.email" type="email" autocomplete="email" />
        </a-form-item>

        <a-form-item
          name="password"
          :label="$t('login.password')"
          :rules="[{ required: true, message: $t('login.passwordRequired') }]"
        >
          <a-input-password v-model:value="formState.password" autocomplete="current-password" />
        </a-form-item>

        <a-button type="primary" html-type="submit" block :loading="loading">
          {{ loading ? $t('login.loggingIn') : $t('login.loginButton') }}
        </a-button>

        <div class="footer">
          <span>{{ $t('login.noAccount') }}</span>
          <a class="link" @click="$router.push('/register')">{{ $t('login.registerLink') }}</a>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useAuth } from '@/shared/composables/useAuth';

const { login, loading } = useAuth();

const formState = reactive({
  email: '',
  password: '',
});

const onSubmit = async () => {
  await login({ email: formState.email, password: formState.password });
};
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
  max-width: 420px;
}

.title {
  margin: 0 0 16px 0;
  font-size: 22px;
  font-weight: 700;
  text-align: center;
}

.footer {
  margin-top: 16px;
  display: flex;
  gap: 8px;
  justify-content: center;
}

.link {
  font-weight: 600;
}
</style>

