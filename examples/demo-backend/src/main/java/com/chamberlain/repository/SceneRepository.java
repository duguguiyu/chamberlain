package com.chamberlain.repository;

import com.chamberlain.entity.Scene;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 场景数据访问接口
 */
@Repository
public interface SceneRepository extends JpaRepository<Scene, String>, JpaSpecificationExecutor<Scene> {
    
    /**
     * 根据名称查询场景
     *
     * @param name 场景名称
     * @return 场景
     */
    Optional<Scene> findByName(String name);
    
    /**
     * 根据名称查询场景（排除指定 ID）
     * 用于更新时检查名称重复
     *
     * @param name 场景名称
     * @param id   排除的场景 ID
     * @return 场景
     */
    Optional<Scene> findByNameAndIdNot(String name, String id);
}

