<template>
  <view class="list-block" :style="blockStyle">
    <view v-if="header.show !== false" class="list-block__header">
      <view class="list-block__header-left">
        <view class="list-block__accent" :style="{ background: header.accentColor }" />
        <view class="list-block__title-wrap">
          <text class="list-block__header-title">{{ displayTitle }}</text>
        </view>
      </view>
      <AppLink
        v-if="header.showMore"
        class="list-block__more-link"
        :link-code="header.moreLinkCode"
        :legacy-link="header.moreLink"
      >
        <text class="list-block__more">{{ header.moreText || '更多>' }}</text>
      </AppLink>
    </view>

    <AppLink
      v-for="(item, index) in displayItems"
      :key="item.id ?? `${index}-${item.title ?? ''}`"
      block
      :link-code="item.linkCode"
      :legacy-link="item.link"
    >
      <view
        class="list-block__item"
        :class="{ 'list-block__item--divided': showDivider && index < displayItems.length - 1 }"
      >
        <view v-if="item.icon || item.image" class="list-block__icon">
          <image
            v-if="item.image"
            class="list-block__thumb"
            :src="resolveMediaUrl(item.image)"
            mode="aspectFill"
          />
          <view v-else class="list-block__icon-text">{{ getIconChar(item.icon, '📄') }}</view>
        </view>

        <view class="list-block__content">
          <text class="list-block__title">{{ item.title || `列表项 ${index + 1}` }}</text>
          <text v-if="item.desc" class="list-block__desc">{{ item.desc }}</text>
        </view>

        <text v-if="showArrow" class="list-block__arrow">›</text>
      </view>
    </AppLink>

    <view v-if="showInitialLoading" class="list-block__status">加载中...</view>
    <view v-else-if="showEmpty" class="list-block__status">暂无数据</view>
    <view
      v-else-if="showInitialError"
      class="list-block__status list-block__status--error"
      @tap.stop="retry"
    >
      {{ errorMsg }}（点击重试）
    </view>

    <view v-else-if="showPager" class="list-block__pager">
      <text
        class="list-block__pager-btn"
        :class="{ 'is-disabled': !canPrev }"
        @tap.stop="goPrev"
      >
        上一页
      </text>
      <text class="list-block__pager-info">{{ page }} / {{ totalPages }}</text>
      <text
        class="list-block__pager-btn"
        :class="{ 'is-disabled': !hasMore }"
        @tap.stop="goNext"
      >
        下一页
      </text>
    </view>

    <!-- 无感分页：隐形哨兵触发加载，仅全部加载完显示「没有更多了」 -->
    <view
      v-if="showAppendSentinel"
      :id="sentinelId"
      class="list-block__sentinel"
    />
    <view v-if="showNoMore" class="list-block__footer">
      <text class="list-block__footer-text">— 没有更多了 —</text>
    </view>
    <view
      v-if="appendError"
      class="list-block__footer list-block__footer--error"
      @tap.stop="retryLoadMore"
    >
      <text class="list-block__footer-text">{{ appendError }}，点击重试</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, ref, watch } from 'vue'
import AppLink from '@/layout/components/AppLink.vue'
import { getIconChar } from '@/utils/iconMap'
import { resolveMediaUrl } from '@/utils/media'
import { fetchListPage, type ListSourceItem } from '@/api/list'
import { useLayoutPageEvents } from '@/composables/useLayoutReachBottom'
import {
  LIST_DATA_SOURCE,
  LIST_PAGINATION_MODE,
  createDefaultListHeader,
  normalizeListPagination,
} from '@shared/layout/list'

interface ListHeader {
  show?: boolean
  title?: string
  accentColor?: string
  showMore?: boolean
  moreText?: string
  moreLinkCode?: string
  moreLink?: string
}

interface ListPagination {
  enabled?: boolean
  pageSize?: number
  mode?: string
}

const props = withDefaults(
  defineProps<{
    padding?: string
    showDivider?: boolean
    showArrow?: boolean
    header?: ListHeader
    items?: ListSourceItem[]
    dataSource?: string
    sourceCode?: string
    pagination?: ListPagination
  }>(),
  {
    padding: '24rpx 32rpx',
    showDivider: true,
    showArrow: true,
    header: () => ({}),
    items: () => [],
    dataSource: LIST_DATA_SOURCE.STATIC,
    sourceCode: '',
    pagination: () => ({}),
  }
)

const instance = getCurrentInstance()
const sentinelId = `list-sentinel-${instance?.uid ?? Math.random().toString(36).slice(2)}`

const defaultHeader = createDefaultListHeader()
const header = computed(() => ({ ...defaultHeader, ...(props.header ?? {}) }))
const displayTitle = computed(() => header.value.title?.trim() || '模块标题')
const blockStyle = computed(() => ({ padding: props.padding }))

