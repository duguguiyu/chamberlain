/**
 * SceneForm - 场景表单组件
 * 支持创建和编辑场景
 * 
 * 编辑模式下的规则：
 * - ID 不可修改
 * - name, description 可以修改
 * - conditions 只能新增，不能删除或修改已有的
 * - schema 需要验证，支持兼容性检查
 */

import React, { useEffect, useState } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormList,
  ProFormSelect,
  ProFormSwitch,
} from '@ant-design/pro-components';
import { message, Card, Alert, Space, Tag, Descriptions, Button } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { 
  Scene, 
  CreateSceneRequest, 
  UpdateSceneRequest,
  UpdateSchemeRequest,
  UpdateSchemeResponse,
  ValidateSchemeResponse,
  AddConditionRequest,
} from '@chamberlain/protocol';

export interface SceneFormProps {
  /** 场景数据（编辑模式） */
  scene?: Scene;
  /** 提交回调 - 创建模式 */
  onSubmit?: (values: CreateSceneRequest) => Promise<void>;
  /** 更新元数据回调 - 编辑模式 */
  onUpdateMetadata?: (id: string, values: UpdateSceneRequest) => Promise<void>;
  /** 添加条件回调 - 编辑模式 */
  onAddCondition?: (id: string, values: AddConditionRequest) => Promise<void>;
  /** 验证 Schema 回调 - 编辑模式 */
  onValidateSchema?: (id: string, schema: any) => Promise<ValidateSchemeResponse>;
  /** 更新 Schema 回调 - 编辑模式 */
  onUpdateSchema?: (id: string, values: UpdateSchemeRequest) => Promise<UpdateSchemeResponse>;
  /** 取消回调 */
  onCancel?: () => void;
  /** 表单布局 */
  layout?: 'horizontal' | 'vertical' | 'inline';
}

/**
 * SceneForm 组件
 */
