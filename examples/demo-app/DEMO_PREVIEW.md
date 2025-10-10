# 🎨 Chamberlain Demo 应用预览

## 当前状态
✅ 所有 6 个组件已完成  
✅ Mock 数据层已完备  
✅ 页面功能已集成

## 📸 功能预览

### 场景管理页面 (`/scenes`)

#### 1. 场景列表（SceneTable）
- 展示所有场景的表格
- 支持搜索、排序、分页
- 操作列：查看、编辑、删除、查看配置

#### 2. 创建场景（SceneForm）
**字段：**
- 场景 ID（必填，只能包含小写字母、数字、下划线）
- 场景名称（必填）
- 场景描述（可选）
- 可用条件列表：
  - 条件 Key（如：env, customer）
  - 条件名称（如：环境、客户）
  - 值类型（string/number/boolean）
  - 可选值（多行输入）
- JSON Schema（必填，多行 JSON 输入）

**示例 JSON Schema：**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "host": {
      "type": "string",
      "title": "主机地址"
    },
    "port": {
      "type": "integer",
      "title": "端口号",
      "minimum": 1,
      "maximum": 65535
    },
    "ssl": {
      "type": "boolean",
      "title": "启用 SSL"
    }
  },
  "required": ["host", "port"]
}
```

#### 3. 场景详情（SceneDescriptions）
**显示信息：**
- 基本信息 Tab：
  - 场景 ID
  - 场景名称
  - 描述
  - 当前 Schema 版本
  - 冲突策略
  - 可用条件（标签展示）
  - 创建/更新时间
  - 创建/更新者
- JSON Schema Tab：
  - 完整的 Schema 定义（可复制）

---

### 配置管理页面 (`/configs`)

#### 1. 场景选择器
- 顶部下拉框
- 搜索功能
- 显示场景名称

#### 2. 配置列表（ConfigTable）
- 展示选中场景的所有配置
- 列：配置 ID、Schema 版本、条件、配置数据预览、时间
- 操作列：查看、编辑、复制、删除

#### 3. 创建/编辑配置（ConfigForm）
**动态表单特性：**
- 根据 Schema 自动生成表单
- 支持的字段类型：
  - `string` → Input 或 Select（如有 enum）
  - `number/integer` → InputNumber
  - `boolean` → Switch
  - `array` → TextArea（JSON 格式）
  - `object` → TextArea（JSON 格式）
- 自动数据验证：
  - 必填字段检查
  - 类型验证
  - 范围验证（min/max）
  - 正则表达式验证

**示例表单（基于上面的 Schema）：**
- 主机地址：`[Input 组件]`
- 端口号：`[InputNumber 组件，范围 1-65535]`
- 启用 SSL：`[Switch 组件]`

#### 4. 配置详情（ConfigDescriptions）
**显示信息：**
- 基本信息 Tab：
  - 配置 ID
  - 场景 ID
  - Schema 版本（蓝色标签）
  - 应用条件（紫色标签）
  - 根据 Schema 智能渲染的配置字段
  - 创建/更新时间和用户
- 配置数据 Tab：
  - 原始 JSON 数据（可复制）

---

## 🎬 操作流程演示

### 完整流程 1：创建场景并配置

1. **访问场景管理页面**
   - 进入 `/scenes`
   - 看到场景列表（空或有 Mock 数据）

2. **创建新场景**
   - 点击"创建"按钮
   - 填写表单：
     ```
     场景 ID: app_database
     场景名称: 应用数据库配置
     描述: 各环境的数据库连接配置
     可用条件:
       - Key: env, 名称: 环境, 类型: string, 值: dev,test,prod
     JSON Schema: (如上面示例)
     ```
   - 点击"创建"
   - 成功后返回列表

3. **查看场景详情**
   - 点击"查看"按钮
   - 查看两个 Tab 的内容

4. **切换到配置管理**
   - 访问 `/configs?sceneId=app_database`
   - 或点击场景列表的"查看配置"

5. **创建配置**
   - 选择场景（已自动选中）
   - 点击"创建配置"
   - 表单自动根据 Schema 生成
   - 填写数据：
     ```
     主机地址: localhost
     端口号: 3306
     启用 SSL: 是
     ```
   - 提交创建

6. **查看和管理配置**
   - 查看配置列表
   - 点击"查看"查看详情
   - 点击"编辑"修改配置
   - 点击"复制"创建副本
   - 点击"删除"删除配置

---

## 📦 Mock 数据说明

### Mock API 文件位置
- `examples/demo-app/mock/capabilities.ts` - 服务能力
- `examples/demo-app/mock/scenes.ts` - 场景 API
- `examples/demo-app/mock/configs.ts` - 配置 API
- `examples/demo-app/mock/data/sample-scenes.json` - 示例场景数据
- `examples/demo-app/mock/data/sample-configs.json` - 示例配置数据

### Mock API 端点
- `GET /api/capabilities` - 获取服务能力
- `GET /api/scenes` - 获取场景列表
- `POST /api/scenes` - 创建场景
- `GET /api/scenes/:id` - 获取场景详情
- `PUT /api/scenes/:id` - 更新场景
- `DELETE /api/scenes/:id` - 删除场景
- `GET /api/configs` - 获取配置列表
- `POST /api/configs` - 创建配置
- `GET /api/configs/:id` - 获取配置详情
- `PUT /api/configs/:id` - 更新配置
- `DELETE /api/configs/:id` - 删除配置
- `POST /api/configs/:id:copy` - 复制配置

---

## 🎨 UI 特性

### 设计风格
- 基于 Ant Design 5+ 设计语言
- Ant Design Pro 专业级组件
- 响应式布局
- 统一的交互模式

### 颜色标签
- **蓝色**：版本号
- **紫色**：条件标签
- **绿色**：成功状态、布尔值"是"
- **橙色**：警告、MERGE 策略
- **红色**：错误、ERROR 策略
- **灰色**：默认、禁用状态

### 交互特性
- 表格支持排序（点击表头）
- 搜索框实时搜索
- 分页自动保存状态
- 表单实时验证
- 操作确认对话框
- 成功/失败消息提示

---

## 🔧 启动方式

### 方式 1：使用 Mock 数据（推荐开发）
```bash
cd examples/demo-app
pnpm install
pnpm dev
```

访问 http://localhost:8000

### 方式 2：连接真实后端
```bash
# 1. 启动后端服务
cd examples/demo-backend
java -jar target/chamberlain-backend-0.1.0.jar --spring.profiles.active=local

