<template>
  <div class="sa-dashboard">
    <div class="page-header">
      <div class="title-block">
        <div class="page-title">{{ $t('adminDashboard.title') }}</div>
        <div class="page-subtitle">{{ $t('adminDashboard.subtitle') }}</div>
      </div>
    </div>

    <a-spin :spinning="loading">
      <!-- Row 1: Summary Stat Cards -->
      <a-row :gutter="[16, 16]" class="stats-row">
        <a-col :xs="24" :sm="12" :md="12" :lg="6">
          <router-link :to="{ name: 'super-admin-merchants' }" class="stat-card-link">
            <div class="stat-card stat-purple">
              <div class="stat-icon"><ShopOutlined /></div>
              <div class="stat-body">
                <div class="stat-value">{{ dashboard?.summary.totalMerchants ?? 0 }}</div>
                <div class="stat-label">{{ $t('adminDashboard.totalMerchants') }}</div>
              </div>
            </div>
          </router-link>
        </a-col>
        <a-col :xs="24" :sm="12" :md="12" :lg="6">
          <router-link :to="{ name: 'super-admin-users' }" class="stat-card-link">
            <div class="stat-card stat-blue">
              <div class="stat-icon"><TeamOutlined /></div>
              <div class="stat-body">
                <div class="stat-value">{{ dashboard?.summary.totalAdminUsers ?? 0 }}</div>
                <div class="stat-label">{{ $t('adminDashboard.totalAdminUsers') }}</div>
              </div>
            </div>
          </router-link>
        </a-col>
        <a-col :xs="24" :sm="12" :md="12" :lg="6">
          <router-link :to="{ name: 'super-admin-users' }" class="stat-card-link">
            <div class="stat-card stat-green">
              <div class="stat-icon"><UserOutlined /></div>
              <div class="stat-body">
                <div class="stat-value">{{ dashboard?.summary.totalMerchantUsers ?? 0 }}</div>
                <div class="stat-label">{{ $t('adminDashboard.totalMerchantUsers') }}</div>
              </div>
            </div>
          </router-link>
        </a-col>
        <a-col :xs="24" :sm="12" :md="12" :lg="6">
          <div class="stat-card stat-orange">
            <div class="stat-icon"><ShoppingCartOutlined /></div>
            <div class="stat-body">
              <div class="stat-value">{{ dashboard?.summary.totalOrders ?? 0 }}</div>
              <div class="stat-label">{{ $t('adminDashboard.totalOrders') }}</div>
            </div>
          </div>
        </a-col>
      </a-row>

      <!-- Row 2: Top Merchants + Recent User Logins -->
      <a-row :gutter="[16, 16]" class="stats-row detail-row">
        <!-- Top 5 Merchants -->
        <a-col :xs="24" :lg="12">
          <a-card :bordered="false" class="panel-card">
            <div class="panel-title">{{ $t('adminDashboard.topMerchants') }}</div>
            <a-empty
              v-if="!topMerchants.length"
              :description="$t('adminDashboard.noData')"
              class="empty-block"
            />
            <div v-else class="merchant-list">
              <router-link
                v-for="(m, idx) in topMerchants"
                :key="m.id"
                :to="{ name: 'super-admin-merchants-detail', params: { id: m.id } }"
                class="merchant-row merchant-row-link"
              >
                <div class="merchant-rank">{{ idx + 1 }}</div>
                <div class="merchant-info">
                  <div class="merchant-name">{{ m.shopName }}</div>
                  <div class="merchant-sub">{{ m.totalOrders }} {{ $t('adminDashboard.orders') }}</div>
                  <div v-if="m.ownerUser" class="merchant-owner">{{ m.ownerUser }}</div>
                  <div v-if="m.ownerUserEmail" class="merchant-owner-email">{{ m.ownerUserEmail }}</div>
                </div>
              </router-link>
            </div>
          </a-card>
        </a-col>

        <!-- Recent User Logins -->
        <a-col :xs="24" :lg="12">
          <a-card :bordered="false" class="panel-card">
            <div class="panel-title">{{ $t('adminDashboard.recentLogins') }}</div>
            <a-empty
              v-if="!recentLogins.length"
              :description="$t('adminDashboard.noData')"
              class="empty-block"
            />
            <div v-else class="login-list">
              <div
                v-for="u in recentLogins"
                :key="u.id"
                class="login-row"
              >
                <a-avatar :style="{ backgroundColor: avatarColor(u.fullName), flexShrink: 0 }">
                  {{ initials(u.fullName) }}
                </a-avatar>
                <div class="login-info">
                  <div class="login-name">{{ u.fullName }}</div>
                  <div class="login-email">{{ u.email }}</div>
                  <div v-if="u.merchant" class="login-merchant">
                    <ShopOutlined class="login-merchant-icon" /> {{ u.merchant.shopName }}
                  </div>
                </div>
                <div class="login-time">{{ fmtDate(u.lastLogin) }}</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { ShopOutlined, TeamOutlined, UserOutlined, ShoppingCartOutlined } from '@ant-design/icons-vue';
