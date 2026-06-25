<template>
  <div class="member-auth-config">
    <el-card shadow="never" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>C端登录方式配置</span>
          <el-button type="primary" :loading="submitting" @click="handleSave">保存配置</el-button>
        </div>
      </template>

      <el-form ref="formRef" :model="form" label-width="140px" class="config-form">
        <el-divider content-position="left">登录方式开关</el-divider>

        <el-form-item label="密码登录">
          <el-switch v-model="form.password" />
        </el-form-item>
        <el-form-item label="短信验证码">
          <el-switch v-model="form.sms" />
        </el-form-item>
        <el-form-item label="开放注册">
          <el-switch v-model="form.register" />
        </el-form-item>
        <el-form-item label="微信登录">
          <el-switch v-model="form.wechat" />
        </el-form-item>
        <el-form-item label="微信手机号">
          <el-switch v-model="form.wechatPhone" />
          <span class="form-tip">仅微信小程序端展示快捷按钮</span>
        </el-form-item>
        <el-form-item label="本机一键登录">
          <el-switch v-model="form.oneclick" />
          <span class="form-tip">仅 App 端展示，需配置 DCloud univerify</span>
        </el-form-item>

        <el-form-item label="默认登录页签">
          <el-radio-group v-model="form.defaultTab">
            <el-radio value="password">密码登录</el-radio>
            <el-radio value="sms">验证码登录</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-divider content-position="left">协议链接</el-divider>

        <el-form-item label="用户协议 URL">
          <el-input v-model="form.agreementUrl" placeholder="可选，留空使用内置文案" />
        </el-form-item>
        <el-form-item label="隐私政策 URL">
          <el-input v-model="form.privacyUrl" placeholder="可选，留空使用内置文案" />
        </el-form-item>

        <el-divider content-position="left">微信开放平台</el-divider>

        <el-form-item label="小程序 AppID">
          <el-input v-model="form.wechatMpAppId" placeholder="微信小程序 AppID" />
        </el-form-item>
        <el-form-item label="小程序 Secret">
          <el-input
            v-model="form.wechatMpSecret"
            type="password"
            show-password
            placeholder="微信小程序 AppSecret"
          />
        </el-form-item>
        <el-form-item label="App 微信 AppID">
          <el-input v-model="form.wechatAppAppId" placeholder="移动应用微信登录 AppID" />
        </el-form-item>
        <el-form-item label="App 微信 Secret">
          <el-input
            v-model="form.wechatAppSecret"
            type="password"
            show-password
            placeholder="移动应用微信登录 AppSecret"
          />
        </el-form-item>
        <el-form-item label="H5 微信 AppID">
          <el-input v-model="form.wechatH5AppId" placeholder="公众号 / 网页应用 AppID（可选）" />
        </el-form-item>

        <el-divider content-position="left">一键登录</el-divider>

        <el-form-item label="启用 univerify">
          <el-switch v-model="form.univerifyEnabled" />
        </el-form-item>

        <el-alert
          type="info"
          :closable="false"
          show-icon
          title="开发提示"
          description="未填写微信凭证或设置环境变量 WX_AUTH_MOCK=true 时，服务端将使用 Mock 模式，H5 可直接点「微信登录」联调。一键登录在未配置 UNIVERIFY_API_KEY 时，可使用 mock_oneclick_token 联调。"
        />
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getMemberAuthConfig, saveMemberAuthConfig } from '@/api/memberAuth'

const loading = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({
  password: true,
  sms: true,
  wechat: true,
  oneclick: true,
  wechatPhone: true,
  register: true,
  defaultTab: 'sms',
  agreementUrl: '',
  privacyUrl: '',
  wechatMpAppId: '',
  wechatMpSecret: '',
  wechatAppAppId: '',
  wechatAppSecret: '',
  wechatH5AppId: '',
  univerifyEnabled: true,
})

async function loadData() {
  loading.value = true
  try {
    const data = await getMemberAuthConfig()
    Object.assign(form, data)
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  submitting.value = true
  try {
    await saveMemberAuthConfig({ ...form })
    ElMessage.success('保存成功')
    await loadData()
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.member-auth-config {
  padding: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.config-form {
  max-width: 720px;
}

.form-tip {
  margin-left: 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
