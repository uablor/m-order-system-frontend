<template>
  <div class="create-multiple-arrivals-page">
    <div class="page-header">
      <a-button type="text" class="back-btn" @click="goBack">
        <ArrowLeftOutlined /> {{ $t('merchant.arrivals.backToList') }}
      </a-button>
      <div class="title-block">
        <div class="page-title">{{ $t('merchant.arrivals.createMultipleTitle') }}</div>
        <div class="page-subtitle">{{ $t('merchant.arrivals.createMultipleSubtitle') }}</div>
      </div>
    </div>

    <!-- Top bar: select order | note | condition | + add -->
    <div class="input-bar" @keydown.enter="onFormEnter">
      <a-select
        v-model:value="selectedOrderId"
        show-search
        option-filter-prop="label"
        :placeholder="$t('merchant.arrivals.selectOrderPlaceholder')"
        class="input-bar-select"
        :loading="loadingOrders"
        allow-clear
      >
        <a-select-option
          v-for="o in availableOrders"
          :key="o.id"
          :value="o.id"
          :label="o.orderCode"
        >
          {{ o.orderCode }} — {{ formatDate(o.orderDate) }}
        </a-select-option>
      </a-select>
      <a-input
        v-model:value="formNotes"
        :placeholder="$t('merchant.arrivals.notesPlaceholder')"
        class="input-bar-note"
      />
      <a-select
        v-model:value="formDefaultCondition"
        :placeholder="$t('merchant.arrivals.conditionPlaceholder')"
        class="input-bar-condition"
      >
        <a-select-option value="OK">{{ $t('merchant.arrivals.conditionOK') }}</a-select-option>
        <a-select-option value="DAMAGED">{{ $t('merchant.arrivals.conditionDamaged') }}</a-select-option>
        <a-select-option value="LOST">{{ $t('merchant.arrivals.conditionLost') }}</a-select-option>
      </a-select>
      <a-button type="primary" :loading="addingToBucket" :disabled="!selectedOrderId" @click="addToBucket">
        <template #icon><PlusOutlined /></template>
        {{ $t('merchant.arrivals.addToBucket') }}
      </a-button>
    </div>

    <!-- Bucket: total orders + order cards -->
    <div class="bucket-section">
      <div class="bucket-header">
        <span class="bucket-total">{{ $t('merchant.arrivals.totalOrders') }}: {{ bucket.length }}</span>
        <a-button type="link" size="small" :disabled="bucket.length === 0" @click="openViewDetailsModal">
          {{ $t('merchant.arrivals.viewDetails') }}
        </a-button>
      </div>
      <div class="bucket-cards">
        <div
          v-for="item in visibleBucketItems"
          :key="item.bucketId"
          class="bucket-card"
        >
          <div class="bucket-card-body" @click="openOrderDetailModal(item)">
            <span class="bucket-card-label">{{ item.order?.orderCode ?? `#${item.orderId}` }}</span>
            <span class="bucket-card-items">{{ $t('merchant.arrivals.totalOrderItems') }}: {{ item.arrivalItems.length }}</span>
          </div>
          <a-button type="text" danger size="small" class="bucket-card-delete" @click.stop="removeFromBucket(item.bucketId)">
            <DeleteOutlined />
          </a-button>
        </div>
        <a-tooltip v-if="remainingCount > 0" placement="top" overlay-class-name="view-details-tooltip">
          <template #title>
            <span class="view-details-label">{{ $t('merchant.arrivals.viewDetails') }}</span>
          </template>
          <div class="bucket-more-btn" @click="openViewDetailsModal">
            +{{ remainingCount }}
          </div>
        </a-tooltip>
      </div>
    </div>

    <!-- Action buttons: Reset (left) | Cancel | Create Arrivals (right) -->
    <div class="action-footer">
      <a-button type="default" class="action-reset" @click="handleReset">
        {{ $t('merchant.arrivals.reset') }}
      </a-button>
      <div class="action-right">
        <a-button type="default" @click="handleCancel">
          {{ $t('merchant.arrivals.cancel') }}
        </a-button>
        <a-button type="primary" :loading="submitting" :disabled="!canSubmit" @click="openConfirmModal">
          <template #icon><CheckOutlined /></template>
          {{ $t('merchant.arrivals.createMultiple') }}
        </a-button>
      </div>
    </div>

    <!-- Modal: View Details - รายการออเดอร์ทั้งหมด + Search + Delete -->
    <a-modal
      v-model:open="viewDetailsModalVisible"
      :title="$t('merchant.arrivals.viewDetailsTitle')"
      :width="560"
      :footer="null"
    >
      <div class="view-details-content">
        <a-input
          v-model:value="bucketSearchQuery"
          allow-clear
          :placeholder="$t('merchant.arrivals.searchPlaceholder')"
          class="search-input"
        >
          <template #prefix><SearchOutlined /></template>
        </a-input>
        <div class="bucket-list">
          <div
            v-for="item in filteredBucketForModal"
            :key="item.bucketId"
            class="bucket-list-item"
          >
            <div class="bucket-list-info bucket-list-info-clickable" @click="openOrderDetailModal(item)">
              <span class="bucket-list-label">{{ item.order?.orderCode ?? `#${item.orderId}` }}</span>
              <span class="bucket-list-items">{{ $t('merchant.arrivals.totalOrderItems') }}: {{ item.arrivalItems.length }}</span>
            </div>
            <a-button type="text" danger size="small" @click.stop="removeFromBucket(item.bucketId)">
              <DeleteOutlined /> {{ $t('merchant.arrivals.delete') }}
            </a-button>
          </div>
        </div>
        <a-empty v-if="filteredBucketForModal.length === 0" :description="$t('merchant.arrivals.noOrdersInBucket')" />
      </div>
    </a-modal>

    <!-- Order Detail Modal - แสดงข้อมูลออเดอร์และรายการสินค้า (z-index สูงกว่า View Details modal) -->
    <a-modal
      v-model:open="orderDetailModalVisible"
      :title="$t('merchant.arrivals.orderDetailTitle')"
      :width="560"
      :footer="null"
      :z-index="2000"
    >
      <div v-if="selectedOrderDetail" class="order-detail-content">
        <div class="order-detail-header">
          <div class="order-detail-row">
            <span class="order-detail-label">{{ $t('merchant.arrivals.colOrder') }}:</span>
            <span>{{ selectedOrderDetail.order?.orderCode ?? `#${selectedOrderDetail.orderId}` }}</span>
          </div>
          <div class="order-detail-row">
            <span class="order-detail-label">{{ $t('merchant.arrivals.notes') }}:</span>
            <a-textarea
              v-if="orderDetailEditMode"
              v-model:value="orderDetailEditNotes"
              :rows="2"
              :placeholder="$t('merchant.arrivals.notesPlaceholder')"
              class="order-detail-edit-input"
            />
            <span v-else>{{ selectedOrderDetail.notes || '—' }}</span>
          </div>
        </div>
        <div class="order-detail-items-header">
          <span class="order-detail-items-title">{{ $t('merchant.arrivals.arrivalItems') }}</span>
          <a-button v-if="!orderDetailEditMode" type="primary" size="small" @click="startOrderDetailEdit">
            <EditOutlined /> {{ $t('merchant.arrivals.edit') }}
          </a-button>
          <div v-else class="order-detail-edit-actions">
            <a-button size="small" @click="cancelOrderDetailEdit">{{ $t('merchant.arrivals.cancel') }}</a-button>
            <a-button type="primary" size="small" @click="saveOrderDetailEdit">
              {{ $t('merchant.arrivals.submit') }}
            </a-button>
          </div>
        </div>
        <div class="order-detail-items">
          <div
            v-for="(ai, i) in selectedOrderDetail.arrivalItems"
            :key="i"
            class="order-detail-item"
          >
            <div class="order-detail-item-row">
              <span class="item-label">{{ $t('merchant.arrivals.orderDetailProduct') }}:</span>
              <span class="item-value">{{ getOrderItemProductName(selectedOrderDetail, ai.orderItemId) }}</span>
            </div>
            <div v-if="getOrderItemVariant(selectedOrderDetail, ai.orderItemId)" class="order-detail-item-row">
              <span class="item-label">{{ $t('merchant.arrivals.orderDetailVariant') }}:</span>
              <span class="item-value">{{ getOrderItemVariant(selectedOrderDetail, ai.orderItemId) }}</span>
            </div>
            <div class="order-detail-item-row">
              <span class="item-label">{{ $t('merchant.arrivals.orderDetailQty') }}:</span>
              <span class="item-value">{{ ai.arrivedQuantity }}</span>
            </div>
            <div class="order-detail-item-row">
              <span class="item-label">{{ $t('merchant.arrivals.condition') }}:</span>
              <a-select
                v-if="orderDetailEditMode"
                :value="orderDetailEditConditions[i] ?? 'OK'"
                size="small"
                class="order-detail-condition-select"
                popup-class-name="order-detail-condition-dropdown"
                :dropdown-style="{ zIndex: 3000 }"
                @update:value="(v: ArrivalItemCondition) => { orderDetailEditConditions[i] = v; }"
              >
                <a-select-option value="OK">{{ $t('merchant.arrivals.conditionOK') }}</a-select-option>
                <a-select-option value="DAMAGED">{{ $t('merchant.arrivals.conditionDamaged') }}</a-select-option>
                <a-select-option value="LOST">{{ $t('merchant.arrivals.conditionLost') }}</a-select-option>
              </a-select>
              <span v-else class="item-value">{{ getConditionLabel(ai.condition) }}</span>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  CheckOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons-vue';
