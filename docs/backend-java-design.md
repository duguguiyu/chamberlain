# Chamberlain Java 后端服务设计

## 1. 技术栈

### 核心框架
- **Spring Boot**: 3.2.x（最新稳定版）
- **Java**: 17 LTS 或 21 LTS
- **构建工具**: Maven 3.9+

### 数据层
- **ORM**: Spring Data JPA (Hibernate 6.x)
- **数据库**: MySQL 8.0+
- **缓存**: Redis 7.0+ (Spring Data Redis)
- **连接池**: HikariCP (Spring Boot 默认)
- **数据库迁移**: Flyway

### Web 层
- **API 文档**: SpringDoc OpenAPI 3 (生成符合协议的 OpenAPI 文档)
- **校验**: Spring Validation + JSON Schema Validator (networknt/json-schema-validator)
- **序列化**: Jackson (支持 JSON Schema)

### 工具库
- **Lombok**: 减少样板代码
- **MapStruct**: Entity 与 DTO 转换
- **Hutool**: 通用工具类
- **Guava**: 增强集合操作

### 测试
- **单元测试**: JUnit 5 + Mockito
- **集成测试**: Spring Boot Test + TestContainers (MySQL, Redis)
- **API 测试**: REST Assured
- **协议兼容性**: 使用前端 protocol 包的测试脚本

### 监控与日志
- **日志**: Slf4j + Logback
- **监控**: Spring Boot Actuator + Micrometer
- **追踪**: 可选集成 OpenTelemetry

---

## 2. 项目结构

```
chamberlain-backend/
├── pom.xml                                 # Maven 配置
├── README.md
├── docs/
│   └── api.md                              # API 文档
├── src/
│   ├── main/
│   │   ├── java/com/chamberlain/
│   │   │   ├── ChamberlainApplication.java
│   │   │   │
│   │   │   ├── controller/                # 控制器层
│   │   │   │   ├── CapabilitiesController.java
│   │   │   │   ├── SceneController.java
│   │   │   │   └── ConfigController.java
│   │   │   │
│   │   │   ├── service/                   # 服务层
│   │   │   │   ├── CapabilitiesService.java
│   │   │   │   ├── SceneService.java
│   │   │   │   ├── ConfigService.java
│   │   │   │   └── SchemaValidationService.java
│   │   │   │
│   │   │   ├── repository/                # 数据访问层
│   │   │   │   ├── SceneRepository.java
│   │   │   │   ├── SchemeVersionRepository.java
│   │   │   │   └── ConfigRepository.java
│   │   │   │
│   │   │   ├── entity/                    # 实体类
│   │   │   │   ├── Scene.java
│   │   │   │   ├── SchemeVersion.java
│   │   │   │   ├── Config.java
│   │   │   │   └── base/
│   │   │   │       └── BaseEntity.java
│   │   │   │
│   │   │   ├── dto/                       # 数据传输对象
│   │   │   │   ├── request/
│   │   │   │   │   ├── CreateSceneRequest.java
│   │   │   │   │   ├── UpdateSceneRequest.java
│   │   │   │   │   ├── CreateConfigRequest.java
│   │   │   │   │   └── ...
│   │   │   │   ├── response/
│   │   │   │   │   ├── SceneResponse.java
│   │   │   │   │   ├── ConfigResponse.java
│   │   │   │   │   └── ...
│   │   │   │   └── common/
│   │   │   │       ├── ApiResponse.java
│   │   │   │       ├── PageResult.java
│   │   │   │       └── ErrorResponse.java
│   │   │   │
│   │   │   ├── mapper/                    # Entity <-> DTO 转换
│   │   │   │   ├── SceneMapper.java
│   │   │   │   └── ConfigMapper.java
│   │   │   │
│   │   │   ├── config/                    # 配置类
│   │   │   │   ├── WebMvcConfig.java
│   │   │   │   ├── RedisConfig.java
│   │   │   │   ├── OpenApiConfig.java
│   │   │   │   └── JacksonConfig.java
│   │   │   │
│   │   │   ├── exception/                 # 异常处理
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── BusinessException.java
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   ├── ValidationException.java
│   │   │   │   └── ErrorCode.java
│   │   │   │
│   │   │   ├── validator/                 # 自定义校验器
│   │   │   │   ├── SceneIdValidator.java
│   │   │   │   ├── JsonSchemaValidator.java
│   │   │   │   └── ConditionValidator.java
│   │   │   │
│   │   │   ├── util/                      # 工具类
│   │   │   │   ├── ConfigIdGenerator.java
│   │   │   │   ├── JsonSchemaUtil.java
│   │   │   │   └── ConditionMatcher.java
│   │   │   │
│   │   │   └── constant/                  # 常量
│   │   │       ├── CacheKeys.java
│   │   │       └── ValidationMessages.java
│   │   │
│   │   └── resources/
│   │       ├── application.yml            # 主配置
│   │       ├── application-dev.yml        # 开发环境
│   │       ├── application-prod.yml       # 生产环境
│   │       ├── db/migration/              # Flyway 迁移脚本
│   │       │   ├── V1__init_schema.sql
│   │       │   └── V2__add_indexes.sql
│   │       └── static/
│   │           └── capabilities.json      # 服务能力配置
│   │
│   └── test/
│       ├── java/com/chamberlain/
│       │   ├── controller/                # 控制器测试
│       │   ├── service/                   # 服务层测试
│       │   ├── repository/                # 数据层测试
│       │   └── integration/               # 集成测试
│       │       └── ProtocolCompatibilityTest.java
│       └── resources/
│           ├── application-test.yml
│           └── test-data/
│               ├── scenes.json
│               └── configs.json
```

