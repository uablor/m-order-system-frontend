import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { BackendPagination } from '@/shared/types/backend-response.types';
import type { Permission } from '@/domain/entities/user.entity';
import type { PermissionListQueryDto } from '@/application/dto/permission.dto';

const defaultPagination: BackendPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export const useSuperAdminPermissionStore = defineStore('superAdminPermissionStore', () => {
  const loading = ref(false);
  const permissions = ref<Permission[]>([]);
  const pagination = ref<BackendPagination>({ ...defaultPagination });
  const query = ref<PermissionListQueryDto>({ page: 1, limit: 10 });

  const tableData = computed(() => permissions.value);
  const tablePagination = computed(() => pagination.value);
  const currentQuery = computed(() => query.value);

  const setLoading = (value: boolean) => { loading.value = value; };
  const setPermissions = (value: Permission[]) => { permissions.value = value; };
  const setPagination = (value: BackendPagination) => { pagination.value = value; };
  const setQuery = (value: Partial<PermissionListQueryDto>) => { query.value = { ...query.value, ...value }; };
  const resetQuery = () => { query.value = { page: 1, limit: 10 }; };

  return {
    loading,
    permissions,
    pagination,
    query,
    tableData,
    tablePagination,
    currentQuery,
    setLoading,
    setPermissions,
    setPagination,
    setQuery,
    resetQuery,
  };
});

