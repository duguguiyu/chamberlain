/**
 * Chamberlain 协议兼容性测试
 * 用于验证服务端实现是否符合协议规范
 */

import { describe, test, expect, beforeAll } from 'vitest';
import axios, { type AxiosInstance } from 'axios';

describe('Chamberlain Protocol Compatibility Tests', () => {
  const baseURL = process.env.TEST_ENDPOINT || 'http://localhost:8080/api';
  let client: AxiosInstance;
  let testSceneId: string;
  let testConfigId: string;

  beforeAll(() => {
    client = axios.create({ baseURL });
    testSceneId = `test_scene_${Date.now()}`;
  });

  describe('1. Capabilities API', () => {
    test('应该返回服务能力声明', async () => {
      const { data, status } = await client.get('/capabilities');

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(typeof data.data['scenes.search']).toBe('boolean');
      expect(typeof data.data['scenes.sort']).toBe('boolean');
      expect(typeof data.data['configs.search']).toBe('boolean');
      expect(typeof data.data['configs.sort']).toBe('boolean');
    });
  });

  describe('2. Scenes API', () => {
    test('应该能够获取场景列表', async () => {
      const { data, status } = await client.get('/scenes', {
        params: { page: 1, pageSize: 10 },
      });

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.list).toBeInstanceOf(Array);
      expect(typeof data.data.total).toBe('number');
      expect(data.data.page).toBe(1);
      expect(data.data.pageSize).toBe(10);
    });

    test('应该能够创建场景', async () => {
      const newScene = {
        id: testSceneId,
        name: '测试场景',
        scheme: {
          type: 'object',
          properties: {
            testField: { type: 'string', title: '测试字段' },
          },
          required: ['testField'],
        },
        conditions: [{ key: 'env', value: '环境' }],
      };

      const { data, status } = await client.post('/scenes', newScene);

      expect(status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(testSceneId);
      expect(data.data.name).toBe(newScene.name);
      expect(data.data.schemeList).toBeInstanceOf(Array);
      expect(data.data.schemeList[0].version).toBe(1);
      expect(data.data.schemeList[0].status).toBe('active');
    });

    test('应该拒绝无效的场景ID格式', async () => {
      const invalidScene = {
        id: 'Invalid-ID',
        name: '无效场景',
        scheme: { type: 'object' },
        conditions: [],
      };

      try {
        await client.post('/scenes', invalidScene);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.success).toBe(false);
        expect(error.response.data.code).toBe('INVALID_SCENE_ID_FORMAT');
      }
    });

    test('应该拒绝重复的场景ID', async () => {
      const duplicateScene = {
        id: testSceneId,
        name: '重复场景',
        scheme: { type: 'object' },
        conditions: [],
      };

      try {
        await client.post('/scenes', duplicateScene);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response.status).toBe(409);
        expect(error.response.data.code).toBe('SCENE_EXISTS');
      }
    });

    test('应该能够获取场景详情', async () => {
      const { data, status } = await client.get(`/scenes/${testSceneId}`);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(testSceneId);
    });

    test('应该能够验证 Scheme', async () => {
      const { data, status } = await client.post(`/scenes/${testSceneId}/schemes:validate`, {
        scheme: {
          type: 'object',
          properties: {
            testField: { type: 'string' },
            newField: { type: 'number' },
          },
        },
      });

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(typeof data.data.valid).toBe('boolean');
      expect(data.data.warnings).toBeInstanceOf(Array);
    });

    test('应该能够更新场景', async () => {
      const { data, status } = await client.patch(`/scenes/${testSceneId}`, {
        name: '测试场景（已更新）',
      });

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('测试场景（已更新）');
    });
  });

  describe('3. Configs API', () => {
    test('应该能够获取配置列表', async () => {
      const { data, status } = await client.get('/configs', {
        params: {
          sceneId: testSceneId,
          page: 1,
          pageSize: 10,
        },
      });

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.list).toBeInstanceOf(Array);
    });

    test('应该能够创建配置', async () => {
      const newConfig = {
        sceneId: testSceneId,
        schemeVersion: 1,
        conditions: [{ key: 'env', value: 'test' }],
        config: {
          testField: 'test value',
        },
      };

      const { data, status } = await client.post('/configs', newConfig);

      expect(status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.sceneId).toBe(testSceneId);
      expect(data.data.config.testField).toBe('test value');
      testConfigId = data.data.id;
    });

    test('应该能够获取配置详情', async () => {
      const { data, status } = await client.get(`/configs/${testConfigId}`);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(testConfigId);
    });

    test('应该能够更新配置', async () => {
      const { data, status } = await client.put(`/configs/${testConfigId}`, {
        config: {
          testField: 'updated value',
        },
      });

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.config.testField).toBe('updated value');
    });

    test('应该能够复制配置', async () => {
      const { data, status } = await client.post(`/configs/${testConfigId}:copy`, {
        toConditions: [{ key: 'env', value: 'prod' }],
      });

      expect(status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).not.toBe(testConfigId);
    });

    test('应该能够删除配置', async () => {
      const { data, status } = await client.delete(`/configs/${testConfigId}`);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('4. Error Handling', () => {
    test('404错误应该符合协议格式', async () => {
      try {
        await client.get('/scenes/non_existent_scene');
        expect.fail('应该抛出404错误');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.success).toBe(false);
        expect(error.response.data.code).toBeDefined();
        expect(error.response.data.message).toBeDefined();
      }
    });

    test('400错误应该符合协议格式', async () => {
      try {
        await client.get('/configs'); // 缺少必填参数 sceneId
        expect.fail('应该抛出400错误');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.success).toBe(false);
        expect(error.response.data.code).toBeDefined();
      }
    });
  });

  describe('5. Cleanup', () => {
    test('应该能够删除测试场景', async () => {
      const { status } = await client.delete(`/scenes/${testSceneId}`);
      expect(status).toBe(200);
    });
  });
});


