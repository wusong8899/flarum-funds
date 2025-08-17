import { defineConfig } from 'vite';
import path from 'node:path';
import oxlintPlugin from 'vite-plugin-oxlint';

// Types for Vite plugin
interface VitePlugin {
  name: string;
  generateBundle: (options: unknown, bundle: Record<string, BundleChunk>) => void;
}

interface BundleChunk {
  type: string;
  isEntry: boolean;
  code: string;
}

// Custom plugin to handle Flarum's module.exports assignment pattern
const flarumModuleExports = (): VitePlugin => ({
  name: 'flarum-module-exports',
  generateBundle(options: unknown, bundle: Record<string, BundleChunk>): void {
    for (const fileName in bundle) {
      if (Object.hasOwn(bundle, fileName)) {
        const chunk = bundle[fileName];
        if (chunk.type === 'chunk' && chunk.isEntry) {
          // Add module.exports={} at the end like webpack does
          chunk.code += '\nmodule.exports={};';
        }
      }
    }
  },
});

export default defineConfig({
  root: path.resolve(__dirname),
  publicDir: false,
  plugins: [
    // Oxlint integration with moderate strictness (matching your .oxlintrc.json approach)
    oxlintPlugin({
      configFile: '.oxlintrc.json',
      // Using moderate approach - warnings won't break builds
      params: '--quiet',
      // Only lint source files, not build outputs
      path: 'src',
    }),
    // Your existing Flarum plugin
    flarumModuleExports(),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        admin: path.resolve(__dirname, 'admin.js'),
      },
      external: (id: string) => {
        if (id === '@flarum/core/admin' || id === '@flarum/core/forum') {
          return true;
        }
        if (id === 'jquery') {
          return true;
        }
        if (id === 'mithril') {
          return true; // mithril is provided by Flarum core
        }
        if (id.startsWith('flarum/')) {
          return true; // legacy compat modules
        }
        return false;
      },
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: '[name].js',
        globals: (id: string) => {
          if (id === '@flarum/core/admin' || id === '@flarum/core/forum') {
            return 'flarum.core';
          }
          if (id === 'jquery') {
            return 'jQuery';
          }
          if (id === 'mithril') {
            return 'm';
          }
          const compat = id.match(/^flarum\/(.+)$/);
          const COMPAT_INDEX = 1;
          if (compat) {
            return `flarum.core.compat['${compat[COMPAT_INDEX]}']`;
          }
          return id;
        },
      },
    },
  },
  esbuild: {
    jsxFactory: 'm',
    jsxFragment: "'['",
    tsconfigRaw: {
      compilerOptions: {
        isolatedModules: true,
      },
    },
  },
});
