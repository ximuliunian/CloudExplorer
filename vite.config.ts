import { fileURLToPath, URL } from 'node:url';

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import indexPlugin from "./plugin/indexPlugin";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const envDir = `${process.cwd()}/../`
    const env = loadEnv(mode, envDir, '')

    return {
        publicDir: '../public',
        envDir: envDir,
        plugins: [
            vue(),
            vueDevTools(),
            indexPlugin(env.SECRET_KEY),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            },
        }
    }
})
