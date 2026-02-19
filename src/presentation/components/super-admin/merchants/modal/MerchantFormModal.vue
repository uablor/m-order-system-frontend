<template>
  <a-modal
    :open="open"
    :title="mode === 'create' ? $t('merchants.createMerchant') : $t('merchants.editMerchant')"
    :confirm-loading="loading"
    width="680px"
    @ok="submit"
    @cancel="$emit('cancel')"
  >
    <a-form ref="formRef" :model="formState" layout="vertical">
      <a-row :gutter="16">
        <a-col :xs="24" :sm="12">
          <a-form-item
            name="shopName"
            :label="$t('merchants.shopName')"
            :rules="[{ required: true, message: $t('merchants.shopNameRequired') }]"
          >
            <a-input v-model:value="formState.shopName" />
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12">
          <a-form-item name="defaultCurrency" :label="$t('merchants.defaultCurrency')">
            <a-select v-model:value="formState.defaultCurrency">
              <a-select-option value="THB">THB</a-select-option>
              <a-select-option value="USD">USD</a-select-option>
              <a-select-option value="LAK">LAK</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item name="shopAddress" :label="$t('merchants.shopAddress')">
        <a-textarea v-model:value="formState.shopAddress" :rows="2" :placeholder="$t('merchants.shopAddressPlaceholder')" />
      </a-form-item>

      <a-form-item name="shopLogoUrl" :label="$t('merchants.shopLogoUrl')">
        <a-input v-model:value="formState.shopLogoUrl" :placeholder="$t('merchants.shopLogoUrlPlaceholder')" />
      </a-form-item>

      <a-row :gutter="16">
        <a-col :xs="24" :sm="12">
          <a-form-item
            name="contactPhone"
            :label="$t('merchants.contactPhone')"
            :rules="[{ max: 50, message: $t('merchants.contactPhoneMaxLength') }]"
          >
            <a-input v-model:value="formState.contactPhone" />
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12">
          <a-form-item
            name="contactEmail"
            :label="$t('merchants.contactEmail')"
            :rules="[{ type: 'email', message: $t('merchants.contactEmailInvalid') }]"
          >
            <a-input v-model:value="formState.contactEmail" type="email" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :xs="24" :sm="8">
          <a-form-item name="contactFacebook" :label="$t('merchants.contactFacebook')">
            <a-input v-model:value="formState.contactFacebook" />
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="8">
          <a-form-item name="contactLine" :label="$t('merchants.contactLine')">
            <a-input v-model:value="formState.contactLine" />
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="8">
          <a-form-item name="contactWhatsapp" :label="$t('merchants.contactWhatsapp')">
            <a-input v-model:value="formState.contactWhatsapp" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item name="isActive" :label="$t('merchants.isActive')">
        <a-switch v-model:checked="formState.isActive" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue';
import type { FormInstance } from 'ant-design-vue';
import type { Merchant, MerchantCurrency } from '@/domain/entities/user.entity';
import type { MerchantCreateDto, MerchantUpdateDto } from '@/application/dto/merchant.dto';

const props = defineProps<{
  open: boolean;
  loading: boolean;
  mode: 'create' | 'edit';
  initialMerchant?: Merchant | null;
}>();

const emit = defineEmits<{
  (e: 'submit', payload: MerchantCreateDto | MerchantUpdateDto): void;
  (e: 'cancel'): void;
}>();

const formRef = ref<FormInstance>();

const formState = reactive({
  shopName: '',
  shopLogoUrl: '',
  shopAddress: '',
  contactPhone: '',
  contactEmail: '',
  contactFacebook: '',
  contactLine: '',
  contactWhatsapp: '',
  defaultCurrency: 'LAK' as MerchantCurrency,
  isActive: true,
});

const resetForm = () => {
  formState.shopName = '';
  formState.shopLogoUrl = '';
  formState.shopAddress = '';
  formState.contactPhone = '';
  formState.contactEmail = '';
  formState.contactFacebook = '';
  formState.contactLine = '';
  formState.contactWhatsapp = '';
  formState.defaultCurrency = 'LAK';
  formState.isActive = true;
};

watch(
  () => [props.open, props.mode, props.initialMerchant] as const,
  () => {
    if (!props.open) return;
    if (props.mode === 'edit' && props.initialMerchant) {
      const m = props.initialMerchant;
      formState.shopName = m.shopName;
      formState.shopLogoUrl = m.shopLogoUrl ?? '';
      formState.shopAddress = m.shopAddress ?? '';
      formState.contactPhone = m.contactPhone ?? '';
      formState.contactEmail = m.contactEmail ?? '';
      formState.contactFacebook = m.contactFacebook ?? '';
      formState.contactLine = m.contactLine ?? '';
      formState.contactWhatsapp = m.contactWhatsapp ?? '';
      formState.defaultCurrency = m.defaultCurrency;
      formState.isActive = m.isActive;
    } else {
      resetForm();
    }
    formRef.value?.clearValidate?.();
  },
);

const toOptionalString = (val: string): string | undefined =>
  val.trim() ? val.trim() : undefined;

const submit = async () => {
  try {
    await formRef.value?.validate();
    emit('submit', {
      shopName: formState.shopName.trim(),
      shopLogoUrl: toOptionalString(formState.shopLogoUrl),
      shopAddress: toOptionalString(formState.shopAddress),
      contactPhone: toOptionalString(formState.contactPhone),
      contactEmail: toOptionalString(formState.contactEmail),
      contactFacebook: toOptionalString(formState.contactFacebook),
      contactLine: toOptionalString(formState.contactLine),
      contactWhatsapp: toOptionalString(formState.contactWhatsapp),
      defaultCurrency: formState.defaultCurrency,
      isActive: formState.isActive,
    });
  } catch {
    // ให้ form แสดง error เอง
  }
};
</script>
