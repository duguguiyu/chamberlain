/**
 * API 相关类型定义
 * 包括请求参数、响应格式、错误码等
 */

/**
 * 服务能力声明
 */
export interface Capabilities {
  /** 是否支持场景搜索 */
  'scenes.search': boolean;
  /** 是否支持场景排序 */
  'scenes.sort': boolean;
  /** 是否支持配置搜索 */
  'configs.search': boolean;
  /** 是否支持配置排序 */
  'configs.sort': boolean;
  /** 是否支持配置筛选 */
  'configs.filter': boolean;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  /** 当前页码 (从 1 开始) */
  page?: number;
  /** 每页大小 */
  pageSize?: number;
}

/**
 * 搜索参数
 */
export interface SearchParams {
  /** 搜索关键字 */
  q?: string;
}

/**
 * 排序参数
 * 格式: "field:order,field:order"
 * 例如: "createdAt:desc,name:asc"
 */
export interface SortParams {
  /** 排序规则 */
  sort?: string;
}

/**
 * 分页数据
 */
export interface PageData<T> {
  /** 数据列表 */
  list: T[];
  /** 总数 */
  total: number;
  /** 当前页 */
  page: number;
  /** 每页大小 */
  pageSize: number;
}

/**
 * 统一响应格式
 */
export interface ApiResponse<T = any> {
  /** 是否成功 */
  success: boolean;
  /** 响应数据 */
  data?: T;
  /** 错误码 */
  code?: string;
  /** 错误消息 */
  message?: string;
  /** 错误详情 */
  details?: Record<string, any>;
  /** 请求 ID (用于追踪) */
  requestId?: string;
}

/**
 * 错误码
 */
export enum ErrorCode {
  // 通用错误 (1xxx)
  SUCCESS = 'SUCCESS',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  
  // 场景相关错误 (2xxx)
  INVALID_SCENE_ID_FORMAT = 'INVALID_SCENE_ID_FORMAT',
  SCENE_EXISTS = 'SCENE_EXISTS',
  SCENE_NOT_FOUND = 'SCENE_NOT_FOUND',
  SCENE_HAS_CONFIGS = 'SCENE_HAS_CONFIGS',
  INVALID_SCHEME = 'INVALID_SCHEME',
  SCHEME_VERSION_NOT_FOUND = 'SCHEME_VERSION_NOT_FOUND',
  SCHEME_NOT_COMPATIBLE = 'SCHEME_NOT_COMPATIBLE',
  
  // 配置相关错误 (3xxx)
  CONFIG_NOT_FOUND = 'CONFIG_NOT_FOUND',
  CONFIG_EXISTS = 'CONFIG_EXISTS',
  CONFIG_VALIDATION_FAILED = 'CONFIG_VALIDATION_FAILED',
  CONFIG_CONFLICT = 'CONFIG_CONFLICT',
  INVALID_CONFIG_DATA = 'INVALID_CONFIG_DATA',
}

/**
 * 场景列表查询参数
 */
export interface SceneListParams extends PaginationParams, SearchParams, SortParams {}

/**
 * 配置列表查询参数
 */
export interface ConfigListParams extends PaginationParams, SearchParams, SortParams {
  /** 场景 ID (必填) */
  sceneId: string;
  /** Scheme 版本 (可选) */
  schemeVersion?: number;
  /** 条件筛选 (可选, 格式: key1:value1,key2:value2) */
  conditions?: string;
}


