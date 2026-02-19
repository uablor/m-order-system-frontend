<template>
  <div class="merchants-page">
    <MerchantTable
      :merchants="merchants"
      :loading="loading"
      :pagination="pagination"
      @create="goCreate"
      @edit="goEdit"
      @delete="confirmDelete"
      @search="handleSearch"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import MerchantTable from '@/presentation/components/super-admin/merchants/table/MerchantTable.vue';
import { useSuperAdminMerchants } from '@/presentation/composables/super-admin/useSuperAdminMerchants';

const router = useRouter();
const {
  loading,
  merchants,
  pagination,
  fetchMerchants,
  deleteMerchant,
  searchMerchants,
  changePage,
} = useSuperAdminMerchants();

const goCreate = () => router.push({ name: 'super-admin-users-create-merchant' });
const goEdit = (merchant: import('@/domain/entities/user.entity').Merchant) => {
  try {
    localStorage.setItem('sa:last-edit-merchant', JSON.stringify(merchant));
  } catch {
    // ignore
  }
  router.push(`/super-admin/merchants/${merchant.id}/edit`);
};

const confirmDelete = async (merchant: import('@/domain/entities/user.entity').Merchant) => {
  await deleteMerchant(merchant.id);
};

const handleSearch = async (searchText: string) => {
  await searchMerchants(searchText);
};

const handlePageChange = async (page: number, pageSize: number) => {
  await changePage(page, pageSize);
};

onMounted(async () => {
  await fetchMerchants();
});
</script>

<style scoped>
.merchants-page {
  padding: 0;
}
</style>
