/**
 * SceneTable - 场景表格组件
 * 用于展示和管理场景列表
 */

import React, { useRef } from 'react';
import { ProTable, type ProColumns, type ActionType } from '@ant-design/pro-components';
import { Button, message, Tag, Popconfirm, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Scene } from '@chamberlain/protocol';
import { useScenes, useCapabilities } from '../../hooks';

export interface SceneTableProps {
  /** 自定义列配置 */
  columns?: ProColumns<Scene>[];
  /** 行操作回调 */
  actions?: {
    /** 查看场景详情 */
    onView?: (scene: Scene) => void;
    /** 编辑场景 */
    onEdit?: (scene: Scene) => void;
    /** 删除场景 */
    onDelete?: (scene: Scene) => Promise<void>;
    /** 创建场景 */
    onCreate?: () => void;
    /** 查看场景配置 */
    onViewConfigs?: (scene: Scene) => void;
  };
  /** 是否显示搜索 */
  searchable?: boolean;
  /** 是否显示操作按钮 */
  showActions?: boolean;
  /** 是否显示创建按钮 */
  showCreateButton?: boolean;
}

export const SceneTable: React.FC<SceneTableProps> = ({
  columns: customColumns,
  actions,
  searchable = true,
  showActions = true,
  showCreateButton = true,
}) => {
  const actionRef = useRef<ActionType>();
  const { fetchScenes, deleteScene } = useScenes();
  const { hasCapability } = useCapabilities();

  // 默认列配置
  const defaultColumns: ProColumns<Scene>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      copyable: true,
      width: 120,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      // 不设置 width，让它自动分配剩余空间
    },
    {
      title: '可用条件',
      key: 'availableConditions',
      ellipsis: true,
      // 不设置 width，让它自动分配剩余空间
      render: (_, record) => {
        if (!record.availableConditions || record.availableConditions.length === 0) {
          return <span style={{ color: '#999' }}>无条件</span>;
        }
        return (
          <Space wrap size={[4, 4]}>
            {record.availableConditions.map((condition, index) => (
              <Tag key={index} color="purple">
                {condition.name || condition.key}
              </Tag>
            ))}
          </Space>
        );
      },
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      valueType: 'dateTime',
      width: 165,
      sorter: hasCapability('scenes.sort'),
      hideInSearch: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      valueType: 'dateTime',
      width: 165,
      sorter: hasCapability('scenes.sort'),
      hideInSearch: true,
    },
  ];

  // 操作列
  const actionColumn: ProColumns<Scene> = {
    title: '操作',
    key: 'action',
    valueType: 'option',
    width: 140,
    fixed: 'right',
    render: (_, record) => [
      <a
        key="view"
        onClick={() => actions?.onView?.(record)}
      >
        查看
      </a>,
      <a
        key="edit"
        onClick={() => actions?.onEdit?.(record)}
      >
        编辑
      </a>,
      <a
        key="configs"
        onClick={() => actions?.onViewConfigs?.(record)}
      >
        配置
      </a>,
      <Popconfirm
        key="delete"
        title="确认删除？"
        description="删除场景将无法恢复，请确认。"
        onConfirm={async () => {
          try {
            if (actions?.onDelete) {
              await actions.onDelete(record);
            } else {
              await deleteScene(record.id);
            }
            message.success('删除成功');
            actionRef.current?.reload();
          } catch (error: any) {
            message.error(error.message || '删除失败');
          }
        }}
      >
        <a style={{ color: 'red' }}>
          删除
        </a>
      </Popconfirm>,
    ],
  };

  // 合并列配置
  const finalColumns = customColumns || [...defaultColumns, ...(showActions ? [actionColumn] : [])];

  return (
    <ProTable<Scene>
      columns={finalColumns}
      actionRef={actionRef}
      request={async (params, sort) => {
        try {
          const { current, pageSize, keyword } = params;

          // 构建排序参数
          let sortParam: string | undefined;
          if (hasCapability('scenes.sort') && sort && Object.keys(sort).length > 0) {
            sortParam = Object.entries(sort)
              .map(([field, order]) => `${field}:${order === 'ascend' ? 'asc' : 'desc'}`)
              .join(',');
          }

          const result = await fetchScenes({
            page: current,
            pageSize,
            q: searchable && hasCapability('scenes.search') && keyword ? keyword as string : undefined,
            sort: sortParam,
          });

          return {
            data: result.list,
            total: result.total,
            success: true,
          };
        } catch (error: any) {
          message.error(error.message || '加载失败');
          return {
            data: [],
            total: 0,
            success: false,
          };
        }
      }}
      rowKey="id"
      scroll={{ x: 'max-content' }}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      }}
      search={
        searchable && hasCapability('scenes.search')
          ? {
              labelWidth: 'auto',
            }
          : false
      }
      dateFormatter="string"
      headerTitle="场景列表"
      toolBarRender={() =>
        showCreateButton
          ? [
              <Button
                key="create"
                type="primary"
                icon={<PlusOutlined />}
                onClick={actions?.onCreate}
              >
                新建场景
              </Button>,
            ]
          : []
      }
    />
  );
};

