/**
 * 排行榜模块
 * 功能:
 * - 涨幅榜 (24h/7d/30d)
 * - 跌幅榜 (24h/7d/30d)
 * - 交易量榜
 * - 最贵饰品榜
 */

class LeaderboardModule {
    constructor(adapter) {
        this.adapter = adapter;
        this.currentType = 'gainers';  // gainers/losers/volume/expensive
        this.currentPeriod = '24h';    // 24h/7d/30d
        this.rankingData = null;
        this.isLoading = false;
    }

    init() {
        this._bindEvents();
        this._loadRankings();
    }

    _bindEvents() {
        // 榜单类型切换
        const tabs = document.querySelectorAll('.lb-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const type = tab.dataset.lb;
                this._switchType(type);
            });
        });

        // 时间周期切换
        const periodBtns = document.querySelectorAll('.period-btn');
        periodBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const period = btn.dataset.period;
                this._switchPeriod(period);
            });
        });
    }

    _switchType(type) {
        if (this.isLoading || type === this.currentType) return;

        // 更新UI状态
        document.querySelectorAll('.lb-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.lb === type);
        });

        this.currentType = type;

        // 重新加载数据
        this._loadRankings();
    }

    _switchPeriod(period) {
        if (this.isLoading || period === this.currentPeriod) return;

        // 更新UI状态
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.period === period);
        });

        this.currentPeriod = period;

        // 重新加载数据
        this._loadRankings();
    }

    async _loadRankings() {
        const container = document.getElementById('rankingList');
        if (!container) return;

        this.isLoading = true;

        // 显示加载状态
        container.innerHTML = `
            <div class="ranking-loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">加载${this._getTypeLabel()}...</div>
            </div>
        `;

        try {
            const data = await this.adapter.getTopMovers({
                type: this.currentType,
                period: this.currentPeriod,
                limit: 50
            });

            this.rankingData = data;
            this._renderRankings(data);
        } catch (error) {
            console.error('加载排行榜失败:', error);
            this._renderError();
        } finally {
            this.isLoading = false;
        }
    }

    _renderRankings(data) {
        const container = document.getElementById('rankingList');
        if (!container || !data || data.length === 0) {
            this._renderEmpty();
            return;
        }

        container.innerHTML = data.map((entry, index) => {
            const item = entry.item;
            const rank = entry.rank || (index + 1);
            const change = entry.change || 0;

            return this._renderRankingItem(rank, item, change);
        }).join('');

        // 添加点击事件
        container.querySelectorAll('.ranking-item').forEach((el, index) => {
            el.addEventListener('click', () => {
                const item = data[index].item;
                this._openItemDetail(item);
            });
        });
    }

    _renderRankingItem(rank, item, change) {
        const medalIcon = this._getMedalIcon(rank);
        const changeHtml = this._getChangeHtml(change);
        const priceHtml = this._getPriceHtml(item);

        return `
            <div class="ranking-item">
                <div class="ranking-rank">
                    ${medalIcon ? `<span class="medal">${medalIcon}</span>` : `<span class="rank-num">${rank}</span>`}
                </div>
                <div class="ranking-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22><text y=%2250%%22 x=%2250%%22>🎮</text></svg>'">
                </div>
                <div class="ranking-info">
                    <div class="ranking-name">${item.name}</div>
                    <div class="ranking-meta">
                        <span class="ranking-category">${this._getCategoryLabel(item.category)}</span>
                        ${item.wear !== 'vanilla' ? `<span class="ranking-wear">${item.wear?.toUpperCase() || ''}</span>` : ''}
                        ${item.isStatTrak ? '<span class="ranking-st">ST</span>' : ''}
                    </div>
                </div>
                <div class="ranking-stats">
                    ${priceHtml}
                    ${changeHtml}
                </div>
            </div>
        `;
    }

    _getMedalIcon(rank) {
        const medals = {
            1: '🥇',
            2: '🥈',
            3: '🥉'
        };
        return medals[rank] || null;
    }

    _getChangeHtml(change) {
        if (this.currentType === 'volume') {
            // 交易量榜显示交易量
            return `<div class="ranking-volume">成交 ${this._formatVolume(change)}</div>`;
        }

        if (this.currentType === 'expensive') {
            // 最贵榜不显示涨跌
            return '';
        }

        // 涨跌榜显示涨跌幅
        const isPositive = change >= 0;
        const className = isPositive ? 'ranking-change positive' : 'ranking-change negative';
        const icon = isPositive ? '↑' : '↓';
        const sign = isPositive ? '+' : '';

        return `<div class="${className}">${icon} ${sign}${change.toFixed(2)}%</div>`;
    }

    _getPriceHtml(item) {
        const price = item.prices?.current?.buff || item.buffPrice || 0;
        return `<div class="ranking-price">¥${price.toFixed(2)}</div>`;
    }

    _formatVolume(volume) {
        if (volume >= 10000) {
            return `${(volume / 10000).toFixed(1)}万`;
        }
        return volume;
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

    _getTypeLabel() {
        const labels = {
            'gainers': '涨幅榜',
            'losers': '跌幅榜',
            'volume': '交易量榜',
            'expensive': '最贵榜'
        };
        return labels[this.currentType] || '排行榜';
    }

    _renderEmpty() {
        const container = document.getElementById('rankingList');
        container.innerHTML = `
            <div class="ranking-empty">
                <div class="empty-icon">📊</div>
                <div class="empty-text">暂无排行数据</div>
            </div>
        `;
    }

    _renderError() {
        const container = document.getElementById('rankingList');
        container.innerHTML = `
            <div class="ranking-empty">
                <div class="empty-icon">❌</div>
                <div class="empty-text">加载失败,请稍后再试</div>
                <button class="btn-retry" onclick="leaderboardModule.refresh()">重试</button>
            </div>
        `;
    }

    _openItemDetail(item) {
        // 打开饰品详情
        if (typeof showItemDetail === 'function') {
            showItemDetail(item.id || item.slug);
        } else {
            console.log('打开详情:', item.name);
        }
    }

    refresh() {
        this._loadRankings();
    }
}

// ==================== 全局导出 ====================

if (typeof window !== 'undefined') {
    window.LeaderboardModule = LeaderboardModule;
}

export default LeaderboardModule;