---

## 3. 数据库设计

### 3.1 表结构

#### `scenes` - 场景表
```sql
CREATE TABLE scenes (
    id VARCHAR(128) PRIMARY KEY COMMENT '场景ID，格式：小写字母、数字、下划线',
    name VARCHAR(255) NOT NULL COMMENT '场景名称',
    description TEXT COMMENT '场景描述',
    
    -- 场景元数据
    available_conditions JSON COMMENT '可用条件列表 [{key, name, description, valueType}]',
    condition_conflict_strategy VARCHAR(50) DEFAULT 'PRIORITY' COMMENT '条件冲突策略',
    
    -- 当前激活的 Scheme 版本
    current_scheme_version INT NOT NULL DEFAULT 1 COMMENT '当前激活的 Scheme 版本',
    
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(64) COMMENT '创建人',
    updated_by VARCHAR(64) COMMENT '更新人',
    
    -- 索引
    INDEX idx_created_at (created_at),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='配置场景表';
```

#### `scheme_versions` - Scheme 版本表
```sql
CREATE TABLE scheme_versions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    scene_id VARCHAR(128) NOT NULL COMMENT '场景ID',
    version INT NOT NULL COMMENT '版本号，从1开始递增',
    
    -- Schema 定义
    schema_json JSON NOT NULL COMMENT 'JSON Schema 定义',
    
    -- 版本元数据
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '状态：DRAFT, ACTIVE, DEPRECATED',
    change_description TEXT COMMENT '变更说明',
    is_breaking_change BOOLEAN DEFAULT FALSE COMMENT '是否为破坏性变更',
    
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(64) COMMENT '创建人',
    
    -- 索引和约束
    UNIQUE KEY uk_scene_version (scene_id, version),
    INDEX idx_scene_id (scene_id),
    INDEX idx_status (status),
    FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Scheme 版本表';
```

#### `configs` - 配置表
```sql
CREATE TABLE configs (
    id VARCHAR(512) PRIMARY KEY COMMENT '配置ID，格式：{sceneId}:{condition1}:{condition2}...',
    scene_id VARCHAR(128) NOT NULL COMMENT '场景ID',
    scheme_version INT NOT NULL COMMENT '使用的 Scheme 版本',
    
    -- 条件列表
    condition_list JSON NOT NULL COMMENT '条件列表 [{key, value}]',
    condition_hash VARCHAR(64) NOT NULL COMMENT '条件哈希，用于快速查找',
    
    -- 配置数据
    config_data JSON NOT NULL COMMENT '实际配置数据',
    
    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(64) COMMENT '创建人',
    updated_by VARCHAR(64) COMMENT '更新人',
    
    -- 索引
    INDEX idx_scene_id (scene_id),
    INDEX idx_scene_version (scene_id, scheme_version),
    INDEX idx_condition_hash (condition_hash),
    INDEX idx_created_at (created_at),
    INDEX idx_updated_at (updated_at),
    FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='配置数据表';
```

