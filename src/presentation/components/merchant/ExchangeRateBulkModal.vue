<template>
  <a-modal
    v-model:open="isOpen"
    :title="null"
    :footer="null"
    :closable="false"
    :mask-closable="false"
    :width="modalWidth"
    class="bulk-rate-modal"
    centered
  >
    <!-- Modal Header (คงที่ ไม่ scroll) -->
    <div class="modal-head">
      <div class="modal-icon"><SwapOutlined /></div>
      <div class="modal-head-text">
        <div class="modal-title">{{ $t('merchant.exchangeRates.bulkModal.title') }}</div>
        <div class="modal-subtitle">
          <!-- subtitle แสดงตามฟอร์มที่เหลือ -->
          <template v-if="mode === 'sell-only'">
            {{ $t('merchant.exchangeRates.bulkModal.subtitleSellOnly') }}
          </template>
          <template v-else-if="mode === 'buy-only'">
            {{ $t('merchant.exchangeRates.bulkModal.subtitleBuyOnly') }}
          </template>
          <template v-else>
            {{ $t('merchant.exchangeRates.bulkModal.subtitle') }}
          </template>
        </div>
      </div>
    </div>

    <!-- Scrollable area: forms + footer -->
    <div class="modal-scroll-body">

    <!-- Forms grid — แสดงฟอร์มตาม mode -->
    <div class="forms-grid">

      <!-- BUY form (แสดงเมื่อ mode = 'both' หรือ 'buy-only') -->
      <div v-if="showBuy" class="form-card buy-card">
        <div class="form-card-label buy-label">
          <span class="dot buy-dot"></span>
          {{ $t('merchant.exchangeRates.bulkModal.buyFormTitle') }}
        </div>
        <a-form ref="buyFormRef" :model="buyForm" layout="vertical" class="rate-form">
          <a-form-item
            :label="$t('merchant.exchangeRates.bulkModal.baseCurrency')"
            name="baseCurrency"
            :rules="[{ required: true, message: $t('merchant.exchangeRates.bulkModal.baseCurrencyRequired') }]"
          >
            <a-input
              v-model:value="buyForm.baseCurrency"
              :placeholder="$t('merchant.exchangeRates.bulkModal.baseCurrencyPlaceholder')"
              size="large"
              style="text-transform:uppercase"
              @input="buyForm.baseCurrency = buyForm.baseCurrency.toUpperCase()"
            />
          </a-form-item>
          <a-form-item
            :label="$t('merchant.exchangeRates.bulkModal.targetCurrency')"
            name="targetCurrency"
            :rules="[{ required: true, message: $t('merchant.exchangeRates.bulkModal.targetCurrencyRequired') }]"
          >
            <a-input
              v-model:value="buyForm.targetCurrency"
              :placeholder="$t('merchant.exchangeRates.bulkModal.targetCurrencyPlaceholder')"
              size="large"
              @input="buyForm.targetCurrency = buyForm.targetCurrency.toUpperCase()"
            />
          </a-form-item>
          <a-form-item
            :label="$t('merchant.exchangeRates.bulkModal.rate')"
            name="rate"
            :rules="[{ required: true, message: $t('merchant.exchangeRates.bulkModal.rateRequired') }]"
          >
            <a-input-number
              v-model:value="buyForm.rate"
              :placeholder="$t('merchant.exchangeRates.bulkModal.ratePlaceholder')"
              :min="0"
              :precision="4"
              size="large"
              style="width:100%"
            />
          </a-form-item>
        </a-form>
      </div>

      <!-- Divider (แสดงเฉพาะเมื่อมีทั้ง 2 ฟอร์ม) -->
      <div v-if="showBuy && showSell" class="form-divider">
        <div class="divider-line"></div>
        <div class="divider-icon"><SwapOutlined /></div>
        <div class="divider-line"></div>
      </div>

      <!-- SELL form (แสดงเมื่อ mode = 'both' หรือ 'sell-only') -->
      <div v-if="showSell" class="form-card sell-card">
        <div class="form-card-label sell-label">
          <span class="dot sell-dot"></span>
          {{ $t('merchant.exchangeRates.bulkModal.sellFormTitle') }}
        </div>
        <a-form ref="sellFormRef" :model="sellForm" layout="vertical" class="rate-form">
          <a-form-item
            :label="$t('merchant.exchangeRates.bulkModal.baseCurrency')"
            name="baseCurrency"
            :rules="[{ required: true, message: $t('merchant.exchangeRates.bulkModal.baseCurrencyRequired') }]"
          >
            <a-input
              v-model:value="sellForm.baseCurrency"
              :placeholder="$t('merchant.exchangeRates.bulkModal.baseCurrencyPlaceholder')"
              size="large"
              style="text-transform:uppercase"
              @input="sellForm.baseCurrency = sellForm.baseCurrency.toUpperCase()"
            />
          </a-form-item>
          <a-form-item
            :label="$t('merchant.exchangeRates.bulkModal.targetCurrency')"
            name="targetCurrency"
            :rules="[{ required: true, message: $t('merchant.exchangeRates.bulkModal.targetCurrencyRequired') }]"
          >
            <a-input
              v-model:value="sellForm.targetCurrency"
              :placeholder="$t('merchant.exchangeRates.bulkModal.targetCurrencyPlaceholder')"
              size="large"
              @input="sellForm.targetCurrency = sellForm.targetCurrency.toUpperCase()"
            />
          </a-form-item>
          <a-form-item
            :label="$t('merchant.exchangeRates.bulkModal.rate')"
            name="rate"
            :rules="[{ required: true, message: $t('merchant.exchangeRates.bulkModal.rateRequired') }]"
          >
            <a-input-number
              v-model:value="sellForm.rate"
              :placeholder="$t('merchant.exchangeRates.bulkModal.ratePlaceholder')"
              :min="0"
              :precision="4"
              size="large"
              style="width:100%"
            />
          </a-form-item>
        </a-form>
      </div>
    </div>

    <!-- Footer actions -->
    <div class="modal-footer">
      <a-button class="skip-btn" @click="handleSkip">
        {{ $t('merchant.exchangeRates.bulkModal.skipText') }}
      </a-button>
      <a-button type="primary" class="submit-btn" :loading="loading" @click="handleSubmit">
        <template #icon><CheckOutlined /></template>
        {{ $t('merchant.exchangeRates.bulkModal.submit') }}
      </a-button>
    </div>

    </div><!-- end modal-scroll-body -->
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import type { FormInstance } from 'ant-design-vue';
import { SwapOutlined, CheckOutlined } from '@ant-design/icons-vue';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import { useMerchantExchangeRates } from '@/presentation/composables/merchant/useMerchantExchangeRates';

