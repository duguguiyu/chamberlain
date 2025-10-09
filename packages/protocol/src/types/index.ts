/**
 * Chamberlain Protocol Type Definitions
 * 导出所有类型定义
 */

// Scene
export type {
  SchemeStatus,
  SchemeVersion,
  Condition,
  Scene,
  CreateSceneRequest,
  UpdateSceneRequest,
  ValidateSchemeRequest,
  ValidateSchemeResponse,
  UpdateSchemeRequest,
  UpdateSchemeResponse,
  UpdateSchemeStatusRequest,
  AddConditionRequest,
} from './scene';

// Config
export type {
  Config,
  CreateConfigRequest,
  UpdateConfigRequest,
  CopyConfigRequest,
  ValidateConfigRequest,
  ValidateConfigResponse,
  ValidationError,
} from './config';

// Schema
export type {
  JSONSchemaType,
  JSONSchemaFormat,
  JSONSchema,
  ValidationRule,
} from './schema';

// API
export type {
  Capabilities,
  PaginationParams,
  SearchParams,
  SortParams,
  PageData,
  ApiResponse,
  SceneListParams,
  ConfigListParams,
} from './api';

export { ErrorCode } from './api';