### 3.2 数据库索引策略

1. **主键索引**: 所有表都有主键索引
2. **外键索引**: Scene ID 的外键关系
3. **查询索引**: 
   - 按场景查询配置：`idx_scene_id`
   - 按条件哈希查询：`idx_condition_hash`
   - 时间范围查询：`idx_created_at`, `idx_updated_at`

### 3.3 JSON 字段设计

MySQL 8.0 原生支持 JSON 类型，具有以下优势：
- 自动验证 JSON 格式
- 支持 JSON 路径查询
- 更高效的存储

---

## 4. 核心实体设计

### 4.1 BaseEntity
```java
@MappedSuperclass
@Data
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity implements Serializable {
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @CreatedBy
    @Column(name = "created_by", length = 64)
    private String createdBy;
    
    @LastModifiedBy
    @Column(name = "updated_by", length = 64)
    private String updatedBy;
}
```

### 4.2 Scene Entity
```java
@Entity
@Table(name = "scenes")
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
    
    // JSON 字段使用 JPA Converter
    @Convert(converter = AvailableConditionsConverter.class)
    @Column(name = "available_conditions", columnDefinition = "JSON")
    private List<AvailableCondition> availableConditions;
    
    @Column(name = "condition_conflict_strategy", length = 50)
    @Enumerated(EnumType.STRING)
    private ConflictStrategy conditionConflictStrategy = ConflictStrategy.PRIORITY;
    
    @Column(name = "current_scheme_version", nullable = false)
    private Integer currentSchemeVersion = 1;
    
    // 关联关系
    @OneToMany(mappedBy = "scene", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("version ASC")
    private List<SchemeVersion> schemeVersions = new ArrayList<>();
}
```

### 4.3 SchemeVersion Entity
```java
@Entity
@Table(name = "scheme_versions", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"scene_id", "version"}))
@Data
@EqualsAndHashCode(callSuper = false)
public class SchemeVersion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scene_id", nullable = false)
    private Scene scene;
    
    @Column(nullable = false)
    private Integer version;
    
    @Convert(converter = JsonSchemaConverter.class)
    @Column(name = "schema_json", columnDefinition = "JSON", nullable = false)
    private JsonNode schemaJson;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SchemeStatus status = SchemeStatus.ACTIVE;
    
    @Column(name = "change_description", columnDefinition = "TEXT")
    private String changeDescription;
    
    @Column(name = "is_breaking_change")
    private Boolean isBreakingChange = false;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @CreatedBy
    @Column(name = "created_by", length = 64)
    private String createdBy;
}
```

### 4.4 Config Entity
```java
@Entity
@Table(name = "configs",
       indexes = {
           @Index(name = "idx_scene_id", columnList = "scene_id"),
           @Index(name = "idx_condition_hash", columnList = "condition_hash"),
           @Index(name = "idx_scene_version", columnList = "scene_id,scheme_version")
       })
@Data
@EqualsAndHashCode(callSuper = true)
public class Config extends BaseEntity {
    
    @Id
    @Column(length = 512)
    private String id;
    
    @Column(name = "scene_id", nullable = false, length = 128)
    private String sceneId;
    
    @Column(name = "scheme_version", nullable = false)
    private Integer schemeVersion;
    
    @Convert(converter = ConditionListConverter.class)
    @Column(name = "condition_list", columnDefinition = "JSON", nullable = false)
    private List<Condition> conditionList;
    
    @Column(name = "condition_hash", nullable = false, length = 64)
    private String conditionHash;
    
    @Convert(converter = JsonNodeConverter.class)
    @Column(name = "config_data", columnDefinition = "JSON", nullable = false)
    private JsonNode configData;
    
    // 辅助方法
    @PrePersist
    @PreUpdate
    public void generateIdAndHash() {
        if (this.id == null) {
            this.id = ConfigIdGenerator.generate(sceneId, conditionList);
        }
        this.conditionHash = ConditionHashUtil.hash(conditionList);
    }
}
```

---

## 5. DTO 设计

### 5.1 请求 DTO

