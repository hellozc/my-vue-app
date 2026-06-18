<template>
  <div
    class="header-chrome"
    :class="{ 'header-chrome--immersive': resolved.isImmersive }"
    :style="shellStyle"
  >
    <div class="header-chrome__status" />
    <div class="header-chrome__bar" :style="barStyle">
      <span v-if="showBackPreview" class="header-chrome__back">‹</span>
      <span class="header-chrome__title">{{ resolved.title || '页面标题' }}</span>
      <div class="header-chrome__right">
        <span
          v-for="(action, index) in resolved.rightActions"
          :key="index"
          class="header-chrome__action"
        >
          {{ action.text || action.icon || '···' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { resolveHeaderConfig } from '@shared/layout/header'

const props = defineProps({
  header: { type: Object, required: true },
  components: { type: Array, default: () => [] },
  layoutName: { type: String, default: '布局预览' },
})

const resolved = computed(() =>
  resolveHeaderConfig(props.header, {
    components: props.components,
    layoutName: props.layoutName,
  })
)

const showBackPreview = computed(
  () => resolved.value.showBack === true || resolved.value.showBack === 'true'
)

const shellStyle = computed(() => ({
  background: resolved.value.resolvedBackground,
  color: resolved.value.resolvedColor,
}))

const barStyle = computed(() => ({
  height: `${resolved.value.height ?? 44}px`,
  color: resolved.value.resolvedColor,
}))
</script>

<style scoped lang="scss">
.header-chrome {
  width: 100%;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.header-chrome--immersive {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  border-bottom: none;
  background: transparent !important;
  pointer-events: none;

  .header-chrome__bar {
    pointer-events: auto;
  }
}

.header-chrome__status {
  height: 20px;
  background: inherit;
}

.header-chrome__bar {
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
}

.header-chrome__back {
  font-size: 24px;
  line-height: 1;
  width: 28px;
  text-align: center;
}

.header-chrome__title {
  flex: 1;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-chrome__right {
  display: flex;
  gap: 8px;
  min-width: 48px;
  justify-content: flex-end;
}

.header-chrome__action {
  font-size: 12px;
}
</style>
