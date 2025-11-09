import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  main: {
    entry: 'src/main/index.ts',
  },
  preload: {
    input: {
      index: path.join(__dirname, 'src/preload/index.ts'),
    },
  },
  renderer: {
    input: path.join(__dirname, 'src/renderer/index.html'),
    plugins: [react()],
  },
})
