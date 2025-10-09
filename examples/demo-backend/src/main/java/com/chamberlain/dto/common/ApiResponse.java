package com.chamberlain.dto.common;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 统一 API 响应格式
 *
 * @param <T> 数据类型
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "统一响应格式")
public class ApiResponse<T> {
    
    @Schema(description = "是否成功", example = "true")
    private Boolean success;
    
    @Schema(description = "响应数据")
    private T data;
    
    @Schema(description = "错误码")
    private String code;
    
    @Schema(description = "错误消息")
    private String message;
    
    /**
     * 成功响应
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null, null);
    }
    
    /**
     * 失败响应
     */
    public static <T> ApiResponse<T> error(String code, String message) {
        return new ApiResponse<>(false, null, code, message);
    }
}

