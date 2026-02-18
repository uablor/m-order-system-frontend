import { computed } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import type { Role } from '@/domain/entities/user.entity';
import type { RoleListQueryDto } from '@/application/dto/role.dto';
import { roleRepository } from '@/infrastructure/repositories/role.repository';
import { handleApiError } from '@/shared/utils/error';
import { defineStore } from 'pinia';
import { ref } from 'vue';

// store เล็ก ๆ สำหรับ roles (เฉพาะ super admin)
const useSuperAdminRoleStore = defineStore('superAdminRoleStore', () => {
  const loading = ref(false);
  const roles = ref<Role[]>([]);
  const setLoading = (value: boolean) => { loading.value = value; };
  const setRoles = (value: Role[]) => { roles.value = value; };
  return { loading, roles, setLoading, setRoles };
});

export function useSuperAdminRoles() {
  const { t } = useI18n();
  const store = useSuperAdminRoleStore();

  const fetchRoles = async (query: RoleListQueryDto = { page: 1, limit: 100 }) => {
    store.setLoading(true);
    try {
      const res = await roleRepository.getList(query);
      store.setRoles(res.results || []);
    } catch (error) {
      handleApiError(error, t);
      message.error('Failed to load roles');
    } finally {
      store.setLoading(false);
    }
  };

  return {
    loading: computed(() => store.loading),
    roles: computed(() => store.roles),
    fetchRoles,
  };
}

