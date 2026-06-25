<template>
  <view class="menu-group" :style="blockStyle">
    <view v-for="(group, groupIndex) in normalized.groups" :key="groupIndex" class="menu-group__section">
      <view v-if="group.title" class="menu-group__title">{{ group.title }}</view>

      <view
        :class="[
          normalized.style === 'cell' ? 'menu-group__grid' : 'menu-group__list',
        ]"
      >
        <view
          v-for="(item, index) in group.items"
          :key="`${groupIndex}-${index}-${item.label}`"
          :class="[
            normalized.style === 'cell' ? 'menu-group__cell' : 'menu-group__row',
            {
              'menu-group__row--divided':
                normalized.style !== 'cell' &&
                normalized.showDivider &&
                index < group.items.length - 1,
            },
          ]"
        >
          <view
            v-if="item.action"
            class="menu-group__tap"
            @tap.stop="handleItemTap(item)"
          >
            <view class="menu-group__item">
              <view v-if="item.icon" class="menu-group__icon">
                <text class="menu-group__icon-text">{{ getIconChar(item.icon, '📌') }}</text>
              </view>
              <view class="menu-group__content">
                <text class="menu-group__label">{{ item.label || `菜单${index + 1}` }}</text>
                <text v-if="item.desc" class="menu-group__desc">{{ item.desc }}</text>
              </view>
              <text v-if="normalized.showArrow" class="menu-group__arrow">›</text>
            </view>
          </view>
          <AppLink
            v-else
            block
            :link-code="item.linkCode"
            :legacy-link="item.link"
            :require-login="Boolean(item.requireLogin)"
          >
            <view class="menu-group__item">
              <view v-if="item.icon" class="menu-group__icon">
                <text class="menu-group__icon-text">{{ getIconChar(item.icon, '📌') }}</text>
              </view>
              <view class="menu-group__content">
                <text class="menu-group__label">{{ item.label || `菜单${index + 1}` }}</text>
                <text v-if="item.desc" class="menu-group__desc">{{ item.desc }}</text>
              </view>
              <text v-if="item.badge" class="menu-group__badge">{{ item.badge }}</text>
              <text v-if="normalized.showArrow" class="menu-group__arrow">›</text>
            </view>
          </AppLink>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppLink from '@/layout/components/AppLink.vue'
import { useAuth } from '@/composables/useAuth'
import { useLoginGate } from '@/composables/useLoginGate'
import { getIconChar } from '@/utils/iconMap'
import { pxStringToRpx } from '@/utils/unit'
import { normalizeMenuGroupProps } from '@shared/layout/menuGroup'

interface MenuGroupItem {
  label?: string
  icon?: string
  desc?: string
  badge?: string
  linkCode?: string
  link?: string
  requireLogin?: boolean
  action?: string
}

const props = defineProps<{
  padding?: string
  margin?: string
  background?: string
  borderRadius?: number
  showDivider?: boolean
  showArrow?: boolean
  style?: string
  groups?: Array<{ title?: string; items?: MenuGroupItem[] }>
}>()

const auth = useAuth()
const { ensureLoggedIn } = useLoginGate()
const normalized = computed(() => normalizeMenuGroupProps(props))

const blockStyle = computed(() => ({
  padding: pxStringToRpx(normalized.value.padding),
  margin: pxStringToRpx(normalized.value.margin),
  background: normalized.value.background,
  borderRadius: `${normalized.value.borderRadius}rpx`,
}))

async function handleItemTap(item: MenuGroupItem) {
  if (item.action !== 'logout') return

  if (item.requireLogin && !ensureLoggedIn()) return
  if (!auth.isLoggedIn.value) {
    ensureLoggedIn()
    return
  }

  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (!res.confirm) return
      await auth.logout()
      uni.showToast({ title: '已退出登录', icon: 'none' })
    },
  })
}
</script>

<style scoped>
.menu-group {
  box-sizing: border-box;
  overflow: hidden;
}

.menu-group__section + .menu-group__section {
  margin-top: 8rpx;
}

.menu-group__title {
  padding: 24rpx 32rpx 8rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #606266;
}

.menu-group__list {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.menu-group__row {
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.menu-group__row--divided::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1rpx;
  background: #ebeef5;
  transform: scaleY(0.5);
  pointer-events: none;
}

.menu-group__grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 8rpx 16rpx 16rpx;
}

.menu-group__cell {
  width: 25%;
  box-sizing: border-box;
  padding: 8rpx;
}

.menu-group__tap {
  display: block;
  width: 100%;
}

.menu-group__item {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  min-height: 96rpx;
  padding: 20rpx 32rpx;
  box-sizing: border-box;
}

.menu-group__cell .menu-group__item {
  flex-direction: column;
  min-height: 0;
  padding: 16rpx 8rpx;
  text-align: center;
}

.menu-group__icon {
  width: 64rpx;
  height: 64rpx;
  margin-right: 24rpx;
  border-radius: 16rpx;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.menu-group__cell .menu-group__icon {
  margin-right: 0;
  margin-bottom: 12rpx;
}

.menu-group__icon-text {
  font-size: 32rpx;
  line-height: 1;
}

.menu-group__content {
  flex: 1;
  min-width: 0;
}

.menu-group__label {
  font-size: 28rpx;
  color: #303133;
  line-height: 40rpx;
}

.menu-group__desc {
  display: block;
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #909399;
  line-height: 32rpx;
}

.menu-group__badge {
  margin-right: 12rpx;
  padding: 2rpx 12rpx;
  font-size: 20rpx;
  color: #fff;
  background: #f56c6c;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.menu-group__arrow {
  flex-shrink: 0;
  color: #c0c4cc;
  font-size: 36rpx;
  line-height: 1;
}
</style>
