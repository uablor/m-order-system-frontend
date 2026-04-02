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
            <a-button 
              v-if="selectedOrderItemId" 
              type="text" 
              size="small" 
              @click="backToOrderItems"
              class="back-to-items-btn"
            >
              <ArrowLeftOutlined />
              {{ $t('common.back') }}
            </a-button>
          </div>

          <a-empty v-if="!order.orderItems || order.orderItems.length === 0" :description="$t('merchant.orderDetail.noItems')" />

          <!-- Cards View -->
          <div v-if="!selectedOrderItemId && order.orderItems && order.orderItems.length > 0" class="items-grid">
            <div 
              v-for="(item, idx) in order.orderItems" 
              :key="item.id" 
              class="item-card"
            >
              <!-- Image Section -->
              <div class="item-image-section">
                <img 
                  v-if="item.image?.publicUrl" 
                  :src="item.image.publicUrl" 
                  :alt="item.productName"
                  class="item-image"
                  @error="handleImageError"
                />
                <div v-else class="item-image-placeholder">
                  <ShoppingOutlined />
                </div>
              </div>

              <!-- Content Section -->
              <div class="item-content">
                <div class="item-header">
                  <span class="item-num">#{{ idx + 1 }}</span>
                  <span class="item-name truncated-text">{{ item.productName }}</span>
                </div>

                <!-- Order Item Summary -->
                <div class="item-summary">
                  <div class="summary-row">
                    <span class="summary-label">{{ $t('merchant.orderDetail.totalQuantity') }}:</span>
                    <span class="summary-value">{{ item.quantity }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">{{ $t('merchant.orderDetail.skus') }}:</span>
                    <span class="summary-value">{{ (item as any).skus?.length || 0 }}</span>
                  </div>
                </div>

                <!-- View Detail Button -->
                <div class="action-section">
                  <a-button type="primary" size="small" @click="selectOrderItem(item.id)">
                    <EyeOutlined />
                    {{ $t('merchant.orderDetail.viewDetails') }}
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Detail View with SKU Cards -->
          <div v-if="selectedOrderItemId && selectedOrderItem" class="item-detail-view">
            <!-- Detail Header -->
            <div class="detail-header">
              <div class="detail-info">
                <h3 class="detail-title">{{ selectedOrderItem.productName }}</h3>
                <span class="detail-quantity">Total Quantity: {{ selectedOrderItem.quantity }}</span>
              </div>
              <div class="detail-actions">
              </div>
            </div>

            <!-- SKU Navigation -->
            <div class="sku-navigation">
              <div class="nav-controls">
                <a-button 
                  type="text" 
                  size="small" 
                  :disabled="currentSkuIndex === 0"
                  @click="navigateSku('prev')"
                >
                  <ArrowLeftOutlined />
                </a-button>
                <span class="sku-counter">{{ currentSkuIndex + 1 }} / {{ ((selectedOrderItem as any).skus?.length || 0) }}</span>
                <a-button 
                  type="text" 
                  size="small" 
                  :disabled="currentSkuIndex === ((selectedOrderItem as any).skus?.length || 0) - 1"
                  @click="navigateSku('next')"
                >
                  <ArrowRightOutlined class="rotate-180" />
                </a-button>
              </div>
            </div>

            <!-- SKU Cards Horizontal Scroller -->
            <div class="sku-scroller" ref="skuScrollerRef">
              <div class="sku-cards-container">
                <div 
                  v-for="(sku, skuIndex) in (selectedOrderItem as any).skus" 
                  :key="sku.id"
                  class="sku-detail-card"
                  :class="{ active: currentSkuIndex === skuIndex }"
                >
                  <!-- SKU Header -->
                  <div class="sku-card-header">
                    <div class="sku-title">
                      <span class="sku-index">#{{ Number(skuIndex) + 1 }}</span>
                      <span class="sku-variant">{{ sku.variant }}</span>
                    </div>
                    <div class="sku-quantity-badge">
                      Qty: {{ sku.quantity }}
                    </div>
                  </div>

                  <!-- SKU Details -->
                  <div class="sku-details">
                    <!-- Purchase and Selling Information Row -->
                    <div class="info-row">
                      <!-- Purchase Information -->
                      <div class="sku-section purchase-section">
                        <h4 class="section-title">{{ $t('merchant.orderDetail.purchaseInformation') }}</h4>
                        <div class="detail-grid">
                          <div class="detail-item">
                            <span class="detail-label">{{ $t('merchant.orderDetail.purchasePrice') }}:</span>
                            <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(sku.purchasePrice) }} {{ sku.exchangeRateBuy?.baseCurrency || '' }}</template>
                              <span class="detail-value num-truncate">{{ truncNum(sku.purchasePrice) }} {{ sku.exchangeRateBuy?.baseCurrency || '' }}</span>
                            </a-tooltip>
                            <span class="detail-sub">{{ $t('merchant.orderDetail.inLak') }} {{ formatNumber((sku.purchasePrice || 0) * (sku.exchangeRateBuyValue || 1)) }}</span>
                          </div>
                          <div class="detail-item">
                            <span class="detail-label">{{ $t('merchant.orderDetail.purchaseTotal') }}:</span>
                            <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(sku.purchaseTotal) }} {{ sku.exchangeRateBuy?.baseCurrency || '' }}</template>
                              <span class="detail-value num-truncate">{{ truncNum(sku.purchaseTotal) }} {{ sku.exchangeRateBuy?.baseCurrency || '' }}</span>
                            </a-tooltip>
                            <span class="detail-sub">{{ $t('merchant.orderDetail.inLak') }} {{ formatNumber((sku.purchaseTotal || 0) * (sku.exchangeRateBuyValue || 1)) }}</span>
                          </div>
                          <div class="detail-item">
                            <span class="detail-label">{{ $t('merchant.orderDetail.exchangeRate') }}:</span>
                            <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(sku.exchangeRateBuyValue) }}</template>
                              <span class="detail-value num-truncate">{{ truncNum(sku.exchangeRateBuyValue) }}</span>
                            </a-tooltip>
                          </div>
                        </div>
                      </div>

                      <!-- Selling Information -->
                      <div class="sku-section selling-section">
                        <h4 class="section-title">{{ $t('merchant.orderDetail.sellingInformation') }}</h4>
                        <div class="detail-grid">
                          <div class="detail-item">
                            <span class="detail-label">{{ $t('merchant.orderDetail.sellingPrice') }}:</span>
                            <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(sku.sellingPriceForeign) }} {{ sku.exchangeRateSell?.baseCurrency || '' }}</template>
                              <span class="detail-value selling-price num-truncate">{{ truncNum(sku.sellingPriceForeign) }} {{ sku.exchangeRateSell?.baseCurrency || '' }}</span>
                            </a-tooltip>
                            <span class="detail-sub">{{ $t('merchant.orderDetail.inLak') }} {{ formatNumber((sku.sellingPriceForeign || 0) * (sku.exchangeRateSellValue || 1)) }}</span>
                          </div>
                          <div class="detail-item">
                            <span class="detail-label">{{ $t('merchant.orderDetail.sellingTotal') }}:</span>
                            <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(sku.sellingTotal) }} {{ sku.exchangeRateSell?.baseCurrency || '' }}</template>
                              <span class="detail-value selling-price num-truncate">{{ truncNum(sku.sellingTotal) }} {{ sku.exchangeRateSell?.baseCurrency || '' }}</span>
                            </a-tooltip>
                            <span class="detail-sub">{{ $t('merchant.orderDetail.inLak') }} {{ formatNumber((sku.sellingTotal || 0) * (sku.exchangeRateSellValue || 1)) }}</span>
                          </div>
                          <div class="detail-item">
                            <span class="detail-label">{{ $t('merchant.orderDetail.exchangeRate') }}:</span>
                            <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(sku.exchangeRateSellValue) }}</template>
                              <span class="detail-value num-truncate">{{ truncNum(sku.exchangeRateSellValue) }}</span>
                            </a-tooltip>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Profit Information -->
                    <div class="sku-section profit-section">
                      <h4 class="section-title">{{ $t('merchant.orderDetail.profitInformation') }}</h4>
                      <div class="profit-display">
                        <div class="profit-item">
                          <span class="profit-label">{{ $t('merchant.orderDetail.profit') }}:</span>
                          <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(sku.profit) }} {{ sku.exchangeRateSell?.targetCurrency || '' }}</template>
                            <span class="profit-value num-truncate" :class="{ 'profit-positive': Number(sku.profit) >= 0, 'profit-negative': Number(sku.profit) < 0 }">
                              {{ truncNum(sku.profit) }} {{ sku.exchangeRateSell?.baseCurrency || '' }}
                            </span>
                          </a-tooltip>
                          <span class="profit-sub">{{ $t('merchant.orderDetail.inLak') }} {{ formatNumber((sku.profit || 0) * (sku.exchangeRateSellValue || 1)) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
import { ArrowLeftOutlined,ArrowRightOutlined, FileTextOutlined, ShoppingOutlined, TeamOutlined, EyeOutlined, SwapOutlined } from '@ant-design/icons-vue';
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
const selectedOrderItemId = ref<number | null>(null);
const currentSkuIndex = ref(0);
const skuScrollerRef = ref<HTMLElement | null>(null);

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

const getCoItemProductName = (coItem: any) => {
  console.log('=== getCoItemProductName DEBUG ===');
  console.log('coItem:', coItem);
  console.log('coItem.variant:', coItem.variant);
  
  // Return only the variant - this is what you want
  if (coItem.variant) {
    return coItem.variant;
  }
  
  // Fallback to product name if no variant available
  if (coItem.productName) {
    return coItem.productName;
  }
  
  // Final fallback
  return `SKU #${coItem.orderItemSkuId}`;
};

const goBack = () => {
  router.push('/merchant/orders');
};

const selectOrderItem = (itemId: number) => {
  selectedOrderItemId.value = itemId;
  currentSkuIndex.value = 0; // Reset SKU index when selecting new order item
};

const navigateSku = (direction: 'prev' | 'next') => {
  const skus = (selectedOrderItem.value as any)?.skus || [];
  if (skus.length === 0) return;
  
  if (direction === 'prev' && currentSkuIndex.value > 0) {
    currentSkuIndex.value--;
    scrollToSku(currentSkuIndex.value);
  } else if (direction === 'next' && currentSkuIndex.value < skus.length - 1) {
    currentSkuIndex.value++;
    scrollToSku(currentSkuIndex.value);
  }
};

const scrollToSku = (index: number) => {
  if (skuScrollerRef.value) {
    const container = skuScrollerRef.value.querySelector('.sku-cards-container');
    if (container) {
      const cards = container.querySelectorAll('.sku-detail-card');
      if (cards[index]) {
        cards[index].scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'center' 
        });
      }
    }
  }
};

