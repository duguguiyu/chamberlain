import { defineConfig } from '@umijs/max';

// Staging 环境配置：连接 staging 后端
export default defineConfig({
  mock: false, // 禁用 mock
  define: {
    'process.env.API_ENV': 'staging',
  },
  proxy: {
    '/api': {
      target: 'http://staging-backend.chamberlain.com', // Staging 环境后端地址
      changeOrigin: true,
    },
  },
});


