/**
 * ConfigForm - 配置表单组件
 * 根据 JSON Schema 动态生成表单
 */

import React, { useEffect } from 'react';
import { ProForm, ProFormText, ProFormDigit, ProFormSwitch, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { message } from 'antd';
import type { JSONSchema } from '@chamberlain/protocol';

export interface ConfigFormProps {
  /** JSON Schema 定义 */
  schema: JSONSchema;
  /** 初始值（编辑模式） */
  initialValues?: Record<string, any>;
  /** 提交回调 */
  onSubmit: (values: Record<string, any>) => Promise<void>;
  /** 取消回调 */
  onCancel?: () => void;
  /** 是否只读 */
  readonly?: boolean;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({
  schema,
  initialValues,
  onSubmit,
  onCancel,
  readonly = false,
}) => {
  const [form] = ProForm.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  /**
   * 根据 JSON Schema 字段定义渲染表单项
   */
  const renderField = (name: string, fieldSchema: JSONSchema): React.ReactNode => {
    const { type, title, description, default: defaultValue, enum: enumValues } = fieldSchema;

    // 基础配置
    const fieldProps = {
      name,
      label: title || name,
      tooltip: description,
      disabled: readonly,
      initialValue: defaultValue,
    };

    // 必填规则
    const required = schema.required?.includes(name);
    const rules = required ? [{ required: true, message: `${title || name}不能为空` }] : [];

    // 根据类型渲染不同的表单控件
    switch (type) {
      case 'string':
        // 枚举类型使用 Select
        if (enumValues && enumValues.length > 0) {
          return (
            <ProFormSelect
              {...fieldProps}
              key={name}
              rules={rules}
              options={enumValues.map((v) => ({
                label: String(v),
                value: v,
              }))}
            />
          );
        }
        
        // 根据 format 选择控件
        if (fieldSchema.format === 'textarea') {
          return (
            <ProFormTextArea
              {...fieldProps}
              key={name}
              rules={rules}
              fieldProps={{
                rows: 4,
                maxLength: fieldSchema.maxLength,
              }}
            />
          );
        }

        return (
          <ProFormText
            {...fieldProps}
            key={name}
            rules={[
              ...rules,
              ...(fieldSchema.minLength
                ? [{ min: fieldSchema.minLength, message: `最少 ${fieldSchema.minLength} 个字符` }]
                : []),
              ...(fieldSchema.maxLength
                ? [{ max: fieldSchema.maxLength, message: `最多 ${fieldSchema.maxLength} 个字符` }]
                : []),
              ...(fieldSchema.pattern
                ? [{ pattern: new RegExp(fieldSchema.pattern), message: '格式不正确' }]
                : []),
            ]}
            fieldProps={{
              type: fieldSchema.format === 'password' ? 'password' : 'text',
              maxLength: fieldSchema.maxLength,
            }}
          />
        );

      case 'number':
      case 'integer':
        return (
          <ProFormDigit
            {...fieldProps}
            key={name}
            rules={rules}
            min={fieldSchema.minimum}
            max={fieldSchema.maximum}
            fieldProps={{
              precision: type === 'integer' ? 0 : 2,
              step: type === 'integer' ? 1 : 0.01,
            }}
          />
        );

      case 'boolean':
        return (
          <ProFormSwitch
            {...fieldProps}
            key={name}
            rules={rules}
          />
        );

      case 'array':
        // 简单处理：使用文本域输入 JSON 数组
        return (
          <ProFormTextArea
            {...fieldProps}
            key={name}
            rules={[
              ...rules,
              {
                validator: (_: any, value: any) => {
                  if (!value) return Promise.resolve();
                  try {
                    const parsed = JSON.parse(value);
                    if (!Array.isArray(parsed)) {
                      return Promise.reject('必须是有效的 JSON 数组');
                    }
                    return Promise.resolve();
                  } catch {
                    return Promise.reject('必须是有效的 JSON');
                  }
                },
              },
            ]}
            fieldProps={{
              rows: 4,
              placeholder: '请输入 JSON 数组，如：["value1", "value2"]',
            }}
            transform={(value: any) => {
              try {
                return JSON.parse(value);
              } catch {
                return value;
              }
            }}
          />
        );

      case 'object':
        // 简单处理：使用文本域输入 JSON 对象
        return (
          <ProFormTextArea
            {...fieldProps}
            key={name}
            rules={[
              ...rules,
              {
                validator: (_: any, value: any) => {
                  if (!value) return Promise.resolve();
                  try {
                    const parsed = JSON.parse(value);
                    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
                      return Promise.reject('必须是有效的 JSON 对象');
                    }
                    return Promise.resolve();
                  } catch {
                    return Promise.reject('必须是有效的 JSON');
                  }
                },
              },
            ]}
            fieldProps={{
              rows: 6,
              placeholder: '请输入 JSON 对象，如：{"key": "value"}',
            }}
            transform={(value: any) => {
              try {
                return JSON.parse(value);
              } catch {
                return value;
              }
            }}
          />
        );

      default:
        return (
          <ProFormText
            {...fieldProps}
            key={name}
            rules={rules}
          />
        );
    }
  };

  /**
   * 渲染所有字段
   */
  const renderFields = () => {
    if (!schema.properties) {
      return null;
    }

    return Object.entries(schema.properties).map(([name, fieldSchema]) =>
      renderField(name, fieldSchema)
    );
  };

  return (
    <ProForm
      form={form}
      onFinish={async (values) => {
        try {
          await onSubmit(values);
          message.success('保存成功');
        } catch (error: any) {
          message.error(error.message || '保存失败');
          throw error;
        }
      }}
      submitter={
        readonly
          ? false
          : {
              searchConfig: {
                submitText: '保存',
                resetText: '取消',
              },
              resetButtonProps: {
                onClick: onCancel,
              },
            }
      }
      layout="vertical"
    >
      {renderFields()}
    </ProForm>
  );
};

