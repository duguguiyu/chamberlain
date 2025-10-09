package com.chamberlain.util;

import com.chamberlain.entity.Config.Condition;
import cn.hutool.crypto.digest.DigestUtil;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 条件哈希工具类
 * <p>
 * 用于生成条件列表的哈希值，便于快速查找和匹配
 */
public class ConditionHashUtil {
    
    private static final String SEPARATOR = ":";
    private static final String CONDITION_SEPARATOR = ",";
    
    /**
     * 计算条件列表的哈希值
     * 使用 SHA-256 算法
     *
     * @param conditions 条件列表
     * @return 哈希值（16进制字符串）
     */
    public static String hash(List<Condition> conditions) {
        if (conditions == null || conditions.isEmpty()) {
            return DigestUtil.sha256Hex("");
        }
        
        // 按条件 key 排序，确保相同条件组合生成相同哈希
        String conditionString = conditions.stream()
            .sorted(Comparator.comparing(Condition::getKey))
            .map(c -> c.getKey() + SEPARATOR + c.getValue())
            .collect(Collectors.joining(CONDITION_SEPARATOR));
        
        return DigestUtil.sha256Hex(conditionString);
    }
    
    /**
     * 比较两个条件列表是否相等
     * 使用哈希值比较，效率更高
     *
     * @param conditions1 条件列表1
     * @param conditions2 条件列表2
     * @return 是否相等
     */
    public static boolean equals(List<Condition> conditions1, List<Condition> conditions2) {
        return hash(conditions1).equals(hash(conditions2));
    }
}

