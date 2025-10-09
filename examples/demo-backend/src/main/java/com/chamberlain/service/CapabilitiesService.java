package com.chamberlain.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * 服务能力服务
 */
@Service
@Slf4j
public class CapabilitiesService {
    
    @Value("${chamberlain.capabilities.scenes.search:true}")
    private Boolean scenesSearch;
    
    @Value("${chamberlain.capabilities.scenes.sort:true}")
    private Boolean scenesSort;
    
    @Value("${chamberlain.capabilities.configs.search:true}")
    private Boolean configsSearch;
    
    @Value("${chamberlain.capabilities.configs.sort:true}")
    private Boolean configsSort;
    
    @Value("${chamberlain.capabilities.configs.filter:true}")
    private Boolean configsFilter;
    
    /**
     * 获取服务能力列表
     *
     * @return 能力映射
     */
    public Map<String, Boolean> getCapabilities() {
        Map<String, Boolean> capabilities = new HashMap<>();
        capabilities.put("scenes.search", scenesSearch);
        capabilities.put("scenes.sort", scenesSort);
        capabilities.put("configs.search", configsSearch);
        capabilities.put("configs.sort", configsSort);
        capabilities.put("configs.filter", configsFilter);
        
        log.debug("Returning capabilities: {}", capabilities);
        return capabilities;
    }
}

