/**
 * 表格统一配置常量
 * 用于统一管理所有 ProTable 组件的通用配置
 */

import type { ProColumns } from '@ant-design/pro-components';

/**
 * 列宽配置
 * 根据 Ant Design 规范，为不同类型的列定义标准宽度
 */
export const COLUMN_WIDTHS = {
  // 固定宽度列
  ID: 200,                    // ID 列（短 ID）
  ID_SHORT: 120,              // 短 ID 列
  ID_LONG: 280,               // 长 ID 列
  
  // 时间相关
  DATE: 165,                  // 日期列（YYYY-MM-DD HH:mm:ss）
  DATE_SHORT: 120,            // 短日期（YYYY-MM-DD）
  TIME: 100,                  // 时间列（HH:mm:ss）
  
  // 状态和标签
  STATUS: 100,                // 状态列
  TAG: 120,                   // 标签列
  VERSION: 100,               // 版本号列
  
  // 数值
  NUMBER: 100,                // 数字列
  COUNT: 80,                  // 计数列
  
  // 操作列
  ACTIONS_SINGLE: 100,        // 单个操作按钮
  ACTIONS_DOUBLE: 150,        // 两个操作按钮
  ACTIONS_TRIPLE: 200,        // 三个操作按钮
  ACTIONS_QUAD: 250,          // 四个操作按钮
  ACTIONS_FULL: 300,          // 完整操作列（4+ 按钮）
  
  // 名称和描述
  NAME: 200,                  // 名称列
  NAME_SHORT: 150,            // 短名称
  DESCRIPTION: 300,           // 描述列
  
  // 用户相关
  USER: 120,                  // 用户名列
  EMAIL: 200,                 // 邮箱列
} as const;

/**
 * 操作按钮配置
 */
export const ACTION_CONFIG = {
  // 操作按钮间距
  BUTTON_SPACING: 8,
  
  // 最小宽度（确保不会被压缩）
  MIN_WIDTH: 200,
  
  // 每个操作按钮预估宽度（含间距）
  BUTTON_WIDTH: 50,          // 中文 2-4 字 + 间距
  BUTTON_WIDTH_ICON: 60,     // 带图标的按钮
} as const;

/**
 * 通用列配置生成器
 */
export const createCommonColumns = () => ({
  /**
   * 创建 ID 列配置
   */
  id: (title = 'ID', width?: number): Partial<ProColumns<any>> => ({
    title,
    dataIndex: 'id',
    key: 'id',
    width: width || COLUMN_WIDTHS.ID,
    copyable: true,
    ellipsis: true,
    fixed: 'left',
  }),

  /**
   * 创建名称列配置
   */
  name: (title = '名称', width = COLUMN_WIDTHS.NAME): Partial<ProColumns<any>> => ({
    title,
    dataIndex: 'name',
    key: 'name',
    width,
    ellipsis: true,
  }),

  /**
   * 创建创建时间列配置
   */
  createdAt: (title = '创建时间', width = COLUMN_WIDTHS.DATE): Partial<ProColumns<any>> => ({
    title,
    dataIndex: 'createdAt',
    key: 'createdAt',
    valueType: 'dateTime',
    width,
    hideInSearch: true,
    sorter: true,
  }),

  /**
   * 创建更新时间列配置
   */
  updatedAt: (title = '更新时间', width = COLUMN_WIDTHS.DATE): Partial<ProColumns<any>> => ({
    title,
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    valueType: 'dateTime',
    width,
    hideInSearch: true,
    sorter: true,
  }),

  /**
   * 创建创建者列配置
   */
  createdBy: (title = '创建者', width = COLUMN_WIDTHS.USER): Partial<ProColumns<any>> => ({
    title,
    dataIndex: 'createdBy',
    key: 'createdBy',
    width,
    ellipsis: true,
    hideInSearch: true,
  }),

  /**
   * 创建更新者列配置
   */
  updatedBy: (title = '更新者', width = COLUMN_WIDTHS.USER): Partial<ProColumns<any>> => ({
    title,
    dataIndex: 'updatedBy',
    key: 'updatedBy',
    width,
    ellipsis: true,
    hideInSearch: true,
  }),

  /**
   * 创建操作列配置
   * @param actionCount 操作按钮数量
   * @param hasIcon 是否有图标
   */
  actions: (actionCount: number = 3, hasIcon = false): Partial<ProColumns<any>> => {
    // 根据按钮数量计算宽度
    const buttonWidth = hasIcon ? ACTION_CONFIG.BUTTON_WIDTH_ICON : ACTION_CONFIG.BUTTON_WIDTH;
    const calculatedWidth = actionCount * buttonWidth + ACTION_CONFIG.BUTTON_SPACING * 2;
    const width = Math.max(calculatedWidth, ACTION_CONFIG.MIN_WIDTH);

    return {
      title: '操作',
      key: 'action',
      valueType: 'option',
      width,
      minWidth: ACTION_CONFIG.MIN_WIDTH,
      fixed: 'right',
    };
  },
});

/**
 * 表格通用配置
 */
export const TABLE_CONFIG = {
  // 默认分页配置
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: ['10', '20', '50', '100'],
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `共 ${total} 条`,
  },

  // 默认滚动配置
  scroll: {
    x: 'max-content',
  },

  // 搜索配置
  search: {
    labelWidth: 'auto',
    defaultCollapsed: false,
    collapseRender: false,
  },

  // 工具栏配置
  toolbar: {
    multipleLine: false,
  },
};

/**
 * 颜色配置（用于 Tag、Badge 等）
 */
export const TAG_COLORS = {
  default: 'default',
  success: 'green',
  processing: 'blue',
  error: 'red',
  warning: 'orange',
  info: 'cyan',
} as const;

/**
 * 状态映射配置
 */
export const STATUS_CONFIG = {
  active: { text: '激活', color: TAG_COLORS.success },
  inactive: { text: '停用', color: TAG_COLORS.default },
  pending: { text: '待处理', color: TAG_COLORS.warning },
  error: { text: '错误', color: TAG_COLORS.error },
  draft: { text: '草稿', color: TAG_COLORS.default },
  published: { text: '已发布', color: TAG_COLORS.success },
} as const;

