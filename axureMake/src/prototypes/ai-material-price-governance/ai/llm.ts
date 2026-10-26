/**
 * OpenAI 兼容协议的极简客户端。
 * 由于第三方大模型网关通常不允许浏览器跨域，请求优先走本地开发服务器提供的
 * /llm-proxy 代理（见 vite-plugins/llmProxyPlugin.ts），失败后再尝试直连。
 *
 * 导出（单文件 iife）后本页不再运行在 dev server 源上，此时 `/llm-proxy` 相对地址会打到
 * 错误的主机，因此这里会额外探测本机 dev server 的绝对地址（51720 起），找到后优先使用。
 */
import type { AiConfig } from './config';

const PROXY_PATH = '/llm-proxy/chat/completions';
const PROXY_HEALTH_PATH = '/llm-proxy/health';
/** dev server 默认 51720，端口被占用时会顺延 */
const DEV_SERVER_PORTS = [51720, 51721, 51722, 51723, 51724];
const HTTP_PROTOCOLS = ['http:', 'https:'];

/** 连不上目标（跨域 / DNS / 断网），属于「换通道重试」的信号 */
class TransportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransportError';
  }
}

/** 目标连上了但返回非 2xx，错误来自上游，换通道也无意义 */
class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export type StreamProgress = {
  /** 已累计的正文内容 */
  content: string;
  /** 已接收的思维链字符数（部分模型会先输出 reasoning_content） */
  reasoningChars: number;
};

export type ChatRequest = {
  config: AiConfig;
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
  onProgress?: (progress: StreamProgress) => void;
};

const trimBase = (baseUrl: string) => baseUrl.trim().replace(/\/+$/, '');

const isAbort = (error: unknown) => (error as Error | undefined)?.name === 'AbortError';

/** 代理候选来源：同源优先（dev 模式），再退回本机 dev server 的绝对地址（导出后使用） */
const proxyOrigins = (): string[] => {
  const origins: string[] = [];
  if (HTTP_PROTOCOLS.includes(window.location.protocol)) origins.push(window.location.origin);
  DEV_SERVER_PORTS.forEach(port => {
    ['localhost', '127.0.0.1'].forEach(host => {
      const origin = `http://${host}:${port}`;
      if (!origins.includes(origin)) origins.push(origin);
    });
  });
  return origins;
};

let proxyPromise: Promise<string | null> | null = null;

const probeProxy = async (): Promise<string | null> => {
  for (const origin of proxyOrigins()) {
    try {
      const response = await fetch(`${origin}${PROXY_HEALTH_PATH}`, { method: 'GET', cache: 'no-store' });
      if (!response.ok) continue;
      const json = await response.json().catch(() => null);
      if (json?.ok) return `${origin}${PROXY_PATH}`;
    } catch {
      /* 该来源不可达，试下一个 */
    }
  }
  return null;
};

/** 探测结果缓存：一次会话只探一次，失败后可通过 resetProxyCache 重试 */
const resolveProxy = () => {
  if (!proxyPromise) proxyPromise = probeProxy();
  return proxyPromise;
};

export const resetProxyCache = () => {
  proxyPromise = null;
};

const readErrorBody = async (response: Response) => {
  try {
    const text = await response.text();
    return text.trim().slice(0, 240) || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
};

type ParsedChunk = {
  content?: string;
  reasoning?: string;
  finishReason?: string;
  empty?: boolean;
};

const parseSse = async (
  response: Response,
  onProgress?: (progress: StreamProgress) => void
): Promise<ParsedChunk> => {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('AI 响应为空');
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  let reasoningChars = 0;
  let finishReason = '';
  let notifiedAt = 0;

  const handleLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) return;
    const payload = trimmed.slice(5).trim();
    if (!payload || payload === '[DONE]') return;
    try {
      const json = JSON.parse(payload);
      const choice = json?.choices?.[0];
      const delta = choice?.delta ?? choice?.message ?? {};
      if (typeof delta?.reasoning_content === 'string') reasoningChars += delta.reasoning_content.length;
      if (typeof delta?.content === 'string') content += delta.content;
      if (typeof choice?.finish_reason === 'string') finishReason = choice.finish_reason;
    } catch {
      /* 忽略不完整片段 */
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      handleLine(line);
      const now = Date.now();
      if (onProgress && content && now - notifiedAt > 120) {
        notifiedAt = now;
        onProgress({ content, reasoningChars });
      }
    }
  }
  if (buffer) handleLine(buffer);
  if (onProgress && content) onProgress({ content, reasoningChars });

  return { content, reasoning: String(reasoningChars), finishReason };
};

