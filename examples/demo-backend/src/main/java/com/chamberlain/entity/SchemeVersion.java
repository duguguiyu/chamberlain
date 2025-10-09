package com.chamberlain.entity;

import com.chamberlain.entity.converter.JsonNodeConverter;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Scheme 版本实体类
 */
@Entity
@Table(name = "scheme_versions",
       uniqueConstraints = @UniqueConstraint(columnNames = {"scene_id", "version"}),
       indexes = {
           @Index(name = "idx_scene_id", columnList = "scene_id"),
           @Index(name = "idx_status", columnList = "status"),
           @Index(name = "idx_created_at", columnList = "created_at")
       })
@Data
@EntityListeners(AuditingEntityListener.class)
public class SchemeVersion implements Serializable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 所属场景
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scene_id", nullable = false)
    private Scene scene;
    
    /**
     * 版本号（从1开始递增）
     */
    @Column(nullable = false)
    private Integer version;
    
    /**
     * JSON Schema 定义
     */
    @Convert(converter = JsonNodeConverter.class)
    @Column(name = "schema_json", columnDefinition = "JSON", nullable = false)
    private JsonNode schemaJson;
    
    /**
     * 版本状态
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SchemeStatus status = SchemeStatus.ACTIVE;
    
    /**
     * 变更说明
     */
    @Column(name = "change_description", columnDefinition = "TEXT")
    private String changeDescription;
    
    /**
     * 是否为破坏性变更
     */
    @Column(name = "is_breaking_change")
    private Boolean isBreakingChange = false;
    
    /**
     * 创建时间
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    /**
     * 创建人
     */
    @CreatedBy
    @Column(name = "created_by", length = 64)
    private String createdBy;
    
    /**
     * Scheme 状态枚举
     */
    public enum SchemeStatus {
        /**
         * 草稿状态
         */
        DRAFT,
        
        /**
         * 激活状态
         */
        ACTIVE,
        
        /**
         * 已废弃
         */
        DEPRECATED
    }
}

