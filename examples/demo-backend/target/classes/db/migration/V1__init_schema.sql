-- Chamberlain 数据库初始化脚本
-- Version: 1.0.0
-- Date: 2025-10-09

-- 创建场景表
CREATE TABLE IF NOT EXISTS scenes (
    id VARCHAR(128) PRIMARY KEY COMMENT '场景ID，格式：小写字母、数字、下划线',
    name VARCHAR(255) NOT NULL COMMENT '场景名称',
    description TEXT COMMENT '场景描述',
    
    -- 场景元数据（JSON 字段）
    available_conditions JSON COMMENT '可用条件列表 [{key, name, description, valueType}]',
    condition_conflict_strategy VARCHAR(50) DEFAULT 'PRIORITY' COMMENT '条件冲突策略',
    
    -- 当前激活的 Scheme 版本
    current_scheme_version INT NOT NULL DEFAULT 1 COMMENT '当前激活的 Scheme 版本',
    
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(64) COMMENT '创建人',
    updated_by VARCHAR(64) COMMENT '更新人',
    
    -- 索引
    INDEX idx_created_at (created_at),
    INDEX idx_updated_at (updated_at),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='配置场景表';

-- 创建 Scheme 版本表
CREATE TABLE IF NOT EXISTS scheme_versions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    scene_id VARCHAR(128) NOT NULL COMMENT '场景ID',
    version INT NOT NULL COMMENT '版本号，从1开始递增',
    
    -- Schema 定义（JSON 字段）
    schema_json JSON NOT NULL COMMENT 'JSON Schema 定义',
    
    -- 版本元数据
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '状态：DRAFT, ACTIVE, DEPRECATED',
    change_description TEXT COMMENT '变更说明',
    is_breaking_change BOOLEAN DEFAULT FALSE COMMENT '是否为破坏性变更',
    
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by VARCHAR(64) COMMENT '创建人',
    
    -- 唯一约束和索引
    UNIQUE KEY uk_scene_version (scene_id, version),
    INDEX idx_scene_id (scene_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    
    -- 外键约束
    CONSTRAINT fk_scheme_scene FOREIGN KEY (scene_id) 
        REFERENCES scenes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Scheme 版本表';

-- 创建配置表
CREATE TABLE IF NOT EXISTS configs (
    id VARCHAR(512) PRIMARY KEY COMMENT '配置ID，格式：{sceneId}:{condition1}:{condition2}...',
    scene_id VARCHAR(128) NOT NULL COMMENT '场景ID',
    scheme_version INT NOT NULL COMMENT '使用的 Scheme 版本',
    
    -- 条件列表（JSON 字段）
    condition_list JSON NOT NULL COMMENT '条件列表 [{key, value}]',
    condition_hash VARCHAR(64) NOT NULL COMMENT '条件哈希，用于快速查找',
    
    -- 配置数据（JSON 字段）
    config_data JSON NOT NULL COMMENT '实际配置数据',
    
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(64) COMMENT '创建人',
    updated_by VARCHAR(64) COMMENT '更新人',
    
    -- 索引
    INDEX idx_scene_id (scene_id),
    INDEX idx_scene_version (scene_id, scheme_version),
    INDEX idx_condition_hash (condition_hash),
    INDEX idx_created_at (created_at),
    INDEX idx_updated_at (updated_at),
    
    -- 外键约束
    CONSTRAINT fk_config_scene FOREIGN KEY (scene_id) 
        REFERENCES scenes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='配置数据表';

