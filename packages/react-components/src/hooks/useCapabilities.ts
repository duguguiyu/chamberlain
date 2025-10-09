/**
 * Capabilities Hooks
 */

import { useChamberlain } from '../context/ChamberlainContext';
import type { Capabilities } from '@chamberlain/protocol';

export interface UseCapabilitiesResult {
  /** 服务能力 */
  capabilities: Capabilities | null;
  /** 是否正在加载 */
  loading: boolean;
  /** 检查是否支持某个能力 */
  hasCapability: (capability: keyof Capabilities) => boolean;
}

export const useCapabilities = (): UseCapabilitiesResult => {
  const { capabilities, loadingCapabilities } = useChamberlain();

  const hasCapability = (capability: keyof Capabilities): boolean => {
    return capabilities?.[capability] ?? false;
  };

  return {
    capabilities,
    loading: loadingCapabilities,
    hasCapability,
  };
};


