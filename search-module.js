/**
 * 全局搜索模块
 * 功能:
 * - 实时搜索建议
 * - 搜索历史记录
 * - 热门搜索推荐
 * - 模糊匹配
 */

class SearchModule {
    constructor(adapter) {
        this.adapter = adapter;
        this.searchInput = null;
        this.searchResults = null;
        this.searchHistory = this._loadHistory();
        this.hotSearches = [
            'AK-47 红线',
            'AWP 龙狙',
            'M4A4 咆哮',
            '爪子刀',
            '蝴蝶刀 渐变之色',
            '手套'
        ];
        this.debounceTimer = null;
        this.isSearching = false;
    }

    init() {
        this.searchInput = document.getElementById('searchInput');
        if (!this.searchInput) {
            console.error('Search input not found');
            return;
        }

        this._createSearchUI();
        this._bindEvents();
    }

    _createSearchUI() {
        // 创建搜索结果容器
        const container = document.createElement('div');
        container.className = 'search-dropdown';
        container.id = 'searchDropdown';
        container.innerHTML = `
            <div class="search-section" id="searchSuggestions">
                <div class="search-section-header">
                    <span class="search-icon">💡</span>
                    <span>搜索建议</span>
                </div>
                <div class="search-items" id="suggestionsList"></div>
            </div>

            <div class="search-section" id="searchHistory" style="display: none;">
                <div class="search-section-header">
                    <span class="search-icon">🕐</span>
                    <span>搜索历史</span>
                    <button class="clear-history-btn" id="clearHistoryBtn">清空</button>
                </div>
                <div class="search-items" id="historyList"></div>
            </div>

            <div class="search-section" id="hotSearches">
                <div class="search-section-header">
                    <span class="search-icon">🔥</span>
                    <span>热门搜索</span>
                </div>
                <div class="search-items" id="hotSearchList"></div>
            </div>
        `;

        // 插入到搜索框后面
        this.searchInput.parentNode.appendChild(container);
        this.searchResults = container;

        // 渲染热门搜索
        this._renderHotSearches();

        // 绑定清空历史按钮
        document.getElementById('clearHistoryBtn').onclick = () => this._clearHistory();
    }

