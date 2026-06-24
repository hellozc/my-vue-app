<template>
  <view
    class="tabbar-block"
    :class="{ 'tabbar-block--safe': useSafeAreaPadding && safeAreaBottomPx <= 0 }"
    :style="shellStyle"
  >
    <view class="tabbar-block__content" :style="contentStyle">
      <AppLink
        v-for="(item, index) in items"
        :key="index"
        class="tabbar-block__item"
        block
        stack
        :link-code="item.linkCode"
        :legacy-link="item.path"
      >
        <text class="tabbar-block__icon" :style="iconStyle(index)">{{ getIconChar(item.icon, '•') }}</text>
        <text class="tabbar-block__label" :style="labelStyle(index)">{{ item.label }}</text>
      </AppLink>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import AppLink from '@/layout/components/AppLink.vue'
import { useSafeAreaBottom } from '@/composables/useSafeAreaBottom'
import { getIconChar } from '@/utils/iconMap'
import { pxToRpx } from '@/utils/unit'

interface TabbarItem {
  label: string
  icon?: string
  linkCode?: string
  path?: string
}

const props = withDefaults(
  defineProps<{
    height?: number
    background?: string
    activeColor?: string
    inactiveColor?: string
    showBorder?: boolean
    fontSize?: number
    iconSize?: number
    activeIndex?: number
    safeAreaInset?: boolean
    items?: TabbarItem[]
  }>(),
  {
    height: 50,
    background: '#ffffff',
    activeColor: '#6366f1',
    inactiveColor: '#909399',
    showBorder: true,
    fontSize: 11,
    iconSize: 22,
    activeIndex: 0,
    safeAreaInset: true,
    items: () => [],
  }
)

const safeAreaBottomPx = useSafeAreaBottom()
const useSafeAreaPadding = computed(() => props.safeAreaInset !== false)

const shellStyle = computed((): CSSProperties => {
  const style: CSSProperties = {
    background: props.background,
    borderTop: props.showBorder ? '1rpx solid #ebeef5' : 'none',
  }
  // 小程序端 env(safe-area-inset-bottom) 不可靠，用 uni 实测值做 padding
  if (useSafeAreaPadding.value && safeAreaBottomPx.value > 0) {
    style.paddingBottom = pxToRpx(safeAreaBottomPx.value)
  }
  return style
})

const contentStyle = computed((): CSSProperties => ({
  height: pxToRpx(props.height),
}))

function iconStyle(index: number): CSSProperties {
  return {
    color: index === props.activeIndex ? props.activeColor : props.inactiveColor,
    fontSize: pxToRpx(props.iconSize),
  }
}

function labelStyle(index: number): CSSProperties {
  return {
    color: index === props.activeIndex ? props.activeColor : props.inactiveColor,
    fontSize: pxToRpx(props.fontSize),
  }
}
</script>

<style scoped>
.tabbar-block {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

.tabbar-block--safe {
  padding-bottom: max(
    constant(safe-area-inset-bottom),
    env(safe-area-inset-bottom),
    var(--lc-safe-area-bottom, 0px)
  );
}

.tabbar-block__content {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  flex-shrink: 0;
  box-sizing: border-box;
}

.tabbar-block__item {
  flex: 1;
  width: 0;
  height: 100%;
  min-width: 0;
  padding: 0 8rpx;
  box-sizing: border-box;
}

.tabbar-block__icon {
  display: block;
  line-height: 1;
  flex-shrink: 0;
}

.tabbar-block__label {
  display: block;
  margin-top: 4rpx;
  line-height: 1.2;
  max-width: 100%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
