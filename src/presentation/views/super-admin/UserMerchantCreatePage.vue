<template>
  <div class="sa-form-page">
    <div class="page-head">
      <div>
        <div class="text-3xl font-semibold text-slate-900">{{ $t('users.createMerchantUser') }}</div>
        <div class="text-slate-500 mt-1">{{ $t('users.subtitle') }}</div>
      </div>
      <div class="head-actions">
        <a-button @click="goBack">{{ $t('common.cancel') }}</a-button>
        <a-button type="primary" :loading="loading" @click="submitFromOutside">
          {{ $t('common.create') }}
        </a-button>
      </div>
    </div>

    <a-card :bordered="false" class="panel-card">
      <a-form ref="formRef" :model="formState" layout="vertical">
        <a-row :gutter="16">
          <a-col :xs="24" :md="12">
            <a-form-item
              name="fullName"
              :rules="[{ required: true, message: $t('users.fullName') + ' is required' }]"
            >
              <template #label>
                <span class="label-ico"><UserOutlined />{{ $t('users.fullName') }}</span>
              </template>
              <a-input v-model:value="formState.fullName" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item
              name="email"
              :rules="[
                { required: true, message: $t('login.emailRequired') },
                { type: 'email', message: $t('login.emailInvalid') }
              ]"
            >
              <template #label>
                <span class="label-ico"><MailOutlined />{{ $t('users.email') }}</span>
              </template>
              <a-input v-model:value="formState.email" type="email" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :xs="24" :md="12">
            <a-form-item
              name="password"
              :rules="[{ required: true, message: $t('login.passwordRequired') }]"
            >
              <template #label>
                <span class="label-ico"><LockOutlined />{{ $t('users.password') }}</span>
              </template>
              <a-input-password v-model:value="formState.password" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item
              name="shopName"
              :rules="[{ required: true, message: $t('users.shopName') + ' is required' }]"
            >
              <template #label>
                <span class="label-ico"><ShopOutlined />{{ $t('users.shopName') }}</span>
              </template>
              <a-input v-model:value="formState.shopName" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :xs="24" :md="12">
            <a-form-item name="contactPhone">
              <template #label>
                <span class="label-ico"><PhoneOutlined />{{ $t('users.contactPhone') }}</span>
              </template>
              <a-input v-model:value="formState.contactPhone" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item name="contactEmail">
              <template #label>
                <span class="label-ico"><MailOutlined />{{ $t('users.contactEmail') }}</span>
              </template>
              <a-input v-model:value="formState.contactEmail" type="email" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item name="shopAddress">
          <template #label>
            <span class="label-ico"><HomeOutlined />{{ $t('users.shopAddress') }}</span>
          </template>
          <a-textarea v-model:value="formState.shopAddress" :rows="3" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :xs="24" :md="12">
            <a-form-item name="defaultCurrency">
              <template #label>
                <span class="label-ico"><DollarOutlined />{{ $t('users.defaultCurrency') }}</span>
              </template>
              <a-select v-model:value="formState.defaultCurrency" :placeholder="$t('users.defaultCurrency')">
                <a-select-option value="LAK">LAK</a-select-option>
                <a-select-option value="THB">THB</a-select-option>
                <a-select-option value="USD">USD</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item name="shopLogoUrl">
              <template #label>
                <span class="label-ico"><PictureOutlined />{{ $t('users.shopLogoUrl') }}</span>
              </template>
              <a-input v-model:value="formState.shopLogoUrl" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { FormInstance } from 'ant-design-vue';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  ShopOutlined,
  PhoneOutlined,
  HomeOutlined,
  DollarOutlined,
  PictureOutlined,
} from '@ant-design/icons-vue';
import type { CurrencyCode, UserMerchantCreateDto } from '@/application/dto/user.dto';
import { useSuperAdminUsers } from '@/presentation/composables/super-admin/useSuperAdminUsers';

const router = useRouter();
const { loading, createUserWithMerchant } = useSuperAdminUsers();
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

const opt = (v: string) => (v.trim() ? v.trim() : undefined);

const submit = async () => {
  await formRef.value?.validate();
  const payload: UserMerchantCreateDto = {
    email: formState.email.trim(),
    password: formState.password,
    fullName: formState.fullName.trim(),
    shopName: formState.shopName.trim(),
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
  try { await submit(); } catch { /* ให้ form แสดง error เอง */ }
};

const goBack = () => router.push('/super-admin/users');
</script>

<style scoped>
.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.sa-form-page { display: flex; flex-direction: column; gap: 12px; }
.page-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.head-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.label-ico { display: inline-flex; align-items: center; gap: 8px; }
@media (max-width: 768px) {
  .head-actions { width: 100%; }
  .head-actions :deep(.ant-btn) { flex: 1; }
}
</style>

