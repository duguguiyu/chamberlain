package com.chamberlain.util;

import com.chamberlain.entity.Config.Condition;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 配置 ID 生成器
 * <p>
 * 生成规则：
 * - 默认配置（无条件）：{sceneId}:default
 * - 有条件配置：{sceneId}:{key1}:{value1},{key2}:{value2}...
 * - 条件按 key 字典序排序，确保相同条件组合生成相同 ID
 */
public class ConfigIdGenerator {
    
    private static final String DEFAULT_SUFFIX = "default";
    private static final String SEPARATOR = ":";
    private static final String CONDITION_SEPARATOR = ",";
    
    /**
     * 生成配置 ID
     *
     * @param sceneId    场景 ID
     * @param conditions 条件列表
     * @return 配置 ID
     */
    public static String generate(String sceneId, List<Condition> conditions) {
        if (sceneId == null || sceneId.isEmpty()) {
            throw new IllegalArgumentException("Scene ID cannot be null or empty");
        }
        
        // 如果没有条件，返回默认配置 ID
        if (conditions == null || conditions.isEmpty()) {
            return sceneId + SEPARATOR + DEFAULT_SUFFIX;
        }
        
        // 按条件 key 排序，确保相同条件组合生成相同 ID
        String conditionPart = conditions.stream()
            .sorted(Comparator.comparing(Condition::getKey))
            .map(c -> c.getKey() + SEPARATOR + c.getValue())
            .collect(Collectors.joining(CONDITION_SEPARATOR));
        
        return sceneId + SEPARATOR + conditionPart;
    }
    
    /**
     * 验证配置 ID 格式是否正确
     *
     * @param configId 配置 ID
     * @return 是否有效
     */
    public static boolean isValid(String configId) {
        if (configId == null || configId.isEmpty()) {
            return false;
        }
        
        String[] parts = configId.split(SEPARATOR, 2);
        return parts.length >= 2 && !parts[0].isEmpty() && !parts[1].isEmpty();
    }
    
    /**
     * 从配置 ID 中提取场景 ID
     *
     * @param configId 配置 ID
     * @return 场景 ID
     */
    public static String extractSceneId(String configId) {
        if (!isValid(configId)) {
            throw new IllegalArgumentException("Invalid config ID: " + configId);
        }
        
        int firstSeparator = configId.indexOf(SEPARATOR);
        return configId.substring(0, firstSeparator);
    }
}

