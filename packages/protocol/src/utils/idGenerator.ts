/**
 * ID 生成和验证工具
 */

import type { Condition } from '../types/scene';

/**
 * 验证场景 ID 格式
 * 规则: 小写字母开头，可包含小写字母、数字和下划线
 */
export function validateSceneId(id: string): boolean {
  return /^[a-z][a-z0-9_]*$/.test(id);
}

/**
 * 生成配置 ID
 * 基于场景 ID 和条件列表生成唯一 ID
 */
export function generateConfigId(sceneId: string, conditions: Condition[]): string {
  if (conditions.length === 0) {
    return `${sceneId}:default`;
  }

  // 按 key 排序，确保相同条件生成相同 ID
  const sortedConditions = [...conditions].sort((a, b) => a.key.localeCompare(b.key));

  const conditionStr = sortedConditions.map((c) => `${c.key}:${c.value}`).join(',');

  // 使用简单的哈希或直接拼接
  return `${sceneId}:${conditionStr}`;
}

/**
 * 解析配置 ID
 */
export function parseConfigId(configId: string): {
  sceneId: string;
  conditions: Condition[];
} {
  const parts = configId.split(':');
  const sceneId = parts[0];

  if (parts.length === 1 || parts[1] === 'default') {
    return { sceneId, conditions: [] };
  }

  const conditionParts = parts.slice(1).join(':').split(',');
  const conditions: Condition[] = conditionParts.map((part) => {
    const [key, ...valueParts] = part.split(':');
    return { key, value: valueParts.join(':') };
  });

  return { sceneId, conditions };
}


