/**
 * Chamberlain Context
 * 提供全局配置和 API 客户端
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { Capabilities } from '@chamberlain/protocol';
import { ChamberlainClient, type ChamberlainClientConfig } from '../services/ChamberlainClient';

export interface ChamberlainContextValue {
  /** API 客户端 */
  client: ChamberlainClient;
  /** 服务能力 */
  capabilities: Capabilities | null;
  /** 是否正在加载能力 */
  loadingCapabilities: boolean;
}

const ChamberlainContext = createContext<ChamberlainContextValue | null>(null);

export interface ChamberlainProviderProps extends ChamberlainClientConfig {
  /** 自定义 capabilities（可选，不传则自动获取） */
  capabilities?: Capabilities;
  children: React.ReactNode;
}

export const ChamberlainProvider: React.FC<ChamberlainProviderProps> = ({
  endpoint,
  headers,
  timeout,
  capabilities: customCapabilities,
  children,
}) => {
  const client = useMemo(
    () => new ChamberlainClient({ endpoint, headers, timeout }),
    [endpoint, headers, timeout]
  );

  const [capabilities, setCapabilities] = useState<Capabilities | null>(customCapabilities || null);
  const [loadingCapabilities, setLoadingCapabilities] = useState(!customCapabilities);

  useEffect(() => {
    if (customCapabilities) {
      setCapabilities(customCapabilities);
      setLoadingCapabilities(false);
      return;
    }

    // 自动获取 capabilities
    const fetchCapabilities = async () => {
      try {
        const caps = await client.getCapabilities();
        setCapabilities(caps);
      } catch (error) {
        console.error('Failed to fetch capabilities:', error);
        // 使用默认能力
        setCapabilities({
          'scenes.search': false,
          'scenes.sort': false,
          'configs.search': false,
          'configs.sort': false,
          'configs.filter': false,
        });
      } finally {
        setLoadingCapabilities(false);
      }
    };

    fetchCapabilities();
  }, [client, customCapabilities]);

  const value: ChamberlainContextValue = {
    client,
    capabilities,
    loadingCapabilities,
  };

  return <ChamberlainContext.Provider value={value}>{children}</ChamberlainContext.Provider>;
};

/**
 * 使用 Chamberlain Context
 */
export const useChamberlain = (): ChamberlainContextValue => {
  const context = useContext(ChamberlainContext);
  if (!context) {
    throw new Error('useChamberlain must be used within ChamberlainProvider');
  }
  return context;
};


