/**
 * Scene (场景) 相关类型定义
 * 场景是配置管理的基础单元
 */

import type { JSONSchema } from './schema';

/**
 * Scheme 状态
 */
export type SchemeStatus = 'active' | 'inactive';

/**
 * Scheme 版本
 */
export interface SchemeVersion {
  /** JSON Schema 定义 (符合 JSON Schema Draft 2020-12 规范) */
  scheme: JSONSchema;
  /** 版本号 (自增整数) */
  version: number;
  /** 状态 */
  status: SchemeStatus;
}

/**
 * 条件
 */
export interface Condition {
  /** 条件 key (小写字母和下划线格式，如: environment, customer) */
  key: string;
  /** 条件值的描述 (用于展示，如: "环境", "客户") */
  value: string;
}

/**
 * 可用条件定义
 */
export interface AvailableCondition {
  /** 条件 key */
  key: string;
  /** 条件名称 */
  name: string;
  /** 条件描述（可选） */
  description?: string;
  /** 值类型（可选） */
  type?: string;
  /** 可选值列表（可选） */
  values?: string[];
}

/**
 * 场景
 */
export interface Scene {
  /** 场景唯一标识 (小写字母、数字和下划线，如: mysql_database_config) */
  id: string;
  /** 场景名称 (用于描述该场景，便于查找) */
  name: string;
  /** 场景描述 */
  description?: string;
  /** 可用条件列表 */
  availableConditions?: AvailableCondition[];
  /** 当前 Schema 版本号 */
  currentSchemeVersion?: number;
  /** 当前 Schema 定义 */
  currentScheme?: JSONSchema;
  /** 条件冲突策略 */
  conditionConflictStrategy?: 'PRIORITY' | 'MERGE' | 'ERROR';
  /** Scheme 版本列表 (支持多版本) */
  schemeList?: SchemeVersion[];
  /** 条件列表（旧版） */
  conditionList?: Condition[];
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
 * 创建场景请求
 */
export interface CreateSceneRequest {
  /** 场景 ID */
  id: string;
  /** 场景名称 */
  name: string;
  /** 场景描述 */
  description?: string;
  /** JSON Schema 定义 */
  schema: JSONSchema;
  /** 可用条件列表 */
  availableConditions?: AvailableCondition[];
  /** 条件列表（旧版，兼容） */
  conditions?: Condition[];
}

/**
 * 更新场景请求
 */
export interface UpdateSceneRequest {
  /** 场景名称 */
  name?: string;
}

/**
 * 验证 Scheme 请求
 */
export interface ValidateSchemeRequest {
  /** 新的 JSON Schema */
  scheme: JSONSchema;
}

/**
 * 验证 Scheme 响应
 */
export interface ValidateSchemeResponse {
  /** 是否通过验证 */
  valid: boolean;
  /** 警告信息列表 (删除或修改的字段) */
  warnings: string[];
}

/**
 * 更新 Scheme 请求
 */
export interface UpdateSchemeRequest {
  /** 新的 JSON Schema */
  scheme: JSONSchema;
  /** 是否强制覆盖 (跳过兼容性检查) */
  overwrite?: boolean;
}

/**
 * 更新 Scheme 响应
 */
export interface UpdateSchemeResponse {
  /** 新的版本号 */
  version: number;
}

/**
 * 更新 Scheme 状态请求
 */
export interface UpdateSchemeStatusRequest {
  /** 目标状态 */
  status: SchemeStatus;
}

/**
 * 添加条件请求
 */
export interface AddConditionRequest {
  /** 条件 key */
  key: string;
  /** 条件值描述 */
  value: string;
}


