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

    <!-- Confirm Create Modal - total orders + Notification toggle + 2-grid customer selection -->
    <a-modal
      v-model:open="confirmModalVisible"
      :title="$t('merchant.arrivals.confirmCreateTitle')"
      :width="600"
      :z-index="2000"
      :footer="null"
      @after-open="onConfirmModalOpen"
    >
      <div class="confirm-modal-content">
        <div class="confirm-total-summary">
          {{ $t('merchant.arrivals.totalOrdersCount', { count: bucket.length }) }}
        </div>
        <div class="confirm-controls-row">
          <a-checkbox
            v-model:checked="sendNotification"
            :disabled="customerGroups.length === 0"
            class="confirm-notification-checkbox"
          >
            <BellOutlined class="confirm-notification-icon" />
            {{ $t('merchant.arrivals.notification') }}
          </a-checkbox>
          <div class="confirm-controls-actions">
            <a-button @click="confirmModalVisible = false">
              {{ $t('merchant.arrivals.cancel') }}
            </a-button>
            <a-button
              type="primary"
              :loading="submitting"
              :disabled="!canSubmit"
              @click="handleConfirmCreate"
            >
              <template #icon><CheckOutlined /></template>
              {{ $t('merchant.arrivals.createMultiple') }}
            </a-button>
          </div>
        </div>
        <template v-if="sendNotification && customerGroups.length > 0">
          <div class="confirm-language-row">
            <span class="confirm-language-label">{{ $t('merchant.arrivals.notificationMessageLanguage') }}:</span>
            <a-radio-group v-model:value="notificationLanguage" size="small" class="confirm-language-options">
              <a-radio-button value="en">{{ $t('merchant.arrivals.notificationLangEn') }}</a-radio-button>
              <a-radio-button value="th">{{ $t('merchant.arrivals.notificationLangTh') }}</a-radio-button>
              <a-radio-button value="la">{{ $t('merchant.arrivals.notificationLangLa') }}</a-radio-button>
            </a-radio-group>
          </div>
          <p class="confirm-select-hint">{{ $t('merchant.arrivals.selectCustomersForNotification') }}</p>
          <div class="confirm-customer-grid">
            <div
              v-for="group in customerGroups"
              :key="group.customerId"
              class="confirm-customer-card"
            >
              <a-checkbox
                :checked="selectedCustomerIds.has(group.customerId)"
                @change="(e: { target?: { checked?: boolean } }) => toggleCustomerNotification(group.customerId, e?.target?.checked ?? false)"
              >
                <div class="confirm-customer-card-body">
                  <div class="confirm-customer-card-header">
                    <UserOutlined class="confirm-customer-icon" />
                    <span class="confirm-customer-name">{{ group.customerName }}</span>
                  </div>
                  <div class="confirm-customer-stats">
                    <span>{{ $t('merchant.arrivals.orderCount', { count: group.orderCount }) }}</span>
                    <span>{{ $t('merchant.arrivals.orderItemCount', { count: group.orderItemCount }) }}</span>
                  </div>
                </div>
              </a-checkbox>
            </div>
          </div>
        </template>
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

    <!-- WhatsApp Progress Modal -->
    <a-modal
      v-model:open="whatsappProgressVisible"
      :title="$t('merchant.arrivals.openingWhatsApp')"
      :width="400"
      :footer="null"
      :closable="false"
      :mask-closable="false"
    >
      <div class="whatsapp-progress-content">
        <div class="progress-icon">
          <WhatsAppOutlined />
        </div>
        <div class="progress-text">
          <div class="progress-title">{{ $t('merchant.arrivals.openingWhatsAppMessages') }}</div>
          <div class="progress-status">
            {{ whatsappTotal > 0 ? $t('merchant.arrivals.progress', { current: whatsappProgress + 1, total: whatsappTotal }) : $t('merchant.arrivals.progress', { current: 0, total: 0 }) }}
          </div>
          <div v-if="whatsappCurrentName" class="progress-current">
            {{ $t('merchant.arrivals.currentlyOpening') }}: {{ whatsappCurrentName }}
          </div>
        </div>
        <a-progress 
          :percent="whatsappTotal > 0 ? Math.round(((whatsappProgress + 1) / whatsappTotal) * 100) : 0" 
          :show-info="false"
          stroke-color="#25D366"
        />
        <div class="progress-note">
          {{ $t('merchant.arrivals.whatsappProgressNote') }}
        </div>
      </div>
    </a-modal>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  CheckOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  BellOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons-vue';
