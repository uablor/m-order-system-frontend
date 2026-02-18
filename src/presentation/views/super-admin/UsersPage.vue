<template>
  <div class="users-page">
    <UserTable
      :users="users"
      :loading="loading"
      :pagination="pagination"
      @create-merchant="goCreateMerchantUser"
      @delete="confirmDelete"
      @search="handleSearch"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import UserTable from '@/presentation/components/super-admin/UserTable.vue';
import { useSuperAdminUsers } from '@/presentation/composables/super-admin/useSuperAdminUsers';
import { useSuperAdminRoles } from '@/presentation/composables/super-admin/useSuperAdminRoles';

const router = useRouter();
const {
  loading,
  users,
  pagination,
  fetchUsers,
  deleteUser,
  searchUsers,
  changePage,
} = useSuperAdminUsers();

const { fetchRoles } = useSuperAdminRoles();

const goCreateMerchantUser = () => {
  router.push('/super-admin/users/create-merchant');
};

const confirmDelete = async (user: import('@/domain/entities/user.entity').User) => {
  await deleteUser(user.id);
};

const handleSearch = async (searchText: string) => {
  await searchUsers(searchText);
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
  padding: 24px;
}

@media (max-width: 768px) {
  .users-page {
    padding: 16px;
  }
}
</style>
