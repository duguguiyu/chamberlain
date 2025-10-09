package com.chamberlain.entity.converter;

import com.chamberlain.entity.Config.Condition;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

/**
 * Condition 列表转换器
 */
@Converter
@Slf4j
public class ConditionListConverter implements AttributeConverter<List<Condition>, String> {
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public String convertToDatabaseColumn(List<Condition> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            log.error("Error converting Condition list to JSON string", e);
            throw new IllegalArgumentException("Error converting Condition list to JSON", e);
        }
    }
    
    @Override
    public List<Condition> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return List.of();
        }
        try {
            // 处理 H2 数据库的双重转义问题
            String jsonData = dbData;
            if (dbData.startsWith("\"") && dbData.endsWith("\"")) {
                jsonData = objectMapper.readValue(dbData, String.class);
            }
            return objectMapper.readValue(jsonData, new TypeReference<List<Condition>>() {});
        } catch (JsonProcessingException e) {
            log.error("Error converting JSON string to Condition list: {}", dbData, e);
            throw new IllegalArgumentException("Error converting JSON to Condition list", e);
        }
    }
}

