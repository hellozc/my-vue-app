<template>
  <div class="member-sms-inbox">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>验证码收件箱</span>
          <div class="card-header__actions">
            <el-switch
              v-model="autoRefresh"
              inline-prompt
              active-text="自动刷新"
              inactive-text="手动刷新"
            />
            <el-button @click="loadData">刷新</el-button>
            <el-button type="danger" plain @click="handleClear">清空记录</el-button>
          </div>
        </div>
      </template>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="inbox-tip"
        title="开发联调专用"
        description="C 端点击「获取验证码」后，验证码会出现在下表（无需再查服务端控制台）。数据保存在内存中，服务重启后清空；生产环境接入真实短信后此页仅作审计参考。"
      />

      <el-table v-loading="loading" :data="tableData" stripe border empty-text="暂无验证码，请先在 C 端点击获取验证码">
        <el-table-column prop="id" label="#" width="64" />
        <el-table-column prop="phone" label="手机号" min-width="130">
          <template #header>
            <span>手机号</span>
            <el-button link type="primary" @click="showFullPhone = !showFullPhone">
              {{ showFullPhone ? '隐藏完整' : '显示完整' }}
            </el-button>
          </template>
          <template #default="{ row }">
            {{ showFullPhone ? row.phone : row.phoneMasked }}
          </template>
        </el-table-column>
        <el-table-column prop="code" label="验证码" width="140">
          <template #default="{ row }">
            <span class="code-text">{{ row.code }}</span>
            <el-button link type="primary" @click="copyCode(row.code)">复制</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="scene" label="用途" width="100">
          <template #default="{ row }">
            <el-tag :type="row.scene === 'register' ? 'warning' : 'primary'" size="small">
              {{ row.scene === 'register' ? '注册' : '登录' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sentAtText" label="发送时间" min-width="168" />
        <el-table-column label="剩余有效" width="110">
          <template #default="{ row }">
            <span v-if="row.status === 'active'">{{ row.remainingSeconds }}s</span>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="usedAtText" label="使用时间" min-width="168">
          <template #default="{ row }">
            {{ row.usedAtText || '—' }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { clearSmsInbox, getSmsInbox } from '@/api/memberAuth'

const loading = ref(false)
const tableData = ref([])
const autoRefresh = ref(true)
const showFullPhone = ref(false)
let timer = null

function statusLabel(status) {
  const map = {
    active: '待使用',
    used: '已使用',
    expired: '已过期',
    superseded: '已作废',
  }
  return map[status] || status
}

function statusType(status) {
  const map = {
    active: 'success',
    used: 'info',
    expired: 'danger',
    superseded: 'warning',
  }
  return map[status] || 'info'
}

async function loadData() {
  loading.value = true
  try {
    const data = await getSmsInbox({ limit: 100 })
    tableData.value = data.items || []
  } finally {
    loading.value = false
  }
}

async function handleClear() {
  await ElMessageBox.confirm('确定清空所有验证码记录？', '提示', { type: 'warning' })
  await clearSmsInbox()
  ElMessage.success('已清空')
  await loadData()
}

async function copyCode(code) {
  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('验证码已复制')
  } catch {
    ElMessage.info(`验证码：${code}`)
  }
}

function setupTimer() {
  clearTimer()
  if (!autoRefresh.value) return
  timer = setInterval(() => {
    loadData()
  }, 3000)
}

function clearTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

watch(autoRefresh, () => {
  setupTimer()
})

onMounted(() => {
  loadData()
  setupTimer()
})

onBeforeUnmount(() => {
  clearTimer()
})
</script>

<style scoped>
.member-sms-inbox {
  padding: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.card-header__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.inbox-tip {
  margin-bottom: 16px;
}

.code-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  margin-right: 8px;
}

.text-muted {
  color: var(--el-text-color-secondary);
}
</style>
