<template>
  <view class="user-card" :style="blockStyle" @tap="handleCardTap">
    <view class="user-card__main">
      <view class="user-card__avatar-wrap">
        <image
          v-if="displayAvatar"
          class="user-card__avatar"
          :src="resolveMediaUrl(displayAvatar)"
          mode="aspectFill"
        />
        <view v-else class="user-card__avatar user-card__avatar--placeholder">
          <text class="user-card__avatar-text">{{ avatarFallback }}</text>
        </view>
      </view>
      <view class="user-card__info">
        <text class="user-card__title">{{ displayTitle }}</text>
        <text class="user-card__subtitle">{{ displaySubtitle }}</text>
      </view>
      <text v-if="!auth.isLoggedIn.value" class="user-card__arrow">›</text>
    </view>

    <view v-if="showStats && normalized.stats.length" class="user-card__stats">
      <view
        v-for="(stat, index) in normalized.stats"
        :key="`${stat.label}-${index}`"
        class="user-card__stat"
        @tap.stop="handleStatTap(stat)"
      >
        <text class="user-card__stat-value">{{ stat.value || '0' }}</text>
        <text class="user-card__stat-label">{{ stat.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useLoginGate } from '@/composables/useLoginGate'
import { useLinkNavigation } from '@/composables/useLinkNavigation'
import { resolveMediaUrl } from '@/utils/media'
import { pxStringToRpx } from '@/utils/unit'
import { normalizeUserCardProps } from '@shared/layout/userCard'

interface UserCardStat {
  label?: string
  value?: string
  linkCode?: string
  link?: string
  requireLogin?: boolean
}

const props = defineProps<{
  padding?: string
  margin?: string
  background?: string
  borderRadius?: number
  showStats?: boolean
  tapRequiresLogin?: boolean
  guest?: Record<string, unknown>
  stats?: UserCardStat[]
}>()

const auth = useAuth()
const { ensureLoggedIn } = useLoginGate()
const { navigate } = useLinkNavigation()

const normalized = computed(() => normalizeUserCardProps(props))

const blockStyle = computed(() => ({
  padding: pxStringToRpx(normalized.value.padding),
  margin: pxStringToRpx(normalized.value.margin),
  background: normalized.value.background,
  borderRadius: `${normalized.value.borderRadius}rpx`,
}))

const displayAvatar = computed(() => {
  if (auth.isLoggedIn.value && auth.member.value?.avatar) {
    return auth.member.value.avatar
  }
  return normalized.value.guest.avatar || ''
})

const avatarFallback = computed(() => {
  if (auth.isLoggedIn.value) {
    const name = auth.member.value?.nickname || '用'
    return name.slice(0, 1)
  }
  return '登'
})

const displayTitle = computed(() => {
  if (auth.isLoggedIn.value) {
    return auth.member.value?.nickname || '用户'
  }
  return normalized.value.guest.title || '点击登录'
})

const displaySubtitle = computed(() => {
  if (auth.isLoggedIn.value) {
    return auth.member.value?.phoneMasked || '欢迎回来'
  }
  return normalized.value.guest.subtitle || '登录后享受更多服务'
})

const showStats = computed(() => normalized.value.showStats)

function handleCardTap() {
  if (auth.isLoggedIn.value) return
  if (normalized.value.tapRequiresLogin !== false) {
    ensureLoggedIn()
  }
}

function handleStatTap(stat: UserCardStat) {
  const run = () => {
    if (stat.linkCode || stat.link) {
      void navigate({ linkCode: stat.linkCode, legacyLink: stat.link })
    }
  }
  if (stat.requireLogin) {
    if (!ensureLoggedIn()) return
  }
  run()
}
</script>

<style scoped>
.user-card {
  box-sizing: border-box;
}

.user-card__main {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.user-card__avatar-wrap {
  flex-shrink: 0;
  margin-right: 24rpx;
}

.user-card__avatar {
  width: 112rpx;
  height: 112rpx;
  border-radius: 56rpx;
  overflow: hidden;
}

.user-card__avatar--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
}

.user-card__avatar-text {
  font-size: 40rpx;
  font-weight: 600;
  color: #6366f1;
}

.user-card__info {
  flex: 1;
  min-width: 0;
}

.user-card__title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.user-card__subtitle {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #909399;
  line-height: 1.4;
}

.user-card__arrow {
  flex-shrink: 0;
  color: #c0c4cc;
  font-size: 40rpx;
  line-height: 1;
}

.user-card__stats {
  display: flex;
  flex-direction: row;
  margin-top: 32rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #ebeef5;
}

.user-card__stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-card__stat-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.user-card__stat-label {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #909399;
}
</style>
