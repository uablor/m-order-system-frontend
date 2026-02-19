<template>
  <a-modal
    :open="open"
    :title="$t('users.createMerchantUser')"
    :style="{ fontSize: '5px' }"
    :confirm-loading="loading"
    @ok="submit"
    @cancel="$emit('cancel')"
    width="720px"
  >
    <a-form ref="formRef" :model="formState" layout="vertical">
      <a-row :gutter="16">
        <a-col :xs="24" :md="12">
          <a-form-item name="fullName" :label="$t('users.fullName')" :rules="[{ required: true, message: $t('users.fullName') + ' is required' }]">
            <a-input v-model:value="formState.fullName" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-form-item name="email" :label="$t('users.email')" :rules="[{ required: true, message: $t('login.emailRequired') }, { type: 'email', message: $t('login.emailInvalid') }]">
            <a-input v-model:value="formState.email" type="email" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :xs="24" :md="12">
          <a-form-item name="password" :label="$t('users.password')" :rules="[{ required: true, message: $t('login.passwordRequired') }]">
            <a-input-password v-model:value="formState.password" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-form-item name="shopName" :label="$t('users.shopName')" :rules="[{ required: true, message: $t('users.shopName') + ' is required' }]">
            <a-input v-model:value="formState.shopName" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :xs="24" :md="12">
          <a-form-item name="contactPhone" :label="$t('users.contactPhone')">
            <a-input v-model:value="formState.contactPhone" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-form-item name="contactEmail" :label="$t('users.contactEmail')">
            <a-input v-model:value="formState.contactEmail" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item name="shopAddress" :label="$t('users.shopAddress')">
        <a-textarea v-model:value="formState.shopAddress" :rows="3" />
      </a-form-item>

      <a-row :gutter="16">
        <a-col :xs="24" :md="12">
          <a-form-item name="defaultCurrency" :label="$t('users.defaultCurrency')">
            <a-select v-model:value="formState.defaultCurrency" :placeholder="$t('users.defaultCurrency')">
              <a-select-option value="LAK">LAK</a-select-option>
              <a-select-option value="THB">THB</a-select-option>
              <a-select-option value="USD">USD</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-form-item name="shopLogoUrl" :label="$t('users.shopLogoUrl')">
            <a-input v-model:value="formState.shopLogoUrl" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import type { FormInstance } from 'ant-design-vue';
import type { CurrencyCode } from '@/application/dto/user.dto';

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
  formRef.value?.clearValidate?.();
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetForm();
    }
  }
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
    // ให้ form แสดง error เอง
  }
};
</script>

