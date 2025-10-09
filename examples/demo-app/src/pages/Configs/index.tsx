/**
 * 配置管理页面
 */

import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Empty } from 'antd';

const ConfigsPage: React.FC = () => {
  return (
    <PageContainer
      header={{
        title: '配置管理',
        breadcrumb: {},
      }}
    >
      <Card>
        <Empty description="配置管理功能开发中" />
      </Card>
    </PageContainer>
  );
};

export default ConfigsPage;


