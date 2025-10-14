package com.chamberlain.dto.request;

import com.chamberlain.entity.Config.Condition;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * 创建配置请求
 */
@Data
@Schema(description = "创建配置请求")
public class CreateConfigRequest {
    
    @NotBlank(message = "场景ID不能为空")
    @Schema(description = "场景ID")
    private String sceneId;
    
    @NotNull(message = "Scheme版本不能为空")
    @Min(value = 1, message = "版本号必须大于0")
    @Schema(description = "Scheme版本")
    private Integer schemeVersion;
    
    @JsonAlias({"conditionList", "conditions"})
    @Schema(description = "条件列表，空列表表示默认配置")
    private List<Condition> conditions = new ArrayList<>();
    
    @NotNull(message = "配置数据不能为空")
    @Schema(description = "配置数据，需符合对应 Scheme 的 JSON Schema")
    private JsonNode config;
}

