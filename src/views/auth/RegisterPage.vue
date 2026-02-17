<template>
  <div class="register-container">
    <a-card class="register-card" :title="$t('register.title')">
      <a-form
        :model="formState"
        name="register"
        @finish="onFinish"
        layout="vertical"
      >
        <a-form-item
          :label="$t('register.email')"
          name="email"
          :rules="[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]"
        >
          <a-input v-model:value="formState.email" size="large">
            <template #prefix>
              <MailOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          :label="$t('register.username')"
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
          :label="$t('register.password')"
          name="password"
          :rules="[{ required: true, message: 'Please input your password!' }]"
        >
          <a-input-password v-model:value="formState.password" size="large">
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item
          :label="$t('register.confirmPassword')"
          name="confirmPassword"
          :rules="[
            { required: true, message: 'Please confirm your password!' },
            { validator: validatePassword }
          ]"
        >
          <a-input-password v-model:value="formState.confirmPassword" size="large">
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block>
            {{ $t('register.registerButton') }}
          </a-button>
        </a-form-item>

        <div class="login-link">
          {{ $t('register.haveAccount') }}
          <router-link to="/login">{{ $t('register.loginLink') }}</router-link>
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
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons-vue';
import { useAuthStore } from '../../store/auth.store';
import { message } from 'ant-design-vue';

const router = useRouter();
const { locale } = useI18n();
const authStore = useAuthStore();

const formState = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
});

const currentLocale = computed(() => locale.value);

const switchLanguage = (lang: string) => {
  locale.value = lang;
  localStorage.setItem('app-locale', lang);
};

const validatePassword = async (_rule: any, value: string) => {
  if (value === '') {
    return Promise.reject('Please confirm your password!');
  } else if (value !== formState.password) {
    return Promise.reject('Passwords do not match!');
  } else {
    return Promise.resolve();
  }
};

const onFinish = () => {
  try {
    authStore.register(formState.email, formState.username, formState.password);
    message.success('Registration successful!');
    router.push('/dashboard');
  } catch (error) {
    message.error('Registration failed!');
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.login-link {
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
