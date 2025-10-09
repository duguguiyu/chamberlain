package com.chamberlain.exception;

import lombok.Getter;

/**
 * 资源未找到异常
 */
@Getter
public class ResourceNotFoundException extends RuntimeException {
    
    private final String code;
    
    public ResourceNotFoundException(String code, String message) {
        super(message);
        this.code = code;
    }
}

