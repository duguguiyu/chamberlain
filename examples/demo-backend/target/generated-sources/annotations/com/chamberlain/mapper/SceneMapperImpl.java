package com.chamberlain.mapper;

import com.chamberlain.dto.request.CreateSceneRequest;
import com.chamberlain.dto.request.UpdateSceneRequest;
import com.chamberlain.dto.response.SceneResponse;
import com.chamberlain.dto.response.SchemeVersionResponse;
import com.chamberlain.entity.Scene;
import com.chamberlain.entity.SchemeVersion;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-11T13:50:53+0800",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251001-1143, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class SceneMapperImpl implements SceneMapper {

    @Override
    public Scene toEntity(CreateSceneRequest request) {
        if ( request == null ) {
            return null;
        }

        Scene scene = new Scene();

        List<Scene.AvailableCondition> list = request.getAvailableConditions();
        if ( list != null ) {
            scene.setAvailableConditions( new ArrayList<Scene.AvailableCondition>( list ) );
        }
        scene.setDescription( request.getDescription() );
        scene.setId( request.getId() );
        scene.setName( request.getName() );

        return scene;
    }

    @Override
    public SceneResponse toResponse(Scene scene) {
        if ( scene == null ) {
            return null;
        }

        SceneResponse sceneResponse = new SceneResponse();

        List<Scene.AvailableCondition> list = scene.getAvailableConditions();
        if ( list != null ) {
            sceneResponse.setAvailableConditions( new ArrayList<Scene.AvailableCondition>( list ) );
        }
        sceneResponse.setConditionConflictStrategy( scene.getConditionConflictStrategy() );
        sceneResponse.setCreatedAt( scene.getCreatedAt() );
        sceneResponse.setCreatedBy( scene.getCreatedBy() );
        sceneResponse.setCurrentSchemeVersion( scene.getCurrentSchemeVersion() );
        sceneResponse.setDescription( scene.getDescription() );
        sceneResponse.setId( scene.getId() );
        sceneResponse.setName( scene.getName() );
        sceneResponse.setUpdatedAt( scene.getUpdatedAt() );
        sceneResponse.setUpdatedBy( scene.getUpdatedBy() );

        return sceneResponse;
    }

    @Override
    public List<SceneResponse> toResponseList(List<Scene> scenes) {
        if ( scenes == null ) {
            return null;
        }

        List<SceneResponse> list = new ArrayList<SceneResponse>( scenes.size() );
        for ( Scene scene : scenes ) {
            list.add( toResponse( scene ) );
        }

        return list;
    }

    @Override
    public void updateEntityFromRequest(UpdateSceneRequest request, Scene scene) {
        if ( request == null ) {
            return;
        }

        if ( scene.getAvailableConditions() != null ) {
            List<Scene.AvailableCondition> list = request.getAvailableConditions();
            if ( list != null ) {
                scene.getAvailableConditions().clear();
                scene.getAvailableConditions().addAll( list );
            }
        }
        else {
            List<Scene.AvailableCondition> list = request.getAvailableConditions();
            if ( list != null ) {
                scene.setAvailableConditions( new ArrayList<Scene.AvailableCondition>( list ) );
            }
        }
        if ( request.getDescription() != null ) {
            scene.setDescription( request.getDescription() );
        }
        if ( request.getName() != null ) {
            scene.setName( request.getName() );
        }
    }

    @Override
    public SchemeVersionResponse toSchemeVersionResponse(SchemeVersion schemeVersion) {
        if ( schemeVersion == null ) {
            return null;
        }

        SchemeVersionResponse schemeVersionResponse = new SchemeVersionResponse();

        schemeVersionResponse.setSceneId( schemeVersionSceneId( schemeVersion ) );
        schemeVersionResponse.setChangeDescription( schemeVersion.getChangeDescription() );
        schemeVersionResponse.setCreatedAt( schemeVersion.getCreatedAt() );
        schemeVersionResponse.setCreatedBy( schemeVersion.getCreatedBy() );
        schemeVersionResponse.setId( schemeVersion.getId() );
        schemeVersionResponse.setIsBreakingChange( schemeVersion.getIsBreakingChange() );
        schemeVersionResponse.setSchemaJson( schemeVersion.getSchemaJson() );
        schemeVersionResponse.setStatus( schemeVersion.getStatus() );
        schemeVersionResponse.setVersion( schemeVersion.getVersion() );

        return schemeVersionResponse;
    }

    @Override
    public List<SchemeVersionResponse> toSchemeVersionResponseList(List<SchemeVersion> schemeVersions) {
        if ( schemeVersions == null ) {
            return null;
        }

        List<SchemeVersionResponse> list = new ArrayList<SchemeVersionResponse>( schemeVersions.size() );
        for ( SchemeVersion schemeVersion : schemeVersions ) {
            list.add( toSchemeVersionResponse( schemeVersion ) );
        }

        return list;
    }

    private String schemeVersionSceneId(SchemeVersion schemeVersion) {
        if ( schemeVersion == null ) {
            return null;
        }
        Scene scene = schemeVersion.getScene();
        if ( scene == null ) {
            return null;
        }
        String id = scene.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
