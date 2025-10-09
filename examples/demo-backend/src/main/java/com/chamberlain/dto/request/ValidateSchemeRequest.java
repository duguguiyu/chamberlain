package com.chamberlain.dto.request;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 验证 Scheme 请求
 */
@Data
@Schema(description = "验证 Scheme 请求")
public class ValidateSchemeRequest {
    
    @NotNull(message = "JSON Schema 不能为空")
    @Schema(description = "待验证的 JSON Schema")
    private JsonNode schema;
}

