/**
 * 数据适配器 - 统一的数据接口层
 *
 * 目的:
 * 1. 抽象数据源,方便切换(模拟数据 → 真实数据)
 * 2. 统一数据格式,降低前端耦合
 * 3. 预留扩展接口,支持多数据源聚合
 */

// ==================== 数据格式标准 ====================

/**
 * 饰品数据标准格式
 * @typedef {Object} ItemData
 * @property {string} id - 唯一标识符
 * @property {string} name - 中文名称
 * @property {string} nameEn - 英文名称
 * @property {string} marketHashName - Steam市场名称
 * @property {string} category - 分类 (rifle/pistol/knife/glove等)
 * @property {string} weapon - 武器类型 (ak47/m4a4等)
 * @property {string} weaponName - 武器中文名
 * @property {string} rarity - 稀有度 (covert/classified等)
 * @property {string} rarityColor - 稀有度颜色
 * @property {string} wear - 磨损代码 (fn/mw/ft/ww/bs)
 * @property {string} wearName - 磨损中文名
 * @property {boolean} isStatTrak - 是否StatTrak™
 * @property {boolean} hasSouvenir - 是否Souvenir
 * @property {Object} prices - 价格数据
 * @property {Object} prices.current - 当前价格
 * @property {number} prices.current.buff - Buff价格(CNY)
 * @property {number} prices.current.youpin - 悠悠有品价格(CNY)
 * @property {number} prices.current.steam - Steam价格(CNY)
 * @property {number} prices.current.steamUSD - Steam价格(USD)
 * @property {number} prices.change24h - 24小时涨跌幅(%)
 * @property {number} prices.change7d - 7天涨跌幅(%)
 * @property {number} prices.change30d - 30天涨跌幅(%)
 * @property {Object} volume - 交易量
 * @property {number} volume.day - 日交易量
 * @property {number} volume.week - 周交易量
 * @property {number} volume.month - 月交易量
 * @property {string} image - 图片URL
 * @property {string[]} collections - 收藏品系列
 * @property {string[]} crates - 箱子来源
 * @property {number} minFloat - 最小Float值
 * @property {number} maxFloat - 最大Float值
 * @property {string} paintIndex - Paint Index
 * @property {string} lastUpdate - 最后更新时间(ISO 8601)
 */

// ==================== 基础适配器抽象类 ====================

class DataAdapter {
    constructor(config = {}) {
        this.config = config;
        this.cache = new Map();
        this.cacheTimeout = config.cacheTimeout || 60000; // 默认缓存1分钟
    }

    /**
     * 获取饰品列表
     * @param {Object} params - 查询参数
     * @param {string} params.category - 分类筛选
     * @param {string} params.rarity - 稀有度筛选
     * @param {string} params.wear - 磨损度筛选
     * @param {number} params.minPrice - 最低价格
     * @param {number} params.maxPrice - 最高价格
     * @param {string} params.sortBy - 排序字段
     * @param {string} params.sortOrder - 排序方向(asc/desc)
     * @param {number} params.page - 页码
     * @param {number} params.limit - 每页数量
     * @returns {Promise<{items: ItemData[], total: number, page: number}>}
     */
    async getItems(params = {}) {
        throw new Error('getItems() must be implemented by subclass');
    }

    /**
     * 获取单个饰品详情
     * @param {string} itemId - 饰品ID
     * @returns {Promise<ItemData>}
     */
    async getItemDetail(itemId) {
        throw new Error('getItemDetail() must be implemented by subclass');
    }

    /**
     * 获取价格历史数据
     * @param {string} itemId - 饰品ID
     * @param {Object} params - 查询参数
     * @param {string} params.range - 时间范围(1d/7d/30d/90d/1y/all)
     * @param {string} params.source - 价格来源(buff/youpin/steam/all)
     * @returns {Promise<{dates: string[], prices: Object}>}
     */
    async getPriceHistory(itemId, params = {}) {
        throw new Error('getPriceHistory() must be implemented by subclass');
    }

    /**
     * 搜索饰品
     * @param {string} keyword - 搜索关键词
     * @param {Object} params - 查询参数
     * @param {number} params.limit - 返回数量限制
     * @returns {Promise<ItemData[]>}
     */
    async searchItems(keyword, params = {}) {
        throw new Error('searchItems() must be implemented by subclass');
    }

