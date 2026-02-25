<template>
  <div class="auth-page">
    <a-card class="auth-card">
      <h2 class="title">{{ $t('login.title') }}</h2>
      <p class="subtitle">{{ $t('login.subtitle') }}</p>

      <!-- Inline error banner -->
      <a-alert
        v-if="loginError"
        :message="loginError"
        type="error"
        show-icon
        closable
        class="login-error"
        data-testid="login-error"
        @close="clearError"
      />

      <a-form ref="formRef" :model="formState" layout="vertical" @finish="onSubmit">
        <a-form-item
          name="email"
          :label="$t('login.email')"
          :rules="[
            { required: true, message: $t('login.emailRequired') },
            { type: 'email', message: $t('login.emailInvalid') },
          ]"
        >
          <a-input
            v-model:value="formState.email"
            type="email"
            autocomplete="email"
            data-testid="email-input"
            @change="clearError"
          />
        </a-form-item>

        <a-form-item
          name="password"
          :label="$t('login.password')"
          :rules="[{ required: true, message: $t('login.passwordRequired') }]"
        >
          <a-input-password
            v-model:value="formState.password"
            autocomplete="current-password"
            data-testid="password-input"
            @change="clearError"
          />
        </a-form-item>

        <a-button type="primary" html-type="submit" block :loading="loading" data-testid="submit-btn">
          {{ loading ? $t('login.loggingIn') : $t('login.loginButton') }}
        </a-button>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useAuth } from '@/shared/composables/useAuth';

const { login, loading, loginError, clearLoginError } = useAuth();

const formState = reactive({
  email: '',
  password: '',
});

const clearError = () => {
  /* loginError จะถูก reset ตอนเรียก login() อีกครั้งอยู่แล้ว
     แต่ clear ทันทีเมื่อ user แก้ไข input ให้ UX ดีขึ้น */
  clearLoginError();
};

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

.login-error {
  margin-bottom: 16px;
  border-radius: 8px;
}

.title {
  margin: 0 0 16px 0;
  font-size: 22px;
  font-weight: 700;
  text-align: center;
}

.subtitle {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 400;
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

