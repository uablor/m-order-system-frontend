<template>
  <div class="users-page">
    <UserTable
      :users="users"
      :loading="loading"
      :pagination="pagination"
      @create-user="openCreateModal"
      @create-merchant="goCreateMerchantUser"
      @delete="confirmDelete"
      @filter-change="handleFilterChange"
      @page-change="handlePageChange"
    />

    <!-- Create User Modal -->
    <UserFormModal
      :open="showCreateModal"
      :loading="modalLoading"
      mode="create"
      :roles="roles"
      @submit="handleCreateSubmit"
      @cancel="showCreateModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import UserTable from '@/presentation/components/super-admin/users/table/UserTable.vue';
import UserFormModal from '@/presentation/components/super-admin/users/modal/UserFormModal.vue';
import { useSuperAdminUsers } from '@/presentation/composables/super-admin/useSuperAdminUsers';
import { useSuperAdminRoles } from '@/presentation/composables/super-admin/useSuperAdminRoles';
import type { UserCreateDto, UserListQueryDto } from '@/application/dto/user.dto';
import type { UserFilterPayload } from '@/presentation/components/super-admin/users/table/UserTable.vue';

const router = useRouter();

const {
  loading,
  users,
  pagination,
  fetchUsers,
  deleteUser,
  changePage,
  createUser,
} = useSuperAdminUsers();

const { fetchRoles, roles } = useSuperAdminRoles();

const showCreateModal = ref(false);
const modalLoading = ref(false);

const openCreateModal = () => {
  showCreateModal.value = true;
};

const handleCreateSubmit = async (payload: {
  email: string;
  password?: string;
  fullName: string;
  isActive: boolean;
}) => {
  modalLoading.value = true;
  const dto: UserCreateDto = {
    email: payload.email,
    password: payload.password ?? '',
    fullName: payload.fullName,
    isActive: payload.isActive,
  };
  const success = await createUser(dto);
  modalLoading.value = false;
  if (success) showCreateModal.value = false;
};

const goCreateMerchantUser = () => {
  router.push('/super-admin/users/create-merchant');
};

const confirmDelete = async (user: import('@/domain/entities/user.entity').User) => {
  await deleteUser(user.id);
};

const handleFilterChange = async (filters: UserFilterPayload) => {
  const query: Partial<UserListQueryDto> = {
    page: 1,
    search: filters.search,
    searchField: filters.searchField,
    isActive: filters.isActive,
    sort: filters.sort,
    startDate: filters.startDate,
    endDate: filters.endDate,
  };
  await fetchUsers(query);
};

const handlePageChange = async (page: number, pageSize: number) => {
  await changePage(page, pageSize);
};

onMounted(async () => {
  await Promise.allSettled([fetchRoles(), fetchUsers()]);
});
</script>

<style scoped>
.users-page {
  padding: 0;
}
</style>
