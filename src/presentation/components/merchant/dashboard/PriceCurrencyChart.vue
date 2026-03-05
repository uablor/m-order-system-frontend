<template>
  <a-card :bordered="false" class="panel-card chart-card">
    <div class="chart-header">
      <div class="chart-title">{{ $t('merchant.dashboard.chartTitle') }}</div>
      <div class="chart-subtitle">{{ $t('merchant.dashboard.chartSubtitle') }}</div>
    </div>
    <div v-if="chartLoading" class="chart-loading">
      <a-spin size="large" />
    </div>
    <div v-else-if="chartError" class="chart-error">
      <a-alert type="warning" :message="chartError" show-icon />
    </div>
    <template v-else-if="chartData?.months?.length">
      <!-- Total Statistic -->
      <div class="chart-statistic">
        <a-statistic
          :title="$t('merchant.dashboard.totalRevenue')"
          :value="displayTotal"
          :precision="selectedCurrency === 'LAK' ? 0 : 2"
        >
          <template #suffix>
            {{ selectedCurrency }}
          </template>
        </a-statistic>
      </div>

      <!-- Currency Filter: Checkable Tags -->
      <div class="chart-filter">
        <span class="filter-label">{{ $t('merchant.dashboard.filterByCurrency') }}:</span>
        <a-space :size="[8, 8]" wrap >
          <a-tag
            v-for="curr in currencyOptions"
            :key="curr"
            :color="selectedCurrency === curr ? 'blue' : 'default'"
            class="filter-tag"
            @click="selectedCurrency = curr"
          >
            {{ curr }}
          </a-tag>
        </a-space>
      </div>

      <!-- Stacked Column Chart -->
      <div class="chart-container" :class="{ 'chart-mobile': isMobile, 'chart-tablet': isTablet }">
        <v-chart class="chart" :option="chartOption" autoresize />
      </div>
    </template>
    <div v-else class="chart-empty">
      <a-empty :description="$t('merchant.dashboard.noChartData')" />
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Dayjs } from 'dayjs';
import * as dayjsModule from 'dayjs';
// dayjs ใช้ export = (ไม่มี default) จึงต้องดึงจาก namespace
const dayjs = ((dayjsModule as { default?: unknown }).default ?? dayjsModule) as typeof import('dayjs');
import 'echarts';
import VChart from 'vue-echarts';
import { dashboardService } from '@/infrastructure/services/dashboard.service';
import { extractSingleResult } from '@/shared/types/backend-response.types';
import type { PriceCurrencySummaryByDateResponseDto } from '@/domain/entities/user.entity';
import { useIsMobile } from '@/shared/composables/useIsMobile';

const { t } = useI18n();
const { windowWidth, isMobile, isTablet } = useIsMobile(768);
const dateRange = ref<[Dayjs, Dayjs] | null>(null);
const chartLoading = ref(false);
const chartError = ref<string | null>(null);
const chartData = ref<PriceCurrencySummaryByDateResponseDto | null>(null);
const selectedCurrency = ref<string>('LAK');

/* ค่าเริ่มต้น: ปีปัจจุบัน */
function getDefaultRange(): [Dayjs, Dayjs] {
  const now = dayjs();
  return [now.startOf('year'), now.endOf('year')];
}

/* รายการสกุลเงิน: LAK (รวมทั้งหมด) + CNY, USDT, THB ฯลฯ จากข้อมูล */
const currencyOptions = computed(() => {
  const months = chartData.value?.months ?? [];
  const set = new Set<string>();
  months.forEach((m) => {
    (m.currencies ?? []).forEach((c) => {
      if (c?.baseCurrency) set.add(c.baseCurrency);
    });
  });
  return ['LAK', ...Array.from(set).sort()];
});

