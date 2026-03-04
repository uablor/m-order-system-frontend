<template>
  <div class="phone-input-wrap">
    <a-select
      v-model:value="countryCode"
      class="country-select"
      @change="emitValue"
    >
      <a-select-option v-for="opt in countryOptions" :key="opt.code" :value="opt.code">
        {{ opt.label }}
      </a-select-option>
    </a-select>
    <a-input
      v-model:value="localNumber"
      class="number-input"
      :placeholder="placeholder"
      inputmode="numeric"
      :maxlength="10"
      @input="onNumberInput"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

const COUNTRY_OPTIONS = [
  { code: '+856', label: '+856 (Laos)' },
  { code: '+66', label: '+66 (Thailand)' },
  { code: '+86', label: '+86 (China)' },
];

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
  }>(),
  {
    modelValue: '',
    placeholder: '20 89 48 48 48',
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

/** แยกค่าเต็มเป็น countryCode + number */
function parseFullValue(val: string): { code: string; number: string } {
  if (!val || typeof val !== 'string') return { code: '+856', number: '' };
  const trimmed = val.trim();
  if (!trimmed) return { code: '+856', number: '' };
  if (trimmed.startsWith('+856')) return { code: '+856', number: trimmed.slice(4).replace(/\D/g, '').slice(0, 10) };
  if (trimmed.startsWith('+66')) return { code: '+66', number: trimmed.slice(3).replace(/\D/g, '').slice(0, 10) };
  if (trimmed.startsWith('+86')) return { code: '+86', number: trimmed.slice(3).replace(/\D/g, '').slice(0, 10) };
  return { code: '+856', number: trimmed.replace(/\D/g, '').slice(0, 10) };
}

const countryCode = ref(parseFullValue(props.modelValue).code);
const localNumber = ref(parseFullValue(props.modelValue).number);

const countryOptions = computed(() => COUNTRY_OPTIONS);

watch(
  () => props.modelValue,
  (val) => {
    const { code, number } = parseFullValue(val);
    countryCode.value = code;
    localNumber.value = number;
  }
);

function onNumberInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value;
  localNumber.value = raw.replace(/\D/g, '').slice(0, 10);
  emitValue();
}

function emitValue() {
  const num = localNumber.value.replace(/\D/g, '').slice(0, 10);
  const full = num ? `${countryCode.value}${num}` : '';
  emit('update:modelValue', full);
}
</script>

<style scoped>
.phone-input-wrap {
  display: flex;
  gap: 8px;
  align-items: stretch;
}
.country-select {
  width: 120px !important;
  flex-shrink: 0;
}
.country-select :deep(.ant-select-selector) {
  border-radius: 8px !important;
}
.number-input {
  flex: 1;
  min-width: 0;
}
.number-input :deep(.ant-input) {
  border-radius: 8px !important;
}
</style>
