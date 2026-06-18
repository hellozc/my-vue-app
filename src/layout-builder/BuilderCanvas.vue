<template>
  <section class="builder-canvas">
    <div class="builder-canvas__toolbar">
      <span>内容展示区</span>
      <el-button link type="danger" :disabled="!components.length" @click="handleClear">
        清空
      </el-button>
    </div>
    <div class="builder-canvas__stage">
      <div class="phone-frame" :style="frameStyle">
        <div
          v-if="headerPreview.shouldRenderChrome"
          class="phone-frame__chrome phone-frame__chrome--top"
          :class="{
            'is-selected': selectedTarget === headerSelection,
            'phone-frame__chrome--immersive': headerPreview.isImmersive,
          }"
          @click.stop="emit('select-header')"
        >
          <div class="canvas-block__tag canvas-block__tag--chrome">页面头部</div>
          <HeaderChromeBlock
            :header="header"
            :components="components"
            :layout-name="layoutName"
          />
        </div>

        <div class="phone-frame__body">
          <draggable
            v-model="components"
            class="phone-frame__dropzone"
            item-key="id"
            group="layout-builder"
            animation="200"
            @add="onAdd"
          >
            <template #item="{ element, index }">
              <div
                class="canvas-block"
                :class="{
                  'is-selected': selectedTarget === element.id,
                  'canvas-block--overlay-host': isOverlayTopContainer(element),
                }"
                :style="getOverlayHostStyle(element)"
                @click.stop="emit('select-component', element.id)"
              >
                <div class="canvas-block__tag">{{ getComponentLabel(element.type) }}</div>
                <component :is="resolveBlock(element.type)" v-bind="element.props" />
                <div class="canvas-block__actions">
                  <el-button link size="small" @click.stop="emit('move-up', index)" :disabled="index === 0">
                    上移
                  </el-button>
                  <el-button
                    link
                    size="small"
                    @click.stop="emit('move-down', index)"
                    :disabled="index === components.length - 1"
                  >
                    下移
                  </el-button>
                  <el-button link type="danger" size="small" @click.stop="emit('remove', element.id)">
                    删除
                  </el-button>
                </div>
              </div>
            </template>
            <template #footer>
              <div v-if="!components.length" class="phone-frame__placeholder">
                <div class="phone-frame__placeholder-icon">
                  <el-icon><Upload /></el-icon>
                </div>
                <p class="phone-frame__placeholder-title">拖拽组件到此处</p>
                <p class="phone-frame__placeholder-desc">从左侧组件库拖入，或点击组件快速添加</p>
                <p class="phone-frame__hint">页面头部、底部 Tabbar 请在右侧「壳层」中配置</p>
              </div>
            </template>
          </draggable>
        </div>

        <div
          v-if="tabbar.enabled"
          class="phone-frame__chrome"
          :class="{ 'is-selected': selectedTarget === tabbarSelection }"
          @click.stop="emit('select-tabbar')"
        >
          <div class="canvas-block__tag canvas-block__tag--chrome">底部 Tabbar</div>
          <TabbarBlock v-bind="tabbar.props" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import draggable from 'vuedraggable'
import { Upload } from '@element-plus/icons-vue'
import TabbarBlock from '@/layout-builder/blocks/TabbarBlock.vue'
import HeaderChromeBlock from '@/layout-builder/blocks/HeaderChromeBlock.vue'
import { getBlockComponent, getComponentLabel } from '@/layout-builder/registry'
import { SELECTION } from '@/layout-builder/constants'
import { resolveTopContainerProps } from '@shared/layout/topContainer'
import { resolveHeaderConfig } from '@shared/layout/header'

const components = defineModel({ type: Array, required: true })

const props = defineProps({
  selectedTarget: { type: String, default: '' },
  pageSettings: { type: Object, required: true },
  tabbar: { type: Object, required: true },
  header: { type: Object, required: true },
  layoutName: { type: String, default: '' },
})

const emit = defineEmits([
  'select-component',
  'select-tabbar',
  'select-header',
  'remove',
  'clear',
  'move-up',
  'move-down',
])

const tabbarSelection = SELECTION.TABBAR
const headerSelection = SELECTION.HEADER

