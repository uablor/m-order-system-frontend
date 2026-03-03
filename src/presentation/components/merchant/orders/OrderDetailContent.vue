<template>
  <div class="order-detail-page">
    <a-breadcrumb class="mb-3">
      <a-breadcrumb-item>{{ $t('merchant.breadcrumbs.home') }}</a-breadcrumb-item>
      <a-breadcrumb-item>
        <router-link to="/merchant/orders">{{ $t('merchant.orderDetail.breadcrumbOrders') }}</router-link>
      </a-breadcrumb-item>
      <a-breadcrumb-item>{{ $t('merchant.orderDetail.breadcrumbDetail') }}</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-head">
      <a-button type="text" class="back-btn" @click="goBack">
        <ArrowLeftOutlined />
        {{ $t('merchant.orderDetail.back') }}
      </a-button>
    </div>

    <a-spin :spinning="loading">
      <a-empty v-if="!loading && !order" :description="$t('merchant.orderDetail.notFound')" />

      <template v-if="order">
        <!-- Order Info Card -->
        <a-card :bordered="false" class="panel-card mb-4">
          <div class="panel-title">
            <FileTextOutlined class="icon-blue" />
            <span>{{ $t('merchant.orderDetail.orderInfo') }}</span>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">{{ $t('merchant.orderDetail.orderCode') }}</span>
              <span class="info-value order-code">{{ order.orderCode }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('merchant.orderDetail.orderDate') }}</span>
              <span class="info-value">{{ formatDateOnly(order.orderDate) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('merchant.orderDetail.arrivalStatus') }}</span>
              <span class="info-value">
                <a-tag :color="order.arrivalStatus === 'ARRIVED' ? 'green' : 'default'" class="pill-tag">
                  {{ order.arrivalStatus === 'ARRIVED' ? $t('merchant.orderDetail.arrivalArrived') : $t('merchant.orderDetail.arrivalNotArrived') }}
                </a-tag>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('merchant.orderDetail.paymentStatus') }}</span>
              <span class="info-value">
                <a-tag :color="paymentColor(order.paymentStatus)" class="pill-tag">
                  {{ paymentLabel(order.paymentStatus) }}
                </a-tag>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('merchant.orderDetail.createdBy') }}</span>
              <span class="info-value">{{ order.createdByUser?.fullName || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('merchant.orderDetail.createdAt') }}</span>
              <span class="info-value">{{ formatDateTime(order.createdAt) }}</span>
            </div>
            <div v-if="order.arrivedAt" class="info-item">
              <span class="info-label">{{ $t('merchant.orderDetail.arrivedAt') }}</span>
              <span class="info-value">{{ formatDateTime(order.arrivedAt) }}</span>
            </div>
            <div v-if="order.notifiedAt" class="info-item">
              <span class="info-label">{{ $t('merchant.orderDetail.notifiedAt') }}</span>
              <span class="info-value">{{ formatDateTime(order.notifiedAt) }}</span>
            </div>
          </div>
        </a-card>

        <!-- Exchange Rates Card -->
        <a-card :bordered="false" class="panel-card mb-4">
          <div class="panel-title">
            <SwapOutlined class="icon-blue" />
            <span>{{ $t('merchant.orderDetail.exchangeRates') }}</span>
          </div>
          <div class="rate-grid">
            <!-- Buy Rate -->
            <div v-if="order.exchangeRateBuy" class="rate-card rate-buy">
              <div class="rate-card-header">
                <span class="rate-type-badge buy">{{ order.exchangeRateBuy.rateType }}</span>
                <span class="rate-pair">{{ order.exchangeRateBuy.baseCurrency }} → {{ order.exchangeRateBuy.targetCurrency }}</span>
              </div>
              <div class="rate-value">{{ formatNumber(order.exchangeRateBuy.rate) }}</div>
              <div class="rate-label">{{ $t('merchant.orderDetail.buyRateLabel') }}</div>
              <div class="rate-date">{{ $t('merchant.orderDetail.rateDate') }}: {{ formatDateOnly(order.exchangeRateBuy.rateDate) }}</div>
            </div>
            <!-- Sell Rate -->
            <div v-if="order.exchangeRateSell" class="rate-card rate-sell">
              <div class="rate-card-header">
                <span class="rate-type-badge sell">{{ order.exchangeRateSell.rateType }}</span>
                <span class="rate-pair">{{ order.exchangeRateSell.baseCurrency }} → {{ order.exchangeRateSell.targetCurrency }}</span>
              </div>
              <div class="rate-value">{{ formatNumber(order.exchangeRateSell.rate) }}</div>
              <div class="rate-label">{{ $t('merchant.orderDetail.sellRateLabel') }}</div>
              <div class="rate-date">{{ $t('merchant.orderDetail.rateDate') }}: {{ formatDateOnly(order.exchangeRateSell.rateDate) }}</div>
            </div>
          </div>
        </a-card>

        <!-- Financial Summary: Purchase Cost -->
        <a-card :bordered="false" class="panel-card mb-4">
          <div class="panel-title">
            <DollarOutlined class="icon-blue" />
            <span>{{ $t('merchant.orderDetail.financialSummary') }} — {{ $t('merchant.orderDetail.purchaseCostTitle') }}</span>
          </div>
          <div class="finance-grid">
            <div class="finance-item purchase-cost">
              <span class="finance-label">{{ $t('merchant.orderDetail.totalPurchaseCost') }}</span>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.totalPurchaseCost) }} {{ buyCurrency }}</template>
                <span class="finance-value num-truncate">{{ truncNum(order.totalPurchaseCost) }} <span class="fin-currency">{{ buyCurrency }}</span></span>
              </a-tooltip>
              <span class="finance-lak-sub">{{ $t('merchant.orderDetail.inLak') }} {{ truncNum(order.targetCurrencyTotalPurchaseCost) }}</span>
            </div>
            <div class="finance-item shipping-cost">
              <span class="finance-label">{{ $t('merchant.orderDetail.totalShippingCost') }}</span>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.totalShippingCost) }} {{ buyCurrency }}</template>
                <span class="finance-value num-truncate">{{ truncNum(order.totalShippingCost) }} <span class="fin-currency">{{ buyCurrency }}</span></span>
              </a-tooltip>
              <span class="finance-lak-sub">{{ $t('merchant.orderDetail.inLak') }} {{ truncNum(order.targetCurrencyTotalShippingCost) }}</span>
            </div>
            <div class="finance-item cost-before-discount">
              <span class="finance-label">{{ $t('merchant.orderDetail.totalCostBeforeDiscount') }}</span>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.totalCostBeforeDiscount) }} {{ buyCurrency }}</template>
                <span class="finance-value num-truncate">{{ truncNum(order.totalCostBeforeDiscount) }} <span class="fin-currency">{{ buyCurrency }}</span></span>
              </a-tooltip>
              <span class="finance-lak-sub">{{ $t('merchant.orderDetail.inLak') }} {{ truncNum(order.targetCurrencyTotalCostBeforeDiscount) }}</span>
            </div>
            <div class="finance-item discount">
              <span class="finance-label">{{ $t('merchant.orderDetail.totalDiscount') }}</span>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>-{{ formatNumber(order.totalDiscount) }} {{ buyCurrency }}</template>
                <span class="finance-value num-truncate">-{{ truncNum(order.totalDiscount) }} <span class="fin-currency">{{ buyCurrency }}</span></span>
              </a-tooltip>
              <span class="finance-lak-sub">{{ $t('merchant.orderDetail.inLak') }} -{{ truncNum(order.targetCurrencyTotalDiscount) }}</span>
            </div>
            <div class="finance-item final-cost">
              <span class="finance-label">{{ $t('merchant.orderDetail.totalFinalCost') }}</span>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.totalFinalCost) }} {{ buyCurrency }}</template>
                <span class="finance-value num-truncate">{{ truncNum(order.totalFinalCost) }} <span class="fin-currency">{{ buyCurrency }}</span></span>
              </a-tooltip>
              <span class="finance-lak-sub">{{ $t('merchant.orderDetail.inLak') }} {{ truncNum(order.targetCurrencyTotalFinalCost) }}</span>
            </div>
          </div>
        </a-card>

        <!-- Financial Summary: Selling & Profit -->
        <a-card :bordered="false" class="panel-card mb-4">
          <div class="panel-title">
            <DollarOutlined class="icon-blue" />
            <span>{{ $t('merchant.orderDetail.financialSummary') }} — {{ $t('merchant.orderDetail.sellingProfitTitle') }}</span>
          </div>
          <div class="finance-grid">
            <div class="finance-item selling-amount">
              <span class="finance-label">{{ $t('merchant.orderDetail.totalSellingAmount') }}</span>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.totalSellingAmount) }} {{ sellCurrency }}</template>
                <span class="finance-value num-truncate">{{ truncNum(order.totalSellingAmount) }} <span class="fin-currency">{{ sellCurrency }}</span></span>
              </a-tooltip>
              <span class="finance-lak-sub">{{ $t('merchant.orderDetail.inLak') }} {{ truncNum(order.targetCurrencyTotalSellingAmount) }} </span>
            </div>
            <div class="finance-item" :class="{ 'profit-positive-bg': Number(order.totalProfit) >= 0, 'profit-negative-bg': Number(order.totalProfit) < 0 }">
              <span class="finance-label">{{ $t('merchant.orderDetail.totalProfit') }}</span>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.totalProfit) }} {{ sellCurrency }}</template>
                <span class="finance-value num-truncate">{{ truncNum(order.totalProfit) }} <span class="fin-currency">{{ sellCurrency }}</span></span>
              <span class="finance-lak-sub">{{ $t('merchant.orderDetail.inLak') }} {{ truncNum(order.targetCurrencyTotalProfit) }} </span>
              <!-- <span class="finance-lak-sub">{{ $t('merchant.orderDetail.inLak') }} {{ truncNum(order.targetCurrencyTotalSellingAmount) }}</span> -->


              </a-tooltip>
              <!-- <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(order.targetCurrencyTotalProfit) }} LAK</template>
                <span class="finance-value num-truncate">{{ truncNum(order.targetCurrencyTotalProfit) }} <span class="fin-currency">LAK</span></span>
              </a-tooltip> -->
            </div>
            <div class="finance-item paid">
              <span class="finance-label">{{ $t('merchant.orderDetail.paidAmount') }}</span>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(computedTotalPaid) }} {{ sellCurrency }}</template>
                <span class="finance-value num-truncate">{{ truncNum(computedTotalPaid) }} <span class="fin-currency">{{ sellCurrency }}</span></span>
              </a-tooltip>
              <span class="finance-lak-sub">{{ $t('merchant.orderDetail.inLak') }} {{ truncNum(computedTotalPaidLak) }}</span>
            </div>
            <div class="finance-item remaining">
              <span class="finance-label">{{ $t('merchant.orderDetail.remainingAmount') }}</span>
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(computedTotalRemaining) }} {{ sellCurrency }}</template>
                <span class="finance-value remaining num-truncate">{{ truncNum(computedTotalRemaining) }} <span class="fin-currency">{{ sellCurrency }}</span></span>
              </a-tooltip>
              <span class="finance-lak-sub">{{ $t('merchant.orderDetail.inLak') }} {{ truncNum(computedTotalRemainingLak) }}</span>
            </div>
          </div>
        </a-card>

        <!-- Order Items Card -->
        <a-card :bordered="false" class="panel-card mb-4">
          <div class="panel-title">
            <ShoppingOutlined class="icon-blue" />
            <span>{{ $t('merchant.orderDetail.orderItems') }}</span>
            <a-tag class="count-tag">{{ order.orderItems?.length || 0 }}</a-tag>
          </div>

          <a-empty v-if="!order.orderItems || order.orderItems.length === 0" :description="$t('merchant.orderDetail.noItems')" />

          <div v-if="order.orderItems && order.orderItems.length > 0" class="items-cards">
            <div v-for="(item, idx) in order.orderItems" :key="item.id" class="oi-card">
              <div class="oi-card-header">
                <span class="item-num">#{{ idx + 1 }}</span>
                <span class="item-name">{{ item.productName }}</span>
                <span v-if="item.variant" class="item-variant">({{ item.variant }})</span>
              </div>

              <div class="oi-info-row">
                <div class="oi-info-item"><span class="oi-label">{{ $t('merchant.orderDetail.quantity') }}</span><span class="oi-val">{{ item.quantity }}</span></div>
              </div>

              <!-- Purchase Section -->
              <div class="oi-section">
                <div class="oi-section-title purchase">{{ $t('merchant.orderDetail.sectionPurchase') }}</div>
                <div class="oi-info-row">
                  <div class="oi-info-item">
                    <span class="oi-label">{{ $t('merchant.orderDetail.purchasePrice') }} ({{ item.exchangeRateBuy?.baseCurrency || order.exchangeRateBuy?.baseCurrency || '-' }})</span>
                    <span class="oi-val">{{ formatNumber(item.purchasePrice) }} <span class="oi-currency">{{ item.exchangeRateBuy?.baseCurrency || order.exchangeRateBuy?.baseCurrency || '' }}</span></span>
                    <span class="oi-lak-sub">{{ $t('merchant.orderDetail.inLak') }} {{ formatNumber(item.targetCurrencyPurchasePrice) }}</span>
                  </div>
                  <div class="oi-info-item">
                    <span class="oi-label">{{ $t('merchant.orderDetail.purchaseExchangeRate') }}</span>
                    <span class="oi-val">{{ formatNumber(item.exchangeRateBuyValue || order.exchangeRateBuyValue || '0') }}</span>
                  </div>
                  <div class="oi-info-item">
                    <span class="oi-label">{{ $t('merchant.orderDetail.purchaseTotalLak') }}</span>
                    <span class="oi-val">{{ formatNumber(item.purchaseTotal) }} <span class="oi-currency">{{ item.exchangeRateBuy?.baseCurrency || order.exchangeRateBuy?.baseCurrency || '' }}</span></span>
                    <span class="oi-lak-sub">{{ $t('merchant.orderDetail.inLak') }} {{ formatNumber(item.targetCurrencyPurchaseTotal) }}</span>
                  </div>
                </div>
                <div class="oi-info-row">
                  <div class="oi-info-item">
                    <span class="oi-label">{{ $t('merchant.orderDetail.shippingPrice') }} ({{ item.exchangeRateBuy?.baseCurrency || order.exchangeRateBuy?.baseCurrency || '-' }})</span>
                    <span class="oi-val">{{ formatNumber(item.shippingPrice ?? '0') }} <span class="oi-currency">{{ item.exchangeRateBuy?.baseCurrency || order.exchangeRateBuy?.baseCurrency || '' }}</span></span>
                    <span class="oi-lak-sub">{{ $t('merchant.orderDetail.inLak') }} {{ formatNumber(item.targetCurrencyShippingPrice) }}</span>
                  </div>
                  <div class="oi-info-item">
                    <span class="oi-label">{{ $t('merchant.orderDetail.costBeforeDiscount') }}</span>
                    <span class="oi-val">{{ formatNumber(item.totalCostBeforeDiscount) }} <span class="oi-currency">{{ item.exchangeRateBuy?.baseCurrency || order.exchangeRateBuy?.baseCurrency || '' }}</span></span>
                    <span class="oi-lak-sub">{{ $t('merchant.orderDetail.inLak') }} {{ formatNumber(item.targetCurrencyTotalCostBeforeDiscount) }}</span>
                  </div>
                </div>
              </div>

              <!-- Discount Section -->
              <div v-if="item.discountType" class="oi-section">
                <div class="oi-section-title discount">{{ $t('merchant.orderDetail.sectionDiscount') }}</div>
                <div class="oi-info-row">
                  <div class="oi-info-item">
                    <span class="oi-label">{{ $t('merchant.orderDetail.discountType') }}</span>
                    <span class="oi-val">
                      <span v-if="item.discountType === 'FIX'" class="discount-type-badge discount-fix">💵 {{ $t('merchant.orderDetail.discountFix') }}</span>
                      <span v-else-if="item.discountType === 'PERCENT'" class="discount-type-badge discount-percent">% {{ $t('merchant.orderDetail.discountPercent') }}</span>
                      <span v-else>{{ item.discountType }}</span>
                    </span>
                  </div>
                  <div class="oi-info-item">
                    <span class="oi-label">{{ $t('merchant.orderDetail.discountValue') }}</span>
                    <span class="oi-val">{{ formatNumber(item.discountValue ?? '0') }} <span class="oi-currency">{{ item.exchangeRateBuy?.baseCurrency || order.exchangeRateBuy?.baseCurrency || '' }}</span></span>
                    <span class="oi-lak-sub">{{ $t('merchant.orderDetail.inLak') }} {{ formatNumber(item.targetCurrencyDiscountValue ?? '0') }}</span>
                  </div>
                  <!-- <div class="oi-info-item">
                    <span class="oi-label">{{ $t('merchant.orderDetail.discountAmount') }}</span>
                    <span class="oi-val">-{{ formatNumber(item.discountAmount) }} <span class="oi-currency">{{ item.exchangeRateBuy?.baseCurrency || order.exchangeRateBuy?.baseCurrency || '' }}</span></span>
                    <span class="oi-lak-sub">{{ $t('merchant.orderDetail.inLak') }} -{{ formatNumber(item.targetCurrencyDiscountAmount) }}</span>
                  </div> -->
                </div>
              </div>

              <!-- Final Cost -->
              <div class="oi-info-row highlight-row">
                <div class="oi-info-item">
                  <span class="oi-label">{{ $t('merchant.orderDetail.finalCostLak') }}</span>
                  <span class="oi-val highlight-val">{{ formatNumber(item.finalCost) }} <span class="oi-currency oi-currency-highlight">{{ item.exchangeRateBuy?.baseCurrency || order.exchangeRateBuy?.baseCurrency || '' }}</span></span>
                  <span class="oi-lak-sub highlight-lak">{{ $t('merchant.orderDetail.inLak') }} {{ formatNumber(item.targetCurrencyFinalCost) }}</span>
                </div>
              </div>

              <!-- Selling Section -->
              <div class="oi-section">
                <div class="oi-section-title selling">{{ $t('merchant.orderDetail.sectionSelling') }}</div>
                <div class="oi-info-row">
                  <div class="oi-info-item">
                    <span class="oi-label">{{ $t('merchant.orderDetail.sellingPrice') }} ({{ item.exchangeRateSell?.baseCurrency || order.exchangeRateSell?.baseCurrency || '-' }})</span>
                    <span class="oi-val">{{ formatNumber(item.sellingPriceForeign) }} <span class="oi-currency">{{ item.exchangeRateSell?.baseCurrency || order.exchangeRateSell?.baseCurrency || '' }}</span></span>
                    <span class="oi-lak-sub">{{ $t('merchant.orderDetail.inLak') }} {{ formatNumber(item.targetCurrencySellingPriceForeign) }}</span>
                  </div>
                  <div class="oi-info-item"> 
                    <div class=" !text-blue-500 !ml-3"><SwapOutlined /></div>
                    <span class="oi-label">{{ $t('merchant.orderDetail.sellingRate') }}</span>
                    <span class="oi-val">{{ formatNumber(item.exchangeRateSellValue || order.exchangeRateSellValue || '0') }}</span>
                  </div>
                  <div class="oi-info-item">
                    <span class="oi-label">{{ $t('merchant.orderDetail.sellingTotal') }}</span>
                    <span class="oi-val">{{ formatNumber(item.sellingTotal) }} <span class="oi-currency">{{ item.exchangeRateSell?.baseCurrency || order.exchangeRateSell?.baseCurrency || '' }}</span></span>
                    <span class="oi-lak-sub">{{ $t('merchant.orderDetail.inLak') }} {{ formatNumber(item.targetCurrencySellingTotal) }}</span>
                  </div>
                </div>
              </div>

              <!-- Profit -->
              <div class="oi-info-row" :class="{ 'profit-pos-row': Number(item.targetCurrencyProfit) >= 0, 'profit-neg-row': Number(item.targetCurrencyProfit) < 0 }">
                <div class="oi-info-item">
                  <span class="oi-label">{{ $t('merchant.orderDetail.profitLak') }}</span>
                  <span class="oi-val profit-val">{{ formatNumber(item.targetCurrencyProfit) }} <span class="oi-currency">LAK</span></span>
                </div>
                <div class="oi-info-item">
                  <span class="oi-label">{{ $t('merchant.orderDetail.profitLak') }}</span>
                  <span class="oi-val profit-val">{{ truncNum(order.totalProfit) }}  <span class="oi-currency">{{ sellCurrency }}</span></span>
                </div>
                <!-- <span class="finance-value num-truncate">{{ truncNum(order.totalProfit) }} <span class="fin-currency">{{ sellCurrency }}</span></span>d -->
              </div>
            </div>
          </div>
        </a-card>

        <!-- Customer Orders Card -->
        <a-card :bordered="false" class="panel-card mb-4">
          <div class="panel-title">
            <TeamOutlined class="icon-blue" />
            <span>{{ $t('merchant.orderDetail.customerOrders') }}</span>
            <a-tag class="count-tag">{{ order.customerOrders?.length || 0 }}</a-tag>
          </div>

          <a-empty v-if="!order.customerOrders || order.customerOrders.length === 0" :description="$t('merchant.orderDetail.noCustomerOrders')" />

          <div v-for="co in order.customerOrders" :key="co.id" class="co-block">
            <div class="co-header">
              <div class="co-customer-info">
                <span class="co-customer-name">{{ co.customer?.customerName || $t('merchant.orderDetail.unknownCustomer') }}</span>
                <a-tag v-if="co.customer?.customerType" :color="co.customer.customerType === 'AGENT' ? 'purple' : 'blue'" class="pill-tag">
                  {{ co.customer.customerType }}
                </a-tag>
              </div>
              <a-tag :color="paymentColor(co.paymentStatus)" class="pill-tag">
                {{ paymentLabel(co.paymentStatus) }}
              </a-tag>
            </div>

            <div class="co-finance-row">
              <div class="co-fin-item">
                <span class="co-fin-label">{{ $t('merchant.orderDetail.sellingAmountLak') }}</span>
                <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(co.totalSellingAmount) }} {{ sellCurrency }}</template>
                  <span class="co-fin-value num-truncate">{{ truncNum(co.totalSellingAmount) }} <span class="co-fin-currency">{{ sellCurrency }}</span></span>
                </a-tooltip>
                <span class="co-fin-lak-sub">{{ $t('merchant.orderDetail.inLak') }} {{ truncNum(co.targetCurrencyTotalSellingAmount) }}</span>
              </div>
              <div class="co-fin-item">
                <span class="co-fin-label">{{ $t('merchant.orderDetail.paid') }}</span>
                <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(co.paidAmount) }} {{ sellCurrency }}</template>
                  <span class="co-fin-value num-truncate" :class="{ 'co-fin-paid': co.paymentStatus === 'PAID' }">{{ truncNum(co.paidAmount) }} <span class="co-fin-currency">{{ sellCurrency }}</span></span>
                </a-tooltip>
                <span class="co-fin-lak-sub">{{ $t('merchant.orderDetail.inLak') }} {{ truncNum(co.targetCurrencyPaidAmount) }}</span>
              </div>
              <div class="co-fin-item">
                <span class="co-fin-label">{{ $t('merchant.orderDetail.remaining') }}</span>
                <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(co.remainingAmount) }} {{ sellCurrency }}</template>
                  <span class="co-fin-value remaining num-truncate" :class="{ 'co-fin-unpaid': co.paymentStatus === 'UNPAID' || co.paymentStatus === 'PARTIAL' }">{{ truncNum(co.remainingAmount) }} <span class="co-fin-currency">{{ sellCurrency }}</span></span>
                </a-tooltip>
                <span class="co-fin-lak-sub">{{ $t('merchant.orderDetail.inLak') }} {{ truncNum(co.targetCurrencyRemainingAmount) }}</span>
              </div>
            </div>

            <!-- Customer Order Items -->
            <template v-if="co.customerOrderItems && co.customerOrderItems.length > 0">
              <div class="co-items-title">{{ $t('merchant.orderDetail.items') }}</div>

              <a-table
                v-if="!isMobile"
                :columns="coItemColumns"
                :data-source="co.customerOrderItems"
                :pagination="false"
                row-key="id"
                size="small"
              >
                <template #bodyCell="{ column, record: coItem }">
                  <template v-if="column.key === 'orderItem'">
                    {{ getCoItemProductName(coItem) }}
                  </template>
                  <template v-else-if="column.key === 'sellingPriceLak'">
                    {{ formatNumber(coItem.sellingTotal) }} {{ order.exchangeRateSell?.baseCurrency || '' }}
                  </template>
                  <!-- <template v-else-if="column.key === 'profitLak'">
                    <span :class="{ 'profit-positive': Number(coItem.profit) >= 0, 'profit-negative': Number(coItem.profit) < 0 }">
                      {{ formatNumber(coItem.profit) }} {{ order.exchangeRateSell?.baseCurrency || '' }}
                    </span>
                  </template> -->
                </template>
              </a-table>

              <!-- <div v-if="isMobile" class="co-items-mobile">
                <div v-for="coItem in co.customerOrderItems" :key="coItem.id" class="co-item-card">
                  <div class="co-item-name">{{ getCoItemProductName(coItem) }}</div>
                  <div class="co-item-details">
                    <span>{{ $t('merchant.orderDetail.qty') }}: {{ coItem.quantity }}</span>
                    <span>{{ formatNumber(coItem.sellingTotal) }} {{ order.exchangeRateSell?.baseCurrency }}</span>
                  </div>
                  <div class="co-item-details">
                    <span>{{ $t('merchant.orderDetail.profitLak') }}</span>
                    <span :class="{ 'profit-positive': Number(coItem.profit) >= 0, 'profit-negative': Number(coItem.profit) < 0 }">{{ formatNumber(coItem.profit) }} {{  order.exchangeRateSell?.targetCurrency || '' }}</span>
                  </div>
                </div>
              </div> -->
            </template>
          </div>
        </a-card>
      </template>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  DollarOutlined,
  ShoppingOutlined,
  TeamOutlined,
  SwapOutlined,
} from '@ant-design/icons-vue';
import { orderRepository } from '@/infrastructure/repositories/order.repository';
import type { Order, PaymentStatusEnum } from '@/domain/entities/user.entity';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import { handleApiError } from '@/shared/utils/error';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { isMobile } = useIsMobile();

