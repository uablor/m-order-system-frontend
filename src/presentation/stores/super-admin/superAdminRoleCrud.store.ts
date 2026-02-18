import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { BackendPagination } from '@/shared/types/backend-response.types';
import type { Role } from '@/domain/entities/user.entity';
import type { RoleListQueryDto } from '@/application/dto/role.dto';

const defaultPagination: BackendPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export const useSuperAdminRoleCrudStore = defineStore('superAdminRoleCrudStore', () => {
  const loading = ref(false);
  const roles = ref<Role[]>([]);
  const pagination = ref<BackendPagination>({ ...defaultPagination });
  const query = ref<RoleListQueryDto>({ page: 1, limit: 10 });

  const tableData = computed(() => roles.value);
  const tablePagination = computed(() => pagination.value);
  const currentQuery = computed(() => query.value);

  const setLoading = (value: boolean) => { loading.value = value; };
  const setRoles = (value: Role[]) => { roles.value = value; };
  const setPagination = (value: BackendPagination) => { pagination.value = value; };
  const setQuery = (value: Partial<RoleListQueryDto>) => { query.value = { ...query.value, ...value }; };
  const resetQuery = () => { query.value = { page: 1, limit: 10 }; };

  return {
    loading,
    roles,
    pagination,
    query,
    tableData,
    tablePagination,
    currentQuery,
    setLoading,
    setRoles,
    setPagination,
    setQuery,
    resetQuery,
  };
});

