/**
 * ConfigDescriptions - 配置详情展示组件
 * 基于 Schema 动态渲染配置详情
 */

import React from 'react';
import { ProDescriptions } from '@ant-design/pro-components';
import { Tag, Space, Typography } from 'antd';
import type { ProDescriptionsProps } from '@ant-design/pro-components';
import type { Config, JSONSchema } from '@chamberlain/protocol';

const { Paragraph } = Typography;

export interface ConfigDescriptionsProps {
  /** 配置数据 */
  config: Config;
  /** JSON Schema（用于解析配置字段） */
  schema?: JSONSchema;
  /** 是否显示原始配置 JSON */
  showRawConfig?: boolean;
  /** 额外的描述项配置 */
  extra?: ProDescriptionsProps['columns'];
  /** 列数 */
  column?: number;
}

/**
 * ConfigDescriptions 组件
 */
export const ConfigDescriptions: React.FC<ConfigDescriptionsProps> = ({
  config,
  schema,
  showRawConfig = true,
  extra = [],
  column = 2,
}) => {
  // 基础信息列
  const baseColumns: ProDescriptionsProps['columns'] = [
    {
      title: '配置 ID',
      key: 'id',
      dataIndex: 'id',
      copyable: true,
      span: 2,
    },
    {
      title: '场景 ID',
      key: 'sceneId',
      dataIndex: 'sceneId',
      copyable: true,
    },
    {
      title: 'Schema 版本',
      key: 'schemeVersion',
      dataIndex: 'schemeVersion',
      render: (_, record) => <Tag color="blue">v{record.schemeVersion}</Tag>,
    },
    {
      title: '应用条件',
      key: 'conditionList',
      dataIndex: 'conditionList',
      span: 2,
      render: (_, record) => {
        if (!record.conditionList || record.conditionList.length === 0) {
          return <Tag color="default">默认配置（无条件）</Tag>;
        }
        return (
          <Space wrap>
            {record.conditionList.map((condition: any, index: number) => (
              <Tag key={index} color="purple">
                <strong>{condition.key}</strong> = {condition.value}
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
  ];

  // 解析配置数据
  const configData =
    typeof config.config === 'string'
      ? (() => {
          try {
            return JSON.parse(config.config);
          } catch {
            return {};
          }
        })()
      : config.config || {};

  // 如果有 schema，根据 schema 生成配置字段的展示
  const configColumns: ProDescriptionsProps['columns'] = [];
  if (schema && schema.properties) {
    Object.entries(schema.properties).forEach(([key, fieldSchema]: [string, any]) => {
      const value = configData[key];
      const title = fieldSchema.title || fieldSchema.description || key;

      configColumns.push({
        title,
        key: `config.${key}`,
        render: () => {
          // 根据类型渲染不同的展示
          if (value === undefined || value === null) {
            return <span style={{ color: '#999' }}>-</span>;
          }

          // 布尔值
          if (fieldSchema.type === 'boolean') {
            return <Tag color={value ? 'green' : 'default'}>{value ? '是' : '否'}</Tag>;
          }

          // 数组
          if (fieldSchema.type === 'array' || Array.isArray(value)) {
            return (
              <Space wrap>
                {(value as any[]).map((item, index) => (
                  <Tag key={index}>{String(item)}</Tag>
                ))}
              </Space>
            );
          }

          // 对象
          if (fieldSchema.type === 'object' || typeof value === 'object') {
            return (
              <Paragraph
                copyable
                style={{
                  background: '#f5f5f5',
                  padding: 8,
                  borderRadius: 4,
                  fontFamily: 'monospace',
                  fontSize: 12,
                  margin: 0,
                }}
              >
                <pre style={{ margin: 0 }}>{JSON.stringify(value, null, 2)}</pre>
              </Paragraph>
            );
          }

          // 枚举值
          if (fieldSchema.enum) {
            return <Tag color="blue">{String(value)}</Tag>;
          }

          // 数字
          if (fieldSchema.type === 'number' || fieldSchema.type === 'integer') {
            return <span style={{ fontFamily: 'monospace' }}>{value}</span>;
          }

          // 默认字符串
          return <span>{String(value)}</span>;
        },
      });
    });
  }

  // 原始配置 JSON
  const rawConfigColumn: ProDescriptionsProps['columns'] = showRawConfig
    ? [
        {
          title: '原始配置 JSON',
          key: 'rawConfig',
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
                {JSON.stringify(configData, null, 2)}
              </pre>
            </Paragraph>
          ),
        },
      ]
    : [];

  const allColumns = [
    ...baseColumns,
    ...configColumns,
    ...rawConfigColumn,
    ...extra,
  ];

  return (
    <ProDescriptions
      column={column}
      dataSource={config}
      columns={allColumns}
      bordered
      title="配置详情"
    />
  );
};

