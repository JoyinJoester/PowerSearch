/**
 * PowerSearch - 主要逻辑脚本
 * 功能：从当前页面URL中提取搜索关键词，并支持切换到不同搜索引擎
 * 新增：自定义搜索引擎管理功能
 */

// 支持的搜索引擎URL模式和对应的查询参数
const SEARCH_ENGINES = {
    // 主流国际搜索引擎
    'google.com': ['q'],
    'google.co.uk': ['q'],
    'google.ca': ['q'],
    'google.com.au': ['q'],
    'bing.com': ['q'],
    'duckduckgo.com': ['q'],
    'yandex.com': ['text'],
    'yandex.ru': ['text'],
    'ecosia.org': ['q'],
    'startpage.com': ['query'],
    'searx.me': ['q'],
    
    // 专业搜索引擎
    'github.com': ['q'],
    
    // 中文搜索引擎
    'baidu.com': ['wd', 'word'],
    'sogou.com': ['query'],
    'so.com': ['q'],
    'soso.com': ['w'],
    '360.cn': ['q'],
    'sm.cn': ['q'], // 神马搜索
    
    // 其他搜索引擎
    'yahoo.com': ['p'],
    'ask.com': ['q'],
    'aol.com': ['q']
};

// 全局变量
let currentSearchQuery = null;
let customEngines = [];

/**
 * 从URL中提取搜索关键词
 * @param {string} url - 当前页面的URL
 * @returns {string|null} - 提取到的搜索关键词，如果没有找到则返回null
 */
function extractSearchQuery(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        const searchParams = urlObj.searchParams;
        
        // 首先检查自定义搜索引擎
        for (const engine of customEngines) {
            if (hostname.includes(engine.domain)) {
                const query = searchParams.get(engine.param);
                if (query && query.trim()) {
                    return decodeURIComponent(query.trim());
                }
            }
        }
        
        // 然后检查内置搜索引擎
        for (const [domain, queryParams] of Object.entries(SEARCH_ENGINES)) {
            if (hostname.includes(domain)) {
                for (const param of queryParams) {
                    const query = searchParams.get(param);
                    if (query && query.trim()) {
                        return decodeURIComponent(query.trim());
                    }
                }
            }
        }
        
        // 如果没有匹配到已知搜索引擎，尝试通用的查询参数
        const commonParams = ['q', 'query', 'search', 'wd', 'word', 'text', 'keywords'];
        for (const param of commonParams) {
            const query = searchParams.get(param);
            if (query && query.trim()) {
                return decodeURIComponent(query.trim());
            }
        }
        
        return null;
    } catch (error) {
        console.error('提取搜索查询时出错:', error);
        return null;
    }
}

/**
 * 构建新的搜索URL
 * @param {string} baseUrl - 搜索引擎的基础URL模板
 * @param {string} query - 搜索关键词
 * @returns {string} - 完整的搜索URL
 */
function buildSearchUrl(baseUrl, query) {
    const encodedQuery = encodeURIComponent(query);
    // 如果URL包含{query}占位符，替换它
    if (baseUrl.includes('{query}')) {
        return baseUrl.replace('{query}', encodedQuery);
    }
    // 否则直接拼接到末尾
    return baseUrl + encodedQuery;
}

/**
 * 在当前标签页中打开新的搜索URL
 * @param {string} url - 要打开的URL
 */
async function openSearchUrl(url) {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        await chrome.tabs.update(tab.id, { url: url });
        window.close();
    } catch (error) {
        console.error('打开搜索URL时出错:', error);
        showError('无法打开新的搜索页面，请检查权限设置');
    }
}

/**
 * 显示错误信息
 * @param {string} message - 错误信息
 */
function showError(message) {
    const queryElement = document.getElementById('currentQuery');
    queryElement.textContent = `错误: ${message}`;
    queryElement.style.color = '#ff6b6b';
}

/**
 * 显示成功信息
 * @param {string} message - 成功信息
 */
function showSuccess(message) {
    const queryElement = document.getElementById('currentQuery');
    const originalText = queryElement.textContent;
    const originalColor = queryElement.style.color;
    
    queryElement.textContent = message;
    queryElement.style.color = '#48bb78';
    
    setTimeout(() => {
        queryElement.textContent = originalText;
        queryElement.style.color = originalColor;
    }, 2000);
}

