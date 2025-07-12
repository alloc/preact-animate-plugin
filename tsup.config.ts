import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  external: ['motion', 'preact'],
  dts: true,
})
