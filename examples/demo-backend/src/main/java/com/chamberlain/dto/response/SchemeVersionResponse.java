package com.chamberlain.dto.response;

import com.chamberlain.entity.SchemeVersion.SchemeStatus;
import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Scheme 版本响应
 */
@Data
@Schema(description = "Scheme 版本响应")
public class SchemeVersionResponse {
    
    @Schema(description = "ID")
    private Long id;
    
    @Schema(description = "场景ID")
    private String sceneId;
    
    @Schema(description = "版本号")
    private Integer version;
    
    @Schema(description = "JSON Schema 定义")
    private JsonNode schemaJson;
    
    @Schema(description = "状态")
    private SchemeStatus status;
    
    @Schema(description = "变更说明")
    private String changeDescription;
    
    @Schema(description = "是否为破坏性变更")
    private Boolean isBreakingChange;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
    
    @Schema(description = "创建人")
    private String createdBy;
}

