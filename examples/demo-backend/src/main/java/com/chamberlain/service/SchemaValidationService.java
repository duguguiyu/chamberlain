package com.chamberlain.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.networknt.schema.JsonSchema;
import com.networknt.schema.JsonSchemaFactory;
import com.networknt.schema.SpecVersion;
import com.networknt.schema.ValidationMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * JSON Schema 验证服务
 */
@Service
@Slf4j
public class SchemaValidationService {
    
    private final JsonSchemaFactory schemaFactory;
    
    public SchemaValidationService() {
        // 使用 JSON Schema Draft 2020-12
        this.schemaFactory = JsonSchemaFactory.getInstance(SpecVersion.VersionFlag.V202012);
    }
    
    /**
     * 验证 JSON Schema 本身是否有效
     *
     * @param schemaNode Schema 节点
     * @return 是否有效
     */
    public boolean isValidSchema(JsonNode schemaNode) {
        try {
            schemaFactory.getSchema(schemaNode);
            return true;
        } catch (Exception e) {
            log.error("Invalid JSON Schema: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * 使用 Schema 验证数据
     *
     * @param schemaNode Schema 节点
     * @param data       待验证数据
     * @return 验证结果
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
            
            log.debug("Validation failed with {} errors", errors.size());
            return ValidationResult.failure(errorMessages);
            
        } catch (Exception e) {
            log.error("Schema validation error", e);
            return ValidationResult.failure(List.of("Schema 验证失败: " + e.getMessage()));
        }
    }
    
    /**
     * 比较两个 Schema，检测是否为破坏性变更
     *
     * @param oldSchema 旧 Schema
     * @param newSchema 新 Schema
     * @return 是否为破坏性变更
     */
    public boolean isBreakingChange(JsonNode oldSchema, JsonNode newSchema) {
        // 检查字段删除或类型变更
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
                    log.debug("Breaking change detected: field '{}' removed", fieldName);
                    return true;
                }
                
                // 字段类型变更
                String oldType = oldField.path("type").asText("");
                String newType = newField.path("type").asText("");
                if (!oldType.isEmpty() && !oldType.equals(newType)) {
                    log.debug("Breaking change detected: field '{}' type changed from '{}' to '{}'",
                        fieldName, oldType, newType);
                    return true;
                }
            }
        }
        
        // 检查新增的必填字段
        Set<String> oldRequired = getRequiredFields(oldSchema);
        Set<String> newRequired = getRequiredFields(newSchema);
        
        for (String field : newRequired) {
            if (!oldRequired.contains(field)) {
                log.debug("Breaking change detected: new required field '{}'", field);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 比较两个 Schema，返回变更警告列表
     *
     * @param oldSchema 旧 Schema
     * @param newSchema 新 Schema
     * @return 警告列表
     */
    public List<String> compareSchemas(JsonNode oldSchema, JsonNode newSchema) {
        List<String> warnings = new ArrayList<>();
        
        // 检查删除的字段
        JsonNode oldProperties = oldSchema.path("properties");
        JsonNode newProperties = newSchema.path("properties");
        
        if (!oldProperties.isMissingNode() && !newProperties.isMissingNode()) {
            Iterator<String> fieldNames = oldProperties.fieldNames();
            while (fieldNames.hasNext()) {
                String fieldName = fieldNames.next();
                if (!newProperties.has(fieldName)) {
                    warnings.add(String.format("字段 '%s' 已被删除", fieldName));
                }
            }
            
            // 检查字段类型变更
            fieldNames = oldProperties.fieldNames();
            while (fieldNames.hasNext()) {
                String fieldName = fieldNames.next();
                if (newProperties.has(fieldName)) {
                    JsonNode oldField = oldProperties.get(fieldName);
                    JsonNode newField = newProperties.get(fieldName);
                    
                    String oldType = oldField.path("type").asText("");
                    String newType = newField.path("type").asText("");
                    
                    if (!oldType.isEmpty() && !oldType.equals(newType)) {
                        warnings.add(String.format("字段 '%s' 的类型从 '%s' 变更为 '%s'",
                            fieldName, oldType, newType));
                    }
                }
            }
        }
        
        // 检查新增的必填字段
        Set<String> oldRequired = getRequiredFields(oldSchema);
        Set<String> newRequired = getRequiredFields(newSchema);
        
        for (String field : newRequired) {
            if (!oldRequired.contains(field)) {
                warnings.add(String.format("字段 '%s' 被设置为必填", field));
            }
        }
        
        return warnings;
    }
    
    /**
     * 获取 Schema 中的必填字段
     */
    private Set<String> getRequiredFields(JsonNode schema) {
        Set<String> required = new HashSet<>();
        JsonNode requiredNode = schema.path("required");
        
        if (requiredNode.isArray()) {
            requiredNode.forEach(node -> required.add(node.asText()));
        }
        
        return required;
    }
    
    /**
     * 验证结果
     */
    public static class ValidationResult {
        private final boolean valid;
        private final List<String> errors;
        
        private ValidationResult(boolean valid, List<String> errors) {
            this.valid = valid;
            this.errors = errors;
        }
        
        public static ValidationResult success() {
            return new ValidationResult(true, List.of());
        }
        
        public static ValidationResult failure(List<String> errors) {
            return new ValidationResult(false, errors);
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public List<String> getErrors() {
            return errors;
        }
    }
}

