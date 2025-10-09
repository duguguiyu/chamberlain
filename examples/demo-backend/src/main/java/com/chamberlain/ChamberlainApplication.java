package com.chamberlain;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Chamberlain 后端服务启动类
 */
@SpringBootApplication
@EnableJpaAuditing
public class ChamberlainApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(ChamberlainApplication.class, args);
    }
}

