/**
 * 场景管理页面
 * 展示完整的场景管理流程：列表 -> 创建/编辑 -> 查看详情
 */

import { useState } from 'react';
import { Card, Modal, Tabs, message } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import {
  SceneTable,
  SceneForm,
  SceneDescriptions,
} from '@chamberlain/react-components';
import type { Scene, CreateSceneRequest } from '@chamberlain/protocol';
import { useChamberlain } from '@chamberlain/react-components';

const { TabPane } = Tabs;

export default function ScenesPage() {
  const { client } = useChamberlain();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [currentScene, setCurrentScene] = useState<Scene | undefined>();
  const [tableKey, setTableKey] = useState(0); // 用于刷新表格

  // 创建场景
  const handleCreate = async (values: CreateSceneRequest) => {
    try {
      await client.createScene(values);
      message.success('场景创建成功');
      setCreateModalVisible(false);
      setTableKey((prev) => prev + 1); // 刷新表格
    } catch (error: any) {
      message.error(error.message || '创建失败');
      throw error;
    }
  };

  // 编辑场景
  const handleEdit = async (values: any) => {
    if (!currentScene) return;
    try {
      await client.updateScene(currentScene.id, values);
      message.success('场景更新成功');
      setEditModalVisible(false);
      setCurrentScene(undefined);
      setTableKey((prev) => prev + 1); // 刷新表格
    } catch (error: any) {
      message.error(error.message || '更新失败');
      throw error;
    }
  };

  // 删除场景
  const handleDelete = async (scene: Scene) => {
    try {
      await client.deleteScene(scene.id);
      message.success('场景删除成功');
      setTableKey((prev) => prev + 1); // 刷新表格
    } catch (error: any) {
      message.error(error.message || '删除失败');
      throw error;
    }
  };

  // 查看场景详情
  const handleView = (scene: Scene) => {
    setCurrentScene(scene);
    setViewModalVisible(true);
  };

  // 编辑场景
  const handleEditClick = (scene: Scene) => {
    setCurrentScene(scene);
    setEditModalVisible(true);
  };

  return (
    <PageContainer
      title="场景管理"
      subTitle="管理所有配置场景，创建和编辑 JSON Schema"
    >
      <Card>
        <SceneTable
          key={tableKey}
          searchable
          showActions
          showCreateButton
          actions={{
            onView: handleView,
            onEdit: handleEditClick,
            onDelete: handleDelete,
            onCreate: () => setCreateModalVisible(true),
            onViewConfigs: (scene) => {
              // 跳转到配置页面
              window.location.href = `/configs?sceneId=${scene.id}`;
            },
          }}
        />
      </Card>

      {/* 创建场景弹窗 */}
      <Modal
        title="创建场景"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <SceneForm
          onSubmit={handleCreate}
          onCancel={() => setCreateModalVisible(false)}
        />
      </Modal>

      {/* 编辑场景弹窗 */}
      <Modal
        title="编辑场景"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setCurrentScene(undefined);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        {currentScene && (
          <SceneForm
            scene={currentScene}
            onSubmit={handleEdit}
            onCancel={() => {
              setEditModalVisible(false);
              setCurrentScene(undefined);
            }}
          />
        )}
      </Modal>

      {/* 查看场景详情弹窗 */}
      <Modal
        title="场景详情"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setCurrentScene(undefined);
        }}
        footer={null}
        width={1000}
        destroyOnClose
      >
        {currentScene && (
          <Tabs defaultActiveKey="info">
            <TabPane tab="基本信息" key="info">
              <SceneDescriptions scene={currentScene} showSchema={false} />
            </TabPane>
            <TabPane tab="JSON Schema" key="schema">
              <SceneDescriptions
                scene={currentScene}
                showSchema
                column={1}
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </PageContainer>
  );
}
