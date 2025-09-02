import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const NGROK_HOST = 'abc74ba92c1b.ngrok-free.app';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
     
      protocolImports: true,
     
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // You can also include specific modules if needed, though the default is to include all
      include: ['buffer', 'crypto', 'stream', 'util', 'os', 'path', 'querystring', 'http', 'https', 'assert', 'zlib'],
    }),
  ],
  define: {
    // This polyfills the global object and process for runtime, but the plugin handles the build
    global: 'window', 
    'process.env.VITE_INFURA_ID': JSON.stringify(process.env.VITE_INFURA_ID),
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      NGROK_HOST,
      'localhost', 
      '127.0.0.1' 
    ],
  },
});