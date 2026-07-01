import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// HAF_FYP base. In dev we proxy /v1/fyp/* to the live node so the browser never
// hits CORS. In prod, set VITE_FYP_BASE to the public FYP origin (and add an
// Access-Control-Allow-Origin header on the FYP nginx).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_FYP_PROXY_TARGET || 'https://testapi.hive.blog'
  // GitHub Pages project sites serve under /<repo>/. The Actions workflow sets
  // PAGES_BASE=/waggle/; a custom domain uses '/'. Defaults to '/' for local dev.
  const base = process.env.PAGES_BASE || '/'
  return {
    base,
    plugins: [react()],
    server: {
      proxy: {
        '/v1/fyp': {
          target,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
