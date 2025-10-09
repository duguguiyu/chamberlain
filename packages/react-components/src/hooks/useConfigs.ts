/**
 * Configs Hooks
 */

import { useState, useCallback } from 'react';
import type {
  Config,
  PageData,
  ConfigListParams,
  CreateConfigRequest,
  UpdateConfigRequest,
  CopyConfigRequest,
} from '@chamberlain/protocol';
import { useChamberlain } from '../context/ChamberlainContext';

export interface UseConfigsResult {
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 获取配置列表 */
  fetchConfigs: (params: ConfigListParams) => Promise<PageData<Config>>;
  /** 获取配置详情 */
  fetchConfig: (id: string) => Promise<Config>;
  /** 创建配置 */
  createConfig: (request: CreateConfigRequest) => Promise<Config>;
  /** 更新配置 */
  updateConfig: (id: string, request: UpdateConfigRequest) => Promise<Config>;
  /** 删除配置 */
  deleteConfig: (id: string) => Promise<void>;
  /** 复制配置 */
  copyConfig: (id: string, request: CopyConfigRequest) => Promise<Config>;
}

export const useConfigs = (): UseConfigsResult => {
  const { client } = useChamberlain();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfigs = useCallback(
    async (params: ConfigListParams) => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.listConfigs(params);
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

  const fetchConfig = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.getConfig(id);
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

  const createConfig = useCallback(
    async (request: CreateConfigRequest) => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.createConfig(request);
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

  const updateConfig = useCallback(
    async (id: string, request: UpdateConfigRequest) => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.updateConfig(id, request);
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

  const deleteConfig = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await client.deleteConfig(id);
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

  const copyConfig = useCallback(
    async (id: string, request: CopyConfigRequest) => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.copyConfig(id, request);
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
    fetchConfigs,
    fetchConfig,
    createConfig,
    updateConfig,
    deleteConfig,
    copyConfig,
  };
};


