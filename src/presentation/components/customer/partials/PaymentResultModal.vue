<template>
  <Teleport to="body">
    <Transition name="modal-fade" appear>
      <div v-if="visible" class="payment-modal-overlay" @click="closeModal">
        <div class="payment-modal-container" @click.stop>
          <!-- Success Modal -->
          <div v-if="type === 'success'" class="payment-modal payment-modal--success">
            <div class="modal-icon-wrapper">
              <div class="success-icon">
                <CheckOutlined />
              </div>
              <div class="icon-pulse"></div>
            </div>
            
            <h3 class="modal-title">{{ $t('customer.paymentModal.successTitle') }}</h3>
            <p class="modal-message">{{ $t('customer.paymentModal.successMessage') }}</p>
            <p class="modal-submessage">{{ $t('customer.paymentModal.successSubMessage') }}</p>
            
            <div class="modal-actions">
              <button class="modal-btn modal-btn--primary" @click="closeModal">
                {{ $t('customer.paymentModal.successBtn') }}
              </button>
            </div>
          </div>

          <!-- Error Modal -->
          <div v-else-if="type === 'error'" class="payment-modal payment-modal--error">
            <div class="modal-icon-wrapper">
              <div class="error-icon">
                <CloseOutlined />
              </div>
              <div class="error-shake"></div>
            </div>
            
            <h3 class="modal-title">{{ $t('customer.paymentModal.errorTitle') }}</h3>
            <p class="modal-message">{{ $t('customer.paymentModal.errorMessage') }}</p>
            <p class="modal-submessage">{{ $t('customer.paymentModal.errorSubMessage') }}</p>
            
            <div class="modal-actions">
              <button class="modal-btn modal-btn--secondary" @click="closeModal">
                {{ $t('customer.paymentModal.errorBtn') }}
              </button>
              <button class="modal-btn modal-btn--primary" @click="retryAction">
                {{ $t('customer.paymentModal.retryBtn') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons-vue';

const props = defineProps<{
  visible: boolean;
  type: 'success' | 'error';
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'retry'): void;
}>();

const closeModal = () => {
  emit('close');
};

const retryAction = () => {
  emit('retry');
};

// Handle ESC key
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.visible) {
    closeModal();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscKey);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey);
});
</script>

<style scoped>
.payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.payment-modal-container {
  position: relative;
  max-width: 400px;
  width: 100%;
}

.payment-modal {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.1, 0.64, 1);
}

.modal-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.success-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
  animation: successBounce 0.6s ease-out;
  position: relative;
  z-index: 2;
}

.error-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
  animation: errorShake 0.6s ease-out;
  position: relative;
  z-index: 2;
}

.icon-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  background: rgba(16, 185, 129, 0.2);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.error-shake {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  background: rgba(239, 68, 68, 0.2);
  border-radius: 50%;
  animation: errorPulse 2s infinite;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.75rem;
  letter-spacing: -0.025em;
}

.modal-message {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.modal-submessage {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-bottom: 2rem;
  line-height: 1.4;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.modal-btn--primary {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.modal-btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.modal-btn--secondary {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.modal-btn--secondary:hover {
  background: #e5e7eb;
  color: #4b5563;
}

/* Animations */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes successBounce {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes errorShake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-4px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(4px);
  }
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
}

@keyframes errorPulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
}

/* Modal fade transition */
.modal-fade-enter-active {
  transition: opacity 0.3s ease;
}

.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 480px) {
  .payment-modal {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .modal-title {
    font-size: 1.25rem;
  }
  
  .success-icon,
  .error-icon {
    width: 56px;
    height: 56px;
    font-size: 24px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-btn {
    width: 100%;
  }
}
</style>
