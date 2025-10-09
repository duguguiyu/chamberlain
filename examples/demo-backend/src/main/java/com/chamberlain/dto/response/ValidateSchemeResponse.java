package com.chamberlain.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 验证 Scheme 响应
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "验证 Scheme 响应")
public class ValidateSchemeResponse {
    
    @Schema(description = "是否有效")
    private Boolean valid;
    
    @Schema(description = "警告信息列表")
    private List<String> warnings;
    
    @Schema(description = "是否为破坏性变更")
    private Boolean isBreakingChange;
}

