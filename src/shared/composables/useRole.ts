import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { roleRepository } from '@/infrastructure/repositories/role.repository';
import type { RoleCreateDto, RoleUpdateDto, RoleListQueryDto } from '@/application/dto/role.dto';
import type { Role } from '@/domain/entities/user.entity';
import { handleApiError } from '@/shared/utils/error';

export function useRole() {
  const { t } = useI18n();
  const loading = ref(false);
  const roles = ref<Role[]>([]);
  const selectedRole = ref<Role | null>(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  /**
   * Fetch roles list
   */
  const fetchRoles = async (query: RoleListQueryDto = {}) => {
    loading.value = true;
    try {
      const response = await roleRepository.getList({
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...query,
      });

      roles.value = response.results;
      pagination.value = response.pagination as any;
    } catch (error) {
      handleApiError(error, t);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch role by ID
   */
  const fetchRoleById = async (id: number) => {
    loading.value = true;
    try {
      const response = await roleRepository.getById(id);
      selectedRole.value = response as any;
    } catch (error) {
      handleApiError(error, t);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Create role
   */
  const createRole = async (data: RoleCreateDto) => {
    loading.value = true;
    try {
      await roleRepository.create(data);
      message.success(t('roles.createSuccess'));
      await fetchRoles();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update role
   */
  const updateRole = async (id: number, data: RoleUpdateDto) => {
    loading.value = true;
    try {
      await roleRepository.update(id, data);
      message.success(t('roles.updateSuccess'));
      await fetchRoles();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete role
   */
  const deleteRole = async (id: number) => {
    loading.value = true;
    try {
      await roleRepository.delete(id);
      message.success(t('roles.deleteSuccess'));
      await fetchRoles();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Set pagination
   */
  const setPagination = (page: number, limit: number) => {
    pagination.value.page = page;
    pagination.value.limit = limit;
    fetchRoles();
  };

  /**
   * Search roles
   */
  const searchRoles = (searchText: string) => {
    pagination.value.page = 1;
    fetchRoles({ search: searchText });
  };

  return {
    loading: computed(() => loading.value),
    roles: computed(() => roles.value),
    selectedRole: computed(() => selectedRole.value),
    pagination: computed(() => pagination.value),
    fetchRoles,
    fetchRoleById,
    createRole,
    updateRole,
    deleteRole,
    setPagination,
    searchRoles,
  };
}
