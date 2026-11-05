import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as { version: string }

/** Identificador único de este build. En Cloudflare Pages se le añade el commit desplegado. */
const BUILD_ID = Date.now().toString()
const BUILD_TIME = new Date().toISOString()
const COMMIT = (process.env.CF_PAGES_COMMIT_SHA ?? '').slice(0, 7)

/** En cada `npm run build`:
 *  - Sustituye `__BUILD_ID__` en `dist/sw.js` y le antepone una cabecera con el build: el navegador compara el
 *    Service Worker byte a byte, así que cada despliegue genera un `sw.js` distinto y dispara `updatefound`.
 *  - Genera `dist/version.json`, que la app consulta como respaldo (iOS Safari antiguo, PWA en segundo plano). */
function pwaVersionPlugin(): Plugin {
  let outDir = 'dist'
  return {
    name: 'pwa-version',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const versionData = { buildId: BUILD_ID, buildTime: BUILD_TIME, version: pkg.version, commit: COMMIT || null }
      writeFileSync(resolve(outDir, 'version.json'), JSON.stringify(versionData, null, 2))

      const swPath = resolve(outDir, 'sw.js')
      if (!existsSync(swPath)) throw new Error('[pwa-version] No se encontró dist/sw.js')
      const sw = readFileSync(swPath, 'utf-8')
      if (!sw.includes('__BUILD_ID__')) throw new Error('[pwa-version] public/sw.js no contiene el marcador __BUILD_ID__')
      const header = `/* Bike Tracker v${pkg.version} · build ${BUILD_ID}${COMMIT ? ` · ${COMMIT}` : ''} · ${BUILD_TIME} */\n`
      writeFileSync(swPath, header + sw.replace(/__BUILD_ID__/g, BUILD_ID))
    },
  }
}

export default defineConfig({
  plugins: [react(), pwaVersionPlugin()],
  // El bundle conoce su propio build: así compara contra /version.json sin depender de lo que haya en caché.
  define: {
    __APP_BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  server: {
    host: true,
    port: 5173,
  },
})
