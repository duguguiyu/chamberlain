package com.chamberlain.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * SpringDoc OpenAPI 配置
 */
@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI chamberlainOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Chamberlain Configuration API")
                .description("Chamberlain 配置管理系统 REST API")
                .version("0.1.0")
                .license(new License()
                    .name("MIT")
                    .url("https://opensource.org/licenses/MIT")))
            .servers(List.of(
                new Server()
                    .url("http://localhost:8080")
                    .description("本地开发环境"),
                new Server()
                    .url("/")
                    .description("当前环境")
            ));
    }
}

