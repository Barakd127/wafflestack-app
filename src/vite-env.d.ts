/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRIPO_API_KEY: string
  readonly VITE_IMAGINE_API_KEY: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
