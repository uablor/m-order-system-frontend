<template>
  <MerchantLayout>
    <div class="customer-form-page">
      <a-breadcrumb class="mb-3">
        <a-breadcrumb-item>{{ $t('merchant.breadcrumbs.home') }}</a-breadcrumb-item>
        <a-breadcrumb-item>{{ $t('merchant.customers.breadcrumb') }}</a-breadcrumb-item>
        <a-breadcrumb-item>{{ $t('merchant.customers.modal.createTitle') }}</a-breadcrumb-item>
      </a-breadcrumb>

      <div class="page-head">
        <div>
          <div class="text-3xl font-semibold text-slate-900">{{ $t('merchant.customers.modal.createTitle') }}</div>
          <div class="text-slate-500 mt-1">{{ $t('merchant.customers.subtitle') }}</div>
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
                name="customerName"
                :rules="[
                  { required: true, message: $t('merchant.customers.form.customerNameRequired') },
                  { max: 255, message: $t('merchant.customers.form.max255') }
                ]"
              >
                <template #label>
                  <span class="label-ico"><UserOutlined />{{ $t('merchant.customers.form.customerName') }}</span>
                </template>
                <a-input v-model:value="formState.customerName" />
              </a-form-item>
            </a-col>

            <a-col :xs="24" :md="12">
              <a-form-item
                name="customerType"
                :rules="[{ required: true, message: $t('merchant.customers.form.customerTypeRequired') }]"
              >
                <template #label>
                  <span class="label-ico"><IdcardOutlined />{{ $t('merchant.customers.form.customerType') }}</span>
                </template>
                <a-select v-model:value="formState.customerType">
                  <a-select-option value="CUSTOMER">{{ $t('merchant.customers.form.type.customer') }}</a-select-option>
                  <a-select-option value="AGENT">{{ $t('merchant.customers.form.type.agent') }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item name="shippingAddress">
            <template #label>
              <span class="label-ico"><HomeOutlined />{{ $t('merchant.customers.form.shippingAddress') }}</span>
            </template>
            <a-textarea v-model:value="formState.shippingAddress" :rows="2" />
          </a-form-item>

          <a-row :gutter="16">
            <a-col :xs="24" :md="12">
              <a-form-item
                name="shippingProvider"
                :rules="[{ max: 100, message: $t('merchant.customers.form.max100') }]"
              >
                <template #label>
                  <span class="label-ico"><CarOutlined />{{ $t('merchant.customers.form.shippingProvider') }}</span>
                </template>
                <a-input v-model:value="formState.shippingProvider" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item name="paymentTerms">
                <template #label>
                  <span class="label-ico"><DollarOutlined />{{ $t('merchant.customers.form.paymentTerms') }}</span>
                </template>
                <a-input v-model:value="formState.paymentTerms" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :xs="24" :md="12">
              <a-form-item name="shippingSource">
                <template #label>
                  <span class="label-ico"><ExportOutlined />{{ $t('merchant.customers.form.shippingSource') }}</span>
                </template>
                <a-input v-model:value="formState.shippingSource" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item name="shippingDestination">
                <template #label>
                  <span class="label-ico"><ImportOutlined />{{ $t('merchant.customers.form.shippingDestination') }}</span>
                </template>
                <a-input v-model:value="formState.shippingDestination" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :xs="24" :md="12">
              <a-form-item
                name="contactPhone"
                :rules="[{ max: 50, message: $t('merchant.customers.form.max50') }]"
              >
                <template #label>
                  <span class="label-ico"><PhoneOutlined />{{ $t('merchant.customers.form.contactPhone') }}</span>
                </template>
                <a-input v-model:value="formState.contactPhone" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item name="contactFacebook">
                <template #label>
                  <span class="label-ico"><LinkOutlined />{{ $t('merchant.customers.form.contactFacebook') }}</span>
                </template>
                <a-input v-model:value="formState.contactFacebook" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :xs="24" :md="12">
              <a-form-item
                name="contactWhatsapp"
                :rules="[{ max: 50, message: $t('merchant.customers.form.max50') }]"
              >
                <template #label>
                  <span class="label-ico"><LinkOutlined />{{ $t('merchant.customers.form.contactWhatsapp') }}</span>
                </template>
                <a-input v-model:value="formState.contactWhatsapp" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item name="contactLine">
                <template #label>
                  <span class="label-ico"><MessageOutlined />{{ $t('merchant.customers.form.contactLine') }}</span>
                </template>
                <a-input v-model:value="formState.contactLine" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :xs="24" :md="12">
              <a-form-item name="preferredContactMethod">
                <template #label>
                  <span class="label-ico"><ContactsOutlined />{{ $t('merchant.customers.form.preferredContactMethod') }}</span>
                </template>
                <a-select v-model:value="formState.preferredContactMethod" allow-clear>
                  <a-select-option value="PHONE">PHONE</a-select-option>
                  <a-select-option value="FACEBOOK">FACEBOOK</a-select-option>
                  <a-select-option value="WHATSAPP">WHATSAPP</a-select-option>
                  <a-select-option value="LINE">LINE</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item name="isActive">
                <template #label>
                  <span class="label-ico"><CheckCircleOutlined />{{ $t('merchant.customers.form.isActive') }}</span>
                </template>
                <a-switch v-model:checked="formState.isActive" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-card>
    </div>
  </MerchantLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { FormInstance } from 'ant-design-vue';
import MerchantLayout from '@/components/layouts/merchant-layouts/AppLayout.vue';
import type { CustomerType, PreferredContactMethod } from '@/domain/entities/user.entity';
import { useMerchantCustomers } from '@/presentation/composables/merchant/useMerchantCustomers';
import {
  UserOutlined,
  IdcardOutlined,
  HomeOutlined,
  CarOutlined,
  DollarOutlined,
  ExportOutlined,
  ImportOutlined,
  PhoneOutlined,
  LinkOutlined,
  MessageOutlined,
  ContactsOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons-vue';

const router = useRouter();
const { loading, createCustomer } = useMerchantCustomers();

const formRef = ref<FormInstance>();

const formState = reactive({
  customerName: '',
  customerType: 'CUSTOMER' as CustomerType,
  shippingAddress: '',
  shippingProvider: '',
  shippingSource: '',
  shippingDestination: '',
  paymentTerms: '',
  contactPhone: '',
  contactFacebook: '',
  contactWhatsapp: '',
  contactLine: '',
  preferredContactMethod: undefined as PreferredContactMethod | undefined,
  isActive: true,
});

const opt = (v: string) => (v.trim() ? v.trim() : undefined);

const submit = async () => {
  await formRef.value?.validate();
  const ok = await createCustomer({
    customerName: formState.customerName.trim(),
    customerType: formState.customerType,
    shippingAddress: opt(formState.shippingAddress),
    shippingProvider: opt(formState.shippingProvider),
    shippingSource: opt(formState.shippingSource),
    shippingDestination: opt(formState.shippingDestination),
    paymentTerms: opt(formState.paymentTerms),
    contactPhone: opt(formState.contactPhone),
    contactFacebook: opt(formState.contactFacebook),
    contactWhatsapp: opt(formState.contactWhatsapp),
    contactLine: opt(formState.contactLine),
    preferredContactMethod: formState.preferredContactMethod,
    isActive: !!formState.isActive,
  });
  if (ok) router.push('/merchant/customers');
};

const submitFromOutside = async () => {
  try {
    await submit();
  } catch {
    // ให้ form แสดง error เอง
  }
};

const goBack = () => router.push('/merchant/customers');
</script>

<style scoped>
.mb-3 { margin-bottom: 12px; }
.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}

.customer-form-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.head-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .head-actions {
    width: 100%;
  }
  .head-actions :deep(.ant-btn) {
    flex: 1;
  }
}

.label-ico {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>

