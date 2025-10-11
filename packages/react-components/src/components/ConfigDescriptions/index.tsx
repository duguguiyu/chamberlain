/**
 * ConfigDescriptions - 配置详情展示组件
 * 基于 Schema 动态渲染配置详情
 */

import React from 'react';
import { ProDescriptions } from '@ant-design/pro-components';
import { Tag, Space, Typography, Card, Divider } from 'antd';
import type { ProDescriptionsProps } from '@ant-design/pro-components';
import type { Config, JSONSchema } from '@chamberlain/protocol';

const { Paragraph, Text } = Typography;

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
  // 元数据（紧凑显示）
  const metaColumns: ProDescriptionsProps['columns'] = [
    {
      title: '配置 ID',
      key: 'id',
      dataIndex: 'id',
      copyable: true,
    },
    {
      title: '场景 ID',
      key: 'sceneId',
      dataIndex: 'sceneId',
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
      render: (_, record) => {
        if (!record.conditionList || record.conditionList.length === 0) {
          return <Tag color="default">默认配置</Tag>;
        }
        return (
          <Space wrap size="small">
            {record.conditionList.map((condition: any, index: number) => (
              <Tag key={index} color="purple">
                <strong>{condition.key}</strong>={condition.value}
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 元数据区域 - 紧凑显示 */}
      <Card
        size="small"
        title={
          <Space>
            <Text type="secondary" style={{ fontSize: 13, fontWeight: 'normal' }}>
              📋 元数据
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              (辅助信息)
            </Text>
          </Space>
        }
        bodyStyle={{ 
          padding: '12px 16px',
          background: '#fafafa',
        }}
        style={{
          borderColor: '#e8e8e8',
        }}
      >
        <ProDescriptions
          column={3}
          size="small"
          dataSource={config}
          columns={metaColumns}
          bordered={false}
          colon={false}
          labelStyle={{ color: '#666', fontSize: 13 }}
          contentStyle={{ fontSize: 13 }}
        />
      </Card>

      {/* 配置数据区域 - 突出显示 */}
      <Card
        title={
          <Space>
            <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
              ⚙️ 配置数据
            </Text>
            {schema && schema.title && (
              <Tag color="blue">{schema.title}</Tag>
            )}
          </Space>
        }
        extra={
          showRawConfig && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              基于 Schema v{config.schemeVersion} 解析
            </Text>
          )
        }
        style={{
          borderColor: '#1890ff',
          borderWidth: 2,
        }}
        headStyle={{
          background: 'linear-gradient(to right, #f0f7ff, #ffffff)',
        }}
      >
        {configColumns.length > 0 ? (
          <ProDescriptions
            column={column}
            dataSource={config}
            columns={configColumns}
            bordered
            labelStyle={{ fontWeight: 500, fontSize: 14 }}
            contentStyle={{ fontSize: 14 }}
          />
        ) : (
          <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
            未提供 Schema 定义，无法解析配置字段
          </div>
        )}

        {/* 原始 JSON（可选） */}
        {showRawConfig && (
          <>
            <Divider style={{ margin: '16px 0' }} />
            <div>
              <Text
                type="secondary"
                style={{ fontSize: 13, marginBottom: 8, display: 'block' }}
              >
                原始 JSON 数据
              </Text>
              <Paragraph
                copyable
                style={{
                  background: '#fafafa',
                  border: '1px solid #e8e8e8',
                  padding: 12,
                  borderRadius: 4,
                  fontFamily: 'Monaco, Consolas, monospace',
                  fontSize: 12,
                  maxHeight: 300,
                  overflow: 'auto',
                  margin: 0,
                }}
              >
                <pre style={{ margin: 0, color: '#262626' }}>
                  {JSON.stringify(configData, null, 2)}
                </pre>
              </Paragraph>
            </div>
          </>
        )}
      </Card>

      {/* 额外内容 */}
      {extra.length > 0 && (
        <Card size="small">
          <ProDescriptions
            column={column}
            dataSource={config}
            columns={extra}
            bordered
          />
        </Card>
      )}
    </div>
  );
};

