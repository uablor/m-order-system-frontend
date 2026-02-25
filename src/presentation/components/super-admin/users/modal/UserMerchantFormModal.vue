<template>
  <a-modal
    :open="open"
    :title="$t('users.createMerchantUser')"
    :confirm-loading="loading"
    :width="modalWidth"
    class="merchant-form-modal"
    @ok="submit"
    @cancel="$emit('cancel')"
  >
    <a-form ref="formRef" :model="formState" layout="vertical" class="modal-form">
      <div class="form-grid">
        <!-- ====== ซ้าย: ข้อมูลผู้ใช้ help====== -->
        <div class="form-section user-section">
          <div class="section-header user-header">
            <div class="section-icon user-icon">
              <UserOutlined />
            </div>
            <div class="section-title-block">
              <span class="section-title">{{ $t('users.userInfoSection') }}</span>
              <span class="section-desc">{{ $t('users.userInfoDesc') }}</span>
            </div>
          </div>

          <div class="section-fields">
            <a-form-item
              name="fullName"
              :label="$t('users.fullName')"
              :rules="[{ required: true, message: $t('users.fullName') + ' is required' }]"
            >
              <a-input
                v-model:value="formState.fullName"
                :placeholder="$t('users.fullName')"
                size="large"
              >
                <template #prefix><UserOutlined class="input-icon" /></template>
              </a-input>
            </a-form-item>

            <a-form-item
              name="email"
              :label="$t('users.email')"
              :rules="[
                { required: true, message: $t('login.emailRequired') },
                { type: 'email', message: $t('login.emailInvalid') },
              ]"
            >
              <a-input
                v-model:value="formState.email"
                type="email"
                :placeholder="$t('users.email')"
                size="large"
              >
                <template #prefix><MailOutlined class="input-icon" /></template>
              </a-input>
            </a-form-item>

            <a-form-item
              name="password"
              :label="$t('users.password')"
              :rules="[{ required: true, message: $t('login.passwordRequired') }]"
            >
              <a-input-password
                v-model:value="formState.password"
                :placeholder="$t('users.password')"
                size="large"
              >
                <template #prefix><LockOutlined class="input-icon" /></template>
              </a-input-password>
            </a-form-item>
          </div>
        </div>

        <!-- แนวตั้ง divider (แสดงเฉพาะ desktop) -->
        <div class="column-divider" />

        <!-- ====== ขวา: ข้อมูลร้านค้า ====== -->
        <div class="form-section merchant-section">
          <div class="section-header merchant-header">
            <div class="section-icon merchant-icon">
              <ShopOutlined />
            </div>
            <div class="section-title-block">
              <span class="section-title">{{ $t('users.merchantInfoSection') }}</span>
              <span class="section-desc">{{ $t('users.merchantInfoDesc') }}</span>
            </div>
          </div>

          <div class="section-fields">
            <a-form-item
              name="shopName"
              :label="$t('users.shopName')"
            >
              <a-input
                v-model:value="formState.shopName"
                :placeholder="$t('users.shopName')"
                size="large"
              >
                <template #prefix><ShopOutlined class="input-icon" /></template>
              </a-input>
            </a-form-item>

            <a-row :gutter="12">
              <a-col :xs="24" :sm="12">
                <a-form-item name="contactPhone" :label="$t('users.contactPhone')">
                  <a-input
                    v-model:value="formState.contactPhone"
                    :placeholder="$t('users.contactPhonePlaceholder')"
                    size="large"
                  >
                    <template #prefix><PhoneOutlined class="input-icon" /></template>
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-item name="contactEmail" :label="$t('users.contactEmail')">
                  <a-input
                    v-model:value="formState.contactEmail"
                    :placeholder="$t('users.contactEmailPlaceholder')"
                    size="large"
                  >
                    <template #prefix><MailOutlined class="input-icon" /></template>
                  </a-input>
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item name="shopAddress" :label="$t('users.shopAddress')">
              <a-textarea
                v-model:value="formState.shopAddress"
                :placeholder="$t('users.shopAddressPlaceholder')"
                :rows="3"
                style="resize: none"
              />
            </a-form-item>

            <a-row :gutter="12">
              <a-col :xs="24" :sm="12">
                <a-form-item name="defaultCurrency" :label="$t('users.defaultCurrency')">
                  <a-select
                    v-model:value="formState.defaultCurrency"
                    size="large"
                    style="width: 100%"
                  >
                    <a-select-option value="LAK">🇱🇦 LAK</a-select-option>
                    <a-select-option value="THB">🇹🇭 THB</a-select-option>
                    <a-select-option value="USD">🇺🇸 USD</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-item name="shopLogoUrl" :label="$t('users.shopLogoUrl')">
                  <a-input
                    v-model:value="formState.shopLogoUrl"
                    :placeholder="$t('users.shopLogoUrlPlaceholder')"
                    size="large"
                  >
                    <template #prefix><PictureOutlined class="input-icon" /></template>
                  </a-input>
                </a-form-item>
              </a-col>
            </a-row>
          </div>
        </div>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FormInstance } from 'ant-design-vue';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  ShopOutlined,
  PictureOutlined,
} from '@ant-design/icons-vue';
import type { CurrencyCode } from '@/application/dto/user.dto';
import { useIsMobile } from '@/shared/composables/useIsMobile';

