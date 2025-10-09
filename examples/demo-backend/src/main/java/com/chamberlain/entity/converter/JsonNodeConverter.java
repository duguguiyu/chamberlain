package com.chamberlain.entity.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

/**
 * JsonNode 类型转换器
 * 用于在实体类和数据库之间转换 Jackson JsonNode 对象
 */
@Converter
@Slf4j
public class JsonNodeConverter implements AttributeConverter<JsonNode, String> {
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public String convertToDatabaseColumn(JsonNode attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            log.error("Error converting JsonNode to JSON string", e);
            throw new IllegalArgumentException("Error converting JsonNode to JSON string", e);
        }
    }
    
    @Override
    public JsonNode convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readTree(dbData);
        } catch (JsonProcessingException e) {
            log.error("Error converting JSON string to JsonNode", e);
            throw new IllegalArgumentException("Error converting JSON string to JsonNode", e);
        }
    }
}

