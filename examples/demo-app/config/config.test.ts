import { defineConfig } from '@umijs/max';

// Test 环境配置：连接测试后端
export default defineConfig({
  mock: false, // 禁用 mock
  define: {
    'process.env.API_ENV': 'test',
  },
  proxy: {
    '/api': {
      target: 'http://test-backend.chamberlain.com', // 测试环境后端地址
      changeOrigin: true,
    },
  },
});