import { arrivalRepository } from '@/infrastructure/repositories/arrival.repository';
import { orderRepository } from '@/infrastructure/repositories/order.repository';
import type { Order, OrderItem } from '@/domain/entities/user.entity';
import type { ArrivalItemCondition } from '@/domain/entities/user.entity';
import type { CreateMultipleArrivalsDto } from '@/application/dto/arrival.dto';
import { useAuthStore } from '@/store/auth.store';
import { storeToRefs } from 'pinia';
import { handleApiError } from '@/shared/utils/error';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const { authPayload } = storeToRefs(authStore);

interface CreateArrivalItemForm {
  orderItemId: number;
  arrivedQuantity: number;
  condition: ArrivalItemCondition | undefined;
  notes: string;
}

interface BucketItem {
  bucketId: string;
  orderId: number;
  notes: string;
  order: Order | null;
  orderItems: OrderItem[];
  arrivalItems: CreateArrivalItemForm[];
}

const BUCKET_STORAGE_KEY = 'create-multiple-arrivals-bucket';

let bucketIdCounter = 0;
const createBucketId = () => `bucket-${++bucketIdCounter}`;

const VISIBLE_CARD_COUNT = 6;

interface StoredBucketItem {
  bucketId: string;
  orderId: number;
  notes: string;
  arrivalItems: CreateArrivalItemForm[];
}

