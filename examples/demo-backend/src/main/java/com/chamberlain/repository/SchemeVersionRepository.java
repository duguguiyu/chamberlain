package com.chamberlain.repository;

import com.chamberlain.entity.SchemeVersion;
import com.chamberlain.entity.SchemeVersion.SchemeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Scheme 版本数据访问接口
 */
@Repository
public interface SchemeVersionRepository extends JpaRepository<SchemeVersion, Long> {
    
    /**
     * 根据场景 ID 和版本号查询
     *
     * @param sceneId 场景 ID
     * @param version 版本号
     * @return Scheme 版本
     */
    @Query("SELECT sv FROM SchemeVersion sv WHERE sv.scene.id = :sceneId AND sv.version = :version")
    Optional<SchemeVersion> findBySceneIdAndVersion(@Param("sceneId") String sceneId, @Param("version") Integer version);
    
    /**
     * 查询场景的所有版本
     *
     * @param sceneId 场景 ID
     * @return Scheme 版本列表
     */
    @Query("SELECT sv FROM SchemeVersion sv WHERE sv.scene.id = :sceneId ORDER BY sv.version DESC")
    List<SchemeVersion> findBySceneIdOrderByVersionDesc(@Param("sceneId") String sceneId);
    
    /**
     * 查询场景的最大版本号
     *
     * @param sceneId 场景 ID
     * @return 最大版本号
     */
    @Query("SELECT MAX(sv.version) FROM SchemeVersion sv WHERE sv.scene.id = :sceneId")
    Optional<Integer> findMaxVersionBySceneId(@Param("sceneId") String sceneId);
    
    /**
     * 根据状态查询 Scheme 版本
     *
     * @param sceneId 场景 ID
     * @param status  状态
     * @return Scheme 版本列表
     */
    @Query("SELECT sv FROM SchemeVersion sv WHERE sv.scene.id = :sceneId AND sv.status = :status ORDER BY sv.version DESC")
    List<SchemeVersion> findBySceneIdAndStatus(@Param("sceneId") String sceneId, @Param("status") SchemeStatus status);
}

