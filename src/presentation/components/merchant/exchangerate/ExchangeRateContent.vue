<template>
  <div class="exchange-rate-page">
    <a-breadcrumb class="mb-3">
      <a-breadcrumb-item>{{ $t('merchant.breadcrumbs.home') }}</a-breadcrumb-item>
      <a-breadcrumb-item>{{ $t('merchant.exchangeRates.breadcrumb') }}</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-header">
      <div class="title-block">
        <div class="page-title">{{ $t('merchant.exchangeRates.title') }}</div>
        <div class="page-subtitle">{{ $t('merchant.exchangeRates.subtitle') }}</div>
      </div>
      <a-button
        v-if="showFilterToggle"
        type="default"
        class="filter-toggle-btn"
        :class="{ active: showFilters }"
        @click="showFilters = !showFilters"
      >
        <FilterOutlined />
      </a-button>
      <a-button type="primary" class="add-btn" @click="showForm = !showForm">
        <template #icon><PlusOutlined /></template>
        {{ $t('merchant.exchangeRates.addButton') }}
      </a-button>
    </div>

    <!-- Create Form -->
    <Transition name="form-slide">
      <a-card v-if="showForm" :bordered="false" class="form-card">
        <div class="form-card-title">{{ $t('merchant.exchangeRates.form.title') }}</div>
        <a-form ref="formRef" :model="form" layout="vertical" @finish="handleSubmit">
          <a-row :gutter="[16, 0]">
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-item :label="$t('merchant.exchangeRates.form.baseCurrency')" name="baseCurrency"
                :rules="[{ required: true, message: $t('merchant.exchangeRates.form.baseCurrencyRequired') }]">
                <a-auto-complete
                  v-model:value="form.baseCurrency"
                  :options="filterCurrencies(form.baseCurrency)"
                  :placeholder="$t('merchant.exchangeRates.form.baseCurrencyPlaceholder')"
                  class="currency-ac"
                  :filter-option="false"
                  @change="(v: string) => form.baseCurrency = (v || '').toUpperCase()"
                />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-item :label="$t('merchant.exchangeRates.form.targetCurrency')" name="targetCurrency"
                :rules="[{ required: true, message: $t('merchant.exchangeRates.form.targetCurrencyRequired') }]">
                <a-auto-complete
                  v-model:value="form.targetCurrency"
                  :options="filterCurrencies(form.targetCurrency)"
                  :placeholder="$t('merchant.exchangeRates.form.targetCurrencyPlaceholder')"
                  class="currency-ac"
                  :filter-option="false"
                  @change="(v: string) => form.targetCurrency = (v || '').toUpperCase()"
                />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="4">
              <a-form-item :label="$t('merchant.exchangeRates.form.rateType')" name="rateType">
                <a-select v-model:value="form.rateType" style="width:100%">
                  <a-select-option value="BUY">
                    <a-tag color="green" class="type-tag">{{ $t('merchant.exchangeRates.typeBuy') }}</a-tag>
                  </a-select-option>
                  <a-select-option value="SELL">
                    <a-tag color="volcano" class="type-tag">{{ $t('merchant.exchangeRates.typeSell') }}</a-tag>
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="8">
              <a-form-item :label="$t('merchant.exchangeRates.form.rate')" name="rate"
                :rules="[{ required: true, message: $t('merchant.exchangeRates.form.rateRequired') }]">
                <a-input-number
                  v-model:value="form.rate"
                  :placeholder="$t('merchant.exchangeRates.form.ratePlaceholder')"
                  :min="0"
                  :precision="4"
                  :formatter="numFormatter"
                  :parser="numParser"
                  style="width:100%"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <div class="form-actions">
            <a-button @click="resetForm">{{ $t('merchant.exchangeRates.form.cancel') }}</a-button>
            <a-button type="primary" html-type="submit" :loading="loading">{{ $t('merchant.exchangeRates.form.submit') }}</a-button>
          </div>
        </a-form>
      </a-card>
    </Transition>

    <!-- ===== FILTER CARD ===== -->
    <a-card :bordered="false" class="filter-card">

      <!-- Row 1: BUY / SELL / ALL Buttons — เสมอแสดง ไม่ซ่อนบน mobile -->
      <div class="filter-type-row">
        <div class="type-btn-group">
          <button
            class="type-btn"
            :class="{ 'type-btn--active': filters.rateType === '' }"
            @click="setRateType('')"
          >{{ $t('merchant.exchangeRates.filterAll') }}</button>
          <button
            class="type-btn type-btn--buy"
            :class="{ 'type-btn--active': filters.rateType === 'BUY' }"
            @click="setRateType('BUY')"
          >{{ $t('merchant.exchangeRates.filterBuy') }}</button>
          <button
            class="type-btn type-btn--sell"
            :class="{ 'type-btn--active': filters.rateType === 'SELL' }"
            @click="setRateType('SELL')"
          >{{ $t('merchant.exchangeRates.filterSell') }}</button>
        </div>
      </div>

      <!-- Row 2 & 3: ซ่อนบน mobile/tablet จนกว่าจะกดปุ่ม filter -->
      <Transition name="filter-panel">
        <div v-if="!showFilterToggle || showFilters" class="filter-rows-wrap">
      <!-- Row 2: Search Field + Search Input -->
      <a-row :gutter="[10, 10]" class="filter-row">
        <a-col :xs="24" :sm="8" :md="5">
          <a-select
            v-model:value="filters.searchField"
            allow-clear
            style="width:100%"
            :placeholder="$t('merchant.exchangeRates.filter.searchField')"
            @change="() => onFilterChange(filters.search?.length > 0)"
          >
            <a-select-option value="baseCurrency">{{ $t('merchant.exchangeRates.filter.sfBase') }}</a-select-option>
            <a-select-option value="targetCurrency">{{ $t('merchant.exchangeRates.filter.sfTarget') }}</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :sm="16" :md="8">
          <a-auto-complete
            v-model:value="filters.search"
            allow-clear
            :options="currencyOptions"
            :placeholder="filters.searchField
              ? $t('merchant.exchangeRates.filter.searchByField')
              : $t('merchant.exchangeRates.filter.searchPlaceholder')"
            @pressEnter="applyFilters"
            @change="onSearchChange"
            @select="onCurrencySelect"
            style="width: 100%"
          >
            <template #prefix><SearchOutlined /></template>
          </a-auto-complete>
        </a-col>
        <!-- Start Date -->
        <a-col :xs="12" :sm="6" :md="4">
          <a-date-picker
            v-model:value="startDate"
            style="width:100%"
            :placeholder="$t('merchant.exchangeRates.filter.startDate')"
            popup-class-name="single-panel-picker"
            @change="() => onFilterChange(true)"
          />
        </a-col>
        <!-- End Date -->
        <a-col :xs="12" :sm="6" :md="4">
          <a-date-picker
            v-model:value="endDate"
            style="width:100%"
            :placeholder="$t('merchant.exchangeRates.filter.endDate')"
            popup-class-name="single-panel-picker"
            @change="() => onFilterChange(true)"
          />
        </a-col>
      </a-row>

      <!-- Row 3: Advanced Filters -->
      <a-row :gutter="[10, 10]" class="filter-row filter-row--adv">
        <!-- <a-col :xs="12" :sm="6" :md="4"> -->
          <!-- Removed base currency filter -->
        <!-- </a-col> -->
        <!-- <a-col :xs="12" :sm="6" :md="4"> -->
          <!-- Removed target currency filter -->
        <!-- </a-col> -->
        <a-col :xs="12" :sm="6" :md="4">
          <a-select
            v-model:value="filters.isActive"
            allow-clear
            style="width:100%"
            :placeholder="$t('merchant.exchangeRates.filter.status')"
            @change="() => onFilterChange(true)"
          >
            <a-select-option :value="true">{{ $t('merchant.exchangeRates.active') }}</a-select-option>
            <a-select-option :value="false">{{ $t('merchant.exchangeRates.inactive') }}</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="12" :sm="6" :md="4">
          <a-select
            v-model:value="filters.sort"
            allow-clear
            style="width:100%"
            :placeholder="$t('merchant.exchangeRates.filter.sortDirection')"
            @change="() => onFilterChange(true)"
          >
            <a-select-option value="DESC">{{ $t('merchant.exchangeRates.filter.sortDesc') }}</a-select-option>
            <a-select-option value="ASC">{{ $t('merchant.exchangeRates.filter.sortAsc') }}</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="12" :sm="6" :md="4" class="filter-reset-col">
          <a-button @click="resetFilters">{{ $t('merchant.exchangeRates.filter.reset') }}</a-button>
        </a-col>
      </a-row>
        </div>
      </Transition>
    </a-card>

    <!-- Desktop/Tablet table -->
    <a-card v-if="!useMobileLayout" :bordered="false" class="panel-card">
      <a-table 
        :key="tableKey"
        :columns="columns" 
        :data-source="rates" 
        :pagination="paginationConfig" 
        row-key="id"
        :size="debouncedWindowWidth < 768 ? 'small' : 'middle'" 
        :loading="loading" 
        :scroll="{ 
          x: debouncedWindowWidth < 768 ? 400 : debouncedWindowWidth < 1200 ? 600 : 800,
          y: debouncedWindowWidth < 768 ? 300 : undefined 
        }" 
        :bordered="false"
        :show-header="true"
        @change="handleTableChange"
        class="responsive-table">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'rateType'">
            <a-tag :color="record.rateType === 'BUY' ? 'green' : 'volcano'" class="pill-tag">
              {{ record.rateType === 'BUY' ? $t('merchant.exchangeRates.typeBuy') : $t('merchant.exchangeRates.typeSell') }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'isActive'">
            <a-tag :color="record.isActive ? 'success' : 'default'" class="pill-tag">
              {{ record.isActive ? $t('merchant.exchangeRates.active') : $t('merchant.exchangeRates.inactive') }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'rate'">
            <span class="rate-val">{{ Number(record.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) }}</span>
          </template>
          <template v-else-if="column.key === 'pair'">
            <span class="currency-pair">{{ record.baseCurrency }} → {{ record.targetCurrency }}</span>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-popconfirm :title="$t('merchant.exchangeRates.confirmDelete')" @confirm="handleDelete(record.id)">
              <a-button type="link" danger size="small"><DeleteOutlined /></a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Mobile/Tablet card collapse list -->
    <div v-else class="rates-mobile">
      <a-collapse class="rates-collapse" :expand-icon="expandCollapseIcon">
        <a-collapse-panel v-for="r in rates" :key="r.id">
          <template #header>
            <div class="card-row">
              <div class="item-info">
                <div class="item-name">{{ r.baseCurrency }} → {{ r.targetCurrency }}</div>
                <div class="item-sub">{{ r.rateDate }}</div>
              </div>
              <div class="card-right">
                <a-tag :color="r.rateType === 'BUY' ? 'green' : 'volcano'" class="pill-tag">
                  {{ r.rateType === 'BUY' ? $t('merchant.exchangeRates.typeBuy') : $t('merchant.exchangeRates.typeSell') }}
                </a-tag>
              </div>
            </div>
          </template>
          <div class="card-detail">
            <div class="detail-row">
              <span class="detail-label">{{ $t('merchant.exchangeRates.table.rate') }}</span>
              <span class="detail-val rate-val">{{ Number(r.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ $t('merchant.exchangeRates.table.isActive') }}</span>
              <a-tag :color="r.isActive ? 'success' : 'default'" class="pill-tag">
                {{ r.isActive ? $t('merchant.exchangeRates.active') : $t('merchant.exchangeRates.inactive') }}
              </a-tag>
            </div>
            <div class="detail-row action-row">
              <a-popconfirm :title="$t('merchant.exchangeRates.confirmDelete')" @confirm="handleDelete(r.id)">
                <a-button type="link" danger size="small"><DeleteOutlined /> {{ $t('merchant.exchangeRates.filter.delete') }}</a-button>
              </a-popconfirm>
            </div>
          </div>
        </a-collapse-panel>
      </a-collapse>
      <div class="mobile-pagination">
        <a-pagination
          :current="currentPage"
          :page-size="pageSize"
          :total="pagination.total"
          size="small"
          simple
          @change="onMobilePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, onUnmounted, reactive, ref, watch, nextTick } from 'vue';
import type { FormInstance, TablePaginationConfig } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import { PlusOutlined, DownOutlined, SearchOutlined, DeleteOutlined, FilterOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import { useMerchantExchangeRates } from '@/presentation/composables/merchant/useMerchantExchangeRates';
import { numFormatter, numParser } from '@/shared/utils/format';

const CURRENCY_OPTIONS = ['CNY', 'USDT', 'LAK', 'THB', 'JPY', 'KRW'];
const filterCurrencies = (input: string) => {
  const q = (input || '').toUpperCase();
  const filtered = CURRENCY_OPTIONS.filter((c) => c.startsWith(q));
  return (filtered.length ? filtered : CURRENCY_OPTIONS).map((c) => ({ value: c }));
};

// Currency options for auto-complete
const currencyOptions = computed(() => {
  return CURRENCY_OPTIONS.map(currency => ({ 
    value: currency,
    label: currency
  }));
});

// Handle currency selection from dropdown
const onCurrencySelect = (value: string) => {
  filters.search = value;
  applyFilters();
};

// Custom dropdown state and methods
const showCurrencyDropdown = ref(false);
const dropdownPosition = ref({ top: 0, left: 0 });

const hideCurrencyDropdown = () => {
  setTimeout(() => {
    showCurrencyDropdown.value = false;
  }, 200);
};

const selectCurrency = (currency: string) => {
  filters.search = currency;
  showCurrencyDropdown.value = false;
  applyFilters();
};

const updateDropdownPosition = (event: FocusEvent) => {
  const target = event.target as HTMLElement;
  const rect = target.getBoundingClientRect();
  dropdownPosition.value = {
    top: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX
  };
};

const showDropdown = (event: FocusEvent) => {
  updateDropdownPosition(event);
  showCurrencyDropdown.value = true;
};

const { t } = useI18n();
const { windowWidth } = useIsMobile();
const { loading, rates, pagination, fetchRates, createRate, deleteRate } = useMerchantExchangeRates();

// Debounced responsive updates to prevent DOM manipulation errors
let resizeTimer: ReturnType<typeof setTimeout> | undefined;
const debouncedWindowWidth = ref(1280);
const tableKey = ref('table-1280-1');
const isUpdating = ref(false);

// More aggressive debouncing with update lock to prevent concurrent updates
watch(() => windowWidth.value, (newWidth) => {
  clearTimeout(resizeTimer);
  
  if (isUpdating.value) {
    console.warn('Skipping update - already updating');
    return;
  }
  
  resizeTimer = setTimeout(() => {
    isUpdating.value = true;
    
    // Use nextTick to ensure DOM is stable before updating
    nextTick(() => {
      try {
        debouncedWindowWidth.value = newWidth;
        tableKey.value = `table-${newWidth}-${currentPage.value}-${Date.now()}`;
      } finally {
        // Small delay before allowing next update
        setTimeout(() => {
          isUpdating.value = false;
        }, 50);
      }
    });
  }, 200); // Increased debounce time
}, { immediate: true });

// Fix for Ant Design Vue and Vue DOM manipulation errors
const originalRemoveChild = Node.prototype.removeChild;
const originalInsertBefore = Node.prototype.insertBefore;
const originalAppendChild = Node.prototype.appendChild;
const originalReplaceChild = Node.prototype.replaceChild;

// More robust DOM manipulation fixes with additional safety checks
Node.prototype.removeChild = function<T extends Node>(child: T): T {
  if (!this || !child) {
    console.warn('removeChild called with invalid arguments');
    return child;
  }
  if (!this.contains?.(child)) {
    console.warn('removeChild: child not found in parent');
    return child;
  }
  try {
    return originalRemoveChild.call(this, child) as T;
  } catch (error) {
    if (error instanceof DOMException && (error.name === 'NotFoundError' || error.name === 'TypeError')) {
      console.warn('removeChild error prevented:', error.message);
      return child;
    }
    throw error;
  }
};

Node.prototype.insertBefore = function<T extends Node>(newNode: T, referenceNode: Node | null): T {
  if (!this || !newNode) {
    console.warn('insertBefore called with invalid arguments');
    return newNode;
  }
  if (referenceNode && !this.contains?.(referenceNode)) {
    console.warn('insertBefore: reference node not found in parent, proceeding anyway');
  }
  try {
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  } catch (error) {
    if (error instanceof DOMException && (error.name === 'NotFoundError' || error.name === 'TypeError')) {
      console.warn('insertBefore error prevented:', error.message);
      return newNode;
    }
    throw error;
  }
};

Node.prototype.appendChild = function<T extends Node>(child: T): T {
  if (!this || !child) {
    console.warn('appendChild called with invalid arguments');
    return child;
  }
  try {
    return originalAppendChild.call(this, child) as T;
  } catch (error) {
    if (error instanceof DOMException && (error.name === 'NotFoundError' || error.name === 'TypeError')) {
      console.warn('appendChild error prevented:', error.message);
      return child;
    }
    throw error;
  }
};

(Node.prototype as any).replaceChild = function(newChild: Node, oldChild: Node): Node {
  if (!this || !newChild || !oldChild) {
    console.warn('replaceChild called with invalid arguments');
    return newChild;
  }
  try {
    return originalReplaceChild.call(this, newChild, oldChild);
  } catch (error) {
    if (error instanceof DOMException && (error.name === 'NotFoundError' || error.name === 'TypeError')) {
      console.warn('replaceChild error prevented:', error.message);
      return newChild;
    }
    throw error;
  }
};

// Additional fix for Vue's internal insert function
const originalInsert = (Element.prototype as any).insertBefore;
if (originalInsert) {
  (Element.prototype as any).insertBefore = function(newNode: Node, referenceNode: Node | null) {
    if (!this || !newNode) {
      console.warn('Element.insertBefore called with invalid arguments');
      return newNode;
    }
    try {
      return originalInsert.call(this, newNode, referenceNode);
    } catch (error) {
      if (error instanceof DOMException && (error.name === 'NotFoundError' || error.name === 'TypeError')) {
        console.warn('Element.insertBefore error prevented:', error.message);
        return newNode;
      }
      throw error;
    }
  };
}

/* แสดงปุ่ม filter เมื่อ width < 1200 (mobile + tablet รวม Galaxy Tab S7) */
const showFilterToggle = computed(() => (debouncedWindowWidth.value ?? 1280) < 1200);
/* ใช้ mobile card layout เมื่อ width < 768 (รองรับ Galaxy Tab S7 portrait ~800px ให้ใช้ table) */
const useMobileLayout = computed(() => (debouncedWindowWidth.value ?? 1280) < 768);

/* ───────── state ───────── */
const showForm = ref(false);
const showFilters = ref(false);
const formRef = ref<FormInstance>();

/* pagination managed in component so it stays in sync with filters */
const currentPage = ref(1);
const pageSize = ref(20);

/* all filter state lives here — no hidden panels */
const filters = reactive({
  search: '',
  searchField: '' as string,
  rateType: '' as 'BUY' | 'SELL' | '',
  baseCurrency: '',
  targetCurrency: '',
  isActive: undefined as boolean | undefined,
  sort: undefined as 'ASC' | 'DESC' | undefined,
});
const startDate = ref<Dayjs | null>(null);
const endDate = ref<Dayjs | null>(null);

const form = reactive({
  baseCurrency: '',
  targetCurrency: 'LAK',
  rateType: 'BUY' as 'BUY' | 'SELL',
  rate: null as number | null,
});

/* ───────── query builder ───────── */
const buildQuery = () => {
  const q: Record<string, unknown> = {
    page: currentPage.value,
    limit: pageSize.value,
  };
  if (filters.search?.trim()) q.search = filters.search.trim();
  if (filters.searchField) q.searchField = filters.searchField;
  if (filters.rateType) q.rateType = filters.rateType;
  if (filters.baseCurrency) q.baseCurrency = filters.baseCurrency;
  if (filters.targetCurrency) q.targetCurrency = filters.targetCurrency;
  if (filters.isActive !== undefined) q.isActive = filters.isActive;
  if (filters.sort) q.sort = filters.sort;
  if (startDate.value) q.startDate = startDate.value.format('YYYY-MM-DD');
  if (endDate.value) q.endDate = endDate.value.format('YYYY-MM-DD');
  return q;
};

/* ───────── filter handlers ───────── */
const applyFilters = () => {
  currentPage.value = 1;
  fetchRates(buildQuery());
};

const onFilterChange = (immediate = false) => {
  currentPage.value = 1;
  // Prevent unnecessary API calls when filters are empty
  if (immediate || filters.search || filters.baseCurrency || filters.targetCurrency || filters.isActive !== undefined || filters.sort || startDate.value || endDate.value) {
    fetchRates(buildQuery());
  }
};

const setRateType = (type: 'BUY' | 'SELL' | '') => {
  filters.rateType = type;
  applyFilters();
};

/* debounce search — apply 450 ms after last keystroke */
let searchTimer: ReturnType<typeof setTimeout> | undefined;
const onSearchChange = () => {
  clearTimeout(searchTimer);
  if (!filters.search) {
    applyFilters();
    return;
  }
  searchTimer = setTimeout(() => applyFilters(), 450);
};

/* base/target currency: toUpperCase + debounced auto-search */
let baseTargetTimer: ReturnType<typeof setTimeout> | undefined;
const onBaseTargetInput = (field: 'base' | 'target') => {
  if (field === 'base') filters.baseCurrency = (filters.baseCurrency ?? '').toUpperCase();
  else filters.targetCurrency = (filters.targetCurrency ?? '').toUpperCase();
  clearTimeout(baseTargetTimer);
  baseTargetTimer = setTimeout(() => applyFilters(), 450);
};

const resetFilters = () => {
  filters.search = '';
  filters.searchField = '';
  filters.rateType = '';
  filters.baseCurrency = '';
  filters.targetCurrency = '';
  filters.isActive = undefined;
  filters.sort = undefined;
  startDate.value = null;
  endDate.value = null;
  currentPage.value = 1;
  fetchRates(buildQuery());
};

/* ───────── table / pagination ───────── */
const expandCollapseIcon = ({ isActive }: { isActive: boolean }) =>
  h(DownOutlined, { class: 'expand-icon', style: { transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)' } });

const columns = computed(() => {
  const width = debouncedWindowWidth.value ?? 1280;
  
  // Mobile layout: minimal columns
  if (width < 768) {
    return [
      { title: t('merchant.exchangeRates.table.pair'), key: 'pair', width: 120 },
      { title: t('merchant.exchangeRates.table.rate'), key: 'rate', width: 100, align: 'right' as const },
      { title: t('merchant.exchangeRates.table.actions'), key: 'actions', width: 60, align: 'center' as const, fixed: 'right' as const },
    ];
  }
  
  // Tablet layout (Galaxy Tab S7): optimized columns
  if (width < 1200) {
    return [
      { title: t('merchant.exchangeRates.table.pair'), key: 'pair', width: 140 },
      { title: t('merchant.exchangeRates.table.rateType'), key: 'rateType', width: 80, align: 'center' as const },
      { title: t('merchant.exchangeRates.table.rate'), key: 'rate', width: 120, align: 'right' as const },
      { title: t('merchant.exchangeRates.table.isActive'), key: 'isActive', width: 80, align: 'center' as const },
      { title: t('merchant.exchangeRates.table.actions'), key: 'actions', width: 60, align: 'center' as const, fixed: 'right' as const },
    ];
  }
  
  // Desktop layout: full columns
  return [
    { title: `${t('merchant.exchangeRates.table.baseCurrency')} → ${t('merchant.exchangeRates.table.targetCurrency')}`, key: 'pair', width: 160 },
    { title: t('merchant.exchangeRates.table.rateType'), key: 'rateType', width: 100, align: 'center' as const },
    { title: t('merchant.exchangeRates.table.rate'), key: 'rate', width: 140, align: 'right' as const },
    { title: t('merchant.exchangeRates.table.rateDate'), dataIndex: 'rateDate', key: 'rateDate', width: 120 },
    { title: t('merchant.exchangeRates.table.isActive'), key: 'isActive', width: 100, align: 'center' as const },
    { title: t('merchant.exchangeRates.table.actions'), key: 'actions', width: 80, align: 'center' as const, fixed: 'right' as const },
  ];
});

/* paginationConfig uses local page/size so navigation is always in sync */
const paginationConfig = computed(() => ({
  current: currentPage.value,
  pageSize: pageSize.value,
  total: pagination.value.total,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
}));

const handleTableChange = (p: TablePaginationConfig) => {
  if (p.current && p.pageSize) {
    currentPage.value = p.current;
    pageSize.value = p.pageSize;
    fetchRates(buildQuery());
  }
};

const onMobilePageChange = (p: number, size: number) => {
  currentPage.value = p;
  pageSize.value = size;
  fetchRates(buildQuery());
};

/* ───────── form handlers ───────── */
const handleSubmit = async () => {
  if (!form.rate) return;
  const ok = await createRate({
    baseCurrency: form.baseCurrency as any,
    targetCurrency: form.targetCurrency as any,
    rateType: form.rateType,
    rate: form.rate,
  });
  if (ok) resetForm();
};

const handleDelete = async (id: number) => {
  await deleteRate(id);
};

const resetForm = () => {
  form.baseCurrency = '';
  form.targetCurrency = 'LAK';
  form.rateType = 'BUY';
  form.rate = null;
  formRef.value?.clearValidate();
  showForm.value = false;
};

onMounted(() => {
  fetchRates(buildQuery());
});

onUnmounted(() => {
  // Clear resize timer
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
  // Restore original DOM methods to prevent affecting other components
  Node.prototype.removeChild = originalRemoveChild;
  Node.prototype.insertBefore = originalInsertBefore;
  Node.prototype.appendChild = originalAppendChild;
  Node.prototype.replaceChild = originalReplaceChild;
  
  // Restore Element.prototype method if it was patched
  if (originalInsert) {
    (Element.prototype as any).insertBefore = originalInsert;
  }
});
</script>

<style scoped>
.mb-3 { margin-bottom: 12px; }
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.title-block { flex: 1 1 auto; min-width: 0; }
.page-title { font-size: 22px; font-weight: 600; color: #0f172a; line-height: 1.25; }
.page-subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }
.add-btn { height: 44px; border-radius: 12px; font-weight: 700; flex-shrink: 0; }

.filter-toggle-btn {
  height: 44px;
  width: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}
.filter-toggle-btn.active {
  background: #1677ff;
  color: #fff;
  border-color: #1677ff;
}

@media (max-width: 767px) {
  .page-title { font-size: 15px; }
  .page-subtitle { display: none; }
  .add-btn { height: 36px; font-size: 12px; padding: 0 10px; }
  .filter-toggle-btn { height: 40px; width: 40px; border-radius: 10px; }
}

.form-slide-enter-active { transition: all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1); }
.form-slide-leave-active { transition: all 0.22s cubic-bezier(0.4, 0, 1, 1); }
.form-slide-enter-from { opacity: 0; transform: translateY(-16px) scaleY(0.95); }
.form-slide-leave-to { opacity: 0; transform: translateY(-8px) scaleY(0.96); }

.form-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
  margin-bottom: 16px;
  border: 2px solid #e0e7ff;
}
.form-card-title { font-size: 15px; font-weight: 700; color: #1d4ed8; margin-bottom: 16px; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }

.currency-ac { width: 100%; }
.currency-ac :deep(.ant-select-selector) { text-transform: uppercase; font-weight: 600; }
.currency-ac :deep(input) { text-transform: uppercase; font-weight: 600; }

/* ===== Filter Card ===== */
.filter-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  margin-bottom: 12px;
}
@media (max-width: 1023px) {
  .filter-card :deep(.ant-card-body) { padding: 14px 16px !important; }
}

/* BUY / SELL / ALL button group */
.filter-type-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.type-btn-group { display: flex; gap: 0; border-radius: 8px; overflow: hidden; border: 1px solid #d9d9d9; }
.type-btn {
  /* equal width, equal height */
  width: 72px;
  height: 32px;
  border: none;
  background: #fff;
  color: #595959;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  outline: none;
  border-right: 1px solid #d9d9d9;
  flex-shrink: 0;
}
.type-btn:last-child { border-right: none; }
.type-btn:hover { background: #f0f5ff; color: #1677ff; }
.type-btn--active { background: #1677ff !important; color: #fff !important; }
.type-btn--buy.type-btn--active { background: #52c41a !important; }
.type-btn--sell.type-btn--active { background: #fa541c !important; }

/* Filter panel transition */
.filter-panel-enter-active,
.filter-panel-leave-active { transition: opacity 0.2s ease, max-height 0.25s ease; }
.filter-panel-enter-from,
.filter-panel-leave-to { opacity: 0; max-height: 0; overflow: hidden; }
.filter-panel-enter-to,
.filter-panel-leave-from { opacity: 1; max-height: 500px; }
.filter-rows-wrap { overflow: hidden; }

/* Filter rows */
.filter-row { margin-bottom: 0; }
.filter-row + .filter-row { margin-top: 10px; }
.filter-row--adv {
  padding-top: 10px;
  margin-top: 10px !important;
}
.filter-reset-col { display: flex; align-items: flex-end; }
.filter-reset-col .ant-btn { width: 100%; }

/* date pickers */
:deep(.ant-picker) { border-radius: 8px !important; width: 100%; }
/* inputs / selects */
:deep(.ant-input) { border-radius: 8px !important; }
:deep(.ant-select-selector) { border-radius: 8px !important; }
:deep(.ant-input-affix-wrapper) { border-radius: 8px !important; }
/* auto-complete fix - prevent input from becoming small */
:deep(.ant-auto-complete) { width: 100% !important; }
:deep(.ant-auto-complete .ant-select-selector) { width: 100% !important; min-width: 100% !important; }
:deep(.ant-auto-complete .ant-input) { width: 100% !important; min-width: 100% !important; }
:deep(.ant-auto-complete .ant-input-affix-wrapper) { width: 100% !important; min-width: 100% !important; }
:deep(.ant-select-selection-search) { width: 100% !important; }
:deep(.ant-select-selection-item) { flex: none !important; }

/* Custom currency dropdown */
.currency-dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99999;
  pointer-events: none;
}

.currency-dropdown {
  position: absolute;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100000;
  pointer-events: auto;
  min-width: 200px;
}

.currency-option {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.currency-option:hover {
  background-color: #f5f5f5;
}

.currency-option:last-child {
  border-bottom: none;
}

/* Galaxy Tab S7 (~800px) และ tablet responsive */
@media (max-width: 1023px) {
  .type-btn { width: 64px; height: 36px; font-size: 12px; }
  .filter-row--adv { padding-top: 8px; margin-top: 8px !important; }
}
@media (max-width: 767px) {
  .filter-actions { justify-content: flex-end; }
  .filter-row--adv { padding-top: 8px; margin-top: 8px !important; }
  .type-btn { width: 56px; height: 34px; font-size: 11px; }
  .type-btn-group { border-radius: 6px; }
}

/* ===== Table card ===== */
.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.pill-tag { border-radius: 999px; padding: 2px 10px; font-weight: 700; }
.rate-val { font-weight: 700; color: #0f172a; font-variant-numeric: tabular-nums; }
.currency-pair { font-weight: 700; color: #1d4ed8; letter-spacing: 0.02em; }

:deep(.ant-table) { width: 100%; }
:deep(.ant-table-thead > tr > th) { background: #f8fafc !important; color: #0f172a; font-weight: 700; }
:deep(.ant-table-tbody > tr:hover > td:not(.ant-table-cell-fix-right)) { background: rgba(24, 144, 255, 0.06) !important; }

/* ===== Mobile / Tablet (Galaxy Tab S7) ===== */
.rates-mobile { display: flex; flex-direction: column; }
@media (max-width: 1023px) {
  .rates-mobile { padding: 0 2px; }
  .rates-collapse :deep(.ant-collapse-item) { margin-bottom: 8px !important; }
}
.rates-collapse { background: transparent !important; border: none !important; }
.rates-collapse :deep(.ant-collapse-item) {
  background: #fff !important; border-radius: 16px !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.06) !important;
  border: 1px solid rgba(148, 163, 184, 0.15) !important;
  overflow: hidden; margin-bottom: 10px !important;
}
.rates-collapse :deep(.ant-collapse-header) { padding: 14px !important; align-items: center !important; }
.rates-collapse :deep(.ant-collapse-content) { background: transparent !important; border-top: 1px solid rgba(148, 163, 184, 0.18) !important; }
.rates-collapse :deep(.ant-collapse-content-box) { padding: 0 14px 14px !important; }

.expand-icon { font-size: 13px; color: #94a3b8; transition: transform 260ms ease; }
.card-row { display: flex; align-items: center; gap: 12px; min-width: 0; width: 100%; }
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 14px; font-weight: 700; color: #1d4ed8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
.card-right { flex-shrink: 0; }
.card-detail { padding-top: 12px; display: flex; flex-direction: column; gap: 8px; }
.detail-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
.detail-label { color: #64748b; font-weight: 500; }
.detail-val { color: #0f172a; font-weight: 600; text-align: right; }
.action-row { justify-content: flex-end; margin-top: 4px; }
.type-tag { border-radius: 999px; }
.mobile-pagination { display: flex; justify-content: center; margin-top: 12px; }

/* Responsive Table Styles */
.responsive-table {
  overflow: hidden;
  position: relative;
}

.responsive-table :deep(.ant-table) {
  overflow: hidden;
  position: relative;
}

.responsive-table :deep(.ant-table-container) {
  overflow-x: auto;
  position: relative;
}

.responsive-table :deep(.ant-table-body) {
  overflow-x: auto;
  overflow-y: auto;
  position: relative;
}

/* Fix scrollbar detection issues */
.responsive-table :deep(.ant-table-content) {
  overflow: visible !important;
}

.responsive-table :deep(.ant-table-scroll) {
  overflow: visible !important;
}

/* Prevent scrollbar size calculation errors */
.responsive-table :deep(.ant-table-body-inner) {
  width: 100% !important;
  overflow-x: auto;
}

/* Hide scrollbars during transitions to prevent detection errors */
.responsive-table :deep(.ant-table-wrapper) {
  transition: none !important;
}

.responsive-table :deep(.ant-table-spin) {
  transition: none !important;
}

/* Galaxy Tab S7 Optimizations */
@media (max-width: 1199px) and (min-width: 768px) {
  .responsive-table :deep(.ant-table-thead > tr > th) {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .responsive-table :deep(.ant-table-tbody > tr > td) {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .responsive-table :deep(.ant-table-pagination) {
    margin: 16px 0 0 0;
  }
  
  .responsive-table :deep(.ant-pagination-options) {
    display: none;
  }
}

/* Mobile Optimizations */
@media (max-width: 767px) {
  .responsive-table :deep(.ant-table-thead > tr > th) {
    padding: 6px 8px;
    font-size: 12px;
  }
  
  .responsive-table :deep(.ant-table-tbody > tr > td) {
    padding: 6px 8px;
    font-size: 12px;
  }
  
  .responsive-table :deep(.ant-table-pagination) {
    margin: 12px 0 0 0;
  }
  
  .responsive-table :deep(.ant-pagination) {
    justify-content: center;
  }
  
  .responsive-table :deep(.ant-pagination-total-text) {
    display: none;
  }
}
</style>

<style>
/* Single-panel date picker popup — hides the redundant second panel */
.single-panel-picker .ant-picker-panels > *:last-child { display: none !important; }
.single-panel-picker .ant-picker-panels > *:first-child .ant-picker-header-next-btn,
.single-panel-picker .ant-picker-panels > *:first-child .ant-picker-header-super-next-btn {
  visibility: visible !important;
}
.single-panel-picker .ant-picker-panel-container { min-width: unset !important; }

/* Fix Ant Design Vue scrollbar detection issues globally */
.ant-table-scroll {
  overflow: visible !important;
}

.ant-table-content {
  overflow: visible !important;
}

.ant-table-body-inner {
  overflow-x: auto !important;
}

/* Prevent scrollbar size calculation errors during responsive transitions */
.ant-table-wrapper {
  transition: none !important;
}

.ant-table-spin-container {
  transition: none !important;
}

/* Fix for dynamic table resizing */
.ant-table {
  table-layout: fixed !important;
}

/* Hide scrollbar measurement elements */
.ant-table-scrollbar-measure {
  display: none !important;
}

/* Fix detectFlexGapSupported error - prevent DOM manipulation during feature detection */
.responsive-table .ant-layout,
.responsive-table .ant-layout * {
  contain: layout style !important;
}

/* Prevent flex gap detection from removing nodes */
.responsive-table .ant-flex,
.responsive-table .ant-flex * {
  contain: layout style !important;
}

/* Global fix for Ant Design Vue feature detection - limited to tables */
.responsive-table .ant-pro-grid,
.responsive-table .ant-pro-grid * {
  contain: layout style !important;
}

/* Fix for any flex container feature detection - limited to tables */
.responsive-table [class*="ant-"] {
  contain: layout style !important;
}

/* Prevent DOM removal during feature detection - limited to tables */
.responsive-table .ant-float-ant-affix-wrapper,
.responsive-table .ant-float-ant-affix-wrapper * {
  contain: layout style !important;
}
</style>
