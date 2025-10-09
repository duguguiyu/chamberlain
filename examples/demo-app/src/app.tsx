/**
 * App 配置
 */

import { ChamberlainProvider } from '@chamberlain/react-components';
import type { RuntimeConfig } from '@umijs/max';

// 全局初始化数据配置
export async function getInitialState(): Promise<{ name: string }> {
  return { name: 'Chamberlain Demo' };
}

// 运行时配置
export const layout: RuntimeConfig['layout'] = () => {
  return {
    logo: '🗄️',
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


