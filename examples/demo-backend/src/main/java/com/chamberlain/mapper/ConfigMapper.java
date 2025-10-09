package com.chamberlain.mapper;

import com.chamberlain.dto.request.CreateConfigRequest;
import com.chamberlain.dto.request.UpdateConfigRequest;
import com.chamberlain.dto.response.ConfigResponse;
import com.chamberlain.entity.Config;
import org.mapstruct.*;

import java.util.List;

/**
 * Config 实体与 DTO 转换器
 */
@Mapper(componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ConfigMapper {
    
    /**
     * CreateRequest -> Entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "conditionHash", ignore = true)
    @Mapping(source = "conditions", target = "conditionList")
    @Mapping(source = "config", target = "configData")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Config toEntity(CreateConfigRequest request);
    
    /**
     * Entity -> Response
     */
    @Mapping(source = "configData", target = "config")
    ConfigResponse toResponse(Config config);
    
    /**
     * Entity List -> Response List
     */
    List<ConfigResponse> toResponseList(List<Config> configs);
    
    /**
     * UpdateRequest -> Entity (更新现有实体)
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sceneId", ignore = true)
    @Mapping(target = "conditionHash", ignore = true)
    @Mapping(source = "conditions", target = "conditionList")
    @Mapping(source = "config", target = "configData")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntityFromRequest(UpdateConfigRequest request, @MappingTarget Config config);
}