/** mode กำหนดว่าจะแสดงฟอร์มไหน */
type ModalMode = 'both' | 'buy-only' | 'sell-only';

const emit = defineEmits<{ (e: 'submitted'): void; (e: 'skipped'): void }>();

const { isMobile } = useIsMobile();
const { loading, createBulkRates } = useMerchantExchangeRates();

const isOpen = ref(false);
const mode = ref<ModalMode>('both');

const buyFormRef = ref<FormInstance>();
const sellFormRef = ref<FormInstance>();

const buyForm = reactive({ baseCurrency: '', targetCurrency: 'LAK', rate: null as number | null });
const sellForm = reactive({ baseCurrency: '', targetCurrency: 'LAK', rate: null as number | null });

/* ฟอร์มไหนถูกแสดง */
const showBuy = computed(() => mode.value === 'both' || mode.value === 'buy-only');
const showSell = computed(() => mode.value === 'both' || mode.value === 'sell-only');

/* ปรับขนาด modal — single form แคบกว่า */
const modalWidth = computed(() => {
  if (isMobile.value) return '95vw';
  return mode.value === 'both' ? 780 : 440;
});

const resetForms = () => {
  buyForm.baseCurrency = '';
  buyForm.targetCurrency = 'LAK';
  buyForm.rate = null;
  sellForm.baseCurrency = '';
  sellForm.targetCurrency = 'LAK';
  sellForm.rate = null;
  buyFormRef.value?.clearValidate();
  sellFormRef.value?.clearValidate();
};

/**
 * เปิด modal และกำหนด mode ว่าจะแสดงฟอร์มไหน
 * @param openMode - 'both' | 'buy-only' | 'sell-only'
 */
