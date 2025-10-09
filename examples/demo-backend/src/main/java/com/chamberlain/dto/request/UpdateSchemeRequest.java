package com.chamberlain.dto.request;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 更新 Scheme 请求（创建新版本）
 */
@Data
@Schema(description = "更新 Scheme 请求")
public class UpdateSchemeRequest {
    
    @NotNull(message = "JSON Schema 不能为空")
    @Schema(description = "新的 JSON Schema 定义")
    private JsonNode schema;
    
    @Schema(description = "变更说明")
    private String changeDescription;
}

