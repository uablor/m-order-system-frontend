<template>
  <div class="currency-summary-dashboard">
    <!-- Header -->
    <div class="summary-header">
      <h3>{{ $t('merchant.currencySummary.title') }}</h3>
      <div class="total-orders">
        {{ $t('merchant.currencySummary.totalOrders') }}: {{ summary.totalOrders }}
      </div>
    </div>

    <!-- Overall Summary -->
    <div class="overall-summary">
      <div class="summary-card income">
        <div class="card-icon">💰</div>
        <div class="card-content">
          <div class="card-label">{{ $t('merchant.currencySummary.totalIncome') }}</div>
          <div class="card-value">{{ formattedSummary.totalIncome }}</div>
        </div>
      </div>
      
      <div class="summary-card expense">
        <div class="card-icon">💸</div>
        <div class="card-content">
          <div class="card-label">{{ $t('merchant.currencySummary.totalExpense') }}</div>
          <div class="card-value">{{ formattedSummary.totalExpense }}</div>
        </div>
      </div>
      
      <div class="summary-card" :class="profitCardClass">
        <div class="card-icon">{{ profitIcon }}</div>
        <div class="card-content">
          <div class="card-label">{{ $t('merchant.currencySummary.totalProfit') }}</div>
          <div class="card-value">{{ formattedSummary.totalProfit }}</div>
          <div class="card-percentage" v-if="formattedSummary.financialStatus.percentage > 0">
            {{ formattedSummary.financialStatus.percentage.toFixed(1) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- Currency Breakdown -->
    <div class="currency-breakdown">
      <h4>{{ $t('merchant.currencySummary.byCurrency') }}</h4>
      
      <div class="currency-list">
        <div 
          v-for="currency in formattedSummary.currencyBreakdown" 
          :key="currency.targetCurrency"
          class="currency-item"
        >
          <div class="currency-header">
            <span class="currency-name">{{ currency.targetCurrency }}</span>
            <span class="currency-orders">{{ currency.orders }} orders</span>
          </div>
          
          <div class="currency-metrics">
            <div class="metric">
              <span class="metric-label">{{ $t('merchant.currencySummary.income') }}</span>
              <span class="metric-value positive">{{ currency.income }}</span>
            </div>
            
            <div class="metric">
              <span class="metric-label">{{ $t('merchant.currencySummary.expense') }}</span>
              <span class="metric-value negative">{{ currency.expense }}</span>
            </div>
            
            <div class="metric">
              <span class="metric-label">{{ $t('merchant.currencySummary.profit') }}</span>
              <span 
                class="metric-value" 
                :class="Number(currency.profit) >= 0 ? 'positive' : 'negative'"
              >
                {{ currency.profit }}
              </span>
            </div>
            
            <div class="metric">
              <span class="metric-label">{{ $t('merchant.currencySummary.profitMargin') }}</span>
              <span 
                class="metric-value" 
                :class="Number(currency.profitPercentage) >= 0 ? 'positive' : 'negative'"
              >
                {{ currency.profitPercentage }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Insights -->
    <div class="insights" v-if="hasInsights">
      <h4>{{ $t('merchant.currencySummary.insights') }}</h4>
      
      <div class="insight-item" v-if="mostProfitable">
        <div class="insight-icon">🏆</div>
        <div class="insight-text">
          {{ $t('merchant.currencySummary.mostProfitable', { 
            currency: mostProfitable.targetCurrency, 
            profit: formatCurrency(mostProfitable.totalProfit, 'LAK')
          }) }}
        </div>
      </div>
      
      <div class="insight-item" v-if="mostLoss">
        <div class="insight-icon">⚠️</div>
        <div class="insight-text">
          {{ $t('merchant.currencySummary.mostLoss', { 
            currency: mostLoss.targetCurrency, 
            loss: formatCurrency(Math.abs(mostLoss.totalProfit), 'LAK')
          }) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Order } from '@/domain/entities/user.entity';
import { useCurrencySummary } from '@/shared/composables/useCurrencySummary';

interface Props {
  orders: Order[];
}

const props = defineProps<Props>();

const {
  calculateSummary,
  formatSummary,
  getMostProfitableCurrency,
  getMostLossCurrency,
  formatCurrency
} = useCurrencySummary();

// คำนวณข้อมูลสรุป
const summary = computed(() => calculateSummary(props.orders));

// จัดรูปแบบข้อมูลสรุป
const formattedSummary = computed(() => formatSummary(summary.value));

// หาสกุลเงินที่มีกำไร/ขาดทุนสูงสุด
const mostProfitable = computed(() => getMostProfitableCurrency(summary.value));
const mostLoss = computed(() => getMostLossCurrency(summary.value));

// ตรวจสอบว่ามีข้อมูล insights หรือไม่
const hasInsights = computed(() => mostProfitable.value || mostLoss.value);

// คลาส CSS สำหรับการ์ดกำไร
const profitCardClass = computed(() => {
  const status = formattedSummary.value.financialStatus.status;
  return {
    'profit': status === 'profit',
    'loss': status === 'loss',
    'break-even': status === 'break-even'
  };
});

// ไอคอนสำหรับการ์ดกำไร
const profitIcon = computed(() => {
  const status = formattedSummary.value.financialStatus.status;
  switch (status) {
    case 'profit': return '📈';
    case 'loss': return '📉';
    case 'break-even': return '➖';
    default: return '💰';
  }
});
</script>

<style scoped>
.currency-summary-dashboard {
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.summary-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.total-orders {
  font-size: 14px;
  color: #6b7280;
  background: #e5e7eb;
  padding: 4px 12px;
  border-radius: 12px;
}

.overall-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #e5e7eb;
}

.summary-card.profit {
  border-left-color: #10b981;
}

.summary-card.loss {
  border-left-color: #ef4444;
}

.summary-card.break-even {
  border-left-color: #f59e0b;
}

.card-icon {
  font-size: 24px;
  margin-right: 12px;
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.card-value {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.card-percentage {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.currency-breakdown h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.currency-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.currency-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.currency-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.currency-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.currency-orders {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 8px;
}

.currency-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.metric {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 2px;
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
}

.metric-value.positive {
  color: #10b981;
}

.metric-value.negative {
  color: #ef4444;
}

.insights {
  margin-top: 24px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.insights h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.insight-icon {
  font-size: 16px;
}

.insight-text {
  font-size: 14px;
  color: #4b5563;
}

/* Responsive */
@media (max-width: 768px) {
  .overall-summary {
    grid-template-columns: 1fr;
  }
  
  .currency-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .summary-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