import { useSuperAdminDashboard } from '@/presentation/composables/super-admin/useSuperAdminDashboard';
import dayjs from 'dayjs';

const { loading, dashboard, fetchDashboard } = useSuperAdminDashboard();

const windowWidth = ref(window.innerWidth);
function onResize() { windowWidth.value = window.innerWidth; }
onMounted(() => window.addEventListener('resize', onResize));
onUnmounted(() => window.removeEventListener('resize', onResize));

onMounted(async () => {
  await fetchDashboard();
});

const topMerchants = computed(() => dashboard.value?.details.topMerchants ?? []);
const recentLogins = computed(() => dashboard.value?.details.recentUserLogins ?? []);

function fmtDate(date?: Date | string) {
  if (!date) return '-';
  return dayjs(date).format('DD MMM YYYY HH:mm');
}

const AVATAR_COLORS = ['#2563eb', '#f97316', '#a855f7', '#10b981', '#ef4444', '#06b6d4', '#d97706'];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
}
</script>

<style scoped>
.sa-dashboard { padding: 0; }

.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 600; color: #0f172a; line-height: 1.25; }
.page-subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }

.stats-row { margin-bottom: 4px; }

.stat-card {
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04);
  background: #fff;
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(15,23,42,0.10); }
.stat-card-link { text-decoration: none; color: inherit; display: block; }
.stat-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.stat-purple .stat-icon { background: rgba(139,92,246,0.12); color: #8b5cf6; }
.stat-blue .stat-icon   { background: rgba(59,130,246,0.12);  color: #3b82f6; }
.stat-green .stat-icon  { background: rgba(34,197,94,0.12);   color: #22c55e; }
.stat-orange .stat-icon { background: rgba(245,158,11,0.12);  color: #f59e0b; }

.stat-body { flex: 1; min-width: 0; }
.stat-value { font-size: 26px; font-weight: 700; color: #0f172a; line-height: 1.2; }
.stat-label { font-size: 13px; color: #64748b; margin-top: 2px; }

.panel-card {
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04);
  height: 100%;
}
.panel-title { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 16px; }

.detail-row { align-items: stretch; }
.detail-row :deep(.ant-col) { display: flex; flex-direction: column; }
.detail-row :deep(.ant-col) > .panel-card { flex: 1; }

.empty-block { padding: 24px 0; }

/* Top Merchants list */
.merchant-list { display: flex; flex-direction: column; gap: 10px; }
.merchant-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.merchant-row-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.merchant-row-link:hover {
  background: #eff6ff;
  border-color: rgba(29, 78, 216, 0.25);
}
.merchant-rank {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: #6366f1;
  color: #fff;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.merchant-info { flex: 1; min-width: 0; }
.merchant-name { font-size: 14px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.merchant-sub { font-size: 12px; color: #64748b; margin-top: 1px; }
.merchant-owner { font-size: 11px; color: #475569; margin-top: 2px; }
.merchant-owner-email { font-size: 11px; color: #94a3b8; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Recent Logins list */
.login-list { display: flex; flex-direction: column; gap: 10px; }
.login-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.login-info { flex: 1; min-width: 0; }
.login-name { font-size: 14px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.login-email { font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.login-merchant { font-size: 11px; color: #8b5cf6; margin-top: 2px; display: flex; align-items: center; gap: 4px; }
.login-merchant-icon { font-size: 10px; }
.login-time { font-size: 11px; color: #94a3b8; text-align: right; flex-shrink: 0; white-space: nowrap; }

/* Tablet */
@media (min-width: 768px) and (max-width: 1024px) {
  .page-title { font-size: 18px; }
  .stat-value { font-size: 22px; }
}

/* Mobile */
@media (max-width: 767px) {
  .page-title { font-size: 16px; }
  .page-subtitle { display: none; }
  .stat-card { padding: 14px; gap: 10px; flex-direction: column; align-items: flex-start; }
  .stat-icon { width: 36px; height: 36px; font-size: 16px; border-radius: 10px; }
  .stat-value { font-size: 20px; }
  .stat-label { font-size: 11px; }
  .login-time { display: none; }
}
</style>
