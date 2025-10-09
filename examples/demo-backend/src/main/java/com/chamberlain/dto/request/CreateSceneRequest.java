package com.chamberlain.dto.request;

import com.chamberlain.entity.Scene.AvailableCondition;
import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.List;

/**
 * 创建场景请求
 */
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
    
    @Schema(description = "可用条件列表")
    private List<AvailableCondition> availableConditions;
    
    @NotNull(message = "JSON Schema 不能为空")
    @Schema(description = "JSON Schema 定义")
    private JsonNode schema;
}

