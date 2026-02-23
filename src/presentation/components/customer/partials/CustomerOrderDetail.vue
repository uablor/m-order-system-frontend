<template>
  <!-- Mobile: full-screen overlay via Teleport -->
  <Teleport v-if="isMobile" to="body">
    <Transition name="slide-in">
      <div v-if="order" class="detail-panel detail-panel--mobile">
        <div class="detail-header">
          <button class="back-btn" @click="$emit('close')">
            <ArrowLeftOutlined />
          </button>
          <div class="detail-title">{{ $t('customer.detail.title') }}</div>
          <button class="more-btn"><EllipsisOutlined /></button>
        </div>
        <div class="detail-scroll">
          <DetailBody
            :order="order"
            :message="message"
            :slip-file="slipFile"
            :slip-preview="slipPreview"
            :is-dragging="isDragging"
            :submitting="submitting"
            :is-mobile="true"
            @update:message="message = $event"
            @trigger-file="triggerFile"
            @file-change="handleFileChange"
            @drop="handleDrop"
            @drag-over="isDragging = true"
            @drag-leave="isDragging = false"
            @remove-slip="removeSlip"
            @submit="handleSubmit"
          />
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Desktop: inline panel -->
  <Transition v-if="!isMobile" name="fade">
    <div v-if="order" class="detail-panel">
      <div class="detail-scroll">
        <DetailBody
          :order="order"
          :message="message"
          :slip-file="slipFile"
          :slip-preview="slipPreview"
          :is-dragging="isDragging"
          :submitting="submitting"
          :is-mobile="false"
          @update:message="message = $event"
          @trigger-file="triggerFile"
          @file-change="handleFileChange"
          @drop="handleDrop"
          @drag-over="isDragging = true"
          @drag-leave="isDragging = false"
          @remove-slip="removeSlip"
          @submit="handleSubmit"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message as antMessage } from 'ant-design-vue';
import { ArrowLeftOutlined, EllipsisOutlined } from '@ant-design/icons-vue';
import DetailBody from './CustomerOrderDetailBody.vue';
import type { CustomerOrder } from '@/infrastructure/repositories/customer-order.repository';

const DEMO_PROOF_URL = 'thisisthetextfordemothisurlimage';

const props = defineProps<{
  order: CustomerOrder | null;
  isMobile: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submitted'): void;
}>();

const { t } = useI18n();

const message = ref('');
const slipFile = ref<File | null>(null);
const slipPreview = ref('');
const isDragging = ref(false);
const submitting = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

watch(() => props.order?.id, () => {
  message.value = '';
  slipFile.value = null;
  slipPreview.value = '';
  isDragging.value = false;
});

const triggerFile = (input: HTMLInputElement | null) => {
  if (input) fileInputRef.value = input;
  fileInputRef.value?.click();
};

const setFile = (file: File) => {
  if (!file.type.match(/image\/(jpeg|png)/)) {
    antMessage.error(t('customer.toast.fileTypeError'));
    return;
  }
  slipFile.value = file;
  slipPreview.value = URL.createObjectURL(file);
};

const handleFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) setFile(file);
};

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) setFile(file);
};

const removeSlip = () => {
  slipFile.value = null;
  slipPreview.value = '';
  if (fileInputRef.value) fileInputRef.value.value = '';
};

const handleSubmit = async () => {
  if (!props.order) return;
  submitting.value = true;
  try {
    const { ApiClient } = await import('@/infrastructure/apis/api');
    const { API_ENDPOINTS } = await import('@/shared/constants/api-endpoints');
    const client = new ApiClient();
    await client.post(API_ENDPOINTS.PAYMENTS.CREATE, {
      customerOrderId: props.order.id,
      paymentAmount: parseFloat(props.order.remainingAmount) || 0,
      paymentProofUrl: DEMO_PROOF_URL,
      customerMessage: message.value.trim() || undefined,
    });
    antMessage.success(t('customer.toast.submitSuccess'));
    emit('submitted');
  } catch {
    antMessage.error(t('customer.toast.submitError'));
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.detail-panel {
  background: #f5f7fa;
  min-height: 100%;
  padding-bottom: 32px;
}
.detail-panel--mobile {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: #f5f7fa;
  height: 100dvh;
  display: flex;
  flex-direction: column;
}
.detail-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 16px 12px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}
.back-btn, .more-btn {
  background: none; border: none; cursor: pointer;
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; color: #374151;
  transition: background 0.15s;
}
.back-btn:hover, .more-btn:hover { background: #f1f5f9; }
.detail-title { font-size: 16px; font-weight: 700; color: #0f172a; }
.detail-scroll { padding: 16px; }
.detail-panel--mobile .detail-scroll { flex: 1; overflow-y: auto; }

.slide-in-enter-active { transition: transform 0.28s cubic-bezier(0.34, 1.1, 0.64, 1); }
.slide-in-leave-active { transition: transform 0.22s ease-in; }
.slide-in-enter-from, .slide-in-leave-to { transform: translateX(100%); }
.fade-enter-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.fade-leave-active { transition: opacity 0.16s ease; }
.fade-enter-from { opacity: 0; transform: translateY(10px); }
.fade-leave-to { opacity: 0; }
</style>
