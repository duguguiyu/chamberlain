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
    date = "2025-10-09T23:51:31+0800",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.16 (Homebrew)"
)
@Component
public class SceneMapperImpl implements SceneMapper {

    @Override
    public Scene toEntity(CreateSceneRequest request) {
        if ( request == null ) {
            return null;
        }

        Scene scene = new Scene();

        scene.setId( request.getId() );
        scene.setName( request.getName() );
        scene.setDescription( request.getDescription() );
        List<Scene.AvailableCondition> list = request.getAvailableConditions();
        if ( list != null ) {
            scene.setAvailableConditions( new ArrayList<Scene.AvailableCondition>( list ) );
        }

        return scene;
    }

    @Override
    public SceneResponse toResponse(Scene scene) {
        if ( scene == null ) {
            return null;
        }

        SceneResponse sceneResponse = new SceneResponse();

        sceneResponse.setId( scene.getId() );
        sceneResponse.setName( scene.getName() );
        sceneResponse.setDescription( scene.getDescription() );
        List<Scene.AvailableCondition> list = scene.getAvailableConditions();
        if ( list != null ) {
            sceneResponse.setAvailableConditions( new ArrayList<Scene.AvailableCondition>( list ) );
        }
        sceneResponse.setConditionConflictStrategy( scene.getConditionConflictStrategy() );
        sceneResponse.setCurrentSchemeVersion( scene.getCurrentSchemeVersion() );
        sceneResponse.setCreatedAt( scene.getCreatedAt() );
        sceneResponse.setUpdatedAt( scene.getUpdatedAt() );
        sceneResponse.setCreatedBy( scene.getCreatedBy() );
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

        if ( request.getName() != null ) {
            scene.setName( request.getName() );
        }
        if ( request.getDescription() != null ) {
            scene.setDescription( request.getDescription() );
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
    }

    @Override
    public SchemeVersionResponse toSchemeVersionResponse(SchemeVersion schemeVersion) {
        if ( schemeVersion == null ) {
            return null;
        }

        SchemeVersionResponse schemeVersionResponse = new SchemeVersionResponse();

        schemeVersionResponse.setSceneId( schemeVersionSceneId( schemeVersion ) );
        schemeVersionResponse.setId( schemeVersion.getId() );
        schemeVersionResponse.setVersion( schemeVersion.getVersion() );
        schemeVersionResponse.setSchemaJson( schemeVersion.getSchemaJson() );
        schemeVersionResponse.setStatus( schemeVersion.getStatus() );
        schemeVersionResponse.setChangeDescription( schemeVersion.getChangeDescription() );
        schemeVersionResponse.setIsBreakingChange( schemeVersion.getIsBreakingChange() );
        schemeVersionResponse.setCreatedAt( schemeVersion.getCreatedAt() );
        schemeVersionResponse.setCreatedBy( schemeVersion.getCreatedBy() );

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