const pagination = computed(() => normalizeListPagination(props.pagination))
const isDynamic = computed(() => props.dataSource === LIST_DATA_SOURCE.DYNAMIC)
const paginationEnabled = computed(() => pagination.value.enabled)
const mode = computed(() => pagination.value.mode)
const pageSize = computed(() => pagination.value.pageSize)
const isPager = computed(() => mode.value === LIST_PAGINATION_MODE.PAGER)
const isAppendMode = computed(() => paginationEnabled.value && !isPager.value)

const page = ref(1)
const dynamicItems = ref<ListSourceItem[]>([])
const dynamicTotal = ref(0)
const dynamicHasMore = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const appendError = ref('')
const loadedOnce = ref(false)

const staticItems = computed<ListSourceItem[]>(() => props.items ?? [])
const totalCount = computed(() => (isDynamic.value ? dynamicTotal.value : staticItems.value.length))

const hasMore = computed(() => {
  if (!paginationEnabled.value) return false
  if (isDynamic.value) return dynamicHasMore.value
  return page.value * pageSize.value < totalCount.value
})

const displayItems = computed<ListSourceItem[]>(() => {
  if (isDynamic.value) return dynamicItems.value
  const all = staticItems.value
  if (!paginationEnabled.value) return all
  if (isPager.value) {
    return all.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
  }
  return all.slice(0, page.value * pageSize.value)
})

const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))
const canPrev = computed(() => page.value > 1)
const requestPageSize = computed(() => (paginationEnabled.value ? pageSize.value : 100))

const initialLoading = computed(() => loading.value && isDynamic.value && !loadedOnce.value)

const showInitialLoading = computed(() => initialLoading.value)
const showInitialError = computed(
  () => !!errorMsg.value && displayItems.value.length === 0 && isDynamic.value
)
const showEmpty = computed(
  () =>
    !loading.value &&
    !errorMsg.value &&
    displayItems.value.length === 0 &&
    (loadedOnce.value || !isDynamic.value)
)
const showAppendSentinel = computed(() => {
  if (!isAppendMode.value) return false
  if (showInitialLoading.value || showInitialError.value || showEmpty.value) return false
  return hasMore.value
})
const showNoMore = computed(
  () =>
    isAppendMode.value &&
    !hasMore.value &&
    !loading.value &&
    !appendError.value &&
    displayItems.value.length > 0
)
const showPager = computed(
  () => paginationEnabled.value && isPager.value && !loading.value && totalPages.value > 1
)

const LOAD_COOLDOWN_MS = 400
let loadCooldownUntil = 0

function canLoadNow() {
  return !loading.value && hasMore.value && Date.now() >= loadCooldownUntil
}

function getWindowHeight() {
  // 优先用新 API，回退到旧 API，兼容不同版本 uni-app
  const getWindowInfo = (uni as unknown as { getWindowInfo?: () => { windowHeight: number } }).getWindowInfo
  if (typeof getWindowInfo === 'function') {
    return getWindowInfo().windowHeight
  }
  return uni.getSystemInfoSync().windowHeight
}

/** 滚动检测节流间隔：限制 createSelectorQuery 频率，兼顾小程序性能 */
const SCROLL_THROTTLE_MS = 120
/** 哨兵进入视口底部前 PRELOAD_DISTANCE 内即开始加载，实现「下滑即加载」 */
const PRELOAD_DISTANCE = 200
let scrollThrottleUntil = 0

/**
 * 哨兵接近视口底部时静默加载下一页。
 * 加载完成后会再次检测，内容不足一屏时自动续载直至可滚动或没有更多。
 */
function tryLoadMoreIfNeeded() {
  if (!isAppendMode.value || !canLoadNow()) return

  uni
    .createSelectorQuery()
    .in(instance)
    .select(`#${sentinelId}`)
    .boundingClientRect((rect) => {
      if (!rect || Array.isArray(rect)) return
      const top = Number(rect.top)
      if (!Number.isFinite(top)) return
      const windowHeight = getWindowHeight()
      if (top <= windowHeight + PRELOAD_DISTANCE) {
        loadNext()
      }
    })
    .exec()
}

function scheduleLoadCheck() {
  void nextTick(() => {
    tryLoadMoreIfNeeded()
    // 首帧布局可能未完成，延迟再检测一次（内容不足一屏时自动续载）
    setTimeout(() => tryLoadMoreIfNeeded(), 80)
  })
}

async function loadDynamic(targetPage: number, append: boolean) {
  if (!props.sourceCode) {
    errorMsg.value = '未配置数据源标识'
    return
  }
  if (loading.value) return
  loading.value = true
  if (append) {
    appendError.value = ''
  } else {
    errorMsg.value = ''
    appendError.value = ''
  }
  try {
    const data = await fetchListPage(props.sourceCode, targetPage, requestPageSize.value)
    page.value = data.page
    dynamicTotal.value = data.total
    dynamicHasMore.value = data.hasMore
    dynamicItems.value = append ? [...dynamicItems.value, ...data.items] : data.items
    loadedOnce.value = true
    errorMsg.value = ''
    appendError.value = ''
  } catch (err) {
    const msg = err instanceof Error ? err.message : '加载失败'
    if (append && displayItems.value.length > 0) {
      appendError.value = msg
    } else {
      errorMsg.value = msg
    }
  } finally {
    loading.value = false
    scheduleLoadCheck()
  }
}

