// ==UserScript==
// @name         豆沙绿背景 - 护眼浏览器背景色
// @namespace    https://greasyfork.org/zh-CN/users/was-2026
// @version      3.6
// @description  将网页所有div背景设置为豆沙绿护眼色，支持自定义排除规则、网站黑名单、拖拽按钮等功能，极致性能优化
// @author       你的名字
// @match        *://*/*
// @grant        none
// @run-at       document-start
// @license      MIT
// @supportURL   https://github.com/你的用户名/你的仓库/issues
// @homepageURL  https://github.com/你的用户名/你的仓库
// @exclude      *://youtube.com/*
// @exclude      *://bilibili.com/*
// @exclude      *://1*/*
// ==/UserScript==

(function () {
    'use strict';
    // ==================== 代码编辑器组件 ====================

    /**
     * 创建带行号的代码编辑器
     * @param {string} id - 编辑器ID
     * @param {string} placeholder - 占位符文本
     * @param {string} initialCode - 初始代码
     * @returns {HTMLElement} - 编辑器容器
     */
    function createCodeEditor(id, placeholder = '', initialCode = '') {
        const container = document.createElement('div');
        container.className = CLASS_PANEL;
        container.style.cssText = 'position: relative; width: 100%; margin-bottom: 15px;';

        container.innerHTML = `
        <div style="display: flex; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; background: #fafafa;">
            <!-- 行号区域 -->
            <div id="${id}-line-numbers" style="
                width: 40px;
                background: #f5f5f5;
                border-right: 1px solid #ddd;
                padding: 8px 5px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.5;
                text-align: right;
                color: #999;
                user-select: none;
                overflow: hidden;
            ">1</div>

            <!-- 代码编辑区域 -->
            <textarea
                id="${id}"
                placeholder="${placeholder}"
                style="
                    flex: 1;
                    min-height: 200px;
                    padding: 8px;
                    border: none;
                    font-family: 'Courier New', Consolas, monospace;
                    font-size: 12px;
                    line-height: 1.5;
                    resize: vertical;
                    outline: none;
                    background: #fafafa;
                    color: #333;
                "
                spellcheck="false"
            >${initialCode}</textarea>
        </div>

        <!-- 工具栏 -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px; font-size: 11px; color: #666;">
            <div>
                <span id="${id}-line-count">行数: 1</span>
                <span style="margin-left: 10px;" id="${id}-char-count">字符: 0</span>
            </div>
            <div>
                <button class="btn-format-code" data-editor="${id}" style="background: #e7f3ff; border: 1px solid #0056b3; padding: 2px 8px; border-radius: 3px; cursor: pointer; font-size: 11px; color: #0056b3;">格式化</button>
                <button class="btn-clear-editor" data-editor="${id}" style="background: #fff; border: 1px solid #ddd; padding: 2px 8px; border-radius: 3px; cursor: pointer; font-size: 11px; margin-left: 5px;">清空</button>
            </div>
        </div>
    `;

        // 获取元素
        const textarea = container.querySelector(`#${id}`);
        const lineNumbers = container.querySelector(`#${id}-line-numbers`);
        const lineCount = container.querySelector(`#${id}-line-count`);
        const charCount = container.querySelector(`#${id}-char-count`);

        // 更新行号
        function updateLineNumbers() {
            const lines = textarea.value.split('\n');
            const lineNumbersHtml = lines.map((_, i) => i + 1).join('<br>');
            lineNumbers.innerHTML = lineNumbersHtml;

            // 更新统计
            lineCount.textContent = `行数: ${lines.length}`;
            charCount.textContent = `字符: ${textarea.value.length}`;
        }

        // 同步滚动
        textarea.addEventListener('scroll', () => {
            lineNumbers.scrollTop = textarea.scrollTop;
        });

        // 监听输入
        textarea.addEventListener('input', updateLineNumbers);
        textarea.addEventListener('keydown', (e) => {
            // Tab键支持
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + 4;
                updateLineNumbers();
            }
        });

        // 初始化
        updateLineNumbers();

        // 工具栏按钮事件
        container.querySelector('.btn-format-code').addEventListener('click', () => {
            // 简单的代码格式化（去除多余空行）
            const lines = textarea.value.split('\n');
            const formatted = lines
                .map(line => line.trimEnd()) // 去除行尾空格
                .join('\n')
                .replace(/\n{3,}/g, '\n\n'); // 最多保留一个空行
            textarea.value = formatted;
            updateLineNumbers();
        });

        container.querySelector('.btn-clear-editor').addEventListener('click', () => {
            if (confirm('确定要清空代码吗？')) {
                textarea.value = '';
                updateLineNumbers();
            }
        });

        return container;
    }

    /**
     * 从编辑器获取代码
     * @param {string} id - 编辑器ID
     * @returns {string} - 代码内容
     */
    function getCodeFromEditor(id) {
        const textarea = document.getElementById(id);
        return textarea ? textarea.value.trim() : '';
    }


    // ==================== 网站黑名单配置 ====================

    const WEBSITE_BLACKLIST = [
        'localhost',
        '127.0.0.1',
        'github.com',
        'docs.google.com',
        {
            pattern: /.*\.google\.com$/,
            reason: 'Google所有子域名'
        }
    ];

    function isWebsiteBlacklisted() {
        const currentHost = window.location.hostname;

        for (const item of WEBSITE_BLACKLIST) {
            if (typeof item === 'string') {
                if (currentHost.includes(item) || item.includes(currentHost)) {
                    return true;
                }
            } else if (item.pattern && item.pattern instanceof RegExp) {
                if (item.pattern.test(currentHost)) {
                    return true;
                }
            }
        }

        // 检查用户自定义黑名单（简单字符串匹配）
        if (customWebsiteBlacklist && customWebsiteBlacklist.length) {
            for (const site of customWebsiteBlacklist) {
                if (!site) continue;
                try {
                    if (currentHost.includes(site) || site.includes(currentHost)) {
                        return true;
                    }
                } catch (e) {
                    // 忽略异常并继续
                }
            }
        }

        return false;
    }

    // 先加载用户自定义黑名单，再做统一检查（避免时序不一致）
    // 提前声明，避免在函数执行时遇到 TDZ（暂时性死区）
    let exclusionRules = [];
    let customWebsiteBlacklist = [];

    // 延迟加载自定义黑名单并检查是否需要停止脚本（在配置常量声明后执行）

    // ==================== 配置区域 ====================

    const BEAN_GREEN = 'rgba(199, 237, 204, 0.8)';
    const STORAGE_KEY = 'bean_green_exclusion_rules';
    const WEBSITE_BLACKLIST_STORAGE_KEY = 'bean_green_website_blacklist';

    const CLASS_EXCLUDED = 'bean-green-excluded';
    const CLASS_EXCLUDE_CHILDREN = 'bean-green-exclude-children';
    const CLASS_PANEL = 'bean-green-panel';

    const BTN_POSITION_KEY = 'bean_green_btn_position'; // 新增：按钮位置存储key
    const COLOR_STORAGE_KEY = 'bean_green_color'; // 新增：颜色存储key

    // 先加载用户自定义黑名单，再做统一检查（避免时序不一致）
    loadCustomWebsiteBlacklist();
    if (isWebsiteBlacklisted()) {
        console.log('[豆沙绿] 当前网站在黑名单中，脚本不执行');
        return;
    }

    // ==================== 规则辅助函数 ====================
    // 这些函数可以在 DEFAULT_EXCLUSION_RULES 的 customCheck 中直接使用

    /**
     * 检查元素是否可点击
     * @param {HTMLElement} div - 要检查的元素
     * @returns {boolean} - 是否可点击
     */
    function isClickable(div) {
        const style = window.getComputedStyle(div);
        return style.cursor === 'pointer' ||
            div.onclick !== null ||
            div.hasAttribute('onclick') ||
            div.getAttribute('role') === 'button' ||
            div.getAttribute('role') === 'link' ||
            div.tagName === 'BUTTON' ||
            div.getAttribute('type') === 'button';
    }

    /**
     * 检查元素是否可见
     * @param {HTMLElement} div - 要检查的元素
     * @returns {boolean} - 是否可见
     */
    function isVisible(div) {
        const style = window.getComputedStyle(div);
        return style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0';
    }

    /**
     * 检查元素尺寸范围
     * @param {HTMLElement} div - 要检查的元素
     * @param {number} minWidth - 最小宽度
     * @param {number} maxWidth - 最大宽度
     * @param {number} minHeight - 最小高度
     * @param {number} maxHeight - 最大高度
     * @returns {boolean} - 是否在尺寸范围内
     */
    function isSizeInRange(div, minWidth, maxWidth, minHeight, maxHeight) {
        const rect = div.getBoundingClientRect();
        return rect.width >= minWidth && rect.width <= maxWidth &&
            rect.height >= minHeight && rect.height <= maxHeight;
    }

    /**
     * 检查元素是否有特定样式
     * @param {HTMLElement} div - 要检查的元素
     * @param {string} property - CSS属性名
     * @param {string} value - CSS属性值
     * @returns {boolean} - 是否匹配
     */
    function hasStyle(div, property, value) {
        const style = window.getComputedStyle(div);
        return style[property] === value;
    }

    /**
     * 检查元素是否包含特定文本
     * @param {HTMLElement} div - 要检查的元素
     * @param {string} text - 要查找的文本
     * @returns {boolean} - 是否包含
     */
    function containsText(div, text) {
        return div.textContent.includes(text);
    }

    /**
     * 检查元素是否有特定class（支持正则）
     * @param {HTMLElement} div - 要检查的元素
     * @param {RegExp} pattern - 正则表达式
     * @returns {boolean} - 是否匹配
     */
    function hasClassPattern(div, pattern) {
        const classes = Array.from(div.classList);
        return classes.some(cls => pattern.test(cls));
    }

    /**
     * 检查元素是否有动画
     * @param {HTMLElement} div - 要检查的元素
     * @returns {boolean} - 是否有动画
     */
    function hasAnimation(div) {
        const style = window.getComputedStyle(div);
        return style.animation !== 'none 0s ease 0s normal none running none' ||
            style.transition !== 'all 0s ease 0s';
    }

    /**
     * 检查元素是否是固定定位且高层级
     * @param {HTMLElement} div - 要检查的元素
     * @param {number} minZIndex - 最小z-index
     * @returns {boolean} - 是否匹配
     */
    function isFixedHighZIndex(div, minZIndex = 1000) {
        const style = window.getComputedStyle(div);
        return style.position === 'fixed' && (parseInt(style.zIndex) || 0) >= minZIndex;
    }

    // ==================== 默认排除规则 ====================
    const DEFAULT_EXCLUSION_RULES = [
        {
            selector: 'video, .video-player, [class*="player"]',
            excludeChildren: true,
            reason: '视频播放器（含子元素）'
        },
        {
          // header,
            selector: 'nav,  [role="navigation"]',
            excludeChildren: true,
            reason: '导航栏（含子元素）'
        },
        {
            className: 'modal dialog popup overlay',
            excludeChildren: true,
            reason: '模态框（含子元素）'
        },
        {
            selector: 'aside, .sidebar, [class*="sidebar"]',
            excludeChildren: true,
            reason: '侧边栏（含子元素）'
        },
        {
            selector: 'footer, .footer',
            excludeChildren: true,
            reason: '页脚（含子元素）'
        },
        {
            selector: '[class*="ad-"], [class*="advertisement"], [id*="ad-"]',
            excludeChildren: true,
            reason: '广告区域（含子元素）'
        },
        {
            selector: 'input, textarea, [contenteditable="true"]',
            excludeChildren: false,
            reason: '输入框'
        },
        {
            position: {
                type: 'fixed',
                zIndex: '>=1000'
            },
            excludeChildren: true,
            reason: '固定定位的高层级元素（含子元素）'
        },

        // ==================== 自定义函数示例 ====================

        // 示例1：排除按钮元素
        {
            customCheck: (div) => {
                const style = window.getComputedStyle(div);
                const isSmallInteractive = style.cursor === 'pointer' ||
                    div.getAttribute('role') === 'button' ||
                    div.tagName === 'BUTTON' ||
                    div.getAttribute('type') === 'button';
                if (isSmallInteractive) {
                    // console.log(1)
                }
                return isSmallInteractive & 0;
            },
            excludeChildren: false,
            reason: '按钮元素'
        },

        // 示例2：排除特定的交互元素
        {
            customCheck: (div) => {
                // 排除可点击的卡片
                const hasClickHandler = div.onclick !== null ||
                    div.hasAttribute('onclick') ||
                    div.getAttribute('role') === 'link';

                // 排除小尺寸的可交互元素
                const rect = div.getBoundingClientRect();
                const isSmallInteractive = rect.width < 300 && rect.height < 100 && hasClickHandler;
                if (isSmallInteractive) {
                    // console.log(2)
                }
                return isSmallInteractive;
            },
            excludeChildren: true,
            reason: '可交互元素'
        },

        // 示例3：排除动画元素
        {
            customCheck: (div) => {
                const style = window.getComputedStyle(div);
                const isSmallInteractive = style.animation !== 'none 0s ease 0s normal none running none' ||
                    style.transition !== 'all 0s ease 0s';
                if (isSmallInteractive) {
                    // console.log(3,div)
                }
                return isSmallInteractive & 0;
            },
            excludeChildren: false,
            reason: '动画元素'
        },

        // 示例4：排除iframe容器
        {
            customCheck: (div) => {
                const isSmallInteractive = div.querySelector('iframe') !== null;
                if (isSmallInteractive) {
                    // console.log(4)
                }
                return isSmallInteractive;
            },
            excludeChildren: true,
            reason: 'iframe容器'
        },

        // 示例5：排除特定网站的特殊元素
        {
            customCheck: (div, currentHost) => {
                // YouTube
                if (currentHost.includes('youtube.com')) {
                    return div.id === 'movie_player' ||
                        div.classList.contains('html5-video-player');
                }

                // B站
                if (currentHost.includes('bilibili.com')) {
                    return div.classList.contains('bilibili-player') ||
                        div.id === 'bilibili-player';
                }

                // zhihu
                if (currentHost.includes('zhihu.com')) {
                  // console.log('zhihu.com',div.classList[0],div.classList[0].includes('css-'),div.classList,div)
                    return div.classList.length==1&&(div.classList[0].includes('css-'));
                }

                // console.log(5,div, currentHost)
                return false;
            },
            excludeChildren: true,
            reason: '特定网站播放器'
        },

        // 示例6：排除下拉菜单
        {
            customCheck: (div) => {
                const isSmallInteractive = div.getAttribute('role') === 'menu' ||
                    div.getAttribute('role') === 'listbox' ||
                    div.classList.contains('dropdown') ||
                    div.classList.contains('select-dropdown');
                if (isSmallInteractive) {
                    // console.log(6)
                }
                return isSmallInteractive;
            },
            excludeChildren: true,
            reason: '下拉菜单'
        },

        // 示例7：排除工具提示
        {
            customCheck: (div) => {
                const classes = Array.from(div.classList);
                const isSmallInteractive = classes.some(cls =>
                    cls.toLowerCase().includes('tooltip') ||
                    cls.toLowerCase().includes('popover')
                ) || div.getAttribute('role') === 'tooltip';
                if (isSmallInteractive) {
                    // console.log(7,div)
                }
                return isSmallInteractive;
            },
            excludeChildren: true,
            reason: '工具提示'
        },

        // 示例8：排除滑块/轮播图
        {
            customCheck: (div) => {
                const isSmallInteractive = div.classList.contains('slider') ||
                    div.classList.contains('carousel') ||
                    div.classList.contains('swiper') ||
                    div.getAttribute('role') === 'slider';
                if (isSmallInteractive) {
                    // console.log(8)
                }
                return isSmallInteractive;
            },
            excludeChildren: true,
            reason: '滑块/轮播图'
        }
    ];

    let applyTimeout = null;

    // ==================== 存储功能 ====================

    function loadCustomRules() {
        try {
            const savedRules = localStorage.getItem(STORAGE_KEY);
            const customRules = savedRules ? JSON.parse(savedRules) : [];
            exclusionRules = [...DEFAULT_EXCLUSION_RULES, ...customRules];
            console.log('[豆沙绿] 已加载排除规则:', exclusionRules.length, '条');
        } catch (e) {
            console.warn('[豆沙绿] 加载自定义规则失败', e);
            exclusionRules = [...DEFAULT_EXCLUSION_RULES];
        }
    }

    function saveCustomRules(rules) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
            loadCustomRules();
        } catch (e) {
            console.error('[豆沙绿] 保存规则失败', e);
        }
    }

    function loadCustomWebsiteBlacklist() {
        try {
            const saved = localStorage.getItem(WEBSITE_BLACKLIST_STORAGE_KEY);
            customWebsiteBlacklist = saved ? JSON.parse(saved) : [];
        } catch (e) {
            customWebsiteBlacklist = [];
        }
    }

    function saveCustomWebsiteBlacklist(list) {
        try {
            localStorage.setItem(WEBSITE_BLACKLIST_STORAGE_KEY, JSON.stringify(list));
            customWebsiteBlacklist = list;
        } catch (e) {
            console.error('[豆沙绿] 保存网站黑名单失败', e);
        }
    }

    // ==================== 核心功能 ====================

    function checkRule(div, rule, currentHost, computedStyle) {
        // ==================== 1. 网站限制 ====================
        if (rule.website && !currentHost.includes(rule.website)) {
            return false;
        }

        // ==================== 2. 选择器匹配 ====================
        if (rule.selector) {
            try {
                if (div.matches(rule.selector)) {
                    return true;
                }
            } catch (e) { }
        }

        // ==================== 3. ID 匹配 ====================
        if (rule.id && div.id === rule.id) {
            return true;
        }

        // ==================== 4. 类名匹配 ====================
        if (rule.className || rule.class) {
            const classNames = rule.className || rule.class;
            const classes = classNames.split(/\s+/);
            for (const cls of classes) {
                if (div.classList.contains(cls)) {
                    return true;
                }
            }
        }

        // ==================== 5. 数据属性匹配 ====================
        if (rule.dataAttrs) {
            for (const [key, value] of Object.entries(rule.dataAttrs)) {
                if (div.getAttribute(key) === value) {
                    return true;
                }
            }
        }

        // ==================== 6. 位置匹配 ====================
        if (rule.position) {
            const style = computedStyle || window.getComputedStyle(div);
            const position = style.position;
            const zIndex = parseInt(style.zIndex) || 0;

            if (rule.position.type && position === rule.position.type) {
                if (rule.position.zIndex) {
                    if (compareValue(zIndex, rule.position.zIndex)) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }

        // ==================== 7. 尺寸匹配 ====================
        if (rule.size) {
            const rect = div.getBoundingClientRect();

            if (rule.size.width && compareValue(rect.width, rule.size.width)) {
                return true;
            }
            if (rule.size.height && compareValue(rect.height, rule.size.height)) {
                return true;
            }
        }

        // ==================== 8. 自定义函数判断 ====================
        if (rule.customCheck && typeof rule.customCheck === 'function') {
            try {
                const result = rule.customCheck(div, currentHost);
                if (result) {
                    return true;
                }
            } catch (e) {
                console.warn('[豆沙绿] 自定义函数执行错误:', e);
            }
        } else if (rule.customCheck && typeof rule.customCheck === 'string') {
            // 支持字符串形式的函数（用户自定义规则）
            try {
                const customFunc = new Function('div', 'currentHost', rule.customCheck);
                const result = customFunc(div, currentHost);
                if (result) {
                    return true;
                }
            } catch (e) {
                console.warn('[豆沙绿] 自定义函数执行错误:', e);
            }
        }

        return false;
    }



    function compareValue(actual, condition) {
        const operators = ['>=', '<=', '>', '<', '='];

        for (const op of operators) {
            if (condition.startsWith(op)) {
                const target = parseFloat(condition.substring(op.length));
                switch (op) {
                    case '>=': return actual >= target;
                    case '<=': return actual <= target;
                    case '>': return actual > target;
                    case '<': return actual < target;
                    case '=': return actual === target;
                }
            }
        }

        return actual === parseFloat(condition);
    }

    // 应用豆沙绿背景（带防抖）
    function applyBeanGreen() {
        if (applyTimeout) {
            clearTimeout(applyTimeout);
        }

        applyTimeout = setTimeout(()=>{
            if (typeof requestIdleCallback === 'function') {
                requestIdleCallback(() => applyBeanGreenNow());
            } else {
                applyBeanGreenNow();
            }
        }, 200);
    }

    // 立即应用
    function applyBeanGreenNow() {
        const currentHost = window.location.hostname;
        const TARGET_SELECTOR = `div:not(.${CLASS_PANEL}):not(.${CLASS_EXCLUDED}):not(.${CLASS_EXCLUDE_CHILDREN}), header:not(.${CLASS_PANEL}):not(.${CLASS_EXCLUDED}):not(.${CLASS_EXCLUDE_CHILDREN})`;
        const divs = document.querySelectorAll(TARGET_SELECTOR);

        let excludedCount = 0;
        let appliedCount = 0;

        for (const div of divs) {
            // 跳过控制面板
            if (div.closest(`.${CLASS_PANEL}`)) {
                continue;
            }

            const computedStyle = window.getComputedStyle(div);

            // 检查是否在需要排除子元素的父元素内部
            if (div.closest(`.${CLASS_EXCLUDE_CHILDREN}`)) {
                if (!div.classList.contains(CLASS_EXCLUDED)) {
                    div.classList.add(CLASS_EXCLUDED);
                }
                excludedCount++;
                continue;
            }

            // 检查是否匹配排除规则
            let isExcluded = false;
            let matchedRule = null;

            for (const rule of exclusionRules) {
                if (checkRule(div, rule, currentHost, computedStyle)) {
                    isExcluded = true;
                    matchedRule = rule;
                    // console.log("已排除1:",div, rule, currentHost,computedStyle)
                    break;
                }
            }

            if (isExcluded) {
                if (!div.classList.contains(CLASS_EXCLUDED)) {
                    div.classList.add(CLASS_EXCLUDED);
                }
                excludedCount++;

                if (matchedRule && matchedRule.excludeChildren === true) {
                    if (!div.classList.contains(CLASS_EXCLUDE_CHILDREN)) {
                        div.classList.add(CLASS_EXCLUDE_CHILDREN);
                    }
                }
            } else {
                appliedCount++;
            }
        }

        console.log(`[豆沙绿] 已应用: ${appliedCount}, 已排除: ${excludedCount}`);

        // 检测是否真正生效，若失效则自动修复
        setTimeout(() => {
            try { checkAndRepair(); } catch (e) { }
        }, 300);
    }

    // 注入CSS样式
    // 注入CSS样式
    function injectStyle() {
        const oldStyle = document.getElementById('bean-green-style');
        if (oldStyle) {
            oldStyle.remove();
        }

        const style = document.createElement('style');
        style.id = 'bean-green-style';

        // 获取用户自定义颜色，如果没有则使用默认豆沙绿
        const bgColor = localStorage.getItem('bean_green_color') || BEAN_GREEN;

                style.textContent = `
                /* 控制面板及其内部元素保持原样 */
                .bean-green-panel,
                .bean-green-panel * {
                   /*  background-color: initial !important; */
                }

                /* 豆沙绿背景 - 排除控制面板和已标记的元素。使用 !important 覆盖页面内联样式 */
                div:not(.bean-green-panel):not(.bean-green-excluded):not(.bean-green-exclude-children),
                header:not(.bean-green-panel):not(.bean-green-excluded):not(.bean-green-exclude-children) {
                        background-color: ${bgColor} !important;
                }

                /* 排除子元素的所有后代，恢复初始背景 */
                .bean-green-exclude-children div,
                .bean-green-exclude-children header {
                    background-color: initial !important;
                }

                /* 确保排除元素本身也恢复初始样式 */
                .bean-green-excluded {
                     background-color: initial !important;
                }
        `;

        if (document.head) {
            document.head.appendChild(style);
        } else if (document.documentElement) {
            document.documentElement.appendChild(style);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                (document.head || document.documentElement).appendChild(style);
            });
        }
    }

    // 监听DOM变化（超轻量版 - 增量处理新增节点以避免全量扫描）
    // 收集新增节点并防抖处理，只对新增的 div/header 或其子孙进行检查
    const _beanGreenPendingNodes = new Set();
    let _beanGreenPendingTimer = null;

    function applyBeanGreenForNodes(nodes) {
        const currentHost = window.location.hostname;
        let excludedCount = 0;
        let appliedCount = 0;

        const elements = [];
        for (const node of nodes) {
            if (!node || node.nodeType !== Node.ELEMENT_NODE) continue;
            if (node.classList && node.classList.contains(CLASS_PANEL)) continue;

            if (node.matches && (node.matches('div') || node.matches('header'))) {
                elements.push(node);
            }

            if (node.querySelectorAll) {
                node.querySelectorAll('div, header').forEach(el => elements.push(el));
            }
        }

        const unique = Array.from(new Set(elements));
        // 分批异步处理，避免一次性阻塞主线程
        const BATCH_SIZE = 200;

        function processRange(start, end) {
            for (let i = start; i < end; i++) {
                const div = unique[i];
                if (!div) continue;
                if (div.closest(`.${CLASS_PANEL}`)) continue;

                if (div.closest(`.${CLASS_EXCLUDE_CHILDREN}`)) {
                    if (!div.classList.contains(CLASS_EXCLUDED)) {
                        div.classList.add(CLASS_EXCLUDED);
                    }
                    excludedCount++;
                    continue;
                }

                const computedStyle = window.getComputedStyle(div);

                let isExcluded = false;
                let matchedRule = null;

                for (const rule of exclusionRules) {
                    if (checkRule(div, rule, currentHost, computedStyle)) {
                        isExcluded = true;
                        matchedRule = rule;
                        // console.log("已排除2:",div, rule, currentHost,computedStyle)
                        break;
                    }
                }

                if (isExcluded) {
                    if (!div.classList.contains(CLASS_EXCLUDED)) {
                        div.classList.add(CLASS_EXCLUDED);
                    }
                    excludedCount++;

                    if (matchedRule && matchedRule.excludeChildren === true) {
                        if (!div.classList.contains(CLASS_EXCLUDE_CHILDREN)) {
                            div.classList.add(CLASS_EXCLUDE_CHILDREN);
                        }
                    }
                } else {
                    appliedCount++;
                }
            }
        }

        function scheduleChunks() {
            if (unique.length === 0) {
                console.log(`[豆沙绿] 增量应用: ${appliedCount}, 已排除: ${excludedCount}`);
                try { checkAndRepair(); } catch (e) {}
                return;
            }

            let index = 0;

            const runNext = (deadline) => {
                const end = Math.min(index + BATCH_SIZE, unique.length);
                processRange(index, end);
                index = end;

                if (index < unique.length) {
                    if (typeof requestIdleCallback === 'function') {
                        requestIdleCallback(runNext);
                    } else {
                        setTimeout(() => runNext(), 0);
                    }
                } else {
                    console.log(`[豆沙绿] 增量应用: ${appliedCount}, 已排除: ${excludedCount}`);
                    try { checkAndRepair(); } catch (e) {}
                }
            };

            if (typeof requestIdleCallback === 'function') {
                requestIdleCallback(runNext);
            } else {
                setTimeout(() => runNext(), 0);
            }
        }

        scheduleChunks();
    }

    function scheduleProcessPendingNodes() {
        if (_beanGreenPendingTimer) clearTimeout(_beanGreenPendingTimer);
        _beanGreenPendingTimer = setTimeout(() => {
            const nodes = Array.from(_beanGreenPendingNodes);
            _beanGreenPendingNodes.clear();
            if (nodes.length === 0) {
                applyBeanGreenNow();
            } else {
                applyBeanGreenForNodes(nodes);
            }
        }, 200);
    }

    function observeDOM() {
        const observer = new MutationObserver((mutations) => {
            let added = false;
            for (const mutation of mutations) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType !== Node.ELEMENT_NODE) continue;
                        if (node.classList && node.classList.contains(CLASS_PANEL)) continue;
                        _beanGreenPendingNodes.add(node);
                        added = true;
                    }
                }
            }

            if (added) {
                scheduleProcessPendingNodes();
            }
        });

        const config = {
            childList: true,
            subtree: true
        };

        const observeTarget = document.documentElement || document.body;
        if (observeTarget) {
            observer.observe(observeTarget, config);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                observer.observe(document.documentElement || document.body, config);
            });
        }
    }

    // ==================== 用户界面 ====================
    function applyCustomColor(color) {
        try {
            localStorage.setItem(COLOR_STORAGE_KEY, color);

            // 更新预览
            const preview = document.getElementById('current-color-preview');
            const text = document.getElementById('current-color-text');
            if (preview) preview.style.background = color;
            if (text) text.textContent = color;

            // 重新注入CSS
            injectStyle();

            alert('✅ 颜色已应用！');
        } catch (e) {
            alert('❌ 颜色应用失败！');
            console.error(e);
        }
    }

    function createControlPanel() {
        // 如果已经存在控制面板或快捷按钮，则不重复创建（支持 SPA 跳转场景）
        if (document.getElementById('bean-green-panel-content') || document.getElementById('bean-green-quick-btn')) {
            return;
        }
        // 读取保存的按钮位置
        const savedPosition = JSON.parse(localStorage.getItem(BTN_POSITION_KEY) || '{}');

        const panel = document.createElement('div');
        panel.className = CLASS_PANEL;

        panel.innerHTML = `
<div class="${CLASS_PANEL} bean-green-exclude-children" id="bean-green-panel-content"
     style="position: fixed; top: 10px; right: 10px; z-index: 999999; background: rgba(199, 237, 204, 1); padding: 20px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); font-family: Arial, sans-serif; min-width: 320px; max-width: 400px; max-height: 80vh; overflow-y: auto; display: none;">
  <div class="bean-green-excluded" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 2px solid block; padding-bottom: 10px;background-color: white;">
    <h3 style="margin: 0; font-size: 16px; color: #333;">🌿 豆沙绿控制面板</h3>
    <button id="btn-close-panel" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #999;">
      ✖
    </button>
  </div>

  <div  class="bean-green-excluded" style="background: #c5daee; padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 12px; color: #666;">
    <div class="bean-green-excluded">当前网站: <strong style="color: #333;">${window.location.hostname}</strong></div>
  </div>

  <div class="bean-green-exclude-children" style="margin-bottom: 15px;">
    <div class="bean-green-excluded" style="font-size: 13px; font-weight: bold; margin-bottom: 8px; color: #333;">📦
      元素排除规则
    </div>
    <button id="btn-add-rule"
            style="width: 100%; padding: 10px; cursor: pointer; border: 1px solid #C7EDCC; background: white; border-radius: 6px; font-weight: bold; color: #333;">
      ➕ 添加新规则
    </button>
    <button id="btn-manage-rules"
            style="width: 100%; padding: 10px; margin-top: 5px; cursor: pointer; border: 1px solid #ddd; background: white; border-radius: 6px;">
      📋 管理规则
    </button>
  </div>

  <div class="bean-green-exclude-children" style="margin-bottom: 15px;">
    <div class="bean-green-exclude-children"
         style="font-size: 13px; font-weight: bold; margin-bottom: 8px; color: #333;">🌐 网站黑名单
    </div>
    <button id="btn-add-website"
            style="width: 100%; padding: 10px; cursor: pointer; border: 1px solid #fff3cd; background: #fff3cd; border-radius: 6px; font-weight: bold; color: #856404;">
      🚫 排除当前网站
    </button>
    <button id="btn-manage-websites"
            style="width: 100%; padding: 10px; margin-top: 5px; cursor: pointer; border: 1px solid #ddd; background: white; border-radius: 6px;">
      📋 管理黑名单
    </button>
  </div>
  <div class="bean-green-exclude-children" style="margin-bottom: 15px;">
    <div class="bean-green-excluded" style="font-size: 13px; font-weight: bold; margin-bottom: 8px; color: #333;">🎨
      背景颜色
    </div>
    <div class="bean-green-exclude-children"
         style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
      <label style="font-size: 12px; color: #666;">当前颜色：</label>
      <div class="bean-green-exclude-children" id="current-color-preview"
           style="width: 30px; height: 30px; border-radius: 4px; border: 1px solid #ddd; background: ${localStorage.getItem(COLOR_STORAGE_KEY) || BEAN_GREEN} !important; "></div>
      <span id="current-color-text" style="font-size: 11px; color: #666; font-family: monospace;">${localStorage.getItem(COLOR_STORAGE_KEY) || BEAN_GREEN}</span>
    </div>
    <div class="bean-green-exclude-children" style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px;">
      <button class="btn-preset-color" data-color="rgba(199, 237, 204, 0.8)"
              style="flex: 1; min-width: 60px; padding: 8px; cursor: pointer; border: 2px solid #ddd; background: rgba(199, 237, 204, 0.8); border-radius: 6px; font-size: 11px;">
        豆沙绿
      </button>
      <button class="btn-preset-color" data-color="rgba(200, 200, 200, 0.8)"
              style="flex: 1; min-width: 60px; padding: 8px; cursor: pointer; border: 2px solid #ddd; background: rgba(200, 200, 200, 0.8); border-radius: 6px; font-size: 11px;">
        浅灰
      </button>
      <button class="btn-preset-color" data-color="rgba(255, 245, 220, 0.8)"
              style="flex: 1; min-width: 60px; padding: 8px; cursor: pointer; border: 2px solid #ddd; background: rgba(255, 245, 220, 0.8); border-radius: 6px; font-size: 11px;">
        米黄
      </button>
      <button class="btn-preset-color" data-color="rgba(230, 240, 255, 0.8)"
              style="flex: 1; min-width: 60px; padding: 8px; cursor: pointer; border: 2px solid #ddd; background: rgba(230, 240, 255, 0.8); border-radius: 6px; font-size: 11px;">
        浅蓝
      </button>
    </div>
    <div class="bean-green-exclude-children" style="display: flex; gap: 5px; margin-bottom: 10px;">
      <label style="font-size: 12px; color: #666; white-space: nowrap;">自定义：</label>
      <input type="color" id="color-picker" value="#c7edcc"
             style="flex: 1; height: 35px; cursor: pointer; border: 1px solid #ddd; border-radius: 6px;">
      <input type="range" id="opacity-slider" min="0" max="100" value="80" style="flex: 1;">
      <span id="opacity-value" style="font-size: 11px; color: #666; min-width: 35px;">80%</span>
    </div>
    <button id="btn-apply-color"
            style="width: 100%; padding: 10px; cursor: pointer; border: 1px solid #C7EDCC; background: white; border-radius: 6px; font-weight: bold; color: #333;">
      ✅ 应用颜色
    </button>
    <button id="btn-reset-color"
            style="width: 100%; padding: 10px; margin-top: 5px; cursor: pointer; border: 1px solid #ddd; background: white; border-radius: 6px;">
      🔄 恢复默认
    </button>
  </div>
  <div class="bean-green-exclude-children" style="margin-bottom: 15px;">
    <div class="bean-green-excluded" style="font-size: 13px; font-weight: bold; margin-bottom: 8px; color: #333;">🔧 工具</div>
    <button id="btn-toggle-debug"
            style="width: 100%; padding: 10px; cursor: pointer; border: 1px solid #ddd; background: white; border-radius: 6px;">
      🔍 调试模式${debugMode ? '-已开启' : '-关闭'}
    </button>
    <button id="btn-clear-all"
            style="width: 100%; padding: 10px; margin-top: 5px; cursor: pointer; border: 1px solid #ff6b6b; background: white; color: #ff6b6b; border-radius: 6px;">
      🗑️ 清空所有自定义数据
    </button>
  </div>
</div>`;
        const hostParent = document.documentElement || document.body;
        // 强制重置面板外层样式，避免站点样式干扰（行距、字体、继承等）
        try { panel.style.cssText = 'all: initial; box-sizing: border-box; position: fixed; top: 10px; right: 10px; z-index: 2147483647;'; } catch (e) {}
        hostParent.appendChild(panel);

        const quickBtn = document.createElement('div');
        quickBtn.className = CLASS_PANEL;
        quickBtn.id = 'bean-green-quick-btn';

        // 快捷按钮也做样式隔离
        try { quickBtn.style.cssText = 'all: initial; box-sizing: border-box; position: fixed; z-index: 2147483646;'; } catch (e) {}

        // 使用保存的位置或默认位置
        const btnTop = savedPosition.top || '10px';
        const btnLeft = savedPosition.left || '';
        const btnRight = savedPosition.right || '10px';

        // 智能处理保存的位置
        let btnStyle = 'position: fixed; z-index: 999998; background: #C7EDCC; padding: 8px 12px; border-radius: 20px; cursor: move; box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-family: Arial, sans-serif; font-size: 12px; user-select: none;';

        if (savedPosition.top && savedPosition.snappedEdge) {
            // 有保存的位置，验证是否在可视范围内
            const top = parseInt(savedPosition.top);
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            // 确保 top 在可视范围内
            const safeTop = Math.max(10, Math.min(top, viewportHeight - 50));

            if (savedPosition.snappedEdge === 'left') {
                const left = parseInt(savedPosition.left) || 10;
                const safeLeft = Math.max(10, Math.min(left, viewportWidth - 100));
                btnStyle += ` top: ${safeTop}px; left: ${safeLeft}px; right: auto;`;
            } else if (savedPosition.snappedEdge === 'right') {
                btnStyle += ` top: ${safeTop}px; right: 10px; left: auto;`;
            } else {
                // 默认右上角
                btnStyle += ' top: 10px; right: 10px; left: auto;';
            }

            console.log('[豆沙绿] 恢复按钮位置:', savedPosition.snappedEdge, safeTop);
        } else if (savedPosition.top && savedPosition.left) {
            // 兼容旧版本的位置数据
            const top = parseInt(savedPosition.top);
            const left = parseInt(savedPosition.left);
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            const safeTop = Math.max(10, Math.min(top, viewportHeight - 50));
            const safeLeft = Math.max(10, Math.min(left, viewportWidth - 100));

            btnStyle += ` top: ${safeTop}px; left: ${safeLeft}px; right: auto;`;
        } else {
            // 默认右上角
            btnStyle += ' top: 10px; right: 10px; left: auto;';
        }

        quickBtn.innerHTML = `
        <div class="${CLASS_PANEL}" id="bean-green-quick-btn-inner" style="${btnStyle}">
            🌿
        </div>
<!--         🌿豆沙绿 -->
    `;
        hostParent.appendChild(quickBtn);

        const panelDiv = document.getElementById('bean-green-panel-content');
        const quickBtnDiv = document.getElementById('bean-green-quick-btn-inner');

        // 点击打开面板
        quickBtnDiv.addEventListener('click', (e) => {
            // 如果是拖拽，不触发点击
            if (quickBtnDiv.dataset.dragging === 'true') {
                return;
            }
            panelDiv.style.display = panelDiv.style.display === 'none' ? 'block' : 'none';
        });

        document.getElementById('btn-close-panel').addEventListener('click', () => {
            panelDiv.style.display = 'none';
        });

        document.getElementById('btn-add-rule').addEventListener('click', showAddRuleDialog);
        document.getElementById('btn-manage-rules').addEventListener('click', showRulesManager);
        document.getElementById('btn-add-website').addEventListener('click', addCurrentWebsiteToBlacklist);
        document.getElementById('btn-manage-websites').addEventListener('click', showWebsiteBlacklistManager);
        document.getElementById('btn-toggle-debug').addEventListener('click', toggleDebugMode);
        document.getElementById('btn-clear-all').addEventListener('click', clearAllCustomData);

        // 添加拖拽功能
        makeQuickBtnDraggable(quickBtnDiv);
        makeDraggable(panelDiv);


        // 预设颜色按钮
        document.querySelectorAll('.btn-preset-color').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                applyCustomColor(color);
            });
        });

        // 颜色选择器
        const colorPicker = document.getElementById('color-picker');
        const opacitySlider = document.getElementById('opacity-slider');
        const opacityValue = document.getElementById('opacity-value');

        opacitySlider.addEventListener('input', (e) => {
            opacityValue.textContent = e.target.value + '%';
        });

        // 应用颜色按钮
        document.getElementById('btn-apply-color').addEventListener('click', () => {
            const hexColor = colorPicker.value;
            const opacity = parseInt(opacitySlider.value) / 100;

            // 将 hex 转换为 rgba
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);
            const rgbaColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;

            applyCustomColor(rgbaColor);
        });

        // 恢复默认颜色
        document.getElementById('btn-reset-color').addEventListener('click', () => {
            if (confirm('确定要恢复默认颜色吗？')) {
                localStorage.removeItem(COLOR_STORAGE_KEY);
                alert('✅ 已恢复默认颜色！刷新页面后生效。');
                location.reload();
            }
        });
    }

    function makeDraggable(element) {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        element.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                element.style.left = (e.clientX - offsetX) + 'px';
                element.style.top = (e.clientY - offsetY) + 'px';
                element.style.right = 'auto';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    // 新增：按钮拖拽函数（可保存位置）
    // 按钮拖拽函数（可保存位置 + 自动吸附边缘）
    function makeQuickBtnDraggable(element) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        let hasMoved = false;

        // 吸附到最近的边缘
        function snapToEdge() {
            const rect = element.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // 计算到四个边缘的距离
            const distances = {
                top: centerY,
                bottom: viewportHeight - centerY,
                left: centerX,
                right: viewportWidth - centerX
            };

            // 找到最近的边缘
            let minDistance = Infinity;
            let nearestEdge = 'right';

            for (const [edge, distance] of Object.entries(distances)) {
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestEdge = edge;
                }
            }

            // 动画过渡到边缘
            element.style.transition = 'all 0.3s ease';

            const margin = 10; // 距离边缘的边距

            switch (nearestEdge) {
                case 'top':
                    element.style.top = margin + 'px';
                    element.style.left = centerX - rect.width / 2 + 'px';
                    element.style.right = 'auto';
                    break;
                case 'bottom':
                    element.style.top = viewportHeight - rect.height - margin + 'px';
                    element.style.left = centerX - rect.width / 2 + 'px';
                    element.style.right = 'auto';
                    break;
                case 'left':
                    element.style.left = margin + 'px';
                    element.style.top = centerY - rect.height / 2 + 'px';
                    element.style.right = 'auto';
                    break;
                case 'right':
                    element.style.right = margin + 'px';
                    element.style.left = 'auto';
                    element.style.top = centerY - rect.height / 2 + 'px';
                    break;
            }

            // 移除过渡效果
            setTimeout(() => {
                element.style.transition = '';
                // console.log(22)
            }, 300);

            return nearestEdge;
        }

        // 确保按钮在可视范围内
        function ensureInView() {
            const rect = element.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let needsAdjustment = false;
            let newTop = rect.top;
            let newLeft = rect.left;

            // 检查是否超出边界
            if (rect.top < 10) {
                newTop = 10;
                needsAdjustment = true;
            }
            if (rect.bottom > viewportHeight - 10) {
                newTop = viewportHeight - rect.height - 10;
                needsAdjustment = true;
            }
            if (rect.left < 10) {
                newLeft = 10;
                needsAdjustment = true;
            }
            if (rect.right > viewportWidth - 10) {
                newLeft = viewportWidth - rect.width - 10;
                needsAdjustment = true;
            }

            if (needsAdjustment) {
                element.style.top = newTop + 'px';
                element.style.left = newLeft + 'px';
                element.style.right = 'auto';

                // 保存新位置
                const position = {
                    top: element.style.top,
                    left: element.style.left,
                    right: element.style.right
                };
                localStorage.setItem(BTN_POSITION_KEY, JSON.stringify(position));
            }
        }

        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            hasMoved = false;

            const rect = element.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            startLeft = rect.left;
            startTop = rect.top;

            element.style.cursor = 'grabbing';
            element.style.transition = ''; // 移除过渡，跟随鼠标更流畅
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            // 如果移动超过3px，认为是拖拽
            if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
                hasMoved = true;
                element.dataset.dragging = 'true';
            }

            if (hasMoved) {
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                let newLeft = startLeft + deltaX;
                let newTop = startTop + deltaY;

                // 限制在屏幕范围内
                const maxLeft = viewportWidth - element.offsetWidth;
                const maxTop = viewportHeight - element.offsetHeight;

                newLeft = Math.max(0, Math.min(newLeft, maxLeft));
                newTop = Math.max(0, Math.min(newTop, maxTop));

                element.style.left = newLeft + 'px';
                element.style.top = newTop + 'px';
                element.style.right = 'auto';
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging && hasMoved) {
                // 吸附到最近的边缘
                const snappedEdge = snapToEdge();

                // 等待动画完成后保存位置
                setTimeout(() => {
                    const position = {
                        top: element.style.top,
                        left: element.style.left,
                        right: element.style.right,
                        snappedEdge: snappedEdge
                    };
                    localStorage.setItem(BTN_POSITION_KEY, JSON.stringify(position));
                    console.log('[豆沙绿] 按钮位置已保存，吸附到:', snappedEdge, '边缘');
                }, 350);
            }

            isDragging = false;
            element.style.cursor = 'move';

            // 延迟重置拖拽标记，避免触发点击
            setTimeout(() => {
                element.dataset.dragging = 'false';
                // console.log(33)
            }, 10);
        });

        // 页面加载时检查位置
                setTimeout(()=>{
                    ensureInView();
                }, 100);

        // 窗口大小改变时调整位置
        window.addEventListener('resize', () => {
            ensureInView();
        });

        // 页面滚动时检查位置（可选）
        window.addEventListener('scroll', () => {
            // 按钮是 fixed 定位，不需要调整
        });
    }

    // ==================== 规则管理器 ====================

    function showRulesManager() {
        const customRules = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

        const modal = document.createElement('div');
        modal.className = CLASS_PANEL;
        modal.innerHTML = `
            <div class="${CLASS_PANEL}" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999999; display: flex; align-items: center; justify-content: center;">
                <div class="${CLASS_PANEL}" style="background: white; padding: 20px; border-radius: 12px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; font-family: Arial, sans-serif;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 2px solid #C7EDCC; padding-bottom: 10px;background-color: white;">
                        <h3 style="margin: 0; font-size: 16px;">📋 规则管理器</h3>
                        <button class="btn-close-modal" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #999;">✖</button>
                    </div>

                    <div style="margin-bottom: 15px; padding: 10px; background: #e7f3ff; border-radius: 6px; font-size: 12px; color: #0056b3;">
                        <strong>💡 提示：</strong>使用 <strong>className</strong> 匹配class，<strong>excludeChildren: true</strong> 排除子元素
                    </div>

                    <div id="rules-list">
                        ${renderRulesList(customRules)}
                    </div>

                    <div style="margin-top: 15px; text-align: right;">
                        <button class="btn-close-modal" style="padding: 8px 20px; cursor: pointer; border: 1px solid #ddd; background: white; border-radius: 6px;">关闭</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelectorAll('.btn-close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target === modal.querySelector('div')) {
                modal.remove();
            }
        });

        bindRuleButtons();
    }

    function renderRulesList(customRules) {
        let html = '<div style="margin-bottom: 20px;"><div style="font-size: 13px; font-weight: bold; margin-bottom: 10px; color: #666;">内置规则</div>';

        DEFAULT_EXCLUSION_RULES.forEach((rule) => {
            html += `
            <div style="background: #f8f9fa; padding: 10px; margin-bottom: 8px; border-radius: 6px; border-left: 3px solid #ccc;">
                <div style="font-weight: bold; color: #666;">${rule.reason} ${rule.excludeChildren ? '<span style="background:#ff6b6b;color:white;padding:2px 6px;border-radius:3px;font-size:10px;">含子元素</span>' : ''}</div>
            </div>
        `;
        });

        html += '</div><div><div style="font-size: 13px; font-weight: bold; margin-bottom: 10px; color: #333;">自定义规则</div>';

        if (customRules.length === 0) {
            html += '<div style="text-align: center; color: #999; padding: 20px;">暂无自定义规则</div>';
        } else {
            customRules.forEach((rule, index) => {
                const isCustom = !!rule.customCheck;
                html += `
                <div style="background: white; padding: 10px; margin-bottom: 8px; border-radius: 6px; border: 1px solid #ddd; border-left: 3px solid ${isCustom ? '#9b59b6' : '#C7EDCC'};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-weight: bold; color: #333;">
                            ${rule.reason}
                            ${rule.excludeChildren ? '<span style="background:#ff6b6b;color:white;padding:2px 6px;border-radius:3px;font-size:10px;">含子元素</span>' : ''}
                            ${isCustom ? '<span style="background:#9b59b6;color:white;padding:2px 6px;border-radius:3px;font-size:10px;margin-left:4px;">自定义</span>' : ''}
                        </div>
                        <div>
                            <button class="btn-edit-rule" data-index="${index}" style="background: #4ecdc4; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px; margin-right: 5px;">编辑</button>
                            <button class="btn-delete-rule" data-index="${index}" style="background: #ff6b6b; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">删除</button>
                        </div>
                    </div>
                    <div style="font-size: 11px; color: #666; font-family: monospace; background: #f8f9fa; padding: 5px; border-radius: 3px; margin-top: 5px; max-height: 100px; overflow-y: auto; word-break: break-all;">
                        ${isCustom ? '// 自定义函数\n' + rule.customCheck : JSON.stringify(rule, null, 2)}
                    </div>
                </div>
            `;
            });
        }

        html += '</div>';
        return html;
    }

    function bindRuleButtons() {
        document.querySelectorAll('.btn-edit-rule').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                editRule(index);
            });
        });

        document.querySelectorAll('.btn-delete-rule').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                deleteRule(index);
            });
        });
    }

    function editRule(index) {
        const customRules = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const rule = customRules[index];

        if (!rule) {
            alert('❌ 规则不存在！');
            return;
        }

        const isCustom = !!rule.customCheck;

        // 创建编辑模态框
        const modal = document.createElement('div');
        modal.className = CLASS_PANEL;
        modal.innerHTML = `
        <div class="${CLASS_PANEL}" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 99999999; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif;">
            <div class="${CLASS_PANEL}" style="background: white; padding: 20px; border-radius: 12px; max-width: 900px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 2px solid #C7EDCC; padding-bottom: 10px;background-color: white;">
                    <h3 style="margin: 0; font-size: 16px;">✏️ 编辑规则</h3>
                    <button class="btn-close-modal" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #999;">✖</button>
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 13px;">规则类型：</label>
                    <select id="edit-rule-type" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px;" ${isCustom ? '' : 'disabled'}>
                        <option value="selector" ${!isCustom ? 'selected' : ''}>选择器规则</option>
                        <option value="custom" ${isCustom ? 'selected' : ''}>自定义函数规则</option>
                    </select>
                    ${!isCustom ? '<div style="font-size: 11px; color: #999; margin-top: 5px;">⚠️ 已有规则不支持切换类型</div>' : ''}
                </div>

                <div id="edit-selector-form" style="${isCustom ? 'display: none;' : ''}">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 13px;">规则说明：</label>
                        <input type="text" id="edit-rule-reason" value="${rule.reason || ''}" placeholder="例如：视频播放器" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px;">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 13px;">规则内容（JSON格式）：</label>
                        <textarea id="edit-rule-content" style="width: 100%; height: 200px; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 12px; font-family: monospace;">${JSON.stringify(rule, null, 2)}</textarea>
                    </div>
                </div>

                <div id="edit-custom-form" style="${!isCustom ? 'display: none;' : ''}">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 13px;">规则说明：</label>
                        <input type="text" id="edit-custom-rule-reason" value="${rule.reason || ''}" placeholder="例如：按钮元素" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px;">
                    </div>

                    <div id="edit-code-editor-container"></div>

                    <div style="background: #fff3cd; padding: 10px; border-radius: 6px; font-size: 12px; color: #856404; margin-bottom: 15px;">
                        <strong>⚠️ 注意：</strong><br>
                        • 函数参数：<code>div</code>（元素对象）、<code>currentHost</code>（当前域名）<br>
                        • 返回 <code>true</code> 表示排除该元素<br>
                        • 支持 Tab 键缩进（4个空格）
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; font-size: 13px;">
                            <input type="checkbox" id="edit-custom-exclude-children" ${rule.excludeChildren ? 'checked' : ''} style="margin-right: 8px;">
                            排除子元素
                        </label>
                    </div>
                </div>

                <div style="display: flex; gap: 10px;">
                    <button id="btn-cancel-edit-rule" style="flex: 1; padding: 10px; cursor: pointer; border: 1px solid #ddd; background: white; border-radius: 6px;">取消</button>
                    <button id="btn-test-rule" style="flex: 1; padding: 10px; cursor: pointer; border: 1px solid #4ecdc4; background: white; color: #4ecdc4; border-radius: 6px; font-weight: bold;">🧪 测试规则</button>
                    <button id="btn-confirm-edit-rule" style="flex: 1; padding: 10px; cursor: pointer; border: 1px solid #C7EDCC; background: #C7EDCC; border-radius: 6px; font-weight: bold;">✅ 保存规则</button>
                </div>
            </div>
        </div>
    `;
        document.body.appendChild(modal);

        // 如果是自定义规则，创建代码编辑器
        if (isCustom) {
            const editorContainer = modal.querySelector('#edit-code-editor-container');
            const editor = createCodeEditor(
                'edit-custom-code-editor',
                '// 在这里编写自定义函数',
                rule.customCheck || ''
            );
            editorContainer.appendChild(editor);
        }

        // 关闭模态框
        modal.querySelectorAll('.btn-close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        modal.querySelector('#btn-cancel-edit-rule').addEventListener('click', () => modal.remove());

        // 测试规则
        modal.querySelector('#btn-test-rule').addEventListener('click', () => {
            try {
                let testCode;

                if (isCustom) {
                    testCode = getCodeFromEditor('edit-custom-code-editor');
                } else {
                    const contentInput = modal.querySelector('#edit-rule-content').value.trim();
                    const testRule = JSON.parse(contentInput);
                    testCode = testRule.customCheck;
                }

                if (testCode) {
                    // 验证语法
                    new Function('div', 'currentHost', testCode);

                    // 测试执行
                    const testDiv = document.createElement('div');
                    const result = new Function('div', 'currentHost', testCode)(testDiv, window.location.hostname);

                    alert(`✅ 语法正确！\n\n测试结果: ${result}\n\n提示：实际效果需要在页面上验证`);
                } else {
                    alert('✅ 选择器规则语法正确！');
                }
            } catch (e) {
                alert('❌ 语法错误！\n\n' + e.message);
            }
        });

        // 保存规则
        modal.querySelector('#btn-confirm-edit-rule').addEventListener('click', () => {
            try {
                if (isCustom) {
                    // 自定义函数规则
                    const reasonInput = modal.querySelector('#edit-custom-rule-reason').value.trim();
                    const codeInput = getCodeFromEditor('edit-custom-code-editor');
                    const excludeChildren = modal.querySelector('#edit-custom-exclude-children').checked;

                    if (!codeInput) {
                        alert('❌ 请输入自定义函数！');
                        return;
                    }

                    if (!reasonInput) {
                        alert('❌ 请输入规则说明！');
                        return;
                    }

                    // 验证函数语法
                    new Function('div', 'currentHost', codeInput);

                    customRules[index] = {
                        customCheck: codeInput,
                        excludeChildren: excludeChildren,
                        reason: reasonInput
                    };
                } else {
                    // 选择器规则
                    const reasonInput = modal.querySelector('#edit-rule-reason').value.trim();
                    const contentInput = modal.querySelector('#edit-rule-content').value.trim();

                    if (!contentInput) {
                        alert('❌ 请输入规则内容！');
                        return;
                    }

                    const updatedRule = JSON.parse(contentInput);
                    if (reasonInput) updatedRule.reason = reasonInput;

                    // 自动修正
                    if (updatedRule.class && !updatedRule.className) {
                        updatedRule.className = updatedRule.class;
                        delete updatedRule.class;
                    }

                    customRules[index] = updatedRule;
                }

                saveCustomRules(customRules);
                applyBeanGreen();
                alert('✅ 规则更新成功！');
                modal.remove();
            } catch (e) {
                alert('❌ 保存失败！\n\n' + e.message);
            }
        });
    }

    function deleteRule(index) {
        if (!confirm('确定要删除这条规则吗？')) return;

        const customRules = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        customRules.splice(index, 1);
        saveCustomRules(customRules);
        applyBeanGreen();
        alert('✅ 规则已删除！');
    }

    // ==================== 网站黑名单管理器 ====================

    function showWebsiteBlacklistManager() {
        const modal = document.createElement('div');
        modal.className = CLASS_PANEL;
        modal.innerHTML = `
            <div class="${CLASS_PANEL}" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999999; display: flex; align-items: center; justify-content: center;">
                <div class="${CLASS_PANEL}" style="background: white; padding: 20px; border-radius: 12px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; font-family: Arial, sans-serif;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 2px solid #fff3cd; padding-bottom: 10px;">
                        <h3 style="margin: 0; font-size: 16px;">🌐 网站黑名单管理器</h3>
                        <button class="btn-close-modal" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #999;">✖</button>
                    </div>

                    <div id="websites-list">
                        ${renderWebsitesList()}
                    </div>

                    <div style="margin-top: 15px; text-align: right;">
                        <button class="btn-close-modal" style="padding: 8px 20px; cursor: pointer; border: 1px solid #ddd; background: white; border-radius: 6px;">关闭</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelectorAll('.btn-close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target === modal.querySelector('div')) {
                modal.remove();
            }
        });

        bindWebsiteButtons();
    }

    function renderWebsitesList() {
        let html = '<div style="margin-bottom: 20px;"><div style="font-size: 13px; font-weight: bold; margin-bottom: 10px; color: #666;">内置黑名单</div>';

        WEBSITE_BLACKLIST.forEach((item) => {
            const displayText = typeof item === 'string' ? item : `${item.reason || '正则匹配'}`;
            html += `<div style="background: #f8f9fa; padding: 10px; margin-bottom: 5px; border-radius: 6px; border-left: 3px solid #ccc;"><span style="color: #666;">${displayText}</span></div>`;
        });

        html += '</div><div><div style="font-size: 13px; font-weight: bold; margin-bottom: 10px; color: #333;">自定义黑名单</div>';

        if (customWebsiteBlacklist.length === 0) {
            html += '<div style="text-align: center; color: #999; padding: 20px;">暂无自定义黑名单</div>';
        } else {
            customWebsiteBlacklist.forEach((site, index) => {
                html += `
                    <div style="background: white; padding: 10px; margin-bottom: 5px; border-radius: 6px; border: 1px solid #ddd; border-left: 3px solid #fff3cd; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #333;">${site}</span>
                        <div>
                            <button class="btn-edit-website" data-index="${index}" style="background: #4ecdc4; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px; margin-right: 5px;">编辑</button>
                            <button class="btn-delete-website" data-index="${index}" style="background: #ff6b6b; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">删除</button>
                        </div>
                    </div>
                `;
            });
        }

        html += '</div>';
        return html;
    }

    function bindWebsiteButtons() {
        document.querySelectorAll('.btn-edit-website').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const currentSite = customWebsiteBlacklist[index];
                const newSite = prompt('编辑网站域名:', currentSite);
                if (newSite && newSite.trim()) {
                    customWebsiteBlacklist[index] = newSite.trim();
                    saveCustomWebsiteBlacklist(customWebsiteBlacklist);
                    alert('✅ 网站已更新！刷新页面后生效。');
                }
            });
        });

        document.querySelectorAll('.btn-delete-website').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                if (confirm('确定要删除这个网站吗？')) {
                    customWebsiteBlacklist.splice(index, 1);
                    saveCustomWebsiteBlacklist(customWebsiteBlacklist);
                    alert('✅ 网站已删除！刷新页面后生效。');
                }
            });
        });
    }

    // ==================== 其他功能 ====================

    function showAddRuleDialog() {
        const modal = document.createElement('div');
        modal.className = CLASS_PANEL;
        modal.innerHTML = `
        <div class="${CLASS_PANEL}" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 99999999; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif;">
            <div class="${CLASS_PANEL}" style="background: white; padding: 20px; border-radius: 12px; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <div class="${CLASS_EXCLUDED}" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 2px solid block; padding-bottom: 10px;background-color: white;">
                    <h3 style="margin: 0; font-size: 16px;">➕ 添加排除规则</h3>
                    <button class="btn-close-modal" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #999;">✖</button>
                </div>

                <div class="${CLASS_EXCLUDE_CHILDREN}" style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 13px;">规则类型：</label>
                    <select id="rule-type" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px;">
                        <option value="selector">选择器规则（推荐）</option>
                        <option value="custom">自定义函数规则（高级）</option>
                    </select>
                </div>

                <div id="selector-rule-form" class="${CLASS_EXCLUDE_CHILDREN}" >
                    <div class="${CLASS_EXCLUDE_CHILDREN}" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 13px;">规则说明：</label>
                        <input type="text" id="rule-reason" placeholder="例如：视频播放器" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px;">
                    </div>

                    <div class="${CLASS_EXCLUDE_CHILDREN}" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 13px;">规则内容（JSON格式）：</label>
                        <textarea id="rule-content" style="width: 100%; height: 150px; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 12px; font-family: monospace;" placeholder='示例1：
                        {
    // 1. 选择器匹配
    "selector": "video, .player",           // CSS选择器

    // 2. 类名匹配
    "className": "modal dialog popup",      // 多个class用空格分隔（OR关系）

    // 3. ID匹配
    "id": "header",                         // 元素ID

    // 4. 数据属性匹配
    "dataAttrs": {
        "data-role": "dialog",            // "data-role"="dialog"
        "data-type": "video"              // "data-type"="video"
    },

    // 5. 位置匹配
    "position": {
        "type": "fixed",                    // "position": "fixed"
        "zIndex": ">=1000"                 // "z-index" >= "1000"
    },

    // 6. 尺寸匹配
    "size": {
        "width": ">=800",                   // 宽度 >= 800px
        "height": "<=100"                   // 高度 <= 100px
    },

    // 7. 网站限制
    "website": "youtube.com",               // 只在特定网站生效

    // 8. 是否排除子元素
    "excludeChildren": true,                // true: 排除所有子元素

    // 9. 原因说明
    "reason": "视频播放器"                  // 规则说明
}

    // ==================== SPA / 客户端导航支持 ====================
    // 当页面使用 pushState/replaceState 或 popstate 导航（无完整刷新）时，重新注入样式并保证面板存在
    function handleUrlChange() {
        try {
            // 重新注入样式（颜色可能随前端渲染被覆盖）
            injectStyle();
            // 重新应用排除/增量处理
            applyBeanGreen();
            // 若控制面板被前端框架移除，重新创建
            if (!document.getElementById('bean-green-panel-content') || !document.getElementById('bean-green-quick-btn')) {
                // 延迟一点以等待前端渲染结束
                setTimeout(() => {
                    try {
                        createControlPanel();
                    } catch (e) { /* 忽略 */ }
                }, 50);
            }
            // 在路由/内容变更后短延迟检测并修复
            setTimeout(() => { try { checkAndRepair(); } catch (e) {} }, 400);
        } catch (e) {
            console.warn('[豆沙绿] 处理 URL 变更时出错', e);
        }
    }

    // 劫持 history.pushState / replaceState
    (function () {
        const _push = history.pushState;
        const _replace = history.replaceState;

        history.pushState = function () {
            const res = _push.apply(this, arguments);
            handleUrlChange();
            return res;
        };

        history.replaceState = function () {
            const res = _replace.apply(this, arguments);
            handleUrlChange();
            return res;
        };

        window.addEventListener('popstate', () => handleUrlChange());
    })();
示例2：
{
    "selector": "video, .player",
    "excludeChildren": true,
    "reason": "视频播放器"
}'></textarea>
                    </div>

                    <div style="background: #e7f3ff; padding: 10px; border-radius: 6px; font-size: 12px; color: #0056b3; margin-bottom: 15px;">
                        <strong>💡 字段说明：</strong><br>
                        • <code>selector</code>: CSS选择器<br>
                        • <code>className</code>: 类名（空格分隔）<br>
                        • <code>id</code>: 元素ID<br>
                        • <code>excludeChildren</code>: 是否排除子元素<br>
                        • <code>reason</code>: 规则说明
                    </div>
                </div>

<div id="custom-rule-form" style="display: none;">
    <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 13px;">规则说明：</label>
        <input type="text" id="custom-rule-reason" placeholder="例如：按钮元素" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px;">
    </div>

    <div id="add-code-editor-container"></div>

    <div style="background: #fff3cd; padding: 10px; border-radius: 6px; font-size: 12px; color: #856404; margin-bottom: 15px;">
        <strong>⚠️ 注意：</strong><br>
        • 函数参数：<code>div</code>（元素对象）、<code>currentHost</code>（当前域名）<br>
        • 返回 <code>true</code> 表示排除该元素<br>
        • 支持 Tab 键缩进（4个空格）
    </div>

    <div style="margin-bottom: 15px;">
        <label style="display: flex; align-items: center; font-size: 13px;">
            <input type="checkbox" id="custom-exclude-children" style="margin-right: 8px;">
            排除子元素
        </label>
    </div>
</div>

                <div style="display: flex; gap: 10px;">
                    <button id="btn-cancel-add-rule" style="flex: 1; padding: 10px; cursor: pointer; border: 1px solid #ddd; background: white; border-radius: 6px;">取消</button>
                    <button id="btn-confirm-add-rule" style="flex: 1; padding: 10px; cursor: pointer; border: 1px solid #C7EDCC; background: #C7EDCC; border-radius: 6px; font-weight: bold;">添加规则</button>
                </div>
            </div>
        </div>
    `;
        document.body.appendChild(modal);

        const ruleTypeSelect = modal.querySelector('#rule-type');
        const selectorForm = modal.querySelector('#selector-rule-form');
        const customForm = modal.querySelector('#custom-rule-form');

        // 切换表单类型
        ruleTypeSelect.addEventListener('change', (e) => {
            if (e.target.value === 'selector') {
                selectorForm.style.display = 'block';
                customForm.style.display = 'none';
            } else {
                selectorForm.style.display = 'none';
                customForm.style.display = 'block';
            }
        });

        // 关闭模态框
        modal.querySelectorAll('.btn-close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        modal.querySelector('#btn-cancel-add-rule').addEventListener('click', () => modal.remove());



        // 创建代码编辑器
        const addEditorContainer = modal.querySelector('#add-code-editor-container');
        const addEditor = createCodeEditor(
            'add-custom-code-editor',
            `// 示例1：按钮元素
const style = getComputedStyle(div);
return style.cursor === "pointer";

// 示例2：大尺寸元素
return div.offsetWidth > 1000;`,
            ''
        );
        addEditorContainer.appendChild(addEditor);

        // （已合并为下面的统一处理）




        // 确认添加
        modal.querySelector('#btn-confirm-add-rule').addEventListener('click', () => {
            const ruleType = ruleTypeSelect.value;

            if (ruleType === 'selector') {
                // 选择器规则
                const reasonInput = modal.querySelector('#rule-reason').value.trim();
                const contentInput = modal.querySelector('#rule-content').value.trim();

                if (!contentInput) {
                    alert('❌ 请输入规则内容！');
                    return;
                }

                try {
                    const newRule = JSON.parse(contentInput);
                    if (reasonInput) newRule.reason = reasonInput;

                    // 自动修正
                    if (newRule.class && !newRule.className) {
                        newRule.className = newRule.class;
                        delete newRule.class;
                    }
                    if (newRule.excludeChildren === "true") {
                        newRule.excludeChildren = true;
                    }

                    const savedRules = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                    savedRules.push(newRule);
                    saveCustomRules(savedRules);
                    alert('✅ 规则添加成功！');
                    applyBeanGreen();
                    modal.remove();
                } catch (e) {
                    alert('❌ JSON格式错误！\n\n' + e.message);
                }
            } else {
                // 自定义函数规则
                const reasonInput = modal.querySelector('#custom-rule-reason').value.trim();
                const contentInput = modal.querySelector('#custom-rule-content').value.trim();
                const excludeChildren = modal.querySelector('#custom-exclude-children').checked;

                if (!contentInput) {
                    alert('❌ 请输入自定义函数！');
                    return;
                }

                if (!reasonInput) {
                    alert('❌ 请输入规则说明！');
                    return;
                }

                // 验证函数语法
                try {
                    new Function('div', 'currentHost', contentInput);
                } catch (e) {
                    alert('❌ 函数语法错误！\n\n' + e.message);
                    return;
                }

                const newRule = {
                    customCheck: contentInput,
                    excludeChildren: excludeChildren,
                    reason: reasonInput
                };

                const savedRules = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                savedRules.push(newRule);
                saveCustomRules(savedRules);
                alert('✅ 自定义规则添加成功！');
                applyBeanGreen();
                modal.remove();
            }
        });
    }

    function addCurrentWebsiteToBlacklist() {
        const currentHost = window.location.hostname;

        if (customWebsiteBlacklist.includes(currentHost)) {
            alert('⚠️ 当前网站已在黑名单中！');
            return;
        }

        if (confirm(`确定要将 "${currentHost}" 添加到黑名单吗？`)) {
            customWebsiteBlacklist.push(currentHost);
            saveCustomWebsiteBlacklist(customWebsiteBlacklist);
            alert(`✅ 已添加！刷新页面后生效。`);
        }
    }

    function clearAllCustomData() {
        if (confirm('确定要清空所有自定义数据吗？')) {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(WEBSITE_BLACKLIST_STORAGE_KEY);
            localStorage.removeItem(COLOR_STORAGE_KEY); // 新增：清除颜色
            localStorage.removeItem(BTN_POSITION_KEY);   // 新增：清除按钮位置
            loadCustomRules();
            loadCustomWebsiteBlacklist();
            alert('✅ 已清空！刷新页面后生效。');
            location.reload(); // 建议添加：自动刷新
        }
    }

    var debugMode = false;
    function toggleDebugMode() {
        debugMode = !debugMode;
        alert(debugMode ? '🔍 调试模式已开启' : '🔍 调试模式已关闭');

        if (debugMode) {
            document.addEventListener('mouseover', showDebugInfo);
            document.addEventListener('mouseout', hideDebugInfo);
        } else {
            document.removeEventListener('mouseover', showDebugInfo);
            document.removeEventListener('mouseout', hideDebugInfo);
        }
    }

    function showDebugInfo(e) {
        // 排除控制面板和按钮
        if (e.target.closest(`.${CLASS_PANEL}`) || e.target.closest('#bean-green-quick-btn-inner')) {
            return;
        }

        if (e.target.tagName === 'DIV' || e.target.tagName === 'HEADER') {
            const div = e.target;
            let excluded = false;
            let reason = '';

            if (div.closest(`.${CLASS_EXCLUDE_CHILDREN}`)) {
                excluded = true;
                reason = '父元素已被排除';
            } else {
                for (const rule of exclusionRules) {
                    if (checkRule(div, rule, window.location.hostname)) {
                        excluded = true;
                        reason = rule.reason;
                        // console.log("已排除3:",div, rule, window.location.hostname)
                        break;
                    }
                }
            }

            const tooltip = document.createElement('div');
            tooltip.className = 'bean-green-debug-tooltip'; // 使用专用类名
            tooltip.style.cssText = `
            position: fixed;
            top: ${e.clientY + 10}px;
            left: ${e.clientX + 10}px;
            background: ${excluded ? '#ff6b6b' : '#4ecdc4'};
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 9999999;
            pointer-events: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;
            tooltip.textContent = excluded ? `🚫 ${reason}` : '✅ 应用豆沙绿';
            const hostParent = document.documentElement || document.body;
            hostParent.appendChild(tooltip);
        }
    }

    function hideDebugInfo() {
        // 只移除调试 tooltip，使用专用类名
        document.querySelectorAll('.bean-green-debug-tooltip').forEach(el => {
            el.remove();
        });
    }

    // ==================== 自动检测并修复丢失的应用效果 ====================
    function parseRGBA(str) {
        if (!str) return null;
        const m = /rgba?\(([^)]+)\)/.exec(str);
        if (!m) return null;
        const parts = m[1].split(',').map(s => parseFloat(s.trim()));
        return parts; // [r,g,b] or [r,g,b,a]
    }

    function colorMatches(computed, expected) {
        const a = parseRGBA(computed);
        const b = parseRGBA(expected);
        if (!a || !b) return false;
        for (let i = 0; i < 3; i++) {
            if (Math.abs((a[i]||0) - (b[i]||0)) > 8) return false;
        }
        return true;
    }

    function isEffectPresent() {
        try {
            const bgColor = localStorage.getItem(COLOR_STORAGE_KEY) || BEAN_GREEN;
            const nodes = Array.from(document.querySelectorAll(`div:not(.${CLASS_PANEL})`));
            if (nodes.length === 0) return false;
            let match = 0;
            let checked = 0;
            for (const n of nodes) {
                try {
                    const cs = window.getComputedStyle(n).backgroundColor;
                    checked++;
                    if (colorMatches(cs, bgColor) || (n.getAttribute && (n.getAttribute('style')||'').includes('background-color'))) {
                        match++;
                    }
                    if (checked >= 60) break;
                } catch (e) {}
            }
            return checked>0 && (match/checked) >= 0.03;
        } catch (e) {
            return false;
        }
    }

    function checkAndRepair() {
        try {
            if (!document.getElementById('bean-green-style')) {
                console.warn('[豆沙绿] 样式丢失，重新注入');
                injectStyle();
                applyBeanGreen();
                return;
            }
            if (!isEffectPresent()) {
                console.warn('[豆沙绿] 检测到效果丢失，自动重新应用颜色');
                applyBeanGreen();
            }
        } catch (e) {
            console.error('[豆沙绿] checkAndRepair 错误', e);
        }
    }

    // ==================== 初始化 ====================

    function init() {
        loadCustomRules();
        injectStyle();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                applyBeanGreen();
                observeDOM();
                createControlPanel();
            });
        } else {
            applyBeanGreen();
            observeDOM();
            createControlPanel();
        }
    }

    init();
})();