#### CreateSceneRequest
```java
@Data
@Schema(description = "创建场景请求")
public class CreateSceneRequest {
    
    @NotBlank(message = "场景ID不能为空")
    @Pattern(regexp = "^[a-z0-9_]+$", message = "场景ID只能包含小写字母、数字和下划线")
    @Schema(description = "场景ID", example = "mysql_database_config")
    private String id;
    
    @NotBlank(message = "场景名称不能为空")
    @Schema(description = "场景名称", example = "MySQL 数据库配置")
    private String name;
    
    @Schema(description = "场景描述")
    private String description;
    
    @Valid
    @Schema(description = "可用条件列表")
    private List<AvailableConditionDto> availableConditions;
    
    @NotNull(message = "JSON Schema 不能为空")
    @JsonSchemaValid
    @Schema(description = "JSON Schema 定义")
    private JsonNode schema;
}
```

#### CreateConfigRequest
```java
@Data
@Schema(description = "创建配置请求")
public class CreateConfigRequest {
    
    @NotBlank(message = "场景ID不能为空")
    @Schema(description = "场景ID")
    private String sceneId;
    
    @NotNull(message = "Scheme版本不能为空")
    @Min(value = 1, message = "版本号必须大于0")
    @Schema(description = "Scheme版本")
    private Integer schemeVersion;
    
    @Valid
    @Schema(description = "条件列表，空列表表示默认配置")
    private List<ConditionDto> conditions = new ArrayList<>();
    
    @NotNull(message = "配置数据不能为空")
    @Schema(description = "配置数据，需符合对应 Scheme 的 JSON Schema")
    private JsonNode config;
}
```

### 5.2 响应 DTO

#### ApiResponse (通用响应包装)
```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "统一响应格式")
public class ApiResponse<T> {
    
    @Schema(description = "是否成功", example = "true")
    private Boolean success;
    
    @Schema(description = "响应数据")
    private T data;
    
    @Schema(description = "错误码")
    private String code;
    
    @Schema(description = "错误消息")
    private String message;
    
    // 静态工厂方法
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null, null);
    }
    
    public static <T> ApiResponse<T> error(String code, String message) {
        return new ApiResponse<>(false, null, code, message);
    }
}
```

#### PageResult (分页结果)
```java
@Data
@Schema(description = "分页结果")
public class PageResult<T> {
    
    @Schema(description = "数据列表")
    private List<T> list;
    
    @Schema(description = "总记录数")
    private Long total;
    
    @Schema(description = "当前页码")
    private Integer page;
    
    @Schema(description = "每页大小")
    private Integer pageSize;
}
```

---

## 6. Service 层设计

