<template>
  <div class="exchange-rates-page">
    <ExchangeRateTable
      :exchange-rates="exchangeRates"
      :loading="loading"
      :pagination="pagination"
      @create="openCreateModal"
      @edit="openEditModal"
      @delete="confirmDelete"
      @search="handleSearch"
      @page-change="handlePageChange"
    />

    <ExchangeRateFormModal
      :open="modalOpen"
      :confirm-loading="loading"
      :exchange-rate="editingRate"
      @ok="handleFormOk"
      @cancel="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import ExchangeRateTable from '@/presentation/components/super-admin/exchange-rates/table/ExchangeRateTable.vue';
import ExchangeRateFormModal from '@/presentation/components/super-admin/exchange-rates/modal/ExchangeRateFormModal.vue';
import { useSuperAdminExchangeRates } from '@/presentation/composables/super-admin/useSuperAdminExchangeRates';
import type { ExchangeRate } from '@/domain/entities/user.entity';

const {
  loading,
  exchangeRates,
  pagination,
  fetchExchangeRates,
  createExchangeRate,
  updateExchangeRate,
  deleteExchangeRate,
  searchExchangeRates,
  changePage,
} = useSuperAdminExchangeRates();

const modalOpen = ref(false);
const editingRate = ref<ExchangeRate | null>(null);

const openCreateModal = () => {
  editingRate.value = null;
  modalOpen.value = true;
};

const openEditModal = (rate: ExchangeRate) => {
  editingRate.value = rate;
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
  editingRate.value = null;
};

const handleFormOk = async (data: any) => {
  let success = false;
  if (editingRate.value) {
    success = await updateExchangeRate(editingRate.value.id, data);
  } else {
    success = await createExchangeRate(data);
  }
  if (success) closeModal();
};

const confirmDelete = async (rate: ExchangeRate) => {
  await deleteExchangeRate(rate.id);
};

const handleSearch = async (searchText: string) => {
  await searchExchangeRates(searchText);
};

const handlePageChange = async (page: number, pageSize: number) => {
  await changePage(page, pageSize);
};

onMounted(async () => {
  await fetchExchangeRates();
});
</script>

<style scoped>
.exchange-rates-page { padding: 0; }
</style>
