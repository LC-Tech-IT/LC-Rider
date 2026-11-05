/// <reference types="vite/client" />

/** Identificador del build actual (inyectado por vite.config.ts); se compara con /version.json. */
declare const __APP_BUILD_ID__: string

interface ImportMetaEnv {
  readonly VITE_WOMPI_PUBLIC_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
