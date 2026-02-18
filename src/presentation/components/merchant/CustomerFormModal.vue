<template>
  <a-modal
    :open="open"
    :title="mode === 'create' ? $t('merchant.customers.modal.createTitle') : $t('merchant.customers.modal.editTitle')"
    :confirm-loading="loading"
    width="720px"
    @ok="submit"
    @cancel="$emit('cancel')"
  >
    <a-form ref="formRef" :model="formState" layout="vertical">
      <a-row :gutter="16">
        <a-col :xs="24" :md="12">
          <a-form-item
            name="customerName"
            :label="$t('merchant.customers.form.customerName')"
            :rules="[
              { required: true, message: $t('merchant.customers.form.customerNameRequired') },
              { max: 255, message: $t('merchant.customers.form.max255') }
            ]"
          >
            <a-input v-model:value="formState.customerName" />
          </a-form-item>
        </a-col>

        <a-col :xs="24" :md="12">
          <a-form-item
            name="customerType"
            :label="$t('merchant.customers.form.customerType')"
            :rules="[{ required: true, message: $t('merchant.customers.form.customerTypeRequired') }]"
          >
            <a-select v-model:value="formState.customerType">
              <a-select-option value="CUSTOMER">{{ $t('merchant.customers.form.type.customer') }}</a-select-option>
              <a-select-option value="AGENT">{{ $t('merchant.customers.form.type.agent') }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item name="shippingAddress" :label="$t('merchant.customers.form.shippingAddress')">
        <a-textarea v-model:value="formState.shippingAddress" :rows="2" />
      </a-form-item>

      <a-row :gutter="16">
        <a-col :xs="24" :md="12">
          <a-form-item
            name="shippingProvider"
            :label="$t('merchant.customers.form.shippingProvider')"
            :rules="[{ max: 100, message: $t('merchant.customers.form.max100') }]"
          >
            <a-input v-model:value="formState.shippingProvider" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-form-item name="paymentTerms" :label="$t('merchant.customers.form.paymentTerms')">
            <a-input v-model:value="formState.paymentTerms" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :xs="24" :md="12">
          <a-form-item name="shippingSource" :label="$t('merchant.customers.form.shippingSource')">
            <a-input v-model:value="formState.shippingSource" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-form-item name="shippingDestination" :label="$t('merchant.customers.form.shippingDestination')">
            <a-input v-model:value="formState.shippingDestination" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :xs="24" :md="12">
          <a-form-item
            name="contactPhone"
            :label="$t('merchant.customers.form.contactPhone')"
            :rules="[{ max: 50, message: $t('merchant.customers.form.max50') }]"
          >
            <a-input v-model:value="formState.contactPhone" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-form-item name="contactFacebook" :label="$t('merchant.customers.form.contactFacebook')">
            <a-input v-model:value="formState.contactFacebook" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :xs="24" :md="12">
          <a-form-item
            name="contactWhatsapp"
            :label="$t('merchant.customers.form.contactWhatsapp')"
            :rules="[{ max: 50, message: $t('merchant.customers.form.max50') }]"
          >
            <a-input v-model:value="formState.contactWhatsapp" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-form-item name="contactLine" :label="$t('merchant.customers.form.contactLine')">
            <a-input v-model:value="formState.contactLine" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :xs="24" :md="12">
          <a-form-item name="preferredContactMethod" :label="$t('merchant.customers.form.preferredContactMethod')">
            <a-select v-model:value="formState.preferredContactMethod" allow-clear>
              <a-select-option value="PHONE">PHONE</a-select-option>
              <a-select-option value="FACEBOOK">FACEBOOK</a-select-option>
              <a-select-option value="WHATSAPP">WHATSAPP</a-select-option>
              <a-select-option value="LINE">LINE</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-form-item name="isActive" :label="$t('merchant.customers.form.isActive')">
            <a-switch v-model:checked="formState.isActive" />
          </a-form-item>
        </a-col>
      </a-row>

    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import type { FormInstance } from 'ant-design-vue';
import type { Customer, CustomerType, PreferredContactMethod } from '@/domain/entities/user.entity';
import type { CustomerCreateDto, CustomerUpdateDto } from '@/application/dto/customer.dto';

const props = defineProps<{
  open: boolean;
  loading: boolean;
  mode: 'create' | 'edit';
  initialCustomer?: Customer | null;
}>();

const emit = defineEmits<{
  (e: 'submit', payload: Omit<CustomerCreateDto, 'merchantId'> | CustomerUpdateDto): void;
  (e: 'cancel'): void;
}>();

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

watch(
  () => [props.open, props.mode, props.initialCustomer] as const,
  () => {
    if (!props.open) return;
    if (props.mode === 'edit' && props.initialCustomer) {
      const c = props.initialCustomer;
      formState.customerName = c.customerName;
      formState.customerType = c.customerType;
      formState.shippingAddress = c.shippingAddress ?? '';
      formState.shippingProvider = c.shippingProvider ?? '';
      formState.shippingSource = c.shippingSource ?? '';
      formState.shippingDestination = c.shippingDestination ?? '';
      formState.paymentTerms = c.paymentTerms ?? '';
      formState.contactPhone = c.contactPhone ?? '';
      formState.contactFacebook = c.contactFacebook ?? '';
      formState.contactWhatsapp = c.contactWhatsapp ?? '';
      formState.contactLine = c.contactLine ?? '';
      formState.preferredContactMethod = (c.preferredContactMethod ?? undefined) as PreferredContactMethod | undefined;
      formState.isActive = !!c.isActive;
    } else {
      formState.customerName = '';
      formState.customerType = 'CUSTOMER';
      formState.shippingAddress = '';
      formState.shippingProvider = '';
      formState.shippingSource = '';
      formState.shippingDestination = '';
      formState.paymentTerms = '';
      formState.contactPhone = '';
      formState.contactFacebook = '';
      formState.contactWhatsapp = '';
      formState.contactLine = '';
      formState.preferredContactMethod = undefined;
      formState.isActive = true;
    }
    formRef.value?.clearValidate?.();
  },
);

const opt = (v: string) => (v.trim() ? v.trim() : undefined);

const submit = async () => {
  try {
    await formRef.value?.validate();
    emit('submit', {
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
  } catch {
    // ให้ form แสดง error เอง
  }
};
</script>

