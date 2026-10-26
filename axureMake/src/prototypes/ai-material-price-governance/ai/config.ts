/**
 * 前端 AI 配置：默认值来自 doc/apikey.md，用户可在页面上覆盖并写入 localStorage。
 * 注意：这是原型演示，Key 会在浏览器中明文可见，生产环境应改为后端代理签名。
 */
export type AiConfig = {
  baseUrl: string;
  model: string;
  apiKey: string;
};

export const DEFAULT_AI_CONFIG: AiConfig = {
  baseUrl: 'https://tianqu.yzw.cn/v1',
  model: 'deepseek-flash',
  apiKey: 'tqsk-4366a1407a8d4217b166b3004215ca2c'
};

const STORAGE_KEY = 'ampg.ai.config.v1';

export const loadAiConfig = (): AiConfig => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_AI_CONFIG };
    const parsed = JSON.parse(raw) as Partial<AiConfig>;
    return {
      baseUrl: (parsed.baseUrl || '').trim() || DEFAULT_AI_CONFIG.baseUrl,
      model: (parsed.model || '').trim() || DEFAULT_AI_CONFIG.model,
      apiKey: (parsed.apiKey || '').trim() || DEFAULT_AI_CONFIG.apiKey
    };
  } catch {
    return { ...DEFAULT_AI_CONFIG };
  }
};

export const saveAiConfig = (config: AiConfig) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* localStorage 不可用时静默降级，仅本次会话生效 */
  }
};

export const resetAiConfig = (): AiConfig => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_AI_CONFIG };
};

export const isAiConfigReady = (config: AiConfig) =>
  Boolean(config.baseUrl.trim() && config.model.trim() && config.apiKey.trim());
