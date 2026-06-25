<template>
  <view
    class="app-link"
    :class="{
      'app-link--clickable': clickable,
      'app-link--block': block,
      'app-link--stack': stack,
    }"
    @tap="handleTap"
  >
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLinkNavigation } from '@/composables/useLinkNavigation'
import { useLoginGate } from '@/composables/useLoginGate'

defineOptions({
  options: {
    // 小程序端减少自定义组件包裹对 flex 布局的干扰
    virtualHost: true,
  },
})

const props = withDefaults(
  defineProps<{
    linkCode?: string
    legacyLink?: string
    disabled?: boolean
    /** 占满父容器宽度（列表行等场景） */
    block?: boolean
    /** 纵向排列图标+文字（Tabbar 等场景） */
    stack?: boolean
    /** 点击前需要先登录 */
    requireLogin?: boolean
    /** 登录后回跳地址，默认当前页 */
    loginRedirect?: string
  }>(),
  {
    linkCode: '',
    legacyLink: '',
    disabled: false,
    block: false,
    stack: false,
    requireLogin: false,
    loginRedirect: '',
  }
)

const { navigate, hasLink } = useLinkNavigation()
const { ensureLoggedIn } = useLoginGate()

const clickable = computed(() => {
  if (props.disabled) return false
  if (props.requireLogin) return true
  return hasLink({ linkCode: props.linkCode, legacyLink: props.legacyLink })
})

async function handleTap() {
  if (props.requireLogin && !ensureLoggedIn(props.loginRedirect || undefined)) {
    return
  }
  if (!hasLink({ linkCode: props.linkCode, legacyLink: props.legacyLink })) {
    if (!props.requireLogin) return
    return
  }
  if (props.disabled) return
  await navigate({ linkCode: props.linkCode, legacyLink: props.legacyLink })
}
</script>

<style scoped>
.app-link {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
}

.app-link--block {
  display: flex;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.app-link--stack {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.app-link--clickable {
  cursor: pointer;
}
</style>
