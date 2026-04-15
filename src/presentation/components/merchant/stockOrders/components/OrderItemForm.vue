<template>
  
  <!-- Order Item Label Outside Border -->
  <div class="item-label-outside">
    {{ $t('merchant.orders.items.orderItemNumber', { number: index + 1 }) }}
  </div>
  
  <div class="item-block" :style="{ borderColor: itemBorderColor, boxShadow: `0 2px 12px ${itemBorderColor}22` }">
    
    <div class="item-color-strip" :style="{ background: itemBorderColor }" />
    <div class="item-header">
      <span class="item-num" :style="{ color: itemBorderColor, borderColor: `${itemBorderColor}44`, background: `${itemBorderColor}12` }">#{{ index + 1 }}</span>
      <a-button type="text" danger size="small" @click="$emit('remove', item.uid)"><DeleteOutlined /></a-button>
    </div>
    <a-form layout="vertical" class="item-form">
      <!-- Top Section: Product Name + Upload Image + Shipping & Discount -->
      <template v-if="!isMobile">
        <a-row :gutter="[16, 0]">
          <!-- Left Column: Image Upload -->
          <a-col :sm="24" :md="8">
            <a-form-item :label="$t('merchant.orders.items.productImage')">
              <div v-if="!variantForCalculation.productImage" class="avatar-upload-container" :class="{ uploading: imageUploading }">
                <div class="avatar-upload-placeholder">
                  <div class="avatar-upload-icon">
                    <CameraOutlined />
                  </div>
                  <div class="avatar-upload-text">
                    <div class="avatar-upload-title">{{ $t('merchant.orders.items.uploadProductImage') }}</div>
                    <div class="avatar-upload-subtitle">{{ $t('common.optional') }}</div>
                  </div>
                </div>
                <a-upload
                  :before-upload="beforeImageUpload"
                  :custom-request="handleImageUpload"
                  :show-upload-list="false"
                  accept="image/*"
                  class="avatar-upload-input"
                >
                  <div class="avatar-upload-trigger"></div>
                </a-upload>
                <!-- Loading State -->
                <div v-if="imageUploading" class="avatar-upload-loading">
                  <a-spin size="large" />
                </div>
              </div>
              <div v-else class="uploaded-image-container">
                <div class="uploaded-image-content">
                  <div class="uploaded-image-preview">
                    <img 
                      :src="variantForCalculation.productImage" 
                      alt="Product" 
                      class="uploaded-image-img"
                    />
                    <!-- Hover Overlay with Actions -->
                    <div class="uploaded-image-overlay">
                      <div class="uploaded-image-actions">
                        <a-button 
                          type="primary" 
                          size="small" 
                          class="uploaded-image-action-btn uploaded-image-view-btn"
                          @click="previewImage(variantForCalculation.productImage || '')"
                        >
                          <template #icon><EyeOutlined /></template>
                        </a-button>
                        <a-button 
                          type="primary" 
                          danger 
                          size="small" 
                          class="uploaded-image-action-btn uploaded-image-delete-btn"
                          @click="removeImage"
                        >
                          <template #icon><DeleteOutlined /></template>
                        </a-button>
                      </div>
                    </div>
                  </div>
                </div>
                <a-upload
                  :before-upload="beforeImageUpload"
                  :custom-request="handleImageUpload"
                  :show-upload-list="false"
                  accept="image/*"
                  class="hidden-upload-input"
                  ref="fileUploadRef"
                >
                  <div class="upload-trigger"></div>
                </a-upload>
              </div>
            </a-form-item>
          </a-col>
    
          <!-- Right Column: Product Name + Shipping + Discount -->
          <a-col :sm="24" :md="16">
            <a-form-item
              :label="$t('merchant.orders.items.productName')"
              :validate-status="errors.productName ? 'error' : ''"
              :help="errors.productName || ''"
            >
              <a-input
                v-model:value="item.productName"
                :placeholder="$t('merchant.orders.items.productNamePh')"
                :status="errors.productName ? 'error' : undefined"
                :data-testid="`item-product-name-${index}`"
                @input="onFieldChange('productName')"
              />
            </a-form-item>
            
            <!-- Shipping and Discount Row -->
            <a-row :gutter="[16, 0]">
              <a-col :span="12">
                <a-form-item :label="`${$t('merchant.orders.items.shippingPrice')} (${buyBaseCcy})`">
                  <a-input-number v-model:value="item.shippingPrice" :formatter="numFormatter" :parser="numParser" class="w-full" />
                </a-form-item>
              </a-col>
              <a-col v-if="!isBuySameCurrency" :span="12">
                <a-form-item :label="`${$t('merchant.orders.items.shippingKip')} (${buyTargetCcy})`">
                  <a-input :value="fmtNum(calc.calcShippingLak(variantForCalculation))" disabled class="w-full" />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="[16, 0]">
              <a-col :span="12">
                <a-form-item :label="$t('merchant.orders.items.discountType')">
                  <a-select v-model:value="item.discountType" allow-clear :placeholder="$t('merchant.orders.items.noDiscount')" class="w-full">
                    <a-select-option value="percent">%</a-select-option>
                    <a-select-option value="cash">{{ $t('merchant.orders.items.cash') }}</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item :label="`${$t('merchant.orders.items.discountValue')} (${buyBaseCcy})`">
                  <a-input-number v-model:value="item.discountValue" :formatter="numFormatter" :parser="numParser" class="w-full" :disabled="!item.discountType" />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row v-if="!isBuySameCurrency" :gutter="[16, 0]">
              <a-col :span="24">
                <a-form-item :label="`${$t('merchant.orders.items.discountKip')} (${buyTargetCcy})`">
                  <a-input :value="fmtNum(calc.calcDiscountLak(variantForCalculation))" disabled class="w-full" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-col>
        </a-row>
      </template>
      <template v-else>
        <a-form-item
          :label="$t('merchant.orders.items.productName')"
          :validate-status="errors.productName ? 'error' : ''"
          :help="errors.productName || ''"
        >
          <a-input
            v-model:value="item.productName"
            :placeholder="$t('merchant.orders.items.productNamePh')"
            :status="errors.productName ? 'error' : undefined"
            :data-testid="`item-product-name-${index}`"
            @input="onFieldChange('productName')"
          />
        </a-form-item>
        <a-form-item :label="$t('merchant.orders.items.productImage')">
          <div v-if="!variantForCalculation.productImage" class="avatar-upload-container" :class="{ uploading: imageUploading }">
            <div class="avatar-upload-placeholder">
              <div class="avatar-upload-icon">
                <CameraOutlined />
              </div>
              <div class="avatar-upload-text">
                <div class="avatar-upload-title">{{ $t('merchant.orders.items.uploadProductImage') }}</div>
                <div class="avatar-upload-subtitle">{{ $t('common.optional') }}</div>
              </div>
            </div>
            <a-upload
              :before-upload="beforeImageUpload"
              :custom-request="handleImageUpload"
              :show-upload-list="false"
              accept="image/*"
              class="avatar-upload-input"
            >
              <div class="avatar-upload-trigger"></div>
            </a-upload>
            <!-- Loading State -->
            <div v-if="imageUploading" class="avatar-upload-loading">
              <a-spin size="large" />
            </div>
          </div>
          <div v-else class="uploaded-image-container">
            <div class="uploaded-image-content">
              <div class="uploaded-image-preview">
                <img 
                  :src="variantForCalculation.productImage" 
                  alt="Product" 
                  class="uploaded-image-img"
                />
              </div>
              <div class="uploaded-image-text clickable" @click="triggerFileUpload">
                {{ getFileName(variantForCalculation.productImage) }}
              </div>
              <div class="uploaded-image-actions">
                <a-button 
                  type="primary" 
                  size="small" 
                  class="uploaded-image-action-btn uploaded-image-view-btn"
                  @click="previewImage(variantForCalculation.productImage || '')"
                >
                  <template #icon><EyeOutlined /></template>
                </a-button>
                <a-button 
                  type="primary" 
                  danger 
                  size="small" 
                  class="uploaded-image-action-btn uploaded-image-delete-btn"
                  @click="removeImage"
                >
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </div>
            </div>
            <a-upload
              :before-upload="beforeImageUpload"
              :custom-request="handleImageUpload"
              :show-upload-list="false"
              accept="image/*"
              class="hidden-upload-input"
              ref="fileUploadRef"
            >
              <div class="upload-trigger"></div>
            </a-upload>
          </div>
        </a-form-item>
        
        <!-- Mobile Shipping and Discount Fields -->
        <a-form-item :label="`${$t('merchant.orders.items.shippingPrice')} (${buyBaseCcy})`">
          <a-input-number v-model:value="item.shippingPrice" :formatter="numFormatter" :parser="numParser" class="w-full" />
        </a-form-item>
        <a-form-item v-if="!isBuySameCurrency" :label="`${$t('merchant.orders.items.shippingKip')} (${buyTargetCcy})`">
          <a-input :value="fmtNum(calc.calcShippingLak(variantForCalculation))" disabled class="w-full" />
        </a-form-item>
        <a-form-item :label="$t('merchant.orders.items.discountType')">
          <a-select v-model:value="item.discountType" allow-clear :placeholder="$t('merchant.orders.items.noDiscount')" class="w-full">
            <a-select-option value="percent">%</a-select-option>
            <a-select-option value="cash">{{ $t('merchant.orders.items.cash') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="`${$t('merchant.orders.items.discountValue')} (${buyBaseCcy})`">
          <a-input-number v-model:value="item.discountValue" :formatter="numFormatter" :parser="numParser" class="w-full" :disabled="!item.discountType" />
        </a-form-item>
        <a-form-item v-if="!isBuySameCurrency" :label="`${$t('merchant.orders.items.discountKip')} (${buyTargetCcy})`">
          <a-input :value="fmtNum(calc.calcDiscountLak(variantForCalculation))" disabled class="w-full" />
        </a-form-item>
      </template>

      <!-- MAIN PRODUCT SECTION (RED BORDER AREA) -->
      <div class="main-product-section">
        <!-- Variant Input -->
        <div class="variant-section">
          <a-form-item :label="$t('merchant.orders.items.variant')">
            <a-input v-model:value="currentVariant.variant" :placeholder="$t('merchant.orders.items.variantPh')" />
          </a-form-item>
        </div>

        <!-- Buy Section -->
        <div class="buy-section">
          <div class="section-header">
            <span class="section-title">{{ $t('merchant.orders.items.sectionPurchase') }}</span>
            <span v-if="!isBuySameCurrency" class="exchange-rate-tag buy">1 {{ buyBaseCcy }} = {{ fmtRate(getBuyRate()) }} {{ buyTargetCcy }}</span>
          </div>
          <a-row :gutter="gutter">
            <a-col v-bind="halfCol">
              <a-form-item
                :label="`${$t('merchant.orders.items.purchasePrice')} (${buyBaseCcy})`"
                :validate-status="errors.purchasePrice ? 'error' : ''"
                :help="errors.purchasePrice || ''"
              >
                <a-input-number
                  v-model:value="currentVariant.purchasePrice" 
                  :formatter="numFormatter" :parser="numParser"
                  :status="errors.purchasePrice ? 'error' : undefined"
                  :data-testid="`item-purchase-price-${index}`"
                  class="w-full"
                  @change="onFieldChange('purchasePrice')"
                />
              </a-form-item>
            </a-col>
            <a-col v-bind="halfCol">
              <a-form-item :label="`${$t('merchant.orders.items.purchaseTotalForeign')} (${buyBaseCcy})`">
                <a-input :value="fmtNum(calc.calcPurchaseTotalForeign(variantForCalculation))" disabled class="w-full" />
              </a-form-item>
            </a-col>
            <a-col v-bind="halfCol">
              <a-form-item :label="`${$t('merchant.orders.items.purchaseAndShipForeign')} (${buyBaseCcy})`">
                <a-input :value="fmtNum(calc.calcPurchaseAndShipForeign(variantForCalculation))" disabled class="w-full" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row v-if="!isBuySameCurrency" :gutter="gutter">
            <a-col v-bind="halfCol">
              <a-form-item :label="`${$t('merchant.orders.items.purchasePriceKip')} (${buyTargetCcy})`">
                <a-input :value="fmtNum(calc.calcPurchaseUnitLak(variantForCalculation))" disabled class="w-full" />
              </a-form-item>
            </a-col>
            <a-col v-bind="halfCol">
              <a-form-item :label="`${$t('merchant.orders.items.purchaseTotalKip')} (${buyTargetCcy})`">
                <a-input :value="fmtNum(calc.calcPurchaseTotalLak(variantForCalculation))" disabled class="w-full" />
              </a-form-item>
            </a-col>
            <a-col v-bind="halfCol">
              <a-form-item :label="`${$t('merchant.orders.items.purchaseAndShipKip')} (${buyTargetCcy})`">
                <a-input :value="fmtNum(calc.calcPurchaseAndShipLak(variantForCalculation))" disabled class="w-full" />
              </a-form-item>
            </a-col>
          </a-row>
                    <a-row :gutter="gutter">
            <a-col v-bind="halfCol">
              <a-form-item :label="`${$t('merchant.orders.items.netCostForeign')} (${buyBaseCcy})`">
                <a-input :value="fmtNum(calc.calcNetCostForeign(variantForCalculation))" disabled class="w-full computed-highlight" />
              </a-form-item>
            </a-col>
            <a-col v-if="!isBuySameCurrency" v-bind="halfCol">
              <a-form-item :label="`${$t('merchant.orders.items.netCostKip')} (${buyTargetCcy})`">
                <a-input :value="fmtNum(calc.calcNetCostLak(variantForCalculation))" disabled class="w-full computed-highlight" />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <!-- Sell Section -->
        <div class="sell-section">
          <div class="section-header">
            <span class="section-title">{{ $t('merchant.orders.items.sectionSelling') }}</span>
            <span v-if="!isSellSameCurrency" class="exchange-rate-tag sell">1 {{ sellBaseCcy }} = {{ fmtRate(getSellRate()) }} {{ sellTargetCcy }}</span>
          </div>
          <a-row :gutter="gutter">
            <a-col v-bind="halfCol">
              <a-form-item
                :label="`${$t('merchant.orders.items.sellingPriceForeign')} (${sellBaseCcy})`"
                :validate-status="errors.sellingPriceForeign ? 'error' : ''"
                :help="errors.sellingPriceForeign || ''"
              >
                <a-input-number
                  v-model:value="currentVariant.sellingPriceForeign" 
                  :formatter="numFormatter" :parser="numParser"
                  :status="errors.sellingPriceForeign ? 'error' : undefined"
                  :data-testid="`item-selling-price-${index}`"
                  class="w-full"
                  @change="onFieldChange('sellingPriceForeign')"
                />
              </a-form-item>
            </a-col>
            <a-col v-bind="halfCol">
              <a-form-item :label="`${$t('merchant.orders.items.sellingTotalForeign')} (${sellBaseCcy})`">
                <a-input :value="fmtNum(calc.calcSellingTotalForeign(variantForCalculation))" disabled class="w-full" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row v-if="!isSellSameCurrency" :gutter="gutter">
            <a-col v-bind="halfCol">
              <a-form-item :label="`${$t('merchant.orders.items.sellingPriceKip')} (${sellTargetCcy})`">
                <a-input :value="fmtNum(calc.calcSellingUnitLak(variantForCalculation))" disabled class="w-full" />
              </a-form-item>
            </a-col>
            <a-col v-bind="halfCol">
              <a-form-item :label="`${$t('merchant.orders.items.sellingTotalKip')} (${sellTargetCcy})`">
                <a-input :value="fmtNum(calc.calcSellingTotalLak(variantForCalculation))" disabled class="w-full" />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <!-- Customer Section -->
        <div class="customer-section">
          <div class="section-header">
            <span class="section-title customers-title">{{ $t('merchant.orders.customerOrders.title') }}</span>
          </div>
          
          <!-- Customer rows -->
          <div v-for="(cust, cIdx) in currentVariant.customers" :key="cust.uid" class="cust-row">
            <!-- Desktop row -->
            <template v-if="!isMobile">
              <div class="cust-row-inner">
                <div class="cust-col-customer">
                  <a-select
                    v-model:value="cust.customerId"
                    show-search
                    :filter-option="false"
                    :not-found-content="customerSearching ? undefined : null"
                    :placeholder="$t('merchant.orders.customerOrders.searchCustomerPh')"
                    :status="errors[`customers.${cIdx}.customerId`] ? 'error' : undefined"
                    class="w-full"
                    @search="$emit('customerSearch', $event)"
                    @focus="$emit('customerFocus')"
                  >
                    <template v-if="customerSearching" #notFoundContent><a-spin size="small" /></template>
                    <a-select-option v-for="c in customerOptions" :key="c.id" :value="c.id">
                      <div class="customer-opt">
                        <span class="customer-name">{{ c.customerName }}</span>
                        <a-tag size="small" :color="c.customerType === 'AGENT' ? 'purple' : 'blue'" class="customer-type-tag">{{ c.customerType }}</a-tag>
                      </div>
                    </a-select-option>
                  </a-select>
                  <span v-if="errors[`customers.${cIdx}.customerId`]" class="cust-field-error">{{ errors[`customers.${cIdx}.customerId`] }}</span>
                </div>
                <div class="cust-col-qty">
                  <a-input-number
                    v-model:value="cust.qty"
                    :min="1"
                    :precision="0"
                    :formatter="numFormatter"
                    :parser="numParser"
                    class="w-full"
                  />
                </div>
                <div class="cust-col-actions">
                  <a-tooltip :title="$t('merchant.orders.customerOrders.createNew')" placement="top">
                    <a-button type="text" size="small" class="create-cust-btn" @click="$emit('createCustomer', item.uid, cust.uid)">
                      <UserAddOutlined />
                    </a-button>
                  </a-tooltip>
                  <a-button type="text" danger size="small" @click="removeVariantCustomer(cust.uid)">
                    <DeleteOutlined />
                  </a-button>
                </div>
              </div>
            </template>

            <!-- Mobile row -->
            <template v-else>
              <div class="cust-row-mobile">
                <div class="cust-mobile-select-row">
                  <a-select
                    v-model:value="cust.customerId"
                    show-search
                    :filter-option="false"
                    :not-found-content="customerSearching ? undefined : null"
                    :placeholder="$t('merchant.orders.customerOrders.searchCustomerPh')"
                    :status="errors[`customers.${cIdx}.customerId`] ? 'error' : undefined"
                    class="cust-select-mobile"
                    @search="$emit('customerSearch', $event)"
                    @focus="$emit('customerFocus')"
                  >
                    <template v-if="customerSearching" #notFoundContent><a-spin size="small" /></template>
                    <a-select-option v-for="c in customerOptions" :key="c.id" :value="c.id">
                      {{ c.customerName }}
                    </a-select-option>
                  </a-select>
                  <a-button type="text" size="small" class="create-cust-btn" @click="$emit('createCustomer', item.uid, cust.uid)">
                    <UserAddOutlined />
                  </a-button>
                </div>
                <div class="cust-mobile-bottom-row">
                  <a-input-number
                    v-model:value="cust.qty"
                    :min="1"
                    :precision="0"
                    :formatter="numFormatter"
                    :parser="numParser"
                    class="cust-qty-mobile"
                  />
                  <a-button type="text" danger size="small" @click="removeVariantCustomer(cust.uid)">
                    <DeleteOutlined />
                  </a-button>
                </div>
              </div>
            </template>
          </div>

          <!-- Add Customer button -->
          <a-button type="dashed" block class="add-cust-btn" @click="addVariantCustomer">
            <template #icon><PlusOutlined /></template>
            {{ $t('merchant.orders.items.addCustomer') }}
          </a-button>
        </div>

        <!-- Summary Section -->
        <div v-if="itemTotalQuantity > 0" class="summary-section">
          <div class="summary-header">
            <CalculatorOutlined class="summary-icon" />
            <span class="summary-title">{{ $t('merchant.orders.items.itemSummary') }}</span>
            <span class="summary-qty-badge">{{ $t('merchant.orders.items.totalQtyLabel') }}: <strong>{{ itemTotalQuantity }}</strong></span>
          </div>
          <div class="summary-grid">
            <!-- Total Purchase (changed from Net Cost) -->
            <div class="summary-stat">
              <div class="summary-stat-label">{{ $t('merchant.orders.summary.purchaseTotalForeign') }} ({{ buyBaseCcy }})</div>
              <div class="summary-stat-value cost">{{ fmtNum(itemTotalNetCostForeign) }}</div>
            </div>
            <div v-if="!isBuySameCurrency" class="summary-stat">
              <div class="summary-stat-label">{{ $t('merchant.orders.summary.purchaseTotalLak') }} ({{ buyTargetCcy }})</div>
              <div class="summary-stat-value cost">{{ fmtNum(itemTotalNetCostLak) }}</div>
            </div>
            <!-- Selling Total -->
            <div class="summary-stat">
              <div class="summary-stat-label">{{ $t('merchant.orders.summary.sellingTotalForeign') }} ({{ sellBaseCcy }})</div>
              <div class="summary-stat-value selling">{{ fmtNum(itemTotalSellingForeign) }}</div>
            </div>
            <div v-if="!isSellSameCurrency" class="summary-stat">
              <div class="summary-stat-label">{{ $t('merchant.orders.summary.sellingTotalLak') }} ({{ sellTargetCcy }})</div>
              <div class="summary-stat-value selling">{{ fmtNum(itemTotalSellingLak) }}</div>
            </div>
            <!-- Profit -->
            <div class="summary-stat profit-stat">
              <div class="summary-stat-label">{{ $t('merchant.orders.summary.profitForeign') }} ({{ sellBaseCcy }})</div>
              <div class="summary-stat-value profit">{{ fmtNum(itemTotalProfitForeign) }}</div>
            </div>
            <div v-if="!isSellSameCurrency" class="summary-stat profit-stat">
              <div class="summary-stat-label">{{ $t('merchant.orders.summary.profitLak') }} ({{ sellTargetCcy }})</div>
              <div class="summary-stat-value profit">{{ fmtNum(itemTotalProfitLak) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- VARIANT LIST VISUALIZATION -->
      <div v-if="item.variants && item.variants.length > 1" class="variant-list-section">
        <div class="variant-list-header">
          <h4>{{ $t('merchant.orders.items.productVariants', { count: item.variants.length }) }}</h4>
        </div>
        <div class="variant-list">
          <div 
            v-for="(variant, vIdx) in item.variants" 
            :key="variant.uid"
            class="variant-item"
            :class="{ 'variant-item-active': vIdx === currentVariantIndex }"
            :style="{ 
              borderColor: getVariantColor(vIdx), 
              backgroundColor: vIdx === currentVariantIndex ? `${getVariantColor(vIdx)}08` : 'transparent'
            }"
            @click="switchToVariant(vIdx)"
          >
            <div class="variant-item-color-strip" :style="{ background: getVariantColor(vIdx) }" />
            <div class="variant-item-content">
              <div class="variant-item-header">
                <span class="variant-item-number" :style="{ color: getVariantColor(vIdx) }">
                  {{ $t('merchant.orders.items.variantNumber', { number: vIdx + 1 }) }}
                </span>
                <div class="variant-item-header-actions">
                  <a-tooltip title="ເບິ່ງລູກຄ້າ" placement="top">
                    <a-button
                      type="text"
                      size="small"
                      class="variant-customers-btn"
                      @click.stop="openVariantCustomersModal(vIdx, $event)"
                    >
                      <TeamOutlined />
                    </a-button>
                  </a-tooltip>
                  <a-button
                    type="text"
                    danger
                    size="small"
                    class="variant-delete-btn"
                    @click.stop="removeVariant(vIdx)"
                  >
                    <DeleteOutlined />
                  </a-button>
                </div>
              </div>
              <div class="variant-item-details">
                <div class="variant-item-name">
                  {{ variant.variant || $t('merchant.orders.items.sizeDefault', { number: vIdx + 1 }) }}
                </div>
                <div class="variant-item-prices">
                  <span class="variant-price">{{ getCcySymbol(sellBaseCcy) }} {{ fmtNumber(variant.sellingPriceForeign) }}</span>
                  <span class="variant-qty-badge">{{ $t('merchant.orders.items.variantQty', { qty: getVariantTotalQty(variant) }) }}</span>
                  <span class="variant-customers">{{ $t('merchant.orders.items.customerCount', { count: variant.customers.length }) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Variant Customers Modal -->
      <a-modal
        v-model:open="showVariantCustomersModal"
        :footer="null"
        width="420px"
        destroy-on-close
      >
        <template #title>
          <span :style="{ color: getVariantColor(modalVariantIndex) }">
            {{ $t('merchant.orders.items.variantNumber', { number: modalVariantIndex + 1 }) }}
          </span>
          <!-- <span v-if="modalVariant" style="color: #374151; font-weight: 500; margin-left: 6px;">
            – {{ modalVariant.variant || $t('merchant.orders.items.sizeDefault', { number: modalVariantIndex + 1 }) }}
          </span> -->
        </template>
        <div v-if="modalVariant" class="variant-customers-modal-content">
          <div class="variant-customers-modal-header">
            <span class="variant-customers-modal-total">
              {{ $t('merchant.orders.items.totalQtyLabel') }}: {{ getVariantTotalQty(modalVariant) }}
            </span>
          </div>
          <div v-if="modalVariant.customers.length === 0" class="variant-customers-empty">
            ຍັງບໍ່ມີລູກຄ້າ
          </div>
          <div v-else class="variant-customers-list">
            <div
              v-for="(cust, cIdx) in modalVariant.customers"
              :key="cust.uid"
              class="variant-customer-row"
            >
              <span class="variant-customer-index">{{ cIdx + 1 }}.</span>
              <span class="variant-customer-name">{{ getCustomerName(cust.customerId) }}</span>
              <span class="variant-customer-qty">{{ $t('merchant.orders.items.variantQty', { qty: cust.qty }) }}</span>
            </div>
          </div>
        </div>
      </a-modal>

      <!-- ADD VARIANT BUTTON AND NAVIGATION -->
      <div class="variant-controls">
        <a-button type="primary" block class="add-variant-btn" @click="addVariant">
          <template #icon><PlusOutlined /></template>
          {{ $t('merchant.orders.items.addVariant') }}
        </a-button>
        
        <!-- Variant Navigation -->
        <div v-if="item.variants && item.variants.length > 1" class="variant-navigation">
          <a-button 
            :disabled="currentVariantIndex === 0" 
            @click="previousVariant"
            class="nav-btn nav-btn-prev"
          >
            <template #icon><CaretLeftOutlined /></template>
            {{ $t('common.previous') }}
          </a-button>
            
          <span class="variant-nav-label">
            {{ $t('merchant.orders.items.itemOf', { current: currentVariantIndex + 1, total: item.variants.length }) }}
          </span>
            
          <a-button 
            :disabled="currentVariantIndex === (item.variants?.length || 0) - 1" 
            @click="nextVariant"
            class="nav-btn nav-btn-next"
          >
            {{ $t('common.next') }}
            <template #icon><CaretRightOutlined /></template>
          </a-button>
        </div>
      </div>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { DeleteOutlined, PlusOutlined, UserAddOutlined, CalculatorOutlined, CaretLeftOutlined, CaretRightOutlined, EyeOutlined, CameraOutlined, TeamOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { fmtNumber, numFormatter, numParser } from '@/shared/utils/format';
import { useItemCalculations } from '../composables/useItemCalculations';
import type { Customer } from '@/domain/entities/user.entity';
import type { ItemForm, ProductVariant } from '../types';
import { uploadFilesForMerchant, deleteFile } from '@/infrastructure/repositories/upload.repository';

const props = defineProps<{
  item: ItemForm;
  index: number;
  isMobile: boolean;
  buyBaseCcy: string;
  buyTargetCcy: string;
  sellBaseCcy: string;
  sellTargetCcy: string;
  getBuyRate: () => number;
  getSellRate: () => number;
  errors: Record<string, string>;
  customerOptions: Customer[];
  customerSearching: boolean;
}>();

const emit = defineEmits<{
  (e: 'remove', uid: string): void;
  (e: 'clearError', field: string): void;
  (e: 'customerSearch', val: string): void;
  (e: 'customerFocus'): void;
  (e: 'createCustomer', itemUid: string, customerUid: string): void;
}>();

const ITEM_COLORS = ['#4E8EB5', '#45BA6A', '#4F3BB3', '#8439AD', '#A84385'];
const itemBorderColor = computed(() => ITEM_COLORS[props.index % ITEM_COLORS.length]!);

const calc = useItemCalculations(props.getBuyRate, props.getSellRate);

const fmtNum = fmtNumber;
const fmtRate = (val: number) => val.toLocaleString('en-US');

const gutter = computed<[number, number]>(() => props.isMobile ? [12, 0] : [16, 0]);
const halfCol = computed(() => props.isMobile ? { span: 24 } : { sm: 12, md: 8 });

const isBuySameCurrency = computed(() => props.buyBaseCcy === props.buyTargetCcy);
const isSellSameCurrency = computed(() => props.sellBaseCcy === props.sellTargetCcy);

// Helper function to generate unique IDs
const uid = () => String(Date.now()) + Math.random().toString(36).slice(2, 6);

// Variant management
const currentVariantIndex = ref(0);

// localStorage key for persisting variant selection
const getLocalStorageKey = () => `order-item-${props.item.uid}-variant-index`;

// Save variant index to localStorage
const saveVariantIndex = (index: number) => {
  try {
    localStorage.setItem(getLocalStorageKey(), index.toString());
  } catch (error) {
    console.warn('Failed to save variant index to localStorage:', error);
  }
};

// Load variant index from localStorage
const loadVariantIndex = (): number => {
  try {
    const saved = localStorage.getItem(getLocalStorageKey());
    return saved ? parseInt(saved, 10) : 0;
  } catch (error) {
    console.warn('Failed to load variant index from localStorage:', error);
    return 0;
  }
};

// Image upload state
const imageUploading = ref(false);

// File upload ref
const fileUploadRef = ref();

// Initialize variants if they don't exist
if (!props.item.variants) {
  props.item.variants = [{
    uid: uid(),
    variant: '',
    purchasePrice: 0,
    sellingPriceForeign: 0,
    // ✅ Remove shippingPrice, discountType, discountValue from variant level
    customers: []
  }];
}

// Get current variant
const currentVariant = computed(() => {
  return props.item.variants?.[currentVariantIndex.value] || props.item.variants?.[0] || {
    uid: uid(),
    variant: '',
    purchasePrice: 0,
    sellingPriceForeign: 0,
    // ✅ Remove shippingPrice, discountType, discountValue from variant level
    customers: []
  };
});

// Create hybrid object for calculations (combines variant data with required ItemForm properties)
const variantForCalculation = computed(() => {
  const variant = currentVariant.value;
  return {
    uid: variant.uid,
    productName: props.item.productName,
    variant: variant.variant,
    purchasePrice: variant.purchasePrice,
    shippingPrice: props.item.shippingPrice, // ✅ Use item level
    discountType: props.item.discountType || undefined as 'percent' | 'cash' | undefined, // ✅ Use item level
    discountValue: props.item.discountValue || 0, // ✅ Use item level
    sellingPriceForeign: variant.sellingPriceForeign,
    customers: variant.customers,
    quantity: variant.customers.reduce((sum, c) => sum + (c.qty || 0), 0),
    productImage: props.item.productImage,
    imageId: props.item.imageId,
    variants: props.item.variants
  };
});

// Current variant calculations
const currentVariantQty = computed(() => {
  return currentVariant.value.customers.reduce((sum, c) => sum + (c.qty || 0), 0);
});

// Item-level summary calculations (all variants)
const itemTotalNetCostForeign = computed(() => calc.calcNetCostForeignWithVariants(props.item));
const itemTotalNetCostLak = computed(() => calc.calcNetCostLakWithVariants(props.item));
const itemTotalSellingForeign = computed(() => calc.calcSellingTotalForeignWithVariants(props.item));
const itemTotalSellingLak = computed(() => calc.calcSellingTotalLakWithVariants(props.item));
const itemTotalProfitLak = computed(() => itemTotalSellingLak.value - itemTotalNetCostLak.value);
const itemTotalProfitForeign = computed(() => {
  const rate = props.getSellRate();
  return rate === 0 ? 0 : itemTotalProfitLak.value / rate;
});

// Total quantity across all variants
const itemTotalQuantity = computed(() => {
  if (!props.item.variants || props.item.variants.length === 0) {
    return currentVariantQty.value;
  }
  return props.item.variants.reduce((sum, variant) => {
    const variantQty = variant.customers?.reduce((variantSum, c) => variantSum + (c.qty || 0), 0) || 0;
    return sum + variantQty;
  }, 0);
});

// Variant management functions
const addVariant = () => {
  if (!props.item.variants) {
    props.item.variants = [];
  }
  props.item.variants.push({
    uid: uid(),
    variant: '',
    purchasePrice: 0,
    sellingPriceForeign: 0,
    // ✅ Remove shippingPrice, discountType, discountValue from variant level
    customers: []
  });
  currentVariantIndex.value = props.item.variants.length - 1;
  saveVariantIndex(currentVariantIndex.value);
  triggerVariantAnimation('new');
};

const previousVariant = () => {
  if (currentVariantIndex.value > 0) {
    currentVariantIndex.value--;
    saveVariantIndex(currentVariantIndex.value);
    triggerVariantAnimation('previous');
  }
};

const nextVariant = () => {
  if (currentVariantIndex.value < (props.item.variants?.length || 0) - 1) {
    currentVariantIndex.value++;
    saveVariantIndex(currentVariantIndex.value);
    triggerVariantAnimation('next');
  }
};

// Generate color for each variant
const getVariantColor = (variantIndex: number) => {
  const VARIANT_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#DDA0DD', '#98D8C8'];
  return VARIANT_COLORS[variantIndex % VARIANT_COLORS.length];
};

// Switch to specific variant
const switchToVariant = (variantIndex: number) => {
  if (variantIndex >= 0 && variantIndex < (props.item.variants?.length || 0)) {
    currentVariantIndex.value = variantIndex;
    saveVariantIndex(currentVariantIndex.value);
    triggerVariantAnimation('next');
  }
};

// Remove variant
const removeVariant = (variantIndex: number) => {
  if (props.item.variants && props.item.variants.length > 1) {
    props.item.variants.splice(variantIndex, 1);
    
    // Adjust current index if necessary
    if (currentVariantIndex.value >= props.item.variants.length) {
      currentVariantIndex.value = props.item.variants.length - 1;
    }
    
    saveVariantIndex(currentVariantIndex.value);
    message.success('Variant removed successfully');
  }
};

// Trigger animation when switching variants
const triggerVariantAnimation = (direction: 'next' | 'previous' | 'new') => {
  const mainSection = document.querySelector('.main-product-section') as HTMLElement;
  if (mainSection) {
    // Remove all animation classes
    mainSection.classList.remove('switching-next', 'switching-previous', 'slide-in-new');
    
    // Force reflow to restart animation
    void mainSection.offsetWidth;
    
    // Add the appropriate animation class
    let animationClass: string;
    let duration: number;
    
    switch (direction) {
      case 'next':
        animationClass = 'switching-next';
        duration = 400;
        break;
      case 'previous':
        animationClass = 'switching-previous';
        duration = 400;
        break;
      case 'new':
        animationClass = 'slide-in-new';
        duration = 500;
        break;
    }
    
    mainSection.classList.add(animationClass);
    
    console.log(`Animation triggered: ${animationClass} (${direction})`); // Debug log
    
    // Remove animation class after animation completes
    setTimeout(() => {
      mainSection.classList.remove(animationClass);
      console.log(`Animation removed: ${animationClass}`); // Debug log
    }, duration);
  }
};

// Image upload functions
const beforeImageUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('You can only upload image files!');
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
    return false;
  }
  return true;
};

const handleImageUpload = async (options: any) => {
  const { file } = options;
  console.log('Starting image upload for file:', file.name);
  imageUploading.value = true;
  
  try {
    // Upload image to server and get real imageId
    const uploadedImages = await uploadFilesForMerchant([file]);
    console.log('Upload response:', uploadedImages);
    
    const imageId = uploadedImages[0]?.id;
    if (!imageId) {
      throw new Error('No image ID returned from server');
    }
    
    // Create a preview URL for the image
    const reader = new FileReader();
    reader.onload = (e) => {
      props.item.productImage = e.target?.result as string;
      props.item.imageId = imageId; // Use real imageId from server
      console.log('✅ Uploaded image successfully:', {
        imageId,
        fileName: file.name,
        previewUrl: e.target?.result
      });
      message.success('Image uploaded successfully!');
    };
    reader.onerror = (error) => {
      console.error('❌ FileReader error:', error);
      message.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('❌ Image upload error:', error);
    message.error('Failed to upload image: ' + (error as Error).message);
  } finally {
    imageUploading.value = false;
  }
};

const removeImage = async () => {
  // If there's an imageId, delete the file from server
  if (props.item.imageId) {
    try {
      console.log('🗑️ Attempting to delete image with ID:', props.item.imageId);
      await deleteFile(props.item.imageId);
      console.log('✅ Image deleted successfully from server:', props.item.imageId);
      message.success('Image deleted successfully');
    } catch (error: any) {
      console.error('❌ Failed to delete image from server:', error);
      
      // Handle different error types
      if (error.response?.status === 404) {
        message.warning('Image not found on server, removed locally');
      } else if (error.response?.status === 403) {
        message.error('Permission denied: Cannot delete image');
      } else {
        message.warning('Image removed locally, but deletion from server failed');
      }
    }
  } else {
    message.info('No image to remove');
  }
  
  // Always remove from local state
  props.item.productImage = '';
  props.item.imageId = undefined;
};

const triggerFileUpload = () => {
  // Trigger the hidden file input
  const uploadElement = fileUploadRef.value?.$el?.querySelector('input[type="file"]');
  uploadElement?.click();
};

const previewImage = (imageUrl: string) => {
  // Create modal to preview image
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    cursor: pointer;
  `;
  
  const img = document.createElement('img');
  img.src = imageUrl;
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  `;
  
  modal.appendChild(img);
  modal.onclick = () => document.body.removeChild(modal);
  document.body.appendChild(modal);
};

const getFileName = (imageUrl: string | undefined) => {
  if (!imageUrl) return 'No file';
  const parts = imageUrl.split('/');
  return parts[parts.length - 1] || 'Unknown';
};

// Customer management for variants
const addVariantCustomer = () => {
  currentVariant.value.customers.push({ uid: uid(), customerId: undefined, qty: 1 });
};

const removeVariantCustomer = (customerUid: string) => {
  currentVariant.value.customers = currentVariant.value.customers.filter(c => c.uid !== customerUid);
};

// ---- Customer name cache (customerOptions are search-based so we cache names as they load) ----
const customerNameCache = ref<Map<number, string>>(new Map());

watch(() => props.customerOptions, (options) => {
  if (options && options.length > 0) {
    options.forEach(c => {
      customerNameCache.value.set(c.id, c.customerName);
    });
  }
}, { immediate: true, deep: true });

const getCustomerName = (customerId: number | undefined): string => {
  if (!customerId) return '-';
  return customerNameCache.value.get(customerId) || `#${customerId}`;
};

// ---- Variant customers modal ----
const showVariantCustomersModal = ref(false);
const modalVariantIndex = ref(0);

const openVariantCustomersModal = (vIdx: number, event: Event) => {
  event.stopPropagation();
  modalVariantIndex.value = vIdx;
  showVariantCustomersModal.value = true;
};

const getVariantTotalQty = (variant: ProductVariant): number => {
  return variant.customers.reduce((sum, c) => sum + (c.qty || 0), 0);
};

const modalVariant = computed(() => props.item.variants?.[modalVariantIndex.value]);

const getCcySymbol = (code: string): string => {
  const map: Record<string, string> = {
    LAK: '₭',
    THB: '฿',
    USD: '$',
    USDT: '$',
    CNY: '¥',
  };
  return map[code] ?? code;
};

const onFieldChange = (field: string) => {
  if (props.errors[field]) {
    emit('clearError', field);
  }
};

// Sync current variant data back to main item for validation
watch(currentVariant, (newVariant) => {
  if (newVariant && props.item.variants) {
    // Update the variant in the variants array
    const variantIndex = props.item.variants.findIndex(v => v.uid === newVariant.uid);
    if (variantIndex !== -1 && props.item.variants[variantIndex] !== newVariant) {
      props.item.variants[variantIndex] = { ...newVariant };
    }
    
    // Also sync to main item for parent validation (backward compatibility)
    // Only update if values are different to avoid recursion
    if (props.item.purchasePrice !== (newVariant.purchasePrice || 0)) {
      props.item.purchasePrice = newVariant.purchasePrice || 0;
    }
    if (props.item.sellingPriceForeign !== (newVariant.sellingPriceForeign || 0)) {
      props.item.sellingPriceForeign = newVariant.sellingPriceForeign || 0;
    }
    // ✅ Remove shippingPrice, discountType, discountValue sync from variant level
    
    // Sync customers data for validation
    const currentCustomers = newVariant.customers || [];
    
    // Update main item customers array for parent validation
    if (JSON.stringify(props.item.customers) !== JSON.stringify(currentCustomers)) {
      props.item.customers = [...currentCustomers];
    }
  }
}, { deep: true });

// Watch discount type to reset discount value when cleared
watch(() => props.item.discountType, (newType, oldType) => {
  if (!newType && oldType) {
    // Discount type was cleared, reset discount value to 0
    props.item.discountValue = 0;
  }
}, { immediate: true });

// Ensure discount value is never undefined
watch(() => props.item.discountValue, (value) => {
  if (value === undefined || value === null) {
    props.item.discountValue = 0;
  }
}, { immediate: true });

// Initial sync when component mounts
if (currentVariant.value) {
  props.item.purchasePrice = currentVariant.value.purchasePrice || 0;
  props.item.sellingPriceForeign = currentVariant.value.sellingPriceForeign || 0;
  // ✅ Remove shippingPrice, discountType, discountValue initial sync from variant level
  props.item.customers = [...(currentVariant.value.customers || [])];
}

// Ensure discount value is initialized to 0
if (props.item.discountValue === undefined || props.item.discountValue === null) {
  props.item.discountValue = 0;
}

// Restore variant selection from localStorage on component mount
onMounted(() => {
  const savedIndex = loadVariantIndex();
  // Validate that the saved index is within bounds
  if (savedIndex >= 0 && savedIndex < (props.item.variants?.length || 1)) {
    currentVariantIndex.value = savedIndex;
  }
});

// Watch for variant index changes and save to localStorage
watch(currentVariantIndex, (newIndex) => {
  saveVariantIndex(newIndex);
}, { immediate: false });
</script>

<style scoped>
.w-full { width: 100%; }

.item-label-outside {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  padding: 4px 0;
}

.item-block {
  background: #f8fafc; border-radius: 16px; padding: 0 0 4px; margin-bottom: 14px;
  border: 1.5px solid rgba(148, 163, 184, 0.18); transition: box-shadow 0.2s ease;
  overflow: hidden;
}
.item-color-strip {
  height: 5px; width: 100%; border-radius: 14px 14px 0 0;
}
.item-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 4px; padding: 10px 20px 0;
}
.item-num {
  font-weight: 800; font-size: 13px;
  padding: 3px 10px; border-radius: 999px; border: 1.5px solid;
  transition: all 0.15s ease;
}
.item-form { padding: 0 20px; }
.item-form :deep(.ant-form-item) { margin-bottom: 16px; }
.item-form :deep(.ant-form-item-label) { padding-bottom: 4px; }
.item-form :deep(.ant-form-item-label > label) { font-size: 12px; font-weight: 700; color: #64748b; }
.item-form :deep(.ant-input-number), .item-form :deep(.ant-input), .item-form :deep(.ant-select) { width: 100% !important; }
:deep(.ant-input[disabled]) { color: #0f172a !important; font-weight: 600; background: #f1f5f9; font-size: 13px; }

/* Avatar Upload Styles */
.avatar-upload-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 300px; /* Same as uploaded image */
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  background: #ffffff;
  margin: 0 auto;
  transition: all 0.2s ease;
}

.avatar-upload-container.uploading {
  border-color: #3b82f6;
  background: #eff6ff;
}

.avatar-upload-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 10;
}

.avatar-upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 10px;
}

.avatar-upload-placeholder:hover {
  border-color: #1d4ed8;
  background: #eff6ff;
}

.avatar-upload-icon {
  font-size: 32px;
  color: #6b7280;
  margin-bottom: 8px;
}

.avatar-upload-text {
  text-align: center;
}

.avatar-upload-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
  font-size: 14px;
}

.avatar-upload-subtitle {
  font-size: 12px;
  color: #6b7280;
}

.avatar-upload-input {
  width: 100%;
  height: 100%;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
}

.avatar-upload-trigger {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
}

.avatar-preview-container {
  position: relative;
  display: inline-block;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  margin: 0 auto;
}

.uploaded-image-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 300px; /* ✅ Make image taller */
  border: 2px solid #d1d5db;
  border-radius: 12px;
  background: #ffffff;
  margin: 0 auto;
  transition: all 0.2s ease;
  padding: 0; /* ✅ Remove padding */
}

.uploaded-image-container:hover {
  border-color: #1d4ed8;
  background: #eff6ff;
}

.uploaded-image-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0; /* ✅ Remove padding */
  gap: 0;
}

