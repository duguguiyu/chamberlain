/**
 * Config (配置) 相关类型定义
 * 配置是基于场景创建的具体配置实例
 */

import type { Condition } from './scene';

/**
 * 配置
 */
export interface Config {
  /** 配置唯一标识 (由场景和条件自动生成) */
  id: string;
  /** 所属场景 ID */
  sceneId: string;
  /** 使用的 Scheme 版本 */
  schemeVersion: number;
  /** 条件列表 (可为空，表示默认配置) */
  conditionList: Condition[];
  /** 具体配置内容 (符合对应 Scheme 的定义) */
  config: Record<string, any> | string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 创建者 */
  createdBy?: string;
  /** 更新者 */
  updatedBy?: string;
}

/**
 * 创建配置请求
 */
export interface CreateConfigRequest {
  /** 场景 ID */
  sceneId: string;
  /** Scheme 版本 */
  schemeVersion: number;
  /** 条件列表 */
  conditionList?: Condition[];
  /** 条件列表（兼容旧版） */
  conditions?: Condition[];
  /** 配置内容 */
  config: Record<string, any>;
}

/**
 * 更新配置请求
 */
export interface UpdateConfigRequest {
  /** Scheme 版本 (可选，不传则使用原版本) */
  schemeVersion?: number;
  /** 条件列表 (可选) */
  conditions?: Condition[];
  /** 配置内容 */
  config: Record<string, any>;
}

/**
 * 复制配置请求
 */
export interface CopyConfigRequest {
  /** 目标条件列表 */
  toConditions: Condition[];
}

/**
 * 验证配置请求
 */
export interface ValidateConfigRequest {
  /** Schema ID */
  schemaId: string;
  /** 配置内容 */
  config: Record<string, any>;
}

/**
 * 验证配置响应
 */
export interface ValidateConfigResponse {
  /** 是否有效 */
  valid: boolean;
  /** 错误列表 */
  errors: ValidationError[];
}

/**
 * 验证错误
 */
export interface ValidationError {
  /** 字段路径 (如: "database.host") */
  field: string;
  /** 错误消息 */
  message: string;
  /** 错误类型 */
  type: string;
}


