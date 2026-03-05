# 豆沙绿背景 - 护眼浏览器背景色

[![版本](https://img.shields.io/badge/版本-3.6-brightgreen.svg)](https://github.com/yourusername/bean-green-background)
[![许可](https://img.shields.io/badge/许可-MIT-blue.svg)](LICENSE)
[![平台](https://img.shields.io/badge/平台-全平台-lightgrey.svg)](https://github.com/yourusername/bean-green-background)

## 📖 项目简介

一款强大的浏览器用户脚本，将网页背景自动替换为豆沙绿护眼色，减轻长时间浏览网页对眼睛的伤害。支持自定义排除规则、网站黑名单、颜色调节等功能。

**核心特性：**
- 🎨 自动应用豆沙绿护眼背景
- 📦 智能排除规则系统（支持自定义函数）
- 🌐 网站黑名单管理
- 🎯 可视化控制面板
- 🔧 高度可定制化

## ✨ 核心功能

### 🎨 背景颜色
- ✅ 默认豆沙绿护眼色 `rgba(199, 237, 204, 0.8)`
- ✅ 支持自定义颜色和透明度
- ✅ 预设多种护眼色方案（豆沙绿、浅灰、米黄、浅蓝）
- ✅ 实时预览效果

### 📦 智能排除规则
- ✅ 内置10+种常见元素排除规则
- ✅ 支持CSS选择器匹配
- ✅ **支持自定义函数判断（高级功能）**
- ✅ 可视化规则管理界面
- ✅ 代码编辑器（带行号、语法检查）
- ✅ 规则测试功能

### 🌐 网站黑名单
- ✅ 内置常见需要排除的网站
- ✅ 支持自定义网站黑名单
- ✅ 正则表达式匹配支持
- ✅ 一键添加当前网站到黑名单

### 🎯 用户界面
- ✅ 可拖拽的快捷按钮
- ✅ 自动吸附边缘
- ✅ 位置记忆功能
- ✅ 调试模式支持

## 📦 安装方法

### 前置要求

安装浏览器扩展（二选一）：

| 扩展名称 | Chrome | Firefox | Edge |
|---------|--------|---------|------|
| **Tampermonkey** (推荐) | [安装](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) | [安装](https://addons.mozilla.org/firefox/addon/tampermonkey/) | [安装](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd) |
| **Violentmonkey** | [安装](https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag) | [安装](https://addons.mozilla.org/firefox/addon/violentmonkey/) | - |

### 安装步骤

1. **安装用户脚本管理器**（Tampermonkey 或 Violentmonkey）
2. **点击安装脚本** - [点击这里安装](你的脚本链接)
3. **确认安装** - 在弹出页面点击"安装"
4. **刷新网页** - 即可看到效果

## 🚀 快速开始

### 基础使用

```
安装脚本 → 页面右上角出现"🌿 豆沙绿"按钮 → 点击打开控制面板
```

所有 `div` 和 `header` 元素会自动应用豆沙绿背景。

### 自定义颜色

1. 打开控制面板
2. 在"背景颜色"区域：
   - 选择预设颜色，或
   - 使用颜色选择器自定义颜色
   - 调节透明度（0-100%）
3. 点击"✅ 应用颜色"

### 添加排除规则

1. 打开控制面板
2. 点击"➕ 添加新规则"
3. 选择规则类型：
   - **选择器规则**：适合简单的CSS选择器匹配
   - **自定义函数规则**：适合复杂逻辑判断
4. 填写规则内容并保存

## 📚 规则系统详解

### 规则类型对比

| 特性 | 选择器规则 | 自定义函数规则 |
|------|-----------|---------------|
| **难度** | ⭐ 简单 | ⭐⭐⭐ 高级 |
| **灵活性** | 中等 | 极高 |
| **性能** | 优秀 | 良好 |
| **适用场景** | 简单匹配 | 复杂逻辑判断 |
| **示例** | CSS选择器 | JavaScript函数 |

### 1. 选择器规则（推荐）

使用CSS选择器匹配元素，简单易用。

**完整字段说明：**

```json
{
    "selector": "video, .player",           // CSS选择器
    "className": "modal dialog",            // 类名（空格分隔，OR关系）
    "id": "header",                         // 元素ID
    "dataAttrs": {                          // 数据属性
        "data-role": "dialog"
    },
    "position": {                           // 位置匹配
        "type": "fixed",
        "zIndex": ">=1000"
    },
    "size": {                               // 尺寸匹配
        "width": ">=800",
        "height": "<=100"
    },
    "excludeChildren": true,                // 是否排除子元素
    "reason": "视频播放器"                   // 规则说明（必填）
}
```

**示例：**

```json
// 示例1：排除视频播放器
{
    "selector": "video, .video-player, [class*='player']",
    "excludeChildren": true,
    "reason": "视频播放器"
}

// 示例2：排除模态框
{
    "className": "modal dialog popup overlay",
    "excludeChildren": true,
    "reason": "模态框"
}
```

### 2. 自定义函数规则（高级）

使用JavaScript函数进行复杂判断，灵活强大。

**函数签名：**

```javascript
/**
 * @param {HTMLElement} div - 当前检查的DOM元素
 * @param {string} currentHost - 当前网站域名
 * @returns {boolean} - true: 排除该元素, false: 不排除
 */
```

**基础示例：**

```javascript
// 示例1：排除按钮元素
const style = getComputedStyle(div);
return style.cursor === 'pointer' || 
       div.getAttribute('role') === 'button';

// 示例2：排除大尺寸元素
return div.offsetWidth > 1000 && div.offsetHeight > 500;

// 示例3：排除包含特定文本的元素
return div.textContent.includes('广告');

// 示例4：排除特定网站的特定元素
if (currentHost.includes('youtube.com')) {
    return div.id === 'movie_player';
}
return false;
```

### 规则辅助函数

脚本提供了多个辅助函数，可在自定义规则中直接使用：

| 函数名 | 功能 | 示例 |
|--------|------|------|
| `isClickable(div)` | 检查元素是否可点击 | `return isClickable(div);` |
| `isVisible(div)` | 检查元素是否可见 | `return !isVisible(div);` |
| `isSizeInRange(div, minW, maxW, minH, maxH)` | 检查元素尺寸范围 | `return isSizeInRange(div, 0, 300, 0, 100);` |
| `hasStyle(div, property, value)` | 检查元素样式 | `return hasStyle(div, 'position', 'fixed');` |
| `containsText(div, text)` | 检查元素是否包含文本 | `return containsText(div, '广告');` |
| `hasClassPattern(div, pattern)` | 检查class是否匹配正则 | `return hasClassPattern(div, /modal\|dialog/i);` |
| `hasAnimation(div)` | 检查元素是否有动画 | `return hasAnimation(div);` |
| `isFixedHighZIndex(div, minZ)` | 检查是否固定定位且高层级 | `return isFixedHighZIndex(div, 1000);` |

### 规则编辑器特性

- ✅ **行号显示** - 方便定位代码
- ✅ **Tab键缩进** - 4空格缩进支持
- ✅ **代码统计** - 实时显示行数和字符数
- ✅ **格式化** - 一键格式化代码
- ✅ **语法检查** - 实时验证函数语法
- ✅ **规则测试** - 测试规则是否正确

## 🎯 实用规则示例库

### 📺 视频相关

```json
// 排除视频播放器
{
    "selector": "video, .video-player, [class*='player']",
    "excludeChildren": true,
    "reason": "视频播放器"
}
```

```javascript
// 排除包含视频的容器
return div.querySelector('video') !== null;
```

### 🎨 UI组件

```json
// 排除模态框
{
    "className": "modal dialog popup overlay lightbox",
    "excludeChildren": true,
    "reason": "模态框"
}
```

```javascript
// 排除按钮元素
return isClickable(div);
```

### 🔘 交互元素

```javascript
// 排除小尺寸可交互元素
const rect = div.getBoundingClientRect();
return rect.width < 300 && rect.height < 100 && isClickable(div);
```

### 📐 布局元素

```json
// 排除导航栏
{
    "selector": "nav, header, [role='navigation']",
    "excludeChildren": true,
    "reason": "导航栏"
}
```

### 🎭 特定网站

```javascript
// YouTube播放器
if (currentHost.includes('youtube.com')) {
    return div.id === 'movie_player';
}
return false;
```

## ⚙️ 配置说明

### 网站黑名单配置

**内置黑名单：**
```
- localhost
- 127.0.0.1
- github.com
- docs.google.com
- *.google.com（正则匹配）
```

**添加自定义黑名单：**
1. 打开控制面板
2. 点击"🚫 排除当前网站"
3. 确认添加

### 颜色配置

**预设颜色：**

| 名称 | 颜色值 | 效果 |
|------|--------|------|
| 豆沙绿 | `rgba(199, 237, 204, 0.8)` | 经典护眼色 |
| 浅灰 | `rgba(200, 200, 200, 0.8)` | 柔和灰色 |
| 米黄 | `rgba(255, 245, 220, 0.8)` | 温暖米黄 |
| 浅蓝 | `rgba(230, 240, 255, 0.8)` | 清新蓝色 |

### 按钮位置配置

- ✅ 支持拖拽移动
- ✅ 自动吸附到最近的边缘
- ✅ 位置自动记忆
- ✅ 页面缩放时自动调整

## 🔧 高级功能

### 调试模式

开启调试模式后，鼠标悬停在元素上会显示：
- ✅ 应用豆沙绿
- 🚫 排除原因

**使用方法：**
1. 打开控制面板
2. 点击"🔍 调试模式"
3. 鼠标悬停在元素上查看信息

### 规则测试

在添加或编辑规则时，可以点击"🧪 测试规则"验证：
- ✅ 语法是否正确
- ✅ 函数是否能正常执行
- ✅ 返回值是否符合预期

### 数据管理

**存储位置：** 浏览器 localStorage

**存储内容：**
```javascript
{
    "bean_green_exclusion_rules": "自定义排除规则",
    "bean_green_website_blacklist": "网站黑名单",
    "bean_green_color": "自定义颜色",
    "bean_green_btn_position": "按钮位置"
}
```

**清空所有数据：**
1. 打开控制面板
2. 点击"🗑️ 清空所有自定义数据"
3. 确认清空

**备份数据：**
```javascript
// 导出所有配置
const config = {
    rules: localStorage.getItem('bean_green_exclusion_rules'),
    blacklist: localStorage.getItem('bean_green_website_blacklist'),
    color: localStorage.getItem('bean_green_color'),
    position: localStorage.getItem('bean_green_btn_position')
};
console.log(JSON.stringify(config, null, 2));
```

**恢复数据：**
```javascript
// 导入配置
const config = JSON.parse('你的备份数据');
localStorage.setItem('bean_green_exclusion_rules', config.rules);
localStorage.setItem('bean_green_website_blacklist', config.blacklist);
localStorage.setItem('bean_green_color', config.color);
localStorage.setItem('bean_green_btn_position', config.position);
location.reload();
```

## 📖 常见问题

### Q1: 为什么某些网站没有效果？


这是一个轻量的 userscript（例如配合 Tampermonkey/Violentmonkey 使用），用于将页面元素的背景统一替换为“豆沙绿”等缓和色以降低视觉刺激。

**快速开始**
- 安装：将 `Plugin.js` 作为 userscript 安装到你的浏览器扩展（Tampermonkey/Violentmonkey/Greasemonkey）。
- 打开任意网页，页面右上角会出现一个悬浮按钮，点击可打开控制面板进行配置。

**主要功能**
- 全页面 div/header 背景替换为可配置的颜色（默认：豆沙绿）。
- 内置并可编辑的排除规则（`DEFAULT_EXCLUSION_RULES`），避免修改关键交互或媒体区域。
- 支持自定义规则（JSON 或自定义函数形式），并可保存到本地。
- 增量观察 DOM（MutationObserver）与 SPA（history push/replace/popstate）支持，导航或局部更新后会尝试自动恢复样式和控制面板。
- UI 隔离：控制面板和快捷按钮挂载到 `document.documentElement` 并使用样式重置，避免被站点样式覆盖。

**订阅在线排除规则（新功能）**
- 默认订阅地址：
    - https://raw.githubusercontent.com/wasl2002/Web-page-background-color/main/exclusionRule.js
- 功能说明：可以订阅远程规则仓库，程序会尝试解析常见的 JS/JSON 导出格式并将规则合并到本地排除规则中。
- 缓存与刷新策略：
    - 已拉取的订阅规则会缓存在本地（localStorage），缓存键为 `bean_green_subscriptions_cache`。
    - 程序启动时优先使用缓存（若未过期），对于过期或未缓存的订阅会在后台异步刷新并更新缓存与规则集合。
    - 默认刷新间隔为 24 小时（可通过 localStorage 键 `bean_green_subscription_interval` 自定义，最小允许间隔为 1 小时）。
- 在控制面板中选择 “管理订阅” 可添加/删除订阅地址、手动拉取并测试解析结果。

**存储键一览（localStorage）**
- `bean_green_color`：当前使用的 RGBA 颜色字符串。
- `bean_green_exclusion_rules`：用户自定义排除规则数组（JSON）。
- `bean_green_website_blacklist`：用户自定义网站黑名单数组（JSON）。
- `bean_green_rule_subscriptions`：订阅地址列表（JSON）。
- `bean_green_subscriptions_cache`：订阅内容缓存（JSON，按 URL 存储规则数组与抓取时间）。
- `bean_green_subscription_interval`：订阅自动刷新间隔（毫秒）。
- `bean_green_btn_position`：快捷按钮位置（JSON）。

**调试与故障排查**
- 当你在某些站点发现结果元素被隐藏（例如被设置为 `display:none`），脚本会尝试移除该元素的内联 `display` 并恢复可见。
- 如果订阅解析失败，可以在“管理订阅”中使用“测试”功能查看解析结果；若仍失败，请把远程 URL 的原始响应内容粘出来，脚本会尝试兼容更多格式。

**文件与代码位置**
- 主脚本：`Plugin.js`（所有逻辑和 UI 均在该文件中实现）

**贡献**
- 欢迎提交 issue 与 PR，尤其是为更多站点补充更精确的排除规则或改进解析与缓存策略。

---
更新：已增加订阅、缓存与定时刷新功能，以及更健壮的远程规则解析。若需我把“订阅刷新间隔设置”加入面板 UI，我可以继续实现。
1. ✅ 该网站在黑名单中
2. ✅ 该网站使用了 iframe 嵌入内容
3. ✅ 该网站的样式优先级更高
- 等待页面完全加载
- 刷新页面重试

### Q2: 为什么某些元素没有被排除？

**可能原因：**
1. ✅ 没有匹配的排除规则
2. ✅ 规则的 `excludeChildren` 设置为 false
3. ✅ 元素在选择器匹配之外

**解决方法：**
1. 开启调试模式查看元素状态
2. 添加自定义排除规则
3. 检查规则语法是否正确

### Q3: 如何排除整个页面？

**方法1：添加网站到黑名单**
```
控制面板 → 🚫 排除当前网站
```

**方法2：添加规则**
```json
{
    "selector": "body",
    "excludeChildren": true,
    "reason": "整个页面"
}
```

### Q4: 规则的执行顺序是什么？

```
内置规则（按数组顺序）
    ↓
自定义规则（按添加顺序）
    ↓
第一个匹配的规则生效
```

### Q5: 如何备份和恢复规则？

**备份：**
```javascript
console.log(localStorage.getItem('bean_green_exclusion_rules'));
```

**恢复：**
```javascript
localStorage.setItem('bean_green_exclusion_rules', '你的备份数据');
location.reload();
```

### Q6: 为什么按钮位置不对？

**解决方法：**
1. 手动拖拽到想要的位置
2. 清空浏览器数据重置位置：
   ```javascript
   localStorage.removeItem('bean_green_btn_position');
   location.reload();
   ```

### Q7: 自定义函数规则报错怎么办？

**常见错误：**
1. ❌ 语法错误 - 检查JavaScript语法
2. ❌ 未定义变量 - 确保变量已声明
3. ❌ 函数参数错误 - 使用正确的参数名（div, currentHost）

**调试方法：**
```javascript
// 在函数中添加调试信息
console.log('元素:', div);
console.log('域名:', currentHost);
```

### Q8: 如何查看当前所有规则？

```javascript
// 在控制台执行
console.table(exclusionRules.map(r => ({
    类型: r.customCheck ? '自定义函数' : '选择器',
    说明: r.reason,
    排除子元素: r.excludeChildren ? '是' : '否'
})));
```

## 🛠️ 开发指南

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/yourusername/bean-green-background.git

# 2. 进入目录
cd bean-green-background

# 3. 在浏览器中安装 Tampermonkey

# 4. 创建新脚本，复制代码

# 5. 保存并测试
```

### 代码结构

```
豆沙绿背景.user.js
│
├── 📋 网站黑名单配置
│   └── WEBSITE_BLACKLIST
│
├── ⚙️ 基础配置
│   ├── BEAN_GREEN (颜色)
│   ├── STORAGE_KEY (存储键)
│   └── CLASS_* (CSS类名)
│
├── 🛠️ 规则辅助函数
│   ├── isClickable()
│   ├── isVisible()
│   ├── isSizeInRange()
│   ├── hasStyle()
│   ├── containsText()
│   ├── hasClassPattern()
│   ├── hasAnimation()
│   └── isFixedHighZIndex()
│
├── 📦 默认排除规则
│   └── DEFAULT_EXCLUSION_RULES
│
├── 💾 存储功能
│   ├── loadCustomRules()
│   ├── saveCustomRules()
│   ├── loadCustomWebsiteBlacklist()
│   └── saveCustomWebsiteBlacklist()
│
├── 🔍 核心功能
│   ├── checkRule() - 规则匹配
│   ├── compareValue() - 值比较
│   ├── applyBeanGreen() - 应用背景
│   ├── injectStyle() - 注入样式
│   └── observeDOM() - DOM监听
│
├── 🎨 用户界面
│   ├── createControlPanel() - 控制面板
│   ├── createCodeEditor() - 代码编辑器
│   ├── showAddRuleDialog() - 添加规则对话框
│   ├── showRulesManager() - 规则管理器
│   ├── editRule() - 编辑规则
│   └── deleteRule() - 删除规则
│
└── 🚀 初始化
    └── init()
```

### 添加新的辅助函数

```javascript
// 1. 在"规则辅助函数"区域添加
function myHelper(div) {
    // 你的逻辑
    return true/false;
}

// 2. 在规则中使用
{
    customCheck: (div) => {
        return myHelper(div);
    },
    excludeChildren: false,
    reason: '我的规则'
}
```

### 调试技巧

```javascript
// 1. 输出当前规则
console.log(exclusionRules);

// 2. 测试单个元素
const div = document.querySelector('选择器');
exclusionRules.forEach(rule => {
    if (rule.customCheck) {
        console.log(rule.reason, rule.customCheck(div, window.location.hostname));
    }
});

// 3. 查看存储的数据
console.log(localStorage.getItem('bean_green_exclusion_rules'));

// 4. 查看应用的元素数量
console.log('已应用:', document.querySelectorAll('div:not(.bean-green-excluded)').length);
console.log('已排除:', document.querySelectorAll('div.bean-green-excluded').length);
```

### 性能优化建议

1. **减少 getComputedStyle 调用**
   ```javascript
   // ❌ 不好
   if (getComputedStyle(div).position === 'fixed') { ... }
   if (getComputedStyle(div).zIndex > 1000) { ... }
   
   // ✅ 好
   const style = getComputedStyle(div);
   if (style.position === 'fixed' && parseInt(style.zIndex) > 1000) { ... }
   ```

2. **使用辅助函数**
   ```javascript
   // ❌ 不好
   const style = getComputedStyle(div);
   return style.cursor === 'pointer';
   
   // ✅ 好
   return isClickable(div);
   ```

3. **避免复杂的DOM查询**
   ```javascript
   // ❌ 不好
   return div.querySelectorAll('*').length > 100;
   
   // ✅ 好
   return div.children.length > 10;
   ```

## 📝 更新日志

### v3.6 (2024-01-XX)
- ✨ 新增：代码编辑器支持行号显示
- ✨ 新增：Tab键缩进支持（4空格）
- ✨ 新增：代码格式化功能
- ✨ 新增：规则测试功能
- ✨ 新增：代码统计（行数、字符数）
- 🎨 优化：编辑界面使用模态框替代prompt
- 🎨 优化：规则辅助函数，提高代码可读性
- 🎨 优化：用户界面体验
- 🐛 修复：按钮位置记忆问题
- 📝 文档：完善README文档

### v3.5 (2024-01-XX)
- ✨ 新增：自定义函数规则支持
- ✨ 新增：规则辅助函数库（8个函数）
- ✨ 新增：10+内置排除规则
- 🎨 优化：规则匹配性能
- 📝 文档：添加规则示例

### v3.0 (2024-01-XX)
- ✨ 新增：可视化控制面板
- ✨ 新增：规则管理系统
- ✨ 新增：网站黑名单功能
- ✨ 新增：颜色自定义功能
- 🎨 优化：用户界面体验

### v2.0 (2024-01-XX)
- ✨ 新增：可拖拽快捷按钮
- ✨ 新增：排除规则系统
- 🎨 优化：性能优化

### v1.0 (2024-01-XX)
- 🎉 初始版本
- ✨ 基础功能：自动应用豆沙绿背景

## 🤝 贡献指南

欢迎贡献代码、报告Bug、提出新功能建议！

### 如何贡献

1. **Fork 本仓库**
   ```bash
   git clone https://github.com/yourusername/bean-green-background.git
   ```

2. **创建特性分支**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **提交更改**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **推送到分支**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **开启 Pull Request**

### 报告Bug

请使用 [GitHub Issues](https://github.com/yourusername/bean-green-background/issues) 报告Bug，包括：

- 📋 问题描述
- 🔄 复现步骤
- ✅ 预期行为
- ❌ 实际行为
- 💻 浏览器版本
- 📸 截图（如果有）

### 功能建议

欢迎在 [GitHub Issues](https://github.com/yourusername/bean-green-background/issues) 中提出功能建议！

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

```
MIT License

Copyright (c) 2024 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 致谢

感谢所有贡献者和用户的反馈与支持！

特别感谢：
- **Tampermonkey** 团队提供的优秀用户脚本管理器
- 所有提出建议和报告Bug的用户
- 所有贡献代码的开发者

## 📮 联系方式

- **GitHub**: [@yourusername](https://github.com/yourusername)
- **问题反馈**: [GitHub Issues](https://github.com/yourusername/bean-green-background/issues)
- **功能建议**: [GitHub Discussions](https://github.com/yourusername/bean-green-background/discussions)

## ⭐ Star History

如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/bean-green-background&type=Date)](https://star-history.com/#yourusername/bean-green-background&Date)

---

**Made with ❤️ by [Your Name](https://github.com/yourusername)**
