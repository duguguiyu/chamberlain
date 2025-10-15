/**
 * UI 通用配置和样式常量
 * 用于保持 Scene 和 Config 组件的视觉统一性
 */

import { CSSProperties } from 'react';

/**
 * 颜色配置
 */
export const UI_COLORS = {
  // 主色调
  primary: '#1890ff',
  secondary: '#52c41a',
  
  // 文本颜色
  text: {
    primary: '#262626',
    secondary: '#999',
    muted: '#666',
  },
  
  // 背景颜色
  background: {
    light: '#fafafa',
    white: '#ffffff',
    gradient: 'linear-gradient(to right, #f0f7ff, #ffffff)',
  },
  
  // 边框颜色
  border: {
    default: '#e8e8e8',
    primary: '#1890ff',
    secondary: '#52c41a',
  },
} as const;

/**
 * 字体大小配置
 */
export const UI_FONT_SIZES = {
  // 标题
  title: {
    large: 16,
    medium: 14,
    small: 13,
  },
  
  // 正文
  body: {
    large: 14,
    medium: 13,
    small: 12,
  },
  
  // 图标
  icon: {
    large: 18,
    medium: 16,
    small: 14,
  },
} as const;

/**
 * 间距配置
 */
export const UI_SPACING = {
  // 内边距
  padding: {
    large: 24,
    medium: 16,
    small: 12,
    tiny: 8,
  },
  
  // 外边距
  margin: {
    large: 24,
    medium: 16,
    small: 12,
    tiny: 8,
  },
  
  // 间隙
  gap: {
    large: 20,
    medium: 16,
    small: 12,
  },
} as const;

/**
 * 卡片样式配置
 */
export const CARD_STYLES = {
  // 元数据卡片（紧凑、次要）
  metadata: {
    size: 'small' as const,
    bodyStyle: {
      padding: '12px 16px',
      background: UI_COLORS.background.light,
    } as CSSProperties,
    style: {
      borderColor: UI_COLORS.border.default,
    } as CSSProperties,
  },
  
  // 主要内容卡片（突出显示）
  primary: {
    style: {
      borderColor: UI_COLORS.primary,
      borderWidth: 2,
    } as CSSProperties,
    headStyle: {
      background: UI_COLORS.background.gradient,
    } as CSSProperties,
  },
  
  // 次要内容卡片（中等重要性）
  secondary: {
    style: {
      borderColor: UI_COLORS.secondary,
      borderWidth: 2,
    } as CSSProperties,
    headStyle: {
      background: 'linear-gradient(to right, #f6ffed, #ffffff)',
    } as CSSProperties,
  },
} as const;

/**
 * 代码/JSON 显示样式
 */
export const CODE_BLOCK_STYLE: CSSProperties = {
  background: UI_COLORS.background.light,
  border: `1px solid ${UI_COLORS.border.default}`,
  padding: UI_SPACING.padding.small,
  borderRadius: 4,
  fontFamily: 'Monaco, Consolas, monospace',
  fontSize: UI_FONT_SIZES.body.small,
  maxHeight: 300,
  overflow: 'auto',
  margin: 0,
};

/**
 * ProDescriptions 通用配置
 */
export const DESCRIPTIONS_CONFIG = {
  // 元数据描述配置
  metadata: {
    column: 3,
    size: 'small' as const,
    bordered: false,
    colon: false,
    labelStyle: { 
      color: UI_COLORS.text.muted, 
      fontSize: UI_FONT_SIZES.body.small,
    } as CSSProperties,
    contentStyle: { 
      fontSize: UI_FONT_SIZES.body.small,
    } as CSSProperties,
  },
  
  // 主要内容描述配置
  primary: {
    bordered: true,
    labelStyle: { 
      fontWeight: 500, 
      fontSize: UI_FONT_SIZES.body.large,
    } as CSSProperties,
    contentStyle: { 
      fontSize: UI_FONT_SIZES.body.large,
    } as CSSProperties,
  },
} as const;

/**
 * 分隔线样式
 */
export const DIVIDER_STYLE: CSSProperties = {
  margin: '16px 0',
};

/**
 * 标签样式映射
 */
export const TAG_COLORS = {
  default: 'default',
  version: 'blue',
  status: 'green',
  condition: 'purple',
  type: 'cyan',
} as const;


