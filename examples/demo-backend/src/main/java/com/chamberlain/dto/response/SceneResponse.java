package com.chamberlain.dto.response;

import com.chamberlain.entity.Scene.AvailableCondition;
import com.chamberlain.entity.Scene.ConflictStrategy;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 场景响应
 */
@Data
@Schema(description = "场景响应")
public class SceneResponse {
    
    @Schema(description = "场景ID")
    private String id;
    
    @Schema(description = "场景名称")
    private String name;
    
    @Schema(description = "场景描述")
    private String description;
    
    @Schema(description = "可用条件列表")
    private List<AvailableCondition> availableConditions;
    
    @Schema(description = "条件冲突策略")
    private ConflictStrategy conditionConflictStrategy;
    
    @Schema(description = "当前激活的 Scheme 版本")
    private Integer currentSchemeVersion;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
    
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
    
    @Schema(description = "创建人")
    private String createdBy;
    
    @Schema(description = "更新人")
    private String updatedBy;
}

