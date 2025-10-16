import { defineConfig } from '@umijs/max';

// Production 环境配置：连接生产后端
export default defineConfig({
  mock: false, // 禁用 mock
  define: {
    'process.env.API_ENV': 'prod',
  },
  proxy: {
    '/api': {
      target: 'http://prod-backend.chamberlain.com', // 生产环境后端地址
      changeOrigin: true,
    },
  },
});


