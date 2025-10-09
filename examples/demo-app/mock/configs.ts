/**
 * Configs Mock API
 */

import type { Request, Response } from 'express';
import mockConfigs from './data/sample-configs.json';

// 使用可变数组存储数据
let configs = [...mockConfigs];

// 生成配置 ID
function generateConfigId(sceneId: string, conditions: Array<{ key: string; value: string }>): string {
  if (conditions.length === 0) {
    return `${sceneId}:default`;
  }
  
  const sortedConditions = [...conditions].sort((a, b) => a.key.localeCompare(b.key));
  const conditionStr = sortedConditions.map((c) => `${c.key}:${c.value}`).join(',');
  return `${sceneId}:${conditionStr}`;
}

export default {
  // 获取配置列表
  'GET /api/configs': (req: Request, res: Response) => {
    const { sceneId, schemeVersion, conditions, page = 1, pageSize = 10, sort } = req.query;
    
    if (!sceneId) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_PARAMETER',
        message: 'sceneId 参数必填',
      });
    }
    
    let filtered = configs.filter((c) => c.sceneId === sceneId);
    
    // 按 Scheme 版本过滤
    if (schemeVersion) {
      filtered = filtered.filter((c) => c.schemeVersion === Number(schemeVersion));
    }
    
    // 按条件过滤
    if (conditions) {
      const conditionParts = String(conditions).split(',').map((part) => {
        const [key, ...valueParts] = part.split(':');
        return { key, value: valueParts.join(':') };
      });
      
      filtered = filtered.filter((config) => {
        return conditionParts.every((queryCondition) =>
          config.conditionList.some(
            (c) => c.key === queryCondition.key && c.value === queryCondition.value
          )
        );
      });
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
    }, 300);
  },

  // 创建配置 - 必须在 POST /api/configs/:id 之前，以优先匹配
  'POST /api/configs': (req: Request, res: Response) => {
    // 检查是否是复制操作（路径包含 :copy）
    if (req.path.includes(':copy')) {
      // 这是复制操作，应该由下面的处理器处理
      return res.status(500).json({
        success: false,
        message: '路由匹配错误',
      });
    }
    
    const { sceneId, schemeVersion, conditions = [], config } = req.body;
    
    const id = generateConfigId(sceneId, conditions);
    
    // 检查是否已存在
    if (configs.find((c) => c.id === id)) {
      return res.status(409).json({
        success: false,
        code: 'CONFIG_EXISTS',
        message: '相同条件的配置已存在',
      });
    }
    
    const newConfig = {
      id,
      sceneId,
      schemeVersion,
      conditionList: conditions,
      config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    configs.push(newConfig);
    
    res.status(201).json({
      success: true,
      data: newConfig,
    });
  },

  // 获取配置详情、更新、删除、复制配置的统一处理
  'GET /api/configs/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    const config = configs.find((c) => c.id === id);
    
    if (config) {
      res.json({
        success: true,
        data: config,
      });
    } else {
      res.status(404).json({
        success: false,
        code: 'CONFIG_NOT_FOUND',
        message: '配置不存在',
      });
    }
  },

  'PUT /api/configs/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    const { schemeVersion, conditions, config } = req.body;
    
    const existingConfig = configs.find((c) => c.id === id);
    
    if (!existingConfig) {
      return res.status(404).json({
        success: false,
        code: 'CONFIG_NOT_FOUND',
        message: '配置不存在',
      });
    }
    
    if (schemeVersion !== undefined) {
      existingConfig.schemeVersion = schemeVersion;
    }
    
    if (conditions !== undefined) {
      existingConfig.conditionList = conditions;
    }
    
    if (config !== undefined) {
      existingConfig.config = config;
    }
    
    existingConfig.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      data: existingConfig,
    });
  },

  'DELETE /api/configs/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    const index = configs.findIndex((c) => c.id === id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        code: 'CONFIG_NOT_FOUND',
        message: '配置不存在',
      });
    }
    
    configs.splice(index, 1);
    
    res.json({
      success: true,
    });
  },

  // 复制配置 - 处理 Google API 风格的 :copy 操作
  // 这个路由应该能匹配 /api/configs/xxx:copy 格式的路径
  'POST /api/configs/:id': (req: Request, res: Response) => {
    const fullId = req.params.id;
    
    // 检查是否是复制操作（ID 以 :copy 结尾）
    if (!fullId.endsWith(':copy')) {
      // 不是 copy 操作，返回 404（因为 POST /api/configs/:id 不是标准操作）
      return res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: '未找到对应的接口',
      });
    }
    
    // 提取真实的配置 ID（去掉 :copy 后缀）
    const id = fullId.slice(0, -5); // 移除 ':copy'
    const { toConditions } = req.body;
    
    const sourceConfig = configs.find((c) => c.id === id);
    
    if (!sourceConfig) {
      return res.status(404).json({
        success: false,
        code: 'CONFIG_NOT_FOUND',
        message: '源配置不存在',
      });
    }
    
    const newId = generateConfigId(sourceConfig.sceneId, toConditions);
    
    // 检查目标配置是否已存在
    if (configs.find((c) => c.id === newId)) {
      return res.status(409).json({
        success: false,
        code: 'CONFIG_EXISTS',
        message: '目标配置已存在',
      });
    }
    
    const newConfig = {
      id: newId,
      sceneId: sourceConfig.sceneId,
      schemeVersion: sourceConfig.schemeVersion,
      conditionList: toConditions,
      config: { ...sourceConfig.config },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    configs.push(newConfig);
    
    res.status(201).json({
      success: true,
      data: newConfig,
    });
  },
};
