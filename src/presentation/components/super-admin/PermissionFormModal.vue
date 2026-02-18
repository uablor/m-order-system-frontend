<template>
  <a-modal
    :open="open"
    :title="mode === 'create' ? $t('access.permissions.create') : $t('access.permissions.edit')"
    :confirm-loading="loading"
    width="640px"
    @ok="submit"
    @cancel="$emit('cancel')"
  >
    <a-form ref="formRef" :model="formState" layout="vertical">
      <a-form-item
        name="permissionCode"
        :label="$t('access.permissions.permissionCode')"
        :rules="[
          { required: true, message: $t('access.validation.required') },
          { max: 100, message: $t('access.validation.max100') }
        ]"
      >
        <a-input v-model:value="formState.permissionCode" />
      </a-form-item>

      <a-form-item
        name="description"
        :label="$t('access.permissions.description')"
        :rules="[{ max: 500, message: $t('access.validation.max500') }]"
      >
        <a-textarea v-model:value="formState.description" :rows="3" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import type { FormInstance } from 'ant-design-vue';
import type { Permission } from '@/domain/entities/user.entity';
import type { PermissionCreateDto, PermissionUpdateDto } from '@/application/dto/permission.dto';

const props = defineProps<{
  open: boolean;
  loading: boolean;
  mode: 'create' | 'edit';
  initialPermission?: Permission | null;
}>();

const emit = defineEmits<{
  (e: 'submit', payload: PermissionCreateDto | PermissionUpdateDto): void;
  (e: 'cancel'): void;
}>();

const formRef = ref<FormInstance>();

const formState = reactive({
  permissionCode: '',
  description: '',
});

watch(
  () => [props.open, props.mode, props.initialPermission] as const,
  () => {
    if (!props.open) return;
    if (props.mode === 'edit' && props.initialPermission) {
      formState.permissionCode = props.initialPermission.permissionCode;
      formState.description = props.initialPermission.description ?? '';
    } else {
      formState.permissionCode = '';
      formState.description = '';
    }
    formRef.value?.clearValidate?.();
  },
);

const submit = async () => {
  try {
    await formRef.value?.validate();
    emit('submit', {
      permissionCode: formState.permissionCode.trim(),
      description: formState.description.trim() ? formState.description.trim() : undefined,
    });
  } catch {
    // ให้ form แสดง error เอง
  }
};
</script>

