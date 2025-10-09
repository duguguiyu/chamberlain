/**
 * JSON Schema 类型定义
 * 基于 JSON Schema Draft 2020-12
 */

/**
 * JSON Schema 基础类型
 */
export type JSONSchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null';

/**
 * JSON Schema 格式
 */
export type JSONSchemaFormat =
  | 'date-time'
  | 'date'
  | 'time'
  | 'email'
  | 'hostname'
  | 'ipv4'
  | 'ipv6'
  | 'uri'
  | 'uri-reference'
  | 'uuid'
  | 'password'
  | 'textarea';

/**
 * JSON Schema 定义
 */
export interface JSONSchema {
  /** Schema 版本标识 */
  $schema?: string;
  /** Schema ID */
  $id?: string;
  /** 类型 */
  type?: JSONSchemaType | JSONSchemaType[];
  /** 标题 */
  title?: string;
  /** 描述 */
  description?: string;
  /** 默认值 */
  default?: any;
  /** 示例值 */
  examples?: any[];
  
  // 数字类型约束
  /** 最小值 */
  minimum?: number;
  /** 最大值 */
  maximum?: number;
  /** 排他最小值 */
  exclusiveMinimum?: number;
  /** 排他最大值 */
  exclusiveMaximum?: number;
  /** 倍数 */
  multipleOf?: number;
  
  // 字符串类型约束
  /** 最小长度 */
  minLength?: number;
  /** 最大长度 */
  maxLength?: number;
  /** 正则表达式模式 */
  pattern?: string;
  /** 格式 */
  format?: JSONSchemaFormat;
  
  // 数组类型约束
  /** 数组项 Schema */
  items?: JSONSchema;
  /** 最小数组长度 */
  minItems?: number;
  /** 最大数组长度 */
  maxItems?: number;
  /** 是否要求唯一项 */
  uniqueItems?: boolean;
  
  // 对象类型约束
  /** 对象属性定义 */
  properties?: Record<string, JSONSchema>;
  /** 必填字段列表 */
  required?: string[];
  /** 最小属性数 */
  minProperties?: number;
  /** 最大属性数 */
  maxProperties?: number;
  /** 附加属性 */
  additionalProperties?: boolean | JSONSchema;
  
  // 枚举
  /** 枚举值列表 */
  enum?: any[];
  
  // 组合 Schema
  /** 所有条件都满足 */
  allOf?: JSONSchema[];
  /** 任一条件满足 */
  anyOf?: JSONSchema[];
  /** 仅一个条件满足 */
  oneOf?: JSONSchema[];
  /** 不满足条件 */
  not?: JSONSchema;
  
  // 其他
  /** 常量值 */
  const?: any;
  /** 已废弃标记 */
  deprecated?: boolean;
  /** 只读标记 */
  readOnly?: boolean;
  /** 只写标记 */
  writeOnly?: boolean;
}

/**
 * Schema 验证规则
 */
export interface ValidationRule {
  /** 规则类型 */
  type: 'required' | 'pattern' | 'range' | 'custom';
  /** 错误消息 */
  message?: string;
  /** 自定义验证函数 */
  validator?: (value: any) => boolean | Promise<boolean>;
}


