import type { Component } from 'vue'
import TopContainerBlock from './blocks/TopContainerBlock.vue'
import CarouselBlock from './blocks/CarouselBlock.vue'
import GridBlock from './blocks/GridBlock.vue'
import ListBlock from './blocks/ListBlock.vue'

const blockMap: Record<string, Component> = {
  topContainer: TopContainerBlock,
  carousel: CarouselBlock,
  grid: GridBlock,
  list: ListBlock,
}

export function getBlockComponent(type: string): Component | null {
  return blockMap[type] ?? null
}
