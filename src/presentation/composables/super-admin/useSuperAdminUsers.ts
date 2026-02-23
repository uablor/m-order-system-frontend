import { computed, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { userService } from '@/infrastructure/services/user.service';
import type { User } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';
import type { UserCreateDto, UserListQueryDto, UserMerchantCreateDto, UserUpdateDto } from '@/application/dto/user.dto';
import { handleApiError } from '@/shared/utils/error';
import { useSuperAdminUserStore } from '@/presentation/stores/super-admin/superAdminUser.store';
import {
  validateCreateUser,
  validateCreateUserWithMerchant,
  validateUpdateUser,
  validateUserListQuery,
} from '@/presentation/validator/super-admin/user.validator';

export function useSuperAdminUsers() {
  const { t } = useI18n();
  const store = useSuperAdminUserStore();
  const selectedUser = ref<User | null>(null);

  const fetchUsers = async (overrideQuery: Partial<UserListQueryDto> = {}) => {
    const query: UserListQueryDto = {
      page: store.query.page,
      limit: store.query.limit,
      search: store.query.search,
      isActive: store.query.isActive,
      ...overrideQuery,
    };

    const queryErrors = validateUserListQuery(query);
    if (queryErrors.length > 0) {
      message.error(queryErrors[0]?.message || 'Invalid query');
      return false;
    }

    store.setLoading(true);
    try {
      const response: BackendPaginatedResponse<User> = await userService.getList(query);
      store.setUsers(response.results);
      store.setPagination(response.pagination);
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const searchUsers = async (searchText: string) => {
    store.setQuery({ page: 1, search: searchText || undefined });
    await fetchUsers();
  };

  const changePage = async (page: number, limit: number) => {
    store.setQuery({ page, limit });
    await fetchUsers();
  };

  const createUser = async (payload: UserCreateDto) => {
    const errors = validateCreateUser(payload);
    if (errors.length > 0) {
      message.error(errors[0]?.message || 'Invalid payload');
      return false;
    }

    store.setLoading(true);
    try {
      await userService.create(payload);
      message.success(t('users.createSuccess'));
      await fetchUsers();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const updateUser = async (id: number, payload: UserUpdateDto) => {
    const errors = validateUpdateUser(payload);
    if (errors.length > 0) {
      message.error(errors[0]?.message || 'Invalid payload');
      return false;
    }

    store.setLoading(true);
    try {
      await userService.update(id, payload);
      message.success(t('users.updateSuccess'));
      await fetchUsers();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    store.setLoading(true);
    try {
      await userService.setActive(id, isActive);
      message.success(t('users.updateSuccess'));
      await fetchUsers();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const changePasswordById = async (id: number, password: string) => {
    store.setLoading(true);
    try {
      await userService.changePassword(id, password);
      message.success(t('users.updateSuccess'));
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    store.setLoading(true);
    try {
      await userService.delete(id);
      message.success(t('users.deleteSuccess'));
      await fetchUsers();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const createUserWithMerchant = async (payload: UserMerchantCreateDto) => {
    const errors = validateCreateUserWithMerchant(payload);
    if (errors.length > 0) {
      message.error(errors[0]?.message || 'Invalid payload');
      return false;
    }

    store.setLoading(true);
    try {
      await userService.createUserWithMerchant(payload);
      message.success(t('users.createSuccess'));
      await fetchUsers();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const setSelectedUser = (user: User | null) => {
    selectedUser.value = user;
  };

  return {
    loading: computed(() => store.loading),
    users: computed(() => store.tableData),
    pagination: computed(() => store.tablePagination),
    query: computed(() => store.currentQuery),
    selectedUser: computed(() => selectedUser.value),
    setSelectedUser,
    fetchUsers,
    searchUsers,
    changePage,
    createUser,
    updateUser,
    toggleActive,
    changePasswordById,
    deleteUser,
    createUserWithMerchant,
  };
}

