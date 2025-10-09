package com.chamberlain.dto.request;

import com.chamberlain.entity.Config.Condition;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * 复制配置请求
 */
@Data
@Schema(description = "复制配置请求")
public class CopyConfigRequest {
    
    @NotNull(message = "目标条件不能为空")
    @Schema(description = "目标条件列表")
    private List<Condition> toConditions;
}

