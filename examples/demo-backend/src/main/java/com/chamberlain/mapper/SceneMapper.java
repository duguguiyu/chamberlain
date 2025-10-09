package com.chamberlain.mapper;

import com.chamberlain.dto.request.CreateSceneRequest;
import com.chamberlain.dto.request.UpdateSceneRequest;
import com.chamberlain.dto.response.SceneResponse;
import com.chamberlain.dto.response.SchemeVersionResponse;
import com.chamberlain.entity.Scene;
import com.chamberlain.entity.SchemeVersion;
import org.mapstruct.*;

import java.util.List;

/**
 * Scene 实体与 DTO 转换器
 */
@Mapper(componentModel = "spring", 
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface SceneMapper {
    
    /**
     * CreateRequest -> Entity
     */
    @Mapping(target = "schemeVersions", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Scene toEntity(CreateSceneRequest request);
    
    /**
     * Entity -> Response
     */
    SceneResponse toResponse(Scene scene);
    
    /**
     * Entity List -> Response List
     */
    List<SceneResponse> toResponseList(List<Scene> scenes);
    
    /**
     * UpdateRequest -> Entity (更新现有实体)
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "currentSchemeVersion", ignore = true)
    @Mapping(target = "schemeVersions", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntityFromRequest(UpdateSceneRequest request, @MappingTarget Scene scene);
    
    /**
     * SchemeVersion Entity -> Response
     */
    @Mapping(source = "scene.id", target = "sceneId")
    SchemeVersionResponse toSchemeVersionResponse(SchemeVersion schemeVersion);
    
    /**
     * SchemeVersion Entity List -> Response List
     */
    List<SchemeVersionResponse> toSchemeVersionResponseList(List<SchemeVersion> schemeVersions);
}

