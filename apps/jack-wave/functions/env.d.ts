interface Env {
  JACK_WAVE_KV: KVNamespace;
  ADMIN_PASSWORD: string;
  // 速率限制专用 KV namespace（可选）
  // 如果配置了独立的 KV namespace，submit.ts 会优先使用它存储限流计数
  // 未配置时自动回退到 JACK_WAVE_KV
  SUBMISSION_RATE_LIMIT?: KVNamespace;
}
