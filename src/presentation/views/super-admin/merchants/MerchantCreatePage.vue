<template>
  <div class="sa-form-page">
    <div class="page-head">
      <div class="title-block">
        <div class="page-title">{{ $t('merchants.createMerchant') }}</div>
        <div class="page-subtitle">{{ $t('merchants.subtitle') }}</div>
      </div>
      <div v-if="!isMobile" class="head-actions">
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
              name="shopName"
              :rules="[{ required: true, message: $t('merchants.shopNameRequired') }]"
            >
              <template #label>
                <span class="label-ico"><ShopOutlined />{{ $t('merchants.shopName') }}</span>
              </template>
              <a-input v-model:value="formState.shopName" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item name="defaultCurrency" class="pb-2px">
              <template #label>
                <span class="label-ico"><DollarOutlined />{{ $t('merchants.defaultCurrency') }}</span>
              </template>
              <a-select v-model:value="formState.defaultCurrency">
                <a-select-option value="THB">THB</a-select-option>
                <a-select-option value="USD">USD</a-select-option>
                <a-select-option value="LAK">LAK</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item name="shopAddress">
          <template #label>
            <span class="label-ico"><HomeOutlined />{{ $t('merchants.shopAddress') }}</span>
          </template>
          <a-textarea v-model:value="formState.shopAddress" :rows="2" :placeholder="$t('merchants.shopAddressPlaceholder')" />
        </a-form-item>

        <a-form-item name="shopLogoUrl">
          <template #label>
            <span class="label-ico"><PictureOutlined />{{ $t('merchants.shopLogoUrl') }}</span>
          </template>
          <a-input v-model:value="formState.shopLogoUrl" :placeholder="$t('merchants.shopLogoUrlPlaceholder')" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :xs="24" :md="12">
            <a-form-item name="contactPhone">
              <template #label>
                <span class="label-ico"><PhoneOutlined />{{ $t('merchants.contactPhone') }}</span>
              </template>
              <a-input v-model:value="formState.contactPhone" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item name="contactEmail" :rules="[{ type: 'email', message: $t('merchants.contactEmailInvalid') }]">
              <template #label>
                <span class="label-ico"><MailOutlined />{{ $t('merchants.contactEmail') }}</span>
              </template>
              <a-input v-model:value="formState.contactEmail" type="email" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :xs="24" :md="8">
            <a-form-item name="contactFacebook">
              <template #label>
                <span class="label-ico"><LinkOutlined />{{ $t('merchants.contactFacebook') }}</span>
              </template>
              <a-input v-model:value="formState.contactFacebook" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="8">
            <a-form-item name="contactLine">
              <template #label>
                <span class="label-ico"><MessageOutlined />{{ $t('merchants.contactLine') }}</span>
              </template>
              <a-input v-model:value="formState.contactLine" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="8">
            <a-form-item name="contactWhatsapp">
              <template #label>
                <span class="label-ico"><WhatsAppOutlined />{{ $t('merchants.contactWhatsapp') }}</span>
              </template>
              <a-input v-model:value="formState.contactWhatsapp" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item name="isActive">
          <template #label>
            <span class="label-ico"><CheckCircleOutlined />{{ $t('merchants.isActive') }}</span>
          </template>
          <a-switch v-model:checked="formState.isActive" />
        </a-form-item>
      </a-form>
    </a-card>

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
import { useIsMobile } from '@/shared/composables/useIsMobile';
import type { FormInstance } from 'ant-design-vue';
import {
  ShopOutlined,
  DollarOutlined,
  HomeOutlined,
  PictureOutlined,
  PhoneOutlined,
  MailOutlined,
  LinkOutlined,
  MessageOutlined,
  WhatsAppOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons-vue';
import type { MerchantCurrency } from '@/domain/entities/user.entity';
import { useSuperAdminMerchants } from '@/presentation/composables/super-admin/useSuperAdminMerchants';

const router = useRouter();
const { isMobile } = useIsMobile();
const { loading, createMerchant } = useSuperAdminMerchants();
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

const opt = (v: string) => (v.trim() ? v.trim() : undefined);

const submit = async () => {
  await formRef.value?.validate();
  const ok = await createMerchant({
    shopName: formState.shopName.trim(),
    shopLogoUrl: opt(formState.shopLogoUrl),
    shopAddress: opt(formState.shopAddress),
    contactPhone: opt(formState.contactPhone),
    contactEmail: opt(formState.contactEmail),
    contactFacebook: opt(formState.contactFacebook),
    contactLine: opt(formState.contactLine),
    contactWhatsapp: opt(formState.contactWhatsapp),
    defaultCurrency: formState.defaultCurrency,
    isActive: !!formState.isActive,
  });
  if (ok) router.push('/super-admin/merchants');
};

const submitFromOutside = async () => {
  try { await submit(); } catch { /* ให้ form แสดง error เอง */ }
};

const goBack = () => router.push('/super-admin/merchants');
</script>

<style scoped>
.panel-card { border-radius: 14px; box-shadow: 0 1px 2px rgba(15,23,42,0.06), 0 10px 25px rgba(15,23,42,0.04); }
.sa-form-page { display: flex; flex-direction: column; gap: 12px; }
.page-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.page-title { font-size: 26px; font-weight: 600; color: #0f172a; line-height: 1.3; }
.page-subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
.head-actions { display: flex; gap: 8px; }
.label-ico { display: inline-flex; align-items: center; gap: 8px; }
.pb-2px { padding-bottom: 2px; }
.mobile-footer { display: flex; flex-direction: column; gap: 10px; padding-top: 4px; padding-bottom: 12px; }
@media (max-width: 767px) {
  .page-title { font-size: 16px; }
  .page-subtitle { font-size: 12px; }
}
</style>

