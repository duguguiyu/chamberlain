/**
 * Scenes Hooks
 */

import { useState, useCallback } from 'react';
import type {
  Scene,
  PageData,
  SceneListParams,
  CreateSceneRequest,
  UpdateSceneRequest,
  ValidateSchemeRequest,
  UpdateSchemeRequest,
  AddConditionRequest,
} from '@chamberlain/protocol';
import { useChamberlain } from '../context/ChamberlainContext';

export interface UseScenesResult {
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 获取场景列表 */
  fetchScenes: (params?: SceneListParams) => Promise<PageData<Scene>>;
  /** 获取场景详情 */
  fetchScene: (id: string) => Promise<Scene>;
  /** 创建场景 */
  createScene: (request: CreateSceneRequest) => Promise<Scene>;
  /** 更新场景 */
  updateScene: (id: string, request: UpdateSceneRequest) => Promise<Scene>;
  /** 删除场景 */
  deleteScene: (id: string) => Promise<void>;
  /** 验证 Scheme */
  validateScheme: (id: string, request: ValidateSchemeRequest) => Promise<any>;
  /** 更新 Scheme */
  updateScheme: (id: string, request: UpdateSchemeRequest) => Promise<any>;
  /** 添加条件 */
  addCondition: (id: string, request: AddConditionRequest) => Promise<Scene>;
}

export const useScenes = (): UseScenesResult => {
  const { client } = useChamberlain();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchScenes = useCallback(
    async (params?: SceneListParams) => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.listScenes(params);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const fetchScene = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.getScene(id);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const createScene = useCallback(
    async (request: CreateSceneRequest) => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.createScene(request);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const updateScene = useCallback(
    async (id: string, request: UpdateSceneRequest) => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.updateScene(id, request);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const deleteScene = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await client.deleteScene(id);
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const validateScheme = useCallback(
    async (id: string, request: ValidateSchemeRequest) => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.validateScheme(id, request);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const updateScheme = useCallback(
    async (id: string, request: UpdateSchemeRequest) => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.updateScheme(id, request);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const addCondition = useCallback(
    async (id: string, request: AddConditionRequest) => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.addCondition(id, request);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return {
    loading,
    error,
    fetchScenes,
    fetchScene,
    createScene,
    updateScene,
    deleteScene,
    validateScheme,
    updateScheme,
    addCondition,
  };
};


