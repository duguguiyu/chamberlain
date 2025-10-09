package com.chamberlain.exception;

import lombok.Getter;

/**
 * 验证异常
 */
@Getter
public class ValidationException extends RuntimeException {
    
    private final String code;
    
    public ValidationException(String code, String message) {
        super(message);
        this.code = code;
    }
    
    public ValidationException(String code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }
}

