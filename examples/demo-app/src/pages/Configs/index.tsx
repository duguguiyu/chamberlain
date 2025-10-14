/**
 * 配置管理页面
 * 展示完整的配置管理流程：列表 -> 创建/编辑 -> 查看详情
 */

import { useState, useEffect } from 'react';
import { Card, Drawer, message, Select, Space } from 'antd';
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
        setScenes(response.data?.list || []);
        
        // 如果有 URL 参数，设置选中的场景
        if (sceneIdFromUrl && response.data) {
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
      console.log('🚀 Configs handleCreate 收到的原始 values:', values);
      const { conditionList, ...configData } = values;
      console.log('🚀 Configs handleCreate 解构后 conditionList:', conditionList);
      console.log('🚀 Configs handleCreate 解构后 configData:', configData);
      
      const createData: CreateConfigRequest = {
        sceneId: selectedSceneId,
        conditionList: conditionList || [],
        config: configData,
        schemeVersion: selectedScene?.currentSchemeVersion || 1,
      };
      
      console.log('🚀 Configs handleCreate 最终提交的 createData:', createData);

      await client.createConfig(createData);
      message.success('配置创建成功');
      setCreateModalVisible(false);
      setCurrentConfig(undefined); // 清空当前配置（用于复制场景）
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
      const { conditionList, ...configData } = values;
      
      await client.updateConfig(currentConfig.id, { config: configData });
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

  // 复制配置（前端实现：预填充到表单）
  const handleCopy = (config: Config) => {
    setCurrentConfig(config);
    setCreateModalVisible(true);
    message.info('配置已复制，请修改条件后保存');
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

  // 获取场景的 JSON Schema（处理后端返回的字符串或对象）
  const getCurrentScheme = () => {
    console.log('🔍 getCurrentScheme - selectedScene:', selectedScene);
    console.log('🔍 getCurrentScheme - currentScheme:', selectedScene?.currentScheme);
    console.log('🔍 getCurrentScheme - currentScheme type:', typeof selectedScene?.currentScheme);
    
    const scheme = selectedScene?.currentScheme;
    if (!scheme) {
      console.warn('⚠️ getCurrentScheme - scheme is undefined or null');
      return undefined;
    }
    
    // 如果是字符串，解析为对象
    if (typeof scheme === 'string') {
      try {
        const parsed = JSON.parse(scheme);
        console.log('✅ getCurrentScheme - parsed from string:', parsed);
        return parsed;
      } catch (error) {
        console.error('❌ 解析 JSON Schema 失败:', error);
        return undefined;
      }
    }
    
    // 如果已经是对象，直接返回
    console.log('✅ getCurrentScheme - returning object:', scheme);
    return scheme;
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

      {/* 创建配置抽屉 */}
      <Drawer
        title={`创建配置 - ${selectedScene?.name || ''}`}
        open={createModalVisible}
        onClose={() => {
          setCreateModalVisible(false);
          setCurrentConfig(undefined);
        }}
        width={720}
        destroyOnClose
      >
        {getCurrentScheme() ? (
          <ConfigForm
            schema={getCurrentScheme()}
            scene={selectedScene}
            initialValues={currentConfig ? getConfigData(currentConfig) : undefined}
            initialConditions={currentConfig ? currentConfig.conditionList : undefined}
            onSubmit={handleCreate}
            onCancel={() => {
              setCreateModalVisible(false);
              setCurrentConfig(undefined);
            }}
            allowEditConditions={true}
          />
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#999' }}>
            {selectedScene ? '加载配置模板中...' : '请先选择场景'}
          </div>
        )}
      </Drawer>

      {/* 编辑配置抽屉 */}
      <Drawer
        title="编辑配置"
        open={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setCurrentConfig(undefined);
        }}
        width={720}
        destroyOnClose
      >
        {currentConfig && getCurrentScheme() ? (
          <ConfigForm
            schema={getCurrentScheme()}
            scene={selectedScene}
            initialValues={getConfigData(currentConfig)}
            initialConditions={currentConfig.conditionList}
            onSubmit={handleEdit}
            onCancel={() => {
              setEditModalVisible(false);
              setCurrentConfig(undefined);
            }}
            allowEditConditions={false}
          />
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#999' }}>
            加载中...
          </div>
        )}
      </Drawer>

      {/* 查看配置详情抽屉 */}
      <Drawer
        title="配置详情"
        open={viewModalVisible}
        onClose={() => {
          setViewModalVisible(false);
          setCurrentConfig(undefined);
        }}
        width={900}
        destroyOnClose
      >
        {currentConfig && (
          <ConfigDescriptions
            config={currentConfig}
            schema={getCurrentScheme()}
            showRawConfig
            column={1}
          />
        )}
      </Drawer>
    </PageContainer>
  );
}
