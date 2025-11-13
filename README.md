# Vue 2 Gantt 项目

一个基于 Vue 2 的甘特图项目，集成了多种甘特图库的实现方案，用于项目管理和任务调度可视化。

## 📋 项目简介

本项目展示了三种不同的甘特图实现方案，帮助开发者了解和使用不同的甘特图库在 Vue 2 项目中的集成方式。项目包含完整的甘特图功能，如任务管理、时间轴展示、缩放控制、任务折叠/展开等。

## ✨ 功能特性

- 📊 **多种甘特图实现方案**

  - vue-gantt-chart：轻量级 Vue 甘特图组件
  - DHTMLX Gantt：功能强大的专业甘特图库
  - Highcharts Gantt：基于 Highcharts 的甘特图实现

- 🎯 **核心功能**

  - 任务层级结构展示（支持父子任务）
  - 任务折叠/展开
  - 时间轴缩放（支持 50% - 200% 缩放）
  - 任务进度显示
  - 任务分配人显示
  - 当前时间指示器
  - 响应式布局

- 🎨 **用户体验**
  - 直观的导航界面
  - 统一的缩放控制
  - 流畅的交互动画

## 🛠 技术栈

- **框架**: Vue 2.7.14
- **路由**: Vue Router 3.6.5
- **甘特图库**:
  - vue-gantt-chart 1.0.11
  - dhtmlx-gantt 9.1.0
  - highcharts 11.4.0
  - highcharts-vue 1.4.3
- **构建工具**: Vue CLI 5.0.8

## 📁 项目结构

```
vue2-gantt/
├── public/                 # 静态资源目录
│   └── index.html         # HTML 模板
├── src/
│   ├── App.vue            # 根组件（包含导航）
│   ├── main.js            # 入口文件
│   ├── router/
│   │   └── index.js       # 路由配置
│   └── views/
│       ├── Home.vue       # vue-gantt-chart 实现
│       ├── dhtml.vue      # DHTMLX Gantt 实现
│       └── highcharts.vue # Highcharts Gantt 实现
├── vue.config.js          # Vue CLI 配置
├── package.json           # 项目依赖配置
└── README.md             # 项目说明文档
```

## 🚀 快速开始

### 环境要求

- Node.js >= 12.x
- npm >= 6.x 或 yarn >= 1.x

### 安装依赖

```bash
npm install
```

### 开发运行

启动开发服务器（默认运行在 http://localhost:8080）：

```bash
npm run serve
```

### 构建生产版本

```bash
npm run build
```

构建后的文件将输出到 `dist/` 目录。

### 代码检查

```bash
npm run lint
```

## 📄 页面说明

项目包含三个主要页面，通过顶部导航栏切换：

### 1. vue-gantt-chart（首页 `/`）

使用 `vue-gantt-chart` 库实现的甘特图，特点：

- 轻量级，易于集成
- 支持自定义侧边栏和容器内容
- 灵活的任务展示方式

### 2. DHTMLX 甘特图（`/dhtml`）

使用 `dhtmlx-gantt` 库实现的甘特图，特点：

- 功能丰富，专业级甘特图解决方案
- 支持任务拖拽、编辑
- 丰富的配置选项和事件处理

### 3. Highcharts 甘特图（`/highcharts`）

使用 `highcharts` 库实现的甘特图，特点：

- 基于强大的 Highcharts 图表库
- 美观的图表样式
- 良好的交互体验

## 🔧 开发说明

### 路由配置

路由配置位于 `src/router/index.js`，使用 Vue Router 的 history 模式。

### 样式定制

各页面的样式可以在对应的 `.vue` 文件的 `<style>` 标签中修改。

### 数据格式

每个甘特图实现都使用类似的任务数据结构：

- `id`: 任务唯一标识
- `name`: 任务名称
- `start`: 开始时间
- `end`: 结束时间
- `progress`: 进度百分比
- `children`: 子任务数组（可选）
- `assignee`: 任务分配人（可选）

## 📝 注意事项

- 本项目基于 Vue 2，如需升级到 Vue 3，需要修改相关代码和依赖
- 不同甘特图库的数据格式可能略有差异，使用时请注意
- 缩放功能在各实现中都已支持，但具体实现方式可能不同

## 📄 许可证

本项目仅供学习和参考使用。

## 👤 作者

Liang Liang

## 📅 更新日志

- 2025-11-13: 项目初始化，集成三种甘特图实现方案
