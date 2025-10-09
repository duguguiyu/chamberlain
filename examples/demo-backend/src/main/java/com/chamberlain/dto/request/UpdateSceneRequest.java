package com.chamberlain.dto.request;

import com.chamberlain.entity.Scene.AvailableCondition;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

/**
 * 更新场景请求
 */
@Data
@Schema(description = "更新场景请求")
public class UpdateSceneRequest {
    
    @NotBlank(message = "场景名称不能为空")
    @Schema(description = "场景名称")
    private String name;
    
    @Schema(description = "场景描述")
    private String description;
    
    @Schema(description = "可用条件列表")
    private List<AvailableCondition> availableConditions;
}

