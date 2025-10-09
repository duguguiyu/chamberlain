package com.chamberlain.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * SchemaValidationService 单元测试
 */
class SchemaValidationServiceTest {
    
    private SchemaValidationService service;
    private ObjectMapper objectMapper;
    
    @BeforeEach
    void setUp() {
        service = new SchemaValidationService();
        objectMapper = new ObjectMapper();
    }
    
    @Test
    void testIsValidSchema() {
        ObjectNode validSchema = objectMapper.createObjectNode();
        validSchema.put("type", "object");
        ObjectNode properties = objectMapper.createObjectNode();
        ObjectNode field = objectMapper.createObjectNode();
        field.put("type", "string");
        properties.set("name", field);
        validSchema.set("properties", properties);
        
        assertTrue(service.isValidSchema(validSchema));
    }
    
    @Test
    void testValidateSuccess() {
        // 创建 Schema
        ObjectNode schema = objectMapper.createObjectNode();
        schema.put("type", "object");
        ObjectNode properties = objectMapper.createObjectNode();
        ObjectNode nameField = objectMapper.createObjectNode();
        nameField.put("type", "string");
        properties.set("name", nameField);
        schema.set("properties", properties);
        
        // 创建符合 Schema 的数据
        ObjectNode data = objectMapper.createObjectNode();
        data.put("name", "test");
        
        var result = service.validate(schema, data);
        assertTrue(result.isValid());
        assertTrue(result.getErrors().isEmpty());
    }
    
    @Test
    void testValidateFailure() {
        // 创建 Schema
        ObjectNode schema = objectMapper.createObjectNode();
        schema.put("type", "object");
        ObjectNode properties = objectMapper.createObjectNode();
        ObjectNode ageField = objectMapper.createObjectNode();
        ageField.put("type", "integer");
        properties.set("age", ageField);
        schema.set("properties", properties);
        
        // 创建不符合 Schema 的数据（age 应该是 integer 但给了 string）
        ObjectNode data = objectMapper.createObjectNode();
        data.put("age", "not a number");
        
        var result = service.validate(schema, data);
        assertFalse(result.isValid());
        assertFalse(result.getErrors().isEmpty());
    }
    
    @Test
    void testIsBreakingChangeFieldRemoved() {
        ObjectMapper mapper = new ObjectMapper();
        
        // 旧 Schema 有 field1
        ObjectNode oldSchema = mapper.createObjectNode();
        oldSchema.put("type", "object");
        ObjectNode oldProperties = mapper.createObjectNode();
        ObjectNode field1 = mapper.createObjectNode();
        field1.put("type", "string");
        oldProperties.set("field1", field1);
        oldSchema.set("properties", oldProperties);
        
        // 新 Schema 删除了 field1
        ObjectNode newSchema = mapper.createObjectNode();
        newSchema.put("type", "object");
        ObjectNode newProperties = mapper.createObjectNode();
        newSchema.set("properties", newProperties);
        
        assertTrue(service.isBreakingChange(oldSchema, newSchema));
    }
    
    @Test
    void testIsBreakingChangeTypeChanged() {
        ObjectMapper mapper = new ObjectMapper();
        
        // 旧 Schema field1 是 string
        ObjectNode oldSchema = mapper.createObjectNode();
        oldSchema.put("type", "object");
        ObjectNode oldProperties = mapper.createObjectNode();
        ObjectNode oldField = mapper.createObjectNode();
        oldField.put("type", "string");
        oldProperties.set("field1", oldField);
        oldSchema.set("properties", oldProperties);
        
        // 新 Schema field1 变成 integer
        ObjectNode newSchema = mapper.createObjectNode();
        newSchema.put("type", "object");
        ObjectNode newProperties = mapper.createObjectNode();
        ObjectNode newField = mapper.createObjectNode();
        newField.put("type", "integer");
        newProperties.set("field1", newField);
        newSchema.set("properties", newProperties);
        
        assertTrue(service.isBreakingChange(oldSchema, newSchema));
    }
    
    @Test
    void testIsNotBreakingChangeFieldAdded() {
        ObjectMapper mapper = new ObjectMapper();
        
        // 旧 Schema 只有 field1
        ObjectNode oldSchema = mapper.createObjectNode();
        oldSchema.put("type", "object");
        ObjectNode oldProperties = mapper.createObjectNode();
        ObjectNode field1 = mapper.createObjectNode();
        field1.put("type", "string");
        oldProperties.set("field1", field1);
        oldSchema.set("properties", oldProperties);
        
        // 新 Schema 添加了 field2
        ObjectNode newSchema = mapper.createObjectNode();
        newSchema.put("type", "object");
        ObjectNode newProperties = mapper.createObjectNode();
        ObjectNode newField1 = mapper.createObjectNode();
        newField1.put("type", "string");
        newProperties.set("field1", newField1);
        ObjectNode newField2 = mapper.createObjectNode();
        newField2.put("type", "string");
        newProperties.set("field2", newField2);
        newSchema.set("properties", newProperties);
        
        // 添加可选字段不是破坏性变更
        assertFalse(service.isBreakingChange(oldSchema, newSchema));
    }
}

