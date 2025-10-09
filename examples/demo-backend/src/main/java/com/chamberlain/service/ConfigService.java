package com.chamberlain.service;

import com.chamberlain.dto.common.PageResult;
import com.chamberlain.dto.request.CopyConfigRequest;
import com.chamberlain.dto.request.CreateConfigRequest;
import com.chamberlain.dto.request.UpdateConfigRequest;
import com.chamberlain.dto.response.ConfigResponse;
import com.chamberlain.entity.Config;
import com.chamberlain.entity.Scene;
import com.chamberlain.entity.SchemeVersion;
import com.chamberlain.exception.BusinessException;
import com.chamberlain.exception.ResourceNotFoundException;
import com.chamberlain.exception.ValidationException;
import com.chamberlain.mapper.ConfigMapper;
import com.chamberlain.repository.ConfigRepository;
import com.chamberlain.repository.SceneRepository;
import com.chamberlain.repository.SchemeVersionRepository;
import com.chamberlain.service.SchemaValidationService.ValidationResult;
import com.chamberlain.util.ConfigIdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 配置服务
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ConfigService {
    
    private final ConfigRepository configRepository;
    private final SceneRepository sceneRepository;
    private final SchemeVersionRepository schemeVersionRepository;
    private final ConfigMapper configMapper;
    private final SchemaValidationService schemaValidationService;
    
    /**
     * 根据 ID 获取配置
     */
    public ConfigResponse getById(String id) {
        Config config = configRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("CONFIG_NOT_FOUND", "配置不存在: " + id));
        return configMapper.toResponse(config);
    }
    
    /**
     * 获取配置列表（分页）
     */
    public PageResult<ConfigResponse> list(String sceneId, Integer schemeVersion,
                                           Integer page, Integer pageSize, String sort) {
        // sceneId 必填
        if (sceneId == null || sceneId.trim().isEmpty()) {
            throw new ValidationException("INVALID_PARAMETER", "sceneId 参数必填");
        }
        
        Pageable pageable = PageRequest.of(
            page - 1,
            pageSize,
            buildSort(sort)
        );
        
        Page<Config> configPage;
        
        // 按场景和版本过滤
        if (schemeVersion != null) {
            configPage = configRepository.findAll(
                (root, query, cb) -> cb.and(
                    cb.equal(root.get("sceneId"), sceneId),
                    cb.equal(root.get("schemeVersion"), schemeVersion)
                ),
                pageable
            );
        } else {
            configPage = configRepository.findAll(
                (root, query, cb) -> cb.equal(root.get("sceneId"), sceneId),
                pageable
            );
        }
        
        return PageResult.<ConfigResponse>builder()
            .list(configMapper.toResponseList(configPage.getContent()))
            .total(configPage.getTotalElements())
            .page(page)
            .pageSize(pageSize)
            .build();
    }
    
    /**
     * 创建配置
     */
    @Transactional
    public ConfigResponse create(CreateConfigRequest request) {
        // 验证场景存在
        Scene scene = sceneRepository.findById(request.getSceneId())
            .orElseThrow(() -> new ResourceNotFoundException("SCENE_NOT_FOUND",
                "场景不存在: " + request.getSceneId()));
        
        // 验证 Scheme 版本
        SchemeVersion schemeVersion = schemeVersionRepository
            .findBySceneIdAndVersion(request.getSceneId(), request.getSchemeVersion())
            .orElseThrow(() -> new ResourceNotFoundException("SCHEME_VERSION_NOT_FOUND",
                "Scheme版本不存在: " + request.getSchemeVersion()));
        
        // 根据条件生成配置 ID
        String configId = ConfigIdGenerator.generate(request.getSceneId(), request.getConditions());
        
        // 检查配置是否已存在
        if (configRepository.existsById(configId)) {
            throw new BusinessException("CONFIG_EXISTS", "相同条件的配置已存在: " + configId);
        }
        
        // 验证配置数据是否符合 Schema
        ValidationResult validationResult = schemaValidationService.validate(
            schemeVersion.getSchemaJson(),
            request.getConfig()
        );
        
        if (!validationResult.isValid()) {
            String errorMsg = String.join("; ", validationResult.getErrors());
            throw new ValidationException("CONFIG_VALIDATION_FAILED",
                "配置数据不符合 Schema 定义: " + errorMsg);
        }
        
        // 创建配置
        Config config = configMapper.toEntity(request);
        config.setId(configId);
        config = configRepository.save(config);
        
        log.info("Created config: {}", configId);
        return configMapper.toResponse(config);
    }
    
    /**
     * 更新配置
     */
    @Transactional
    public ConfigResponse update(String id, UpdateConfigRequest request) {
        Config config = configRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("CONFIG_NOT_FOUND", "配置不存在: " + id));
        
        // 如果更新了配置数据，需要验证
        if (request.getConfig() != null) {
            SchemeVersion schemeVersion = schemeVersionRepository
                .findBySceneIdAndVersion(config.getSceneId(),
                    request.getSchemeVersion() != null ? request.getSchemeVersion() : config.getSchemeVersion())
                .orElseThrow(() -> new ResourceNotFoundException("SCHEME_VERSION_NOT_FOUND", "Scheme版本不存在"));
            
            ValidationResult validationResult = schemaValidationService.validate(
                schemeVersion.getSchemaJson(),
                request.getConfig()
            );
            
            if (!validationResult.isValid()) {
                String errorMsg = String.join("; ", validationResult.getErrors());
                throw new ValidationException("CONFIG_VALIDATION_FAILED",
                    "配置数据不符合 Schema 定义: " + errorMsg);
            }
        }
        
        configMapper.updateEntityFromRequest(request, config);
        config = configRepository.save(config);
        
        log.info("Updated config: {}", id);
        return configMapper.toResponse(config);
    }
    
    /**
     * 删除配置
     */
    @Transactional
    public void delete(String id) {
        if (!configRepository.existsById(id)) {
            throw new ResourceNotFoundException("CONFIG_NOT_FOUND", "配置不存在: " + id);
        }
        
        configRepository.deleteById(id);
        log.info("Deleted config: {}", id);
    }
    
    /**
     * 复制配置
     */
    @Transactional
    public ConfigResponse copy(String id, CopyConfigRequest request) {
        // 查找源配置
        Config sourceConfig = configRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("CONFIG_NOT_FOUND", "源配置不存在: " + id));
        
        // 生成新配置 ID
        String newId = ConfigIdGenerator.generate(sourceConfig.getSceneId(), request.getToConditions());
        
        // 检查目标配置是否已存在
        if (configRepository.existsById(newId)) {
            throw new BusinessException("CONFIG_EXISTS", "目标配置已存在: " + newId);
        }
        
        // 复制配置
        Config newConfig = new Config();
        newConfig.setId(newId);
        newConfig.setSceneId(sourceConfig.getSceneId());
        newConfig.setSchemeVersion(sourceConfig.getSchemeVersion());
        newConfig.setConditionList(request.getToConditions());
        newConfig.setConfigData(sourceConfig.getConfigData().deepCopy());
        
        newConfig = configRepository.save(newConfig);
        
        log.info("Copied config from {} to {}", id, newId);
        return configMapper.toResponse(newConfig);
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

