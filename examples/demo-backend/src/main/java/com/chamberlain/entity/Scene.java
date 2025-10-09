package com.chamberlain.entity;

import com.chamberlain.entity.base.BaseEntity;
import com.chamberlain.entity.converter.AvailableConditionListConverter;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

/**
 * 场景实体类
 */
@Entity
@Table(name = "scenes", indexes = {
    @Index(name = "idx_created_at", columnList = "created_at"),
    @Index(name = "idx_updated_at", columnList = "updated_at"),
    @Index(name = "idx_name", columnList = "name")
})
@Data
@EqualsAndHashCode(callSuper = true)
public class Scene extends BaseEntity {
    
    @Id
    @Column(length = 128)
    private String id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    /**
     * 可用条件列表
     * JSON 格式: [{"key": "environment", "name": "环境", "description": "...", "valueType": "string"}]
     */
    @Convert(converter = AvailableConditionListConverter.class)
    @Column(name = "available_conditions", columnDefinition = "JSON")
    private List<AvailableCondition> availableConditions;
    
    /**
     * 条件冲突策略
     */
    @Column(name = "condition_conflict_strategy", length = 50)
    @Enumerated(EnumType.STRING)
    private ConflictStrategy conditionConflictStrategy = ConflictStrategy.PRIORITY;
    
    /**
     * 当前激活的 Scheme 版本
     */
    @Column(name = "current_scheme_version", nullable = false)
    private Integer currentSchemeVersion = 1;
    
    /**
     * 关联的 Scheme 版本列表
     */
    @OneToMany(mappedBy = "scene", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("version ASC")
    private List<SchemeVersion> schemeVersions = new ArrayList<>();
    
    /**
     * 可用条件内部类
     */
    @Data
    public static class AvailableCondition {
        private String key;
        private String name;
        private String description;
        private String valueType;
    }
    
    /**
     * 条件冲突策略枚举
     */
    public enum ConflictStrategy {
        /**
         * 优先级策略：按条件列表顺序匹配
         */
        PRIORITY,
        
        /**
         * 最匹配策略：选择匹配条件最多的配置
         */
        BEST_MATCH,
        
        /**
         * 严格匹配策略：必须完全匹配所有条件
         */
        STRICT
    }
}

