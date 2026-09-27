import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

function samanyaApiPlugin(): Plugin {
  return {
    name: 'samanya-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (
          (req.url?.startsWith('/api/drive/subir-foto-talento') ||
           req.url?.startsWith('/api/drive/subir-soporte-talento') ||
           req.url?.startsWith('/api/drive/subir-archivo-talento') ||
           req.url?.startsWith('/api/drive/subir-archivo-residente')) &&
          req.method === 'POST'
        ) {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const py = spawn('python', ['backend/drive_upload.py']);
              let stdout = '';
              let stderr = '';

              py.stdout.on('data', (d) => {
                stdout += d.toString();
              });
              py.stderr.on('data', (d) => {
                stderr += d.toString();
              });

              py.on('close', (code) => {
                res.setHeader('Content-Type', 'application/json');
                if (code !== 0 && !stdout.trim()) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ success: false, error: stderr || 'Error ejecutando backend/drive_upload.py' }));
                } else {
                  res.statusCode = 200;
                  res.end(stdout.trim());
                }
              });

              py.stdin.write(body);
              py.stdin.end();
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        if (req.url?.startsWith('/api/drive/foto/')) {
          const fileId = req.url.split('/api/drive/foto/')[1]?.split('?')[0];
          if (!fileId) {
            res.statusCode = 400;
            res.end('Missing fileId');
            return;
          }
          const py = spawn('python', ['backend/drive_upload.py', '--get-photo', fileId]);
          res.setHeader('Content-Type', 'image/jpeg');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          py.stdout.pipe(res);
          return;
        }

        if (req.url?.startsWith('/uploads/')) {
          const cleanUrl = req.url.split('?')[0];
          const filePath = path.join(process.cwd(), 'public', cleanUrl);
          if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeMap: Record<string, string> = {
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.png': 'image/png',
              '.webp': 'image/webp',
              '.gif': 'image/gif',
              '.svg': 'image/svg+xml'
            };
            res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }

        if (req.url === '/api/health') {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ status: 'online', mode: 'local-dev', wallet_found: true }));
          return;
        }

        // Despacho directo a Oracle Autonomous Database vía backend/oracle_bridge.py
        if (
          (req.url?.startsWith('/api/pkgln_') ||
           req.url?.startsWith('/api/pkgca_') ||
           req.url?.startsWith('/api/pkgcn_')) &&
          req.method === 'POST'
        ) {
          const parts = req.url.replace('/api/', '').split('/');
          const pkg = parts[0]?.toUpperCase();
          const proc = parts[1]?.split('?')[0]?.toUpperCase();

          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const payload = body ? JSON.parse(body) : {};
              const bridgeInput = JSON.stringify({
                package: pkg,
                procedure: proc,
                payload
              });

              const py = spawn('python', ['backend/oracle_bridge.py'], {
                env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
              });
              let stdout = '';
              let stderr = '';

              py.stdout.on('data', (d) => {
                stdout += d.toString();
              });
              py.stderr.on('data', (d) => {
                stderr += d.toString();
              });

              py.on('close', (code) => {
                res.setHeader('Content-Type', 'application/json');
                if (code !== 0 && !stdout.trim()) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ success: false, error: stderr || 'Error ejecutando backend/oracle_bridge.py' }));
                } else {
                  res.statusCode = 200;
                  res.end(stdout.trim());
                }
              });

              py.stdin.write(bridgeInput);
              py.stdin.end();
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // Chat de IA con OpenRouter
        if (req.url === '/api/chat' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
              const payload = body ? JSON.parse(body) : {};
              const apiKey = env.OPENROUTER_API_KEY || env.VITE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || '';
              const model = payload.model || env.VITE_OPENROUTER_MODEL || 'openai/gpt-4o-mini';

              const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${apiKey}`,
                  'Content-Type': 'application/json',
                  'HTTP-Referer': 'http://localhost:3000',
                  'X-Title': 'Samanya OS Web'
                },
                body: JSON.stringify({
                  model,
                  messages: payload.messages,
                  temperature: payload.temperature ?? 0.3
                })
              });

              const data = await response.json();
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = response.status;
              res.end(JSON.stringify(data));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message || 'Error comunicando con OpenRouter' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    samanyaApiPlugin()
  ],
  server: {
    port: 3000,
    host: true,
    watch: {
      ignored: [
        '**/graphify-out/**',
        '**/.agents/**',
        '**/backend/**',
        '**/public/uploads/**',
        '**/*.log',
        '**/.git/**'
      ]
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
