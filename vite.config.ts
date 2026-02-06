import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tsconfigPaths(),
      nodePolyfills({
        globals: { Buffer: true, global: true, process: true },
        protocolImports: true,
      }),
    ],
    server: {
      host: true,
      port: 5000,
      strictPort: false,
      allowedHosts: ['.replit.dev', '.replit.app'],
      watch: {
        ignored: ['**/node_modules/**','**/.pnpm/**','**/.local/**','**/dist/**'],
        usePolling: true,
        interval: 2000,
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        define: { global: 'globalThis' },
        target: 'esnext',
      },
      include: [
        'buffer','process','events','stream-browserify','util','ethers','@web3auth/modal','crypto-browserify'
      ]
    },
    define: {
      'process.env.VITE_NFT_ADDRESS': JSON.stringify(env.VITE_NFT_ADDRESS),
      'process.env.VITE_MCB_TOKEN_ADDRESS': JSON.stringify(env.VITE_MCB_TOKEN_ADDRESS),
      'process.env.VITE_RPC_URL': JSON.stringify(env.VITE_RPC_URL || "https://ritual-chain--praphaprawanta.replit.app"),
      'process.env.VITE_WEB3AUTH_CLIENT_ID': JSON.stringify(env.VITE_WEB3AUTH_CLIENT_ID || "BDoEZ3QXE314y8jyZl9QYB9gwZX6b6LkNvU3li8GSYf17B-dlMGn3WBlrRj_dqIAI_0-GZBs7YJmMlUnwPs0XfI"),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        stream: 'stream-browserify',
        crypto: 'crypto-browserify',
        util: 'util'
      }
    }
  };
});
