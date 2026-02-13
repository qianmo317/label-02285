# Vue OpenLayers 免费地图

## How to Run

### Docker 方式（推荐）

```bash
# 构建并启动
docker-compose up --build -d

# 访问地址
http://localhost:8081

# 停止服务
docker-compose down
```

### 本地开发方式

```bash
# 进入前端目录
cd frontend-user

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## Services

| 服务 | 端口 | 说明 |
|------|------|------|
| frontend-user | 8081 | 用户端地图应用 |

## 测试账号

本项目为纯前端地图应用，无需登录账号。

## 题目内容

use vue 用 OpenLayers 免费JS库 + OpenStreetMap（OSM）开源地图数据，开发2D免费地图网页，核心要求如下：
1. 地图基础配置：
   - 调用OSM免费瓦片地图作为底图，自动加载全球街道、路网、绿地等基础元素，无需手动下载地图资源；
   - 地图中心设为默认城市（如北京天安门经纬度：39.9042, 116.4074），初始缩放级别16，仅使用完全免费的开源功能，无任何付费接口调用。
2. 视觉与功能优化：
   - 隐藏OSM默认的冗余商家/广告标注，仅保留清晰的道路线条（深灰色加粗）、绿地（浅绿色填充）、水系（浅蓝色），路线用红色粗线标注，辨识度拉满；
   - 顶部添加白色圆角搜索框（含"搜索地点/输入经纬度"灰色提示+放大镜图标），支持搜索地点并自动定位，点击地图任意位置显示精准经纬度（9位小数）。
3. 核心交互功能：
   - 支持地图拖拽平移、鼠标滚轮缩放（缩放范围8-19级），添加左侧圆形±缩放按钮（白色背景+深灰色图标）；
   - 新增"复制经纬度"按钮（黄色背景#FFE66D，点击弹出红色"已复制"提示）、"路线规划"按钮（主色#00D4AA），输入起点终点可生成直线路线，路线带轻微发光效果。
4. 兼容性与体验：
   - 背景色设为#0F0F23，UI元素与地图融合自然，适配电脑/手机端竖屏显示；
   - 代码添加详细注释，标注OpenLayers库引入方式、OSM图层对接步骤，可直接在Replit/本地浏览器运行，加载速度快无卡顿。

---

## 项目介绍

基于 Vue 3 + OpenLayers + OpenStreetMap 的免费2D地图网页应用。

### 技术栈

- Vue 3 (Composition API)
- OpenLayers 8.x (开源地图库)
- OpenStreetMap / CartoDB Positron (免费地图瓦片)
- Nominatim API (免费地理编码服务)
- Vite (构建工具)
- Nginx (生产服务器)

### 功能特性

- 🗺️ CartoDB Positron 简洁地图样式，道路深灰、绿地浅绿、水系浅蓝，无商家标注
- 📍 点击地图显示精准经纬度（9位小数）
- 🔍 搜索框支持地点名称搜索和经纬度输入定位
- 📋 一键复制经纬度到剪贴板
- 🛣️ 路线规划功能（支持地名/经纬度输入，带发光效果）
- 🖱️ 拖拽平移、滚轮缩放（8-19级）
- 📱 响应式设计，适配电脑/手机端

### 项目结构

```
├── docker-compose.yml          # Docker Compose 配置
├── .gitignore                  # Git 忽略文件
├── README.md                   # 项目说明
└── frontend-user/              # 用户端地图应用
    ├── Dockerfile              # Docker 构建文件
    ├── nginx.conf              # Nginx 配置
    ├── package.json            # 依赖配置
    ├── vite.config.js          # Vite 配置
    ├── index.html              # 入口 HTML
    └── src/
        ├── main.js             # Vue 入口
        ├── App.vue             # 根组件
        ├── components/         # UI 组件
        │   ├── MapView.vue     # 地图主视图
        │   ├── SearchBox.vue   # 搜索框
        │   ├── ZoomControls.vue# 缩放控制
        │   ├── CoordPanel.vue  # 坐标面板
        │   ├── RoutePanel.vue  # 路线规划
        │   ├── Toast.vue       # 轻量提示
        │   └── Dialog.vue      # 对话框
        ├── composables/        # 组合式函数
        │   ├── useMap.js       # 地图核心逻辑
        │   ├── useRoute.js     # 路线绑制逻辑
        │   ├── useSearch.js    # 搜索功能
        │   ├── useToast.js     # Toast 提示
        │   └── useDialog.js    # Dialog 对话框
        └── utils/
            └── logger.js       # 日志工具
```
