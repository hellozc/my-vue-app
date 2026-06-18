import { defineConfig, loadEnv, type Plugin } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

function devMockPlugin(): Plugin {
  return {
    name: 'layout-consumer-dev-mock',
    async configureServer(server) {
      const { attachDevMock } = await import('./mock/handlers.mjs')
      attachDevMock(server)
    },
  }
}

function devModeBanner(useMock: boolean, apiTarget: string): Plugin {
  return {
    name: 'layout-consumer-dev-mode-banner',
    configureServer() {
      if (useMock) {
        console.log('[layout-consumer] 数据源: Mock（layout-consumer/mock/handlers.mjs）')
        console.log('[layout-consumer] 联调后端请执行: npm run dev:h5:api')
      } else {
        console.log(`[layout-consumer] 数据源: 真实接口（代理 /api → ${apiTarget}）`)
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const useMock = env.VITE_USE_MOCK !== 'false'
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:8080'

  return {
    plugins: [
      uni(),
      devModeBanner(useMock, apiTarget),
      useMock && devMockPlugin(),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      proxy: useMock
        ? undefined
        : {
            '/api': {
              target: apiTarget,
              changeOrigin: true,
            },
          },
    },
  }
})
