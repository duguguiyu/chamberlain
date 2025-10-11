/**
 * 配置管理页面
 * 展示完整的配置管理流程：列表 -> 创建/编辑 -> 查看详情
 */

import { useState, useEffect } from 'react';
import { Card, Modal, message, Select, Space } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import {
  ConfigTable,
  ConfigForm,
  ConfigDescriptions,
} from '@chamberlain/react-components';
import type { Config, CreateConfigRequest, Scene } from '@chamberlain/protocol';
import { useChamberlain } from '@chamberlain/react-components';
import { useSearchParams } from '@umijs/max';

const { Option } = Select;

export default function ConfigsPage() {
  const { client } = useChamberlain();
  const [searchParams, setSearchParams] = useSearchParams();
  const sceneIdFromUrl = searchParams.get('sceneId');

  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string>(sceneIdFromUrl || '');
  const [selectedScene, setSelectedScene] = useState<Scene | undefined>();
  
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<Config | undefined>();
  const [tableKey, setTableKey] = useState(0); // 用于刷新表格

  // 加载场景列表
  useEffect(() => {
    const loadScenes = async () => {
      try {
        const response = await client.getSceneList({ page: 1, pageSize: 100 });
        setScenes(response.data.list || []);
        
        // 如果有 URL 参数，设置选中的场景
        if (sceneIdFromUrl) {
          const scene = response.data.list?.find((s: Scene) => s.id === sceneIdFromUrl);
          setSelectedScene(scene);
        }
      } catch (error: any) {
        message.error('加载场景列表失败');
      }
    };
    loadScenes();
  }, []);

  // 场景切换
  const handleSceneChange = (sceneId: string) => {
    setSelectedSceneId(sceneId);
    const scene = scenes.find((s) => s.id === sceneId);
    setSelectedScene(scene);
    setSearchParams({ sceneId });
    setTableKey((prev) => prev + 1);
  };

  // 创建配置
  const handleCreate = async (values: any) => {
    if (!selectedSceneId) {
      message.error('请先选择场景');
      return;
    }

    try {
      const createData: CreateConfigRequest = {
        sceneId: selectedSceneId,
        conditionList: values.conditionList || [],
        config: values,
        schemeVersion: (selectedScene as any)?.currentSchemeVersion || 1,
      };

      await client.createConfig(createData);
      message.success('配置创建成功');
      setCreateModalVisible(false);
      setTableKey((prev) => prev + 1);
    } catch (error: any) {
      message.error(error.message || '创建失败');
      throw error;
    }
  };

  // 编辑配置
  const handleEdit = async (values: any) => {
    if (!currentConfig) return;

    try {
      await client.updateConfig(currentConfig.id, values);
      message.success('配置更新成功');
      setEditModalVisible(false);
      setCurrentConfig(undefined);
      setTableKey((prev) => prev + 1);
    } catch (error: any) {
      message.error(error.message || '更新失败');
      throw error;
    }
  };

  // 删除配置
  const handleDelete = async (config: Config) => {
    try {
      await client.deleteConfig(config.id);
      message.success('配置删除成功');
      setTableKey((prev) => prev + 1);
    } catch (error: any) {
      message.error(error.message || '删除失败');
      throw error;
    }
  };

  // 查看配置详情
  const handleView = (config: Config) => {
    setCurrentConfig(config);
    setViewModalVisible(true);
  };

  // 编辑配置
  const handleEditClick = (config: Config) => {
    setCurrentConfig(config);
    setEditModalVisible(true);
  };

  // 复制配置
  const handleCopy = async (config: Config) => {
    try {
      await client.copyConfig(config.id);
      message.success('配置复制成功');
      setTableKey((prev) => prev + 1);
    } catch (error: any) {
      message.error(error.message || '复制失败');
    }
  };

  // 解析配置数据
  const getConfigData = (config: Config) => {
    if (typeof config.config === 'string') {
      try {
        return JSON.parse(config.config);
      } catch {
        return {};
      }
    }
    return config.config || {};
  };

  return (
    <PageContainer
      title="配置管理"
      subTitle="管理场景的配置实例，支持多条件配置"
      extra={
        <Space>
          <span>选择场景：</span>
          <Select
            style={{ width: 200 }}
            placeholder="请选择场景"
            value={selectedSceneId || undefined}
            onChange={handleSceneChange}
            showSearch
            optionFilterProp="children"
          >
            {scenes.map((scene) => (
              <Option key={scene.id} value={scene.id}>
                {scene.name}
              </Option>
            ))}
          </Select>
        </Space>
      }
    >
      {!selectedSceneId ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
            <p style={{ fontSize: 16 }}>请先选择一个场景</p>
            <p>配置必须关联到特定的场景才能创建和管理</p>
          </div>
        </Card>
      ) : (
        <Card>
          <ConfigTable
            key={tableKey}
            sceneId={selectedSceneId}
            searchable
            showActions
            showCreateButton
            actions={{
              onView: handleView,
              onEdit: handleEditClick,
              onDelete: handleDelete,
              onCreate: () => setCreateModalVisible(true),
              onCopy: handleCopy,
            }}
          />
        </Card>
      )}

      {/* 创建配置弹窗 */}
      <Modal
        title={`创建配置 - ${selectedScene?.name || ''}`}
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        {(selectedScene as any)?.currentScheme && (
          <ConfigForm
            schema={(selectedScene as any).currentScheme}
            onSubmit={handleCreate}
            onCancel={() => setCreateModalVisible(false)}
          />
        )}
      </Modal>

      {/* 编辑配置弹窗 */}
      <Modal
        title="编辑配置"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setCurrentConfig(undefined);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        {currentConfig && (selectedScene as any)?.currentScheme && (
          <ConfigForm
            schema={(selectedScene as any).currentScheme}
            initialValues={getConfigData(currentConfig)}
            onSubmit={handleEdit}
            onCancel={() => {
              setEditModalVisible(false);
              setCurrentConfig(undefined);
            }}
          />
        )}
      </Modal>

      {/* 查看配置详情弹窗 */}
      <Modal
        title="配置详情"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setCurrentConfig(undefined);
        }}
        footer={null}
        width={1000}
        destroyOnClose
      >
        {currentConfig && (
          <ConfigDescriptions
            config={currentConfig}
            schema={(selectedScene as any)?.currentScheme}
            showRawConfig
            column={2}
          />
        )}
      </Modal>
    </PageContainer>
  );
}