/**
 * 显示当前检测到的搜索关键词
 * @param {string} query - 搜索关键词
 */
function displayCurrentQuery(query) {
    const queryElement = document.getElementById('currentQuery');
    if (query) {
        queryElement.textContent = `当前搜索: "${query}"`;
        queryElement.style.color = '#4ecdc4';
    } else {
        queryElement.textContent = '未检测到搜索关键词';
        queryElement.style.color = '#ffa726';
    }
}

/**
 * 加载自定义搜索引擎
 */
async function loadCustomEngines() {
    try {
        const result = await chrome.storage.sync.get(['customEngines']);
        customEngines = result.customEngines || [];
        updateCustomEnginesDisplay();
        updateCustomEnginesManagement();
    } catch (error) {
        console.error('加载自定义搜索引擎失败:', error);
    }
}

/**
 * 保存自定义搜索引擎
 */
async function saveCustomEngines() {
    try {
        await chrome.storage.sync.set({ customEngines: customEngines });
    } catch (error) {
        console.error('保存自定义搜索引擎失败:', error);
    }
}

/**
 * 更新自定义搜索引擎显示
 */
function updateCustomEnginesDisplay() {
    const container = document.getElementById('customEnginesContainer');
    const group = document.getElementById('customEnginesGroup');
    
    container.innerHTML = '';
    
    if (customEngines.length === 0) {
        group.classList.add('hidden');
        return;
    }
    
    group.classList.remove('hidden');
    
    customEngines.forEach(engine => {
        const button = document.createElement('button');
        button.className = 'engine-btn';
        button.dataset.engineUrl = engine.url;
        button.dataset.engineName = engine.name;
        button.innerHTML = `
            <span class="icon">${engine.icon || '🔍'}</span>
            <span class="name">${engine.name}</span>
        `;
        
        button.addEventListener('click', (event) => {
            event.preventDefault();
            
            if (!currentSearchQuery) {
                showError('未检测到搜索关键词，无法切换搜索引擎');
                return;
            }
            
            const newSearchUrl = buildSearchUrl(engine.url, currentSearchQuery);
            console.log(`切换到${engine.name}: ${newSearchUrl}`);
            openSearchUrl(newSearchUrl);
        });
        
        if (!currentSearchQuery) {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        }
        
        container.appendChild(button);
    });
}

/**
 * 更新自定义搜索引擎管理页面
 */
function updateCustomEnginesManagement() {
    const container = document.getElementById('customEnginesList');
    
    if (customEngines.length === 0) {
        container.innerHTML = '<p class="no-engines">暂无自定义搜索引擎</p>';
        return;
    }
    
    container.innerHTML = '';
    
    customEngines.forEach((engine, index) => {
        const engineItem = document.createElement('div');
        engineItem.className = 'custom-engine-item';
        engineItem.innerHTML = `
            <div class="engine-info">
                <span class="engine-icon">${engine.icon || '🔍'}</span>
                <div class="engine-details">
                    <div class="engine-name">${engine.name}</div>
                    <div class="engine-url">${engine.url}</div>
                    <div class="engine-meta">域名: ${engine.domain} | 参数: ${engine.param}</div>
                </div>
            </div>
            <div class="engine-actions">
                <button class="btn-edit" data-index="${index}">编辑</button>
                <button class="btn-delete" data-index="${index}">删除</button>
            </div>
        `;
        
        // 添加删除事件监听器
        const deleteBtn = engineItem.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', () => deleteCustomEngine(index));
        
        // 添加编辑事件监听器
        const editBtn = engineItem.querySelector('.btn-edit');
        editBtn.addEventListener('click', () => editCustomEngine(index));
        
        container.appendChild(engineItem);
    });
}

/**
 * 添加自定义搜索引擎
 * @param {Object} engineData - 搜索引擎数据
 */
