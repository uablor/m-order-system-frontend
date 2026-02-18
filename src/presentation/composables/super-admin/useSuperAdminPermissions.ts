import { computed } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { permissionRepository } from '@/infrastructure/repositories/permission.repository';
import type { Permission } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';
import type { PermissionCreateDto, PermissionListQueryDto, PermissionUpdateDto } from '@/application/dto/permission.dto';
import { handleApiError } from '@/shared/utils/error';
import { useSuperAdminPermissionStore } from '@/presentation/stores/super-admin/superAdminPermission.store';
import {
  validateCreatePermission,
  validatePermissionListQuery,
  validateUpdatePermission,
} from '@/presentation/validator/super-admin/permission.validator';

/**
 * Business logic สำหรับ Super Admin: Permission Management
 * - list / pagination / CRUD / generate
 */
export function useSuperAdminPermissions() {
  const { t } = useI18n();
  const store = useSuperAdminPermissionStore();

  const fetchPermissions = async (overrideQuery: Partial<PermissionListQueryDto> = {}) => {
    const query: PermissionListQueryDto = {
      page: store.query.page,
      limit: store.query.limit,
      ...overrideQuery,
    };

    const queryErrors = validatePermissionListQuery(query);
    if (queryErrors.length > 0) {
      message.error(queryErrors[0]?.message || 'Invalid query');
      return false;
    }

    store.setLoading(true);
    try {
      const response: BackendPaginatedResponse<Permission> = await permissionRepository.getList(query);
      store.setPermissions(response.results);
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
    await fetchPermissions();
  };

  const createPermission = async (payload: PermissionCreateDto) => {
    const errors = validateCreatePermission(payload);
    if (errors.length > 0) {
      message.error(errors[0]?.message || 'Invalid payload');
      return false;
    }

    store.setLoading(true);
    try {
      await permissionRepository.create(payload);
      message.success(t('access.permissions.createSuccess'));
      await fetchPermissions();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const updatePermission = async (id: number, payload: PermissionUpdateDto) => {
    const errors = validateUpdatePermission(payload);
    if (errors.length > 0) {
      message.error(errors[0]?.message || 'Invalid payload');
      return false;
    }

    store.setLoading(true);
    try {
      await permissionRepository.update(id, payload);
      message.success(t('access.permissions.updateSuccess'));
      await fetchPermissions();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const deletePermission = async (id: number) => {
    store.setLoading(true);
    try {
      await permissionRepository.delete(id);
      message.success(t('access.permissions.deleteSuccess'));
      await fetchPermissions();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const generatePermissions = async () => {
    store.setLoading(true);
    try {
      await permissionRepository.generateFromControllers();
      message.success(t('access.permissions.generateSuccess'));
      await fetchPermissions({ page: 1 });
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
    permissions: computed(() => store.tableData),
    pagination: computed(() => store.tablePagination),
    fetchPermissions,
    changePage,
    createPermission,
    updatePermission,
    deletePermission,
    generatePermissions,
  };
}

