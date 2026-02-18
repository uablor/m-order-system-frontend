<template>
  <div class="sa-form-page">
    <div class="page-head">
      <div>
        <div class="text-3xl font-semibold text-slate-900">{{ $t('merchants.editMerchant') }}</div>
        <div class="text-slate-500 mt-1">{{ $t('merchants.subtitle') }}</div>
      </div>
      <div class="head-actions">
        <a-button @click="goBack">{{ $t('common.cancel') }}</a-button>
        <a-button type="primary" :loading="loading" @click="submitFromOutside">
          {{ $t('common.save') }}
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
            <a-form-item name="defaultCurrency">
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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
import type { MerchantUpdateDto } from '@/application/dto/merchant.dto';
import { merchantRepository } from '@/infrastructure/repositories/merchant.repository';
import { useSuperAdminMerchants } from '@/presentation/composables/super-admin/useSuperAdminMerchants';
import type { BackendResponse } from '@/shared/types/backend-response.types';
import { handleApiError } from '@/shared/utils/error';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);

const { loading, updateMerchant } = useSuperAdminMerchants();
const formRef = ref<FormInstance>();
const { t } = useI18n();

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

const applyMerchantToForm = (m: any) => {
  if (!m) return;
  formState.shopName = m.shopName ?? '';
  formState.shopLogoUrl = m.shopLogoUrl ?? '';
  formState.shopAddress = m.shopAddress ?? '';
  formState.contactPhone = m.contactPhone ?? '';
  formState.contactEmail = m.contactEmail ?? '';
  formState.contactFacebook = m.contactFacebook ?? '';
  formState.contactLine = m.contactLine ?? '';
  formState.contactWhatsapp = m.contactWhatsapp ?? '';
  formState.defaultCurrency = (m.defaultCurrency ?? 'LAK') as MerchantCurrency;
  formState.isActive = !!m.isActive;
};

const readMerchantFromLocalStorage = () => {
  try {
    const raw = localStorage.getItem('sa:last-edit-merchant');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (parsed && Number(parsed.id) === id) return parsed;
    return undefined;
  } catch {
    return undefined;
  }
};

const unwrapMaybeBackendResponse = (res: any) => {
  // บาง endpoint อาจส่งแบบ { success, results: [entity] }
  if (res && typeof res === 'object' && Array.isArray((res as BackendResponse<any>).results)) {
    return (res as BackendResponse<any>).results?.[0];
  }
  return res;
};

const loadMerchant = async () => {
  // เติมข้อมูลเร็วจาก localStorage ก่อน (กันหน้าฟอร์มว่าง)
  const cached = readMerchantFromLocalStorage();
  if (cached) applyMerchantToForm(cached);

  try {
    const res = await merchantRepository.getById(id);
    const m = unwrapMaybeBackendResponse(res);
    applyMerchantToForm(m);
  } catch (error) {
    handleApiError(error, t);
  }
};

const opt = (v: string) => (v.trim() ? v.trim() : undefined);

const submit = async () => {
  await formRef.value?.validate();
  const payload: MerchantUpdateDto = {
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
  };
  const ok = await updateMerchant(id, payload);
  if (ok) router.push('/super-admin/merchants');
};

const submitFromOutside = async () => {
  try { await submit(); } catch { /* ให้ form แสดง error เอง */ }
};

const goBack = () => router.push('/super-admin/merchants');

onMounted(async () => {
  await loadMerchant();
});
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