const bucket = ref<BucketItem[]>([]);
const selectedOrderId = ref<number | undefined>(undefined);
const formNotes = ref('');
const formDefaultCondition = ref<ArrivalItemCondition>('OK');
const orderOptions = ref<Order[]>([]);
const loadingOrders = ref(false);
const addingToBucket = ref(false);
const submitting = ref(false);
const viewDetailsModalVisible = ref(false);
const orderDetailModalVisible = ref(false);
const selectedOrderDetail = ref<BucketItem | null>(null);
const orderDetailEditMode = ref(false);
const orderDetailEditNotes = ref('');
const orderDetailEditConditions = ref<ArrivalItemCondition[]>([]);
const bucketSearchQuery = ref('');

const availableOrders = computed(() => {
  const inBucketIds = bucket.value.map(b => b.orderId);
  return orderOptions.value.filter(o => !inBucketIds.includes(o.id));
});

const visibleBucketItems = computed(() => bucket.value.slice(0, VISIBLE_CARD_COUNT));

const remainingCount = computed(() => Math.max(0, bucket.value.length - VISIBLE_CARD_COUNT));

const filteredBucketForModal = computed(() => {
  const q = bucketSearchQuery.value?.trim().toLowerCase();
  if (!q) return bucket.value;
  return bucket.value.filter(item => {
    const code = (item.order?.orderCode ?? `#${item.orderId}`).toLowerCase();
    const notes = (item.notes ?? '').toLowerCase();
    return code.includes(q) || notes.includes(q);
  });
});

const canSubmit = computed(() => bucket.value.length > 0);

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
};

const getOrderItemProductName = (item: BucketItem, orderItemId: number) => {
  const oi = item.orderItems.find(i => i.id === orderItemId);
  return oi?.productName ?? `#${orderItemId}`;
};

const getOrderItemVariant = (item: BucketItem, orderItemId: number) => {
  const oi = item.orderItems.find(i => i.id === orderItemId);
  return oi?.variant ?? null;
};

const getConditionLabel = (condition: ArrivalItemCondition | undefined) => {
  if (!condition) return '—';
  if (condition === 'OK') return t('merchant.arrivals.conditionOK');
  if (condition === 'DAMAGED') return t('merchant.arrivals.conditionDamaged');
  if (condition === 'LOST') return t('merchant.arrivals.conditionLost');
  return condition;
};

const onFormEnter = (e: KeyboardEvent) => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  addToBucket();
};