    /**
     * 获取涨跌榜
     * @param {Object} params - 查询参数
     * @param {string} params.type - 榜单类型(gainers/losers/volume/expensive)
     * @param {string} params.period - 时间周期(24h/7d/30d)
     * @param {number} params.limit - 返回数量
     * @returns {Promise<Array<{rank: number, item: ItemData, change: number}>>}
     */
    async getTopMovers(params = {}) {
        throw new Error('getTopMovers() must be implemented by subclass');
    }

    /**
     * 获取实时价格(批量)
     * @param {string[]} itemIds - 饰品ID列表
     * @returns {Promise<Object>} - {itemId: {buff, youpin, steam, change24h}}
     */
    async getRealtimePrices(itemIds) {
        throw new Error('getRealtimePrices() must be implemented by subclass');
    }

    // ==================== 缓存辅助方法 ====================

    getCached(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
    }
}

// ==================== 模拟数据适配器 (当前使用) ====================

class MockDataAdapter extends DataAdapter {
    constructor(config = {}) {
        super(config);
        this.mockData = null; // 从LocalStorage加载
    }

    async getItems(params = {}) {
        // 从前端的mockItems加载数据
        const cacheKey = `items_${JSON.stringify(params)}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        // 实际实现:从LocalStorage或API获取
        const allItems = this._loadMockData();
        let filteredItems = allItems;

        // 应用筛选
        if (params.category && params.category !== 'all') {
            filteredItems = filteredItems.filter(item => item.category === params.category);
        }

        if (params.rarity && params.rarity !== 'all') {
            filteredItems = filteredItems.filter(item => item.rarity === params.rarity);
        }

        if (params.wear && params.wear !== 'all') {
            filteredItems = filteredItems.filter(item => item.wear === params.wear);
        }

        if (params.minPrice !== undefined) {
            filteredItems = filteredItems.filter(item => item.prices.current.buff >= params.minPrice);
        }

        if (params.maxPrice !== undefined) {
            filteredItems = filteredItems.filter(item => item.prices.current.buff <= params.maxPrice);
        }

        // 排序
        if (params.sortBy) {
            filteredItems = this._sortItems(filteredItems, params.sortBy, params.sortOrder);
        }

        // 分页
        const page = params.page || 1;
        const limit = params.limit || 50;
        const start = (page - 1) * limit;
        const paginatedItems = filteredItems.slice(start, start + limit);

        const result = {
            items: paginatedItems,
            total: filteredItems.length,
            page,
            totalPages: Math.ceil(filteredItems.length / limit)
        };

        this.setCache(cacheKey, result);
        return result;
    }

    async getItemDetail(itemId) {
        const allItems = this._loadMockData();
        return allItems.find(item => item.id === itemId || item.slug === itemId);
    }

    async getPriceHistory(itemId, params = {}) {
        const range = params.range || '30d';
        const days = this._rangeToDays(range);

        // 生成模拟的历史价格数据
        const dates = [];
        const buffPrices = [];
        const youpinPrices = [];
        const steamPrices = [];

        const item = await this.getItemDetail(itemId);
        if (!item) return { dates: [], prices: {} };

        const basePrice = item.prices.current.buff;

        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);

            // 生成价格波动 (±10%随机波动)
            const variance = (Math.random() - 0.5) * 0.2;
            buffPrices.push(Math.round(basePrice * (1 + variance) * 100) / 100);
            youpinPrices.push(Math.round(basePrice * (1 + variance) * 1.02 * 100) / 100);
            steamPrices.push(Math.round(basePrice * (1 + variance) * 1.45 * 100) / 100);
        }

        return {
            dates,
            prices: {
                buff: buffPrices,
                youpin: youpinPrices,
                steam: steamPrices
            },
            itemName: item.name,
            currentPrice: item.prices.current
        };
    }

    async searchItems(keyword, params = {}) {
        const allItems = this._loadMockData();
        const limit = params.limit || 10;

        const results = allItems.filter(item => {
            const kw = keyword.toLowerCase();
            return item.name.toLowerCase().includes(kw) ||
                   item.nameEn.toLowerCase().includes(kw) ||
                   item.weaponName?.toLowerCase().includes(kw);
        }).slice(0, limit);

        return results;
    }

    async getTopMovers(params = {}) {
        const type = params.type || 'gainers';
        const limit = params.limit || 50;

        const allItems = this._loadMockData();

        // 根据type排序
        let sorted;
        if (type === 'gainers') {
            sorted = allItems.sort((a, b) => b.prices.change24h - a.prices.change24h);
        } else if (type === 'losers') {
            sorted = allItems.sort((a, b) => a.prices.change24h - b.prices.change24h);
        } else if (type === 'volume') {
            sorted = allItems.sort((a, b) => (b.volume?.day || 0) - (a.volume?.day || 0));
        } else if (type === 'expensive') {
            sorted = allItems.sort((a, b) => b.prices.current.buff - a.prices.current.buff);
        }

        return sorted.slice(0, limit).map((item, index) => ({
            rank: index + 1,
            item,
            change: item.prices.change24h || 0
        }));
    }

    async getRealtimePrices(itemIds) {
        const allItems = this._loadMockData();
        const result = {};

        itemIds.forEach(id => {
            const item = allItems.find(i => i.id === id);
            if (item) {
                result[id] = {
                    buff: item.prices.current.buff,
                    youpin: item.prices.current.youpin,
                    steam: item.prices.current.steam,
                    change24h: item.prices.change24h
                };
            }
        });

        return result;
    }

    // ==================== 私有辅助方法 ====================

    _loadMockData() {
        // 从LocalStorage加载或使用全局mockItems
        if (typeof window !== 'undefined' && window.mockItems) {
            return window.mockItems;
        }

        // 从LocalStorage加载
        const stored = localStorage.getItem('cs2_items_data');
        if (stored) {
            return JSON.parse(stored);
        }

        return [];
    }

    _sortItems(items, sortBy, order = 'desc') {
        const sorted = [...items];

        sorted.sort((a, b) => {
            let aVal, bVal;

            if (sortBy === 'price') {
                aVal = a.prices.current.buff;
                bVal = b.prices.current.buff;
            } else if (sortBy === 'change24h') {
                aVal = a.prices.change24h || 0;
                bVal = b.prices.change24h || 0;
            } else if (sortBy === 'volume') {
                aVal = a.volume?.day || 0;
                bVal = b.volume?.day || 0;
            } else if (sortBy === 'name') {
                aVal = a.name;
                bVal = b.name;
            }

            if (order === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return sorted;
    }

    _rangeToDays(range) {
        const map = {
            '1d': 1,
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '1y': 365,
            'all': 730 // 2年
        };
        return map[range] || 30;
    }
}

// ==================== 真实数据适配器 (预留接口) ====================

class RealDataAdapter extends DataAdapter {
    constructor(config = {}) {
        super(config);
        this.apiBase = config.apiBase || '/api/v2';
        this.apiKey = config.apiKey || '';
    }

    async getItems(params = {}) {
        const url = new URL(`${this.apiBase}/items`, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                url.searchParams.append(key, value);
            }
        });

        const response = await fetch(url, {
            headers: this._getHeaders()
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    }

    async getItemDetail(itemId) {
        const response = await fetch(`${this.apiBase}/items/${itemId}`, {
            headers: this._getHeaders()
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    }

    async getPriceHistory(itemId, params = {}) {
        const url = new URL(`${this.apiBase}/prices/history/${itemId}`, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        const response = await fetch(url, {
            headers: this._getHeaders()
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    }

    async searchItems(keyword, params = {}) {
        const url = new URL(`${this.apiBase}/search`, window.location.origin);
        url.searchParams.append('q', keyword);
        if (params.limit) url.searchParams.append('limit', params.limit);

        const response = await fetch(url, {
            headers: this._getHeaders()
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data.items || [];
    }

    async getTopMovers(params = {}) {
        const url = new URL(`${this.apiBase}/rankings`, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        const response = await fetch(url, {
            headers: this._getHeaders()
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    }

    async getRealtimePrices(itemIds) {
        const response = await fetch(`${this.apiBase}/prices/realtime`, {
            method: 'POST',
            headers: this._getHeaders(),
            body: JSON.stringify({ items: itemIds })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    }

    _getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        return headers;
    }
}

// ==================== 导出 ====================

// Vercel Serverless Function (可选)
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    res.status(200).json({
        message: 'Data Adapter Info',
        adapters: ['MockDataAdapter', 'RealDataAdapter'],
        currentAdapter: 'MockDataAdapter',
        switchInstructions: 'Change dataAdapter initialization in app.js'
    });
}

// 浏览器环境导出
if (typeof window !== 'undefined') {
    window.DataAdapter = DataAdapter;
    window.MockDataAdapter = MockDataAdapter;
    window.RealDataAdapter = RealDataAdapter;
}

export { DataAdapter, MockDataAdapter, RealDataAdapter };
