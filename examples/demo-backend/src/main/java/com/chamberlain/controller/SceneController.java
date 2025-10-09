package com.chamberlain.controller;

import com.chamberlain.dto.common.ApiResponse;
import com.chamberlain.dto.common.PageResult;
import com.chamberlain.dto.request.CreateSceneRequest;
import com.chamberlain.dto.request.UpdateSceneRequest;
import com.chamberlain.dto.request.UpdateSchemeRequest;
import com.chamberlain.dto.request.ValidateSchemeRequest;
import com.chamberlain.dto.response.SceneResponse;
import com.chamberlain.dto.response.SchemeVersionResponse;
import com.chamberlain.dto.response.ValidateSchemeResponse;
import com.chamberlain.service.SceneService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 场景管理控制器
 */
@RestController
@RequestMapping("/api/scenes")
@Tag(name = "Scenes", description = "场景管理接口")
@RequiredArgsConstructor
@Validated
public class SceneController {
    
    private final SceneService sceneService;
    
    @GetMapping
    @Operation(summary = "获取场景列表", description = "支持分页、搜索和排序")
    public ApiResponse<PageResult<SceneResponse>> list(
        @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
        @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") Integer pageSize,
        @Parameter(description = "搜索关键词") @RequestParam(required = false) String keyword,
        @Parameter(description = "排序字段:排序方向") @RequestParam(required = false) String sort
    ) {
        return ApiResponse.success(sceneService.list(page, pageSize, keyword, sort));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "获取场景详情")
    public ApiResponse<SceneResponse> getById(
        @Parameter(description = "场景ID") 
        @PathVariable @Pattern(regexp = "^[a-z0-9_]+$", message = "场景ID格式不正确") String id
    ) {
        return ApiResponse.success(sceneService.getById(id));
    }
    
    @PostMapping
    @Operation(summary = "创建场景")
    public ApiResponse<SceneResponse> create(@Valid @RequestBody CreateSceneRequest request) {
        return ApiResponse.success(sceneService.create(request));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "更新场景")
    public ApiResponse<SceneResponse> update(
        @Parameter(description = "场景ID") @PathVariable String id,
        @Valid @RequestBody UpdateSceneRequest request
    ) {
        return ApiResponse.success(sceneService.update(id, request));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "删除场景")
    public ApiResponse<Void> delete(@Parameter(description = "场景ID") @PathVariable String id) {
        sceneService.delete(id);
        return ApiResponse.success(null);
    }
    
    @PostMapping("/{id}/schemes:validate")
    @Operation(summary = "验证 JSON Schema", description = "验证新 Schema 的有效性并检测破坏性变更")
    public ApiResponse<ValidateSchemeResponse> validateScheme(
        @Parameter(description = "场景ID") @PathVariable String id,
        @Valid @RequestBody ValidateSchemeRequest request
    ) {
        return ApiResponse.success(sceneService.validateScheme(id, request));
    }
    
    @PostMapping("/{id}/schemes")
    @Operation(summary = "更新场景 Scheme", description = "创建新的 Scheme 版本")
    public ApiResponse<SchemeVersionResponse> updateScheme(
        @Parameter(description = "场景ID") @PathVariable String id,
        @Valid @RequestBody UpdateSchemeRequest request
    ) {
        return ApiResponse.success(sceneService.updateScheme(id, request));
    }
    
    @GetMapping("/{id}/schemes")
    @Operation(summary = "获取场景的所有 Scheme 版本")
    public ApiResponse<List<SchemeVersionResponse>> getSchemeVersions(
        @Parameter(description = "场景ID") @PathVariable String id
    ) {
        return ApiResponse.success(sceneService.getSchemeVersions(id));
    }
}

