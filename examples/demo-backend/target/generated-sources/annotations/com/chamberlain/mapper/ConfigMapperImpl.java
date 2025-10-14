package com.chamberlain.mapper;

import com.chamberlain.dto.request.CreateConfigRequest;
import com.chamberlain.dto.request.UpdateConfigRequest;
import com.chamberlain.dto.response.ConfigResponse;
import com.chamberlain.entity.Config;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-14T15:09:03+0800",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.16 (Homebrew)"
)
@Component
public class ConfigMapperImpl implements ConfigMapper {

    @Override
    public Config toEntity(CreateConfigRequest request) {
        if ( request == null ) {
            return null;
        }

        Config config = new Config();

        List<Config.Condition> list = request.getConditions();
        if ( list != null ) {
            config.setConditionList( new ArrayList<Config.Condition>( list ) );
        }
        config.setConfigData( request.getConfig() );
        config.setSceneId( request.getSceneId() );
        config.setSchemeVersion( request.getSchemeVersion() );

        return config;
    }

    @Override
    public ConfigResponse toResponse(Config config) {
        if ( config == null ) {
            return null;
        }

        ConfigResponse configResponse = new ConfigResponse();

        configResponse.setConfig( config.getConfigData() );
        configResponse.setId( config.getId() );
        configResponse.setSceneId( config.getSceneId() );
        configResponse.setSchemeVersion( config.getSchemeVersion() );
        List<Config.Condition> list = config.getConditionList();
        if ( list != null ) {
            configResponse.setConditionList( new ArrayList<Config.Condition>( list ) );
        }
        configResponse.setCreatedAt( config.getCreatedAt() );
        configResponse.setUpdatedAt( config.getUpdatedAt() );
        configResponse.setCreatedBy( config.getCreatedBy() );
        configResponse.setUpdatedBy( config.getUpdatedBy() );

        return configResponse;
    }

    @Override
    public List<ConfigResponse> toResponseList(List<Config> configs) {
        if ( configs == null ) {
            return null;
        }

        List<ConfigResponse> list = new ArrayList<ConfigResponse>( configs.size() );
        for ( Config config : configs ) {
            list.add( toResponse( config ) );
        }

        return list;
    }

    @Override
    public void updateEntityFromRequest(UpdateConfigRequest request, Config config) {
        if ( request == null ) {
            return;
        }

        if ( config.getConditionList() != null ) {
            List<Config.Condition> list = request.getConditions();
            if ( list != null ) {
                config.getConditionList().clear();
                config.getConditionList().addAll( list );
            }
        }
        else {
            List<Config.Condition> list = request.getConditions();
            if ( list != null ) {
                config.setConditionList( new ArrayList<Config.Condition>( list ) );
            }
        }
        if ( request.getConfig() != null ) {
            config.setConfigData( request.getConfig() );
        }
        if ( request.getSchemeVersion() != null ) {
            config.setSchemeVersion( request.getSchemeVersion() );
        }
    }
}
