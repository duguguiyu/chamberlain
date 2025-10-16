import { defineConfig } from '@umijs/max';

// Mock 环境配置：仅前端，使用 mock 数据
export default defineConfig({
  mock: {}, // 启用 mock
  define: {
    'process.env.API_ENV': 'mock',
  },
  // Mock 模式不需要 proxy，完全使用本地 mock 数据
  proxy: undefined,
});

