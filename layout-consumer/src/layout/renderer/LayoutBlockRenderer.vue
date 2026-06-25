<template>
  <TopContainerBlock v-if="type === 'topContainer'" v-bind="blockProps" />
  <CarouselBlock v-else-if="type === 'carousel'" v-bind="blockProps" />
  <GridBlock v-else-if="type === 'grid'" v-bind="blockProps" />
  <ListBlock v-else-if="type === 'list'" v-bind="listProps" />
  <UserCardBlock v-else-if="type === 'userCard'" v-bind="userCardProps" />
  <MenuGroupBlock v-else-if="type === 'menuGroup'" v-bind="menuGroupProps" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TopContainerBlock from '@/layout/blocks/TopContainerBlock.vue'
import CarouselBlock from '@/layout/blocks/CarouselBlock.vue'
import GridBlock from '@/layout/blocks/GridBlock.vue'
import ListBlock from '@/layout/blocks/ListBlock.vue'
import UserCardBlock from '@/layout/blocks/UserCardBlock.vue'
import MenuGroupBlock from '@/layout/blocks/MenuGroupBlock.vue'
import { normalizeListProps } from '@shared/layout/list'
import { normalizeUserCardProps } from '@shared/layout/userCard'
import { normalizeMenuGroupProps } from '@shared/layout/menuGroup'

const props = defineProps<{
  type: string
  blockProps: Record<string, unknown>
}>()

const listProps = computed(() => normalizeListProps(props.blockProps))
const userCardProps = computed(() => normalizeUserCardProps(props.blockProps))
const menuGroupProps = computed(() => normalizeMenuGroupProps(props.blockProps))
</script>