.uploaded-image-preview {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
}

.uploaded-image-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  border-radius: 8px;
}

/* ✅ Hover Overlay Styles */
.uploaded-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
}

.uploaded-image-container:hover .uploaded-image-overlay {
  opacity: 1;
}

.uploaded-image-actions {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
}

.uploaded-image-action-btn {
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  border-radius: 4px;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.uploaded-image-view-btn {
  color: #ffffff;
  border: none;
  background: rgba(59, 130, 246, 0.8);
  padding: 0;
}

.uploaded-image-view-btn:hover {
  background: rgba(59, 130, 246, 1);
  transform: scale(1.1);
}

.uploaded-image-delete-btn {
  color: #ffffff;
  border: none;
  background: rgba(239, 68, 68, 0.8);
  padding: 0;
}

.uploaded-image-delete-btn:hover {
  background: rgba(239, 68, 68, 1);
  transform: scale(1.1);
}

.uploaded-image-container:hover .uploaded-image-action-btn {
  opacity: 1;
}

.uploaded-image-preview {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px; /* ✅ Remove circular shape, use rounded corners */
}

.uploaded-image-img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* ✅ Show full image, not cropped */
  object-position: center;
  border-radius: 8px;
}

.hidden-upload-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.upload-trigger {
  width: 0;
  height: 0;
  overflow: hidden;
}

