<template>
  <view
    class="app-link"
    :class="{
      'app-link--clickable': clickable,
      'app-link--block': block,
    }"
    @tap="handleTap"
  >
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLinkNavigation } from '@/composables/useLinkNavigation'

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
  }>(),
  {
    linkCode: '',
    legacyLink: '',
    disabled: false,
    block: false,
  }
)

const { navigate, hasLink } = useLinkNavigation()

const clickable = computed(() => {
  if (props.disabled) return false
  return hasLink({ linkCode: props.linkCode, legacyLink: props.legacyLink })
})

async function handleTap() {
  if (!clickable.value) return
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
}

.app-link--clickable {
  cursor: pointer;
}
</style>
