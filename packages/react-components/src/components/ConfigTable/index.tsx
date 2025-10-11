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
import { COLUMN_WIDTHS, createCommonColumns, TABLE_CONFIG } from '../../constants/tableConfig';

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
  const commonColumns = createCommonColumns();

  // 默认列配置
  const defaultColumns: ProColumns<Config>[] = [
    {
      ...commonColumns.id('配置 ID', COLUMN_WIDTHS.ID_SHORT),
    },
    {
      title: '条件',
      dataIndex: 'conditionList',
      key: 'conditionList',
      ellipsis: true,
      // 不设置 width，让它自动分配剩余空间
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
      ...commonColumns.createdAt(),
      sorter: hasCapability('configs.sort'),
    },
    {
      ...commonColumns.updatedAt(),
      sorter: hasCapability('configs.sort'),
    },
  ];

  // 操作列（4个操作：查看、编辑、复制、删除）
  const actionColumn: ProColumns<Config> = {
    ...commonColumns.actions(4, false),
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
      scroll={TABLE_CONFIG.scroll}
      search={
        searchable && hasCapability('configs.search')
          ? {
              labelWidth: 'auto' as const,
            }
          : false
      }
      pagination={{
        defaultPageSize: TABLE_CONFIG.pagination.defaultPageSize,
        showSizeChanger: TABLE_CONFIG.pagination.showSizeChanger,
        showQuickJumper: TABLE_CONFIG.pagination.showQuickJumper,
        showTotal: TABLE_CONFIG.pagination.showTotal,
        pageSizeOptions: TABLE_CONFIG.pagination.pageSizeOptions,
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

