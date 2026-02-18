<template>
  <div class="base-table-container">
    <!-- Header Actions -->
    <div class="table-header">
      <div class="header-left">
        <slot name="header-left">
          <h2 class="table-title">{{ title }}</h2>
        </slot>
      </div>
      <div class="header-right">
        <a-space>
          <a-input-search
            v-if="searchable"
            v-model:value="searchValue"
            :placeholder="$t('common.search')"
            style="width: 200px"
            @search="handleSearch"
            allow-clear
          />
          <a-button v-if="creatable" type="primary" @click="handleCreate">
            <template #icon>
              <PlusOutlined />
            </template>
            {{ $t('common.create') }}
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- Table -->
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="paginationConfig"
      :scroll="scroll"
      :row-key="rowKey"
      @change="handleTableChange"
    >
      <!-- Custom Body Cell -->
      <template #bodyCell="{ column, record, index }">
        <slot name="bodyCell" :column="column" :record="record" :index="index">
          <!-- Actions Column -->
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button 
                v-if="viewable" 
                type="link" 
                size="small" 
                @click="handleView(record)"
              >
                <EyeOutlined />
              </a-button>
              <a-button 
                v-if="editable" 
                type="link" 
                size="small" 
                @click="handleEdit(record)"
              >
                <EditOutlined />
              </a-button>
              <a-popconfirm
                v-if="deletable"
                :title="$t('common.confirmDelete')"
                @confirm="handleDelete(record)"
              >
                <a-button type="link" danger size="small">
                  <DeleteOutlined />
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </slot>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined 
} from '@ant-design/icons-vue';
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';

interface Props {
  title?: string;
  columns: TableColumnsType;
  dataSource: any[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  scroll?: { x?: number | string; y?: number | string };
  rowKey?: string;
  searchable?: boolean;
  creatable?: boolean;
  editable?: boolean;
  deletable?: boolean;
  viewable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  loading: false,
  scroll: () => ({ x: 'max-content' }),
  rowKey: 'id',
  searchable: true,
  creatable: true,
  editable: true,
  deletable: true,
  viewable: false,
});

const emit = defineEmits<{
  (e: 'create'): void;
  (e: 'edit', record: any): void;
  (e: 'delete', record: any): void;
  (e: 'view', record: any): void;
  (e: 'search', value: string): void;
  (e: 'page-change', page: number, pageSize: number): void;
}>();

const searchValue = ref('');

const paginationConfig = computed<TablePaginationConfig>(() => {
  if (!props.pagination) {
    return false as any;
  }
  
  return {
    current: props.pagination.page,
    pageSize: props.pagination.limit,
    total: props.pagination.total,
    showSizeChanger: true,
    showTotal: (total: number) => `Total ${total} items`,
    pageSizeOptions: ['10', '20', '50', '100'],
  };
});

const handleCreate = () => {
  emit('create');
};

const handleEdit = (record: any) => {
  emit('edit', record);
};

const handleDelete = (record: any) => {
  emit('delete', record);
};

const handleView = (record: any) => {
  emit('view', record);
};

const handleSearch = () => {
  emit('search', searchValue.value);
};

const handleTableChange = (pagination: TablePaginationConfig) => {
  if (pagination.current && pagination.pageSize) {
    emit('page-change', pagination.current, pagination.pageSize);
  }
};
</script>

<style scoped>
.base-table-container {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  flex: 1;
  min-width: 200px;
}

.table-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.header-right {
  display: flex;
  gap: 8px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .base-table-container {
    padding: 16px;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
  }

  .header-right :deep(.ant-space) {
    width: 100%;
    flex-wrap: wrap;
  }

  .header-right :deep(.ant-input-search) {
    width: 100% !important;
  }
}
</style>
