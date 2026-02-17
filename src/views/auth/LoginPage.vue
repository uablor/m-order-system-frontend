<template>
  <div class="login-container">
    <a-card class="login-card" :title="$t('login.title')">
      <a-form
        :model="formState"
        name="login"
        @finish="onFinish"
        layout="vertical"
      >
        <a-form-item
          :label="$t('login.username')"
          name="username"
          :rules="[{ required: true, message: 'Please input your username!' }]"
        >
          <a-input v-model:value="formState.username" size="large">
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          :label="$t('login.password')"
          name="password"
          :rules="[{ required: true, message: 'Please input your password!' }]"
        >
          <a-input-password v-model:value="formState.password" size="large">
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block>
            {{ $t('login.loginButton') }}
          </a-button>
        </a-form-item>

        <div class="register-link">
          {{ $t('login.noAccount') }}
          <router-link to="/register">{{ $t('login.registerLink') }}</router-link>
        </div>

        <div class="language-switcher">
          <a-button @click="switchLanguage('en')" :type="currentLocale === 'en' ? 'primary' : 'default'" size="small">
            EN
          </a-button>
          <a-button @click="switchLanguage('la')" :type="currentLocale === 'la' ? 'primary' : 'default'" size="small">
            ລາວ
          </a-button>
          <a-button @click="switchLanguage('th')" :type="currentLocale === 'th' ? 'primary' : 'default'" size="small">
            ไทย
          </a-button>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { useAuthStore } from '../../store/auth.store';
import { message } from 'ant-design-vue';

const router = useRouter();
const { locale } = useI18n();
const authStore = useAuthStore();

const formState = reactive({
  username: '',
  password: '',
});

const currentLocale = computed(() => locale.value);

const switchLanguage = (lang: string) => {
  locale.value = lang;
  localStorage.setItem('app-locale', lang);
};

const onFinish = () => {
  try {
    authStore.login(formState.username, formState.password);
    message.success('Login successful!');
    router.push('/dashboard');
  } catch (error) {
    message.error('Login failed!');
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.register-link {
  text-align: center;
  margin-top: 16px;
}

.language-switcher {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}
</style>
