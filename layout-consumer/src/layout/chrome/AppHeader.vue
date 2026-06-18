<template>
  <view
    class="app-header"
    :class="{
      'app-header--immersive': immersive,
      'app-header--fixed': fixed,
    }"
    :style="shellStyle"
  >
    <view
      v-if="safeAreaInset"
      class="app-header__status-bar"
      :style="statusBarStyle"
    />

    <view class="app-header__bar" :style="barStyle">
      <view class="app-header__left">
        <view
          v-if="showBack"
          class="app-header__back"
          :style="{ color: resolvedColor }"
          @tap="handleBack"
        >
          <text class="app-header__back-icon">‹</text>
        </view>
        <slot name="left" />
      </view>

      <view class="app-header__center">
        <text
          v-if="title"
          class="app-header__title text-ellipsis"
          :style="{ color: resolvedColor }"
        >
          {{ title }}
        </text>
        <slot name="center" />
      </view>

      <view class="app-header__right">
        <template v-for="(action, index) in rightActions" :key="index">
          <AppLink
            v-if="action.linkCode || action.link"
            class="app-header__action"
            :link-code="action.linkCode"
            :legacy-link="action.link"
            @tap.stop="handleAction(action)"
          >
            <text class="app-header__action-text" :style="{ color: resolvedColor }">
              {{ action.text || getActionIcon(action.icon) }}
            </text>
          </AppLink>
          <view
            v-else
            class="app-header__action"
            @tap.stop="handleAction(action)"
          >
            <text class="app-header__action-text" :style="{ color: resolvedColor }">
              {{ action.text || getActionIcon(action.icon) }}
            </text>
          </view>
        </template>
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppLink from '@/layout/components/AppLink.vue'
import { useSafeAreaTop } from '@/composables/useSafeAreaTop'
import { useHeaderBack } from '@/composables/useHeaderBack'
import { pxToRpx } from '@/utils/unit'
import type { HeaderShowBack } from '@/composables/useHeaderBack'

export interface HeaderRightAction {
  type?: 'icon' | 'text'
  icon?: string
  text?: string
  linkCode?: string
  link?: string
  action?: string
}

const props = withDefaults(
  defineProps<{
    title?: string
    showBack?: HeaderShowBack
    background?: string
    color?: string
    height?: number
    safeAreaInset?: boolean
    immersive?: boolean
    fixed?: boolean
    rightActions?: HeaderRightAction[]
  }>(),
  {
    title: '',
    showBack: 'auto',
    background: '#ffffff',
    color: '#000000',
    height: 44,
    safeAreaInset: true,
    immersive: false,
    fixed: true,
    rightActions: () => [],
  }
)

const emit = defineEmits<{
  back: []
  action: [action: HeaderRightAction]
}>()

const { topInset, mpNavBarPaddingRight } = useSafeAreaTop()
const { visible: showBack, goBack } = useHeaderBack(props.showBack)

const resolvedColor = computed(() => props.color)

const shellStyle = computed(() => ({
  background: props.immersive ? 'transparent' : props.background,
}))

const statusBarStyle = computed(() => {
  if (topInset.value > 0) {
    return { height: pxToRpx(topInset.value) }
  }
  return { height: 'env(safe-area-inset-top)' }
})

const barStyle = computed(() => ({
  height: pxToRpx(props.height),
  paddingRight: mpNavBarPaddingRight.value
    ? `${pxToRpx(mpNavBarPaddingRight.value)}`
    : '24rpx',
}))

const ACTION_ICON_MAP: Record<string, string> = {
  share: '分享',
  more: '···',
  search: '搜',
  home: '⌂',
}

function getActionIcon(icon?: string) {
  if (!icon) return '···'
  return ACTION_ICON_MAP[icon] ?? icon
}

function handleBack() {
  emit('back')
  goBack()
}

function handleAction(action: HeaderRightAction) {
  emit('action', action)
  if (action.action === 'share') {
    // #ifdef MP-WEIXIN
    uni.showShareMenu?.({ withShareTicket: true })
    // #endif
    // #ifdef H5
    uni.showToast({ title: '请使用浏览器分享', icon: 'none' })
    // #endif
  }
}
</script>

<style scoped lang="scss">
.app-header {
  width: 100%;
  z-index: 200;
}

.app-header--fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}

.app-header--immersive {
  background: transparent !important;
  pointer-events: none;

  .app-header__bar,
  .app-header__back,
  .app-header__action {
    pointer-events: auto;
  }
}

.app-header__status-bar {
  width: 100%;
}

.app-header__bar {
  display: flex;
  align-items: center;
  padding-left: 12rpx;
  position: relative;
}

.app-header__left,
.app-header__right {
  display: flex;
  align-items: center;
  min-width: 120rpx;
  flex-shrink: 0;
}

.app-header__right {
  justify-content: flex-end;
  gap: 8rpx;
}

.app-header__center {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16rpx;
}

.app-header__title {
  max-width: 100%;
  font-size: 32rpx;
  font-weight: 600;
  text-align: center;
}

.app-header__back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-header__back-icon {
  font-size: 52rpx;
  line-height: 1;
  font-weight: 300;
}

.app-header__action {
  min-width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}

.app-header__action-text {
  font-size: 26rpx;
  line-height: 1;
}
</style>
