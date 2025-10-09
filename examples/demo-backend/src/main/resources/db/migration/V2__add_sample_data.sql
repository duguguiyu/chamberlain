-- 添加示例数据（仅用于开发环境）

-- 插入示例场景
INSERT INTO scenes (id, name, description, available_conditions, current_scheme_version, created_by, updated_by)
VALUES (
    'mysql_database_config',
    'MySQL 数据库配置',
    '用于管理不同环境下的 MySQL 数据库连接配置',
    JSON_ARRAY(
        JSON_OBJECT(
            'key', 'environment',
            'name', '环境',
            'description', '部署环境：开发、测试、生产',
            'valueType', 'string'
        ),
        JSON_OBJECT(
            'key', 'region',
            'name', '地区',
            'description', '服务部署地区',
            'valueType', 'string'
        )
    ),
    1,
    'system',
    'system'
);

-- 插入示例 Scheme 版本
INSERT INTO scheme_versions (scene_id, version, schema_json, status, change_description, is_breaking_change, created_by)
VALUES (
    'mysql_database_config',
    1,
    JSON_OBJECT(
        'type', 'object',
        'required', JSON_ARRAY('host', 'port', 'database', 'username', 'password'),
        'properties', JSON_OBJECT(
            'host', JSON_OBJECT(
                'type', 'string',
                'description', '数据库主机地址',
                'examples', JSON_ARRAY('localhost', '192.168.1.100')
            ),
            'port', JSON_OBJECT(
                'type', 'integer',
                'description', '数据库端口',
                'default', 3306,
                'minimum', 1,
                'maximum', 65535
            ),
            'database', JSON_OBJECT(
                'type', 'string',
                'description', '数据库名称'
            ),
            'username', JSON_OBJECT(
                'type', 'string',
                'description', '数据库用户名'
            ),
            'password', JSON_OBJECT(
                'type', 'string',
                'description', '数据库密码'
            ),
            'charset', JSON_OBJECT(
                'type', 'string',
                'description', '字符集',
                'default', 'utf8mb4',
                'enum', JSON_ARRAY('utf8', 'utf8mb4')
            ),
            'maxConnections', JSON_OBJECT(
                'type', 'integer',
                'description', '最大连接数',
                'default', 100,
                'minimum', 1,
                'maximum', 1000
            ),
            'timeout', JSON_OBJECT(
                'type', 'integer',
                'description', '超时时间（秒）',
                'default', 30
            ),
            'ssl', JSON_OBJECT(
                'type', 'boolean',
                'description', '是否启用SSL',
                'default', false
            )
        )
    ),
    'ACTIVE',
    '初始版本',
    FALSE,
    'system'
);

-- 插入示例配置（默认配置）
INSERT INTO configs (id, scene_id, scheme_version, condition_list, condition_hash, config_data, created_by, updated_by)
VALUES (
    'mysql_database_config:default',
    'mysql_database_config',
    1,
    JSON_ARRAY(),
    SHA2('', 256),
    JSON_OBJECT(
        'host', 'localhost',
        'port', 3306,
        'database', 'default_db',
        'username', 'root',
        'password', 'password123',
        'charset', 'utf8mb4',
        'maxConnections', 100,
        'timeout', 30,
        'ssl', false
    ),
    'system',
    'system'
);

-- 插入示例配置（生产环境）
INSERT INTO configs (id, scene_id, scheme_version, condition_list, condition_hash, config_data, created_by, updated_by)
VALUES (
    'mysql_database_config:environment:production',
    'mysql_database_config',
    1,
    JSON_ARRAY(
        JSON_OBJECT('key', 'environment', 'value', 'production')
    ),
    SHA2('environment:production', 256),
    JSON_OBJECT(
        'host', 'prod-db.example.com',
        'port', 3306,
        'database', 'production_db',
        'username', 'prod_user',
        'password', 'prod_secure_password',
        'charset', 'utf8mb4',
        'maxConnections', 200,
        'timeout', 60,
        'ssl', true
    ),
    'system',
    'system'
);