import { arrivalRepository } from '@/infrastructure/repositories/arrival.repository';
import { orderRepository } from '@/infrastructure/repositories/order.repository';
import type { Order, OrderItem } from '@/domain/entities/user.entity';
import type { ArrivalItemCondition } from '@/domain/entities/user.entity';
import type { CreateMultipleArrivalsDto, CreateNotificationDto } from '@/application/dto/arrival.dto';
import { useAuthStore } from '@/store/auth.store';
import { storeToRefs } from 'pinia';
import { handleApiError } from '@/shared/utils/error';
import { useWhatsApp } from '@/shared/composables/useWhatsApp';

const { t } = useI18n();
const { openWhatsAppChat, isValidWhatsAppPhone, formatPhoneForWhatsApp } = useWhatsApp();
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
const confirmModalVisible = ref(false);
const sendNotification = ref(false);
const notificationLanguage = ref<'en' | 'th' | 'la'>('en');
const selectedCustomerIds = ref<Set<number>>(new Set());
const selectedOrderDetail = ref<BucketItem | null>(null);
const orderDetailEditMode = ref(false);
const orderDetailEditNotes = ref('');
const orderDetailEditConditions = ref<ArrivalItemCondition[]>([]);
const bucketSearchQuery = ref('');

const availableOrders = computed(() => {
  const inBucketIds = bucket.value.map(b => b.orderId);
  return orderOptions.value.filter(
    o => !inBucketIds.includes(o.id) && (o.arrivalStatus === 'NOT_ARRIVED' || !o.arrivalStatus),
  );
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

interface CustomerGroup {
  customerId: number;
  customerName: string;
  customerOrders: { id: number; orderId: number; orderCode: string }[];
  orderCount: number;
  orderItemCount: number;
}

const customerGroups = computed<CustomerGroup[]>(() => {
  const map = new Map<number, CustomerGroup>();
  for (const item of bucket.value) {
    const order = item.order;
    const orderCode = order?.orderCode ?? `#${item.orderId}`;
    const customerOrders = order?.customerOrders ?? [];
    for (const co of customerOrders) {
      const cid = co.customerId;
      const name = co.customer?.customerName ?? `Customer #${cid}`;
      const orderItemCount = co.customerOrderItems?.length ?? 0;
      if (!map.has(cid)) {
        map.set(cid, {
          customerId: cid,
          customerName: name,
          customerOrders: [],
          orderCount: 0,
          orderItemCount: 0,
        });
      }
      const g = map.get(cid)!;
      if (!g.customerOrders.some(x => x.id === co.id)) {
        g.customerOrders.push({ id: co.id, orderId: item.orderId, orderCode });
        g.orderCount += 1;
        g.orderItemCount += orderItemCount;
      }
    }
  }
  return Array.from(map.values());
});

const toggleCustomerNotification = (customerId: number, checked: boolean) => {
  const next = new Set(selectedCustomerIds.value);
  if (checked) next.add(customerId);
  else next.delete(customerId);
  selectedCustomerIds.value = next;
};

const onConfirmModalOpen = () => {
  sendNotification.value = false;
  notificationLanguage.value = 'en';
  selectedCustomerIds.value = new Set();
};

interface NotificationForWhatsApp {
  recipientContact?: string;
  notificationLink?: string | null;
  language?: string | null;
  customer?: { customerName?: string } | null;
  relatedOrders?: number[] | null;
}

const whatsappProgressVisible = ref(false);
const whatsappProgress = ref(0);
const whatsappTotal = ref(0);
const whatsappCurrentName = ref('');

const openWhatsAppTabsForNotifications = async (notifications: NotificationForWhatsApp[]) => {
  const valid = notifications.filter(
    (n): n is Required<Pick<NotificationForWhatsApp, 'recipientContact'>> & NotificationForWhatsApp => 
      !!n.recipientContact && isValidWhatsAppPhone(formatPhoneForWhatsApp(n.recipientContact)),
  );

  if (valid.length === 0) {
    message.warning(t('merchant.arrivals.noValidWhatsAppNumbers'));
    return;
  }

  if (valid.length === 1) {
    // Single notification - open directly
    const n = valid[0]!;
    const raw = n.language ?? 'en';
    const lang: 'en' | 'th' | 'la' = raw === 'th' || raw === 'la' ? raw : 'en';
    const customerName = n.customer?.customerName ?? (lang === 'en' ? 'Customer' : lang === 'th' ? 'ลูกค้า' : 'ລູກຄ້າ');
    openWhatsAppChat({
      phone: n.recipientContact!,
      template: {
        customerName,
        orderNumbers: n.relatedOrders ?? undefined,
      },
      notificationLink: n.notificationLink ?? undefined,
      lang,
    });
    return;
  }

  // Multiple notifications - show progress modal and open sequentially
  whatsappProgressVisible.value = true;
  whatsappProgress.value = 0;
  whatsappTotal.value = valid.length;
  whatsappCurrentName.value = '';

  try {
    for (let i = 0; i < valid.length; i++) {
      const n = valid[i];
      if (!n) continue; // Skip if undefined
      
      whatsappProgress.value = i;
      whatsappCurrentName.value = n.customer?.customerName || 'Customer';
      
      // Update progress
      await new Promise(resolve => setTimeout(resolve, 100));

      // Open WhatsApp with user interaction trigger
      const raw = n.language ?? 'en';
      const lang: 'en' | 'th' | 'la' = raw === 'th' || raw === 'la' ? raw : 'en';
      const customerName = n.customer?.customerName ?? (lang === 'en' ? 'Customer' : lang === 'th' ? 'ลูกค้า' : 'ລູກຄ້າ');
      
      const success = openWhatsAppChat({
        phone: n.recipientContact!,
        template: {
          customerName,
          orderNumbers: n.relatedOrders ?? undefined,
        },
        notificationLink: n.notificationLink ?? undefined,
        lang,
      });

      if (!success) {
        console.warn(`Failed to open WhatsApp for ${customerName}`);
      }

      // Longer delay between openings to avoid browser blocking
      if (i < valid.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    whatsappProgress.value = valid.length;
    whatsappCurrentName.value = '';
    
    // Show completion message
    setTimeout(() => {
      whatsappProgressVisible.value = false;
      message.success(t('merchant.arrivals.whatsappTabsOpened', { count: valid.length }));
    }, 1000);

  } catch (error) {
    console.error('Error opening WhatsApp tabs:', error);
    whatsappProgressVisible.value = false;
    message.error(t('merchant.arrivals.whatsappOpenError'));
  }
};

const buildNotisFromSelectedGroups = (): CreateNotificationDto[] => {
  return customerGroups.value
    .filter(g => selectedCustomerIds.value.has(g.customerId))
    .map(g => ({
      customerId: g.customerId,
      customerOrderIds: g.customerOrders.map(co => co.id),
      message: 'Your orders have arrived!',
    }));
};

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
  confirmModalVisible.value = true;
};

const handleConfirmCreate = async () => {
  await handleCreateMultiple();
};

const handleCreateMultiple = async () => {
  if (!canSubmit.value) return;
  submitting.value = true;
  try {
    const notis = buildNotisFromSelectedGroups();
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
      notification: notis.length > 0,
      notis: notis.length > 0 ? notis : undefined,
      language: notis.length > 0 ? notificationLanguage.value : undefined,
    };
    const res = await arrivalRepository.createMultiple(payload);
    if (res.failedOrders && res.failedOrders.length > 0) {
      const msg = res.failedOrders.map(f => `${f.orderId}: ${f.error}`).join('; ');
      message.warning(t('merchant.arrivals.createMultiplePartial', { msg }));
    } else {
      message.success(t('merchant.arrivals.createMultipleSuccess'));
    }
    
    // Open WhatsApp tabs and wait for completion before navigating
    if (res.notifications && res.notifications.length > 0) {
      await openWhatsAppTabsForNotifications(res.notifications);
    }
    
    confirmModalVisible.value = false;
    clearBucketStorage();
    router.push('/merchant/arrivals');
  } catch (err) {
    handleApiError(err, t);
    throw err;
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

/* Confirm create modal */
.confirm-modal-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.confirm-total-summary {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  text-align: center;
  padding: 8px 0;
}

.confirm-controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.confirm-notification-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
}

.confirm-notification-icon {
  font-size: 16px;
  color: #0ea5e9;
}

.confirm-controls-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.confirm-language-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.confirm-language-label {
  font-size: 13px;
  color: #334155;
  font-weight: 500;
  flex-shrink: 0;
}

.confirm-language-options {
  flex: 1;
}

.confirm-select-hint {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 8px 0;
}

/* WhatsApp Progress Modal */
.whatsapp-progress-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.progress-icon {
  font-size: 48px;
  color: #25D366;
  margin-bottom: 16px;
  animation: whatsappPulse 2s infinite;
}

.progress-text {
  margin-bottom: 20px;
}

.progress-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.progress-status {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.progress-current {
  font-size: 13px;
  color: #9ca3af;
  font-style: italic;
}

.progress-note {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 16px;
  line-height: 1.4;
  max-width: 300px;
}

@keyframes whatsappPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.confirm-customer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
}

.confirm-customer-card {
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.confirm-customer-card :deep(.ant-checkbox-wrapper) {
  align-items: flex-start;
  width: 100%;
}

.confirm-customer-card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.confirm-customer-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.confirm-customer-icon {
  font-size: 16px;
  color: #64748b;
  flex-shrink: 0;
}

.confirm-customer-name {
  font-weight: 600;
  color: #334155;
  font-size: 14px;
}

.confirm-customer-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: #64748b;
  padding-left: 24px;
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
