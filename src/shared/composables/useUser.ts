import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { userRepository } from '@/infrastructure/repositories/user.repository';
import type { UserCreateDto, UserUpdateDto, UserListQueryDto } from '@/application/dto/user.dto';
import type { User } from '@/domain/entities/user.entity';
import { handleApiError } from '@/shared/utils/error';

export function useUser() {
  const { t } = useI18n();
  const loading = ref(false);
  const users = ref<User[]>([]);
  const selectedUser = ref<User | null>(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  /**
   * Fetch users list
   */
  const fetchUsers = async (query: UserListQueryDto = {}) => {
    loading.value = true;
    try {
      const response = await userRepository.getList({
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...query,
      });

      users.value = response.results;
      pagination.value = response.pagination as any;
    } catch (error) {
      handleApiError(error, t);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch user by ID
   */
  const fetchUserById = async (id: number) => {
    loading.value = true;
    try {
      const response = await userRepository.getById(id);
      selectedUser.value = response as any;
    } catch (error) {
      handleApiError(error, t);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Create user
   */
  const createUser = async (data: UserCreateDto) => {
    loading.value = true;
    try {
      await userRepository.create(data);
      message.success(t('users.createSuccess'));
      await fetchUsers();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update user
   */
  const updateUser = async (id: number, data: UserUpdateDto) => {
    loading.value = true;
    try {
      await userRepository.update(id, data);
      message.success(t('users.updateSuccess'));
      await fetchUsers();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete user
   */
  const deleteUser = async (id: number) => {
    loading.value = true;
    try {
      await userRepository.delete(id);
      message.success(t('users.deleteSuccess'));
      await fetchUsers();
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
    fetchUsers();
  };

  /**
   * Search users
   */
  const searchUsers = (searchText: string) => {
    pagination.value.page = 1;
    fetchUsers({ search: searchText });
  };

  return {
    loading: computed(() => loading.value),
    users: computed(() => users.value),
    selectedUser: computed(() => selectedUser.value),
    pagination: computed(() => pagination.value),
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    setPagination,
    searchUsers,
  };
}
