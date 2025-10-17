/**
 * App 配置
 */

import { ChamberlainProvider } from '@chamberlain/react-components';
import type { RuntimeConfig } from '@umijs/max';

// 全局初始化数据配置
export async function getInitialState(): Promise<{ name: string }> {
  // 启动 MSW (Mock Service Worker) 在 Mock 模式下
  if (process.env.API_ENV === 'mock') {
    console.log('🚀 Starting MSW in Mock mode...');
    try {
      const { worker } = await import('./mocks/browser');
      await worker.start({
        onUnhandledRequest: 'bypass',
        quiet: false,
      });
      console.log('✅ MSW Mock Service Worker started successfully');
    } catch (error) {
      console.error('❌ Failed to start MSW:', error);
    }
  }
  
  return { name: 'Chamberlain Demo' };
}

// 运行时配置
export const layout: RuntimeConfig['layout'] = () => {
  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    title: 'Chamberlain',
    menu: {
      locale: false,
    },
  };
};

// 包装根组件
export function rootContainer(container: React.ReactNode) {
  return (
    <ChamberlainProvider endpoint="/api">
      {container}
    </ChamberlainProvider>
  );
}