const open = (openMode: ModalMode = 'both') => {
  mode.value = openMode;
  resetForms();
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
};

const handleSkip = () => {
  close();
  emit('skipped');
};

const handleSubmit = async () => {
  try {
    const validations: Promise<unknown>[] = [];
    if (showBuy.value && buyFormRef.value) validations.push(buyFormRef.value.validate());
    if (showSell.value && sellFormRef.value) validations.push(sellFormRef.value.validate());
    await Promise.all(validations);
  } catch {
    return;
  }

  const items: { baseCurrency: string; targetCurrency: string; rateType: 'BUY' | 'SELL'; rate: number }[] = [];
  if (showBuy.value) {
    items.push({ baseCurrency: buyForm.baseCurrency, targetCurrency: buyForm.targetCurrency, rateType: 'BUY', rate: buyForm.rate! });
  }
  if (showSell.value) {
    items.push({ baseCurrency: sellForm.baseCurrency, targetCurrency: sellForm.targetCurrency, rateType: 'SELL', rate: sellForm.rate! });
  }

  const ok = await createBulkRates(items);
  if (ok) {
    close();
    emit('submitted');
  }
};

defineExpose({ open, close });
</script>

<style scoped>
:deep(.bulk-rate-modal .ant-modal-content) {
  border-radius: 20px;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
:deep(.bulk-rate-modal .ant-modal-body) {
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Scrollable inner body — ส่วน forms + footer scroll บน mobile */
.modal-scroll-body {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 767px) {
  :deep(.bulk-rate-modal .ant-modal-content) {
    max-height: 92dvh;
    max-height: 92vh;
  }
  .modal-scroll-body {
    max-height: calc(92dvh - 80px); /* หักความสูง header */
    max-height: calc(92vh - 80px);
  }
}

/* Header */
.modal-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 24px 28px 20px;
  /* background: linear-gradient(135deg, #416bde 0%, #8580e4 100%); */
  color: #fff;
  background: #357df1;
  border-radius: 12px;
}
.modal-icon {
  font-size: 28px;
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.modal-title { font-size: 18px; font-weight: 700; line-height: 1.25; }
.modal-subtitle { font-size: 13px; opacity: 0.85; margin-top: 2px; }

/* Forms grid */
.forms-grid {
  display: flex;
  align-items: flex-start;
  gap: 0;
  padding: 24px 28px 0;
}

.form-card {
  flex: 1;
  min-width: 0;
  background: #f8fafc;
  border-radius: 14px;
  padding: 16px;
  border: 2px solid transparent;
}
.buy-card { border-color: #d1fae5; background: #f0fdf4; }
.sell-card { border-color: #fee2e2; background: #fff5f5; }

.form-card-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 14px;
}
.buy-label { color: #15803d; }
.sell-label { color: #b91c1c; }

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.buy-dot { background: #16a34a; }
.sell-dot { background: #dc2626; }

/* Divider between forms */
.form-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  padding-top: 50px;
  gap: 6px;
  flex-shrink: 0;
}
.divider-line { width: 1px; height: 40px; background: #e2e8f0; }
.divider-icon { color: #94a3b8; font-size: 16px; }

.rate-form :deep(.ant-form-item) { margin-bottom: 12px; }
.rate-form :deep(.ant-form-item-label > label) {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

/* Footer */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 28px 24px;
  border-top: 1px solid #f1f5f9;
  margin-top: 20px;
}
.skip-btn { border-radius: 10px; color: #64748b; }
.submit-btn { border-radius: 10px; height: 40px; font-weight: 700; padding: 0 24px; }

@media (max-width: 767px) {
  .modal-head { padding: 20px 18px 16px; }
  .modal-icon { width: 42px; height: 42px; font-size: 20px; }
  .modal-title { font-size: 15px; }

  .forms-grid {
    flex-direction: column;
    padding: 16px 18px 0;
    gap: 12px;
  }
  .form-divider {
    flex-direction: row;
    padding: 0;
    justify-content: center;
    width: 100%;
  }
  .divider-line { width: 40px; height: 1px; }
  .divider-icon { font-size: 14px; }

  .modal-footer { padding: 16px 18px 20px; }
  .submit-btn { flex: 1; }
}
</style>
