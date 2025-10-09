/**
 * Chamberlain API 客户端
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  ApiResponse,
  Capabilities,
  Scene,
  Config,
  PageData,
  SceneListParams,
  ConfigListParams,
  CreateSceneRequest,
  UpdateSceneRequest,
  ValidateSchemeRequest,
  ValidateSchemeResponse,
  UpdateSchemeRequest,
  UpdateSchemeResponse,
  UpdateSchemeStatusRequest,
  AddConditionRequest,
  CreateConfigRequest,
  UpdateConfigRequest,
  CopyConfigRequest,
} from '@chamberlain/protocol';

export interface ChamberlainClientConfig {
  /** API 端点 */
  endpoint: string;
  /** 自定义请求头 */
  headers?: Record<string, string>;
  /** 请求超时时间 (ms) */
  timeout?: number;
}

export class ChamberlainClient {
  private axios: AxiosInstance;

  constructor(config: ChamberlainClientConfig) {
    this.axios = axios.create({
      baseURL: config.endpoint,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    // 响应拦截器：统一处理错误
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data) {
          throw error.response.data;
        }
        throw {
          success: false,
          code: 'NETWORK_ERROR',
          message: error.message || '网络错误',
        };
      }
    );
  }

  // ============ Capabilities ============

  async getCapabilities(): Promise<Capabilities> {
    const { data } = await this.axios.get<ApiResponse<Capabilities>>('/capabilities');
    return data.data!;
  }

  // ============ Scenes ============

  async listScenes(params: SceneListParams = {}): Promise<PageData<Scene>> {
    const { data } = await this.axios.get<ApiResponse<PageData<Scene>>>('/scenes', { params });
    return data.data!;
  }

  async getScene(id: string): Promise<Scene> {
    const { data } = await this.axios.get<ApiResponse<Scene>>(`/scenes/${id}`);
    return data.data!;
  }

  async createScene(request: CreateSceneRequest): Promise<Scene> {
    const { data } = await this.axios.post<ApiResponse<Scene>>('/scenes', request);
    return data.data!;
  }

  async updateScene(id: string, request: UpdateSceneRequest): Promise<Scene> {
    const { data } = await this.axios.patch<ApiResponse<Scene>>(`/scenes/${id}`, request);
    return data.data!;
  }

  async deleteScene(id: string): Promise<void> {
    await this.axios.delete(`/scenes/${id}`);
  }

  async validateScheme(id: string, request: ValidateSchemeRequest): Promise<ValidateSchemeResponse> {
    const { data } = await this.axios.post<ApiResponse<ValidateSchemeResponse>>(
      `/scenes/${id}/schemes:validate`,
      request
    );
    return data.data!;
  }

  async updateScheme(id: string, request: UpdateSchemeRequest): Promise<UpdateSchemeResponse> {
    const { data } = await this.axios.post<ApiResponse<UpdateSchemeResponse>>(
      `/scenes/${id}/schemes`,
      request
    );
    return data.data!;
  }

  async updateSchemeStatus(
    id: string,
    version: number,
    request: UpdateSchemeStatusRequest
  ): Promise<void> {
    await this.axios.patch(`/scenes/${id}/schemes/${version}`, request);
  }

  async addCondition(id: string, request: AddConditionRequest): Promise<Scene> {
    const { data } = await this.axios.post<ApiResponse<Scene>>(`/scenes/${id}/conditions`, request);
    return data.data!;
  }

  // ============ Configs ============

  async listConfigs(params: ConfigListParams): Promise<PageData<Config>> {
    const { data } = await this.axios.get<ApiResponse<PageData<Config>>>('/configs', { params });
    return data.data!;
  }

  async getConfig(id: string): Promise<Config> {
    const { data } = await this.axios.get<ApiResponse<Config>>(`/configs/${id}`);
    return data.data!;
  }

  async createConfig(request: CreateConfigRequest): Promise<Config> {
    const { data } = await this.axios.post<ApiResponse<Config>>('/configs', request);
    return data.data!;
  }

  async updateConfig(id: string, request: UpdateConfigRequest): Promise<Config> {
    const { data } = await this.axios.put<ApiResponse<Config>>(`/configs/${id}`, request);
    return data.data!;
  }

  async deleteConfig(id: string): Promise<void> {
    await this.axios.delete(`/configs/${id}`);
  }

  async copyConfig(id: string, request: CopyConfigRequest): Promise<Config> {
    const { data } = await this.axios.post<ApiResponse<Config>>(`/configs/${id}:copy`, request);
    return data.data!;
  }
}

