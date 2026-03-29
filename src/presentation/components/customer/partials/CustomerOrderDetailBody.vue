<template>
  <!-- Product info row -->
  <div class="detail-product-row">
    <div class="detail-img-wrap">
      <div class="detail-img-placeholder"><ShoppingOutlined /></div>
    </div>
    <div class="detail-product-info">
      <div class="detail-sku">{{ $t('customer.orderLabel') }} #{{ order.orderCode || order.id }}</div>
      <div class="detail-name">{{ getOrderTitle(order) }}</div>
      <div class="detail-arrived-badge">
        <CheckCircleFilled class="arrived-icon" />
        <span>{{ $t('customer.detail.arrived') }}</span>
        <span class="arrived-date">{{ formatDate(order.createdAt) }}</span>
      </div>
    </div>
  </div>

  <!-- Items breakdown: card layout like merchant version -->
  <div v-if="order.customerOrderItems?.length" class="items-section">
    <div class="items-header">
      <ShoppingCartOutlined class="section-icon-sm" />
      <span>{{ $t('customer.detail.itemsTitle') }}</span>
      <a-tag class="count-tag">{{ formattedOrderItems?.length || 0 }}</a-tag>
    </div>
    
    <!-- Cards View -->
    <div v-if="formattedOrderItems && formattedOrderItems.length > 0" class="items-grid">
      <div 
        v-for="(item, idx) in formattedOrderItems" 
        :key="item.id" 
        class="item-card"
      >
        <!-- Image Section -->
        <div class="item-image-section">
          <img 
            v-if="getItemImage(item)" 
            :src="getItemImage(item)" 
            :alt="item.productName || undefined"
            class="item-image"
            @error="handleImageError"
            @click.stop="openItemImageModal(item)"
          />
          <div v-else class="item-image-placeholder">
            <ShoppingOutlined />
          </div>
        </div>

        <!-- Content Section -->
        <div class="item-content">
          <div class="item-header">
            <span class="item-num">#{{ idx + 1 }}</span>
            <span class="item-name truncated-text">{{ getOrderItemData(item).productName || 'Product Name' }}</span>
          </div>

          <div class="item-info">
            <div class="info-row">
              <span class="info-label">{{ $t('customer.detail.colQuantity') }}:</span>
              <span class="info-value">{{ getItemQuantity(item) }}</span>
            </div>
          </div>

          <!-- Price Info -->
          <div class="price-info">
            <div class="price-row">
              <span class="price-label">{{ $t('customer.detail.colTotalPrice') }}</span>
              <span class="price-value">{{ item.formattedPrice }}</span>
            </div>
          </div>

          <!-- SKU Preview -->
          <!-- <div v-if="getOrderItemSkus(item).length > 0" class="sku-preview">
            <div class="sku-chip">
              <span class="sku-variant">{{ getOrderItemSkus(item)[0]?.variant || 'Standard' }}</span>
              <span class="sku-quantity">×{{ getOrderItemSkus(item)[0]?.quantity || 0 }}</span>
            </div>
            <span v-if="getOrderItemSkus(item).length > 1" class="more-skus">+{{ getOrderItemSkus(item).length - 1 }} more</span>
          </div> -->

          <!-- Click hint for SKU details -->
          <div v-if="getOrderItemSkus(item).length > 0" class="click-hint" @click.stop="openSkuDetailsModal(item)">
            <EyeOutlined />
            {{ $t('customer.detail.clickToViewImage') }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Total due -->
  <div class="detail-total-row">
    <span class="detail-total-label">{{ $t('customer.detail.totalDue') }}</span>
    <span class="detail-total-amount">{{ formatTotalDue(order) }}</span>
  </div>

  <!-- Payment status -->
  <div class="detail-status-row">
    <span class="detail-status-label">{{ $t('customer.detail.paymentStatus') }}</span>
    <span class="detail-status-badge" :class="statusClass(displayPaymentStatus)">
      {{ $t(`customer.paymentStatus.${displayPaymentStatus}`) }}
    </span>
  </div>

  <!-- Message -->
  <div class="detail-section">
    <div class="detail-section-header">
      <MessageOutlined class="section-icon-sm" />
      <span>{{ $t('customer.detail.messageTitle') }}</span>
    </div>
    <a-textarea
      :value="message"
      :placeholder="$t('customer.detail.messagePlaceholder')"
      :rows="4"
      class="message-textarea"
      @update:value="$emit('update:message', $event)"
    />
  </div>

  <!-- Upload slip (only when can submit) -->
  <div v-if="canSubmit" class="detail-section">
    <div class="detail-section-header">
      <CreditCardOutlined class="section-icon-sm" />
      <span>{{ $t('customer.detail.uploadTitle') }}</span>
    </div>
    <div
      class="upload-zone"
      :class="{ 'upload-zone--active': isDragging, 'upload-zone--has-file': slipFile }"
      @dragover.prevent="$emit('dragOver')"
      @dragleave.prevent="$emit('dragLeave')"
      @drop.prevent="$emit('drop', $event)"
    >
      <!-- Input overlay: คลิกตรงไหนก็เปิด file picker ได้ (แก้ปัญหา mobile ที่ display:none ไม่ทำงาน) -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png"
        class="file-input-overlay"
        :class="{ 'file-input-overlay--disabled': !!slipFile }"
        @change="$emit('fileChange', $event)"
      />
      <template v-if="!slipFile">
        <div class="upload-icon-wrap"><CloudUploadOutlined class="upload-icon" /></div>
        <div class="upload-text">{{ $t('customer.detail.uploadText') }}</div>
        <div class="upload-hint">{{ $t('customer.detail.uploadHint') }}</div>
        <div class="upload-note">{{ $t('customer.detail.uploadNote') }}</div>
      </template>
      <template v-else>
        <div class="upload-preview">
          <img :src="slipPreview" alt="slip" class="slip-preview-img" />
          <div class="slip-filename">{{ slipFile.name }}</div>
          <div class="upload-note-file">{{ $t('customer.detail.uploadNote') }}</div>
          <a-button size="small" danger @click.stop="handleRemoveSlip">
            {{ $t('customer.detail.removeSlip') }}
          </a-button>
        </div>
      </template>
    </div>
  </div>

  <!-- Uploaded slip preview (when payment submitted) -->
  <div v-else-if="order.paymentStatus !== 'PAID' && order.hasPendingPayment" class="detail-section">
    <div class="detail-section-header">
      <CreditCardOutlined class="section-icon-sm" />
      <span>{{ $t('customer.detail.uploadedSlipTitle') }}</span>
    </div>
    <div class="uploaded-slip-preview">
      <div class="slip-preview-container">
        <img 
          :src="getPaymentProofUrl()" 
          alt="Payment slip" 
          class="uploaded-slip-img"
          @click="showPaymentImageModal = true"
        />
        <div class="slip-overlay" @click="showPaymentImageModal = true">
          <EyeOutlined class="preview-icon" />
          <span class="preview-text">{{ $t('customer.detail.clickToPreview') }}</span>
        </div>
      </div>
      <div class="slip-info">
        <div class="slip-status">{{ $t('customer.detail.paymentSubmitted') }}</div>
        <div class="slip-note">{{ $t('customer.detail.waitingForVerification') }}</div>
      </div>
    </div>
  </div>

  <!-- Payment Image Preview Modal -->
  <Teleport to="body">
    <Transition name="modal-fade" appear>
      <div v-if="showPaymentImageModal && paymentProofUrl" class="image-modal-overlay" @click="closePaymentImageModal">
        <div class="image-modal-container" @click.stop>
          <div class="image-modal-header">
            <div class="modal-title">{{ $t('customer.detail.paymentProofPreview') }}</div>
            <button class="modal-close-btn" @click="closePaymentImageModal">
              <CloseOutlined />
            </button>
          </div>
          <div class="image-modal-content">
            <img 
              :src="paymentProofUrl" 
              alt="Payment proof preview" 
              class="modal-image"
              @load="imageLoaded = true"
              @error="imageError = true"
            />
            <div v-if="!imageLoaded && !imageError" class="image-loading">
              <LoadingOutlined class="loading-icon" />
              <span>{{ $t('customer.detail.loadingImage') }}</span>
            </div>
            <div v-if="imageError" class="image-error">
              <ExclamationCircleOutlined class="error-icon" />
              <span>{{ $t('customer.detail.imageLoadError') }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Item Image Preview Modal -->
  <Teleport to="body">
    <Transition name="modal-fade" appear>
      <div v-if="showItemImageModal && selectedItemImage" class="image-modal-overlay" @click="closeItemImageModal">
        <div class="image-modal-container" @click.stop>
          <div class="image-modal-header">
            <div class="modal-title">{{ selectedImageTitle }}</div>
            <button class="modal-close-btn" @click="closeItemImageModal">
              <CloseOutlined />
            </button>
          </div>
          <div class="image-modal-content">
            <img 
              :src="selectedItemImage" 
              alt="Product image preview" 
              class="modal-image"
              @load="imageLoaded = true"
              @error="imageError = true"
            />
            <div v-if="!imageLoaded && !imageError" class="image-loading">
              <LoadingOutlined class="loading-icon" />
              <span>{{ $t('customer.detail.loadingImage') }}</span>
            </div>
            <div v-if="imageError" class="image-error">
              <ExclamationCircleOutlined class="error-icon" />
              <span>{{ $t('customer.detail.imageLoadError') }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- SKU Details Modal -->
  <Teleport to="body">
    <Transition name="modal-fade" appear>
      <div v-if="showSkuDetailsModal && selectedOrderItem" class="sku-modal-overlay" @click="closeSkuDetailsModal">
        <div class="sku-modal-container" @click.stop>
          <div class="sku-modal-header">
            <div class="sku-modal-title">
              <ShoppingCartOutlined class="title-icon" />
              <span>{{ getOrderItemData(selectedOrderItem).productName || 'Product Name' }}</span>
            </div>
            <button class="modal-close-btn" @click="closeSkuDetailsModal">
              <CloseOutlined />
            </button>
          </div>
          <div class="sku-modal-content">
            <div class="sku-carousel-container" v-if="getOrderItemSkus(selectedOrderItem).length > 1">
              <!-- Navigation Buttons -->
              <button 
                class="carousel-nav-btn prev-btn" 
                @click="previousSku"
                :disabled="currentSkuIndex === 0"
              >
                <ArrowLeftOutlined />
              </button>
              <button 
                class="carousel-nav-btn next-btn" 
                @click="nextSku"
                :disabled="currentSkuIndex === getOrderItemSkus(selectedOrderItem).length - 1"
              >
                <ArrowRightOutlined />
              </button>
              
              <!-- SKU Indicators -->
              <div class="sku-indicators">
                <button
                  v-for="(sku, index) in getOrderItemSkus(selectedOrderItem)"
                  :key="sku.id || index"
                  class="indicator-dot"
                  :class="{ active: currentSkuIndex === index }"
                  @click="goToSku(Number(index))"
                />
              </div>
            </div>

            <!-- SKU Display with Sliding Animation -->
            <div class="sku-display">
              <div class="sku-list-header">
                <h4>SKUs {{ getOrderItemSkus(selectedOrderItem).length > 1 ? `(${currentSkuIndex + 1}/${getOrderItemSkus(selectedOrderItem).length})` : '' }}</h4>
              </div>
              
              <!-- Sliding Container -->
              <div class="sku-slider-container">
                <div 
                  class="sku-slider-wrapper"
                  :style="{ transform: `translateX(-${currentSkuIndex * 100}%)` }"
                >
                  <div 
                    v-for="(sku, index) in getOrderItemSkus(selectedOrderItem)"
                    :key="sku.id || index"
                    class="sku-slide-item"
                  >
                    <div class="sku-item">
                      <div class="sku-field-row">
                        <span class="field-label">{{ $t('customer.detail.variant') }}:</span>
                        <span class="sku-variant-name">{{ sku?.variant || 'Standard' }}</span>
                      </div>
                      <div class="sku-field-row">
                        <span class="field-label">{{ $t('customer.detail.colQuantity') }}:</span>
                        <div class="sku-quantity-badge">{{ sku?.quantity || 0 }} </div>
                      </div>
                      <div class="sku-field-row">
                        <span class="field-label">{{ $t('customer.detail.colTotalPrice') }}:</span>
                        <div class="sku-price-info">
                          <div class="sku-price">
                            {{ formatSkuPrice(sku) }}
                          </div>
                          <div class="sku-currency">
                            {{ getCurrencySymbol(selectedOrderItem) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="sku-summary !mt-5">
              <div class="summary-row">
                <span class="summary-label">{{ $t('customer.detail.colQuantity') }}:</span>
                <span class="summary-value">{{ getOrderItemSkus(selectedOrderItem).length }} {{ $t('customer.detail.qty') }}</span>
              </div>
              <div class="summary-row total">
                <span class="summary-label">{{ $t('customer.detail.colTotalPrice') }}:</span>
                <span class="summary-value">{{ getOrderItemData(selectedOrderItem).formattedPrice || formatItemPrice(selectedOrderItem) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <template v-if="canSubmit">
    <a-button
      type="primary"
      class="submit-btn-inline"
      :loading="submitting"
      @click="$emit('submit')"
    >
      {{ $t('customer.detail.submitBtn') }}
      <ArrowRightOutlined />
    </a-button>
  </template>
  <template v-else>
    <div class="payment-status-message">
      {{ paymentStatusMessage }}
    </div>
  </template>
  <div style="height: 24px" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  ShoppingOutlined,
  CheckCircleFilled,
  MessageOutlined,
  CreditCardOutlined,
  CloudUploadOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
  CloseOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons-vue';
import { formatDate } from '@/shared/utils/date.utils';
import type { CustomerOrder } from '@/infrastructure/repositories/customer-order.repository';
import { paymentRepository } from '@/infrastructure/repositories/payment.repository';
import type { PaymentItem } from '@/infrastructure/repositories/payment.repository';
import { orderItemRepository } from '@/infrastructure/repositories/order-item.repository';
import type { OrderItem } from '@/domain/entities/user.entity';

const props = defineProps<{
  order: CustomerOrder;
  message: string;
  slipFile: File | null;
  slipPreview: string;
  isDragging: boolean;
  submitting: boolean;
  canSubmit: boolean;
  isMobile: boolean;
}>();

// Cache to preserve currency information per order when exchange rate data is lost
const orderCurrencyCache = ref<Map<number, string>>(new Map());

const currencySymbol = (code: string | null) => {
  console.log("no have currcecy",code);
  if (!code) return '₭';
  const map: Record<string, string> = { 
    LAK: '₭', 
    THB: '฿', 
    USD: '$', 
    USDT: '$',
    CNY: '¥',
    RMB: '¥'
  };
  return map[code] ?? code;
};

// Computed properties for formatted prices to ensure reactivity
const formattedOrderItems = computed(() => {
  console.log('=== RECOMPUTING FORMATTED ITEMS ===');
  console.log('Current order ID:', props.order.id);
  console.log('Order customerOrderItems:', props.order.customerOrderItems);
  
  // Group items by orderItemId to handle multiple SKUs for same order item
  const groupedItems = props.order.customerOrderItems?.reduce((acc, item, index) => {
    const orderItemId = item.orderItemId;
    
    if (!orderItemId) {
      // Handle items without orderItemId
      acc.noOrderItemId = acc.noOrderItemId || [];
      acc.noOrderItemId.push(item);
    } else {
      // Group by orderItemId
      if (!acc[orderItemId]) {
        acc[orderItemId] = [];
      }
      acc[orderItemId].push(item);
      
      console.log(`Grouping item ${index}:`, {
        id: item.id,
        orderItemId: item.orderItemId,
        orderItemSkuId: item.orderItemSkuId,
        variant: item.variant,
        productName: item.productName,
        groupSize: acc[orderItemId].length
      });
    }
    
    return acc;
  }, {} as Record<number | string, any[]>) || {};
  
  // Convert grouped items to array with merged data
  const formatted = Object.entries(groupedItems).map(([key, items]) => {
    if (key === 'noOrderItemId') {
      // Return items without orderItemId as separate cards
      return items.map((item) => ({
        ...item,
        formattedPrice: formatItemPrice({
          ...item,
          productName: item.productName || ''
        })
      }));
    } else {
      // For items with same orderItemId, create one card with all SKUs
      const firstItem = items[0];
      const mergedItem = {
        ...firstItem,
        // Remove orderItemSkuId to prevent filtering in getOrderItemSkus
        orderItemSkuId: undefined,
        // Merge all SKUs for this order item
        allSkus: items.map(item => ({
          id: item.orderItemSkuId,
          variant: item.variant,
          quantity: item.quantity,
          sellingTotal: item.sellingTotal
        })),
        // Keep first item's basic info
        formattedPrice: formatItemPrice({
          ...firstItem,
          productName: firstItem.productName || ''
        })
      };
      
      console.log(`Merged item for orderItemId ${key}:`, {
        totalSkus: items.length,
        allSkus: mergedItem.allSkus,
        firstItem: firstItem
      });
      
      return mergedItem;
    }
  }).flat(); // Flatten to handle both grouped and individual items
  
  console.log('Formatted items after grouping:', formatted);
  console.log('Total formatted items count:', formatted.length);
  return formatted;
});

const formatItemPrice = (customerOrderItem: { 
  productName: string;
  sellingTotal: string; 
  targetCurrencySellingTotal: string | null; 
  exchangeRateSell?: { baseCurrency: string } | null;
  orderItemId?: number | null;
}) => {
  // Use customerOrderItems data to calculate price if orderItemId is available
  if (customerOrderItem.orderItemId) {
    return formatCustomerOrderItemPrice(customerOrderItem.orderItemId);
  }
  
  // Fallback to original logic for items without orderItemId
  const amount = parseFloat(customerOrderItem.sellingTotal || '0');
  
  // Use exchangeRateSell.baseCurrency if available, otherwise check if targetCurrencySellingTotal exists
  // If targetCurrencySellingTotal exists, it means the price is converted, so use LAK as fallback
  // If no conversion, try to get currency from exchange rate, fallback to LAK
  let currencyCode: string | null = null;
  
  if (customerOrderItem.exchangeRateSell?.baseCurrency) {
    currencyCode = customerOrderItem.exchangeRateSell.baseCurrency;
    // Cache the currency for this order
    orderCurrencyCache.value.set(props.order.id, currencyCode);
  } else if (customerOrderItem.targetCurrencySellingTotal != null) {
    // Check if we have a cached currency for this order
    const cachedCurrency = orderCurrencyCache.value.get(props.order.id);
    if (cachedCurrency) {
      currencyCode = cachedCurrency;
    } else {
      // If there's a converted amount but no exchange rate, assume it's converted to LAK
      currencyCode = 'LAK';
    }
  } else {
    console.log('Using default fallback (no exchange rate, no conversion)');
  }
  
  const sym = currencySymbol(currencyCode);
  
  return `${formatAmount(amount)} ${sym}`;
};

const formatTotalDue = (o: CustomerOrder & { 
  customerOrderItems?: Array<{ 
    sellingTotal: string; 
    exchangeRateSell?: { baseCurrency: string } | null;
  }>;
}) => {
  // Calculate total from sellingTotal of all items
  const totalAmount = o.customerOrderItems?.reduce((sum, item) => {
    return sum + parseFloat(item.sellingTotal || '0');
  }, 0) || 0;
  
  // Use exchangeRateSell.baseCurrency from first item for currency symbol
  const firstItem = o.customerOrderItems?.[0];
  console.log("firstItem", firstItem)
  let currencyCode = firstItem?.exchangeRateSell?.baseCurrency ?? null;
   console.log("log currencycode", currencyCode)
  // If no exchange rate data, try to use cached currency
  if (!currencyCode) {
    currencyCode = orderCurrencyCache.value.get(o.id) ?? null;
  }
  
  const sym = currencySymbol(currencyCode);
  
  return `${formatAmount(totalAmount)} ${sym}`;
};

/** สถานะที่แสดง: ถ้ามี payment รอตรวจสอบ ให้แสดง PENDING_VERIFICATION แทน UNPAID/PARTIAL */
const displayPaymentStatus = computed(() => {
  const o = props.order;
  if (o.hasPendingPayment) return 'PENDING_VERIFICATION';
  return o.paymentStatus;
});

const paymentStatusMessage = computed(() => {
  const o = props.order;
  if (o.paymentStatus === 'PAID' || parseFloat(o.remainingAmount) <= 0) {
    return t('customer.detail.paymentComplete');
  }
  if (o.hasPendingPayment) {
    return t('customer.detail.paymentPending');
  }
  return '';
});

const { t } = useI18n();
const fileInputRef = ref<HTMLInputElement | null>(null);
const paymentData = ref<PaymentItem | null>(null);
const paymentLoading = ref(false);

// Modal state
const showPaymentImageModal = ref(false);
const showItemImageModal = ref(false);
const showSkuDetailsModal = ref(false);
const imageLoaded = ref(false);
const imageError = ref(false);
const selectedItemImage = ref<string | null>(null);
const selectedImageTitle = ref<string>('');
const selectedOrderItem = ref<any>(null);

// SKU carousel state
const currentSkuIndex = ref(0);

// Order item images cache
const orderItemImages = ref<Map<number, OrderItem>>(new Map());

// Computed property for payment proof URL
const paymentProofUrl = computed(() => {
  return paymentData.value?.paymentProofUrl || '';
});

// Methods for image handling

const getItemImage = (customerOrderItem: any): string | undefined => {
  // Check if we have cached order item with image using orderItemId as key
  if (customerOrderItem.orderItemId && orderItemImages.value.has(customerOrderItem.orderItemId)) {
    const orderItem = orderItemImages.value.get(customerOrderItem.orderItemId);
    return orderItem?.image?.publicUrl ?? undefined;
  }
  
  // Also check by orderItemSkuId if available
  if (customerOrderItem.orderItemSkuId && orderItemImages.value.has(customerOrderItem.orderItemSkuId)) {
    const orderItem = orderItemImages.value.get(customerOrderItem.orderItemSkuId);
    return orderItem?.image?.publicUrl ?? undefined;
  }
  
  // Fetch order item details if not cached
  // For grouped items (with allSkus), always fetch by orderItemId to get all SKUs
  // For individual items, we can fetch by orderItemSkuId if available
  if (customerOrderItem.allSkus && customerOrderItem.orderItemId) {
    // Grouped item - fetch parent order item with all SKUs
    fetchOrderItemImage(customerOrderItem.orderItemId);
  } else if (customerOrderItem.orderItemId) {
    // Individual item - fetch by orderItemId to get all SKUs
    fetchOrderItemImage(customerOrderItem.orderItemId);
  } else if (customerOrderItem.orderItemSkuId) {
    // Fallback - fetch by SKU (will only get that specific SKU)
    fetchOrderItemImage(0, customerOrderItem.orderItemSkuId);
  }
  
  return undefined;
};

const fetchOrderItemImage = async (orderItemId: number, orderItemSkuId?: number) => {
  const cacheKey = orderItemSkuId || orderItemId;
  if (orderItemImages.value.has(cacheKey)) {
    return; // Already cached
  }
  
  try {
    console.log(`=== FETCHING ORDER ITEM ${orderItemId} ${orderItemSkuId ? `(SKU: ${orderItemSkuId})` : ''} ===`);
    
    // Always fetch by orderItemId to get all SKUs
    // Only use SKU filter when we specifically want just that SKU (not for grouped items)
    const orderItem = await orderItemRepository.getById(orderItemId);
      
    console.log(`=== API RESPONSE FOR ORDER ITEM ${orderItemId} ===`);
    console.log('Full response:', JSON.stringify(orderItem, null, 2));
    console.log('Exchange rate sell data:', orderItem?.exchangeRateSell);
    console.log('Base currency:', orderItem?.exchangeRateSell?.baseCurrency);
    console.log('Target currency selling total:', orderItem?.targetCurrencySellingTotal);
    
    // Cache order item
    orderItemImages.value.set(cacheKey, orderItem);
    
    // IMPORTANT: Update order item in props data with exchange rate info
    const customerOrderItem = props.order.customerOrderItems?.find(item => 
      item.orderItemId === orderItemId || 
      (orderItemSkuId && item.orderItemSkuId === orderItemSkuId)
    );
    if (customerOrderItem && orderItem?.exchangeRateSell) {
      console.log(`=== UPDATING ORDER ITEM ${orderItemId} WITH EXCHANGE RATE DATA ===`);
      console.log('Before update:', customerOrderItem.exchangeRateSell);
      // Type assertion to handle API response format
      customerOrderItem.exchangeRateSell = orderItem.exchangeRateSell as any;
      console.log('After update:', customerOrderItem.exchangeRateSell);
    }
    
  } catch (error) {
    console.error('Error fetching order item image:', error);
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
};

const openItemImageModal = (customerOrderItem: any) => {
  const imageUrl = getItemImage(customerOrderItem);
  if (imageUrl) {
    selectedItemImage.value = imageUrl;
    selectedImageTitle.value = customerOrderItem.productName || 'Product Image';
    showItemImageModal.value = true;
  }
};

const closePaymentImageModal = () => {
  showPaymentImageModal.value = false;
};

const closeItemImageModal = () => {
  showItemImageModal.value = false;
  selectedItemImage.value = null;
  selectedImageTitle.value = '';
};

// SKU Details Modal Functions
const openSkuDetailsModal = (item: any) => {
  selectedOrderItem.value = item;
  currentSkuIndex.value = 0; // Reset to first SKU
  showSkuDetailsModal.value = true;
};

const closeSkuDetailsModal = () => {
  showSkuDetailsModal.value = false;
  selectedOrderItem.value = null;
  currentSkuIndex.value = 0;
};

// Carousel navigation functions
const nextSku = () => {
  const skus = getOrderItemSkus(selectedOrderItem.value);
  if (currentSkuIndex.value < skus.length - 1) {
    currentSkuIndex.value++;
  }
};

const previousSku = () => {
  if (currentSkuIndex.value > 0) {
    currentSkuIndex.value--;
  }
};

const goToSku = (index: number) => {
  currentSkuIndex.value = index;
};

// Helper functions for SKU modal
const getOrderItemData = (customerOrderItem: any) => {
  // Use customerOrderItems data for modal summary if orderItemId is available
  if (customerOrderItem.orderItemId) {
    const itemWithPrice = { ...customerOrderItem } as any;
    itemWithPrice.formattedPrice = formatCustomerOrderItemPrice(customerOrderItem.orderItemId);
    console.log(`getOrderItemData: Using customerOrderItems data for orderItemId ${customerOrderItem.orderItemId}`);
    return itemWithPrice;
  }
  
  // Fallback to original logic for items without orderItemId
  // Try to get cached order item with full data including productName using orderItemId as key
  const cachedOrderItem = orderItemImages.value.get(customerOrderItem.orderItemId);
  if (cachedOrderItem) {
    // Calculate formatted price from SKUs if available
    const itemWithPrice = { ...cachedOrderItem } as any;
    if (cachedOrderItem.skus && cachedOrderItem.skus.length > 0) {
      const totalFromSkus = cachedOrderItem.skus.reduce((sum, sku) => {
        return sum + parseFloat(sku.sellingTotal || '0');
      }, 0);
      
      // Use the same currency logic as formatItemPrice
      let currencyCode = cachedOrderItem.exchangeRateSell?.baseCurrency || null;
      if (!currencyCode && cachedOrderItem.targetCurrencySellingTotal) {
        currencyCode = orderCurrencyCache.value.get(props.order.id) || 'LAK';
      }
      if (!currencyCode) {
        currencyCode = 'LAK';
      }
      
      itemWithPrice.formattedPrice = `${formatAmount(totalFromSkus)} ${currencySymbol(currencyCode)}`;
      console.log(`getOrderItemData: Calculated price from SKUs: ${totalFromSkus} ${currencyCode}`);
    }
    return itemWithPrice;
  }
  // Return the customer order item as fallback
  return customerOrderItem;
};

const getOrderItemSkus = (customerOrderItem: any) => {
  // Check if item has allSkus property (from grouped items)
  if (customerOrderItem.allSkus) {
    return customerOrderItem.allSkus;
  }
  
  // Try to get cached order item with full SKU data using orderItemId as key
  const cachedOrderItem = orderItemImages.value.get(customerOrderItem.orderItemId);
  if (cachedOrderItem && cachedOrderItem.skus) {
    // Only filter by orderItemSkuId if this is NOT a grouped item (doesn't have allSkus)
    // For grouped items, we want to show all SKUs
    if (customerOrderItem.orderItemSkuId && !customerOrderItem.allSkus) {
      return cachedOrderItem.skus.filter(sku => sku.id === customerOrderItem.orderItemSkuId);
    }
    return cachedOrderItem.skus;
  }
  // Fallback: create a mock SKU structure from the customer order item
  return customerOrderItem.quantity ? [{
    id: customerOrderItem.orderItemSkuId || 0,
    variant: customerOrderItem.variant || 'Standard',
    quantity: customerOrderItem.quantity,
    sellingTotal: customerOrderItem.sellingTotal || '0'
  }] : [];
};

const formatSkuPrice = (sku: any) => {
  const price = parseFloat(sku.sellingTotal || '0');
  return formatAmount(price);
};

const getCurrencySymbol = (item: any) => {
  const currencyCode = item.exchangeRateSell?.baseCurrency || 'LAK';
  return currencySymbol(currencyCode);
};

// Helper functions to calculate values from customerOrderItems
const getQuantityFromCustomerOrderItems = (orderItemId: number) => {
  if (!props.order.customerOrderItems) return 0;
  
  const itemsWithSameOrderItemId = props.order.customerOrderItems.filter((item: any) => item.orderItemId === orderItemId);
  const totalQuantity = itemsWithSameOrderItemId.reduce((sum, item: any) => sum + (item.quantity || 0), 0);
  
  console.log(`getQuantityFromCustomerOrderItems for orderItemId ${orderItemId}:`, {
    totalQuantity,
    itemsCount: itemsWithSameOrderItemId.length,
    items: itemsWithSameOrderItemId.map((item: any) => ({ id: item.id, quantity: item.quantity }))
  });
  
  return totalQuantity;
};

const getTotalPriceFromCustomerOrderItems = (orderItemId: number) => {
  if (!props.order.customerOrderItems) return 0;
  
  const itemsWithSameOrderItemId = props.order.customerOrderItems.filter((item: any) => item.orderItemId === orderItemId);
  const totalSellingTotal = itemsWithSameOrderItemId.reduce((sum, item: any) => sum + parseFloat(item.sellingTotal || '0'), 0);
  
  console.log(`getTotalPriceFromCustomerOrderItems for orderItemId ${orderItemId}:`, {
    totalSellingTotal,
    itemsCount: itemsWithSameOrderItemId.length,
    items: itemsWithSameOrderItemId.map((item: any) => ({ id: item.id, sellingTotal: item.sellingTotal }))
  });
  
  return totalSellingTotal;
};

const formatCustomerOrderItemPrice = (orderItemId: number) => {
  const totalAmount = getTotalPriceFromCustomerOrderItems(orderItemId);
  
  // Get currency from the first customer order item with this orderItemId
  const firstItem = props.order.customerOrderItems?.find((item: any) => item.orderItemId === orderItemId);
  let currencyCode = firstItem?.exchangeRateSell?.baseCurrency || null;
  
  if (!currencyCode && firstItem?.exchangeRateSell) {
    currencyCode = orderCurrencyCache.value.get(props.order.id) || 'LAK';
  }
  if (!currencyCode) {
    currencyCode = 'LAK';
  }
  
  const formattedPrice = `${formatAmount(totalAmount)} ${currencySymbol(currencyCode)}`;
  
  console.log(`formatCustomerOrderItemPrice for orderItemId ${orderItemId}:`, {
    totalAmount,
    currencyCode,
    formattedPrice
  });
  
  return formattedPrice;
};

const getItemQuantity = (customerOrderItem: { orderItemId?: number | null; quantity?: number }) => {
  // Use customerOrderItems data to sum quantities by orderItemId
  if (customerOrderItem.orderItemId) {
    return getQuantityFromCustomerOrderItems(customerOrderItem.orderItemId);
  }
  
  // Fallback to original logic for items without orderItemId
  return customerOrderItem.quantity ?? 0;
};

watch(() => props.order.id, (newOrderId, oldOrderId) => {
  console.log(`Order changed from ${oldOrderId} to ${newOrderId}, clearing cache`);
  paymentData.value = null;
  // Clear the order item images cache when switching orders
  orderItemImages.value.clear();
  console.log('Cache cleared, current cache size:', orderItemImages.value.size);
  fetchPaymentData();
});

// Watch for modal open/close to reset image states
watch([showPaymentImageModal, showItemImageModal], (newValue) => {
  if (newValue.some(val => val)) {
    imageLoaded.value = false;
    imageError.value = false;
  }
});

// Handle ESC key to close modals
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (showPaymentImageModal.value) {
      closePaymentImageModal();
    }
    if (showItemImageModal.value) {
      closeItemImageModal();
    }
    if (showSkuDetailsModal.value) {
      closeSkuDetailsModal();
    }
  }
};

// Add and remove keyboard event listener
onMounted(() => {
  document.addEventListener('keydown', handleEscKey);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey);
});

// Fetch payment data when component mounts or order changes
const fetchPaymentData = async () => {
  if (!props.order.hasPendingPayment) {
    return;
  }
  
  paymentLoading.value = true;
  try {
    const payment = await paymentRepository.getByCustomerOrderId(props.order.id);
    paymentData.value = payment;
  } catch (error) {
    console.error('Error fetching payment data:', error);
  } finally {
    paymentLoading.value = false;
  }
};

// Initial fetch
fetchPaymentData();
const emit = defineEmits<{
  (e: 'update:message', val: string): void;
  (e: 'fileChange', ev: Event): void;
  (e: 'drop', ev: DragEvent): void;
  (e: 'dragOver'): void;
  (e: 'dragLeave'): void;
  (e: 'removeSlip'): void;
  (e: 'submit'): void;
}>();

const handleRemoveSlip = () => {
  if (fileInputRef.value) fileInputRef.value.value = '';
  emit('removeSlip');
};

const getPaymentProofUrl = () => {
  return paymentProofUrl.value;
};

const formatAmount = (val: number) =>
  val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const getOrderTitle = (order: CustomerOrder): string => {
  const first = order.customerOrderItems?.[0];
  if (first?.productName) {
    const extra = order.customerOrderItems.length > 1
      ? ` +${order.customerOrderItems.length - 1} ${t('customer.moreItems')}`
      : '';
    return first.productName + extra;
  }
  return `${t('customer.orderLabel')} #${order.orderCode || order.id}`;
};

const statusClass = (status: string) => {
  if (status === 'PAID') return 'badge-paid';
  if (status === 'PARTIAL') return 'badge-partial';
  if (status === 'PENDING_VERIFICATION') return 'badge-pending';
  return 'badge-unpaid';
};
</script>

<style scoped>
.detail-product-row {
  background: #fff; border-radius: 16px; padding: 16px;
  display: flex; align-items: flex-start; gap: 14px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}
.detail-img-wrap {
  width: 80px; height: 80px;
  border-radius: 12px; overflow: hidden;
  flex-shrink: 0; background: #eff6ff;
}
.detail-img-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; color: #93c5fd;
}
.detail-product-info { flex: 1; min-width: 0; }
.detail-sku { font-size: 11px; font-weight: 700; color: #1d4ed8; margin-bottom: 4px; }
.detail-name { font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.4; margin-bottom: 10px; }
.detail-arrived-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: #e0f2fe; color: #0369a1;
  border-radius: 999px; padding: 4px 12px 4px 8px;
  font-size: 12px; font-weight: 600;
}
.arrived-icon { color: #0ea5e9; }
.arrived-date { color: #475569; font-weight: 400; margin-left: 4px; font-size: 11px; }

/* Items breakdown */
.items-section {
  background: #fff; border-radius: 14px; padding: 14px 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}
.items-header {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 700; color: #1e293b;
  margin-bottom: 10px;
}
.section-icon-sm { font-size: 15px; color: #475569; }

/* Items card layout styles */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.item-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
}

.item-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.item-image-section {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f8fafc;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.item-card:hover .item-image {
  transform: scale(1.05);
}

.item-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #94a3b8;
  font-size: 48px;
}

.item-content {
  padding: 16px;
}

.item-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

.item-num {
  background: #3b82f6;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  margin-top: 2px;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
  flex: 1;
}

.item-variant {
  font-size: 12px;
  color: #6b7280;
  font-weight: 400;
  margin-top: 2px;
}

.item-info {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.info-label {
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  color: #1f2937;
  font-weight: 600;
}

.price-info {
  margin-bottom: 12px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.price-label {
  color: #6b7280;
  font-weight: 500;
}

.price-value {
  color: #059669;
  font-weight: 700;
}

.click-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #3b82f6;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.item-card:hover .click-hint {
  opacity: 1;
}

.count-tag {
  background: #eff6ff;
  color: #3b82f6;
  border: none;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: 8px;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .items-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .item-image-section {
    height: 160px;
  }
  
  .item-content {
    padding: 12px;
  }
  
  .item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .item-num {
    align-self: flex-start;
  }
}

.payment-status-message {
  margin-top: 12px;
  padding: 14px 18px;
  background: #f0fdf4;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  color: #15803d;
  text-align: center;
}

/* Total row */
.detail-total-row {
  background: #fff; border-radius: 14px; padding: 14px 18px;
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}
.detail-total-label { font-size: 14px; color: #64748b; font-weight: 500; }
.detail-total-amount { font-size: 22px; font-weight: 800; color: #1d4ed8; }

/* Status row */
.detail-status-row {
  background: #fff; border-radius: 14px; padding: 12px 18px;
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}
.detail-status-label { font-size: 13px; color: #64748b; }
.detail-status-badge { font-size: 12px; font-weight: 700; border-radius: 999px; padding: 3px 12px; }
.badge-paid { background: #dcfce7; color: #15803d; }
.badge-partial { background: #e0e7ff; color: #3730a3; }
.badge-pending { background: #e0e7ff; color: #4338ca; }
.badge-unpaid { background: #fef3c7; color: #b45309; }

/* Sections */
.detail-section {
  background: #fff; border-radius: 16px; padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}
.detail-section-header {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 700; color: #1e293b;
  margin-bottom: 12px;
}
.message-textarea { border-radius: 10px !important; border-color: #e2e8f0 !important; font-size: 14px; resize: none; }

/* Upload zone */
.upload-zone {
  position: relative;
  border: 2px dashed #cbd5e1; border-radius: 14px; padding: 28px 16px;
  text-align: center; cursor: pointer;
  transition: border-color 0.18s, background 0.18s;
  background: #f8fafc;
}
.upload-zone:hover, .upload-zone--active { border-color: #3b82f6; background: #eff6ff; }
.upload-zone--has-file { border-color: #22c55e; background: #f0fdf4; }
.upload-icon-wrap {
  width: 56px; height: 56px;
  background: linear-gradient(135deg, #dbeafe, #e0e7ff);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 12px;
}
.upload-icon { font-size: 26px; color: #3b82f6; }
.upload-text { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 4px; }
.upload-hint { font-size: 12px; color: #94a3b8; }
.upload-note { font-size: 11px; color: #94a3b8; margin-top: 6px; font-style: italic; }
.upload-note-file { font-size: 11px; color: #94a3b8; font-style: italic; margin-bottom: 6px; }
/* Overlay แทน display:none เพื่อให้ file picker ทำงานบน mobile (iOS Safari ฯลฯ) */
.file-input-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}
.file-input-overlay--disabled {
  pointer-events: none;
  cursor: default;
}
.upload-preview { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.slip-preview-img { width: 100px; height: 100px; object-fit: cover; border-radius: 10px; border: 2px solid #bbf7d0; }
.slip-filename { font-size: 12px; color: #475569; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Uploaded slip preview styles */
.uploaded-slip-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.slip-preview-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
  cursor: pointer;
}
.uploaded-slip-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
}
.slip-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}
.slip-preview-container:hover .slip-overlay {
  opacity: 1;
}
.preview-icon {
  font-size: 24px;
  color: white;
  margin-bottom: 4px;
}
.preview-text {
  font-size: 12px;
  color: white;
  text-align: center;
  font-weight: 500;
}
.slip-info {
  text-align: center;
}
.slip-status {
  font-size: 14px;
  font-weight: 600;
  color: #059669;
  margin-bottom: 4px;
}
.slip-note {
  font-size: 12px;
  color: #6b7280;
}

/* Image Modal Styles */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.image-modal-container {
  background: white;
  border-radius: 16px;
  max-width: 90vw;
  max-height: 90vh;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.image-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.modal-close-btn {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 16px;
}

.modal-close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.image-modal-content {
  position: relative;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: #f3f4f6;
}

.modal-image {
  max-width: 100%;
  max-height: 70vh;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  object-fit: contain;
  animation: imageZoomIn 0.3s ease-out;
}

.image-loading,
.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  font-size: 14px;
}

.loading-icon {
  font-size: 24px;
  color: #3b82f6;
  animation: spin 1s linear infinite;
}

.error-icon {
  font-size: 24px;
  color: #ef4444;
}

/* Modal Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from {
  opacity: 0;
}

.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .image-modal-container,
.modal-fade-enter-active .sku-modal-container {
  animation: modalSlideIn 0.3s ease-out;
}

.modal-fade-leave-active .image-modal-container,
.modal-fade-leave-active .sku-modal-container {
  animation: modalSlideOut 0.3s ease-in;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modalSlideOut {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
}

@keyframes imageZoomIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .image-modal-overlay {
    padding: 10px;
  }
  
  .image-modal-container {
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 12px;
  }
  
  .image-modal-header {
    padding: 12px 16px;
  }
  
  .modal-title {
    font-size: 14px;
  }
  
  .image-modal-content {
    padding: 16px;
    min-height: 150px;
  }
  
  .modal-image {
    max-height: 60vh;
  }
}

.submit-btn-inline {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  width: 100% !important;
  height: 52px !important;
  border-radius: 14px !important;
  font-size: 15px !important;
  font-weight: 700 !important;
  background: linear-gradient(90deg, #1d4ed8, #3b82f6) !important;
  border: none !important;
  box-shadow: 0 4px 20px rgba(29, 78, 216, 0.35) !important;
  margin-top: 12px;
}
.submit-btn-inline:hover { opacity: 0.92 !important; }

/* SKU Preview Styles */
.sku-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}

.sku-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #0369a1;
}

.sku-variant {
  color: #0c4a6e;
}

.sku-quantity {
  color: #0ea5e9;
  font-weight: 700;
}

.more-skus {
  font-size: 10px;
  color: #6b7280;
  font-weight: 500;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 8px;
}

/* Card Hover Effect - REMOVED */
.item-card {
  position: relative;
  transition: all 0.2s ease;
}

.click-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.click-hint:hover {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border-color: #cbd5e1;
  color: #475569;
}

/* SKU Modal Styles */
.sku-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.sku-modal-container {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.sku-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-bottom: 1px solid #e2e8f0;
}

.sku-modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.title-icon {
  color: #3b82f6;
  font-size: 20px;
}

.sku-modal-content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* SKU Display Styles */
.sku-display {
  position: relative;
}

/* Carousel Container */
.sku-carousel-container {
  position: relative;
  margin-bottom: 24px;
}

.sku-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

/* SKU Slider Animation Styles */
.sku-slider-container {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 16px;
}

.sku-slider-wrapper {
  display: flex;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.sku-slide-item {
  min-width: 100%;
  flex-shrink: 0;
  padding: 0 8px;
}

.sku-slide-item .sku-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.sku-slide-item .sku-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

/* Enhanced navigation button animations */
.carousel-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.carousel-nav-btn:hover:not(:disabled) {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.carousel-nav-btn:active:not(:disabled) {
  transform: translateY(-50%) scale(0.95);
}

.carousel-nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: translateY(-50%);
}

.prev-btn {
  left: -20px;
}

.next-btn {
  right: -20px;
}

/* Enhanced indicator animations */
.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  background: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.indicator-dot:hover {
  border-color: #3b82f6;
  transform: scale(1.2);
}

.indicator-dot.active {
  background: #3b82f6;
  border-color: #3b82f6;
  transform: scale(1.3);
}

.indicator-dot.active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  animation: indicatorPulse 2s infinite;
}

@keyframes indicatorPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.sku-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.sku-list-header {
  margin-bottom: 16px;
}

.sku-list-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.sku-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #fafbfc, #f8fafc);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.sku-item:hover {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border-color: #cbd5e1;
  transform: translateX(4px);
}

.sku-field-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.sku-variant-name {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.sku-quantity-badge {
  display: inline-flex;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1d4ed8;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid #93c5fd;
}

.sku-price-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sku-price {
  font-size: 16px;
  font-weight: 700;
  color: #059669;
}

.sku-currency {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.sku-summary {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.summary-row:not(:last-child) {
  /* border-bottom: 1px solid #e2e8f0; */
}

.summary-row.total {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 2px solid #cbd5e1;
}

.summary-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.summary-value {
  font-size: 15px;
  color: #374151;
  font-weight: 600;
}

.summary-row.total .summary-label {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.summary-row.total .summary-value {
  font-size: 18px;
  font-weight: 800;
  color: #059669;
}
</style>
