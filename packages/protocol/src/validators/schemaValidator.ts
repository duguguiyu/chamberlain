/**
 * JSON Schema 验证器
 * 使用 AJV 进行 JSON Schema 验证
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { JSONSchema } from '../types/schema';
import type { ValidationError } from '../types/config';

/**
 * Schema 验证器
 */
export class SchemaValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
    });
    addFormats(this.ajv);
  }

  /**
   * 验证数据是否符合 Schema
   */
  validate(schema: JSONSchema, data: any): { valid: boolean; errors: ValidationError[] } {
    const validate = this.ajv.compile(schema);
    const valid = validate(data);

    if (valid) {
      return { valid: true, errors: [] };
    }

    const errors: ValidationError[] = (validate.errors || []).map((error) => ({
      field: error.instancePath.slice(1) || error.params.missingProperty || 'root',
      message: error.message || 'Validation failed',
      type: error.keyword,
    }));

    return { valid: false, errors };
  }

  /**
   * 验证 Schema 本身是否有效
   */
  validateSchema(schema: JSONSchema): boolean {
    try {
      this.ajv.compile(schema);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 比较两个 Schema，检测不兼容的变更
   * 返回警告信息列表
   */
  compareSchemas(oldSchema: JSONSchema, newSchema: JSONSchema): string[] {
    const warnings: string[] = [];

    // 检查删除的字段
    if (oldSchema.properties && newSchema.properties) {
      Object.keys(oldSchema.properties).forEach((key) => {
        if (!(key in newSchema.properties!)) {
          warnings.push(`字段 "${key}" 已被删除`);
        }
      });

      // 检查字段类型变更
      Object.keys(oldSchema.properties).forEach((key) => {
        if (key in newSchema.properties!) {
          const oldProp = oldSchema.properties![key];
          const newProp = newSchema.properties![key];

          if (oldProp.type !== newProp.type) {
            warnings.push(`字段 "${key}" 的类型从 "${oldProp.type}" 变更为 "${newProp.type}"`);
          }
        }
      });
    }

    // 检查新增的必填字段
    const oldRequired = oldSchema.required || [];
    const newRequired = newSchema.required || [];

    newRequired.forEach((field) => {
      if (!oldRequired.includes(field)) {
        warnings.push(`字段 "${field}" 被设置为必填`);
      }
    });

    return warnings;
  }
}

/**
 * 创建默认验证器实例
 */
export const defaultSchemaValidator = new SchemaValidator();

