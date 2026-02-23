<template>
  <div class="arrival-detail-page">
    <a-breadcrumb class="mb-3">
      <a-breadcrumb-item>{{ $t('merchant.breadcrumbs.home') }}</a-breadcrumb-item>
      <a-breadcrumb-item>
        <router-link to="/merchant/arrivals">{{ $t('merchant.arrivalDetail.breadcrumbArrivals') }}</router-link>
      </a-breadcrumb-item>
      <a-breadcrumb-item>{{ $t('merchant.arrivalDetail.breadcrumbDetail') }}</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-head">
      <a-button type="text" class="back-btn" @click="goBack">
        <ArrowLeftOutlined />
        {{ $t('merchant.arrivalDetail.back') }}
      </a-button>
    </div>

    <a-spin :spinning="loading">
      <a-empty v-if="!loading && !arrival" :description="$t('merchant.arrivalDetail.notFound')" />

      <template v-if="arrival">
        <!-- Arrival Info Card -->
        <a-card :bordered="false" class="panel-card mb-4">
          <div class="panel-title">
            <FileTextOutlined class="icon-blue" />
            <span>{{ $t('merchant.arrivalDetail.arrivalInfo') }}</span>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">ID</span>
              <span class="info-value arrival-id">#{{ arrival.id }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">{{ $t('merchant.arrivalDetail.linkedOrder') }}</span>
              <router-link
                v-if="arrival.order"
                :to="`/merchant/orders/${arrival.orderId}`"
                class="info-value order-code"
              >
                {{ arrival.order.orderCode }}
              </router-link>
              <span v-else class="info-value">#{{ arrival.orderId }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">{{ $t('merchant.arrivalDetail.arrivedDate') }}</span>
              <span v-if="!editingDate" class="info-value editable" @click="editingDate = true">
                {{ formatDate(arrival.arrivedDate) }}
                <EditOutlined class="edit-icon" />
              </span>
              <div v-else class="inline-edit">
                <a-date-picker
                  v-model:value="editDate"
                  size="small"
                  class="inline-input"
                  @pressEnter="saveDate"
                />
                <a-button type="primary" size="small" class="save-btn" @click="saveDate">
                  <CheckOutlined />
                </a-button>
                <a-button size="small" @click="editingDate = false">
                  <CloseOutlined />
                </a-button>
              </div>
            </div>

            <div class="info-item">
              <span class="info-label">{{ $t('merchant.arrivalDetail.arrivedTime') }}</span>
              <span v-if="!editingTime" class="info-value editable" @click="startEditTime">
                {{ arrival.arrivedTime || '-' }}
                <EditOutlined class="edit-icon" />
              </span>
              <div v-else class="inline-edit">
                <a-input
                  v-model:value="editTime"
                  size="small"
                  class="inline-input"
                  placeholder="HH:mm"
                  @pressEnter="saveTime"
                />
                <a-button type="primary" size="small" class="save-btn" @click="saveTime">
                  <CheckOutlined />
                </a-button>
                <a-button size="small" @click="editingTime = false">
                  <CloseOutlined />
                </a-button>
              </div>
            </div>

            <div class="info-item">
              <span class="info-label">{{ $t('merchant.arrivalDetail.recordedBy') }}</span>
              <span class="info-value">{{ arrival.recordedByUser?.fullName || '-' }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">{{ $t('merchant.arrivalDetail.notes') }}</span>
              <span v-if="!editingNotes" class="info-value editable notes-value" @click="startEditNotes">
                {{ arrival.notes || '-' }}
                <EditOutlined class="edit-icon" />
              </span>
              <div v-else class="inline-edit">
                <a-textarea
                  v-model:value="editNotes"
                  :rows="2"
                  size="small"
                  class="inline-input"
                  @pressEnter="saveNotes"
                />
                <div class="inline-edit-actions">
                  <a-button type="primary" size="small" class="save-btn" @click="saveNotes">
                    <CheckOutlined />
                  </a-button>
                  <a-button size="small" @click="editingNotes = false">
                    <CloseOutlined />
                  </a-button>
                </div>
              </div>
            </div>

            <div class="info-item">
              <span class="info-label">{{ $t('merchant.arrivalDetail.createdAt') }}</span>
              <span class="info-value">{{ formatDateTime(arrival.createdAt) }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">{{ $t('merchant.arrivalDetail.updatedAt') }}</span>
              <span class="info-value">{{ formatDateTime(arrival.updatedAt) }}</span>
            </div>
          </div>
        </a-card>

        <!-- Arrival Items Card -->
        <a-card :bordered="false" class="panel-card mb-4">
          <div class="panel-title">
            <ShoppingOutlined class="icon-blue" />
            <span>{{ $t('merchant.arrivalDetail.arrivalItems') }}</span>
            <a-tag class="count-tag">{{ arrival.arrivalItems?.length || 0 }}</a-tag>
          </div>

          <a-empty
            v-if="!arrival.arrivalItems || arrival.arrivalItems.length === 0"
            :description="$t('merchant.arrivalDetail.noItems')"
          />

          <!-- Desktop Table -->
          <a-table
            v-if="!isMobile && arrival.arrivalItems && arrival.arrivalItems.length > 0"
            :columns="itemColumns"
            :data-source="arrival.arrivalItems"
            :pagination="false"
            row-key="id"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'orderItem'">
                <div>
                  <span class="item-name">{{ record.orderItem?.productName || `#${record.orderItemId}` }}</span>
                  <span v-if="record.orderItem?.variant" class="item-variant">({{ record.orderItem.variant }})</span>
                </div>
              </template>

              <template v-else-if="column.key === 'condition'">
                <a-tag v-if="record.condition" :color="conditionColor(record.condition)" class="pill-tag">
                  {{ record.condition }}
                </a-tag>
                <span v-else class="text-muted">-</span>
              </template>

              <template v-else-if="column.key === 'notes'">
                <span class="notes-text">{{ record.notes || '-' }}</span>
              </template>
            </template>
          </a-table>

          <!-- Mobile Cards -->
          <div v-if="isMobile && arrival.arrivalItems && arrival.arrivalItems.length > 0" class="items-mobile">
            <div v-for="(item, idx) in arrival.arrivalItems" :key="item.id" class="item-card">
              <div class="item-card-header">
                <span class="item-num">#{{ idx + 1 }}</span>
                <span class="item-name">{{ item.orderItem?.productName || `#${item.orderItemId}` }}</span>
                <span v-if="item.orderItem?.variant" class="item-variant">({{ item.orderItem.variant }})</span>
              </div>
              <div class="item-card-body">
                <div class="item-detail-row">
                  <span class="detail-label">{{ $t('merchant.arrivalDetail.arrivedQty') }}</span>
                  <span class="detail-val">{{ item.arrivedQuantity }}</span>
                </div>
                <div class="item-detail-row">
                  <span class="detail-label">{{ $t('merchant.arrivalDetail.condition') }}</span>
                  <span class="detail-val">
                    <a-tag v-if="item.condition" :color="conditionColor(item.condition)" class="pill-tag">
                      {{ item.condition }}
                    </a-tag>
                    <span v-else>-</span>
                  </span>
                </div>
                <div v-if="item.notes" class="item-detail-row">
                  <span class="detail-label">{{ $t('merchant.arrivalDetail.itemNotes') }}</span>
                  <span class="detail-val notes-text">{{ item.notes }}</span>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </template>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons-vue';
import { arrivalRepository } from '@/infrastructure/repositories/arrival.repository';
import type { Arrival, ArrivalItemCondition } from '@/domain/entities/user.entity';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import { handleApiError } from '@/shared/utils/error';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { isMobile } = useIsMobile();

const loading = ref(false);
const arrival = ref<Arrival | null>(null);

// Inline editing state
const editingDate = ref(false);
const editDate = ref<Dayjs | null>(null);
const editingTime = ref(false);
const editTime = ref('');
const editingNotes = ref(false);
const editNotes = ref('');

const itemColumns = computed(() => [
  { title: t('merchant.arrivalDetail.colOrderItem'), key: 'orderItem' },
  { title: t('merchant.arrivalDetail.arrivedQty'), key: 'arrivedQuantity', dataIndex: 'arrivedQuantity', width: 120, align: 'center' as const },
  { title: t('merchant.arrivalDetail.condition'), key: 'condition', width: 140, align: 'center' as const },
  { title: t('merchant.arrivalDetail.itemNotes'), key: 'notes', dataIndex: 'notes', ellipsis: true },
]);

const conditionColor = (condition: ArrivalItemCondition) => {
  if (condition === 'OK') return 'green';
  if (condition === 'DAMAGED') return 'orange';
  return 'red';
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
};

const goBack = () => {
  router.push('/merchant/arrivals');
};

const fetchArrival = async () => {
  const id = Number(route.params.id);
  if (!id) return;
  loading.value = true;
  try {
    arrival.value = await arrivalRepository.getById(id);
  } catch (err) {
    handleApiError(err, t);
  } finally {
    loading.value = false;
  }
};

const startEditTime = () => {
  editTime.value = arrival.value?.arrivedTime || '';
  editingTime.value = true;
};

const startEditNotes = () => {
  editNotes.value = arrival.value?.notes || '';
  editingNotes.value = true;
};

const saveDate = async () => {
  if (!arrival.value || !editDate.value) return;
  try {
    await arrivalRepository.update(arrival.value.id, {
      arrivedDate: editDate.value.format('YYYY-MM-DD'),
    });
    message.success(t('merchant.arrivalDetail.updateSuccess'));
    editingDate.value = false;
    await fetchArrival();
  } catch (err) {
    handleApiError(err, t);
  }
};

const saveTime = async () => {
  if (!arrival.value) return;
  try {
    await arrivalRepository.update(arrival.value.id, {
      arrivedTime: editTime.value || undefined,
    });
    message.success(t('merchant.arrivalDetail.updateSuccess'));
    editingTime.value = false;
    await fetchArrival();
  } catch (err) {
    handleApiError(err, t);
  }
};

const saveNotes = async () => {
  if (!arrival.value) return;
  try {
    await arrivalRepository.update(arrival.value.id, {
      notes: editNotes.value || null,
    });
    message.success(t('merchant.arrivalDetail.updateSuccess'));
    editingNotes.value = false;
    await fetchArrival();
  } catch (err) {
    handleApiError(err, t);
  }
};

onMounted(() => {
  fetchArrival();
  if (arrival.value?.arrivedDate) {
    editDate.value = dayjs(arrival.value.arrivedDate);
  }
});
</script>

<style scoped>
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }

.page-head {
  margin-bottom: 16px;
}
.back-btn {
  font-weight: 700;
  color: #1d4ed8;
  border-radius: 10px;
  padding: 4px 12px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.back-btn:hover { background: rgba(29, 78, 216, 0.08) !important; }

.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.panel-title {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.icon-blue { color: #1d4ed8; font-size: 18px; }
.count-tag {
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  background: #eff6ff;
  color: #1d4ed8;
  border: none;
}

.arrival-id { font-weight: 800; color: #64748b; }
.order-code { font-weight: 700; color: #1d4ed8; text-decoration: none; }
.order-code:hover { text-decoration: underline; }
.pill-tag { border-radius: 999px; padding: 2px 10px; font-weight: 800; font-size: 12px; }
.text-muted { color: #94a3b8; }
.notes-text { color: #64748b; font-size: 13px; }
.notes-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  display: inline-block;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px 24px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px 16px;
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.info-item.full-width {
  grid-column: 1 / -1;
}
.info-label {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}
.info-value.editable {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 6px;
  border-radius: 6px;
  transition: background 0.15s ease;
}
.info-value.editable:hover {
  background: rgba(29, 78, 216, 0.06);
}
.edit-icon {
  font-size: 12px;
  color: #94a3b8;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.info-value.editable:hover .edit-icon {
  opacity: 1;
  color: #1d4ed8;
}

/* Inline Editing */
.inline-edit {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.inline-input {
  border-radius: 8px;
  min-width: 160px;
  flex: 1;
}
.save-btn { border-radius: 6px; }
.inline-edit-actions {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

/* Order Items */
.item-name { font-weight: 700; color: #0f172a; }
.item-variant { color: #64748b; font-size: 13px; margin-left: 4px; }

.items-mobile { display: flex; flex-direction: column; gap: 10px; }
.item-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px;
  border: 1px solid rgba(148, 163, 184, 0.15);
}
.item-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.item-num { font-weight: 800; color: #1d4ed8; font-size: 13px; }
.item-card-body { display: flex; flex-direction: column; gap: 6px; }
.item-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}
.detail-label { font-size: 12px; font-weight: 600; color: #94a3b8; }
.detail-val { font-size: 13px; font-weight: 700; color: #1e293b; }

/* Tablet overrides */
@media (max-width: 1024px) and (min-width: 768px) {
  .info-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
}

/* Mobile overrides */
@media (max-width: 767px) {
  .panel-card { border-radius: 10px; }
  .panel-card :deep(.ant-card-body) { padding: 12px !important; }
  .info-grid { grid-template-columns: 1fr; gap: 12px; }
  .info-item.full-width { grid-column: 1 / -1; }
  .inline-edit { flex-direction: column; align-items: stretch; }
  .inline-input { min-width: unset; }
}
</style>
