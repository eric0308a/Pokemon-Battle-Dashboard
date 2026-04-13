import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]

// https://vite.dev/config/
export default defineConfig({
  base: repositoryName ? `/${repositoryName}/` : '/',
  plugins: [vue()],
})
