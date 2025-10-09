/**
 * SceneForm - 场景表单组件
 * 用于创建和编辑场景
 */

import React, { useEffect } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormList,
  ProFormSelect,
} from '@ant-design/pro-components';
import { message } from 'antd';
import type { Scene, CreateSceneRequest, UpdateSceneRequest } from '@chamberlain/protocol';

export interface SceneFormProps {
  /** 场景数据（编辑模式） */
  scene?: Scene;
  /** 提交回调 */
  onSubmit: (values: CreateSceneRequest | UpdateSceneRequest) => Promise<void>;
  /** 取消回调 */
  onCancel?: () => void;
  /** 是否只读 */
  readonly?: boolean;
  /** 表单布局 */
  layout?: 'horizontal' | 'vertical' | 'inline';
}

/**
 * SceneForm 组件
 */
export const SceneForm: React.FC<SceneFormProps> = ({
  scene,
  onSubmit,
  onCancel,
  readonly = false,
  layout = 'vertical',
}) => {
  const [form] = ProForm.useForm();
  const isEdit = !!scene;

  useEffect(() => {
    if (scene) {
      form.setFieldsValue({
        id: scene.id,
        name: scene.name,
        description: scene.description,
        availableConditions: scene.availableConditions || [],
        schema: scene.currentScheme ? JSON.stringify(scene.currentScheme, null, 2) : '',
      });
    }
  }, [scene, form]);

  const handleSubmit = async (values: any) => {
    try {
      // 解析 schema
      let schema;
      if (values.schema) {
        try {
          schema = JSON.parse(values.schema);
        } catch (e) {
          message.error('Schema 格式错误，请输入有效的 JSON');
          return false;
        }
      }

      const submitData = {
        id: values.id,
        name: values.name,
        description: values.description,
        availableConditions: values.availableConditions || [],
        schema,
      };

      await onSubmit(submitData);
      message.success(isEdit ? '场景更新成功' : '场景创建成功');
      return true;
    } catch (error: any) {
      message.error(error.message || '操作失败');
      return false;
    }
  };

  return (
    <ProForm
      form={form}
      layout={layout}
      onFinish={handleSubmit}
      readonly={readonly}
      submitter={{
        searchConfig: {
          submitText: isEdit ? '更新' : '创建',
          resetText: '取消',
        },
        render: readonly
          ? false
          : (_, dom) => {
              return (
                <div style={{ textAlign: 'right' }}>
                  {onCancel && (
                    <span
                      onClick={onCancel}
                      style={{ marginRight: 8, cursor: 'pointer' }}
                    >
                      {dom[0]}
                    </span>
                  )}
                  {dom[1]}
                </div>
              );
            },
      }}
    >
      <ProFormText
        name="id"
        label="场景 ID"
        placeholder="请输入场景 ID（仅小写字母、数字和下划线）"
        rules={[
          { required: true, message: '请输入场景 ID' },
          {
            pattern: /^[a-z0-9_]+$/,
            message: '场景 ID 只能包含小写字母、数字和下划线',
          },
        ]}
        disabled={isEdit}
        tooltip="场景的唯一标识符，创建后不可修改"
      />

      <ProFormText
        name="name"
        label="场景名称"
        placeholder="请输入场景名称"
        rules={[{ required: true, message: '请输入场景名称' }]}
      />

      <ProFormTextArea
        name="description"
        label="场景描述"
        placeholder="请输入场景描述"
        fieldProps={{
          rows: 3,
        }}
      />

      <ProFormList
        name="availableConditions"
        label="可用条件"
        creatorButtonProps={{
          creatorButtonText: '添加条件',
        }}
        copyIconProps={false}
        deleteIconProps={{
          tooltipText: '删除',
        }}
        tooltip="定义该场景支持的条件类型，如环境、客户等"
      >
        <ProFormText
          name="key"
          label="条件 Key"
          placeholder="如：env, customer"
          rules={[
            { required: true, message: '请输入条件 Key' },
            {
              pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
              message: '条件 Key 必须是有效的标识符',
            },
          ]}
          width="md"
        />

        <ProFormText
          name="name"
          label="条件名称"
          placeholder="如：环境、客户"
          rules={[{ required: true, message: '请输入条件名称' }]}
          width="md"
        />

        <ProFormSelect
          name="type"
          label="值类型"
          options={[
            { label: '字符串', value: 'string' },
            { label: '数字', value: 'number' },
            { label: '布尔值', value: 'boolean' },
          ]}
          placeholder="选择值类型"
          width="sm"
        />

        <ProFormTextArea
          name="values"
          label="可选值"
          placeholder="输入可选值，每行一个（可选）"
          fieldProps={{
            rows: 2,
          }}
          transform={(value) => {
            if (!value) return [];
            return value.split('\n').filter((v: string) => v.trim());
          }}
          convertValue={(value) => {
            if (Array.isArray(value)) {
              return value.join('\n');
            }
            return value;
          }}
        />
      </ProFormList>

      <ProFormTextArea
        name="schema"
        label="JSON Schema"
        placeholder='请输入 JSON Schema 定义，例如：
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "host": {"type": "string"},
    "port": {"type": "integer"}
  }
}'
        rules={[
          { required: true, message: '请输入 JSON Schema' },
          {
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              try {
                JSON.parse(value);
                return Promise.resolve();
              } catch (e) {
                return Promise.reject(new Error('请输入有效的 JSON 格式'));
              }
            },
          },
        ]}
        fieldProps={{
          rows: 12,
          style: { fontFamily: 'monospace' },
        }}
        tooltip="定义配置的数据结构，遵循 JSON Schema Draft 7 规范"
      />
    </ProForm>
  );
};

