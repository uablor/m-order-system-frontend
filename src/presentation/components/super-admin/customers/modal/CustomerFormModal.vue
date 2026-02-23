<template>
  <a-modal
    :open="open"
    :title="isEdit ? $t('customers.editCustomer') : $t('customers.createCustomer')"
    :confirm-loading="confirmLoading"
    :width="640"
    @ok="handleOk"
    @cancel="$emit('cancel')"
  >
    <a-form layout="vertical" class="customer-form">
      <a-row :gutter="16">
        <a-col :xs="24" :sm="12">
          <a-form-item :label="$t('customers.customerName')" required>
            <a-input v-model:value="form.customerName" :placeholder="$t('customers.customerNamePlaceholder')" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="12">
          <a-form-item :label="$t('customers.customerType')">
            <a-select v-model:value="form.customerType">
              <a-select-option value="CUSTOMER">{{ $t('customers.customer') }}</a-select-option>
              <a-select-option value="AGENT">{{ $t('customers.agent') }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :xs="24" :sm="12">
          <a-form-item :label="$t('customers.merchantId')" :required="!isEdit">
            <a-select
              v-model:value="form.merchantId"
              :placeholder="$t('customers.selectMerchant')"
              show-search
              :filter-option="filterMerchant"
              :disabled="isEdit"
            >
              <a-select-option v-for="m in merchants" :key="m.id" :value="m.id">{{ m.shopName }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="12">
          <a-form-item :label="$t('customers.preferredContact')">
            <a-select v-model:value="form.preferredContactMethod" allow-clear>
              <a-select-option value="PHONE">{{ $t('customers.contactPhone') }}</a-select-option>
              <a-select-option value="FACEBOOK">Facebook</a-select-option>
              <a-select-option value="WHATSAPP">WhatsApp</a-select-option>
              <a-select-option value="LINE">Line</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-divider class="section-divider">{{ $t('customers.contactInfo') }}</a-divider>

      <a-row :gutter="16">
        <a-col :xs="24" :sm="12">
          <a-form-item :label="$t('customers.contactPhone')">
            <a-input v-model:value="form.contactPhone" placeholder="+856 20 xxx xxxx" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="12">
          <a-form-item :label="$t('customers.contactFacebook')">
            <a-input v-model:value="form.contactFacebook" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :xs="24" :sm="12">
          <a-form-item :label="$t('customers.contactWhatsapp')">
            <a-input v-model:value="form.contactWhatsapp" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="12">
          <a-form-item :label="$t('customers.contactLine')">
            <a-input v-model:value="form.contactLine" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-divider class="section-divider">{{ $t('customers.shippingInfo') }}</a-divider>

      <a-row :gutter="16">
        <a-col :xs="24">
          <a-form-item :label="$t('customers.shippingAddress')">
            <a-textarea v-model:value="form.shippingAddress" :rows="2" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :xs="24" :sm="8">
          <a-form-item :label="$t('customers.shippingProvider')">
            <a-input v-model:value="form.shippingProvider" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="8">
          <a-form-item :label="$t('customers.shippingSource')">
            <a-input v-model:value="form.shippingSource" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="8">
          <a-form-item :label="$t('customers.shippingDestination')">
            <a-input v-model:value="form.shippingDestination" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :xs="24" :sm="12">
          <a-form-item :label="$t('customers.paymentTerms')">
            <a-input v-model:value="form.paymentTerms" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="12">
          <a-form-item :label="$t('customers.isActive')">
            <a-switch v-model:checked="form.isActive" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { Customer, Merchant, CustomerType, PreferredContactMethod } from '@/domain/entities/user.entity';
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();

const props = defineProps<{
  open: boolean;
  confirmLoading: boolean;
  customer?: Customer | null;
  merchants: Merchant[];
}>();

const emit = defineEmits<{
  (e: 'ok', data: any): void;
  (e: 'cancel'): void;
}>();

const isEdit = !!props.customer;

const form = reactive({
  customerName: '',
  customerType: 'CUSTOMER' as CustomerType,
  merchantId: undefined as number | undefined,
  contactPhone: '',
  contactFacebook: '',
  contactWhatsapp: '',
  contactLine: '',
  preferredContactMethod: undefined as PreferredContactMethod | undefined,
  shippingAddress: '',
  shippingProvider: '',
  shippingSource: '',
  shippingDestination: '',
  paymentTerms: '',
  isActive: true,
});

watch(() => props.customer, (val) => {
  if (val) {
    form.customerName = val.customerName || '';
    form.customerType = val.customerType || 'CUSTOMER';
    form.merchantId = val.merchantId;
    form.contactPhone = val.contactPhone || '';
    form.contactFacebook = val.contactFacebook || '';
    form.contactWhatsapp = val.contactWhatsapp || '';
    form.contactLine = val.contactLine || '';
    form.preferredContactMethod = val.preferredContactMethod || undefined;
    form.shippingAddress = val.shippingAddress || '';
    form.shippingProvider = val.shippingProvider || '';
    form.shippingSource = val.shippingSource || '';
    form.shippingDestination = val.shippingDestination || '';
    form.paymentTerms = val.paymentTerms || '';
    form.isActive = val.isActive;
  }
}, { immediate: true });

watch(() => props.open, (val) => {
  if (!val && !props.customer) {
    form.customerName = '';
    form.customerType = 'CUSTOMER';
    form.merchantId = undefined;
    form.contactPhone = '';
    form.contactFacebook = '';
    form.contactWhatsapp = '';
    form.contactLine = '';
    form.preferredContactMethod = undefined;
    form.shippingAddress = '';
    form.shippingProvider = '';
    form.shippingSource = '';
    form.shippingDestination = '';
    form.paymentTerms = '';
    form.isActive = true;
  }
});

const filterMerchant = (input: string, option: any) => {
  return option?.children?.[0]?.children?.toLowerCase().includes(input.toLowerCase());
};

const handleOk = () => {
  emit('ok', { ...form });
};
</script>

<style scoped>
.customer-form :deep(.ant-form-item) { margin-bottom: 14px; }
.section-divider { font-size: 13px; color: #64748b; }
</style>
