import { defineConfig } from '@umijs/max';

// Mock 环境配置：仅前端，使用 MSW mock 数据
export default defineConfig({
  // 完全禁用 UmiJS 的 mock 功能，使用 MSW
  mock: false,
  
  // 显式设置 proxy 为空对象（禁用所有代理）
  proxy: {},
  
  // 禁用 request 插件
  request: false,
  
  // 禁用 MFSU 缓存
  mfsu: false,
  
  define: {
    'process.env.API_ENV': 'mock',
  },
});
