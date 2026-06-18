<template>
  <view
    class="app-link"
    :class="{ 'app-link--clickable': clickable }"
    @tap="handleTap"
  >
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLinkNavigation } from '@/composables/useLinkNavigation'

const props = withDefaults(
  defineProps<{
    linkCode?: string
    legacyLink?: string
    disabled?: boolean
  }>(),
  {
    linkCode: '',
    legacyLink: '',
    disabled: false,
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
.app-link--clickable {
  cursor: pointer;
}
</style>
