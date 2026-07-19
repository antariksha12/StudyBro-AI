import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

// BASE_PATH only matters for how asset URLs are prefixed. Replit sets this;
// Vercel/local don't need to, so fall back to '/' instead of throwing.
const basePath = process.env.BASE_PATH ?? '/';

export default defineConfig(async ({ command }) => {
  // PORT only matters for the local dev server (`vite`/`vite dev`).
  // `vite build` (what Vercel runs) never starts a server, so it should
  // never be forced to have a PORT set.
  let port: number | undefined;

  if (command === 'serve') {
    const rawPort = process.env.PORT ?? '5173';
    const parsedPort = Number(rawPort);

    if (Number.isNaN(parsedPort) || parsedPort <= 0) {
      throw new Error(`Invalid PORT value: "${rawPort}"`);
    }

    port = parsedPort;
  }

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      runtimeErrorOverlay(),
      ...(process.env.NODE_ENV !== 'production' &&
      process.env.REPL_ID !== undefined
        ? [
            await import('@replit/vite-plugin-cartographer').then((m) =>
              m.cartographer({
                root: path.resolve(import.meta.dirname, '..'),
              }),
            ),
            await import('@replit/vite-plugin-dev-banner').then((m) =>
              m.devBanner(),
            ),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
        '@assets': path.resolve(
          import.meta.dirname,
          '..',
          '..',
          'attached_assets',
        ),
      },
      dedupe: ['react', 'react-dom'],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, 'dist/public'),
      emptyOutDir: true,
    },
    server: {
      port,
      strictPort: true,
      host: '0.0.0.0',
      allowedHosts: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
      fs: {
        strict: true,
      },
    },
  };
});
