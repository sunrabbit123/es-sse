import { defineConfig } from 'tsup';

export default defineConfig({
  format: ['cjs', 'esm'],
  entry: ['src/index.ts'],
  splitting: false,
  minify: false,
  dts: true,
  clean: true,
});