useI18n();

const props = defineProps<{
  open: boolean;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit', payload: {
    email: string;
    password: string;
    fullName: string;
    shopName: string;
    shopLogoUrl?: string;
    shopAddress?: string;
    contactPhone?: string;
    contactEmail?: string;
    defaultCurrency?: CurrencyCode;
  }): void;
  (e: 'cancel'): void;
}>();

const { isMobile } = useIsMobile();
const modalWidth = computed(() => (isMobile.value ? '95vw' : '860px'));

const formRef = ref<FormInstance>();

const formState = reactive({
  email: '',
  password: '',
  fullName: '',
  shopName: '',
  shopLogoUrl: '',
  shopAddress: '',
  contactPhone: '',
  contactEmail: '',
  defaultCurrency: 'LAK' as CurrencyCode,
});

const resetForm = () => {
  formState.email = '';
  formState.password = '';
  formState.fullName = '';
  formState.shopName = '';
  formState.shopLogoUrl = '';
  formState.shopAddress = '';
  formState.contactPhone = '';
  formState.contactEmail = '';
  formState.defaultCurrency = 'LAK';
  shopNameTouched.value = false;
  formRef.value?.clearValidate?.();
};

watch(
  () => props.open,
  (isOpen) => { if (isOpen) resetForm(); },
);

const shopNameTouched = ref(false);

watch(
  () => formState.fullName,
  (val) => {
    if (!shopNameTouched.value) formState.shopName = val;
  },
);

watch(
  () => formState.shopName,
  (val) => {
    if (val !== formState.fullName && val !== '') shopNameTouched.value = true;
  },
);

const submit = async () => {
  try {
    await formRef.value?.validate();
    emit('submit', {
      email: formState.email,
      password: formState.password,
      fullName: formState.fullName,
      shopName: formState.shopName,
      shopLogoUrl: formState.shopLogoUrl || undefined,
      shopAddress: formState.shopAddress || undefined,
      contactPhone: formState.contactPhone || undefined,
      contactEmail: formState.contactEmail || undefined,
      defaultCurrency: formState.defaultCurrency || undefined,
    });
  } catch {
    // form แสดง error เอง
  }
};
</script>

<style scoped>
/* ====== layout หลัก ====== */
.modal-form {
  padding-top: 4px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  gap: 0 24px;
  align-items: start;
}

/* ====== divider แนวตั้ง ====== */
.column-divider {
  background: linear-gradient(to bottom, transparent, #e8e8e8 20%, #e8e8e8 80%, transparent);
  width: 1px;
  align-self: stretch;
  margin-top: 8px;
}

/* ====== section ====== */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

/* ====== header ====== */
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  margin-bottom: 16px;
}

.user-header {
  background: linear-gradient(135deg, #e8f4fd 0%, #dbeeff 100%);
  border: 1px solid #b3d8f7;
}

.merchant-header {
  background: linear-gradient(135deg, #f0faf0 0%, #dcf5e7 100%);
  border: 1px solid #a8e2be;
}

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  font-size: 18px;
  flex-shrink: 0;
}

.user-icon {
  background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.35);
}

.merchant-icon {
  background: linear-gradient(135deg, #00a854 0%, #52c41a 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 168, 84, 0.35);
}

.section-title-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.2;
}

.section-desc {
  font-size: 11px;
  color: #666;
  line-height: 1.3;
}

/* ====== ปรับ input icon สี ====== */
.input-icon {
  color: #bfbfbf;
  font-size: 14px;
}

/* ====== spacing ====== */
:deep(.ant-form-item) {
  margin-bottom: 14px;
}

:deep(.ant-form-item-label > label) {
  font-size: 13px;
  font-weight: 500;
  color: #444;
}

/* ====== responsive mobile ====== */
@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .column-divider {
    display: none;
  }

  .user-section {
    padding-bottom: 20px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 20px;
  }
}
</style>
