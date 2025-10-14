/**
 * ConfigForm - 配置表单组件
 * 根据 JSON Schema 动态生成表单
 */

import React, { useEffect } from 'react';
import { ProForm, ProFormText, ProFormDigit, ProFormSwitch, ProFormSelect, ProFormTextArea, ProFormList, ProFormDependency } from '@ant-design/pro-components';
import { message, Card, Divider } from 'antd';
import type { JSONSchema, Scene } from '@chamberlain/protocol';

export interface ConfigFormProps {
  /** JSON Schema 定义 */
  schema: JSONSchema;
  /** 场景信息（用于条件选择） */
  scene?: Scene;
  /** 初始值（编辑模式） */
  initialValues?: Record<string, any>;
  /** 初始条件列表 */
  initialConditions?: Array<{ key: string; value: any }>;
  /** 提交回调 */
  onSubmit: (values: Record<string, any>) => Promise<void>;
  /** 取消回调 */
  onCancel?: () => void;
  /** 是否只读 */
  readonly?: boolean;
  /** 是否允许编辑条件（创建模式=true，编辑模式=false） */
  allowEditConditions?: boolean;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({
  schema,
  scene,
  initialValues,
  initialConditions,
  onSubmit,
  onCancel,
  readonly = false,
  allowEditConditions = true,
}) => {
  const [form] = ProForm.useForm();

  useEffect(() => {
    const formValues: any = {};
    if (initialValues) {
      Object.assign(formValues, initialValues);
    }
    if (initialConditions) {
      formValues.conditionList = initialConditions;
    }
    form.setFieldsValue(formValues);
  }, [initialValues, initialConditions, form]);

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
            convertValue={(value: any) => {
              // 显示时：将数组转为字符串
              if (Array.isArray(value)) {
                return JSON.stringify(value);
              }
              return value;
            }}
            transform={(value: any) => {
              // 提交时：将字符串转为数组
              if (typeof value === 'string') {
                try {
                  return JSON.parse(value);
                } catch {
                  return value;
                }
              }
              return value;
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
            convertValue={(value: any) => {
              // 显示时：将对象转为字符串
              if (typeof value === 'object' && value !== null) {
                return JSON.stringify(value, null, 2);
              }
              return value;
            }}
            transform={(value: any) => {
              // 提交时：将字符串转为对象
              if (typeof value === 'string') {
                try {
                  return JSON.parse(value);
                } catch {
                  return value;
                }
              }
              return value;
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

  /**
   * 渲染条件选择器
   */
  const renderConditions = () => {
    if (!scene || !scene.availableConditions || scene.availableConditions.length === 0) {
      return null;
    }

    if (!allowEditConditions) {
      // 编辑模式：只读显示
      return (
        <Card 
          size="small" 
          title="配置条件"
          style={{ marginBottom: 24, background: '#f5f5f5' }}
        >
          <div style={{ color: '#666', fontSize: 13 }}>
            条件一旦创建后不可修改（因为条件是配置 ID 的一部分）
          </div>
          {initialConditions && initialConditions.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {initialConditions.map((cond, index) => {
                const conditionDef = scene.availableConditions?.find(c => c.key === cond.key);
                return (
                  <div key={index} style={{ padding: '8px 0', borderTop: index > 0 ? '1px solid #e8e8e8' : 'none' }}>
                    <strong>{conditionDef?.name || cond.key}:</strong> {String(cond.value)}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      );
    }

    // 创建/复制模式：可编辑
    return (
      <>
        <Divider orientation="left">配置条件</Divider>
        <Card size="small" style={{ marginBottom: 24, background: '#f0f7ff' }}>
          <div style={{ marginBottom: 16, color: '#666', fontSize: 13 }}>
            配置条件用于区分不同环境、客户等场景。条件一旦创建后不可修改。
          </div>
          
          <ProFormList
            name="conditionList"
            label=""
            creatorButtonProps={{
              creatorButtonText: '+ 添加条件',
            }}
            copyIconProps={false}
            deleteIconProps={{
              tooltipText: '删除此条件',
            }}
            itemRender={({ listDom, action }, { index }) => (
              <Card
                bordered
                size="small"
                style={{ marginBottom: 16 }}
                title={`条件 ${index + 1}`}
                extra={action}
                bodyStyle={{ paddingTop: 16 }}
              >
                {listDom}
              </Card>
            )}
          >
            <ProFormSelect
              name="key"
              label="条件类型"
              placeholder="选择条件"
              options={scene.availableConditions.map((cond) => ({
                label: cond.name,
                value: cond.key,
              }))}
              rules={[{ required: true, message: '请选择条件类型' }]}
              width="lg"
            />
            <ProFormDependency name={['key']}>
              {({ key }) => {
                const condition = scene.availableConditions?.find((c) => c.key === key);
                if (!condition) return null;

                // 如果有预定义值，使用下拉选择
                if (condition.values && condition.values.length > 0) {
                  return (
                    <ProFormSelect
                      name="value"
                      label="条件值"
                      placeholder="选择值"
                      options={condition.values.map((v) => ({
                        label: String(v),
                        value: v,
                      }))}
                      rules={[{ required: true, message: '请选择条件值' }]}
                      width="lg"
                    />
                  );
                }

                // 否则根据类型选择输入方式
                switch (condition.type) {
                  case 'number':
                    return (
                      <ProFormDigit
                        name="value"
                        label="条件值"
                        placeholder="输入数值"
                        rules={[{ required: true, message: '请输入条件值' }]}
                        width="lg"
                      />
                    );
                  case 'boolean':
                    return (
                      <ProFormSelect
                        name="value"
                        label="条件值"
                        options={[
                          { label: '是', value: true },
                          { label: '否', value: false },
                        ]}
                        rules={[{ required: true, message: '请选择条件值' }]}
                        width="lg"
                      />
                    );
                  default:
                    return (
                      <ProFormText
                        name="value"
                        label="条件值"
                        placeholder="输入条件值"
                        rules={[{ required: true, message: '请输入条件值' }]}
                        width="lg"
                      />
                    );
                }
              }}
            </ProFormDependency>
          </ProFormList>
        </Card>
      </>
    );
  };

  return (
    <ProForm
      form={form}
      onFinish={async (values) => {
        try {
          console.log('📋 ConfigForm 提交的原始数据:', values);
          console.log('📋 ConfigForm 提交的数据类型:', typeof values, Array.isArray(values));
          console.log('📋 ConfigForm Schema properties:', Object.keys(schema.properties || {}));
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
      {renderConditions()}
      <Divider orientation="left">配置数据</Divider>
      {renderFields()}
    </ProForm>
  );
};

