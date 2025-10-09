package com.chamberlain.repository;

import com.chamberlain.entity.Config;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 配置数据访问接口
 */
@Repository
public interface ConfigRepository extends JpaRepository<Config, String>, JpaSpecificationExecutor<Config> {
    
    /**
     * 根据场景 ID 查询所有配置
     *
     * @param sceneId 场景 ID
     * @return 配置列表
     */
    List<Config> findBySceneId(String sceneId);
    
    /**
     * 根据场景 ID 和 Scheme 版本查询配置
     *
     * @param sceneId       场景 ID
     * @param schemeVersion Scheme 版本
     * @return 配置列表
     */
    List<Config> findBySceneIdAndSchemeVersion(String sceneId, Integer schemeVersion);
    
    /**
     * 根据条件哈希查询配置
     *
     * @param sceneId       场景 ID
     * @param conditionHash 条件哈希
     * @return 配置列表
     */
    List<Config> findBySceneIdAndConditionHash(String sceneId, String conditionHash);
    
    /**
     * 统计场景下的配置数量
     *
     * @param sceneId 场景 ID
     * @return 配置数量
     */
    long countBySceneId(String sceneId);
    
    /**
     * 统计场景指定版本的配置数量
     *
     * @param sceneId       场景 ID
     * @param schemeVersion Scheme 版本
     * @return 配置数量
     */
    long countBySceneIdAndSchemeVersion(String sceneId, Integer schemeVersion);
    
    /**
     * 删除场景的所有配置
     *
     * @param sceneId 场景 ID
     */
    void deleteBySceneId(String sceneId);
}