function loadNext() {
  if (!canLoadNow()) return
  loadCooldownUntil = Date.now() + LOAD_COOLDOWN_MS

  if (isDynamic.value) {
    void loadDynamic(page.value + 1, true)
    return
  }
  page.value += 1
  scheduleLoadCheck()
}

function goPage(target: number) {
  if (target < 1 || target > totalPages.value) return
  if (isDynamic.value) {
    loadDynamic(target, false)
  } else {
    page.value = target
  }
}

function goPrev() {
  if (canPrev.value) goPage(page.value - 1)
}

function goNext() {
  if (hasMore.value) goPage(page.value + 1)
}

function retry() {
  errorMsg.value = ''
  if (isDynamic.value) void loadDynamic(1, false)
}

function retryLoadMore() {
  appendError.value = ''
  if (isDynamic.value) void loadDynamic(page.value + 1, true)
}

function reset() {
  page.value = 1
  dynamicItems.value = []
  dynamicTotal.value = 0
  dynamicHasMore.value = false
  errorMsg.value = ''
  appendError.value = ''
  loadedOnce.value = false
  loadCooldownUntil = Date.now() + LOAD_COOLDOWN_MS
  if (isDynamic.value) {
    void loadDynamic(1, false)
  } else if (isAppendMode.value) {
    scheduleLoadCheck()
  }
}

watch(
  () => [props.dataSource, props.sourceCode, pageSize.value, paginationEnabled.value, mode.value, props.items?.length],
  () => reset()
)

useLayoutPageEvents({
  onScroll: () => {
    const now = Date.now()
    if (now < scrollThrottleUntil) return
    scrollThrottleUntil = now + SCROLL_THROTTLE_MS
    tryLoadMoreIfNeeded()
  },
  onReachBottom: () => {
    tryLoadMoreIfNeeded()
  },
})

onMounted(() => {
  reset()
})
</script>

<style scoped>
.list-block {
  background: #fff;
  margin: 24rpx 24rpx 24rpx;
  border-radius: 16rpx;
}

.list-block__header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 48rpx;
  padding: 8rpx 0 16rpx;
  box-sizing: border-box;
}

.list-block__header-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
  min-width: 0;
  height: 32rpx;
}

.list-block__accent {
  width: 6rpx;
  height: 32rpx;
  border-radius: 4rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.list-block__title-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
  min-width: 0;
  height: 32rpx;
  overflow: hidden;
}

.list-block__header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #303133;
  line-height: 32rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-block__more-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
  height: 32rpx;
}

.list-block__more {
  font-size: 26rpx;
  color: #909399;
  line-height: 32rpx;
}

.list-block__item {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 24rpx 0;
}

.list-block__item--divided {
  border-bottom: 1rpx solid #ebeef5;
}

.list-block__icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  background: #f0f2f5;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  overflow: hidden;
  flex-shrink: 0;
}

.list-block__icon-text {
  font-size: 36rpx;
  line-height: 1;
}

.list-block__thumb {
  width: 100%;
  height: 100%;
}

.list-block__content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.list-block__title {
  display: block;
  width: 100%;
  font-size: 28rpx;
  color: #303133;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-block__desc {
  display: block;
  width: 100%;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #909399;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-block__arrow {
  flex-shrink: 0;
  align-self: center;
  margin-left: 16rpx;
  color: #c0c4cc;
  font-size: 36rpx;
  line-height: 1;
}

.list-block__sentinel {
  width: 100%;
  height: 1px;
  pointer-events: none;
}

.list-block__footer {
  width: 100%;
  padding: 24rpx 0 8rpx;
  text-align: center;
}

.list-block__footer--error {
  padding: 16rpx 0;
}

.list-block__footer-text {
  font-size: 24rpx;
  color: #c0c4cc;
  line-height: 1.4;
}

.list-block__footer--error .list-block__footer-text {
  color: #e53935;
}

.list-block__status {
  padding: 24rpx 0;
  text-align: center;
  font-size: 24rpx;
  color: #c0c4cc;
}

.list-block__status--error {
  color: #e53935;
}

.list-block__pager {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  padding: 20rpx 0;
}

.list-block__pager-btn {
  padding: 8rpx 24rpx;
  font-size: 26rpx;
  color: #6366f1;
  border: 1rpx solid #6366f1;
  border-radius: 8rpx;
}

.list-block__pager-btn.is-disabled {
  color: #c0c4cc;
  border-color: #ebeef5;
}

.list-block__pager-info {
  font-size: 26rpx;
  color: #606266;
}
</style>
