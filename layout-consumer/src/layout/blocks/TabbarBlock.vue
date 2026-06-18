<template>
  <view class="tabbar-block" :style="shellStyle">
    <view class="tabbar-block__content" :style="contentStyle">
      <AppLink
        v-for="(item, index) in items"
        :key="index"
        class="tabbar-block__item"
        :link-code="item.linkCode"
        :legacy-link="item.path"
      >
        <text class="tabbar-block__icon" :style="itemStyle(index)">{{ getIconChar(item.icon, '•') }}</text>
        <text class="tabbar-block__label" :style="itemStyle(index)">{{ item.label }}</text>
      </AppLink>
    </view>
    <view
      v-if="safeAreaInset"
      class="tabbar-block__safe-area"
      :style="safeAreaStyle"
    />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppLink from '@/layout/components/AppLink.vue'
import { getIconChar } from '@/utils/iconMap'
import { pxToRpx } from '@/utils/unit'
import { useSafeAreaBottom } from '@/composables/useSafeAreaBottom'

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

const safeAreaBottom = useSafeAreaBottom()

const shellStyle = computed(() => ({
  background: props.background,
  borderTop: props.showBorder ? '1rpx solid #ebeef5' : 'none',
}))

const contentStyle = computed(() => ({
  height: pxToRpx(props.height),
}))

const safeAreaStyle = computed(() => {
  if (safeAreaBottom.value > 0) {
    return { height: pxToRpx(safeAreaBottom.value) }
  }
  return {}
})

function itemStyle(index: number) {
  const color = index === props.activeIndex ? props.activeColor : props.inactiveColor
  return {
    color,
    fontSize: pxToRpx(props.fontSize),
  }
}
</script>

<style scoped>
.tabbar-block {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.tabbar-block__content {
  display: flex;
  align-items: stretch;
  width: 100%;
  flex-shrink: 0;
}

.tabbar-block__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tabbar-block__icon {
  line-height: 1.2;
  font-size: 40rpx;
}

.tabbar-block__label {
  margin-top: 4rpx;
  line-height: 1.2;
}

.tabbar-block__safe-area {
  width: 100%;
  flex-shrink: 0;
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
}
</style>
