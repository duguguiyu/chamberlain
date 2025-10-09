/**
 * SceneDescriptions - 场景详情展示组件
 * 用于展示场景的完整信息
 */

import React from 'react';
import { ProDescriptions } from '@ant-design/pro-components';
import { Tag, Space, Typography } from 'antd';
import type { ProDescriptionsProps } from '@ant-design/pro-components';
import type { Scene } from '@chamberlain/protocol';

const { Paragraph } = Typography;

export interface SceneDescriptionsProps {
  /** 场景数据 */
  scene: Scene;
  /** 是否显示 Schema */
  showSchema?: boolean;
  /** 额外的描述项配置 */
  extra?: ProDescriptionsProps['columns'];
  /** 列数 */
  column?: number;
}

/**
 * SceneDescriptions 组件
 */
export const SceneDescriptions: React.FC<SceneDescriptionsProps> = ({
  scene,
  showSchema = true,
  extra = [],
  column = 2,
}) => {
  const columns: ProDescriptionsProps['columns'] = [
    {
      title: '场景 ID',
      key: 'id',
      dataIndex: 'id',
      copyable: true,
    },
    {
      title: '场景名称',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: '描述',
      key: 'description',
      dataIndex: 'description',
      span: 2,
      render: (_, record) => record.description || '-',
    },
    {
      title: '当前 Schema 版本',
      key: 'currentSchemeVersion',
      dataIndex: 'currentSchemeVersion',
      render: (_, record) => (
        <Tag color="blue">v{record.currentSchemeVersion || 1}</Tag>
      ),
    },
    {
      title: '冲突策略',
      key: 'conditionConflictStrategy',
      dataIndex: 'conditionConflictStrategy',
      render: (_, record) => {
        const strategy = record.conditionConflictStrategy || 'PRIORITY';
        const colorMap: Record<string, string> = {
          PRIORITY: 'green',
          MERGE: 'orange',
          ERROR: 'red',
        };
        return <Tag color={colorMap[strategy]}>{strategy}</Tag>;
      },
    },
    {
      title: '可用条件',
      key: 'availableConditions',
      dataIndex: 'availableConditions',
      span: 2,
      render: (_, record) => {
        if (!record.availableConditions || record.availableConditions.length === 0) {
          return <span style={{ color: '#999' }}>无条件</span>;
        }
        return (
          <Space wrap>
            {record.availableConditions.map((condition: any, index: number) => (
              <Tag key={index} color="purple">
                {condition.name || condition.key}
                {condition.type && (
                  <span style={{ marginLeft: 4, opacity: 0.7 }}>
                    ({condition.type})
                  </span>
                )}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '创建时间',
      key: 'createdAt',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
    },
    {
      title: '更新时间',
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
    },
    {
      title: '创建者',
      key: 'createdBy',
      dataIndex: 'createdBy',
      render: (_, record) => record.createdBy || '-',
    },
    {
      title: '更新者',
      key: 'updatedBy',
      dataIndex: 'updatedBy',
      render: (_, record) => record.updatedBy || '-',
    },
    ...extra,
  ];

  // 如果需要显示 Schema
  const currentScheme = (scene as any).currentScheme;
  if (showSchema && currentScheme) {
    columns.push({
      title: 'JSON Schema',
      key: 'schema',
      span: 2,
      render: () => (
        <Paragraph
          copyable
          style={{
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 4,
            fontFamily: 'monospace',
            fontSize: 12,
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          <pre style={{ margin: 0 }}>
            {JSON.stringify(currentScheme, null, 2)}
          </pre>
        </Paragraph>
      ),
    });
  }

  return (
    <ProDescriptions
      column={column}
      dataSource={scene}
      columns={columns}
      bordered
    />
  );
};

