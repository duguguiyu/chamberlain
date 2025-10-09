/**
 * 场景管理页面
 */

import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { SceneTable } from '@chamberlain/react-components';
import { message } from 'antd';

const ScenesPage: React.FC = () => {
  return (
    <PageContainer
      header={{
        title: '场景管理',
        breadcrumb: {},
      }}
    >
      <SceneTable
        onView={(scene) => {
          message.info(`查看场景: ${scene.name}`);
          console.log('Scene:', scene);
        }}
        onCreate={() => {
          message.info('创建场景功能开发中...');
        }}
        onViewConfigs={(scene) => {
          message.info(`查看 ${scene.name} 的配置`);
        }}
      />
    </PageContainer>
  );
};

export default ScenesPage;


