/**
 * 请求拦截器功能测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { ChamberlainClient } from '../src/services/ChamberlainClient';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('RequestInterceptor', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup axios.create mock
    const mockAxiosInstance = {
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };
    
    mockedAxios.create = vi.fn(() => mockAxiosInstance);
  });

  it('should register request interceptor when provided', () => {
    const requestInterceptor = vi.fn((config) => config);
    
    const client = new ChamberlainClient({
      endpoint: 'http://localhost:8080/api',
      requestInterceptor,
    });

    // Verify that axios.create was called
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:8080/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Get the axios instance
    const axiosInstance = mockedAxios.create.mock.results[0].value;

    // Verify that request interceptor was registered
    expect(axiosInstance.interceptors.request.use).toHaveBeenCalledWith(
      requestInterceptor,
      expect.any(Function)
    );
  });

  it('should not register request interceptor when not provided', () => {
    const client = new ChamberlainClient({
      endpoint: 'http://localhost:8080/api',
    });

    const axiosInstance = mockedAxios.create.mock.results[0].value;

    // Verify that request interceptor was not registered
    expect(axiosInstance.interceptors.request.use).not.toHaveBeenCalled();
  });

  it('should register response interceptor in all cases', () => {
    const client = new ChamberlainClient({
      endpoint: 'http://localhost:8080/api',
    });

    const axiosInstance = mockedAxios.create.mock.results[0].value;

    // Verify that response interceptor was registered
    expect(axiosInstance.interceptors.response.use).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function)
    );
  });

  it('should accept async request interceptor', () => {
    const asyncRequestInterceptor = vi.fn(async (config) => {
      // Simulate async token retrieval
      await new Promise(resolve => setTimeout(resolve, 10));
      config.headers.Authorization = 'Bearer token';
      return config;
    });
    
    const client = new ChamberlainClient({
      endpoint: 'http://localhost:8080/api',
      requestInterceptor: asyncRequestInterceptor,
    });

    const axiosInstance = mockedAxios.create.mock.results[0].value;

    // Verify that async request interceptor was registered
    expect(axiosInstance.interceptors.request.use).toHaveBeenCalledWith(
      asyncRequestInterceptor,
      expect.any(Function)
    );
  });

  it('should merge static headers with requestInterceptor', () => {
    const client = new ChamberlainClient({
      endpoint: 'http://localhost:8080/api',
      headers: {
        'X-Custom-Header': 'static-value',
      },
      requestInterceptor: (config) => {
        config.headers.Authorization = 'Bearer token';
        return config;
      },
    });

    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:8080/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'static-value',
      },
    });
  });

  it('should use custom timeout', () => {
    const client = new ChamberlainClient({
      endpoint: 'http://localhost:8080/api',
      timeout: 5000,
    });

    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:8080/api',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });
});

