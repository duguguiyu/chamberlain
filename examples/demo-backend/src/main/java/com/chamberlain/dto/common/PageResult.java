package com.chamberlain.dto.common;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 分页结果
 *
 * @param <T> 数据类型
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "分页结果")
public class PageResult<T> {
    
    @Schema(description = "数据列表")
    private List<T> list;
    
    @Schema(description = "总记录数")
    private Long total;
    
    @Schema(description = "当前页码", example = "1")
    private Integer page;
    
    @Schema(description = "每页大小", example = "10")
    private Integer pageSize;
}

