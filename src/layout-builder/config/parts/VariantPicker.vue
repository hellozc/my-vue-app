<template>
  <div class="variant-picker">
    <button
      v-for="item in variants"
      :key="item.key"
      type="button"
      class="variant-card"
      :class="{ 'is-active': model === item.key }"
      @click="model = item.key"
    >
      <div class="variant-card__preview" :data-wireframe="item.wireframe">
        <span v-if="item.features?.brand" class="wireframe-brand" />
        <span class="wireframe-banner" />
        <span v-if="item.features?.indicator" class="wireframe-dots">
          <i /><i /><i />
        </span>
      </div>
      <div class="variant-card__body">
        <div class="variant-card__label">{{ item.label }}</div>
        <div class="variant-card__desc">{{ item.description }}</div>
        <div class="variant-card__meta">高度 {{ item.height }}px</div>
      </div>
    </button>
  </div>
</template>

<script setup>
defineProps({
  variants: { type: Array, required: true },
})

const model = defineModel({ type: String, required: true })
</script>

<style scoped lang="scss">
.variant-picker {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.variant-card {
  display: flex;
  gap: 12px;
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s, background 0.2s;

  &:hover {
    border-color: rgba(99, 102, 241, 0.45);
  }

  &.is-active {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.12);
    box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.35);
  }
}

.variant-card__preview {
  position: relative;
  flex-shrink: 0;
  width: 72px;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(180deg, #eef2ff 0%, #e0e7ff 100%);
  border: 1px solid rgba(99, 102, 241, 0.18);

  &[data-wireframe='immersive'] {
    height: 88px;
  }

  &[data-wireframe='compact'] {
    height: 56px;
  }
}

.wireframe-brand {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: #ef4444;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.8);
}

.wireframe-banner {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(236, 72, 153, 0.18));
}

.wireframe-dots {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 5px;
  display: flex;
  justify-content: center;
  gap: 3px;

  i {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.85);

    &:nth-child(2) {
      opacity: 0.55;
    }

    &:nth-child(3) {
      opacity: 0.35;
    }
  }
}

.variant-card__body {
  min-width: 0;
}

.variant-card__label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
}

.variant-card__desc {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.62);
}

.variant-card__meta {
  margin-top: 6px;
  font-size: 11px;
  color: rgba(129, 140, 248, 0.95);
}
</style>