async function addCustomEngine(engineData) {
    // 验证数据
    if (!engineData.name || !engineData.url || !engineData.domain || !engineData.param) {
        showError('请填写完整的搜索引擎信息');
        return false;
    }
    
    // 检查是否重复
    const existing = customEngines.find(engine => 
        engine.name === engineData.name || engine.domain === engineData.domain
    );
    
    if (existing) {
        showError('搜索引擎名称或域名已存在');
        return false;
    }
    
    // 添加到列表
    customEngines.push(engineData);
    
    // 保存到存储
    await saveCustomEngines();
    
    // 更新显示
    updateCustomEnginesDisplay();
    updateCustomEnginesManagement();
    
    // 同时更新SEARCH_ENGINES对象
    SEARCH_ENGINES[engineData.domain] = [engineData.param];
    
    showSuccess('自定义搜索引擎添加成功！');
    return true;
}

/**
 * 删除自定义搜索引擎
 * @param {number} index - 搜索引擎索引
 */
async function deleteCustomEngine(index) {
    if (index < 0 || index >= customEngines.length) {
        return;
    }
    
    if (!confirm('确定要删除这个自定义搜索引擎吗？')) {
        return;
    }
    
    const engine = customEngines[index];
    
    // 从列表中移除
    customEngines.splice(index, 1);
    
    // 保存到存储
    await saveCustomEngines();
    
    // 更新显示
    updateCustomEnginesDisplay();
    updateCustomEnginesManagement();
    
    // 从SEARCH_ENGINES对象中移除
    delete SEARCH_ENGINES[engine.domain];
    
    showSuccess('自定义搜索引擎删除成功！');
}

/**
 * 编辑自定义搜索引擎
 * @param {number} index - 搜索引擎索引
 */
function editCustomEngine(index) {
    if (index < 0 || index >= customEngines.length) {
        return;
    }
    
    const engine = customEngines[index];
    
    // 切换到管理标签页
    switchTab('manage');
    
    // 填充表单
    document.getElementById('engineName').value = engine.name;
    document.getElementById('engineIcon').value = engine.icon || '';
    document.getElementById('engineUrl').value = engine.url;
    document.getElementById('engineDomain').value = engine.domain;
    document.getElementById('engineParam').value = engine.param;
    
    // 修改表单提交行为为编辑模式
    const form = document.getElementById('addEngineForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = '更新搜索引擎';
    submitBtn.dataset.editIndex = index;
}

/**
 * 更新自定义搜索引擎
 * @param {number} index - 搜索引擎索引
 * @param {Object} engineData - 新的搜索引擎数据
 */
async function updateCustomEngine(index, engineData) {
    if (index < 0 || index >= customEngines.length) {
        return false;
    }
    
    // 验证数据
    if (!engineData.name || !engineData.url || !engineData.domain || !engineData.param) {
        showError('请填写完整的搜索引擎信息');
        return false;
    }
    
    // 检查是否与其他引擎重复（排除自己）
    const existing = customEngines.find((engine, i) => 
        i !== index && (engine.name === engineData.name || engine.domain === engineData.domain)
    );
    
    if (existing) {
        showError('搜索引擎名称或域名已存在');
        return false;
    }
    
    const oldEngine = customEngines[index];
    
    // 更新数据
    customEngines[index] = engineData;
    
    // 保存到存储
    await saveCustomEngines();
    
    // 更新显示
    updateCustomEnginesDisplay();
    updateCustomEnginesManagement();
    
    // 更新SEARCH_ENGINES对象
    if (oldEngine.domain !== engineData.domain) {
        delete SEARCH_ENGINES[oldEngine.domain];
    }
    SEARCH_ENGINES[engineData.domain] = [engineData.param];
    
    showSuccess('自定义搜索引擎更新成功！');
    return true;
}

/**
 * 切换标签页
 * @param {string} tabName - 标签页名称
 */
function switchTab(tabName) {
    // 更新标签按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // 更新内容显示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const targetTab = tabName === 'search' ? 'searchTab' : 'manageTab';
    document.getElementById(targetTab).classList.add('active');
}

/**
 * 重置添加表单
 */
function resetAddForm() {
    const form = document.getElementById('addEngineForm');
    form.reset();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = '添加搜索引擎';
    delete submitBtn.dataset.editIndex;
}

/**
 * 初始化弹出窗口
 */
async function initializePopup() {
    try {
        // 加载自定义搜索引擎
        await loadCustomEngines();
        
        // 获取当前活动标签页
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab || !tab.url) {
            showError('无法获取当前页面信息');
            return;
        }
        
        // 从当前页面URL中提取搜索关键词
        currentSearchQuery = extractSearchQuery(tab.url);
        displayCurrentQuery(currentSearchQuery);
        
        // 为所有搜索引擎按钮添加点击事件监听器
        const engineButtons = document.querySelectorAll('.engine-btn');
        engineButtons.forEach(button => {
            // 跳过自定义搜索引擎按钮（它们在updateCustomEnginesDisplay中处理）
            if (button.closest('#customEnginesContainer')) {
                return;
            }
            
            button.addEventListener('click', (event) => {
                event.preventDefault();
                
                if (!currentSearchQuery) {
                    showError('未检测到搜索关键词，无法切换搜索引擎');
                    return;
                }
                
                const engineUrl = button.dataset.engineUrl;
                const engineName = button.dataset.engineName;
                
                if (!engineUrl) {
                    showError('搜索引擎URL配置错误');
                    return;
                }
                
                const newSearchUrl = buildSearchUrl(engineUrl, currentSearchQuery);
                console.log(`切换到${engineName}: ${newSearchUrl}`);
                openSearchUrl(newSearchUrl);
            });
            
            // 如果没有检测到搜索关键词，禁用按钮
            if (!currentSearchQuery) {
                button.disabled = true;
                button.style.opacity = '0.5';
                button.style.cursor = 'not-allowed';
            }
        });
        
        // 标签切换事件
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                switchTab(btn.dataset.tab);
            });
        });
        
        // 添加搜索引擎表单提交事件
        const addEngineForm = document.getElementById('addEngineForm');
        addEngineForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const engineData = {
                name: document.getElementById('engineName').value.trim(),
                icon: document.getElementById('engineIcon').value.trim(),
                url: document.getElementById('engineUrl').value.trim(),
                domain: document.getElementById('engineDomain').value.trim(),
                param: document.getElementById('engineParam').value.trim()
            };
            
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const editIndex = submitBtn.dataset.editIndex;
            
            let success;
            if (editIndex !== undefined) {
                // 编辑模式
                success = await updateCustomEngine(parseInt(editIndex), engineData);
            } else {
                // 添加模式
                success = await addCustomEngine(engineData);
            }
            
            if (success) {
                resetAddForm();
            }
        });
        
    } catch (error) {
        console.error('初始化弹出窗口时出错:', error);
        showError('初始化失败，请重试');
    }
}

