<template>
  <TopContainerBlock v-if="type === 'topContainer'" v-bind="blockProps" />
  <CarouselBlock v-else-if="type === 'carousel'" v-bind="blockProps" />
  <GridBlock v-else-if="type === 'grid'" v-bind="blockProps" />
  <ListBlock v-else-if="type === 'list'" v-bind="blockProps" />
</template>

<script setup lang="ts">
import TopContainerBlock from '@/layout/blocks/TopContainerBlock.vue'
import CarouselBlock from '@/layout/blocks/CarouselBlock.vue'
import GridBlock from '@/layout/blocks/GridBlock.vue'
import ListBlock from '@/layout/blocks/ListBlock.vue'

defineProps<{
  type: string
  blockProps: Record<string, unknown>
}>()
</script>
