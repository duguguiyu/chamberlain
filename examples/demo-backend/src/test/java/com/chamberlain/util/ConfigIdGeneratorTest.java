package com.chamberlain.util;

import com.chamberlain.entity.Config.Condition;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ConfigIdGenerator 单元测试
 */
class ConfigIdGeneratorTest {
    
    @Test
    void testGenerateDefaultId() {
        String id = ConfigIdGenerator.generate("test_scene", List.of());
        assertEquals("test_scene:default", id);
    }
    
    @Test
    void testGenerateWithConditions() {
        List<Condition> conditions = new ArrayList<>();
        
        Condition c1 = new Condition();
        c1.setKey("environment");
        c1.setValue("production");
        conditions.add(c1);
        
        String id = ConfigIdGenerator.generate("test_scene", conditions);
        assertEquals("test_scene:environment:production", id);
    }
    
    @Test
    void testGenerateWithMultipleConditions() {
        List<Condition> conditions = new ArrayList<>();
        
        Condition c1 = new Condition();
        c1.setKey("region");
        c1.setValue("us-west");
        conditions.add(c1);
        
        Condition c2 = new Condition();
        c2.setKey("environment");
        c2.setValue("production");
        conditions.add(c2);
        
        // 应该按 key 排序
        String id = ConfigIdGenerator.generate("test_scene", conditions);
        assertEquals("test_scene:environment:production,region:us-west", id);
    }
    
    @Test
    void testIsValid() {
        assertTrue(ConfigIdGenerator.isValid("scene:default"));
        assertTrue(ConfigIdGenerator.isValid("scene:env:prod"));
        assertFalse(ConfigIdGenerator.isValid(""));
        assertFalse(ConfigIdGenerator.isValid(null));
        assertFalse(ConfigIdGenerator.isValid("invalid"));
    }
    
    @Test
    void testExtractSceneId() {
        assertEquals("test_scene", ConfigIdGenerator.extractSceneId("test_scene:default"));
        assertEquals("test_scene", ConfigIdGenerator.extractSceneId("test_scene:env:prod"));
    }
    
    @Test
    void testExtractSceneIdInvalid() {
        assertThrows(IllegalArgumentException.class, () -> 
            ConfigIdGenerator.extractSceneId("invalid"));
    }
}