### 6.1 SceneService
```java
@Service
@Slf4j
@RequiredArgsConstructor
public class SceneService {
    
    private final SceneRepository sceneRepository;
    private final SchemeVersionRepository schemeVersionRepository;
    private final SceneMapper sceneMapper;
    private final SchemaValidationService schemaValidationService;
    
    @Cacheable(value = CacheKeys.SCENES, key = "#id")
    public SceneResponse getById(String id) {
        Scene scene = sceneRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("SCENE_NOT_FOUND", "场景不存在"));
        return sceneMapper.toResponse(scene);
    }
    
    public PageResult<SceneResponse> list(SceneQueryRequest request) {
        // 构建查询条件
        Specification<Scene> spec = SceneSpecifications.build(request);
        
        // 分页查询
        Pageable pageable = PageRequest.of(
            request.getPage() - 1, 
            request.getPageSize(),
            buildSort(request.getSort())
        );
        
        Page<Scene> page = sceneRepository.findAll(spec, pageable);
        
        return PageResult.<SceneResponse>builder()
            .list(sceneMapper.toResponseList(page.getContent()))
            .total(page.getTotalElements())
            .page(request.getPage())
            .pageSize(request.getPageSize())
            .build();
    }
    
    @Transactional
    @CacheEvict(value = CacheKeys.SCENES, key = "#request.id")
    public SceneResponse create(CreateSceneRequest request) {
        // 检查 ID 是否已存在
        if (sceneRepository.existsById(request.getId())) {
            throw new BusinessException("SCENE_EXISTS", "场景ID已存在");
        }
        
        // 验证 JSON Schema
        if (!schemaValidationService.isValidSchema(request.getSchema())) {
            throw new ValidationException("INVALID_SCHEMA", "JSON Schema 格式不正确");
        }
        
        // 创建场景
        Scene scene = sceneMapper.toEntity(request);
        scene = sceneRepository.save(scene);
        
        // 创建初始 Scheme 版本
        SchemeVersion schemeVersion = new SchemeVersion();
        schemeVersion.setScene(scene);
        schemeVersion.setVersion(1);
        schemeVersion.setSchemaJson(request.getSchema());
        schemeVersion.setStatus(SchemeStatus.ACTIVE);
        schemeVersionRepository.save(schemeVersion);
        
        return sceneMapper.toResponse(scene);
    }
    
    @Transactional
    @CacheEvict(value = CacheKeys.SCENES, key = "#id")
    public SchemeVersionResponse updateScheme(String id, UpdateSchemeRequest request) {
        Scene scene = sceneRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("SCENE_NOT_FOUND", "场景不存在"));
        
        // 验证新 Schema
        if (!schemaValidationService.isValidSchema(request.getSchema())) {
            throw new ValidationException("INVALID_SCHEMA", "JSON Schema 格式不正确");
        }
        
        // 获取当前版本的 Schema
        SchemeVersion currentVersion = schemeVersionRepository
            .findBySceneIdAndVersion(id, scene.getCurrentSchemeVersion())
            .orElseThrow();
        
        // 比较 Schema，检测破坏性变更
        boolean isBreaking = schemaValidationService.isBreakingChange(
            currentVersion.getSchemaJson(),
            request.getSchema()
        );
        
        // 创建新版本
        SchemeVersion newVersion = new SchemeVersion();
        newVersion.setScene(scene);
        newVersion.setVersion(scene.getCurrentSchemeVersion() + 1);
        newVersion.setSchemaJson(request.getSchema());
        newVersion.setStatus(SchemeStatus.ACTIVE);
        newVersion.setIsBreakingChange(isBreaking);
        newVersion.setChangeDescription(request.getChangeDescription());
        newVersion = schemeVersionRepository.save(newVersion);
        
        // 更新场景的当前版本
        scene.setCurrentSchemeVersion(newVersion.getVersion());
        sceneRepository.save(scene);
        
        return sceneMapper.toSchemeVersionResponse(newVersion);
    }
}
```

### 6.2 ConfigService
```java
@Service
@Slf4j
@RequiredArgsConstructor
public class ConfigService {
    
    private final ConfigRepository configRepository;
    private final SceneRepository sceneRepository;
    private final SchemeVersionRepository schemeVersionRepository;
    private final ConfigMapper configMapper;
    private final SchemaValidationService schemaValidationService;
    
    public PageResult<ConfigResponse> list(ConfigQueryRequest request) {
        // sceneId 必填
        if (StringUtils.isBlank(request.getSceneId())) {
            throw new ValidationException("INVALID_PARAMETER", "sceneId 参数必填");
        }
        
        Specification<Config> spec = ConfigSpecifications.build(request);
        Pageable pageable = PageRequest.of(
            request.getPage() - 1,
            request.getPageSize()
        );
        
        Page<Config> page = configRepository.findAll(spec, pageable);
        
        return PageResult.<ConfigResponse>builder()
            .list(configMapper.toResponseList(page.getContent()))
            .total(page.getTotalElements())
            .page(request.getPage())
            .pageSize(request.getPageSize())
            .build();
    }
    
    @Transactional
    public ConfigResponse create(CreateConfigRequest request) {
        // 验证场景存在
        Scene scene = sceneRepository.findById(request.getSceneId())
            .orElseThrow(() -> new ResourceNotFoundException("SCENE_NOT_FOUND", "场景不存在"));
        
        // 验证 Scheme 版本
        SchemeVersion schemeVersion = schemeVersionRepository
            .findBySceneIdAndVersion(request.getSceneId(), request.getSchemeVersion())
            .orElseThrow(() -> new ResourceNotFoundException("SCHEME_VERSION_NOT_FOUND", "Scheme版本不存在"));
        
        // 根据条件生成配置 ID
        String configId = ConfigIdGenerator.generate(request.getSceneId(), request.getConditions());
        
        // 检查配置是否已存在
        if (configRepository.existsById(configId)) {
            throw new BusinessException("CONFIG_EXISTS", "相同条件的配置已存在");
        }
        
        // 验证配置数据是否符合 Schema
        ValidationResult validationResult = schemaValidationService.validate(
            schemeVersion.getSchemaJson(),
            request.getConfig()
        );
        
        if (!validationResult.isValid()) {
            throw new ValidationException("CONFIG_VALIDATION_FAILED", 
                "配置数据不符合 Schema 定义: " + validationResult.getErrors());
        }
        
        // 创建配置
        Config config = configMapper.toEntity(request);
        config.setId(configId);
        config = configRepository.save(config);
        
        return configMapper.toResponse(config);
    }
    
    @Transactional
    public ConfigResponse copy(String id, CopyConfigRequest request) {
        // 查找源配置
        Config sourceConfig = configRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("CONFIG_NOT_FOUND", "源配置不存在"));
        
        // 生成新配置 ID
        String newId = ConfigIdGenerator.generate(sourceConfig.getSceneId(), request.getToConditions());
        
        // 检查目标配置是否已存在
        if (configRepository.existsById(newId)) {
            throw new BusinessException("CONFIG_EXISTS", "目标配置已存在");
        }
        
        // 复制配置
        Config newConfig = new Config();
        newConfig.setId(newId);
        newConfig.setSceneId(sourceConfig.getSceneId());
        newConfig.setSchemeVersion(sourceConfig.getSchemeVersion());
        newConfig.setConditionList(request.getToConditions());
        newConfig.setConfigData(sourceConfig.getConfigData().deepCopy());
        
        newConfig = configRepository.save(newConfig);
        
        return configMapper.toResponse(newConfig);
    }
}
```