# 2. 启动前端（会通过 proxy 连接后端）
cd examples/demo-app
pnpm dev
```

### 当前环境问题
⚠️ 检测到 Node.js 依赖库版本不匹配问题（icu4c）

**解决方案：**

1. **使用 nvm 切换 Node 版本**（推荐）：
```bash
# 安装 nvm（如果没有）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装 Node 18 LTS
nvm install 18
nvm use 18

# 重新启动
cd examples/demo-app
pnpm dev
```

2. **重新链接 Homebrew Node**：
```bash
brew uninstall --ignore-dependencies node
brew install node
```

3. **使用 Docker**（最稳定）：
```bash
# 在项目根目录创建 Dockerfile
# 然后运行
docker-compose up
```

---

## 📸 截图说明

由于当前环境限制，无法直接启动预览。但根据实现的代码：

### 场景管理页面布局
```
┌─────────────────────────────────────────────┐
│  Chamberlain           场景管理              │
├─────────────────────────────────────────────┤
│  [搜索框]                      [创建场景按钮] │
├──────┬──────┬──────────┬──────┬─────┬──────┤
│场景ID│ 名称 │ 描述     │版本  │时间 │ 操作 │
├──────┼──────┼──────────┼──────┼─────┼──────┤
│app_db│数据库│DB配置    │v2    │今天 │[...]│
│app_  │Redis │缓存配置  │v1    │昨天 │[...]│
│cache │      │          │      │     │      │
└──────┴──────┴──────────┴──────┴─────┴──────┘
```

### 配置管理页面布局
```
┌─────────────────────────────────────────────┐
│  Chamberlain     配置管理   [选择场景: ▼]   │
├─────────────────────────────────────────────┤
│  [搜索框]                    [创建配置按钮]   │
├──────────┬────┬─────────┬──────┬────┬──────┤
│配置ID    │版本│ 条件    │数据  │时间│ 操作 │
├──────────┼────┼─────────┼──────┼────┼──────┤
│app_db:   │v1  │env=prod │{...} │今天│[...]│
│default   │    │         │      │    │      │
└──────────┴────┴─────────┴──────┴────┴──────┘
```

---

## ✅ 组件功能清单

### SceneTable
- [x] 显示场景列表
- [x] 搜索功能
- [x] 排序功能
- [x] 分页
- [x] 创建按钮
- [x] 查看操作
- [x] 编辑操作
- [x] 删除操作（带确认）
- [x] 查看配置操作

### SceneForm
- [x] 场景 ID 输入（带验证）
- [x] 场景名称输入
- [x] 场景描述输入
- [x] 可用条件列表（动态添加/删除）
- [x] JSON Schema 输入（带格式验证）
- [x] 创建模式
- [x] 编辑模式
- [x] 表单验证

### SceneDescriptions
- [x] 显示所有场景信息
- [x] 版本标签
- [x] 条件标签
- [x] 策略标签
- [x] 时间格式化
- [x] Schema 显示（可复制）
- [x] Tab 切换

### ConfigTable
- [x] 按场景筛选
- [x] 显示配置列表
- [x] 条件标签展示
- [x] 数据预览
- [x] 创建按钮
- [x] 查看操作
- [x] 编辑操作
- [x] 复制操作
- [x] 删除操作（带确认）

### ConfigForm
- [x] 基于 Schema 动态生成
- [x] string → Input
- [x] number/integer → InputNumber
- [x] boolean → Switch
- [x] enum → Select
- [x] array/object → TextArea
- [x] 必填验证
- [x] 类型验证
- [x] 范围验证

### ConfigDescriptions
- [x] 显示配置基本信息
- [x] 条件标签展示
- [x] 基于 Schema 智能渲染字段
- [x] 不同类型不同展示
- [x] 原始 JSON 显示（可复制）
- [x] Tab 切换

---

## 🎯 下一步

1. **修复环境问题**：按照上面的解决方案修复 Node.js 依赖
2. **启动预览**：`pnpm dev` 查看实际效果
3. **测试功能**：体验完整的创建、编辑、查看流程
4. **连接后端**：启动真实后端服务进行完整测试

---

**所有组件和功能都已实现！** 🎉  
只需解决环境问题即可查看完整效果。


