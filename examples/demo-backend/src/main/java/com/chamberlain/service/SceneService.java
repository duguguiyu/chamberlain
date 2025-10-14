package com.chamberlain.service;

import com.chamberlain.dto.common.PageResult;
import com.chamberlain.dto.request.CreateSceneRequest;
import com.chamberlain.dto.request.UpdateSceneRequest;
import com.chamberlain.dto.request.UpdateSchemeRequest;
import com.chamberlain.dto.request.ValidateSchemeRequest;
import com.chamberlain.dto.response.SceneResponse;
import com.chamberlain.dto.response.SchemeVersionResponse;
import com.chamberlain.dto.response.ValidateSchemeResponse;
import com.chamberlain.entity.Scene;
import com.chamberlain.entity.SchemeVersion;
import com.chamberlain.entity.SchemeVersion.SchemeStatus;
import com.chamberlain.exception.BusinessException;
import com.chamberlain.exception.ResourceNotFoundException;
import com.chamberlain.exception.ValidationException;
import com.chamberlain.mapper.SceneMapper;
import com.chamberlain.repository.SceneRepository;
import com.chamberlain.repository.SchemeVersionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 场景服务
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SceneService {
    
    private final SceneRepository sceneRepository;
    private final SchemeVersionRepository schemeVersionRepository;
    private final SceneMapper sceneMapper;
    private final SchemaValidationService schemaValidationService;
    private final ObjectMapper objectMapper;
    
    /**
     * 根据 ID 获取场景
     */
    public SceneResponse getById(String id) {
        Scene scene = sceneRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("SCENE_NOT_FOUND", "场景不存在: " + id));
        SceneResponse response = sceneMapper.toResponse(scene);
        
        // 获取当前激活的 scheme (将 JsonNode 转换为 Map，Jackson 自动序列化为 JSON 对象)
        if (scene.getCurrentSchemeVersion() != null) {
            schemeVersionRepository.findBySceneIdAndVersion(id, scene.getCurrentSchemeVersion())
                .ifPresent(schemeVersion -> {
                    try {
                        log.debug("Converting JsonNode for scene {}, node type: {}", id, schemeVersion.getSchemaJson().getClass().getName());
                        JsonNode schemaNode = schemeVersion.getSchemaJson();
                        
                        // 如果是 TextNode (字符串)，需要重新解析
                        if (schemaNode.isTextual()) {
                            log.debug("JsonNode is TextNode, parsing string");
                            schemaNode = objectMapper.readTree(schemaNode.asText());
                        }
                        
                        java.util.Map<String, Object> schemaMap = objectMapper.convertValue(schemaNode, java.util.Map.class);
                        log.debug("Converted to Map, type: {}, size: {}", schemaMap.getClass().getName(), schemaMap.size());
                        response.setCurrentScheme(schemaMap);
                    } catch (Exception e) {
                        log.error("Failed to convert JsonNode to Map for scene {}", id, e);
                    }
                });
        }
        
        return response;
    }
    
    /**
     * 获取场景列表（分页）
     */
    public PageResult<SceneResponse> list(Integer page, Integer pageSize, String keyword, String sort) {
        Pageable pageable = PageRequest.of(
            page - 1,
            pageSize,
            buildSort(sort)
        );
        
        Page<Scene> scenePage;
        
        // 如果有关键词，按名称搜索
        if (keyword != null && !keyword.trim().isEmpty()) {
            scenePage = sceneRepository.findAll(
                (root, query, cb) -> cb.like(cb.lower(root.get("name")),
                    "%" + keyword.toLowerCase() + "%"),
                pageable
            );
        } else {
            scenePage = sceneRepository.findAll(pageable);
        }
        
        List<SceneResponse> responses = sceneMapper.toResponseList(scenePage.getContent());
        
        // 为每个场景填充当前激活的 scheme (将 JsonNode 转换为 Map)
        responses.forEach(response -> {
            log.debug("Processing scene: {}, currentSchemeVersion: {}", response.getId(), response.getCurrentSchemeVersion());
            if (response.getCurrentSchemeVersion() != null) {
                var schemeOpt = schemeVersionRepository.findBySceneIdAndVersion(
                    response.getId(), 
                    response.getCurrentSchemeVersion()
                );
                log.debug("Found scheme for scene {}: {}", response.getId(), schemeOpt.isPresent());
                schemeOpt.ifPresent(schemeVersion -> {
                    try {
                        log.debug("Converting JsonNode for scene {}: {}", response.getId(), schemeVersion.getSchemaJson());
                        JsonNode schemaNode = schemeVersion.getSchemaJson();
                        
                        // 如果是 TextNode (字符串)，需要重新解析
                        if (schemaNode.isTextual()) {
                            log.debug("JsonNode is TextNode, parsing string: {}", schemaNode.asText());
                            schemaNode = objectMapper.readTree(schemaNode.asText());
                        }
                        
                        Object schemaMap = objectMapper.convertValue(schemaNode, java.util.Map.class);
                        log.debug("Converted to Map for scene {}: {}", response.getId(), schemaMap);
                        response.setCurrentScheme(schemaMap);
                        log.debug("Set currentScheme for scene {}, response.currentScheme: {}", response.getId(), response.getCurrentScheme());
                    } catch (Exception e) {
                        log.error("Failed to convert JsonNode to Map for scene {}", response.getId(), e);
                    }
                });
            }
        });
        
        return PageResult.<SceneResponse>builder()
            .list(responses)
            .total(scenePage.getTotalElements())
            .page(page)
            .pageSize(pageSize)
            .build();
    }
    
    /**
     * 创建场景
     */
    @Transactional
    public SceneResponse create(CreateSceneRequest request) {
        // 检查 ID 是否已存在
        if (sceneRepository.existsById(request.getId())) {
            throw new BusinessException("SCENE_EXISTS", "场景ID已存在: " + request.getId());
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
        schemeVersion.setChangeDescription("初始版本");
        schemeVersion = schemeVersionRepository.save(schemeVersion);
        
        log.info("Created scene: {} with initial scheme version", scene.getId());
        
        SceneResponse response = sceneMapper.toResponse(scene);
        try {
            JsonNode schemaNode = schemeVersion.getSchemaJson();
            
            // 如果是 TextNode (字符串)，需要重新解析
            if (schemaNode.isTextual()) {
                log.debug("JsonNode is TextNode, parsing string");
                schemaNode = objectMapper.readTree(schemaNode.asText());
            }
            
            response.setCurrentScheme(objectMapper.convertValue(schemaNode, java.util.Map.class));
        } catch (Exception e) {
            log.warn("Failed to convert JsonNode to Map for scene {}", scene.getId(), e);
        }
        return response;
    }
    
    /**
     * 更新场景
     */
    @Transactional
    public SceneResponse update(String id, UpdateSceneRequest request) {
        Scene scene = sceneRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("SCENE_NOT_FOUND", "场景不存在: " + id));
        
        sceneMapper.updateEntityFromRequest(request, scene);
        scene = sceneRepository.save(scene);
        
        log.info("Updated scene: {}", id);
        return sceneMapper.toResponse(scene);
    }
    
    /**
     * 删除场景
     */
    @Transactional
    public void delete(String id) {
        if (!sceneRepository.existsById(id)) {
            throw new ResourceNotFoundException("SCENE_NOT_FOUND", "场景不存在: " + id);
        }
        
        sceneRepository.deleteById(id);
        log.info("Deleted scene: {}", id);
    }
    
    /**
     * 验证 Scheme
     */
    public ValidateSchemeResponse validateScheme(String id, ValidateSchemeRequest request) {
        Scene scene = sceneRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("SCENE_NOT_FOUND", "场景不存在: " + id));
        
        // 验证 Schema 格式
        boolean valid = schemaValidationService.isValidSchema(request.getSchema());
        
        if (!valid) {
            return ValidateSchemeResponse.builder()
                .valid(false)
                .warnings(List.of("JSON Schema 格式不正确"))
                .isBreakingChange(false)
                .build();
        }
        
        // 获取当前版本的 Schema
        SchemeVersion currentVersion = schemeVersionRepository
            .findBySceneIdAndVersion(id, scene.getCurrentSchemeVersion())
            .orElseThrow(() -> new BusinessException("SCHEME_VERSION_NOT_FOUND", "当前版本不存在"));
        
        // 比较 Schema，检测破坏性变更
        boolean isBreaking = schemaValidationService.isBreakingChange(
            currentVersion.getSchemaJson(),
            request.getSchema()
        );
        
        List<String> warnings = schemaValidationService.compareSchemas(
            currentVersion.getSchemaJson(),
            request.getSchema()
        );
        
        return ValidateSchemeResponse.builder()
            .valid(true)
            .warnings(warnings)
            .isBreakingChange(isBreaking)
            .build();
    }
    
    /**
     * 更新 Scheme（创建新版本）
     */
    @Transactional
    public SchemeVersionResponse updateScheme(String id, UpdateSchemeRequest request) {
        Scene scene = sceneRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("SCENE_NOT_FOUND", "场景不存在: " + id));
        
        // 验证新 Schema
        if (!schemaValidationService.isValidSchema(request.getSchema())) {
            throw new ValidationException("INVALID_SCHEMA", "JSON Schema 格式不正确");
        }
        
        // 获取当前版本
        SchemeVersion currentVersion = schemeVersionRepository
            .findBySceneIdAndVersion(id, scene.getCurrentSchemeVersion())
            .orElseThrow(() -> new BusinessException("SCHEME_VERSION_NOT_FOUND", "当前版本不存在"));
        
        // 检测破坏性变更
        boolean isBreaking = schemaValidationService.isBreakingChange(
            currentVersion.getSchemaJson(),
            request.getSchema()
        );
        
        // 创建新版本
        Integer newVersionNumber = scene.getCurrentSchemeVersion() + 1;
        SchemeVersion newVersion = new SchemeVersion();
        newVersion.setScene(scene);
        newVersion.setVersion(newVersionNumber);
        newVersion.setSchemaJson(request.getSchema());
        newVersion.setStatus(SchemeStatus.ACTIVE);
        newVersion.setIsBreakingChange(isBreaking);
        newVersion.setChangeDescription(request.getChangeDescription());
        newVersion = schemeVersionRepository.save(newVersion);
        
        // 更新场景的当前版本
        scene.setCurrentSchemeVersion(newVersionNumber);
        sceneRepository.save(scene);
        
        log.info("Created new scheme version {} for scene {}, breaking: {}",
            newVersionNumber, id, isBreaking);
        
        return sceneMapper.toSchemeVersionResponse(newVersion);
    }
    
    /**
     * 获取场景的所有 Scheme 版本
     */
    public List<SchemeVersionResponse> getSchemeVersions(String id) {
        if (!sceneRepository.existsById(id)) {
            throw new ResourceNotFoundException("SCENE_NOT_FOUND", "场景不存在: " + id);
        }
        
        List<SchemeVersion> versions = schemeVersionRepository.findBySceneIdOrderByVersionDesc(id);
        return sceneMapper.toSchemeVersionResponseList(versions);
    }
    
    /**
     * 构建排序对象
     */
    private Sort buildSort(String sortParam) {
        if (sortParam == null || sortParam.trim().isEmpty()) {
            return Sort.by(Sort.Direction.DESC, "updatedAt");
        }
        
        String[] parts = sortParam.split(":");
        String field = parts[0];
        Sort.Direction direction = parts.length > 1 && "asc".equalsIgnoreCase(parts[1])
            ? Sort.Direction.ASC
            : Sort.Direction.DESC;
        
        return Sort.by(direction, field);
    }
}

