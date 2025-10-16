import { defineConfig } from '@umijs/max';

// 基础配置（所有环境共享）
export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
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


