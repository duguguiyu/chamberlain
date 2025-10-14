-- H2 Database Schema
-- 场景表
CREATE TABLE IF NOT EXISTS scenes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT '场景名称',
    description TEXT COMMENT '场景描述',
    available_conditions JSON COMMENT '可用条件列表',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Scheme 版本表
CREATE TABLE IF NOT EXISTS scheme_versions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    scene_id BIGINT NOT NULL,
    version INT NOT NULL COMMENT '版本号',
    scheme JSON NOT NULL COMMENT 'JSON Schema定义',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否当前活跃版本',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE
);

-- 配置表
CREATE TABLE IF NOT EXISTS configs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_id VARCHAR(255) NOT NULL UNIQUE COMMENT '配置唯一标识',
    scene_id BIGINT NOT NULL,
    condition_list JSON COMMENT '条件列表',
    config_data JSON NOT NULL COMMENT '配置数据',
    scheme_version INT COMMENT '关联的Scheme版本',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX idx_scenes_name ON scenes(name);
CREATE INDEX idx_scheme_versions_scene_id ON scheme_versions(scene_id);
CREATE INDEX idx_scheme_versions_active ON scheme_versions(is_active);
CREATE INDEX idx_configs_scene_id ON configs(scene_id);
CREATE INDEX idx_configs_config_id ON configs(config_id);

