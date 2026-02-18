import { computed } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { roleRepository } from '@/infrastructure/repositories/role.repository';
import type { Role } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';
import type { RoleCreateDto, RoleListQueryDto, RoleUpdateDto } from '@/application/dto/role.dto';
import { handleApiError } from '@/shared/utils/error';
import { useSuperAdminRoleCrudStore } from '@/presentation/stores/super-admin/superAdminRoleCrud.store';
import {
  validateCreateRole,
  validateRoleListQuery,
  validateUpdateRole,
} from '@/presentation/validator/super-admin/role.validator';

/**
 * Business logic สำหรับ Super Admin: Role CRUD
 */
export function useSuperAdminRolesCrud() {
  const { t } = useI18n();
  const store = useSuperAdminRoleCrudStore();

  const fetchRoles = async (overrideQuery: Partial<RoleListQueryDto> = {}) => {
    const query: RoleListQueryDto = {
      page: store.query.page,
      limit: store.query.limit,
      ...overrideQuery,
    };

    const queryErrors = validateRoleListQuery(query);
    if (queryErrors.length > 0) {
      message.error(queryErrors[0]?.message || 'Invalid query');
      return false;
    }

    store.setLoading(true);
    try {
      const response: BackendPaginatedResponse<Role> = await roleRepository.getList(query);
      store.setRoles(response.results);
      store.setPagination(response.pagination);
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const changePage = async (page: number, limit: number) => {
    store.setQuery({ page, limit });
    await fetchRoles();
  };

  const createRole = async (payload: RoleCreateDto) => {
    const errors = validateCreateRole(payload);
    if (errors.length > 0) {
      message.error(errors[0]?.message || 'Invalid payload');
      return false;
    }

    store.setLoading(true);
    try {
      await roleRepository.create(payload);
      message.success(t('access.roles.createSuccess'));
      await fetchRoles();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const updateRole = async (id: number, payload: RoleUpdateDto) => {
    const errors = validateUpdateRole(payload);
    if (errors.length > 0) {
      message.error(errors[0]?.message || 'Invalid payload');
      return false;
    }

    store.setLoading(true);
    try {
      await roleRepository.update(id, payload);
      message.success(t('access.roles.updateSuccess'));
      await fetchRoles();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const deleteRole = async (id: number) => {
    store.setLoading(true);
    try {
      await roleRepository.delete(id);
      message.success(t('access.roles.deleteSuccess'));
      await fetchRoles();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  return {
    loading: computed(() => store.loading),
    roles: computed(() => store.tableData),
    pagination: computed(() => store.tablePagination),
    fetchRoles,
    changePage,
    createRole,
    updateRole,
    deleteRole,
  };
}

