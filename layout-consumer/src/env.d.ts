/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_USE_MOCK?: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TARGET?: string
  readonly VITE_LAYOUT_CODE: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_API_SUCCESS_CODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const plus: {
  runtime: {
    openURL: (url: string) => void
  }
}
