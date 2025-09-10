<div align="center">

# PowerSearch · 更快切换搜索引擎

轻松在任何搜索引擎结果页，一键跳转到其它搜索引擎并复用相同关键词。

[GitHub 仓库](https://github.com/JoyinJoester/PowerSearch) · [问题反馈](https://github.com/JoyinJoester/PowerSearch/issues)

</div>

---

## ✨ 核心特性

- 🔍 智能识别：自动从当前页面 URL 提取搜索关键词
- 🚀 一键切换：点击目标引擎按钮立即跳转
- 🌍 多引擎预置：Google、Bing、百度、DuckDuckGo、GitHub、Yandex、Ecosia、Startpage、SearX、搜狗、360搜索、必应中国
- ⚙️ 自定义引擎：支持添加 / 编辑 / 删除（跨设备同步）
- ⌨️ 快捷键：数字键 1-9 选择引擎，Ctrl+Tab 切标签，Esc 关闭
- 🎨 清爽 UI：简洁、直观、响应迅速


## 🚀 安装

> 当前未上架 Chrome 商店，请按如下方式从源码安装。

### 方式一：克隆仓库（推荐）

1) 克隆项目

```powershell
git clone https://github.com/JoyinJoester/PowerSearch.git
cd PowerSearch
```

2) 打开扩展管理页：在地址栏输入 `chrome://extensions/`

3) 打开右上角“开发者模式”

4) 点击“加载已解压的扩展程序”，选择项目目录 `PowerSearch`

5) 固定扩展图标，便于快速使用

### 方式二：下载 ZIP

1) 在仓库页面点击“Code”→“Download ZIP”，下载并解压
2) 按“方式一”的第 2-5 步加载该解压目录


## 📖 使用

### 快速切换搜索引擎

1) 在任意搜索引擎进行搜索（如：在 Google 搜 “React hooks”）
2) 点击浏览器工具栏中的 PowerSearch 图标
3) 弹窗会显示检测到的关键词；点击任意引擎按钮即可跳转
4) 也可使用数字键 1-9 快速选择列表中的引擎

### 自定义搜索引擎（可选）

1) 打开弹窗 → 切换到“管理”标签
2) 填写以下信息并点击“添加搜索引擎”
   - 名称（如：GitHub）
   - 图标（如：💻，可选）
   - 搜索 URL 模板（如：`https://github.com/search?q=` 或使用 `{query}` 占位）
   - 域名（如：`github.com`）
   - 查询参数名（如：`q`）
3) 列表里可随时编辑或删除；配置通过 `chrome.storage.sync` 在设备间同步

### 已适配的常见参数

```
Google:      ?q=关键词
Bing:        ?q=关键词
百度:        ?wd=关键词
搜狗:        ?query=关键词
DuckDuckGo:  ?q=关键词
Yandex:      ?text=关键词
GitHub:      ?q=关键词
```


## 🔐 权限

- `activeTab`：读取当前活动标签页 URL，用于提取搜索关键词
- `storage`：保存自定义搜索引擎配置并同步


## 🛠️ 故障排除

- 弹窗提示“未检测到搜索关键词”
  - 确认页面是搜索结果页且 URL 包含正确参数
  - 若为自定义引擎，检查“域名 / 参数名 / URL 模板”配置
- 点击按钮无反应
  - 在扩展详情页确认权限正常；刷新当前页后再试
- 样式或文案异常
  - 在扩展管理页点击“重新加载”或重新安装


## 🗂️ 项目结构

```
PowerSearch/
├─ manifest.json     # 扩展配置（Manifest V3）
├─ popup.html        # 弹窗页面
├─ popup.css         # 样式
├─ popup.js          # 逻辑（关键词提取、引擎切换、自定义管理）
└─ icons/
   └─ icon.svg       # SVG 图标
```

## 📦 仓库与许可

- 仓库：https://github.com/JoyinJoester/PowerSearch
- 许可：MIT

## 🤝 贡献

欢迎提交 Issue / Pull Request 一起改进 PowerSearch！

---

享受更高效的搜索流转体验 🚀
