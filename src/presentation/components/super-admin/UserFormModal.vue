<template>
  <a-modal
    :open="open"
    :title="mode === 'create' ? $t('users.createUser') : $t('users.editUser')"
    :confirm-loading="loading"
    @ok="submit"
    @cancel="$emit('cancel')"
    width="620px"
  >
    <a-form ref="formRef" :model="formState" layout="vertical">
      <a-form-item name="fullName" :label="$t('users.fullName')" :rules="[{ required: true, message: $t('users.fullName') + ' is required' }]">
        <a-input v-model:value="formState.fullName" />
      </a-form-item>

      <a-form-item name="email" :label="$t('users.email')" :rules="[{ required: true, message: $t('login.emailRequired') }, { type: 'email', message: $t('login.emailInvalid') }]">
        <a-input v-model:value="formState.email" type="email" />
      </a-form-item>

      <a-form-item name="password" :label="$t('users.password')" :extra="mode === 'edit' ? $t('users.passwordHelper') : undefined">
        <a-input-password v-model:value="formState.password" :placeholder="mode === 'edit' ? $t('users.passwordHelper') : undefined" />
      </a-form-item>

      <a-form-item name="roleId" :label="$t('users.role')" :rules="[{ required: true, message: $t('users.selectRole') }]">
        <a-select v-model:value="formState.roleId" :placeholder="$t('users.selectRole')">
          <a-select-option v-for="role in roles" :key="role.id" :value="role.id">
            {{ role.roleName }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item name="isActive" :label="$t('users.isActive')">
        <a-switch v-model:checked="formState.isActive" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue';
import type { FormInstance } from 'ant-design-vue';
import type { Role, User } from '@/domain/entities/user.entity';

const props = defineProps<{
  open: boolean;
  loading: boolean;
  mode: 'create' | 'edit';
  roles: Role[];
  initialUser?: User | null;
}>();

const emit = defineEmits<{
  (e: 'submit', payload: { email: string; password?: string; fullName: string; roleId: number; isActive: boolean }): void;
  (e: 'cancel'): void;
}>();

const formRef = ref<FormInstance>();

const formState = reactive({
  email: '',
  password: '',
  fullName: '',
  roleId: undefined as unknown as number,
  isActive: true,
});

watch(
  () => [props.open, props.mode, props.initialUser] as const,
  () => {
    if (!props.open) return;

    if (props.mode === 'edit' && props.initialUser) {
      formState.email = props.initialUser.email;
      formState.password = '';
      formState.fullName = props.initialUser.fullName;
      formState.roleId = props.initialUser.roleId;
      formState.isActive = props.initialUser.isActive;
    } else {
      formState.email = '';
      formState.password = '';
      formState.fullName = '';
      formState.roleId = props.roles?.[0]?.id ?? (undefined as any);
      formState.isActive = true;
    }
    // reset validate state
    formRef.value?.clearValidate?.();
  }
);

const submit = async () => {
  try {
    await formRef.value?.validate();
    emit('submit', {
      email: formState.email,
      password: formState.password || undefined,
      fullName: formState.fullName,
      roleId: Number(formState.roleId),
      isActive: !!formState.isActive,
    });
  } catch {
    // ให้ form แสดง error เอง
  }
};
</script>

