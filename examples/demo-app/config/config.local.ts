import { defineConfig } from '@umijs/max';

// Local 环境配置：连接本地后端（开发用）
export default defineConfig({
  mock: false, // 禁用 mock
  define: {
    'process.env.API_ENV': 'local',
  },
  proxy: {
    '/api': {
      target: 'http://localhost:8080', // 本地后端地址
      changeOrigin: true,
    },
  },
});