    _bindEvents() {
        // 聚焦时显示下拉
        this.searchInput.addEventListener('focus', () => {
            this._showDropdown();
        });

        // 失焦时延迟隐藏(允许点击结果)
        this.searchInput.addEventListener('blur', () => {
            setTimeout(() => this._hideDropdown(), 200);
        });

        // 输入时搜索
        this.searchInput.addEventListener('input', (e) => {
            this._handleInput(e.target.value);
        });

        // 回车搜索
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const keyword = this.searchInput.value.trim();
                if (keyword) {
                    this._executeSearch(keyword);
                }
            }
        });

        // 点击外部关闭
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.searchResults.contains(e.target)) {
                this._hideDropdown();
            }
        });
    }

    async _handleInput(value) {
        const keyword = value.trim();

        // 清除之前的定时器
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // 空输入显示历史和热门
        if (!keyword) {
            this._renderHistory();
            this._renderHotSearches();
            document.getElementById('searchSuggestions').style.display = 'none';
            document.getElementById('searchHistory').style.display = this.searchHistory.length > 0 ? 'block' : 'none';
            document.getElementById('hotSearches').style.display = 'block';
            return;
        }

        // 防抖搜索
        this.debounceTimer = setTimeout(async () => {
            await this._searchSuggestions(keyword);
        }, 300);
    }

    async _searchSuggestions(keyword) {
        try {
            this.isSearching = true;
            const results = await this.adapter.searchItems(keyword, { limit: 10 });

            if (results.length > 0) {
                this._renderSuggestions(results);
                document.getElementById('searchSuggestions').style.display = 'block';
                document.getElementById('searchHistory').style.display = 'none';
                document.getElementById('hotSearches').style.display = 'none';
            } else {
                // 无结果
                this._renderNoResults();
            }
        } catch (error) {
            console.error('搜索失败:', error);
            this._renderError();
        } finally {
            this.isSearching = false;
        }
    }

    _renderSuggestions(items) {
        const container = document.getElementById('suggestionsList');
        container.innerHTML = items.map(item => `
            <div class="search-item" onclick="searchModule.selectItem('${item.id}', '${this._escape(item.name)}')">
                <img src="${item.image}" alt="${item.name}" class="search-item-image" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22><text y=%2250%%22 x=%2250%%22>🎮</text></svg>'">
                <div class="search-item-info">
                    <div class="search-item-name">${this._highlightKeyword(item.name)}</div>
                    <div class="search-item-meta">
                        <span class="search-item-category">${this._getCategoryLabel(item.category)}</span>
                        <span class="search-item-price">¥${item.prices?.current?.buff || item.buffPrice || 0}</span>
                    </div>
                </div>
                <div class="search-item-arrow">→</div>
            </div>
        `).join('');
    }

    _renderHistory() {
        if (this.searchHistory.length === 0) return;

        const container = document.getElementById('historyList');
        container.innerHTML = this.searchHistory.slice(0, 10).map(keyword => `
            <div class="search-tag" onclick="searchModule.selectHistory('${this._escape(keyword)}')">
                🕐 ${keyword}
            </div>
        `).join('');
    }

    _renderHotSearches() {
        const container = document.getElementById('hotSearchList');
        container.innerHTML = this.hotSearches.map((keyword, index) => `
            <div class="search-tag hot-tag" onclick="searchModule.selectHot('${this._escape(keyword)}')">
                ${index < 3 ? '🔥' : '💡'} ${keyword}
            </div>
        `).join('');
    }

    _renderNoResults() {
        const container = document.getElementById('suggestionsList');
        container.innerHTML = `
            <div class="search-empty">
                <div class="empty-icon">🔍</div>
                <div class="empty-text">未找到相关饰品</div>
            </div>
        `;
        document.getElementById('searchSuggestions').style.display = 'block';
    }

    _renderError() {
        const container = document.getElementById('suggestionsList');
        container.innerHTML = `
            <div class="search-empty">
                <div class="empty-icon">❌</div>
                <div class="empty-text">搜索出错,请稍后再试</div>
            </div>
        `;
    }

    selectItem(itemId, itemName) {
        // 添加到历史
        this._addToHistory(itemName);

        // 跳转到详情或筛选
        this._executeSearch(itemName, itemId);

        // 隐藏下拉
        this._hideDropdown();
    }

    selectHistory(keyword) {
        this.searchInput.value = keyword;
        this._executeSearch(keyword);
        this._hideDropdown();
    }

    selectHot(keyword) {
        this.searchInput.value = keyword;
        this._executeSearch(keyword);
        this._hideDropdown();
    }

    async _executeSearch(keyword, itemId = null) {
        // 添加到历史
        this._addToHistory(keyword);

        // 如果有itemId,直接打开详情
        if (itemId) {
            this._openItemDetail(itemId);
            return;
        }

        // 否则执行全局搜索,筛选结果
        try {
            const results = await this.adapter.searchItems(keyword, { limit: 100 });

            if (results.length > 0) {
                // 更新市场页面的筛选结果
                if (typeof window.updateMarketWithSearchResults === 'function') {
                    window.updateMarketWithSearchResults(results);
                }

                // 切换到市场标签页
                if (typeof switchTab === 'function') {
                    switchTab('market');
                }

                // 显示搜索结果提示
                showToast(`找到 ${results.length} 个相关饰品`);
            } else {
                showToast('⚠️ 未找到相关饰品');
            }
        } catch (error) {
            console.error('搜索执行失败:', error);
            showToast('❌ 搜索失败');
        }
    }

    _openItemDetail(itemId) {
        // 打开详情页面
        if (typeof showItemDetail === 'function') {
            showItemDetail(itemId);
        }
    }

    _showDropdown() {
        if (!this.searchResults) return;

        this.searchResults.classList.add('active');

        // 如果输入为空,显示历史和热门
        if (!this.searchInput.value.trim()) {
            this._renderHistory();
            this._renderHotSearches();
            document.getElementById('searchSuggestions').style.display = 'none';
            document.getElementById('searchHistory').style.display = this.searchHistory.length > 0 ? 'block' : 'none';
            document.getElementById('hotSearches').style.display = 'block';
        }
    }

    _hideDropdown() {
        if (!this.searchResults) return;
        this.searchResults.classList.remove('active');
    }

    _addToHistory(keyword) {
        // 去重
        this.searchHistory = this.searchHistory.filter(k => k !== keyword);

        // 添加到开头
        this.searchHistory.unshift(keyword);

        // 限制数量
        if (this.searchHistory.length > 20) {
            this.searchHistory = this.searchHistory.slice(0, 20);
        }

        // 保存
        this._saveHistory();
    }

    _clearHistory() {
        this.searchHistory = [];
        this._saveHistory();
        document.getElementById('searchHistory').style.display = 'none';
        showToast('✓ 搜索历史已清空');
    }

    _loadHistory() {
        try {
            const stored = localStorage.getItem('search_history');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            return [];
        }
    }

    _saveHistory() {
        try {
            localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('保存搜索历史失败:', error);
        }
    }

    _highlightKeyword(text) {
        const keyword = this.searchInput.value.trim();
        if (!keyword) return text;

        const regex = new RegExp(`(${this._escapeRegex(keyword)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    _getCategoryLabel(category) {
        const labels = {
            'pistol': '手枪',
            'rifle': '步枪',
            'smg': '微冲',
            'heavy': '重型',
            'knife': '匕首',
            'glove': '手套',
            'other': '其他'
        };
        return labels[category] || category;
    }

    _escape(str) {
        return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    }

    _escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// ==================== 全局导出 ====================

if (typeof window !== 'undefined') {
    window.SearchModule = SearchModule;
}

export default SearchModule;