const backToOrderItems = () => {
  selectedOrderItemId.value = null;
};

const handleImageError = (event: any) => {
  // Hide the image and show placeholder on error
  event.target.style.display = 'none';
  const placeholder = event.target.nextElementSibling;
  if (placeholder && placeholder.classList.contains('item-image-placeholder')) {
    placeholder.style.display = 'flex';
  }
};

const selectedOrderItem = computed(() => {
  if (!selectedOrderItemId.value || !order.value?.orderItems) return null;
  return order.value.orderItems.find(item => item.id === selectedOrderItemId.value);
});

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
.item-name {
  font-weight: 700;
  color: #0f172a;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}
.item-variant { color: #64748b; font-size: 13px; margin-left: 4px; }
.item-num { font-weight: 800; color: #1d4ed8; font-size: 13px; }

.clickable-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.clickable-card:hover {
  border-color: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.back-to-items-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}

.click-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
  font-size: 12px;
  margin-top: 8px;
  justify-content: center;
}

.oi-summary-row {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.oi-summary-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.profit-positive {
  color: #059669;
}

.profit-negative {
  color: #dc2626;
}

/* Text truncation */
.truncated-text {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

/* Tooltip styling */
:deep(.ant-tooltip-inner) {
  background-color: #1d4ed8 !important;
  color: #ffffff !important;
  border: 1px solid #1d4ed8 !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  border-radius: 6px !important;
}

:deep(.ant-tooltip-arrow-content) {
  background-color: #1d4ed8 !important;
  border-color: #1d4ed8 !important;
}

.items-cards { display: flex; flex-direction: column; gap: 14px; }

.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 4px;
}

/* Galaxy Tab S7 and Tablets (768px - 1024px) */
@media (max-width: 1024px) and (min-width: 769px) {
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }
  
  .item-card {
    height: 150px;
  }
  
  .item-image-section {
    width: 150px;
  }
  
  .item-content {
    padding: 18px;
  }
}

/* Mobile Landscape and Small Tablets (480px - 768px) */
@media (max-width: 768px) {
  .items-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .item-card {
    height: 140px;
  }
  
  .item-image-section {
    width: 140px;
  }
  
  .item-content {
    padding: 16px;
    gap: 10px;
  }
  
  .info-row,
  .price-row {
    width: 100%;
    font-size: 12px;
  }
  
  .info-value,
  .price-value {
    font-size: 13px;
  }
  
  .profit-label,
  .price-label {
    font-size: 11px;
  }
}

/* Mobile Portrait (max-width: 480px) */
@media (max-width: 480px) {
  .items-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .item-card {
    height: auto;
    min-height: 180px;
    flex-direction: column;
  }
  
  .item-image-section {
    width: 100%;
    height: 120px;
  }
  
  .item-content {
    padding: 12px;
    gap: 8px;
  }
  
  .item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .item-info {
    width: 100%;
  }
  
  .sku-section {
    margin: 8px 0;
    padding: 8px;
  }
  
  .sku-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 6px 8px;
  }
  
  .sku-details {
    align-self: flex-end;
    gap: 8px;
  }
  
  .item-summary {
    margin: 8px 0;
    padding: 8px;
  }
  
  .price-info {
    width: 100%;
  }
  
  .profit-section {
    width: 100%;
  }
  
  .click-hint {
    margin-top: 8px;
    font-size: 11px;
  }
}

/* Ultra Small Mobile (max-width: 360px) */
@media (max-width: 360px) {
  .items-grid {
    gap: 10px;
  }
  
  .item-card {
    min-height: 100px;
  }
  
  .item-image-section {
    height: 100px;
  }
  
  .item-content {
    padding: 10px;
    gap: 6px;
  }
  
  .item-name,
  .info-value,
  .price-value {
    font-size: 12px;
  }
  
  .info-label,
  .price-label,
  .profit-label {
    font-size: 10px;
  }
}

/* Panel Title Responsive */
@media (max-width: 768px) {
  .panel-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .back-to-items-btn {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .panel-title {
    padding: 12px 16px;
  }
  
  .count-tag {
    font-size: 11px;
    padding: 2px 6px;
  }
}

/* Touch-friendly improvements */
@media (hover: none) and (pointer: coarse) {
  .item-card {
    transition: none;
  }
  
  .item-card:active {
    transform: scale(0.98);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
  
  .click-hint {
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0.7;
  }
}

/* Galaxy Tab S7 specific optimizations */
@media (max-width: 1024px) and (min-width: 769px) and (orientation: landscape) {
  .items-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  
  .item-card {
    height: 140px;
  }
}

@media (max-width: 1024px) and (min-width: 769px) and (orientation: portrait) {
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .item-card {
    height: 160px;
  }
}

.item-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: auto;
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
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #ffffff;
  flex: 1;
  overflow-y: auto;
}

.action-section {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}

/* SKU Section Styles */
.sku-section {
  margin: 12px 0;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.sku-header {
  margin-bottom: 8px;
}

.sku-title {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.sku-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sku-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.sku-variant {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  flex: 1;
}

.sku-details {
  display: flex;
  gap: 12px;
  align-items: center;
}

.sku-qty {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.sku-price {
  font-size: 12px;
  color: #059669;
  font-weight: 600;
}

/* Item Summary Styles */
.item-summary {
  margin: 12px 0;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #dbeafe;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.summary-value {
  font-size: 13px;
  color: #1d4ed8;
  font-weight: 700;
}

.item-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.info-label {
  color: #64748b;
  font-weight: 500;
  font-size: 12px;
}

.info-value {
  color: #0f172a;
  font-weight: 600;
  font-size: 14px;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.price-label {
  color: #64748b;
  font-weight: 500;
  font-size: 11px;
}

.price-value {
  color: #0f172a;
  font-weight: 600;
  font-size: 13px;
}

.profit-section {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
  border-radius: 12px;
  margin-top: 16px;
}

.profit-label {
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
}

.profit-value {
  font-size: 13px;
  font-weight: 700;
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

/* SKU Detail Cards Styles */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.detail-info {
  flex: 1;
}

.detail-title {
  font-size: 20px;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.detail-quantity {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
}

.detail-actions {
  flex-shrink: 0;
}

.sku-navigation {
  margin-bottom: 20px;
}

.nav-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.sku-counter {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  background: #ffffff;
  padding: 6px 12px;
  border-radius: 8px;
  min-width: 80px;
  text-align: center;
}

.rotate-180 {
  transform: rotate(180deg);
}

.sku-scroller {
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 16px;
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb;
}

.sku-cards-container {
  display: flex;
  gap: 20px;
  min-width: max-content;
  padding: 4px;
}

.sku-detail-card {
  flex: 0 0 auto;
  width: 400px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sku-detail-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
  transform: translateY(-4px);
}

.sku-detail-card.active {
  border-color: #3b82f6;
  background: #f8fafc;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.sku-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.sku-title {
  flex: 1;
}

.sku-index {
  display: inline-block;
  background: #3b82f6;
  color: white;
  font-size: 12px;
  margin-right: 10px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  margin-bottom: 6px;
}

.sku-variant {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  line-height: 1.4;
}

.sku-quantity-badge {
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #dbeafe;
}

.sku-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* border: #15803d solid 5px; */
  
}

.info-row {
  display: flex;
  gap: 16px;
  /* border: #15803d solid 5px; */
  width: 100%;
  
  /* margin-bottom: 10px; */
}

.sku-details .info-row .sku-section {
  flex: 1;
  min-width: 0;
  /* border: #15803d solid 5px; */

}

.sku-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.sku-section.purchase-section {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #bfdbfe;
}

.sku-section.selling-section {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #bbf7d0;
}

.sku-section.profit-section {
  background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
  border-color: #fde68a;
}

.section-title {
  font-size: 14px;
  font-weight: 800;
  color: #374151;
  margin: 0 0 12px 0;
  letter-spacing: 0.5px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.detail-label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.3px;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.detail-sub {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

.selling-price {
  color: #059669 !important;
  font-weight: 700;
}

.profit-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profit-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  width: 100%;
}

.profit-label {
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  letter-spacing: 0.3px;
}

.profit-value {
  font-size: 16px;
  font-weight: 800;
}

.profit-positive {
  color: #059669 !important;
}

.profit-negative {
  color: #dc2626 !important;
}

.profit-sub {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

/* Large Desktop (lg) */
@media (min-width: 1025px) and (max-width: 1280px) {
  .sku-detail-card {
    width: 450px;
  }
}

/* Extra Large Desktop (xl) */
@media (min-width: 1281px) and (max-width: 1536px) {
  .sku-detail-card {
    width: 500px;
  }
}

/* Extra Extra Large Desktop (xxl) */
@media (min-width: 1537px) {
  .sku-detail-card {
    width: 550px;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .sku-cards-container {
    flex-direction: row;
    gap: 12px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }
  
  .sku-detail-card {
    min-width: 320px;
    scroll-snap-align: start;
    flex-shrink: 0;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .info-row {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 12px;
    width: 100%;
  }
  
  .info-row .sku-section {
    width: 100%;
  }
}

/* Tablet styles - Galaxy Tab S7 and similar */
@media (max-width: 1024px) and (min-width: 769px) {
  .sku-cards-container {
    gap: 16px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }
  
  .sku-detail-card {
    min-width: 350px;
    scroll-snap-align: start;
    flex-shrink: 0;
  }
  
  .info-row {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 12px;
    width: 100%;
  }
  
  .info-row .sku-section {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .nav-controls {
    padding: 8px;
    gap: 12px;
  }
  
  .sku-counter {
    font-size: 12px;
    padding: 4px 8px;
    min-width: 60px;
  }
  
  .sku-detail-card {
    padding: 16px;
  }
  
  .sku-section {
    padding: 12px;
  }
  
  .detail-item {
    padding: 8px;
  }
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