const loading = ref(false);
const order = ref<Order | null>(null);

const computedTotalPaid = computed(() =>
  (order.value?.customerOrders ?? []).reduce((sum, co) => sum + Number(co.paidAmount || 0), 0).toString()
);
const computedTotalRemaining = computed(() =>
  (order.value?.customerOrders ?? []).reduce((sum, co) => sum + Number(co.remainingAmount || 0), 0).toString()
);
const computedTotalPaidLak = computed(() =>
  (order.value?.customerOrders ?? []).reduce((sum, co) => sum + Number(co.targetCurrencyPaidAmount || 0), 0).toString()
);
const computedTotalRemainingLak = computed(() =>
  (order.value?.customerOrders ?? []).reduce((sum, co) => sum + Number(co.targetCurrencyRemainingAmount || 0), 0).toString()
);

const buyCurrency = computed(() => order.value?.exchangeRateBuy?.baseCurrency ?? '');
const sellCurrency = computed(() => order.value?.exchangeRateSell?.baseCurrency ?? '');

const coItemColumns = computed(() => [
  { title: t('merchant.orderDetail.colProduct'), key: 'orderItem' },
  { title: t('merchant.orderDetail.quantity'), key: 'quantity', dataIndex: 'quantity', width: 80, align: 'center' as const },
  { title: t('merchant.orderDetail.sellingPriceLak'), key: 'sellingPriceLak', width: 150, align: 'right' as const },
  // { title: t('merchant.orderDetail.profitLak'), key: 'profitLak', width: 150, align: 'right' as const },
]);

