<template>
  <component
    :is="tag"
    class="app-link"
    :class="{ 'is-clickable': clickable }"
    @click="handleClick"
  >
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useLinkNavigation } from '@/composables/useLinkNavigation'

const props = defineProps({
  linkCode: { type: String, default: '' },
  legacyLink: { type: String, default: '' },
  tag: { type: String, default: 'div' },
  disabled: { type: Boolean, default: false },
})

const { navigate, hasLink, layoutInteractive } = useLinkNavigation()

const clickable = computed(() => {
  if (props.disabled) return false
  if (layoutInteractive === false) return false
  return hasLink({ linkCode: props.linkCode, legacyLink: props.legacyLink })
})

async function handleClick(event) {
  if (!clickable.value) return
  event.preventDefault()
  event.stopPropagation()
  await navigate({ linkCode: props.linkCode, legacyLink: props.legacyLink })
}
</script>

<style scoped lang="scss">
.app-link.is-clickable {
  cursor: pointer;
}
</style>
