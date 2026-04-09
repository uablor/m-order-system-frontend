<template>
  <div class="merchants-page">
    <MerchantTable
      :merchants="merchants"
      :loading="loading"
      :pagination="pagination"
      @create="goCreate"
      @detail="goDetail"
      @edit="goEdit"
      @delete="confirmDelete"
      @toggle-status="handleToggleStatus"
      @filter-change="handleFilterChange"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import MerchantTable from '@/presentation/components/super-admin/merchants/table/MerchantTable.vue';
import { useSuperAdminMerchants } from '@/presentation/composables/super-admin/useSuperAdminMerchants';
import type { MerchantFilterPayload } from '@/presentation/components/super-admin/merchants/table/MerchantTable.vue';

const router = useRouter();
const {
  loading,
  merchants,
  pagination,
  fetchMerchants,
  deleteMerchant,
  toggleMerchantStatus,
  changePage,
} = useSuperAdminMerchants();

const goCreate = () => router.push({ name: 'super-admin-users-create-merchant' });
const goDetail = (merchant: import('@/domain/entities/user.entity').Merchant) => {
  router.push(`/super-admin/merchants/${merchant.id}/detail`);
};
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

const handleToggleStatus = async (merchant: import('@/domain/entities/user.entity').Merchant) => {
  await toggleMerchantStatus(merchant.id, !merchant.isActive);
  await fetchMerchants(); // Refresh list to show updated status
};

const handleFilterChange = async (filters: MerchantFilterPayload) => {
  /* reset page → 1 เมื่อ filter เปลี่ยน และส่งค่า filter ทั้งหมดตรง ๆ */
  await fetchMerchants({ page: 1, ...filters });
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