const paymentColor = (status: PaymentStatusEnum) => {
  if (status === 'PAID') return 'green';
  if (status === 'PARTIAL') return 'orange';
  return 'red';
};
const paymentLabel = (status: PaymentStatusEnum) => {
  if (status === 'PAID') return t('merchant.orderDetail.paymentPaid');
  if (status === 'PARTIAL') return t('merchant.orderDetail.paymentPartial');
  return t('merchant.orderDetail.paymentUnpaid');
};

const formatNumber = (val: string | number) => Number(val || 0).toLocaleString();
const truncNum = (val: string | number, maxLen = 12) => {
  const formatted = Number(val || 0).toLocaleString();
  return formatted.length > maxLen ? formatted.slice(0, maxLen) + '…' : formatted;
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
};

const formatDateOnly = (dateStr: string | Date) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString();
};

const getOrderItemName = (orderItemId: number) => {
  const item = order.value?.orderItems?.find(i => i.id === orderItemId);
  if (!item) return `#${orderItemId}`;
  return item.variant ? `${item.productName} (${item.variant})` : item.productName;
};

const getCoItemProductName = (coItem: any) => {
  if (coItem.orderItem?.productName) {
    const oi = coItem.orderItem;
    return oi.variant ? `${oi.productName} (${oi.variant})` : oi.productName;
  }
  if (coItem.productName) {
    return coItem.variant ? `${coItem.productName} (${coItem.variant})` : coItem.productName;
  }
  return getOrderItemName(coItem.orderItemId);
};

