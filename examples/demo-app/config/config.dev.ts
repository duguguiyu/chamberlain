import { defineConfig } from '@umijs/max';

// Dev/Local 环境配置：本地开发，连接本地后端（8080端口）
// ⚠️ 注意：max dev 命令默认加载 config.dev.ts
// 通过 MOCK 环境变量区分 Mock 模式和 Local 模式
const isMockMode = process.env.MOCK === 'true' || process.env.UMI_ENV === 'mock';

export default defineConfig(
  isMockMode
    ? {
        // Mock 模式配置：不使用 proxy，由 MSW 处理请求
        mock: false,
        proxy: {},  // 禁用所有代理
        request: false,
        mfsu: false,
        define: {
          'process.env.API_ENV': 'mock',
        },
      }
    : {
        // Dev/Local 模式配置：使用 proxy 连接本地后端
        mock: false,
        proxy: {
          '/api': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            pathRewrite: { '^/api': '/api' },
          },
        },
        define: {
          'process.env.API_ENV': 'dev',
        },
      }
);


