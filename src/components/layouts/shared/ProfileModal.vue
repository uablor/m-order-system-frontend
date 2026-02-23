<template>
  <a-modal
    :open="open"
    :footer="null"
    :width="520"
    :closable="true"
    :destroy-on-close="true"
    class="profile-modal"
    @cancel="$emit('close')"
  >
    <template #title>
      <span class="modal-title">{{ $t('common.profile.title') }}</span>
    </template>

    <a-spin :spinning="loading">
      <!-- Profile header -->
      <div class="profile-header">
        <div class="avatar-wrap">
          <div class="avatar-circle" :style="{ background: avatarBg }">
            {{ avatarLetter }}
          </div>
          <span v-if="user?.isActive !== false" class="active-dot" />
        </div>
        <div class="profile-meta">
          <div class="profile-name">{{ user?.fullName || '-' }}</div>
          <div class="profile-email">{{ user?.email || '-' }}</div>
          <a-tag :color="roleColor" class="role-tag">{{ user?.roleName || '-' }}</a-tag>
        </div>
      </div>

      <a-divider style="margin: 16px 0" />

      <!-- View mode -->
      <template v-if="!editMode && !passwordMode">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">{{ $t('common.profile.email') }}</span>
            <span class="info-value">{{ user?.email || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('common.profile.role') }}</span>
            <span class="info-value">{{ user?.roleName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('common.profile.status') }}</span>
            <div class="status-switch-row">
              <a-switch
                :checked="user?.isActive !== false"
                :loading="togglingActive"
                size="small"
                @change="toggleActive"
              />
              <span class="status-text" :class="user?.isActive !== false ? 'active' : 'inactive'">
                {{ user?.isActive !== false ? $t('common.profile.active') : $t('common.profile.inactive') }}
              </span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('common.profile.memberSince') }}</span>
            <span class="info-value">{{ user?.createdAt ? formatDate(user.createdAt) : '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('common.profile.lastLogin') }}</span>
            <span class="info-value">{{ user?.lastLogin ? formatDate(user.lastLogin) : $t('common.profile.neverLoggedIn') }}</span>
          </div>
        </div>

        <a-divider style="margin: 16px 0" />

        <div class="action-buttons">
          <a-button type="primary" ghost block @click="enterEditMode">
            <EditOutlined /> {{ $t('common.profile.editProfile') }}
          </a-button>
          <a-button block @click="enterPasswordMode">
            <LockOutlined /> {{ $t('common.profile.changePassword') }}
          </a-button>
        </div>
      </template>

      <!-- Edit mode -->
      <template v-if="editMode">
        <a-form layout="vertical" class="edit-form">
          <a-form-item :label="$t('common.profile.fullName')">
            <a-input v-model:value="editForm.fullName" size="large" />
          </a-form-item>
          <a-form-item :label="$t('common.profile.email')">
            <a-input v-model:value="editForm.email" size="large" />
          </a-form-item>
        </a-form>
        <div class="form-actions">
          <a-button @click="cancelEdit">{{ $t('common.cancel') }}</a-button>
          <a-button type="primary" :loading="saving" @click="saveProfile">{{ $t('common.save') }}</a-button>
        </div>
      </template>

      <!-- Change password mode -->
      <template v-if="passwordMode">
        <a-form layout="vertical" class="edit-form">
          <a-form-item :label="$t('common.profile.currentPassword')">
            <a-input-password v-model:value="pwForm.currentPassword" size="large" />
          </a-form-item>
          <a-form-item :label="$t('common.profile.newPassword')">
            <a-input-password v-model:value="pwForm.newPassword" size="large" />
          </a-form-item>
          <a-form-item :label="$t('common.profile.confirmPassword')" :validate-status="pwMismatch ? 'error' : ''" :help="pwMismatch ? $t('common.profile.passwordMismatch') : ''">
            <a-input-password v-model:value="pwForm.confirmPassword" size="large" />
          </a-form-item>
        </a-form>
        <div class="form-actions">
          <a-button @click="cancelPassword">{{ $t('common.cancel') }}</a-button>
          <a-button type="primary" :loading="saving" :disabled="!canSubmitPassword" @click="savePassword">{{ $t('common.profile.changePassword') }}</a-button>
        </div>
      </template>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import { EditOutlined, LockOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { useAuthStore } from '@/store/auth.store';
import { useAuth } from '@/shared/composables/useAuth';
import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import { handleApiError } from '@/shared/utils/error';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const { t } = useI18n();
const authStore = useAuthStore();
const { getMe } = useAuth();
const api = new ApiClient();

const loading = ref(false);
const saving = ref(false);
const togglingActive = ref(false);
const editMode = ref(false);
const passwordMode = ref(false);

const user = computed(() => authStore.user);

const avatarLetter = computed(() => {
  const name = user.value?.fullName || '';
  return name.charAt(0).toUpperCase() || '?';
});

const colors = ['#6366f1', '#0ea5e9', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899'];
const avatarBg = computed(() => {
  const name = user.value?.fullName || '';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
});

const roleColor = computed(() => {
  const r = (user.value?.roleName || '').toLowerCase();
  if (r.includes('super')) return 'red';
  if (r.includes('admin')) return 'blue';
  if (r.includes('merchant')) return 'orange';
  return 'default';
});

const formatDate = (d: string) => dayjs(d).format('YYYY-MM-DD HH:mm');

const editForm = ref({ fullName: '', email: '' });
const pwForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' });

const pwMismatch = computed(() =>
  pwForm.value.confirmPassword.length > 0 && pwForm.value.newPassword !== pwForm.value.confirmPassword,
);
const canSubmitPassword = computed(() =>
  pwForm.value.currentPassword.length >= 6 &&
  pwForm.value.newPassword.length >= 6 &&
  pwForm.value.newPassword === pwForm.value.confirmPassword,
);

watch(() => props.open, async (val) => {
  if (val) {
    editMode.value = false;
    passwordMode.value = false;
    loading.value = true;
    try { await getMe(); } finally { loading.value = false; }
  }
});

const enterEditMode = () => {
  editForm.value = {
    fullName: user.value?.fullName || '',
    email: user.value?.email || '',
  };
  editMode.value = true;
  passwordMode.value = false;
};
const cancelEdit = () => { editMode.value = false; };

const enterPasswordMode = () => {
  pwForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
  passwordMode.value = true;
  editMode.value = false;
};
const cancelPassword = () => { passwordMode.value = false; };

const toggleActive = async (checked: boolean) => {
  if (!user.value?.id) return;
  togglingActive.value = true;
  try {
    await api.putOrPatch(API_ENDPOINTS.USERS.SET_ACTIVE(user.value.id), {
      isActive: checked,
    }, 'PATCH');
    message.success(t('common.profile.statusUpdated'));
    await getMe();
  } catch (err) {
    handleApiError(err, t);
  } finally {
    togglingActive.value = false;
  }
};

const saveProfile = async () => {
  saving.value = true;
  try {
    await api.putOrPatch(API_ENDPOINTS.USERS.UPDATE_PROFILE, {
      fullName: editForm.value.fullName,
      email: editForm.value.email,
    }, 'PATCH');
    message.success(t('common.profile.profileUpdated'));
    editMode.value = false;
    await getMe();
  } catch (err) {
    handleApiError(err, t);
  } finally {
    saving.value = false;
  }
};

const savePassword = async () => {
  saving.value = true;
  try {
    await api.putOrPatch(API_ENDPOINTS.USERS.CHANGE_PASSWORD_SELF, {
      currentPassword: pwForm.value.currentPassword,
      password: pwForm.value.newPassword,
    }, 'PATCH');
    message.success(t('common.profile.passwordChanged'));
    passwordMode.value = false;
    pwForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
  } catch (err: any) {
    const serverMsg = err?.response?.data?.message;
    const msg = Array.isArray(serverMsg) ? serverMsg.join(', ') : serverMsg;
    if (msg?.toLowerCase().includes('invalid current password')) {
      message.error(t('common.profile.wrongPassword'));
    } else {
      handleApiError(err, t);
    }
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.modal-title { font-size: 18px; font-weight: 700; color: #0f172a; }

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.avatar-wrap { position: relative; flex-shrink: 0; }
.avatar-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -1px;
}
.active-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: #22c55e;
  border-radius: 50%;
  border: 3px solid #fff;
}

.profile-meta { flex: 1; min-width: 0; }
.profile-name { font-size: 20px; font-weight: 700; color: #0f172a; line-height: 1.3; }
.profile-email { font-size: 14px; color: #64748b; margin-top: 2px; }
.role-tag { border-radius: 999px; font-weight: 700; margin-top: 6px; }

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 24px;
}
.info-item { display: flex; flex-direction: column; gap: 2px; }
.info-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.3px; }
.info-value { font-size: 14px; font-weight: 600; color: #1e293b; }
.status-switch-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}
.status-text { font-size: 13px; font-weight: 700; }
.status-text.active { color: #16a34a; }
.status-text.inactive { color: #94a3b8; }

.action-buttons {
  display: flex;
  gap: 10px;
}
.action-buttons .ant-btn { border-radius: 10px; height: 40px; font-weight: 600; }

.edit-form { margin-top: 4px; }
.edit-form :deep(.ant-form-item) { margin-bottom: 14px; }
.edit-form :deep(.ant-input), .edit-form :deep(.ant-input-password) { border-radius: 10px; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}
.form-actions .ant-btn { border-radius: 10px; height: 38px; font-weight: 600; }

@media (max-width: 520px) {
  .info-grid { grid-template-columns: 1fr; }
  .action-buttons { flex-direction: column; }
  .avatar-circle { width: 52px; height: 52px; font-size: 24px; }
}
</style>