/* Total สำหรับ Statistic ด้านบน */
const displayTotal = computed(() => {
  const data = chartData.value;
  if (!data) return 0;
  if (selectedCurrency.value === 'LAK') {
    return data.totalSummary?.totalAll ?? 0;
  }
  const months = data.months ?? [];
  let sum = 0;
  months.forEach((m) => {
    const items = (m.currencies ?? []).filter((c) => c.baseCurrency === selectedCurrency.value);
    items.forEach((c) => {
      sum += (c.totalPaid ?? 0) + (c.totalUnpaid ?? 0);
    });
  });
  return sum;
});

/* Responsive: grid และ font ตามขนาดจอ (mobile ลด left/right ให้กราฟกว้างเต็ม) */
const chartLayout = computed(() => {
  const w = windowWidth.value ?? 1280;
  if (w < 768) {
    return { left: 24, right: 4, bottom: 55, top: 20, fontSize: 10, rotate: 0, shortMonth: true };
  }
  if (w <= 1024) {
    return { left: 36, right: 12, bottom: 58, top: 22, fontSize: 11, rotate: 0, shortMonth: false };
  }
  return { left: 48, right: 24, bottom: 60, top: 24, fontSize: 12, rotate: 0, shortMonth: false };
});

/* แปลงข้อมูลสำหรับ chart ตาม currency ที่เลือก */
const chartOption = computed(() => {
  const months = chartData.value?.months ?? [];
  const curr = selectedCurrency.value;
  const layout = chartLayout.value;
  if (!months.length) return {};

  const monthLabelsFull = months.map((m) => {
    const d = new Date(m.year, m.month - 1, 1);
    return dayjs(d).format('MMM YYYY');
  });
  const monthLabels = layout.shortMonth
    ? months.map((m) => {
        const d = new Date(m.year, m.month - 1, 1);
        return dayjs(d).format('MMM');
      })
    : monthLabelsFull;

  let paidData: number[];
  let unpaidData: number[];
  const unit = curr;

  if (curr === 'LAK') {
    paidData = months.map((m) => Math.round(m.summary?.totalPaid ?? 0));
    unpaidData = months.map((m) => Math.round(m.summary?.totalUnpaid ?? 0));
  } else {
    paidData = months.map((m) => {
      const items = (m.currencies ?? []).filter((c) => c.baseCurrency === curr);
      return items.reduce((s, c) => s + (c.totalPaid ?? 0), 0);
    });
    unpaidData = months.map((m) => {
      const items = (m.currencies ?? []).filter((c) => c.baseCurrency === curr);
      return items.reduce((s, c) => s + (c.totalUnpaid ?? 0), 0);
    });
  }

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        if (!params?.length) return '';
        const idx = params[0].dataIndex;
        const paid = paidData[idx] ?? 0;
        const unpaid = unpaidData[idx] ?? 0;
        const total = paid + unpaid;
        return `<div style="padding:6px 10px 3px 4px !important; font-size:${Math.max(12, layout.fontSize + 2)}px">
          <strong>${monthLabelsFull[idx]}</strong><br/>
          ${params[0].marker} ${params[0].seriesName}: ${formatNum(paid)} ${unit}<br/>
          ${params[1].marker} ${params[1].seriesName}: ${formatNum(unpaid)} ${unit}<br/>
          <strong>${t('merchant.dashboard.totalPrice')}: ${formatNum(total)} ${unit}</strong>
        </div>`;
      },
    },
    legend: {
      data: [
        { name: t('merchant.dashboard.pricePaid'), itemStyle: { color: '#52c41a' } },
        { name: t('merchant.dashboard.priceUnpaid'), itemStyle: { color: '#ff4d4f' } },
      ],
      bottom: 0,
      itemWidth: layout.fontSize < 12 ? 12 : 14,
      itemHeight: layout.fontSize < 12 ? 10 : 14,
      textStyle: { fontSize: layout.fontSize },
    },
    grid: {
      left: layout.left,
      right: layout.right,
      bottom: layout.bottom,
      top: layout.top,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: monthLabels,
      axisLabel: { rotate: layout.rotate, fontSize: layout.fontSize, hideOverlap: true },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: layout.fontSize,
        formatter: (val: number) => `${formatCompact(val)} ${unit}`,
      },
    },
    series: [
      {
        name: t('merchant.dashboard.pricePaid'),
        type: 'bar',
        barWidth: '28%',
        barGap: '20%',
        barCategoryGap: '15%',
        data: paidData,
        itemStyle: { color: '#52c41a' },
      },
      {
        name: t('merchant.dashboard.priceUnpaid'),
        type: 'bar',
        barWidth: '28%',
        barGap: '20%',
        data: unpaidData,
        itemStyle: { color: '#ff4d4f' },
      },
    ],
  };
});

