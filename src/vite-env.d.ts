/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WOMPI_PUBLIC_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
