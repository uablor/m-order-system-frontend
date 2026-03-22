<template>
  <div class="notification-list-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="title-block">
        <div class="page-title">{{ $t('merchant.notifications.title') }}</div>
        <div class="page-subtitle">{{ $t('merchant.notifications.subtitle') }}</div>
      </div>

      <div class="header-actions">
        <!-- Notification tab: Filter + Create Noti (เหมือน History) -->
        <template v-if="activeTab === 'notification'">
          <a-button
            v-if="arrivalShowFilterToggle"
            type="default"
            class="filter-toggle-btn"
            :class="{ active: arrivalShowFilters }"
            @click="showFilters = !showFilters"
          >
            <FilterOutlined />
          </a-button>
          <!-- Commented out header Create Notification button to avoid duplication with filter bar button -->
          <!-- <div v-if="arrivalListShowCreateNotiBar" class="create-noti-bar-inline">
            <span class="create-noti-count">{{ $t('merchant.notifications.createNotiSelectedCount', { count: arrivalListSelectedCount }) }}</span>
            <a-button type="primary" :loading="arrivalListCreateNotiSubmitting" @click="arrivalListOpenCreateNotiConfirm">
              {{ $t('merchant.notifications.createNoti') }}
            </a-button>
          </div> -->
        </template>
        <!-- History tab -->
        <!-- <template v-else>
          <a-button type="primary" @click="openCreateModal">
            <template #icon><PlusOutlined /></template>
            {{ $t('merchant.notifications.create') }}
          </a-button>
          <a-button
            v-if="showFilterToggle"
            type="default"
            class="filter-toggle-btn"
            :class="{ active: showFilters }"
            @click="showFilters = !showFilters"
          >
            <FilterOutlined />
          </a-button>
        </template> -->
      </div>
    </div>

    <!-- Tabs: Notification (arrivals without notification) | History (notifications table) -->
    <a-card :bordered="false" class="tabs-card mb-4">
      <a-tabs v-model:activeKey="activeTab" class="notification-tabs">
        <a-tab-pane :key="'notification'" :tab="$t('merchant.notifications.tabNotification')">
          <!-- Arrival Table in Notification Tab -->
          <div class="notification-arrival-content">
            <!-- Filter Panel -->
            <Transition name="filter-slide">
              <a-card
                v-if="!showFilterToggle || showFilters"
                :bordered="false"
                class="filter-card mb-4"
              >
                <div class="filter-bar">
                  <!-- Customer Name Filter -->
                  <a-select
                    v-model:value="arrivalFilters.customerId"
                    allow-clear
                    show-search
                    option-filter-prop="label"
                    class="filter-select"
                    :placeholder="$t('merchant.arrivals.customerNameFilterShort')"
                    :loading="arrivalLoadingCustomers"
                    :filter-option="false"
                    @search="onCustomerSearch"
                    @change="arrivalOnFilterChange"
                  >
                    <a-select-option
                      v-for="customer in customerOptions"
                      :key="customer.id"
                      :value="customer.id"
                      :label="customer.name"
                    >
                      {{ customer.name }}
                    </a-select-option>
                  </a-select>
                  
                  <!-- Create Notification Button -->
                  <a-button 
                    type="primary" 
                    :disabled="selectedArrivalIds.size === 0"
                    :loading="createNotiSubmitting"
                    @click="openCreateNotiConfirm"
                    class="create-noti-btn"
                  >
                    {{ $t('merchant.arrivals.createNoti') }} ({{ selectedArrivalIds.size }})
                  </a-button>
                </div>
              </a-card>
            </Transition>

            <!-- Arrival Table -->
            <a-card v-if="!arrivalUseMobileLayout" :bordered="false" class="panel-card" :class="{ 'tablet-layout': isTabletLayout }">
              <a-table
                :columns="arrivalColumns"
                :data-source="arrivals"
                :pagination="arrivalPaginationConfig"
                :row-selection="{
                  selectedRowKeys: Array.from(selectedArrivalIds),
                  onChange: (selectedKeys: (string | number)[]) => {
                    selectedArrivalIds.clear();
                    selectedKeys.forEach(key => selectedArrivalIds.add(key as number));
                  },
                  getCheckboxProps: () => ({
                    disabled: false,
                  }),
                }"
                row-key="id"
                size="middle"
                :loading="arrivalLoading"
                :scroll="{ x: 1700 }"
                @change="arrivalHandleTableChange"
              />
            </a-card>

            <!-- Mobile Arrival Card List -->
            <div v-else class="arrivals-mobile">
              <a-spin :spinning="arrivalLoading">
                <a-empty v-if="arrivals.length === 0 && !arrivalLoading" :description="$t('merchant.arrivals.noArrivals')" />

                <a-collapse accordion ghost class="arrivals-collapse">
                  <template #expandIcon="{ isActive }">
                    <DownOutlined class="expand-icon" :class="{ rotated: isActive }" />
                  </template>

                  <a-collapse-panel v-for="arrival in arrivals" :key="arrival.id" class="arrival-panel">
                    <template #header>
                      <div class="card-row">
                        <div class="arrival-info">
                          <div class="arrival-name">{{ arrival.order?.orderCode || '-' }}</div>
                          <div class="arrival-date">{{ formatDateTime(arrival.arrivedDate + ' ' + arrival.arrivedTime) }}</div>
                        </div>
                        <div class="selection-side">
                          <a-checkbox 
                            :checked="selectedArrivalIds.has(arrival.id)"
                            @change="(e: any) => {
                              if (e.target.checked) {
                                selectedArrivalIds.add(arrival.id);
                              } else {
                                selectedArrivalIds.delete(arrival.id);
                              }
                            }"
                          />
                        </div>
                      </div>
                    </template>

                    <div class="card-detail">
                      <div class="detail-row">
                        <span class="detail-label">{{ $t('merchant.arrivalDetail.tableVariant') }}</span>
                        <span class="detail-val">
                          {{ arrival.arrivalItems?.map(item => item.orderItem?.variant || '-').join(', ') || '-' }}
                        </span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">{{ $t('merchant.arrivalDetail.tableQuantity') }}</span>
                        <span class="detail-val">
                          {{ arrival.arrivalItems?.reduce((sum, item) => sum + item.arrivedQuantity, 0) || 0 }}
                        </span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">{{ $t('merchant.arrivalDetail.tableCondition') }}</span>
                        <span class="detail-val">
                          {{ arrival.arrivalItems?.map(item => item.condition || '-').join(', ') || '-' }}
                        </span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">{{ $t('merchant.arrivalDetail.tablePurchasePrice') }}</span>
                        <span class="detail-val">
                          {{ arrival.arrivalItems?.map(item => Number(item.orderItem?.purchasePrice) || 0).filter(p => p > 0).join(', ') || '-' }}
                        </span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">{{ $t('merchant.arrivalDetail.tableSellingPrice') }}</span>
                        <span class="detail-val">
                          {{ arrival.arrivalItems?.map(item => Number(item.orderItem?.sellingPriceForeign) || 0).filter(p => p > 0).join(', ') || '-' }}
                        </span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">{{ $t('merchant.arrivalDetail.tableProfit') }}</span>
                        <span class="detail-val">
                          {{ arrival.arrivalItems?.reduce((sum, item) => sum + (Number(item.orderItem?.profit) || 0), 0).toLocaleString() || '0' }}
                        </span>
                      </div>
                    </div>
                  </a-collapse-panel>
                </a-collapse>

                <div v-if="arrivals.length > 0" class="pagination-row">
                  <a-pagination
                    v-model:current="currentPage"
                    v-model:pageSize="pageSize"
                    :total="total"
                    simple
                    @change="arrivalOnPageChange"
                  />
                </div>
              </a-spin>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane :key="'history'" :tab="$t('merchant.notifications.tabHistory')">
          <!-- History tab content: notification table -->
          <div class="history-tab-content">
    <!-- Filter Panel: Search + filters (filter ทำงานอัตโนมัติเมื่อเลือกค่า) -->
    <Transition name="filter-slide">
      <a-card
        v-if="!historyUseMobileLayout || showFilters"
        :bordered="false"
        class="filter-card mb-4"
      >
        <div class="filter-bar">
          <a-input
            v-model:value="historyFilters.search"
            allow-clear
            class="search-input"
            :placeholder="$t('merchant.notifications.searchPlaceholder')"
            @pressEnter="onFilterChange"
            @change="onSearchChange"
          >
            <template #prefix><SearchOutlined /></template>
          </a-input>
          <!-- Notification Type -->
        <a-select
          v-model:value="historyFilters.notificationType"
          allow-clear
          class="filter-select"
          :placeholder="$t('merchant.notifications.typeFilter')"
          @change="onFilterChange"
        >
          <a-select-option value="ARRIVAL">{{ $t('merchant.notifications.typeArrival') }}</a-select-option>
          <a-select-option value="PAYMENT">{{ $t('merchant.notifications.typePayment') }}</a-select-option>
          <a-select-option value="REMINDER">{{ $t('merchant.notifications.typeReminder') }}</a-select-option>
        </a-select>

        <!-- Status -->
        <a-select
          v-model:value="historyFilters.status"
          allow-clear
          class="filter-select"
          :placeholder="$t('merchant.notifications.statusFilter')"
          @change="onFilterChange"
        >
          <a-select-option value="SENT">{{ $t('merchant.notifications.statusSent') }}</a-select-option>
          <a-select-option value="FAILED">{{ $t('merchant.notifications.statusFailed') }}</a-select-option>
        </a-select>

        <!-- Start Date -->
        <a-date-picker
          v-model:value="historyStartDate"
          class="filter-date-single"
          :placeholder="$t('merchant.notifications.startDate')"
          popup-class-name="single-panel-picker"
          @change="onFilterChange"
        />

        <!-- End Date -->
        <a-date-picker
          v-model:value="historyEndDate"
          class="filter-date-single"
          :placeholder="$t('merchant.notifications.endDate')"
          popup-class-name="single-panel-picker"
          @change="onFilterChange"
        />

        <a-button type="default" @click="resetFilters">{{ $t('common.reset') }}</a-button>
      </div>
    </a-card>
    </Transition>

    <!-- Desktop Table -->
    <a-card v-if="!historyUseMobileLayout" :bordered="false" class="panel-card" :class="{ 'tablet-layout': isTabletLayout }">
      <a-table
        :columns="historyColumns"
        :data-source="historyNotifications"
        :pagination="historyPaginationConfig"
        row-key="id"
        size="middle"
        :loading="notificationLoading"
        :scroll="{ x: 1700 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'index'">
            {{ (historyCurrentPage - 1) * historyPageSize + historyNotifications.indexOf(record) + 1 }}
          </template>
          <template v-else-if="column.key === 'notificationType'">
            <a-tag :color="typeColor(record.notificationType)" class="pill-tag">
              {{ typeLabel(record.notificationType) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'channel'">
            <a-tag color="blue" class="pill-tag">{{ record.channel }}</a-tag>
          </template>
          <template v-else-if="column.key === 'recipientContact'">
            <a
              v-if="canOpenFacebook(record)"
              href="javascript:void(0)"
              class="facebook-link"
              @click.prevent="handleFacebookClick(record)"
            >
              {{ record.customer?.contactFacebook || record.recipientContact || '—' }}
            </a>
            <span v-else>{{ record.recipientContact || '—' }}</span>
          </template>
          <template v-else-if="column.key === 'contactPhone'">
            {{ record.customer?.contactPhone || '—' }}
          </template>
          <template v-else-if="column.key === 'contactWhatsapp'">
            <a
              v-if="canOpenWhatsApp(record.customer?.contactWhatsapp ?? record.recipientContact)"
              href="javascript:void(0)"
              class="whatsapp-link"
              @click.prevent="handleWhatsAppClick(record)"
            >
              {{ record.customer?.contactWhatsapp || record.recipientContact || '—' }}
            </a>
            <span v-else>{{ record.customer?.contactWhatsapp || record.recipientContact || '—' }}</span>
          </template>
          <template v-else-if="column.key === 'contactLine'">
            {{ record.customer?.contactLine || '—' }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="statusColor(record.status)" class="pill-tag">
              {{ statusLabel(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'messageContent'">
            <a-tooltip :title="record.messageContent">
              <span class="msg-truncate">{{ record.messageContent }}</span>
            </a-tooltip>
          </template>
          <template v-else-if="column.key === 'notificationLink'">
            <a v-if="record.notificationLink" :href="record.notificationLink" target="_blank" class="link-cell">
              {{ record.notificationLink }}
            </a>
            <span v-else>—</span>
          </template>
          <template v-else-if="column.key === 'sentAt'">
            {{ record.sentAt ? historyFormatDateTime(record.sentAt) : '—' }}
          </template>
          <template v-else-if="column.key === 'actions'">
            <div class="flex items-center justify-end gap-2">
              <!-- WhatsApp Icon -->
              <a-tooltip :title="$t('merchant.notifications.sendWhatsApp')">
                <a-button 
                  v-if="canOpenWhatsApp(record.customer?.contactWhatsapp ?? record.recipientContact)"
                  type="text" 
                  class="icon-action whatsapp-action"
                  @click="handleWhatsAppClick(record)"
                >
                  <WhatsAppOutlined />
                </a-button>
              </a-tooltip>
              
              <!-- Facebook Icon -->
              <a-tooltip :title="$t('merchant.notifications.sendFacebook')">
                <a-button 
                  v-if="canOpenFacebook(record)"
                  type="text" 
                  class="icon-action facebook-action"
                  @click="handleFacebookClick(record)"
                >
                  <FacebookOutlined />
                </a-button>
              </a-tooltip>
              
              <!-- Delete Icon -->
              <a-popconfirm :title="$t('merchant.notifications.confirmDelete')" @confirm="handleDelete(record.id)">
                <a-button type="text" danger class="icon-action"><DeleteOutlined /></a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Mobile Card List -->
    <div v-else class="notifications-mobile">
      <a-spin :spinning="notificationLoading">
        <a-empty v-if="historyNotifications.length === 0 && !notificationLoading" :description="$t('merchant.notifications.noNotifications')" />

        <a-collapse accordion ghost class="notifications-collapse">
          <template #expandIcon="{ isActive }">
            <DownOutlined class="expand-icon" :class="{ rotated: isActive }" />
          </template>

          <a-collapse-panel v-for="notif in historyNotifications" :key="notif.id" class="notif-panel">
            <template #header>
              <div class="card-row">
                <div class="notif-avatar-wrap">
                  <a-avatar class="notif-avatar" :size="44">
                    <BellOutlined />
                  </a-avatar>
                </div>
                <div class="notif-info">
                  <a
                    v-if="canOpenFacebook(notif)"
                    href="javascript:void(0)"
                    class="notif-name facebook-link"
                    @click.prevent="handleFacebookClick(notif)"
                  >
                    {{ notif.customer?.contactFacebook || notif.recipientContact }}
                  </a>
                  <div v-else class="notif-name">{{ notif.recipientContact }}</div>
                  <div class="notif-date">{{ notif.sentAt ? historyFormatDateTime(notif.sentAt) : '—' }}</div>
                </div>
                <div class="status-side">
                  <a-tag :color="statusColor(notif.status)" class="status-tag">
                    {{ statusLabel(notif.status) }}
                  </a-tag>
                </div>
              </div>
            </template>

            <div class="card-detail">
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.notifications.colType') }}</span>
                <a-tag :color="typeColor(notif.notificationType)" class="pill-tag">
                  {{ typeLabel(notif.notificationType) }}
                </a-tag>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.notifications.colChannel') }}</span>
                <a-tag color="blue" class="pill-tag">{{ notif.channel }}</a-tag>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.notifications.colRecipient') }}</span>
                <a
                  v-if="canOpenFacebook(notif)"
                  href="javascript:void(0)"
                  class="detail-val link-val facebook-link"
                  @click.prevent="handleFacebookClick(notif)"
                >
                  {{ notif.customer?.contactFacebook || notif.recipientContact || '—' }}
                </a>
                <span v-else class="detail-val">{{ notif.recipientContact || '—' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.notifications.colContactPhone') }}</span>
                <span class="detail-val">{{ notif.customer?.contactPhone || '—' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.notifications.colContactWhatsapp') }}</span>
                <a
                  v-if="canOpenWhatsApp(notif.customer?.contactWhatsapp ?? notif.recipientContact)"
                  href="javascript:void(0)"
                  class="detail-val link-val whatsapp-link"
                  @click.prevent="handleWhatsAppClick(notif)"
                >
                  {{ notif.customer?.contactWhatsapp || notif.recipientContact || '—' }}
                </a>
                <span v-else class="detail-val">{{ notif.customer?.contactWhatsapp || notif.recipientContact || '—' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.notifications.colContactLine') }}</span>
                <span class="detail-val">{{ notif.customer?.contactLine || '—' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.notifications.colMessage') }}</span>
                <span class="detail-val msg-val">{{ notif.messageContent || '—' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.notifications.colLink') }}</span>
                <a v-if="notif.notificationLink" :href="notif.notificationLink" target="_blank" class="detail-val link-val">{{ notif.notificationLink }}</a>
                <span v-else class="detail-val">—</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.notifications.colRetry') }}</span>
                <span class="detail-val">{{ notif.retryCount ?? '—' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.notifications.colSentAt') }}</span>
                <span class="detail-val">{{ notif.sentAt ? historyFormatDateTime(notif.sentAt) : '—' }}</span>
              </div>
              <div class="detail-row border-none pt-2">
                <a-popconfirm :title="$t('merchant.notifications.confirmDelete')" @confirm="handleDelete(notif.id)">
                  <a-button type="text" danger size="small" class="delete-btn">
                    <DeleteOutlined /> {{ $t('common.delete') }}
                  </a-button>
                </a-popconfirm>
              </div>
            </div>
          </a-collapse-panel>
        </a-collapse>

        <div v-if="historyNotifications.length > 0" class="pagination-row">
          <a-pagination
            v-model:current="historyCurrentPage"
            v-model:pageSize="historyPageSize"
            :total="historyTotal"
            simple
            @change="onPageChange"
          />
        </div>
      </a-spin>
    </div>

          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- Create Notification Modal -->
    <a-modal
      v-model:open="createModalVisible"
      :title="$t('merchant.notifications.createTitle')"
      :width="480"
      :mask-closable="false"
      @cancel="closeCreateModal"
    >
      <a-form layout="vertical" class="create-form">
        <a-form-item :label="$t('merchant.notifications.createCustomer')" required>
          <a-select
            v-model:value="createForm.customerId"
            show-search
            option-filter-prop="label"
            :placeholder="$t('merchant.notifications.selectCustomer')"
            :loading="loadingCustomers"
            allow-clear
            class="full-width"
          >
            <a-select-option
              v-for="c in customers"
              :key="c.id"
              :value="c.id"
              :label="c.customerName"
            >
              {{ c.customerName }} {{ c.contactPhone ? `(${c.contactPhone})` : '' }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('merchant.notifications.createOrders')" required>
          <div v-if="!createForm.customerId" class="create-orders-placeholder">
            {{ $t('merchant.notifications.selectCustomerFirst') }}
          </div>
          <div v-else-if="loadingCustomerOrders" class="create-orders-loading">
            <a-spin size="small" /> {{ $t('common.loading') }}
          </div>
          <div v-else-if="customerOrders.length === 0" class="create-orders-empty">
            {{ $t('merchant.notifications.noOrdersForCustomer') }}
          </div>
          <div v-else class="create-orders-summary">
            <div class="create-orders-label">{{ $t('merchant.notifications.createOrdersDropdownLabel') }}</div>
            <div class="create-orders-list">
              <template v-for="(co, idx) in customerOrders" :key="co.id">
                {{ getCustomerOrderLabel(co) }}<template v-if="idx < customerOrders.length - 1">, </template>
              </template>
            </div>
            <div class="create-orders-hint">{{ $t('merchant.notifications.allOrdersIncluded') }}</div>
          </div>
        </a-form-item>
        <a-form-item :label="$t('merchant.notifications.createMessage')">
          <a-textarea
            v-model:value="createForm.message"
            :placeholder="$t('merchant.notifications.messagePlaceholder')"
            :rows="3"
            class="full-width"
          />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="closeCreateModal">{{ $t('common.cancel') }}</a-button>
        <a-button type="primary" :loading="createSubmitting" :disabled="!canSubmitCreate" @click="handleCreateSubmit">
          {{ $t('merchant.notifications.create') }}
        </a-button>
      </template>
    </a-modal>

    <!-- WhatsApp Language Selection Modal -->
    <a-modal
      v-model:open="whatsappLangModalVisible"
      :title="$t('merchant.notifications.whatsappLangModalTitle')"
      :footer="null"
      @cancel="closeWhatsAppLangModal"
    >
      <div class="whatsapp-lang-modal">
        <p class="whatsapp-lang-hint">{{ $t('merchant.notifications.whatsappLangModalHint') }}</p>
        <div class="whatsapp-lang-buttons">
          <a-button type="primary" size="large" class="lang-btn" @click="sendWhatsAppWithLang('en')">
            {{ $t('merchant.notifications.whatsappLangEn') }}
          </a-button>
          <a-button type="primary" size="large" class="lang-btn" @click="sendWhatsAppWithLang('th')">
            {{ $t('merchant.notifications.whatsappLangTh') }}
          </a-button>
          <a-button type="primary" size="large" class="lang-btn" @click="sendWhatsAppWithLang('la')">
            {{ $t('merchant.notifications.whatsappLangLa') }}
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- Create Notification Language Selection Modal -->
    <a-modal
      v-model:open="showCreateNotiModal"
      :title="$t('merchant.notifications.whatsappLangModalTitle')"
      :footer="null"
      @cancel="closeCreateNotiModal"
    >
      <div class="whatsapp-lang-modal">
        <p class="whatsapp-lang-hint">{{ $t('merchant.notifications.whatsappLangModalHint') }}</p>
        <div class="whatsapp-lang-buttons">
          <a-button type="primary" size="large" class="lang-btn" @click="createNotifications()">
            {{ $t('merchant.notifications.whatsappLangEn') }}
          </a-button>
          <a-button type="primary" size="large" class="lang-btn" @click="createNotifications()">
            {{ $t('merchant.notifications.whatsappLangTh') }}
          </a-button>
          <a-button type="primary" size="large" class="lang-btn" @click="createNotifications()">
            {{ $t('merchant.notifications.whatsappLangLa') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  SearchOutlined,
  FilterOutlined,
  DownOutlined,
  DeleteOutlined,
  BellOutlined,
  WhatsAppOutlined,
  FacebookOutlined,
} from '@ant-design/icons-vue';
import { useArrivalList } from './useArrivalList';
import { useNotificationList } from './useNotificationList';
import { useIsMobile } from '@/shared/composables/useIsMobile';

const activeTab = ref<string>('notification');
const { isMobile, isTablet } = useIsMobile();

const showFilterToggle = computed(() => isMobile.value);
const showFilters = ref(false);

// Use arrival composable for notification tab
const arrivalData = useArrivalList();

// Customer search handler
const onCustomerSearch = (value: string) => {
  arrivalData.fetchCustomers(value);
};

const {
  loading: arrivalLoading,
  arrivals,
  showFilters: arrivalShowFilters,
  filters: arrivalFilters,
  showFilterToggle: arrivalShowFilterToggle,
  useMobileLayout: arrivalUseMobileLayout,
  columns: arrivalColumns,
  paginationConfig: arrivalPaginationConfig,
  formatDateTime,
  onFilterChange: arrivalOnFilterChange,
  handleTableChange: arrivalHandleTableChange,
  currentPage,
  pageSize,
  total,
  onPageChange: arrivalOnPageChange,
  // Notification functionality
  selectedArrivalIds,
  createNotiSubmitting,
  showCreateNotiModal,
  customerOptions,
  loadingCustomers: arrivalLoadingCustomers,
  openCreateNotiConfirm,
  closeCreateNotiModal,
  createNotifications,
} = arrivalData;

// Use notification composable for history tab
const notificationData = useNotificationList();
const {
  loading: notificationLoading,
  notifications: historyNotifications,
  total: historyTotal,
  currentPage: historyCurrentPage,
  pageSize: historyPageSize,
  startDate: historyStartDate,
  endDate: historyEndDate,
  filters: historyFilters,
  useMobileLayout: historyUseMobileLayout,
  columns: historyColumns,
  paginationConfig: historyPaginationConfig,
  typeColor,
  typeLabel,
  statusColor,
  statusLabel,
  formatDateTime: historyFormatDateTime,
  onFilterChange,
  onSearchChange,
  resetFilters,
  onPageChange,
  handleTableChange,
  handleWhatsAppClick,
  handleDelete,
  fetchNotifications: fetchHistoryNotifications,
  createModalVisible,
  createForm,
  createSubmitting,
  customers,
  customerOrders,
  loadingCustomers,
  loadingCustomerOrders,
  closeCreateModal,
  canSubmitCreate,
  handleCreateSubmit,
  getCustomerOrderLabel,
  whatsappLangModalVisible,
  closeWhatsAppLangModal,
  sendWhatsAppWithLang,
  canOpenFacebook,
  handleFacebookClick,
  canOpenWhatsApp,
} = notificationData;

/* แสดง tablet layout adjustments สำหรับ Galaxy Tab S7 */
const isTabletLayout = computed(() => isTablet.value);

// Watch for tab switching - auto refetch notifications when switching to history tab
watch(
  () => activeTab.value,
  async (newTab) => {
    if (newTab === 'history') {
      // Auto refetch notifications when switching to history tab
      await fetchHistoryNotifications();
    }
  }
);
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }

/* ===== Tabs ===== */
.tabs-card {
  background: #f8fafc;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.tabs-card :deep(.ant-card-body) {
  padding: 0 16px 16px;
}
.notification-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0;
}
.notification-tabs :deep(.ant-tabs-tab) {
  padding: 12px 0;
  font-weight: 500;
}
.notification-tabs :deep(.ant-tabs-ink-bar) {
  background: #1677ff;
}
.notification-tabs :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #1677ff;
}
.history-tab-content {
  padding-top: 16px;
}

/* ===== Page header ===== */
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.title-block { flex: 1 1 auto; min-width: 0; }
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.create-form .full-width { width: 100%; }
.page-title { font-size: 22px; font-weight: 600; color: #0f172a; line-height: 1.25; }
.page-subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }
.filter-toggle-btn {
  height: 44px; width: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 18px;
}
.filter-toggle-btn.active {
  background: #1677ff; color: #fff; border-color: #1677ff;
}
/* Removed CSS for commented header Create Notification button */
@media (max-width: 1023px) {
  .page-header { flex-wrap: wrap; }
  .header-actions { order: 3; width: 100%; justify-content: flex-start; }
}
@media (max-width: 767px) {
  .title-block { order: 1; flex: 1 1 auto; }
  .header-actions { order: 2; width: auto; }
  .filter-toggle-btn { order: 3; }
  .page-title { font-size: 15px; }
  .page-subtitle { display: none; }
}

/* ===== Filter Card ===== */
.filter-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 12px 5px 0px 5px;
}
.filter-bar .search-input {
  height: 40px;
  border-radius: 10px;
  min-width: 180px;
  flex: 1 1 200px;
}
/* ลบ padding สีขาวด้านล่างที่บัง border */
.filter-bar .search-input :deep(.ant-input-affix-wrapper) {
  padding: 0 11px !important;
  padding-inline-start: 36px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  height: 40px !important;
  box-sizing: border-box !important;
  border-radius: 10px;
}
.filter-bar .search-input :deep(.ant-input-affix-wrapper .ant-input) {
  padding: 0 !important;
  height: 40px !important;
  line-height: 40px !important;
}
.filter-date-single { 
  height: 40px; 
  border-radius: 10px; 
  min-width: 160px; 
}
.filter-date-single :deep(.ant-picker) { 
  height: 40px !important;
  border-radius: 10px !important; 
}
.filter-select { 
  height: 40px;
  min-width: 160px; 
}
.filter-select :deep(.ant-select-selector) { 
  height: 40px !important;
  border-radius: 10px !important;
  min-height: 40px !important;
}
.filter-select :deep(.ant-select-selection-placeholder) {
  line-height: 40px !important;
  height: 40px !important;
}
.filter-select :deep(.ant-select-selection-item) {
  line-height: 40px !important;
  height: 40px !important;
}

/* Mobile — search ขนาดพอดี ไม่ใหญ่เกิน */
@media (max-width: 767px) {
  .filter-card { border-radius: 10px; }
  .filter-card :deep(.ant-card-body) { padding: 12px !important; }
  .filter-bar { flex-direction: column; gap: 10px; }
  .filter-bar .search-input {
    height: 40px; min-width: 100%; width: 100%;
    flex: 0 0 auto; max-height: 44px;
  }
  .filter-bar .search-input :deep(.ant-input-affix-wrapper) {
    padding: 0 11px !important;
    padding-inline-start: 36px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
  .filter-date-single { width: 100%; }
  .filter-select { width: 100%; }
  .create-noti-btn { width: 100%; }
}
/* Tablet (Galaxy Tab S7 ~800px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .filter-bar { gap: 8px; }
  .filter-bar .search-input {
    height: 36px; min-width: 200px; flex: 1 1 200px;
  }
  .filter-date-single { min-width: 140px; }
  .filter-select { min-width: 140px; }
  .page-header { gap: 8px; }
  .filter-toggle-btn { height: 36px; width: 36px; font-size: 16px; }
}

/* Filter slide animation for mobile */
.filter-slide-enter-active,
.filter-slide-leave-active {
  transition: all 0.25s ease;
}
.filter-slide-enter-from,
.filter-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ===== Desktop card ===== */
.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.pill-tag { border-radius: 999px; padding: 2px 10px; font-weight: 800; font-size: 12px; }
.icon-action { border-radius: 10px; }
.icon-action:hover { background: rgba(29, 78, 216, 0.08) !important; color: #1d4ed8; }
.whatsapp-action { color: #25d366; }
.whatsapp-action:hover { background: rgba(37, 211, 102, 0.1) !important; color: #128c7e !important; }
.facebook-action { color: #0866ff; }
.facebook-action:hover { background: rgba(8, 102, 255, 0.1) !important; color: #1877f2 !important; }

:deep(.ant-table) { width: 100%; }
:deep(.ant-table-thead > tr > th) {
  background: #f8fafc !important; color: #0f172a; font-weight: 700;
}
:deep(.ant-table-tbody > tr:hover > td:not(.ant-table-cell-fix-right)) {
  background: rgba(24, 144, 255, 0.06) !important;
}

/* ===== Tablet (Galaxy Tab S7) ===== */
.tablet-layout :deep(.ant-table) {
  font-size: 13px;
}
.tablet-layout :deep(.ant-table-thead > tr > th) {
  padding: 8px 12px !important;
  font-size: 12px;
}
.tablet-layout :deep(.ant-table-tbody > tr > td) {
  padding: 8px 12px !important;
}
.tablet-layout :deep(.ant-table-cell-fix-right) {
  padding: 8px 8px !important;
}

/* ===== Mobile card list ===== */
.notifications-mobile { display: flex; flex-direction: column; gap: 12px; }
.arrivals-mobile { display: flex; flex-direction: column; gap: 12px; }
.notifications-collapse { background: transparent !important; border: none !important; }
.arrivals-collapse { background: transparent !important; border: none !important; }
.notifications-collapse :deep(.ant-collapse-item),
.arrivals-collapse :deep(.ant-collapse-item) {
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.06) !important;
  border: 1px solid rgba(148, 163, 184, 0.15) !important;
  overflow: hidden;
  margin-bottom: 10px !important;
}
.notifications-collapse :deep(.ant-collapse-header),
.arrivals-collapse :deep(.ant-collapse-header) {
  padding: 14px 14px !important; align-items: center !important;
}
.notifications-collapse :deep(.ant-collapse-content),
.arrivals-collapse :deep(.ant-collapse-content) {
  background: transparent !important;
  border-top: 1px solid rgba(148, 163, 184, 0.18) !important;
}
.notifications-collapse :deep(.ant-collapse-content-box) {
  padding: 0 14px 14px !important;
}
.expand-icon { font-size: 13px; color: #94a3b8; transition: transform 260ms ease; }
.expand-icon.rotated { transform: rotate(180deg); }
.card-row { display: flex; align-items: center; gap: 12px; padding-right: 4px; }
.status-side { flex-shrink: 0; margin-left: auto; }
.selection-side { flex-shrink: 0; margin-left: auto; }
.arrival-info { flex: 1; min-width: 0; }
.arrival-name { font-weight: 600; color: #0f172a; font-size: 14px; }
.arrival-date { font-size: 12px; color: #64748b; margin-top: 2px; }
.arrival-panel { margin-bottom: 8px !important; }
.pagination-row { padding: 16px; background: #f8fafc; border-radius: 12px; }
.notif-avatar-wrap { position: relative; flex-shrink: 0; }
.notif-avatar {
  background: rgba(22, 119, 255, 0.1); color: #1677ff;
  font-weight: 800; font-size: 16px;
}
.notif-info { flex: 1; min-width: 0; }
.notif-name { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.3; }
.notif-date { font-size: 13px; color: #64748b; margin-top: 2px; }
.status-tag { border-radius: 999px; font-weight: 700; font-size: 12px; }
.card-detail { padding-top: 10px; }
.detail-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 0; border-bottom: 1px solid rgba(148, 163, 184, 0.2); gap: 8px;
}
.detail-row.border-none { border-bottom: none; justify-content: flex-end; }
.detail-label { font-size: 12px; font-weight: 600; color: #94a3b8; flex-shrink: 0; }
.detail-val { font-size: 13px; font-weight: 600; color: #1e293b; text-align: right; word-break: break-word; max-width: 60%; }
.detail-val.msg-val { white-space: pre-wrap; word-break: break-word; }
.detail-val.link-val { color: #1d4ed8; font-size: 12px; }
.delete-btn { border-radius: 8px; font-size: 13px; }
.pagination-row { display: flex; justify-content: center; margin-top: 16px; padding-top: 12px; }
.msg-truncate {
  display: inline-block; max-width: 220px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  vertical-align: middle; cursor: default;
}
.link-cell {
  color: #1d4ed8; font-size: 12px;
  display: inline-block; max-width: 160px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  vertical-align: middle;
}
.whatsapp-link {
  color: #25d366;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}
.whatsapp-link:hover {
  color: #128c7e;
  text-decoration: underline;
}
.facebook-link {
  color: #0866ff;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}
.facebook-link:hover {
  color: #1877f2;
  text-decoration: underline;
}
.whatsapp-lang-modal {
  padding: 8px 0;
}
.whatsapp-lang-hint {
  margin-bottom: 20px;
  color: #64748b;
}
.whatsapp-lang-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.whatsapp-lang-buttons .lang-btn {
  width: 100%;
}
</style>

<style>
.create-orders-empty {
  padding: 12px;
  color: #8c8c8c;
  font-size: 13px;
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 6px;
}
.create-orders-placeholder {
  padding: 12px;
  color: #8c8c8c;
  font-size: 13px;
  background: #fafafa;
  border-radius: 6px;
}
.create-orders-loading {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.create-orders-summary {
  padding: 12px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
}
.create-orders-summary .create-orders-label {
  font-weight: 600;
  font-size: 13px;
  color: #262626;
  margin-bottom: 8px;
}
.create-orders-summary .create-orders-list {
  font-size: 13px;
  color: #595959;
  margin-bottom: 6px;
  max-height: 80px;
  overflow-y: auto;
}
.create-orders-summary .create-orders-hint {
  font-size: 12px;
  color: #52c41a;
}
</style>

<style>
/* Reuse single-panel date picker popup */
.single-panel-picker .ant-picker-panels > *:last-child { display: none !important; }
.single-panel-picker .ant-picker-panels > *:first-child .ant-picker-header-next-btn,
.single-panel-picker .ant-picker-panels > *:first-child .ant-picker-header-super-next-btn {
  visibility: visible !important;
}
.single-panel-picker .ant-picker-panel-container { min-width: unset !important; }
</style>
