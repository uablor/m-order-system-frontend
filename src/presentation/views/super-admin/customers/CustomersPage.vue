<template>
  <div class="customers-page">
    <CustomerTable
      :customers="customers"
      :loading="loading"
      :pagination="pagination"
      @create="openCreateModal"
      @edit="openEditModal"
      @delete="confirmDelete"
      @search="handleSearch"
      @page-change="handlePageChange"
    />

    <CustomerFormModal
      :open="modalOpen"
      :confirm-loading="loading"
      :customer="editingCustomer"
      :merchants="merchantList"
      @ok="handleFormOk"
      @cancel="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import CustomerTable from '@/presentation/components/super-admin/customers/table/CustomerTable.vue';
import CustomerFormModal from '@/presentation/components/super-admin/customers/modal/CustomerFormModal.vue';
import { useSuperAdminCustomers } from '@/presentation/composables/super-admin/useSuperAdminCustomers';
import { useSuperAdminMerchants } from '@/presentation/composables/super-admin/useSuperAdminMerchants';
import type { Customer } from '@/domain/entities/user.entity';

const {
  loading,
  customers,
  pagination,
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  changePage,
} = useSuperAdminCustomers();

const { merchants: merchantList, fetchMerchants } = useSuperAdminMerchants();

const modalOpen = ref(false);
const editingCustomer = ref<Customer | null>(null);

const openCreateModal = () => {
  editingCustomer.value = null;
  modalOpen.value = true;
};

const openEditModal = (customer: Customer) => {
  editingCustomer.value = customer;
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
  editingCustomer.value = null;
};

const handleFormOk = async (data: any) => {
  let success = false;
  if (editingCustomer.value) {
    success = await updateCustomer(editingCustomer.value.id, data);
  } else {
    success = await createCustomer(data);
  }
  if (success) closeModal();
};

const confirmDelete = async (customer: Customer) => {
  await deleteCustomer(customer.id);
};

const handleSearch = async (searchText: string) => {
  await searchCustomers(searchText);
};

const handlePageChange = async (page: number, pageSize: number) => {
  await changePage(page, pageSize);
};

onMounted(async () => {
  await Promise.allSettled([fetchCustomers(), fetchMerchants({ page: 1, limit: 999 })]);
});
</script>

<style scoped>
.customers-page { padding: 0; }
</style>
