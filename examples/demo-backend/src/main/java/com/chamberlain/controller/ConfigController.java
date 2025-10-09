package com.chamberlain.controller;

import com.chamberlain.dto.common.ApiResponse;
import com.chamberlain.dto.common.PageResult;
import com.chamberlain.dto.request.CopyConfigRequest;
import com.chamberlain.dto.request.CreateConfigRequest;
import com.chamberlain.dto.request.UpdateConfigRequest;
import com.chamberlain.dto.response.ConfigResponse;
import com.chamberlain.service.ConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 配置管理控制器
 */
@RestController
@RequestMapping("/api/configs")
@Tag(name = "Configs", description = "配置管理接口")
@RequiredArgsConstructor
@Validated
public class ConfigController {
    
    private final ConfigService configService;
    
    @GetMapping
    @Operation(summary = "获取配置列表", description = "支持分页、按场景和版本过滤")
    public ApiResponse<PageResult<ConfigResponse>> list(
        @Parameter(description = "场景ID", required = true) @RequestParam String sceneId,
        @Parameter(description = "Scheme版本") @RequestParam(required = false) Integer schemeVersion,
        @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
        @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") Integer pageSize,
        @Parameter(description = "排序字段:排序方向") @RequestParam(required = false) String sort
    ) {
        return ApiResponse.success(configService.list(sceneId, schemeVersion, page, pageSize, sort));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "获取配置详情")
    public ApiResponse<ConfigResponse> getById(
        @Parameter(description = "配置ID") @PathVariable String id
    ) {
        return ApiResponse.success(configService.getById(id));
    }
    
    @PostMapping
    @Operation(summary = "创建配置")
    public ApiResponse<ConfigResponse> create(@Valid @RequestBody CreateConfigRequest request) {
        return ApiResponse.success(configService.create(request));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "更新配置")
    public ApiResponse<ConfigResponse> update(
        @Parameter(description = "配置ID") @PathVariable String id,
        @Valid @RequestBody UpdateConfigRequest request
    ) {
        return ApiResponse.success(configService.update(id, request));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "删除配置")
    public ApiResponse<Void> delete(@Parameter(description = "配置ID") @PathVariable String id) {
        configService.delete(id);
        return ApiResponse.success(null);
    }
    
    /**
     * 复制配置（Google API 风格的自定义方法）
     * 注意：Spring MVC 需要特殊处理冒号，这里使用 @PathVariable 来匹配整个路径
     */
    @PostMapping(value = {"/{id}:copy", "/{id}/copy"})
    @Operation(summary = "复制配置", description = "将配置复制到新的条件组合")
    public ApiResponse<ConfigResponse> copy(
        @Parameter(description = "配置ID") @PathVariable String id,
        @Valid @RequestBody CopyConfigRequest request
    ) {
        return ApiResponse.success(configService.copy(id, request));
    }
}

