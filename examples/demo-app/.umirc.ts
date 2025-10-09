import { defineConfig } from '@umijs/max';

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
  mock: {
    exclude: [],
  },
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
});


