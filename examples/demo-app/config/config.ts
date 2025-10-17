import { defineConfig } from '@umijs/max';

// 基础配置（所有环境共享）
export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  // ⚠️ 禁用 request 插件，避免自动创建 Proxy
  // Mock 模式使用 MSW，Dev 模式使用环境配置中的 proxy
  request: false,
  layout: {
    title: 'Chamberlain',
    locale: false,
  },
  routes: [
    {
      path: '/',
      redirect: '/scenes',
    },
    {
      name: '场景管理',
      path: '/scenes',
      component: './Scenes',
    },
    {
      name: '配置管理',
      path: '/configs',
      component: './Configs',
    },
  ],
  npmClient: 'pnpm',
});
