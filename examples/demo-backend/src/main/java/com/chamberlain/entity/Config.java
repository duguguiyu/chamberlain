package com.chamberlain.entity;

import com.chamberlain.entity.base.BaseEntity;
import com.chamberlain.entity.converter.ConditionListConverter;
import com.chamberlain.entity.converter.JsonNodeConverter;
import com.chamberlain.util.ConfigIdGenerator;
import com.chamberlain.util.ConditionHashUtil;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

/**
 * 配置实体类
 */
@Entity
@Table(name = "configs", indexes = {
    @Index(name = "idx_scene_id", columnList = "scene_id"),
    @Index(name = "idx_scene_version", columnList = "scene_id,scheme_version"),
    @Index(name = "idx_condition_hash", columnList = "condition_hash"),
    @Index(name = "idx_created_at", columnList = "created_at"),
    @Index(name = "idx_updated_at", columnList = "updated_at")
})
@Data
@EqualsAndHashCode(callSuper = true)
public class Config extends BaseEntity {
    
    @Id
    @Column(length = 512)
    private String id;
    
    /**
     * 场景ID
     */
    @Column(name = "scene_id", nullable = false, length = 128)
    private String sceneId;
    
    /**
     * Scheme 版本号
     */
    @Column(name = "scheme_version", nullable = false)
    private Integer schemeVersion;
    
    /**
     * 条件列表
     * JSON 格式: [{"key": "environment", "value": "production"}]
     */
    @Convert(converter = ConditionListConverter.class)
    @Column(name = "condition_list", columnDefinition = "JSON", nullable = false)
    private List<Condition> conditionList;
    
    /**
     * 条件哈希值（用于快速查找）
     */
    @Column(name = "condition_hash", nullable = false, length = 64)
    private String conditionHash;
    
    /**
     * 实际配置数据
     */
    @Convert(converter = JsonNodeConverter.class)
    @Column(name = "config_data", columnDefinition = "JSON", nullable = false)
    private JsonNode configData;
    
    /**
     * 在持久化前自动生成 ID 和哈希
     */
    @PrePersist
    @PreUpdate
    public void generateIdAndHash() {
        if (this.id == null) {
            this.id = ConfigIdGenerator.generate(sceneId, conditionList);
        }
        this.conditionHash = ConditionHashUtil.hash(conditionList);
    }
    
    /**
     * 条件内部类
     */
    @Data
    public static class Condition {
        private String key;
        private String value;
    }
}

