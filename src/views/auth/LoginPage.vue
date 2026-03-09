<template>
  <div class="auth-page">
    <!-- Left Side - Image Section -->
    <div class="auth-left">
      <div class="image-container">
        <img src="/images/store_likeA.avif" alt="Store" class="auth-image" />
        <div class="image-overlay">
          <div class="overlay-content">
            <h1 class="brand-title">Welcome Back</h1>
            <p class="brand-subtitle">Your trusted order management system</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side - Login Form -->
    <div class="auth-right">
      <div class="auth-card">
        <div class="auth-header">
          <h2 class="title">{{ $t('login.title') }}</h2>
          <p class="subtitle">{{ $t('login.subtitle') }}</p>
        </div>

        <a-form ref="formRef" :model="formState" layout="vertical" @finish="onSubmit">
          <a-form-item
            name="email"
            :label="$t('login.email')"
            :rules="[
              { required: true, message: $t('login.emailRequired') },
              { type: 'email', message: $t('login.emailInvalid') },
            ]"
            :validate-status="emailError ? 'error' : ''"
            :help="emailError || ''"
          >
            <a-input
              v-model:value="formState.email"
              type="email"
              autocomplete="email"
              size="large"
              placeholder="Enter your email"
              data-testid="email-input"
              @change="clearEmailError"
            />
          </a-form-item>

          <a-form-item
            name="password"
            :label="$t('login.password')"
            :rules="[{ required: true, message: $t('login.passwordRequired') }]"
            :validate-status="passwordError ? 'error' : ''"
            :help="passwordError || ''"
          >
            <a-input-password
              v-model:value="formState.password"
              autocomplete="current-password"
              size="large"
              placeholder="Enter your password"
              data-testid="password-input"
              @change="clearPasswordError"
            />
          </a-form-item>

          <a-button 
            type="primary" 
            html-type="submit" 
            block 
            size="large"
            :loading="loading" 
            data-testid="submit-btn"
            class="login-btn"
          >
            {{ loading ? $t('login.loggingIn') : $t('login.loginButton') }}
          </a-button>
        </a-form>

        <!-- Footer Links -->
        <div class="auth-footer">
          <div class="footer-links">
            <a href="#" class="footer-link">Forgot Password?</a>
            <span class="divider">•</span>
            <a href="#" class="footer-link">Need Help?</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useAuth } from '@/shared/composables/useAuth';

const { login, loading, emailError, passwordError, clearEmailError, clearPasswordError } = useAuth();

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
  background: #ffffff;
}

/* Left Side - Image Section */
.auth-left {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
  transition: transform 0.3s ease;
}

.image-container:hover .auth-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.8) 0%, rgba(30, 64, 175, 0.8) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-content {
  text-align: center;
  color: white;
  padding: 2rem;
  animation: fadeInUp 0.8s ease;
}

.brand-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: -1px;
}

.brand-subtitle {
  font-size: 1.2rem;
  font-weight: 400;
  opacity: 0.95;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

/* Right Side - Login Form */
.auth-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  padding: 2rem;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 20px;
  padding: 3rem 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
  animation: slideInRight 0.6s ease;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 1rem;
  font-weight: 400;
  color: #718096;
  margin: 0;
}

/* Form Styling */
:deep(.ant-form-item-label > label) {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
}

:deep(.ant-input),
:deep(.ant-input-password) {
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  padding: 12px 16px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

:deep(.ant-input:focus),
:deep(.ant-input-password:focus),
:deep(.ant-input-focused),
:deep(.ant-input-password-focused) {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

:deep(.ant-form-item-has-error .ant-input),
:deep(.ant-form-item-has-error .ant-input-password) {
  border-color: #f56565;
}

:deep(.ant-form-item-explain-error) {
  font-size: 0.85rem;
  margin-top: 6px;
}

.login-btn {
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

/* Footer */
.auth-footer {
  margin-top: 2rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.footer-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #1e40af;
  text-decoration: underline;
}

.divider {
  color: #cbd5e0;
  font-weight: 400;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .auth-left {
    display: none;
  }
  
  .auth-right {
    flex: 1;
  }
  
  .auth-page {
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  }
}

@media (max-width: 768px) {
  .auth-card {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }
  
  .title {
    font-size: 1.75rem;
  }
  
  .brand-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem 1rem;
    border-radius: 16px;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .divider {
    display: none;
  }
}
</style>

