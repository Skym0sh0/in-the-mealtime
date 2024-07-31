import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        include: ['@emotion/styled'],
    },
    server: {
        proxy: {
            '/dev-proxy': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/dev-proxy/, '')
            },
        },
        cors: false
    },
    build: {
        outDir: 'build/dist'
    }
})
