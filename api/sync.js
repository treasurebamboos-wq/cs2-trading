// Vercel Serverless Function - 同步Take.Skin全量饰品数据
// 支持分页获取所有分类的饰品

export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600'); // 缓存30分钟

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { minPrice = 1, maxPages = 10 } = req.query;
    const USD_TO_CNY = 7.2;
    const LIMIT_PER_PAGE = 100;

    // 狙击枪列表（Take.Skin把狙击枪放在RIFLES里）
    const SNIPER_WEAPONS = ['AWP', 'SSG 08', 'SCAR-20', 'G3SG1'];

    // 稀有度映射
    const RARITY_MAP = {
        'Contraband': 'contraband',
        'Covert': 'covert',
        'Classified': 'classified',
        'Restricted': 'restricted',
        'Mil-Spec Grade': 'milspec',
        'Mil-Spec': 'milspec',
        'Industrial Grade': 'industrial',
        'Consumer Grade': 'consumer',
        'Base Grade': 'consumer',
        'High Grade': 'milspec',
        'Extraordinary': 'extraordinary',
        'Remarkable': 'classified',
        'Exotic': 'covert',
        'Master': 'covert'
    };

    // 武器分类映射
    const WEAPON_CATEGORY_MAP = {
        // 狙击枪
        'AWP': 'sniper', 'SSG 08': 'sniper', 'SCAR-20': 'sniper', 'G3SG1': 'sniper',
        // 霰弹枪
        'MAG-7': 'shotgun', 'Nova': 'shotgun', 'Sawed-Off': 'shotgun', 'XM1014': 'shotgun',
        // 机枪
        'M249': 'machinegun', 'Negev': 'machinegun'
    };

    // API分类到本地分类的默认映射
    const API_CATEGORY_MAP = {
        'RIFLES': 'rifle',
        'SMGS': 'smg',
        'PISTOLS': 'pistol',
        'KNIVES': 'knife',
        'GLOVES': 'glove',
        'HEAVY': 'heavy'
    };

    // 获取单个分类的所有页数据
    async function fetchCategory(category, maxPg) {
        const items = [];
        for (let page = 0; page < maxPg; page++) {
            try {
                const url = `https://take.skin/api/public/v1/skins?limit=${LIMIT_PER_PAGE}&page=${page}&category=${category}`;
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'CS2-Trading-Simulator/1.0',
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) break;

                const data = await response.json();
                if (!data.data || data.data.length === 0) break;

                items.push(...data.data.map(skin => ({ ...skin, apiCategory: category })));

                // 如果返回数量少于limit，说明已经是最后一页
                if (data.data.length < LIMIT_PER_PAGE) break;

            } catch (err) {
                console.error(`获取 ${category} 第${page}页失败:`, err.message);
                break;
            }
        }
        return items;
    }

    try {
        const allItems = [];
        const categories = ['RIFLES', 'PISTOLS', 'SMGS', 'KNIVES', 'GLOVES', 'HEAVY'];
        const maxPg = parseInt(maxPages) || 10;
        const minPriceVal = parseFloat(minPrice) || 1;

        // 并行获取所有分类
        const promises = categories.map(cat => fetchCategory(cat, maxPg));
        const results = await Promise.all(promises);

        // 处理所有结果
        for (const categoryItems of results) {
            for (const skin of categoryItems) {
                // 跳过无价格或价格过低的
                if (!skin.price || skin.price < minPriceVal) continue;

                const weaponName = skin.weapon?.name || 'Unknown';
                const apiCategory = skin.apiCategory;

                // 确定分类
                let itemCategory;
                if (WEAPON_CATEGORY_MAP[weaponName]) {
                    itemCategory = WEAPON_CATEGORY_MAP[weaponName];
                } else {
                    itemCategory = API_CATEGORY_MAP[apiCategory] || 'other';
                }

                const steamPrice = skin.price;
                const buffPrice = Math.round(steamPrice * USD_TO_CNY * 0.72 * 100) / 100;
                const youpinPrice = Math.round(steamPrice * USD_TO_CNY * 0.74 * 100) / 100;

                // 生成Steam图片URL
                const imageUrl = skin.image || `https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXQ9Q1LO5kNoBhSQl-fVOG_wcbQVmJ4IwpWv7j6HhR2sbrJZG9KuoGzlYOdlfb_ZL_Tl2Vf5cB4t7vFoYvx2VHk8xFuYD_yIYPGIQNqYV7VqFPrx-bs0sS6tZvPy3V9-n515isnkH-dhw/256fx256f`;

                allItems.push({
                    name: `${weaponName} | ${skin.name}`,
                    nameEn: `${weaponName} | ${skin.name}`,
                    slug: skin.slug,
                    category: itemCategory,
                    weapon: skin.weapon?.slug || 'unknown',
                    weaponName: weaponName,
                    rarity: RARITY_MAP[skin.rarity] || 'milspec',
                    rarityOriginal: skin.rarity,
                    isStatTrak: skin.hasStatTrak || false,
                    hasSouvenir: skin.hasSouvenir || false,
                    prices: {
                        steam: Math.round(steamPrice * USD_TO_CNY * 100) / 100,
                        buff: buffPrice,
                        youpin: youpinPrice,
                        steamUSD: steamPrice
                    },
                    image: imageUrl
                });
            }
        }

        // 按Steam价格降序排序
        allItems.sort((a, b) => b.prices.steam - a.prices.steam);

        // 分类统计
        const stats = {};
        const rarityStats = {};
        allItems.forEach(item => {
            stats[item.category] = (stats[item.category] || 0) + 1;
            rarityStats[item.rarity] = (rarityStats[item.rarity] || 0) + 1;
        });

        res.status(200).json({
            success: true,
            timestamp: Date.now(),
            source: 'take.skin',
            count: allItems.length,
            categoryStats: stats,
            rarityStats: rarityStats,
            items: allItems
        });

    } catch (error) {
        console.error('Sync API Error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
}