/**
 * 添加键盘快捷键支持
 */
function addKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        // 按数字键1-9快速选择搜索引擎
        if (event.key >= '1' && event.key <= '9') {
            const index = parseInt(event.key) - 1;
            const buttons = document.querySelectorAll('.engine-btn:not(:disabled)');
            if (buttons[index]) {
                buttons[index].click();
            }
        }
        
        // 按Escape键关闭弹出窗口
        if (event.key === 'Escape') {
            window.close();
        }
        
        // 按Tab键切换标签页
        if (event.key === 'Tab' && event.ctrlKey) {
            event.preventDefault();
            const currentTab = document.querySelector('.tab-btn.active').dataset.tab;
            const newTab = currentTab === 'search' ? 'manage' : 'search';
            switchTab(newTab);
        }
    });
}

/**
 * 添加搜索引擎按钮的悬停效果和额外信息
 */
function enhanceUserExperience() {
    const engineButtons = document.querySelectorAll('.engine-btn');
    engineButtons.forEach((button, index) => {
        // 添加快捷键提示
        const shortcutNumber = index + 1;
        if (shortcutNumber <= 9) {
            button.title = `${button.dataset.engineName || button.querySelector('.name')?.textContent} (快捷键: ${shortcutNumber})`;
        }
        
        // 添加悬停效果
        button.addEventListener('mouseenter', () => {
            if (!button.disabled) {
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        });
    });
}

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initializePopup();
    addKeyboardShortcuts();
    enhanceUserExperience();
});

// 导出函数以便测试（可选）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        extractSearchQuery,
        buildSearchUrl,
        SEARCH_ENGINES,
        addCustomEngine,
        deleteCustomEngine,
        updateCustomEngine
    };
}
