package com.chamberlain.dto.request;

import com.chamberlain.entity.Config.Condition;
import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 更新配置请求
 */
@Data
@Schema(description = "更新配置请求")
public class UpdateConfigRequest {
    
    @Schema(description = "Scheme版本")
    private Integer schemeVersion;
    
    @Schema(description = "条件列表")
    private List<Condition> conditions;
    
    @Schema(description = "配置数据")
    private JsonNode config;
}

