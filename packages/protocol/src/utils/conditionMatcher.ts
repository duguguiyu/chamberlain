/**
 * 条件匹配工具
 */

import type { Condition } from '../types/scene';

/**
 * 检查条件列表是否匹配
 * @param target 目标条件列表
 * @param query 查询条件列表
 * @returns 如果 query 中的所有条件都在 target 中存在且值相同，则返回 true
 */
export function matchConditions(target: Condition[], query: Condition[]): boolean {
  return query.every((queryCondition) => {
    return target.some(
      (targetCondition) =>
        targetCondition.key === queryCondition.key &&
        targetCondition.value === queryCondition.value,
    );
  });
}

/**
 * 检查条件列表是否完全相同
 */
export function areConditionsEqual(a: Condition[], b: Condition[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const sortedA = [...a].sort((x, y) => x.key.localeCompare(y.key));
  const sortedB = [...b].sort((x, y) => x.key.localeCompare(y.key));

  return sortedA.every(
    (conditionA, index) =>
      conditionA.key === sortedB[index].key && conditionA.value === sortedB[index].value,
  );
}

/**
 * 从字符串解析条件列表
 * 格式: "key1:value1,key2:value2"
 */
export function parseConditionsFromString(str: string): Condition[] {
  if (!str) {
    return [];
  }

  return str.split(',').map((part) => {
    const [key, ...valueParts] = part.split(':');
    return {
      key: key.trim(),
      value: valueParts.join(':').trim(),
    };
  });
}

/**
 * 将条件列表转换为字符串
 */
export function stringifyConditions(conditions: Condition[]): string {
  if (conditions.length === 0) {
    return '';
  }

  return conditions.map((c) => `${c.key}:${c.value}`).join(',');
}


