/**
 * ConfigTable - 配置列表表格组件
 * 用于查看和管理配置
 */

import React, { useRef, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Tag, Space, Popconfirm, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Config } from '@chamberlain/protocol';
import { useChamberlain } from '../../context/ChamberlainContext';
import { useCapabilities } from '../../hooks/useCapabilities';

export interface ConfigTableProps {
  /** 场景 ID（必填，用于筛选配置） */
  sceneId: string;
  /** 自定义列配置 */
  columns?: ProColumns<Config>[];
  /** 行操作回调 */
  actions?: {
    onView?: (config: Config) => void;
    onEdit?: (config: Config) => void;
    onDelete?: (config: Config) => Promise<void>;
    onCreate?: () => void;
    onCopy?: (config: Config) => void;
  };
  /** 是否可搜索 */
  searchable?: boolean;
  /** 是否显示操作列 */
  showActions?: boolean;
  /** 是否显示创建按钮 */
  showCreateButton?: boolean;
}

/**
 * ConfigTable 组件
 */
export const ConfigTable: React.FC<ConfigTableProps> = ({
  sceneId,
  columns: customColumns,
  actions = {},
  searchable = true,
  showActions = true,
  showCreateButton = true,
}) => {
  const actionRef = useRef<ActionType>();
  const { client } = useChamberlain();
  const { hasCapability } = useCapabilities();
  const [loading, setLoading] = useState(false);

  // 默认列配置
  const defaultColumns: ProColumns<Config>[] = [
    {
      title: '配置 ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      copyable: true,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: 'Schema 版本',
      dataIndex: 'schemeVersion',
      key: 'schemeVersion',
      width: 120,
      render: (_, record) => <Tag color="blue">v{record.schemeVersion}</Tag>,
      hideInSearch: true,
    },
    {
      title: '条件',
      dataIndex: 'conditionList',
      key: 'conditionList',
      width: 250,
      render: (_, record) => {
        if (!record.conditionList || record.conditionList.length === 0) {
          return <Tag color="default">默认配置</Tag>;
        }
        return (
          <Space wrap size={[4, 4]}>
            {record.conditionList.map((condition, index) => (
              <Tag key={index} color="purple">
                {condition.key}={condition.value}
              </Tag>
            ))}
          </Space>
        );
      },
      hideInSearch: !hasCapability('configs.filter'),
    },
    {
      title: '配置数据预览',
      dataIndex: 'config',
      key: 'config',
      ellipsis: true,
      render: (_, record) => {
        const configStr =
          typeof record.config === 'string'
            ? record.config
            : JSON.stringify(record.config);
        const preview = configStr.length > 100 ? configStr.substring(0, 100) + '...' : configStr;
        return <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{preview}</span>;
      },
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      valueType: 'dateTime',
      width: 180,
      hideInSearch: true,
      sorter: hasCapability('configs.sort'),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      valueType: 'dateTime',
      width: 180,
      hideInSearch: true,
      sorter: hasCapability('configs.sort'),
    },
  ];

  // 操作列
  const actionColumn: ProColumns<Config> = {
    title: '操作',
    key: 'action',
    valueType: 'option',
    width: 200,
    fixed: 'right',
    render: (_, record) => [
      actions.onView && (
        <a
          key="view"
          onClick={() => actions.onView?.(record)}
        >
          查看
        </a>
      ),
      actions.onEdit && (
        <a
          key="edit"
          onClick={() => actions.onEdit?.(record)}
        >
          编辑
        </a>
      ),
      actions.onCopy && (
        <a
          key="copy"
          onClick={() => actions.onCopy?.(record)}
        >
          复制
        </a>
      ),
      actions.onDelete && (
        <Popconfirm
          key="delete"
          title="确定要删除这个配置吗？"
          description="删除配置将无法恢复，请确认。"
          onConfirm={async () => {
            try {
              setLoading(true);
              await actions.onDelete?.(record);
              message.success('删除成功');
              actionRef.current?.reload();
            } catch (error: any) {
              message.error(error.message || '删除失败');
            } finally {
              setLoading(false);
            }
          }}
        >
          <a style={{ color: 'red' }}>
            删除
          </a>
        </Popconfirm>
      ),
    ].filter(Boolean),
  };

  const finalColumns = [
    ...(customColumns || defaultColumns),
    ...(showActions ? [actionColumn] : []),
  ];

  return (
    <ProTable<Config>
      columns={finalColumns}
      actionRef={actionRef}
      loading={loading}
      request={async (params, sort) => {
        try {
          const { current = 1, pageSize = 10, ...filters } = params;

          // 构建查询参数
          const queryParams: any = {
            sceneId,
            page: current,
            pageSize,
          };

          // 添加搜索参数
          if (searchable && hasCapability('configs.search') && filters.keyword) {
            queryParams.keyword = filters.keyword;
          }

          // 添加排序参数
          if (hasCapability('configs.sort') && sort) {
            const sortField = Object.keys(sort)[0];
            const sortOrder = sort[sortField];
            queryParams.sortBy = sortField;
            queryParams.sortOrder = sortOrder === 'ascend' ? 'asc' : 'desc';
          }

          const response = await client.getConfigs(queryParams);

          return {
            data: response.data?.list || [],
            total: response.data?.total || 0,
            success: true,
          };
        } catch (error: any) {
          message.error(error.message || '获取配置列表失败');
          return {
            data: [],
            total: 0,
            success: false,
          };
        }
      }}
      rowKey="id"
      search={
        searchable && hasCapability('configs.search')
          ? {
              labelWidth: 'auto',
            }
          : false
      }
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      }}
      dateFormatter="string"
      headerTitle="配置列表"
      toolBarRender={() =>
        showCreateButton && actions.onCreate
          ? [
              <Button
                key="create"
                type="primary"
                icon={<PlusOutlined />}
                onClick={actions.onCreate}
              >
                创建配置
              </Button>,
            ]
          : []
      }
    />
  );
};

