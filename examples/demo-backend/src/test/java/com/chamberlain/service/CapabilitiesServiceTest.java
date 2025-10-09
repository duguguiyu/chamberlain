package com.chamberlain.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * CapabilitiesService 单元测试
 */
class CapabilitiesServiceTest {
    
    private CapabilitiesService capabilitiesService;
    
    @BeforeEach
    void setUp() {
        capabilitiesService = new CapabilitiesService();
    }
    
    @Test
    void testGetCapabilities() {
        Map<String, Boolean> capabilities = capabilitiesService.getCapabilities();
        
        assertNotNull(capabilities);
        assertTrue(capabilities.containsKey("scenes.search"));
        assertTrue(capabilities.containsKey("scenes.sort"));
        assertTrue(capabilities.containsKey("configs.search"));
        assertTrue(capabilities.containsKey("configs.sort"));
        assertTrue(capabilities.containsKey("configs.filter"));
    }
}

