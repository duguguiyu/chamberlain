package com.chamberlain.dto.response;

import com.chamberlain.entity.Config.Condition;
import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 配置响应
 */
@Data
@Schema(description = "配置响应")
public class ConfigResponse {
    
    @Schema(description = "配置ID")
    private String id;
    
    @Schema(description = "场景ID")
    private String sceneId;
    
    @Schema(description = "Scheme版本")
    private Integer schemeVersion;
    
    @Schema(description = "条件列表")
    private List<Condition> conditionList;
    
    @Schema(description = "配置数据")
    private JsonNode config;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
    
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
    
    @Schema(description = "创建人")
    private String createdBy;
    
    @Schema(description = "更新人")
    private String updatedBy;
}

