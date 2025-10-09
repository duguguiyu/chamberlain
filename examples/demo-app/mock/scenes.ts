/**
 * Scenes Mock API
 */

import type { Request, Response } from 'express';
import mockScenes from './data/sample-scenes.json';

// 使用可变数组存储数据
let scenes = [...mockScenes];

export default {
  // 获取场景列表
  'GET /api/scenes': (req: Request, res: Response) => {
    const { page = 1, pageSize = 10, q, sort } = req.query;
    
    let filtered = [...scenes];
    
    // 搜索过滤
    if (q) {
      const keyword = String(q).toLowerCase();
      filtered = filtered.filter(
        (scene) =>
          scene.id.toLowerCase().includes(keyword) ||
          scene.name.toLowerCase().includes(keyword)
      );
    }
    
    // 排序
    if (sort) {
      const sortRules = String(sort).split(',').map((rule) => {
        const [field, order] = rule.split(':');
        return { field, order };
      });
      
      filtered.sort((a, b) => {
        for (const rule of sortRules) {
          const aVal = (a as any)[rule.field];
          const bVal = (b as any)[rule.field];
          
          if (aVal === bVal) continue;
          
          const compare = aVal > bVal ? 1 : -1;
          return rule.order === 'asc' ? compare : -compare;
        }
        return 0;
      });
    }
    
    // 分页
    const pageNum = Number(page);
    const size = Number(pageSize);
    const start = (pageNum - 1) * size;
    const end = start + size;
    
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          list: filtered.slice(start, end),
          total: filtered.length,
          page: pageNum,
          pageSize: size,
        },
      });
    }, 300); // 模拟网络延迟
  },

  // 获取场景详情
  'GET /api/scenes/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    const scene = scenes.find((s) => s.id === id);
    
    if (scene) {
      res.json({
        success: true,
        data: scene,
      });
    } else {
      res.status(404).json({
        success: false,
        code: 'SCENE_NOT_FOUND',
        message: '场景不存在',
      });
    }
  },

  // 创建场景
  'POST /api/scenes': (req: Request, res: Response) => {
    const { id, name, scheme, conditions = [] } = req.body;
    
    // 验证 ID 格式
    if (!/^[a-z][a-z0-9_]*$/.test(id)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_SCENE_ID_FORMAT',
        message: 'ID 格式不正确，只能包含小写字母、数字和下划线，且必须以字母开头',
      });
    }
    
    // 检查 ID 是否已存在
    if (scenes.find((s) => s.id === id)) {
      return res.status(409).json({
        success: false,
        code: 'SCENE_EXISTS',
        message: '场景 ID 已存在',
      });
    }
    
    const newScene = {
      id,
      name,
      schemeList: [
        {
          scheme,
          version: 1,
          status: 'active' as const,
        },
      ],
      conditionList: conditions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    scenes.push(newScene);
    
    res.status(201).json({
      success: true,
      data: newScene,
    });
  },

  // 更新场景
  'PATCH /api/scenes/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;
    
    const scene = scenes.find((s) => s.id === id);
    
    if (!scene) {
      return res.status(404).json({
        success: false,
        code: 'SCENE_NOT_FOUND',
        message: '场景不存在',
      });
    }
    
    if (name) {
      scene.name = name;
    }
    scene.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      data: scene,
    });
  },

  // 删除场景
  'DELETE /api/scenes/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    const index = scenes.findIndex((s) => s.id === id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        code: 'SCENE_NOT_FOUND',
        message: '场景不存在',
      });
    }
    
    scenes.splice(index, 1);
    
    res.json({
      success: true,
    });
  },

  // 验证 Scheme
  'POST /api/scenes/:id/schemes:validate': (req: Request, res: Response) => {
    const { id } = req.params;
    const { scheme } = req.body;
    
    const scene = scenes.find((s) => s.id === id);
    
    if (!scene) {
      return res.status(404).json({
        success: false,
        code: 'SCENE_NOT_FOUND',
        message: '场景不存在',
      });
    }
    
    // 简单验证：检查是否有字段被删除
    const activeScheme = scene.schemeList.find((s) => s.status === 'active');
    const warnings: string[] = [];
    
    if (activeScheme) {
      const oldProps = Object.keys(activeScheme.scheme.properties || {});
      const newProps = Object.keys(scheme.properties || {});
      
      oldProps.forEach((prop) => {
        if (!newProps.includes(prop)) {
          warnings.push(`字段 "${prop}" 已被删除`);
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        valid: warnings.length === 0,
        warnings,
      },
    });
  },

  // 更新 Scheme
  'POST /api/scenes/:id/schemes': (req: Request, res: Response) => {
    const { id } = req.params;
    const { scheme, overwrite = false } = req.body;
    
    const scene = scenes.find((s) => s.id === id);
    
    if (!scene) {
      return res.status(404).json({
        success: false,
        code: 'SCENE_NOT_FOUND',
        message: '场景不存在',
      });
    }
    
    const maxVersion = Math.max(...scene.schemeList.map((s) => s.version));
    const newVersion = maxVersion + 1;
    
    // 停用旧版本
    scene.schemeList.forEach((s) => {
      s.status = 'inactive';
    });
    
    // 添加新版本
    scene.schemeList.push({
      scheme,
      version: newVersion,
      status: 'active',
    });
    
    scene.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      data: {
        version: newVersion,
      },
    });
  },

  // 更新 Scheme 状态
  'PATCH /api/scenes/:id/schemes/:version': (req: Request, res: Response) => {
    const { id, version } = req.params;
    const { status } = req.body;
    
    const scene = scenes.find((s) => s.id === id);
    
    if (!scene) {
      return res.status(404).json({
        success: false,
        code: 'SCENE_NOT_FOUND',
        message: '场景不存在',
      });
    }
    
    const schemeVersion = scene.schemeList.find((s) => s.version === Number(version));
    
    if (!schemeVersion) {
      return res.status(404).json({
        success: false,
        code: 'SCHEME_VERSION_NOT_FOUND',
        message: 'Scheme 版本不存在',
      });
    }
    
    schemeVersion.status = status;
    scene.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
    });
  },

  // 添加条件
  'POST /api/scenes/:id/conditions': (req: Request, res: Response) => {
    const { id } = req.params;
    const { key, value } = req.body;
    
    const scene = scenes.find((s) => s.id === id);
    
    if (!scene) {
      return res.status(404).json({
        success: false,
        code: 'SCENE_NOT_FOUND',
        message: '场景不存在',
      });
    }
    
    // 检查是否已存在
    if (scene.conditionList.some((c) => c.key === key)) {
      return res.status(409).json({
        success: false,
        code: 'CONDITION_EXISTS',
        message: '条件已存在',
      });
    }
    
    scene.conditionList.push({ key, value });
    scene.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      data: scene,
    });
  },
};


