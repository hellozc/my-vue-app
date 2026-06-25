import type { Component } from 'vue'
import TopContainerBlock from './blocks/TopContainerBlock.vue'
import CarouselBlock from './blocks/CarouselBlock.vue'
import GridBlock from './blocks/GridBlock.vue'
import ListBlock from './blocks/ListBlock.vue'
import UserCardBlock from './blocks/UserCardBlock.vue'
import MenuGroupBlock from './blocks/MenuGroupBlock.vue'

const blockMap: Record<string, Component> = {
  topContainer: TopContainerBlock,
  carousel: CarouselBlock,
  grid: GridBlock,
  list: ListBlock,
  userCard: UserCardBlock,
  menuGroup: MenuGroupBlock,
}

export function getBlockComponent(type: string): Component | null {
  return blockMap[type] ?? null
}
