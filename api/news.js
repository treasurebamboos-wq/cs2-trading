// Vercel Serverless Function - 爬取 HLTV 和 CS2 官方新闻
import { matchEventByTitle } from './event-impacts.js';

export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800'); // 缓存10分钟

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { source = 'all', limit = 20 } = req.query;

    try {
        const allNews = [];

        // 爬取 HLTV 新闻
        if (source === 'all' || source === 'hltv') {
            try {
                const hltvNews = await fetchHLTVNews(limit);
                allNews.push(...hltvNews);
            } catch (err) {
                console.error('HLTV 爬取失败:', err.message);
            }
        }

        // 爬取 CS2 官方博客
        if (source === 'all' || source === 'cs2') {
            try {
                const cs2News = await fetchCS2News(limit);
                allNews.push(...cs2News);
            } catch (err) {
                console.error('CS2 官方爬取失败:', err.message);
            }
        }

        // 按时间排序
        allNews.sort((a, b) => b.time - a.time);

        // 限制数量
        const finalNews = allNews.slice(0, parseInt(limit) || 20);

        // 为每条新闻匹配相关的价格影响事件
        const newsWithImpacts = finalNews.map(item => {
            const eventImpact = matchEventByTitle(item.title);
            return {
                ...item,
                priceImpact: eventImpact ? {
                    hasImpact: true,
                    eventId: eventImpact.id,
                    eventTitle: eventImpact.title,
                    impactSummary: generateImpactSummary(eventImpact)
                } : {
                    hasImpact: false
                }
            };
        });

        res.status(200).json({
            success: true,
            count: newsWithImpacts.length,
            timestamp: Date.now(),
            news: newsWithImpacts
        });

    } catch (error) {
        console.error('News API Error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
}

// 爬取 HLTV 新闻
async function fetchHLTVNews(limit) {
    const news = [];

    try {
        const response = await fetch('https://www.hltv.org/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
            }
        });

        if (!response.ok) throw new Error('HLTV 请求失败');

        const html = await response.text();

        // 解析新闻标题和链接（HLTV 的新闻列表结构）
        const newsRegex = /<a[^>]*class="newsline[^"]*"[^>]*href="([^"]*)"[^>]*>[\s\S]*?<div[^>]*class="newstext"[^>]*>(.*?)<\/div>/gi;
        const timeRegex = /<div[^>]*class="newsrecent"[^>]*>(.*?)<\/div>/gi;

        let match;
        let count = 0;

        while ((match = newsRegex.exec(html)) !== null && count < limit) {
            const url = match[1].startsWith('http') ? match[1] : `https://www.hltv.org${match[1]}`;
            const title = match[2].replace(/<[^>]*>/g, '').trim();

            // 尝试提取时间
            let timeMatch = timeRegex.exec(html);
            let timeAgo = timeMatch ? timeMatch[1].trim() : '';

            // 转换时间为时间戳（简单估算）
            let timestamp = Date.now();
            if (timeAgo.includes('hour')) {
                const hours = parseInt(timeAgo) || 1;
                timestamp = Date.now() - hours * 3600000;
            } else if (timeAgo.includes('day')) {
                const days = parseInt(timeAgo) || 1;
                timestamp = Date.now() - days * 86400000;
            }

            if (title) {
                news.push({
                    id: `hltv_${Date.now()}_${count}`,
                    title: title,
                    summary: '',
                    source: 'hltv',
                    url: url,
                    image: '🎮',
                    time: timestamp,
                    hot: count < 3 // 前3条标记为热门
                });
                count++;
            }
        }

        // 如果正则匹配失败，返回备用新闻
        if (news.length === 0) {
            news.push({
                id: 'hltv_fallback_1',
                title: 'HLTV 数据加载中...',
                summary: '正在获取最新的 CS2 赛事资讯',
                source: 'hltv',
                url: 'https://www.hltv.org',
                image: '🎮',
                time: Date.now(),
                hot: false
            });
        }

    } catch (error) {
        console.error('HLTV 爬取错误:', error);
        // 返回备用数据
        news.push({
            id: 'hltv_error',
            title: 'HLTV 暂时无法访问',
            summary: '请稍后重试或访问 HLTV 官网',
            source: 'hltv',
            url: 'https://www.hltv.org',
            image: '⚠️',
            time: Date.now(),
            hot: false
        });
    }

    return news;
}

// 爬取 CS2 官方博客
async function fetchCS2News(limit) {
    const news = [];

    try {
        // CS2 官方博客 RSS 或网站
        const response = await fetch('https://www.counter-strike.net/news', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });

        if (!response.ok) throw new Error('CS2 官网请求失败');

        const html = await response.text();

        // 简单解析（实际需要根据网站结构调整）
        const titleRegex = /<h2[^>]*>(.*?)<\/h2>/gi;
        let match;
        let count = 0;

        while ((match = titleRegex.exec(html)) !== null && count < limit) {
            const title = match[1].replace(/<[^>]*>/g, '').trim();

            if (title && title.length > 5) {
                news.push({
                    id: `cs2_${Date.now()}_${count}`,
                    title: title,
                    summary: '',
                    source: 'cs2',
                    url: 'https://www.counter-strike.net/news',
                    image: '📢',
                    time: Date.now() - count * 3600000,
                    hot: count === 0
                });
                count++;
            }
        }

        // 如果解析失败，添加备用数据
        if (news.length === 0) {
            news.push({
                id: 'cs2_fallback',
                title: 'CS2 官方更新',
                summary: '访问官网查看最新更新',
                source: 'cs2',
                url: 'https://www.counter-strike.net/news',
                image: '📢',
                time: Date.now(),
                hot: false
            });
        }

    } catch (error) {
        console.error('CS2 官网爬取错误:', error);
        news.push({
            id: 'cs2_error',
            title: 'CS2 官网数据加载中',
            summary: '请访问官网查看最新资讯',
            source: 'cs2',
            url: 'https://www.counter-strike.net/news',
            image: '⚠️',
            time: Date.now(),
            hot: false
        });
    }

    return news;
}

// 生成价格影响摘要
function generateImpactSummary(eventImpact) {
    if (!eventImpact || !eventImpact.impacts) {
        return null;
    }

    const summary = {
        affectedCategories: eventImpact.impacts.length,
        majorImpacts: [],
        overallTrend: 'mixed' // up/down/mixed/stable
    };

    // 统计涨跌情况
    let upCount = 0;
    let downCount = 0;
    let totalPercentage = 0;

    eventImpact.impacts.forEach(impact => {
        const trend = impact.overall.trend;
        const percentage = impact.overall.percentage;

        summary.majorImpacts.push({
            category: impact.categoryLabel,
            icon: impact.icon,
            trend: trend,
            percentage: percentage,
            confidence: impact.overall.confidence
        });

        if (trend === 'up') upCount++;
        else if (trend === 'down') downCount++;

        totalPercentage += Math.abs(percentage);
    });

    // 判断总体趋势
    if (upCount > downCount * 2) {
        summary.overallTrend = 'up';
    } else if (downCount > upCount * 2) {
        summary.overallTrend = 'down';
    } else if (upCount === 0 && downCount === 0) {
        summary.overallTrend = 'stable';
    } else {
        summary.overallTrend = 'mixed';
    }

    summary.averageImpact = totalPercentage / eventImpact.impacts.length;

    return summary;
}