const addToBucket = async () => {
  if (!selectedOrderId.value) return;
  addingToBucket.value = true;
  try {
    const order = await orderRepository.getById(selectedOrderId.value);
    const items = order.orderItems ?? [];
    const condition = formDefaultCondition.value ?? 'OK';
    const arrivalItems: CreateArrivalItemForm[] = items.map(item => ({
      orderItemId: item.id,
      arrivedQuantity: item.quantity,
      condition,
      notes: '',
    }));
    bucket.value.push({
      bucketId: createBucketId(),
      orderId: order.id,
      notes: formNotes.value.trim(),
      order,
      orderItems: items,
      arrivalItems,
    });
    selectedOrderId.value = undefined;
    formNotes.value = '';
  } catch (err) {
    handleApiError(err, t);
  } finally {
    addingToBucket.value = false;
  }
};

const removeFromBucket = (bucketId: string) => {
  bucket.value = bucket.value.filter(b => b.bucketId !== bucketId);
};

const openViewDetailsModal = () => {
  bucketSearchQuery.value = '';
  viewDetailsModalVisible.value = true;
};

const openOrderDetailModal = (item: BucketItem) => {
  selectedOrderDetail.value = item;
  orderDetailEditMode.value = false;
  orderDetailModalVisible.value = true;
};

const startOrderDetailEdit = () => {
  if (!selectedOrderDetail.value) return;
  orderDetailEditNotes.value = selectedOrderDetail.value.notes;
  orderDetailEditConditions.value = selectedOrderDetail.value.arrivalItems.map(
    ai => ai.condition ?? 'OK',
  );
  orderDetailEditMode.value = true;
};

const cancelOrderDetailEdit = () => {
  orderDetailEditMode.value = false;
};

const saveOrderDetailEdit = () => {
  if (!selectedOrderDetail.value) return;
  const item = selectedOrderDetail.value;
  item.notes = orderDetailEditNotes.value;
  item.arrivalItems.forEach((ai, i) => {
    ai.condition = orderDetailEditConditions.value[i] ?? 'OK';
  });
  orderDetailEditMode.value = false;
  message.success(t('merchant.arrivalDetail.updateSuccess'));
};

const saveBucketToStorage = () => {
  try {
    const data: StoredBucketItem[] = bucket.value.map(b => ({
      bucketId: b.bucketId,
      orderId: b.orderId,
      notes: b.notes,
      arrivalItems: b.arrivalItems,
    }));
    sessionStorage.setItem(BUCKET_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
};

const clearBucketStorage = () => {
  try {
    sessionStorage.removeItem(BUCKET_STORAGE_KEY);
  } catch {
    /* ignore */
  }
};

const loadBucketFromStorage = async () => {
  try {
    const raw = sessionStorage.getItem(BUCKET_STORAGE_KEY);
    if (!raw) return;
    const stored: StoredBucketItem[] = JSON.parse(raw);
    if (!Array.isArray(stored) || stored.length === 0) return;
    const restored: BucketItem[] = [];
    for (const s of stored) {
      try {
        const order = await orderRepository.getById(s.orderId);
        const items = order.orderItems ?? [];
        restored.push({
          bucketId: s.bucketId,
          orderId: s.orderId,
          notes: s.notes,
          order,
          orderItems: items,
          arrivalItems: s.arrivalItems,
        });
        const num = parseInt(s.bucketId.replace(/\D/g, ''), 10) || 0;
        if (num >= bucketIdCounter) bucketIdCounter = num;
      } catch {
        /* skip failed order */
      }
    }
    bucket.value = restored;
  } catch {
    /* ignore */
  }
};

const handleReset = () => {
  bucket.value = [];
  clearBucketStorage();
};

const handleCancel = () => {
  clearBucketStorage();
  router.push('/merchant/arrivals');
};

const fetchOrders = async () => {
  loadingOrders.value = true;
  try {
    const res = await orderRepository.getListByMerchant({
      limit: 200,
      merchantId: authPayload.value?.merchantId,
      arrivalStatus: 'NOT_ARRIVED',
    });
    orderOptions.value = res.results ?? [];
  } catch (err) {
    handleApiError(err, t);
  } finally {
    loadingOrders.value = false;
  }
};

const goBack = () => {
  router.push('/merchant/arrivals');
};

const openConfirmModal = () => {
  if (!canSubmit.value) return;
  const count = bucket.value.length;
  Modal.confirm({
    title: t('merchant.arrivals.confirmCreateTitle'),
    content: t('merchant.arrivals.confirmCreateMessage', { count }),
    okText: t('merchant.arrivals.confirmCreate'),
    cancelText: t('merchant.arrivals.cancel'),
    onOk: () => handleCreateMultiple(),
  });
};

const handleCreateMultiple = async () => {
  if (!canSubmit.value) return;
  submitting.value = true;
  try {
    const payload: CreateMultipleArrivalsDto = {
      orders: bucket.value.map(b => ({
        orderId: b.orderId,
        notes: b.notes || undefined,
        arrivalItems: b.arrivalItems.map(i => ({
          orderItemId: i.orderItemId,
          arrivedQuantity: i.arrivedQuantity,
          condition: i.condition || undefined,
          notes: i.notes || undefined,
        })),
      })),
    };
    const res = await arrivalRepository.createMultiple(payload);
    if (res.failedOrders && res.failedOrders.length > 0) {
      const msg = res.failedOrders.map(f => `${f.orderId}: ${f.error}`).join('; ');
      message.warning(t('merchant.arrivals.createMultiplePartial', { msg }));
    } else {
      message.success(t('merchant.arrivals.createMultipleSuccess'));
    }
    clearBucketStorage();
    router.push('/merchant/arrivals');
  } catch (err) {
    handleApiError(err, t);
  } finally {
    submitting.value = false;
  }
};

watch(bucket, () => saveBucketToStorage(), { deep: true });

onMounted(async () => {
  await fetchOrders();
  await loadBucketFromStorage();
});
</script>

<style scoped>
.create-multiple-arrivals-page {
  max-width: 1900px;
  /* margin: 0 auto; */
}

.page-header {
  margin-bottom: 24px;
  text-align: left;
}

.back-btn {
  margin-bottom: 8px;
  padding-left: 0;
}

.title-block {
  flex: 1 1 auto;
  min-width: 0;
  text-align: left;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.25;
}

.page-subtitle {
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
}

/* Top input bar */
.input-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.input-bar-select {
  min-width: 200px;
  flex: 1 1 200px;
}

.input-bar-note {
  min-width: 160px;
  flex: 1 1 160px;
}

.input-bar-condition {
  min-width: 100px;
  flex: 0 0 100px;
}

/* Bucket section */
.bucket-section {
  margin-bottom: 24px;
  padding: 16px;
  border: 1px dashed #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.bucket-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.bucket-total {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.bucket-cards {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 10px;
}

.bucket-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #334155;
}

.bucket-card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.bucket-card-label {
  font-weight: 500;
}

.bucket-card-items {
  font-size: 12px;
  color: #0ea5e9;
  font-weight: 500;
}

.bucket-card-delete {
  flex-shrink: 0;
}

.bucket-more-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 36px;
  padding: 0 12px;
  background: #f1f5f9;
  border: 1px dashed #94a3b8;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #0ea5e9;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.bucket-more-btn:hover {
  background: #e0f2fe;
  color: #0284c7;
}