.avatar-preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.avatar-preview-image:hover {
  transform: scale(1.05);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
  border-radius: 50%;
}

.avatar-preview-container:hover .avatar-overlay {
  opacity: 1;
}

.avatar-info {
  text-align: center;
  padding: 8px;
}

.avatar-filename {
  color: white;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
  word-break: break-all;
}

.avatar-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.avatar-action-btn {
  border-radius: 6px;
  font-size: 12px;
  height: 32px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-view-btn {
  background: #1d4ed8;
  border-color: #1d4ed8;
  color: white;
}

.avatar-delete-btn {
  background: #dc2626;
  border-color: #dc2626;
}

.avatar-action-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Image Upload Styles */
.image-upload-container {
  width: 100%;
}

.product-image-upload {
  width: 100%;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
  cursor: pointer;
  padding: 20px;
  background: #fff5f5;
  border: 2px solid v-bind('itemBorderColor');
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.variant-transition {
  transition: all 0.3s ease-in-out;
}

.variant-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ffccc7;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.exchange-rate-tag {
  font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; white-space: nowrap;
}
.exchange-rate-tag.buy { background: #e3f2fd; color: #1976d2; }
.exchange-rate-tag.sell { background: #e8f5e8; color: #2e7d32; }

.buy-section, .sell-section {
  margin-bottom: 20px;
}

.buy-section .section-title { color: #1d4ed8; }
.sell-section .section-title { color: #059669; }

.customer-section {
  margin-bottom: 20px;
}

/* Customer rows */
.cust-row {
  margin-bottom: 12px;
}

.cust-row-inner {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.cust-col-customer {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.cust-col-qty {
  width: 100px;
  flex-shrink: 0;
}

.cust-col-actions {
  display: flex;
  gap: 4px;
  align-items: stretch;
  width: 60px;
  flex-shrink: 0;
}

.create-cust-btn,
.cust-col-actions .ant-btn {
  height: 32px;
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: white;
  transition: all 0.2s ease;
}

.create-cust-btn:hover,
.cust-col-actions .ant-btn:hover {
  background: #f8fafc;
  border-color: #9ca3af;
  transform: scale(1.05);
}

.cust-col-actions .ant-btn-danger:hover {
  background: #fef2f2;
  border-color: #f87171;
  color: #ffffff;
}

.cust-field-error {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
}

.cust-select-mobile { flex: 1; }
.cust-mobile-bottom-row { display: flex; gap: 8px; align-items: center; }
.cust-qty-mobile { flex: 1; }

.create-cust-btn {
  border: 1px solid #7c3aed; color: #7c3aed; transition: all 0.15s ease;
}
.create-cust-btn:hover { background: #f3f4f6; border-color: #7c3aed; }

.cust-field-error {
  color: #ff4d4f; font-size: 12px; margin-top: 4px; display: block;
}

.add-cust-btn {
  margin-top: 12px; border-radius: 8px; font-weight: 600;
  border-color: #7c3aed; color: #7c3aed; height: 36px;
}
.add-cust-btn:hover {
  background: #f9fafb !important; border-color: #7c3aed !important; color: #7c3aed !important;
}

/* Summary Section */
.summary-section {
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.summary-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
}
.summary-icon { color: #059669; font-size: 16px; }
.summary-title { font-weight: 700; font-size: 14px; color: #374151; }
.summary-qty-badge {
  margin-left: auto; font-size: 12px; padding: 2px 8px; background: #e5e7eb;
  border-radius: 12px; font-weight: 600; color: #374151;
}

.summary-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;
}
.summary-stat {
  padding: 12px; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; text-align: center;
}
.summary-stat-label {
  font-size: 11px; font-weight: 600; color: #6b7280; margin-bottom: 4px; text-transform: uppercase;
}
.summary-stat-value {
  font-size: 14px; font-weight: 800; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}
.summary-stat-value.cost { color: #dc2626; }
.summary-stat-value.selling { color: #059669; }
.profit-stat { border-left: 3px solid #10b981; }
.summary-stat-value.profit { color: #059669; }

.computed-highlight {
  background: #fef3c7 !important; border-color: #f59e0b !important; font-weight: 700 !important;
}

/* Variant Controls */
.variant-controls {
  margin-top: 16px;
}

.add-variant-btn {
  height: 40px; border-radius: 8px; font-weight: 700;
  border-color: #1d4ed8; color: #1d4ed8; background: #eff6ff;
}
.add-variant-btn:hover {
  background: #dbeafe !important; border-color: #1d4ed8 !important; color: #1d4ed8 !important;
}

.variant-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.variant-nav-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  padding: 4px 12px;
  background: #f1f5f9;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

/* Variant List Visualization */
.variant-list-section {
  margin-top: 20px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.variant-list-header {
  margin-bottom: 12px;
}

.variant-list-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.variant-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.variant-item {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 2px solid;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.variant-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.variant-item-active {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: scale(1.02);
}

.variant-item-color-strip {
  width: 4px;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 2px 0 0 2px;
}

.variant-item-content {
  flex: 1;
  margin-left: 8px;
}

.variant-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.variant-item-number {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.variant-delete-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
  padding: 2px;
  min-width: 24px;
  border-radius: 2px;
  height: 16px !important;
}

.variant-item:hover .variant-delete-btn {
  opacity: 1;
}

.variant-item-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-items: flex-start;
  flex-direction: column;
  gap: 2px;
}

.variant-item-name {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
}

.variant-item-prices {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 11px;
}

.variant-price {
  font-weight: 600;
  color: #059669;
}

.variant-customers {
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.variant-qty-badge {
  font-weight: 700;
  color: #1d4ed8;
  background: #eff6ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.variant-item-header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.variant-customers-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
  padding: 2px;
  min-width: 24px;
  border-radius: 2px;
  height: 16px !important;
  color: #1d4ed8;
}

.variant-item:hover .variant-customers-btn {
  opacity: 1;
}

/* Variant Customers Modal */
.variant-customers-modal-content {
  padding: 4px 0;
}

.variant-customers-modal-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
}

.variant-customers-modal-total {
  font-size: 13px;
  font-weight: 700;
  color: #059669;
  background: #ecfdf5;
  padding: 4px 14px;
  border-radius: 12px;
}

.variant-customers-empty {
  text-align: center;
  color: #9ca3af;
  padding: 32px;
  font-size: 13px;
}

.variant-customers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.variant-customer-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.variant-customer-index {
  font-size: 12px;
  color: #9ca3af;
  min-width: 20px;
}

.variant-customer-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.variant-customer-qty {
  font-size: 13px;
  font-weight: 700;
  color: #1d4ed8;
  background: #eff6ff;
  padding: 3px 12px;
  border-radius: 8px;
}

/* Navigation button styles */
.nav-btn {
  font-weight: 700;
  color: #1d4ed8;
  min-width: 100px;
  text-align: center;
  transition: all 0.3s ease;
  padding: 6px 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.nav-btn:hover:not(:disabled) {
  background: #1d4ed8;
  border-color: #1d4ed8;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3);
}

.nav-btn:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  border-color: #e5e7eb;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.nav-btn-prev:hover:not(:disabled) {
  background: #059669;
  border-color: #059669;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.nav-btn-next:hover:not(:disabled) {
  background: #1d4ed8;
  border-color: #1d4ed8;
  box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3);
}

/* Mobile responsive navigation */
@media (max-width: 768px) {
  .variant-navigation {
    gap: 8px;
    padding: 12px 8px;
    margin-top: 16px;
  }
  
  .variant-nav-label {
    font-size: 11px;
    min-width: 70px;
    padding: 4px 8px;
  }
  
  .nav-btn {
    height: 40px;
    padding: 0 12px;
    font-size: 12px;
    min-width: 44px;
  }
  
  .nav-btn .anticon {
    font-size: 14px;
  }
  
  .nav-btn span {
    display: none;
  }
  
  .nav-btn:hover:not(:disabled) {
    transform: scale(1.05);
  }
}

/* Animation for variant switching */
.main-product-section {
  transition: all 0.3s ease-in-out;
}

.main-product-section.switching-next {
  animation: variantSwitchNext 0.4s ease-in-out;
}

.main-product-section.switching-previous {
  animation: variantSwitchPrevious 0.4s ease-in-out;
}

.main-product-section.slide-in-new {
  animation: slideInNewVariant 0.5s ease-out;
}

@keyframes variantSwitchNext {
  0% { 
    opacity: 1; 
    transform: translateX(0);
  }
  50% { 
    opacity: 0.2; 
    transform: translateX(-30px);
  }
  100% { 
    opacity: 1; 
    transform: translateX(0);
  }
}

@keyframes variantSwitchPrevious {
  0% { 
    opacity: 1; 
    transform: translateX(0);
  }
  50% { 
    opacity: 0.2; 
    transform: translateX(30px);
  }
  100% { 
    opacity: 1; 
    transform: translateX(0);
  }
}

@keyframes slideInNewVariant {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Button hover effects */
.variant-navigation button {
  transition: all 0.2s ease;
}

.variant-navigation button:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(29, 78, 216, 0.3);
}

.variant-navigation button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.customer-opt {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.customer-name {
  flex: 1;
}

.customer-type-tag {
  margin-left: 8px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .half-col { flex: 0 0 calc(50% - 12px); max-width: calc(50% - 12px); }
}

@media (max-width: 768px) {
  .half-col { flex: 0 0 100%; max-width: 100%; }
  .main-product-section { padding: 16px; }
  .summary-grid { grid-template-columns: 1fr; }
  
  /* Form items responsive */
  .ant-form-item {
    margin-bottom: 16px;
  }
  
  .ant-form-item-label {
    padding-bottom: 4px;
  }
  
  .ant-form-item-label > label {
    height: auto;
    line-height: 1.4;
    white-space: normal;
    word-wrap: break-word;
  }
}

/* Galaxy Tab S7 and similar tablets */
@media (min-width: 769px) and (max-width: 1024px) {
  .half-col { 
    flex: 0 0 calc(50% - 8px); 
    max-width: calc(50% - 8px); 
  }
  
  .main-product-section {
    padding: 18px;
  }
  
  .ant-form-item {
    margin-bottom: 14px;
  }
}
</style>