function formatNum(n: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(n);
}

function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

async function fetchChartData() {
  const range = dateRange.value ?? getDefaultRange();
  const startDate = range[0].format('YYYY-MM-DD');
  const endDate = range[1].format('YYYY-MM-DD');

  chartLoading.value = true;
  chartError.value = null;
  try {
    const res = await dashboardService.getMerchantPriceCurrencySummaryByDate({
      startDate,
      endDate,
    });
    const data = extractSingleResult(res);
    if (data) {
      chartData.value = data;
      selectedCurrency.value = 'LAK';
    } else {
      chartData.value = null;
      chartError.value = 'No data returned';
    }
  } catch (err) {
    chartError.value = err instanceof Error ? err.message : 'Failed to load chart data';
    chartData.value = null;
  } finally {
    chartLoading.value = false;
  }
}

onMounted(() => {
  dateRange.value = getDefaultRange();
  fetchChartData();
});
</script>

<style scoped>
.chart-card {
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.chart-header { margin-bottom: 16px; }
.chart-title { font-size: 18px; font-weight: 600; color: #0f172a; }
.chart-subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
.chart-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
}
.chart-statistic {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.chart-statistic :deep(.ant-statistic-title) { font-size: 13px; color: #64748b; }
.chart-statistic :deep(.ant-statistic-content-value) { font-size: 24px; font-weight: 700; color: #0f172a; }
.chart-filter {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.filter-label { font-size: 14px; color: #64748b; font-weight: 500; }
.filter-tag { cursor: pointer; user-select: none; }
.chart-container {
  position: relative;
  padding: 8px 0 0 0;
  overflow: visible;
}
/* Mobile: ขยายกราฟให้เต็มความกว้าง ลด padding ซ้าย-ขวา (ชดเชย card padding) */
.chart-container.chart-mobile {
  margin-left: -24px;
  margin-right: -24px;
  width: calc(100% + 48px);
}
.chart {
  height: 400px;
  width: 100%;
  min-height: 400px;
}
.chart-loading, .chart-empty { min-height: 200px; display: flex; align-items: center; justify-content: center; }
.chart-error { margin: 20px 0; }

/* ===== Responsive ===== */
/* Galaxy Tab S7 (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .chart-title { font-size: 16px; }
  .chart-subtitle { font-size: 12px; }
  .chart-statistic { padding: 12px; margin-bottom: 16px; }
  .chart-statistic :deep(.ant-statistic-title) { font-size: 12px; }
  .chart-statistic :deep(.ant-statistic-content-value) { font-size: 20px; }
  .chart-filter { margin-bottom: 16px; gap: 10px; }
  .filter-label { font-size: 13px; }
  .chart-container.chart-tablet .chart {
    height: 320px;
    min-height: 320px;
  }
}

/* Mobile < 768px */
@media (max-width: 767px) {
  .chart-card { overflow-x: hidden; }
  .chart-title { font-size: 16px; }
  .chart-subtitle { font-size: 12px; }
  .chart-statistic { padding: 12px; margin-bottom: 14px; }
  .chart-statistic :deep(.ant-statistic-title) { font-size: 12px; }
  .chart-statistic :deep(.ant-statistic-content-value) { font-size: 18px; }
  .chart-filter {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 14px;
    gap: 8px;
  }
  .filter-label { font-size: 13px; }
  .chart-container.chart-mobile .chart {
    height: 280px;
    min-height: 280px;
  }
  .chart-loading, .chart-empty { min-height: 200px; }
}
</style>
