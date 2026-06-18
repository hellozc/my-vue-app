import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const useMock = env.VITE_USE_MOCK === 'true'
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:8080'
  const stripPrefix = env.VITE_API_STRIP_PREFIX === 'true'

  return {
    plugins: [
      vue(),
      useMock &&
        mockDevServerPlugin({
          prefix: '/api',
        }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      AutoImport({
        imports: ['vue', 'vue-router', { 'element-plus': [] }],
        dts: 'src/auto-imports.d.ts',
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@mock': resolve(__dirname, 'mock'),
        '@shared': resolve(__dirname, 'shared'),
      },
    },
    server: {
      proxy: {
        '/api': useMock
          ? { target: 'http://localhost:5173' }
          : {
              target: apiTarget,
              changeOrigin: true,
              ...(stripPrefix && {
                rewrite: (path) => path.replace(/^\/api/, ''),
              }),
            },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {},
      },
    },
  }
})
