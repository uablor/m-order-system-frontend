<template>
  <div class="sa-form-page">
    <!-- หัวหน้า page -->
    <div class="page-head">
      <div class="title-block">
        <div class="page-title">{{ $t('users.createMerchantUser') }}</div>
        <div class="page-subtitle">{{ $t('users.subtitle') }}</div>
      </div>
      <div v-if="!isMobile" class="head-actions">
        <a-button @click="goBack">{{ $t('common.cancel') }}</a-button>
        <a-button type="primary" :loading="loading" @click="submitFromOutside">
          {{ $t('common.create') }}
        </a-button>
      </div>
    </div>

    <!-- ====== 2-panel card ====== -->
    <a-form ref="formRef" :model="formState" layout="vertical">
      <div class="two-panel-card">

        <!-- ========== ขวา: ข้อมูลร้านค้า ========== -->
        <div class="panel merchant-panel">
          <div class="panel-header">
            <span class="panel-icon merchant-icon"><ShopOutlined /></span>
            <div class="panel-title-group">
              <span class="panel-title">
                {{ $t('users.merchantInfoSection') }}
                <span class="panel-num">({{ $t('users.sectionPart') }} 2)</span>
              </span>
              <span class="panel-optional-hint">{{ $t('users.merchantInfoOptional') }}</span>
            </div>
          </div>

          <!-- ชื่อร้าน -->
          <a-form-item
            name="shopName"
          >
            <template #label>
              <span class="field-label"><ShopOutlined class="lbl-ico" />{{ $t('users.shopName') }}</span>
            </template>
            <a-input
              v-model:value="formState.shopName"
              :placeholder="$t('users.shopNamePlaceholder')"
              size="large"
            />
          </a-form-item>

          <!-- เบอร์โทร + อีเมลร้าน -->
          <a-row :gutter="12">
            <a-col :xs="24" :sm="12">
              <a-form-item name="contactPhone">
                <template #label>
                  <span class="field-label"><PhoneOutlined class="lbl-ico" />{{ $t('users.contactPhone') }}</span>
                </template>
                <PhoneInputWithCountry
                  v-model="formState.contactPhone"
                  placeholder="20 89 48 48 48"
                />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12">
              <a-form-item name="contactEmail">
                <template #label>
                  <span class="field-label"><MailOutlined class="lbl-ico" />{{ $t('users.contactEmail') }}</span>
                </template>
                <a-input
                  v-model:value="formState.contactEmail"
                  :placeholder="$t('users.contactEmailPlaceholder')"
                  size="large"
                  style="border: 1px solid #d9d9d9; box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- ที่อยู่ร้าน -->
          <a-form-item name="shopAddress">
            <template #label>
              <span class="field-label"><HomeOutlined class="lbl-ico" />{{ $t('users.shopAddress') }}</span>
            </template>
            <a-textarea
              v-model:value="formState.shopAddress"
              :placeholder="$t('users.shopAddressPlaceholder')"
              :rows="3"
              style="resize: none"
              size="large"
            />
          </a-form-item>

          <!-- สกุลเงิน -->
          <a-row :gutter="12">
            <a-col :xs="24">
              <a-form-item name="defaultCurrency">
                <template #label>
                  <span class="field-label"><DollarOutlined class="lbl-ico" />{{ $t('users.defaultCurrency') }}</span>
                </template>
                <a-select
                  v-model:value="formState.defaultCurrency"
                  size="large"
                  style="width: 100%"
                >
                  <a-select-option value="LAK">LAK</a-select-option>
                  <a-select-option value="THB">THB</a-select-option>
                  <a-select-option value="USD">USD</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          
          <!-- ลิงก์โลโก้ (commented out) -->
          <!-- <a-row :gutter="12">
            <a-col :xs="24">
              <a-form-item name="shopLogoUrl">
                <template #label>
                  <span class="field-label"><PictureOutlined class="lbl-ico" />{{ $t('users.shopLogoUrl') }} (URL)</span>
                </template>
                <a-input
                  v-model:value="formState.shopLogoUrl"
                  :placeholder="$t('users.shopLogoUrlPlaceholder')"
                  size="large"
                />
              </a-form-item>
            </a-col>
          </a-row> -->
        </div>
        <!-- divider แนวตั้ง (desktop only) -->
        <div class="panel-divider" />

        
       <!-- ========== ซ้าย: ข้อมูลผู้ใช้งาน ========== -->
       <div class="panel user-panel">
          <div class="panel-header">
            <span class="panel-icon user-icon"><UserOutlined /></span>
            <span class="panel-title">
              {{ $t('users.userInfoSection') }}
              <span class="panel-num">({{ $t('users.sectionPart') }} 1)</span>
            </span>
          </div>

          <!-- ชื่อเต็ม -->
          <a-form-item
            name="fullName"
            :rules="[{ required: true, message: $t('users.fullName') + ' is required' }]"
          >
            <template #label>
              <span class="field-label"><UserOutlined class="lbl-ico" />{{ $t('users.fullName') }}</span>
            </template>
            <a-input
              v-model:value="formState.fullName"
              :placeholder="$t('users.fullNamePlaceholder')"
              size="large"
            />
          </a-form-item>

          <!-- อีเมล -->
          <a-form-item
            name="email"
            :rules="[
              { required: true, message: $t('login.emailRequired') },
              { type: 'email', message: $t('login.emailInvalid') },
            ]"
          >
            <template #label>
              <span class="field-label"><MailOutlined class="lbl-ico" />{{ $t('users.emailForLogin') }}</span>
            </template>
            <a-input
              v-model:value="formState.email"
              type="email"
              placeholder="example@email.com"
              size="large"
            />
          </a-form-item>

          <!-- รหัสผ่าน -->
          <a-form-item
            name="password"
            :rules="[
              { required: true, message: $t('login.passwordRequired') },
              { min: 8, message: $t('login.passwordMinLength') ?? 'Password must be at least 8 characters' },
            ]"
          >
            <template #label>
              <span class="field-label"><LockOutlined class="lbl-ico" />{{ $t('users.password') }}</span>
            </template>
            <a-input-password
              v-model:value="formState.password"
              :placeholder="$t('users.passwordPlaceholder')"
              size="large"
              @change="retriggerConfirmValidation"
            />
          </a-form-item>

          <!-- ยืนยันรหัสผ่าน -->
          <a-form-item
            name="confirmPassword"
            :rules="[
              { required: true, message: $t('users.confirmPasswordRequired') },
              { validator: validateConfirmPassword },
            ]"
          >
            <template #label>
              <span class="field-label"><SafetyOutlined class="lbl-ico" />{{ $t('users.confirmPassword') }}</span>
            </template>
            <a-input-password
              v-model:value="formState.confirmPassword"
              :placeholder="$t('users.confirmPasswordPlaceholder')"
              size="large"
            />
          </a-form-item>
        </div>

      </div>
    </a-form>

    <!-- Mobile: buttons ด้านล่าง -->
    <div v-if="isMobile" class="mobile-footer">
      <a-button block size="large" @click="goBack">{{ $t('common.cancel') }}</a-button>
      <a-button block size="large" type="primary" :loading="loading" @click="submitFromOutside">
        {{ $t('common.create') }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import type { FormInstance } from 'ant-design-vue';
import PhoneInputWithCountry from '@/shared/components/PhoneInputWithCountry.vue';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SafetyOutlined,
  ShopOutlined,
  PhoneOutlined,
  HomeOutlined,
  DollarOutlined,
} from '@ant-design/icons-vue';
import type { CurrencyCode, UserMerchantCreateDto } from '@/application/dto/user.dto';
import { useSuperAdminUsers } from '@/presentation/composables/super-admin/useSuperAdminUsers';

