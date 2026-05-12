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

    // 稀有度映射 - 完整对应Buff分类
    const RARITY_MAP = {
        // 武器稀有度
        'Contraband': 'contraband',     // 违禁
        'Covert': 'covert',             // 隐秘
        'Classified': 'classified',     // 保密
        'Restricted': 'restricted',     // 受限
        'Mil-Spec Grade': 'milspec',    // 军规级
        'Mil-Spec': 'milspec',
        'Industrial Grade': 'industrial', // 工业级
        'Consumer Grade': 'consumer',   // 消费级
        'Base Grade': 'consumer',
        // 特殊物品稀有度
        'Extraordinary': 'extraordinary', // 非凡（刀/手套）
        'Exotic': 'exotic',               // 卓越
        'Remarkable': 'remarkable',       // 奇异
        'High Grade': 'highgrade',        // 高级
        'Master': 'master'                // 大师
    };

    // 武器分类映射 - Buff风格：狙击枪归入步枪，霰弹枪和机枪归入重型武器
    const WEAPON_CATEGORY_MAP = {
        // 狙击枪 → 步枪（Buff把狙击枪和步枪放一起）
        'AWP': 'rifle', 'SSG 08': 'rifle', 'SCAR-20': 'rifle', 'G3SG1': 'rifle',
        // 霰弹枪 → 重型武器
        'MAG-7': 'heavy', 'Nova': 'heavy', 'Sawed-Off': 'heavy', 'XM1014': 'heavy',
        // 机枪 → 重型武器
        'M249': 'heavy', 'Negev': 'heavy'
    };

    // API分类到本地分类的默认映射
    const API_CATEGORY_MAP = {
        'RIFLES': 'rifle',
        'SMGS': 'smg',
        'PISTOLS': 'pistol',
        'KNIVES': 'knife',
        'GLOVES': 'glove',
        'HEAVY': 'heavy',
        'AGENTS': 'other',       // 探员
        'STICKERS': 'other',     // 印花
        'CASES': 'other',        // 武器箱
        'GRAFFITI': 'other',     // 涂鸦
        'MUSIC_KITS': 'other',   // 音乐盒
        'PATCHES': 'other',      // 布章
        'PINS': 'other',         // 胸针
        'TOOLS': 'other'         // 工具
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
        // 获取所有分类，包括探员、印花、武器箱等
        const categories = [
            'RIFLES', 'PISTOLS', 'SMGS', 'KNIVES', 'GLOVES', 'HEAVY',
            'AGENTS', 'STICKERS', 'CASES', 'GRAFFITI', 'MUSIC_KITS', 'PATCHES', 'PINS', 'TOOLS'
        ];
        const maxPg = parseInt(maxPages) || 10;
        const minPriceVal = parseFloat(minPrice) || 0.1; // 降低最低价格门槛

        // 并行获取所有分类
        const promises = categories.map(cat => fetchCategory(cat, maxPg));
        const results = await Promise.all(promises);

        // 处理所有结果
        for (const categoryItems of results) {
            for (const skin of categoryItems) {
                // 跳过无价格或价格过低的
                if (!skin.price || skin.price < minPriceVal) continue;

                const weaponName = skin.weapon?.name || '';
                const apiCategory = skin.apiCategory;

                // 确定分类
                let itemCategory;
                if (weaponName && WEAPON_CATEGORY_MAP[weaponName]) {
                    itemCategory = WEAPON_CATEGORY_MAP[weaponName];
                } else {
                    itemCategory = API_CATEGORY_MAP[apiCategory] || 'other';
                }

                const steamPrice = skin.price;
                const buffPrice = Math.round(steamPrice * USD_TO_CNY * 0.72 * 100) / 100;
                const youpinPrice = Math.round(steamPrice * USD_TO_CNY * 0.74 * 100) / 100;

                // 生成Steam图片URL
                const imageUrl = skin.image || `https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXQ9Q1LO5kNoBhSQl-fVOG_wcbQVmJ4IwpWv7j6HhR2sbrJZG9KuoGzlYOdlfb_ZL_Tl2Vf5cB4t7vFoYvx2VHk8xFuYD_yIYPGIQNqYV7VqFPrx-bs0sS6tZvPy3V9-n515isnkH-dhw/256fx256f`;

                // 生成显示名称（武器皮肤用 "武器 | 皮肤" 格式，其他用原名）
                const displayName = weaponName ? `${weaponName} | ${skin.name}` : skin.name;

                // 确定武器类型slug
                let weaponSlug = 'other';
                if (skin.weapon?.slug) {
                    weaponSlug = skin.weapon.slug;
                } else if (apiCategory === 'AGENTS') {
                    weaponSlug = 'agent';
                } else if (apiCategory === 'STICKERS') {
                    weaponSlug = 'sticker';
                } else if (apiCategory === 'CASES') {
                    weaponSlug = 'case';
                } else if (apiCategory === 'MUSIC_KITS') {
                    weaponSlug = 'music-kit';
                } else if (apiCategory === 'GRAFFITI') {
                    weaponSlug = 'graffiti';
                } else if (apiCategory === 'PATCHES') {
                    weaponSlug = 'patch';
                } else if (apiCategory === 'PINS') {
                    weaponSlug = 'pin';
                }

                allItems.push({
                    name: displayName,
                    nameEn: displayName,
                    slug: skin.slug,
                    category: itemCategory,
                    weapon: weaponSlug,
                    weaponName: weaponName || apiCategory,
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
