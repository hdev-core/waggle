/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FYP_BASE?: string
  readonly VITE_FYP_PROXY_TARGET?: string
  readonly VITE_USE_MOCK?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