const callOnce = async (request: ChatRequest, endpoint: string, useProxy: boolean): Promise<string> => {
  const { config, system, user, maxTokens = 8000, temperature = 0.1, signal, onProgress } = request;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.apiKey.trim()) headers.Authorization = `Bearer ${config.apiKey.trim()}`;
  if (useProxy) headers['x-llm-base'] = trimBase(config.baseUrl);

  const payload: Record<string, unknown> = {
    model: config.model.trim(),
    temperature,
    max_tokens: maxTokens,
    stream: true,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  };

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal
    });
  } catch (error) {
    if (isAbort(error)) throw error;
    throw new TransportError((error as Error)?.message || '网络请求失败');
  }

  if (!response.ok) {
    throw new ApiError(await readErrorBody(response), response.status);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('event-stream')) {
    const parsed = await parseSse(response, onProgress);
    if (!parsed.content) {
      throw new Error(`AI 未返回正文内容${parsed.finishReason === 'length' ? '（输出被截断，请减少单批条数）' : ''}`);
    }
    return parsed.content;
  }

  // 网关可能忽略 stream 参数，退回普通 JSON 解析
  const text = await response.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('AI 接口返回的不是 JSON，请确认 API 地址与代理配置');
  }
  const choice = json?.choices?.[0];
  const content = choice?.message?.content ?? choice?.text ?? '';
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error(`AI 未返回正文内容${choice?.finish_reason === 'length' ? '（输出被截断，请减少单批条数）' : ''}`);
  }
  onProgress?.({ content, reasoningChars: 0 });
  return content;
};

const CHANNEL_HINT =
  '模型网关不允许浏览器跨域，必须经由本地代理访问（本机运行 npm run dev，默认 http://localhost:51720）。导出后在其它电脑/离线打开时，同样需要本机开着 dev server；若导出页是 https，浏览器会拦截 http 代理（混合内容）。';

export const chatCompletion = async (request: ChatRequest): Promise<string> => {
  const errors: string[] = [];
  const proxy = await resolveProxy();

  if (proxy) {
    try {
      return await callOnce(request, proxy, true);
    } catch (error) {
      if (isAbort(error)) throw error;
      // 代理连上了但上游报错（鉴权/限流/截断等），直接暴露原始错误，不再换通道浪费 token
      if (!(error instanceof TransportError)) throw error;
      errors.push(`代理通道（${proxy}）：${error.message}`);
      proxyPromise = null;
    }
  } else {
    errors.push('代理通道：未找到可用的本地代理');
  }

  try {
    return await callOnce(request, `${trimBase(request.config.baseUrl)}/chat/completions`, false);
  } catch (error) {
    if (isAbort(error)) throw error;
    if (error instanceof ApiError) throw error;
    errors.push(`直连通道：${(error as Error).message}`);
  }

  throw new Error(`${errors.join('；')}。${CHANNEL_HINT}`);
};

const stripFence = (text: string) => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : text).trim();
};

export const extractJson = <T>(text: string): T => {
  const body = stripFence(text);
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('AI 未返回可解析的 JSON');
  const sliced = body.slice(start, end + 1);
  const attempts = [sliced, sliced.replace(/,\s*([}\]])/g, '$1')];
  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt) as T;
    } catch {
      /* try next */
    }
  }
  throw new Error('AI 返回的 JSON 格式异常，请重试');
};
