import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { BackendPagination } from '@/shared/types/backend-response.types';
import type { User } from '@/domain/entities/user.entity';

export interface SuperAdminUserQuery {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
}

const defaultPagination: BackendPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export const useSuperAdminUserStore = defineStore('superAdminUserStore', () => {
  // state
  const loading = ref(false);
  const users = ref<User[]>([]);
  const pagination = ref<BackendPagination>({ ...defaultPagination });
  const query = ref<SuperAdminUserQuery>({ page: 1, limit: 10, search: undefined, isActive: undefined });

  // getters
  const tableData = computed(() => users.value);
  const tablePagination = computed(() => pagination.value);
  const currentQuery = computed(() => query.value);

  // actions (pure state mutations)
  const setLoading = (value: boolean) => { loading.value = value; };
  const setUsers = (value: User[]) => { users.value = value; };
  const setPagination = (value: BackendPagination) => { pagination.value = value; };
  const setQuery = (value: Partial<SuperAdminUserQuery>) => { query.value = { ...query.value, ...value }; };
  const resetQuery = () => { query.value = { page: 1, limit: 10, search: undefined, isActive: undefined }; };

  return {
    loading,
    users,
    pagination,
    query,
    tableData,
    tablePagination,
    currentQuery,
    setLoading,
    setUsers,
    setPagination,
    setQuery,
    resetQuery,
  };
});