export const SceneForm: React.FC<SceneFormProps> = ({
  scene,
  onSubmit,
  onUpdateMetadata,
  onAddCondition,
  onValidateSchema,
  onUpdateSchema,
  onCancel,
  layout = 'vertical',
}) => {
  const [form] = ProForm.useForm();
  const isEdit = !!scene;
  const [validationResult, setValidationResult] = useState<ValidateSchemeResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [hasNewConditions, setHasNewConditions] = useState(false);
  const [schemaChanged, setSchemaChanged] = useState(false);
  const [metadataChanged, setMetadataChanged] = useState(false);

  // 已有条件的数量
  const existingConditionsCount = scene?.availableConditions?.length || 0;

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

  // 验证 Schema
  const handleValidateSchema = async () => {
    if (!isEdit || !onValidateSchema) return;

    const schemaValue = form.getFieldValue('schema');
    if (!schemaValue) {
      message.warning('请输入 Schema');
      return;
    }

    try {
      const parsedSchema = JSON.parse(schemaValue);
      
      setIsValidating(true);
      const result = await onValidateSchema(scene!.id, parsedSchema);
      setValidationResult(result);
      
      if (result.valid) {
        if (result.warnings && result.warnings.length > 0) {
          message.warning('Schema 验证通过，但有警告信息');
        } else {
          message.success('Schema 验证通过，兼容现有版本');
        }
      } else {
        message.error('Schema 验证失败');
      }
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        message.error('Schema 格式错误，请输入有效的 JSON');
      } else {
        message.error(error.message || '验证失败');
      }
    } finally {
      setIsValidating(false);
    }
  };

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

      if (isEdit) {
        // 编辑模式：需要分别处理元数据、条件和 Schema
        let success = true;

        // 1. 更新元数据（如果有变化）
        if (metadataChanged && onUpdateMetadata) {
          try {
            await onUpdateMetadata(scene!.id, {
              name: values.name,
            });
            message.success('场景名称更新成功');
          } catch (error: any) {
            message.error(error.message || '场景名称更新失败');
            success = false;
          }
        }

        // 2. 添加新条件（如果有）
        if (hasNewConditions && onAddCondition) {
          const newConditions = values.availableConditions.slice(existingConditionsCount);
          for (const condition of newConditions) {
            try {
              await onAddCondition(scene!.id, {
                key: condition.key,
                value: condition.name, // 使用 name 作为 value
              });
            } catch (error: any) {
              message.error(`添加条件 ${condition.key} 失败: ${error.message}`);
              success = false;
            }
          }
          if (success && newConditions.length > 0) {
            message.success(`成功添加 ${newConditions.length} 个条件`);
          }
        }

        // 3. 更新 Schema（如果有变化）
        if (schemaChanged && onUpdateSchema) {
          if (!validationResult) {
            message.warning('请先验证 Schema');
            return false;
          }

          if (!validationResult.valid && !values.overwrite) {
            message.error('Schema 验证失败，请勾选"强制覆盖"或修改 Schema');
            return false;
          }

          if (validationResult.warnings && validationResult.warnings.length > 0 && !values.overwrite) {
            message.warning('Schema 有警告信息，建议勾选"强制覆盖"以继续');
            return false;
          }

          try {
            const result = await onUpdateSchema(scene!.id, {
              scheme: schema,
              overwrite: values.overwrite || false,
            });
            message.success(`Schema 更新成功，新版本: ${result.version}`);
          } catch (error: any) {
            message.error(error.message || 'Schema 更新失败');
            success = false;
          }
        }

        if (success && !metadataChanged && !hasNewConditions && !schemaChanged) {
          message.info('没有任何变更');
        }

        return success;
      } else {
        // 创建模式
        if (!onSubmit) {
          message.error('未提供 onSubmit 回调');
          return false;
        }

        const submitData: CreateSceneRequest = {
          id: values.id,
          name: values.name,
          description: values.description,
          availableConditions: values.availableConditions || [],
          schema,
        };

        await onSubmit(submitData);
        message.success('场景创建成功');
        return true;
      }
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
      onValuesChange={(changedValues) => {
        if (isEdit) {
          if ('name' in changedValues || 'description' in changedValues) {
            setMetadataChanged(true);
          }
          if ('schema' in changedValues) {
            setSchemaChanged(true);
            setValidationResult(null); // 重置验证结果
          }
        }
      }}
      submitter={{
        searchConfig: {
          submitText: isEdit ? '保存全部变更' : '创建',
          resetText: '取消',
        },
        render: (_, dom) => {
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
      {/* 场景 ID */}
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
        tooltip={isEdit ? "场景 ID 不可修改" : "场景的唯一标识符，创建后不可修改"}
      />

      {/* 场景名称 */}
      <ProFormText
        name="name"
        label="场景名称"
        placeholder="请输入场景名称"
        rules={[{ required: true, message: '请输入场景名称' }]}
        tooltip={isEdit ? "可以修改场景名称" : undefined}
      />

      {/* 场景描述 */}
      <ProFormTextArea
        name="description"
        label="场景描述"
        placeholder="请输入场景描述"
        fieldProps={{
          rows: 3,
        }}
        tooltip={isEdit ? "可以修改场景描述" : undefined}
      />

      {/* 可用条件 */}
      {isEdit && existingConditionsCount > 0 && (
        <Alert
          message="条件编辑规则"
          description="为了确保兼容性，已有的条件不能删除或修改，只能添加新的条件。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <ProFormList
        name="availableConditions"
        label="可用条件"
        creatorButtonProps={{
          creatorButtonText: '+ 添加条件',
        }}
        copyIconProps={false}
        deleteIconProps={{
          tooltipText: '删除此条件',
        }}
        tooltip="定义该场景支持的条件类型，如环境、客户等"
        itemRender={({ listDom, action }, { index }) => {
          const isExisting = isEdit && index < existingConditionsCount;
          return (
            <Card
              bordered
              size="small"
              style={{ 
                marginBottom: 16,
                backgroundColor: isExisting ? '#fafafa' : undefined,
              }}
              title={
                <Space>
                  {`条件 ${index + 1}`}
                  {isExisting && <Tag color="blue">已有（不可删除）</Tag>}
                  {!isExisting && isEdit && <Tag color="green">新增</Tag>}
                </Space>
              }
              extra={!isExisting ? action : null}
              bodyStyle={{ paddingTop: 16 }}
            >
              {listDom}
            </Card>
          );
        }}
        onAfterRemove={() => {
          if (isEdit) {
            setHasNewConditions(form.getFieldValue('availableConditions').length > existingConditionsCount);
          }
        }}
      >
        {(_, index) => {
          const isExisting = isEdit && index < existingConditionsCount;
          return (
            <>
              <ProFormText
                name="key"
                label="条件 Key"
                placeholder="如：environment, customer"
                rules={
                  isExisting
                    ? []
                    : [
                        { required: true, message: '请输入条件 Key' },
                        {
                          pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
                          message: '条件 Key 必须是有效的标识符',
                        },
                      ]
                }
                width="lg"
                disabled={isExisting}
                fieldProps={{
                  style: isExisting ? { backgroundColor: '#f5f5f5' } : undefined,
                }}
              />

              <ProFormText
                name="name"
                label="条件名称"
                placeholder="如：环境、客户"
                rules={isExisting ? [] : [{ required: true, message: '请输入条件名称' }]}
                width="lg"
                disabled={isExisting}
                fieldProps={{
                  style: isExisting ? { backgroundColor: '#f5f5f5' } : undefined,
                }}
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
                width="lg"
                rules={isExisting ? [] : [{ required: true, message: '请选择值类型' }]}
                disabled={isExisting}
                fieldProps={{
                  style: isExisting ? { backgroundColor: '#f5f5f5' } : undefined,
                }}
              />

              <ProFormTextArea
                name="values"
                label="可选值（可选）"
                placeholder="输入可选值，每行一个&#10;例如：&#10;dev&#10;test&#10;staging&#10;prod"
                fieldProps={{
                  rows: 3,
                  style: isExisting ? { backgroundColor: '#f5f5f5' } : undefined,
                }}
                disabled={isExisting}
                transform={(value: any) => {
                  if (!value) return [];
                  if (typeof value === 'string') {
                    return value.split('\n').filter((v: string) => v.trim());
                  }
                  return value;
                }}
                convertValue={(value: any) => {
                  if (Array.isArray(value)) {
                    return value.join('\n');
                  }
                  return value;
                }}
              />
            </>
          );
        }}
      </ProFormList>

      {/* Schema 部分 */}
      {isEdit && (
        <>
          <Card
            title="当前 Schema 信息"
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Descriptions column={2} size="small">
              <Descriptions.Item label="当前版本">
                <Tag color="blue">v{scene?.currentSchemeVersion || 1}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={scene?.schemeList?.find((s: any) => s.version === scene.currentSchemeVersion)?.status === 'active' ? 'green' : 'default'}>
                  {scene?.schemeList?.find((s: any) => s.version === scene.currentSchemeVersion)?.status || 'active'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Alert
            message="Schema 更新规则"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>建议只进行向后兼容的修改（添加字段、放宽限制）</li>
                <li>删除字段、修改字段类型等操作会导致不兼容</li>
                <li>不兼容的修改需要勾选"强制覆盖"才能提交</li>
                <li>每次更新成功后，Schema 版本号会自动递增</li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {/* 验证结果 */}
          {validationResult && (
            <Alert
              message={validationResult.valid ? '验证通过' : '验证失败'}
              description={
                <div>
                  {validationResult.valid ? (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <span>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        Schema 验证通过
                      </span>
                      {validationResult.warnings && validationResult.warnings.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <strong>警告信息：</strong>
                          <div>
                            {validationResult.warnings.map((warning, index) => (
                              <Tag key={index} color="orange" style={{ marginTop: 4 }}>
                                {warning}
                              </Tag>
                            ))}
                          </div>
                          <span style={{ marginTop: 8, display: 'block', color: '#faad14' }}>
                            警告：某些变更可能影响现有配置，建议勾选"强制覆盖"以继续
                          </span>
                        </div>
                      )}
                    </Space>
                  ) : (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <span>
                        <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                        Schema 验证失败
                      </span>
                      {validationResult.warnings && validationResult.warnings.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <strong>错误信息：</strong>
                          <div>
                            {validationResult.warnings.map((warning, index) => (
                              <Tag key={index} color="red" style={{ marginTop: 4 }}>
                                {warning}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      )}
                      <span style={{ marginTop: 8, display: 'block', color: '#ff4d4f' }}>
                        请修改 Schema 或勾选"强制覆盖"以继续
                      </span>
                    </Space>
                  )}
                </div>
              }
              type={validationResult.valid ? (validationResult.warnings && validationResult.warnings.length > 0 ? 'warning' : 'success') : 'error'}
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
        </>
      )}

      {/* JSON Schema */}
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
            validator: (_: any, value: any) => {
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
          rows: isEdit ? 14 : 12,
          style: { fontFamily: 'Monaco, Consolas, monospace', fontSize: 13 },
        }}
        tooltip="定义配置的数据结构，遵循 JSON Schema Draft 7 规范"
        extra={
          isEdit && (
            <Space style={{ marginTop: 8 }}>
              <Button type="link" size="small" onClick={handleValidateSchema} loading={isValidating}>
                {isValidating ? '验证中...' : '验证 Schema 兼容性'}
              </Button>
            </Space>
          )
        }
      />

      {/* 强制覆盖选项（仅在编辑模式且检测到警告或错误时显示） */}
      {isEdit && validationResult && (!validationResult.valid || (validationResult.warnings && validationResult.warnings.length > 0)) && (
        <ProFormSwitch
          name="overwrite"
          label="强制覆盖"
          fieldProps={{
            checkedChildren: '是',
            unCheckedChildren: '否',
          }}
          extra="勾选后将强制覆盖，忽略验证警告或错误。请确保你了解这样做的后果。"
        />
      )}
    </ProForm>
  );
};

// 导出别名用于向后兼容
export { SceneForm as SceneCreateForm };