.view-details-label {
  color: #0ea5e9;
  font-weight: 500;
}

/* View details modal */
.view-details-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-input {
  width: 100%;
}

.bucket-list {
  max-height: 320px;
  overflow-y: auto;
}

.bucket-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 8px;
}

.bucket-list-item:last-child {
  margin-bottom: 0;
}

.bucket-list-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.bucket-list-label {
  font-weight: 500;
  color: #334155;
}

.bucket-list-items {
  font-size: 12px;
  color: #0ea5e9;
  font-weight: 500;
}

/* Action footer */
.action-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.action-reset {
  margin-right: auto;
}

.action-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Order detail modal */
.order-detail-content {
  max-height: 400px;
  overflow-y: auto;
}

.order-detail-header {
  margin-bottom: 16px;
}

.order-detail-row {
  margin-bottom: 8px;
}

.order-detail-label {
  font-weight: 500;
  color: #64748b;
  margin-right: 8px;
}

.order-detail-items-title {
  font-weight: 600;
  margin-bottom: 12px;
}

.order-detail-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-detail-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 8px;
}

.order-detail-item:last-child {
  margin-bottom: 0;
}


.order-detail-items-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.order-detail-edit-actions {
  display: flex;
  gap: 8px;
}

.order-detail-edit-input {
  width: 100%;
}

.order-detail-condition-select {
  min-width: 120px;
}

.order-detail-item-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.order-detail-item-row:last-child {
  margin-bottom: 0;
}

.order-detail-item .item-label {
  font-size: 12px;
  color: #64748b;
  min-width: 80px;
}

.order-detail-item .item-value {
  flex: 1;
}

.bucket-list-info-clickable {
  cursor: pointer;
}

</style>

<style>
/* Tooltip สำหรับ +N - ข้อความ view details สีฟ้า (render ใน portal) */
.view-details-tooltip .view-details-label {
  color: #0ea5e9 !important;
  font-weight: 500;
}

/* Condition select dropdown ใน Order Detail modal - z-index สูงกว่า modal (2000) */
.order-detail-condition-dropdown {
  z-index: 3000 !important;
}
</style>