const goBack = () => {
  router.push('/merchant/orders');
};

const fetchOrder = async () => {
  const id = Number(route.params.id);
  if (!id) return;
  loading.value = true;
  try {
    order.value = await orderRepository.getById(id);
  } catch (err) {
    handleApiError(err, t);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchOrder();
});
</script>

<style scoped>
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }

.page-head {
  margin-bottom: 16px;
}
.back-btn {
  font-weight: 700;
  color: #1d4ed8;
  border-radius: 10px;
  padding: 4px 12px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.back-btn:hover { background: rgba(29, 78, 216, 0.08) !important; }

.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.panel-title {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.icon-blue { color: #1d4ed8; font-size: 18px; }
.count-tag {
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  background: #eff6ff;
  color: #1d4ed8;
  border: none;
}

.order-code { font-weight: 700; color: #1d4ed8; }
.pill-tag { border-radius: 999px; padding: 2px 10px; font-weight: 800; font-size: 12px; }

/* Order Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-label {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.info-value {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}
/* Financial Grid */
.finance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.finance-item {
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.finance-item.highlight {
  background: #eff6ff;
  border-color: rgba(29, 78, 216, 0.15);
}
.finance-item.profit-positive-bg {
  background: #f0fdf4;
  border-color: rgba(22, 163, 74, 0.15);
}
.finance-item.profit-negative-bg {
  background: #fef2f2;
  border-color: rgba(220, 38, 38, 0.15);
}

/* Individual Finance Item Background Colors */
.finance-item.purchase-cost {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
}

.finance-item.shipping-cost {
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
  border: 1px solid #ea580c;
}

.finance-item.cost-before-discount {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
}

.finance-item.discount {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
  border: 1px solid #ef4444;
}

.finance-item.final-cost {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
}

.finance-item.selling-amount {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 1px solid #10b981;
}

.finance-item.deposit {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 1px solid #3b82f6;
}

.finance-item.paid {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 1px solid #10b981;
}

.finance-item.remaining {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
  border: 1px solid #ef4444;
}
.finance-label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.finance-value {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}
.finance-value.remaining { color: #dc2626; }
.finance-sub {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

/* Order Items */
.item-name { font-weight: 700; color: #0f172a; }
.item-variant { color: #64748b; font-size: 13px; margin-left: 4px; }
.item-num { font-weight: 800; color: #1d4ed8; font-size: 13px; }

.items-cards { display: flex; flex-direction: column; gap: 14px; }
.oi-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 18px 20px 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  transition: box-shadow 0.15s ease;
}
.oi-card:hover { box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06); }
.oi-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.oi-section {
  margin: 8px 0;
  padding: 10px 14px 6px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.oi-section-title {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.oi-section-title.purchase { color: #1d4ed8; }
.oi-section-title.selling { color: #059669; }
.oi-section-title.discount { color: #d97706; }

.oi-info-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px 16px;
  margin-bottom: 8px;
}
.oi-info-item { display: flex; flex-direction: column; gap: 2px; }
.oi-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.2px; }
.oi-val { font-size: 13px; font-weight: 700; color: #1e293b; }

.highlight-row {
  background: #eff6ff;
  border-radius: 8px;
  padding: 10px 14px;
  margin: 8px 0;
  border: 1px solid rgba(29, 78, 216, 0.12);
}
.highlight-val { color: #1d4ed8 !important; font-weight: 800; }

.profit-pos-row { background: #f0fdf4; border-radius: 8px; padding: 10px 14px; margin: 4px 0; border: 1px solid rgba(22, 163, 74, 0.12); }
.profit-neg-row { background: #fef2f2; border-radius: 8px; padding: 10px 14px; margin: 4px 0; border: 1px solid rgba(220, 38, 38, 0.12); }
.profit-val { font-weight: 800; }
.profit-positive { color: #16a34a; font-weight: 800; }
.profit-negative { color: #dc2626; font-weight: 800; }

/* Customer Order Blocks */
.co-block {
  background: #f8fafc;
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  transition: box-shadow 0.15s ease;
}
.co-block:last-child { margin-bottom: 0; }
.co-block:hover { box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06); }
.co-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.co-customer-info { display: flex; align-items: center; gap: 8px; }
.co-customer-name { font-weight: 800; color: #0f172a; font-size: 15px; }

.co-finance-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}
.co-fin-item { display: flex; flex-direction: column; align-items: center; }
.co-fin-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.3px; }
.co-fin-value { font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px; }
.co-fin-value.remaining { color: #dc2626; }
.co-fin-currency { font-size: 10px; font-weight: 600; color: #94a3b8; margin-left: 2px; }
.co-fin-paid { color: #16a34a !important; }
.co-fin-unpaid { color: #dc2626 !important; }
.co-fin-lak-sub { font-size: 10px; color: #64748b; font-weight: 600; display: block; margin-top: 1px; }

.co-items-title {
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  margin: 8px 0;
  padding-top: 8px;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
}

.co-items-mobile { display: flex; flex-direction: column; gap: 6px; }
.co-item-card {
  background: #fff;
  border-radius: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.co-item-name { font-weight: 700; color: #0f172a; font-size: 13px; margin-bottom: 4px; }
.co-item-details {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.num-truncate {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Currency labels */
.fin-currency {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}
.finance-lak-sub {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  margin-top: 2px;
  display: block;
}
.oi-currency {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  margin-left: 2px;
}
.oi-currency-highlight { color: #3b82f6; }
.oi-lak-sub {
  font-size: 10px;
  color: #64748b;
  font-weight: 600;
  margin-top: 2px;
  display: block;
}
.highlight-lak { color: #1d4ed8; }

/* Exchange Rate Card */
.rate-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}
.rate-card {
  border-radius: 14px;
  padding: 16px 18px;
  border: 1.5px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rate-buy {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: rgba(59, 130, 246, 0.25);
}
.rate-sell {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: rgba(34, 197, 94, 0.25);
}
.rate-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.rate-type-badge {
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.3px;
}
.rate-type-badge.buy { background: #dbeafe; color: #1d4ed8; }
.rate-type-badge.sell { background: #dcfce7; color: #15803d; }
.rate-pair {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
}
.rate-value {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
}
.rate-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.rate-date {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
}

/* Discount type badges */
.discount-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 700;
}
.discount-fix {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #f59e0b;
}
.discount-percent {
  background: #ede9fe;
  color: #5b21b6;
  border: 1px solid #8b5cf6;
}

/* Galaxy Tab S7 (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .panel-card :deep(.ant-card-body) { padding: 14px !important; }
  .panel-title { font-size: 15px; }
  
  /* Order Info Grid */
  .info-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .info-label { font-size: 12px; }
  .info-value { font-size: 14px; }
  
  /* Financial Grid */
  .finance-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .finance-item { padding: 12px 14px; }
  .finance-label { font-size: 12px; }
  .finance-value { font-size: 15px; }
  .fin-currency { font-size: 10px; }
  .finance-lak-sub { font-size: 10px; }
  
  /* Exchange Rate Card */
  .rate-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .rate-card { padding: 14px 16px; }
  .rate-value { font-size: 20px; }
  .rate-pair { font-size: 12px; }
  
  /* Order Items */
  .order-items { gap: 12px; }
  .order-item { padding: 16px; }
  .oi-section-title { font-size: 13px; }
  .oi-label { font-size: 12px; }
  .oi-val { font-size: 14px; }
  .oi-currency { font-size: 9px; }
  .oi-lak-sub { font-size: 9px; }
  
  /* Customer Orders */
  .co-block { padding: 16px 14px; }
  .co-header { margin-bottom: 12px; }
  .co-name { font-size: 15px; }
  .co-status { font-size: 11px; }
  .co-finance-row { gap: 8px; }
  .co-fin-item { flex: 1; }
  .co-fin-label { font-size: 9px; }
  .co-fin-value { font-size: 13px; }
  .co-fin-currency { font-size: 9px; }
  .co-fin-lak-sub { font-size: 9px; }
  
  /* Table */
  .co-item-table :deep(.ant-table-thead > tr > th) { font-size: 12px; padding: 8px 12px; }
  .co-item-table :deep(.ant-table-tbody > tr > td) { font-size: 12px; padding: 8px 12px; }
  .co-items-mobile { gap: 8px; }
  .co-item-mobile { padding: 12px; }
}

/* Mobile (< 768px) */
@media (max-width: 767px) {
  .panel-card { border-radius: 10px; }
  .panel-card :deep(.ant-card-body) { padding: 12px !important; }
  .panel-title { font-size: 14px; }
  .icon-blue { font-size: 16px; }
  
  /* Order Info Grid */
  .info-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
  .info-item { padding: 8px 0; }
  .info-label { font-size: 11px; }
  .info-value { font-size: 13px; }
  .order-code { font-size: 12px; }
  
  /* Exchange Rate Card */
  .rate-grid { grid-template-columns: 1fr; gap: 12px; }
  .rate-card { padding: 12px 14px; }
  .rate-card-header { flex-direction: column; align-items: flex-start; gap: 6px; }
  .rate-value { font-size: 18px; }
  .rate-pair { font-size: 12px; }
  .rate-label { font-size: 10px; }
  .rate-date { font-size: 10px; }
  
  /* Financial Grid */
  .finance-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
  .finance-item { padding: 10px 12px; }
  .finance-label { font-size: 11px; }
  .finance-value { font-size: 14px; }
  .fin-currency { font-size: 9px; }
  .finance-lak-sub { font-size: 9px; margin-top: 1px; }
  
  /* Order Items */
  .order-items { gap: 10px; }
  .order-item { padding: 12px; border-radius: 10px; }
  .oi-section-title { font-size: 12px; margin-bottom: 8px; }
  .oi-info-row { gap: 8px; }
  .oi-info-item { flex: 1; min-width: 0; }
  .oi-label { font-size: 11px; }
  .oi-val { font-size: 13px; word-break: break-all; }
  .oi-currency { font-size: 8px; }
  .oi-lak-sub { font-size: 8px; margin-top: 1px; }
  .highlight-val { font-size: 14px; }
  .oi-currency-highlight { font-size: 9px; }
  .highlight-lak { font-size: 9px; }
  .profit-val { font-size: 13px; }
  
  /* Discount badges */
  .discount-type-badge { font-size: 10px; padding: 1px 8px; }
  
  /* Customer Orders */
  .co-block { padding: 12px 10px; border-radius: 10px; }
  .co-header { margin-bottom: 10px; flex-direction: column; align-items: flex-start; gap: 6px; }
  .co-name { font-size: 14px; }
  .co-status { font-size: 10px; padding: 2px 8px; }
  .co-finance-row { gap: 6px; flex-wrap: wrap; }
  .co-fin-item { flex: 1; min-width: 100px; }
  .co-fin-label { font-size: 9px; }
  .co-fin-value { font-size: 13px; }
  .co-fin-currency { font-size: 8px; }
  .co-fin-lak-sub { font-size: 8px; margin-top: 1px; }
  
  /* Table */
  .co-item-table { font-size: 12px; }
  .co-item-table :deep(.ant-table-thead > tr > th) { font-size: 11px; padding: 6px 8px; }
  .co-item-table :deep(.ant-table-tbody > tr > td) { font-size: 11px; padding: 6px 8px; }
  .co-items-mobile { gap: 6px; }
  .co-item-mobile { padding: 10px 8px; }
  .co-item-name { font-size: 12px; }
  .co-item-details { font-size: 10px; }
  .profit-positive { font-size: 11px; }
  .profit-negative { font-size: 11px; }
  
  /* Pills and tags */
  .pill-tag { font-size: 10px; padding: 1px 6px; }
}
</style>

<style>
.blue-tooltip .ant-tooltip-inner {
  background: #1d4ed8 !important;
  color: #fff !important;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 12px;
  max-width: 320px;
  word-break: break-word;
}
.blue-tooltip .ant-tooltip-arrow::before {
  background: #1d4ed8 !important;
}
</style>
