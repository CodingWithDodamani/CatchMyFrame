import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:3000', // Self-target for mocked API if needed, or point to external if separate backend
          bypass: (req, res) => {
            // Quick-and-dirty local proxy for development
            if (req.url && req.url.startsWith('/api/proxy')) {
              const urlParams = new URLSearchParams(req.url.split('?')[1]);
              const targetUrl = urlParams.get('url');
              if (targetUrl) {
                res.writeHead(302, { Location: targetUrl });
                res.end();
                return false;
              }
            }
          }
        }
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
