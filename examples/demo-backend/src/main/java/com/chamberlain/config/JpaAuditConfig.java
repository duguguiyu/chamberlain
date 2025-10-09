package com.chamberlain.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.Optional;

/**
 * JPA 审计配置
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class JpaAuditConfig {
    
    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            // TODO: 从 Security Context 或 Request Header 中获取当前用户
            // 现在返回固定值，实际项目中应该从认证上下文获取
            return Optional.of("system");
        };
    }
}