### 6.3 SchemaValidationService
```java
@Service
@Slf4j
public class SchemaValidationService {
    
    private final JsonSchemaFactory schemaFactory;
    
    public SchemaValidationService() {
        this.schemaFactory = JsonSchemaFactory.getInstance(SpecVersion.VersionFlag.V202012);
    }
    
    /**
     * 验证 JSON Schema 本身是否有效
     */
    public boolean isValidSchema(JsonNode schemaNode) {
        try {
            schemaFactory.getSchema(schemaNode);
            return true;
        } catch (Exception e) {
            log.error("Invalid JSON Schema", e);
            return false;
        }
    }
    
    /**
     * 使用 Schema 验证数据
     */
    public ValidationResult validate(JsonNode schemaNode, JsonNode data) {
        try {
            JsonSchema schema = schemaFactory.getSchema(schemaNode);
            Set<ValidationMessage> errors = schema.validate(data);
            
            if (errors.isEmpty()) {
                return ValidationResult.success();
            }
            
            List<String> errorMessages = errors.stream()
                .map(ValidationMessage::getMessage)
                .collect(Collectors.toList());
            
            return ValidationResult.failure(errorMessages);
        } catch (Exception e) {
            log.error("Schema validation error", e);
            return ValidationResult.failure(List.of("Schema 验证失败: " + e.getMessage()));
        }
    }
    
    /**
     * 比较两个 Schema，检测是否为破坏性变更
     */
    public boolean isBreakingChange(JsonNode oldSchema, JsonNode newSchema) {
        // 简化版本：检查是否有字段被删除或类型发生变化
        JsonNode oldProperties = oldSchema.path("properties");
        JsonNode newProperties = newSchema.path("properties");
        
        if (!oldProperties.isMissingNode() && !newProperties.isMissingNode()) {
            Iterator<String> fieldNames = oldProperties.fieldNames();
            while (fieldNames.hasNext()) {
                String fieldName = fieldNames.next();
                JsonNode oldField = oldProperties.get(fieldName);
                JsonNode newField = newProperties.get(fieldName);
                
                // 字段被删除
                if (newField == null || newField.isMissingNode()) {
                    return true;
                }
                
                // 字段类型变更
                String oldType = oldField.path("type").asText();
                String newType = newField.path("type").asText();
                if (!oldType.equals(newType)) {
                    return true;
                }
            }
        }
        
        // 检查新增的必填字段
        Set<String> oldRequired = getRequiredFields(oldSchema);
        Set<String> newRequired = getRequiredFields(newSchema);
        
        for (String field : newRequired) {
            if (!oldRequired.contains(field)) {
                return true; // 新增必填字段是破坏性变更
            }
        }
        
        return false;
    }
    
    private Set<String> getRequiredFields(JsonNode schema) {
        Set<String> required = new HashSet<>();
        JsonNode requiredNode = schema.path("required");
        if (requiredNode.isArray()) {
            requiredNode.forEach(node -> required.add(node.asText()));
        }
        return required;
    }
}
```

