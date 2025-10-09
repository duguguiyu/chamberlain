package com.chamberlain.entity.converter;

import com.chamberlain.entity.Scene.AvailableCondition;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

/**
 * AvailableCondition 列表转换器
 */
@Converter
@Slf4j
public class AvailableConditionListConverter implements AttributeConverter<List<AvailableCondition>, String> {
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public String convertToDatabaseColumn(List<AvailableCondition> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            log.error("Error converting AvailableCondition list to JSON string", e);
            throw new IllegalArgumentException("Error converting AvailableCondition list to JSON", e);
        }
    }
    
    @Override
    public List<AvailableCondition> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        try {
            // 处理 H2 数据库的双重转义问题
            String jsonData = dbData;
            if (dbData.startsWith("\"") && dbData.endsWith("\"")) {
                jsonData = objectMapper.readValue(dbData, String.class);
            }
            return objectMapper.readValue(jsonData, new TypeReference<List<AvailableCondition>>() {});
        } catch (JsonProcessingException e) {
            log.error("Error converting JSON string to AvailableCondition list: {}", dbData, e);
            throw new IllegalArgumentException("Error converting JSON to AvailableCondition list", e);
        }
    }
}

