<template>
  <a-modal
    v-model:open="visible"
    :title="$t('merchants.changePassword')"
    :width="480"
    :confirm-loading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <div class="change-password-form">
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        layout="vertical"
        @finish="handleSubmit"
      >
        <a-form-item :label="$t('merchants.currentPassword')" name="currentPassword">
          <a-input-password
            v-model:value="formState.currentPassword"
            :placeholder="$t('merchants.currentPasswordPlaceholder')"
            size="large"
          />
        </a-form-item>

        <a-form-item :label="$t('merchants.newPassword')" name="password">
          <a-input-password
            v-model:value="formState.password"
            :placeholder="$t('merchants.newPasswordPlaceholder')"
            size="large"
          />
        </a-form-item>

        <a-form-item :label="$t('merchants.confirmNewPassword')" name="confirmPassword">
          <a-input-password
            v-model:value="formState.confirmPassword"
            :placeholder="$t('merchants.confirmNewPasswordPlaceholder')"
            size="large"
          />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { message } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import type { Merchant } from '@/domain/entities/user.entity';
import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';

const props = defineProps<{
  visible: boolean;
  merchant: Merchant | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}>();

const { t } = useI18n();

const formRef = ref<FormInstance>();
const loading = ref(false);

const formState = reactive({
  currentPassword: '',
  password: '',
  confirmPassword: '',
});

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

const rules = computed(() => ({
  currentPassword: [
    { required: true, message: t('merchants.currentPasswordRequired') },
    { min: 6, message: t('merchants.passwordMinLength') },
  ],
  password: [
    { required: true, message: t('merchants.newPasswordRequired') },
    { min: 6, message: t('merchants.passwordMinLength') },
  ],
  confirmPassword: [
    { required: true, message: t('merchants.confirmPasswordRequired') },
    {
      validator: (_rule: any, value: string) => {
        if (!value || formState.password === value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error(t('merchants.passwordMismatch')));
      },
    },
  ],
}));

const resetForm = () => {
  formState.currentPassword = '';
  formState.password = '';
  formState.confirmPassword = '';
  formRef.value?.resetFields();
};

const handleCancel = () => {
  visible.value = false;
  resetForm();
};

const handleSubmit = async () => {
  if (!props.merchant) return;

  try {
    await formRef.value?.validate();
    loading.value = true;

    const client = new ApiClient();
    await client.putOrPatch(
      `${API_ENDPOINTS.USERS.BASE}/${props.merchant.ownerUserId}/change-password-by-id`,
      {
        currentPassword: formState.currentPassword,
        password: formState.password,
      },
      'PATCH'
    );

    message.success(t('merchants.changePasswordSuccess'));
    emit('success');
    visible.value = false;
    resetForm();
  } catch (error: any) {
    console.error('Change password error:', error);
    const errorMessage = error?.response?.data?.message || t('merchants.changePasswordError');
    message.error(errorMessage);
  } finally {
    loading.value = false;
  }
};

// Watch for merchant changes to reset form
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});
</script>

<style scoped>
.change-password-form {
  padding: 8px 0;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
  color: #374151;
}

:deep(.ant-input-password) {
  border-radius: 8px;
}

:deep(.ant-input-password input) {
  font-size: 14px;
}
</style>
