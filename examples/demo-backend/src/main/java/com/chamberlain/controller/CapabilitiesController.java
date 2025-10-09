package com.chamberlain.controller;

import com.chamberlain.dto.common.ApiResponse;
import com.chamberlain.service.CapabilitiesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 服务能力控制器
 */
@RestController
@RequestMapping("/api/capabilities")
@Tag(name = "Capabilities", description = "服务能力接口")
@RequiredArgsConstructor
public class CapabilitiesController {
    
    private final CapabilitiesService capabilitiesService;
    
    @GetMapping
    @Operation(summary = "获取服务能力", description = "返回当前服务支持的能力列表，前端组件根据此接口动态调整 UI")
    public ApiResponse<Map<String, Boolean>> getCapabilities() {
        return ApiResponse.success(capabilitiesService.getCapabilities());
    }
}