const { t } = useI18n();
const router = useRouter();
const { isMobile } = useIsMobile();
const { loading, createUserWithMerchant } = useSuperAdminUsers();
const formRef = ref<FormInstance>();

const formState = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  shopName: '',
  shopLogoUrl: '',
  shopAddress: '',
  contactPhone: '',
  contactEmail: '',
  defaultCurrency: 'LAK' as CurrencyCode,
});

const validateConfirmPassword = (_rule: unknown, value: string) => {
  if (!value) return Promise.resolve();
  if (value !== formState.password) return Promise.reject(new Error(t('users.passwordMismatch')));
  return Promise.resolve();
};

const retriggerConfirmValidation = () => {
  if (formState.confirmPassword) {
    formRef.value?.validateFields(['confirmPassword']);
  }
};

const opt = (v: string) => (v.trim() ? v.trim() : undefined);

// const handleEmailInput = (event: Event) => {
//   const target = event.target as HTMLInputElement;
//   formState.contactEmail = target.value;
// };

const submit = async () => {
  await formRef.value?.validate();
  const resolvedShopName = formState.shopName.trim() || formState.fullName.trim();
  const payload: UserMerchantCreateDto = {
    email: formState.email.trim(),
    password: formState.password,
    fullName: formState.fullName.trim(),
    shopName: resolvedShopName,
    shopLogoUrl: opt(formState.shopLogoUrl),
    shopAddress: opt(formState.shopAddress),
    contactPhone: opt(formState.contactPhone),
    contactEmail: opt(formState.contactEmail),
    defaultCurrency: formState.defaultCurrency || undefined,
  };
  const ok = await createUserWithMerchant(payload);
  if (ok) router.push('/super-admin/users');
};

