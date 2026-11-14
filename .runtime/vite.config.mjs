import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const runtimeDirectory = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: '/',
  resolve: {
    alias: [
      { find: 'three/addons/', replacement: `${resolve(runtimeDirectory, 'node_modules/three/examples/jsm')}/` },
      { find: 'three', replacement: resolve(runtimeDirectory, 'node_modules/three/build/three.module.js') },
    ],
  },
});