---

## 7. Controller 层设计

### 7.1 CapabilitiesController
```java
@RestController
@RequestMapping("/api/capabilities")
@Tag(name = "Capabilities", description = "服务能力接口")
@RequiredArgsConstructor
public class CapabilitiesController {
    
    private final CapabilitiesService capabilitiesService;
    
    @GetMapping
    @Operation(summary = "获取服务能力")
    public ApiResponse<Map<String, Boolean>> getCapabilities() {
        return ApiResponse.success(capabilitiesService.getCapabilities());
    }
}
```

### 7.2 SceneController
```java
@RestController
@RequestMapping("/api/scenes")
@Tag(name = "Scenes", description = "场景管理接口")
@RequiredArgsConstructor
@Validated
public class SceneController {
    
    private final SceneService sceneService;
    
    @GetMapping
    @Operation(summary = "获取场景列表")
    public ApiResponse<PageResult<SceneResponse>> list(
        @Valid @ModelAttribute SceneQueryRequest request
    ) {
        return ApiResponse.success(sceneService.list(request));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "获取场景详情")
    public ApiResponse<SceneResponse> getById(
        @PathVariable @Pattern(regexp = "^[a-z0-9_]+$") String id
    ) {
        return ApiResponse.success(sceneService.getById(id));
    }
    
    @PostMapping
    @Operation(summary = "创建场景")
    public ApiResponse<SceneResponse> create(
        @Valid @RequestBody CreateSceneRequest request
    ) {
        return ApiResponse.success(sceneService.create(request));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "更新场景")
    public ApiResponse<SceneResponse> update(
        @PathVariable String id,
        @Valid @RequestBody UpdateSceneRequest request
    ) {
        return ApiResponse.success(sceneService.update(id, request));
    }
    
    @PostMapping("/{id}/schemes:validate")
    @Operation(summary = "验证 JSON Schema")
    public ApiResponse<ValidateSchemeResponse> validateScheme(
        @PathVariable String id,
        @Valid @RequestBody ValidateSchemeRequest request
    ) {
        return ApiResponse.success(sceneService.validateScheme(id, request));
    }
    
    @PostMapping("/{id}/schemes")
    @Operation(summary = "更新场景 Scheme（创建新版本）")
    public ApiResponse<SchemeVersionResponse> updateScheme(
        @PathVariable String id,
        @Valid @RequestBody UpdateSchemeRequest request
    ) {
        return ApiResponse.success(sceneService.updateScheme(id, request));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "删除场景")
    public ApiResponse<Void> delete(@PathVariable String id) {
        sceneService.delete(id);
        return ApiResponse.success(null);
    }
}
```

### 7.3 ConfigController
```java
@RestController
@RequestMapping("/api/configs")
@Tag(name = "Configs", description = "配置管理接口")
@RequiredArgsConstructor
@Validated
public class ConfigController {
    
    private final ConfigService configService;
    
    @GetMapping
    @Operation(summary = "获取配置列表")
    public ApiResponse<PageResult<ConfigResponse>> list(
        @Valid @ModelAttribute ConfigQueryRequest request
    ) {
        return ApiResponse.success(configService.list(request));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "获取配置详情")
    public ApiResponse<ConfigResponse> getById(@PathVariable String id) {
        return ApiResponse.success(configService.getById(id));
    }
    
    @PostMapping
    @Operation(summary = "创建配置")
    public ApiResponse<ConfigResponse> create(
        @Valid @RequestBody CreateConfigRequest request
    ) {
        return ApiResponse.success(configService.create(request));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "更新配置")
    public ApiResponse<ConfigResponse> update(
        @PathVariable String id,
        @Valid @RequestBody UpdateConfigRequest request
    ) {
        return ApiResponse.success(configService.update(id, request));
    }
    
    // Google API 风格的自定义方法：使用冒号
    @PostMapping("/{id}:copy")
    @Operation(summary = "复制配置")
    public ApiResponse<ConfigResponse> copy(
        @PathVariable String id,
        @Valid @RequestBody CopyConfigRequest request
    ) {
        return ApiResponse.success(configService.copy(id, request));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "删除配置")
    public ApiResponse<Void> delete(@PathVariable String id) {
        configService.delete(id);
        return ApiResponse.success(null);
    }
}
```