const headerPreview = computed(() =>
  resolveHeaderConfig(props.header, {
    components: components.value,
    layoutName: props.layoutName,
  })
)

const frameStyle = computed(() => {
  const settings = props.pageSettings
  if (settings.backgroundType === 'image' && settings.backgroundImage) {
    return {
      backgroundImage: `url(${settings.backgroundImage})`,
      backgroundSize: '100% auto',
      backgroundPosition: 'top center',
      backgroundRepeat: 'no-repeat',
    }
  }
  return { backgroundColor: settings.backgroundColor || '#f5f7fa' }
})

function resolveBlock(type) {
  return getBlockComponent(type)
}

function isOverlayTopContainer(element) {
  return element.type === 'topContainer' && element.props?.occupySpace === false
}

function getOverlayHostStyle(element) {
  if (!isOverlayTopContainer(element)) return undefined
  const resolved = resolveTopContainerProps(element.props ?? {})
  return { minHeight: `${resolved.carouselHeight}px` }
}

function onAdd(evt) {
  const item = components.value[evt.newIndex]
  if (item?.id) {
    emit('select-component', item.id)
  }
}

async function handleClear() {
  if (!components.value.length) return
  try {
    await ElMessageBox.confirm('确定清空当前页面的所有组件吗？此操作不可撤销。', '清空确认', {
      type: 'warning',
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
    })
    emit('clear')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
.builder-canvas {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.builder-canvas__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.12);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.builder-canvas__stage {
  flex: 1;
  overflow: auto;
  padding: 24px;
  background-image:
    linear-gradient(45deg, rgba(99, 102, 241, 0.06) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(99, 102, 241, 0.06) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(99, 102, 241, 0.06) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(99, 102, 241, 0.06) 75%);
  background-size: 20px 20px;
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0;
}

.phone-frame {
  width: 375px;
  min-height: 640px;
  margin: 0 auto;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  border: 1px solid rgba(99, 102, 241, 0.2);
  display: flex;
  flex-direction: column;
  position: relative;
}

.phone-frame__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  position: relative;
}

.phone-frame__dropzone {
  min-height: 400px;

  &:empty,
  &:has(.phone-frame__placeholder:only-child) {
    min-height: 360px;
  }
}

.phone-frame__chrome {
  position: relative;
  flex-shrink: 0;
  border-top: 2px solid transparent;
  cursor: pointer;

  &.is-selected {
    border-top-color: #6366f1;
    box-shadow: inset 0 0 0 2px #6366f1;
  }

  &--top {
    border-top: none;
    border-bottom: 2px solid transparent;

    &.is-selected {
      border-top-color: transparent;
      border-bottom-color: #6366f1;
      box-shadow: inset 0 0 0 2px #6366f1;
    }

    &.phone-frame__chrome--immersive {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 20;
      border-bottom: none;
      box-shadow: none;

      &.is-selected {
        box-shadow: inset 0 0 0 2px #6366f1;
      }
    }
  }
}

.phone-frame__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 280px;
  margin: 20px 16px;
  padding: 24px 16px;
  border: 2px dashed #a5b4fc;
  border-radius: 12px;
  background: #f5f7ff;
  text-align: center;
}

.phone-frame__placeholder-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #6366f1;
  margin-bottom: 4px;
}

.phone-frame__placeholder-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.phone-frame__placeholder-desc {
  margin: 0;
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
}

.phone-frame__hint {
  margin: 8px 0 0;
  font-size: 11px;
  color: #909399;
}

.canvas-block {
  position: relative;
  border: 2px solid transparent;
  transition: border-color 0.2s;

  &.is-selected {
    border-color: #6366f1;
  }

  &--overlay-host {
    z-index: 1;
  }

  &:hover .canvas-block__actions {
    opacity: 1;
  }
}

.canvas-block__tag {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 2;
  padding: 2px 8px;
  font-size: 11px;
  border-radius: 4px;
  background: rgba(99, 102, 241, 0.85);
  color: #fff;

  &--chrome {
    background: rgba(16, 185, 129, 0.9);
  }
}

.canvas-block__actions {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
  display: flex;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(22, 26, 42, 0.85);
  opacity: 0;
  transition: opacity 0.2s;
}
</style>
