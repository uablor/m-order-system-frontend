<template>
  <a-modal
    :open="open"
    :title="mode === 'create' ? $t('access.roles.create') : $t('access.roles.edit')"
    :confirm-loading="loading"
    width="640px"
    @ok="submit"
    @cancel="$emit('cancel')"
  >
    <a-form ref="formRef" :model="formState" layout="vertical">
      <a-form-item
        name="roleName"
        :label="$t('access.roles.roleName')"
        :rules="[
          { required: true, message: $t('access.validation.required') },
          { max: 100, message: $t('access.validation.max100') }
        ]"
      >
        <a-input v-model:value="formState.roleName" />
      </a-form-item>

      <a-form-item
        name="description"
        :label="$t('access.roles.description')"
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
import type { Role } from '@/domain/entities/user.entity';
import type { RoleCreateDto, RoleUpdateDto } from '@/application/dto/role.dto';

const props = defineProps<{
  open: boolean;
  loading: boolean;
  mode: 'create' | 'edit';
  initialRole?: Role | null;
}>();

const emit = defineEmits<{
  (e: 'submit', payload: RoleCreateDto | RoleUpdateDto): void;
  (e: 'cancel'): void;
}>();

const formRef = ref<FormInstance>();

const formState = reactive({
  roleName: '',
  description: '',
});

watch(
  () => [props.open, props.mode, props.initialRole] as const,
  () => {
    if (!props.open) return;
    if (props.mode === 'edit' && props.initialRole) {
      formState.roleName = props.initialRole.roleName;
      formState.description = props.initialRole.description ?? '';
    } else {
      formState.roleName = '';
      formState.description = '';
    }
    formRef.value?.clearValidate?.();
  },
);

const submit = async () => {
  try {
    await formRef.value?.validate();
    emit('submit', {
      roleName: formState.roleName.trim(),
      description: formState.description.trim() ? formState.description.trim() : undefined,
    });
  } catch {
    // ให้ form แสดง error เอง
  }
};
</script>

