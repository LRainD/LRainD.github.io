import type { Plugin } from 'vite';

/**
 * 本地大模型代理：浏览器请求 /llm-proxy/chat/completions 时，
 * 由 dev server 转发到 x-llm-base 指定的 OpenAI 兼容网关，规避第三方网关的跨域限制。
 * 仅用于本地原型调试，不参与生产构建（apply: 'serve'）。
 *
 * 注意：必须自己补 CORS 头。导出后的原型运行在 Axure / file:// 等其它来源，
 * 请求本代理属于跨域，缺 Access-Control-Allow-Origin 会被浏览器直接拦掉。
 */
const DEFAULT_BASE_URL = 'https://tianqu.yzw.cn/v1';
const UPSTREAM_TIMEOUT = 180_000;

/** 所有响应都加跨域头，包括预检与错误分支 */
const applyCors = (res: import('http').ServerResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-llm-base');
  res.setHeader('Access-Control-Max-Age', '600');
};

const resolveTarget = (rawBase: unknown): string | null => {
  const base = String(rawBase || DEFAULT_BASE_URL).trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(base)) return null;
  return /\/v\d+[a-z0-9]*$/i.test(base) ? `${base}/chat/completions` : `${base}/v1/chat/completions`;
};

export function llmProxyPlugin(): Plugin {
  return {
    name: 'axhub-llm-proxy',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/llm-proxy', (req, res) => {
        applyCors(res);

        // 健康探针：导出后的原型（不同源）先用它探测本机 dev server 是否在线，
        // 探到了再发真正的请求，避免把「代理不可用」误判成「模型报错」。
        if (req.method === 'GET' && (req.url || '').startsWith('/health')) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify({ ok: true, service: 'axhub-llm-proxy' }));
          return;
        }

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'Only POST is supported' }));
          return;
        }

        const target = resolveTarget(req.headers['x-llm-base']);
        if (!target) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'Invalid x-llm-base header, expect an http(s) URL' }));
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', chunk => chunks.push(Buffer.from(chunk)));
        req.on('error', () => {
          res.statusCode = 400;
          res.end();
        });

        req.on('end', async () => {
          try {
            const authorization = req.headers.authorization;
            const upstream = await fetch(target, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'text/event-stream',
                ...(authorization ? { Authorization: String(authorization) } : {})
              },
              body: Buffer.concat(chunks),
              signal: AbortSignal.timeout(UPSTREAM_TIMEOUT)
            });

            res.statusCode = upstream.status;
            res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache, no-transform');
            res.setHeader('X-Accel-Buffering', 'no');

            if (!upstream.body) {
              res.end();
              return;
            }

            const reader = upstream.body.getReader();
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              if (value) res.write(Buffer.from(value));
            }
            res.end();
          } catch (error) {
            if (res.headersSent) {
              res.end();
              return;
            }
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(
              JSON.stringify({
                error: `LLM proxy failed: ${(error as Error).message}`,
                target
              })
            );
          }
        });
      });
    }
  };
}