const submitFromOutside = async () => {
  try { await submit(); } catch { /* form แสดง error เอง */ }
};

const goBack = () => router.push('/super-admin/users');
</script>

<style scoped>
/* ====== page wrapper ====== */
.sa-form-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.page-subtitle {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.head-actions {
  display: flex;
  gap: 8px;
}

/* ====== 2-panel card ====== */
.two-panel-card {
  display: flex;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.07), 0 8px 24px rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

/* ====== Custom Form Styles ====== */
.custom-form-item {
  margin-bottom: 24px;
}

.custom-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #000000d9;
  line-height: 1.5715;
}

.custom-label .lbl-ico {
  margin-right: 4px;
}

.custom-input {
  width: 100%;
  height: 40px;
  padding: 4px 11px;
  color: #000000d9;
  font-size: 14px;
  line-height: 1.5715;
  background-color: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  transition: all 0.3s;
  outline: none;
  box-sizing: border-box;
}

.custom-input:hover {
  border-color: #4096ff;
  border-right-width: 1px;
}

.custom-input:focus {
  border-color: #4096ff;
  border-right-width: 1px;
  box-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1);
}

.custom-input::placeholder {
  color: #bfbfbf;
}

.merchant-panel,
.user-panel {
  flex: 1; /* Equal width for both panels */
}

/* Ensure merchant panel content is visible */
.merchant-panel {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  overflow: visible;   /*  ADD THIS */
  width: 100%; /* Ensure full width in grid */
}

.panel {
  padding: 28px 28px 20px;
   overflow: visible;  /* ✅ ADD */
}

/* ====== divider ====== */
.panel-divider {
  width: 1px;
  background: #f0f0f0;
  align-self: stretch;
}

/* ====== section header ====== */
.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
  padding-bottom: 14px;
  /* border-bottom: 2px solid #f5f5f5; */
}

.panel-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  font-size: 17px;
  flex-shrink: 0;
}

.user-icon {
  background: linear-gradient(135deg, #1677ff, #4096ff);
  color: #fff;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.3);
}

.merchant-icon {
  background: linear-gradient(135deg, #00a854, #52c41a);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 168, 84, 0.3);
}

.panel-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.panel-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
}

.panel-num {
  font-size: 13px;
  font-weight: 500;
  color: #888;
}

.panel-optional-hint {
  font-size: 11px;
  font-weight: 500;
  color: #f59e0b;
  line-height: 1.3;
}

/* ====== field label ====== */
.field-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.lbl-ico {
  font-size: 13px;
  color: #9ca3af;
}

/* ====== form spacing ====== */
:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-form-item-label) {
  padding-bottom: 4px;
}

/* ====== mobile footer ====== */
.mobile-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 12px;
}

/* ====== responsive ====== */
@media (max-width: 767px) {
  .page-title { font-size: 18px; }

  .two-panel-card {
    grid-template-columns: 1fr;
    border-radius: 12px;
  }

  .panel-divider {
    display: none;
  }

  .user-panel {
    padding-bottom: 4px;
    border-bottom: 8px solid #f5f7fa;
  }

  .panel {
    padding: 20px 16px;
  }
}
</style>