---

## 8. 异常处理

### 8.1 GlobalExceptionHandler
```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(ex.getCode(), ex.getMessage()));
    }
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException ex) {
        log.warn("Business exception: {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error(ex.getCode(), ex.getMessage()));
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(ValidationException ex) {
        log.warn("Validation exception: {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error(ex.getCode(), ex.getMessage()));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationErrors(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());
        
        String message = String.join("; ", errors);
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("VALIDATION_ERROR", message));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Unexpected exception", ex);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("INTERNAL_ERROR", "服务器内部错误"));
    }
}
```

---

## 9. 配置文件

### 9.1 application.yml
```yaml
spring:
  application:
    name: chamberlain-backend
  
  profiles:
    active: dev
  
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      minimum-idle: 5
      maximum-pool-size: 20
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
  
  jpa:
    show-sql: false
    hibernate:
      ddl-auto: validate  # 生产环境使用 validate，开发环境可用 update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true
        use_sql_comments: true
  
  data:
    redis:
      repositories:
        enabled: false
  
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

# Spring Doc OpenAPI
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    tags-sorter: alpha
    operations-sorter: method

# 日志配置
logging:
  level:
    root: INFO
    com.chamberlain: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE

# 服务能力配置
chamberlain:
  capabilities:
    scenes:
      search: true
      sort: true
    configs:
      search: true
      sort: true
      filter: true
```

### 9.2 application-dev.yml
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/chamberlain_dev?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: password
  
  data:
    redis:
      host: localhost
      port: 6379
      password: 
      database: 0
  
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: update

logging:
  level:
    com.chamberlain: DEBUG
```

---

## 10. 测试策略

### 10.1 单元测试
- Service 层：Mock Repository，测试业务逻辑
- Validator：测试各种验证规则
- Util：测试工具类方法

### 10.2 集成测试
```java
@SpringBootTest
@Testcontainers
@AutoConfigureMockMvc
class SceneControllerIntegrationTest {
    
    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0");
    
    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7.0")
        .withExposedPorts(6379);
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testCreateScene() throws Exception {
        String request = """
            {
                "id": "test_scene",
                "name": "Test Scene",
                "schema": {
                    "type": "object",
                    "properties": {
                        "field1": {"type": "string"}
                    }
                }
            }
            """;
        
        mockMvc.perform(post("/api/scenes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(request))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.id").value("test_scene"));
    }
}
```

### 10.3 协议兼容性测试
使用前端 `protocol` 包中的兼容性测试脚本：
```bash
cd packages/protocol
TEST_ENDPOINT=http://localhost:8080/api pnpm test:compat
```

---

## 11. 部署建议

### 11.1 Docker 部署
```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/chamberlain-backend.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 11.2 环境变量
```bash
# 数据库
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/chamberlain
SPRING_DATASOURCE_USERNAME=chamberlain
SPRING_DATASOURCE_PASSWORD=<secret>

# Redis
SPRING_DATA_REDIS_HOST=redis
SPRING_DATA_REDIS_PORT=6379

# JVM 参数
JAVA_OPTS=-Xms512m -Xmx1024m
```

---

## 12. 下一步工作

1. **创建 Maven 项目结构**
2. **实现核心 Entity 和 Repository**
3. **实现 Service 层业务逻辑**
4. **实现 Controller 层 API**
5. **编写单元测试和集成测试**
6. **运行协议兼容性测试**
7. **性能优化和缓存策略**
8. **编写部署文档**

---

这个设计提供了一个完整的、生产就绪的 Java 后端架构，符合协议规范，并且具有良好的可扩展性和可维护性。

