import { computed, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { userRepository } from '@/infrastructure/repositories/user.repository';
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

/**
 * Business logic สำหรับ Super Admin: User Management
 * - list/search/pagination
 * - CRUD user
 * - create user + merchant
 */
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
      // ไม่โยน error ให้ UI สะดุด แต่แจ้งไว้พอ
      message.error(queryErrors[0]?.message || 'Invalid query');
      return false;
    }

    store.setLoading(true);
    try {
      const response: BackendPaginatedResponse<User> = await userRepository.getList(query);
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
      await userRepository.create(payload);
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
      await userRepository.update(id, payload);
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

  const deleteUser = async (id: number) => {
    store.setLoading(true);
    try {
      await userRepository.delete(id);
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
      await userRepository.createUserWithMerchant(payload);
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
    deleteUser,
    createUserWithMerchant,
  };
}

