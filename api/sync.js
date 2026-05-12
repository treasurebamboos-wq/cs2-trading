// Vercel Serverless Function - 同步Take.Skin全量饰品数据
// 支持分类获取：/api/sync?category=RIFLES

export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200'); // 缓存1小时

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { category = 'all', minPrice = 10, limit = 100 } = req.query;
    const USD_TO_CNY = 7.2;

    // 分类映射
    const CATEGORY_MAP = {
        'RIFLES': 'rifle',
        'SMGS': 'smg',
        'PISTOLS': 'pistol',
        'KNIVES': 'knife',
        'GLOVES': 'glove',
        'HEAVY': 'heavy'
    };

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

    // 武器子分类
    const WEAPON_SUBCATEGORY = {
        'MAG-7': 'shotgun',
        'Nova': 'shotgun',
        'Sawed-Off': 'shotgun',
        'XM1014': 'shotgun',
        'M249': 'machinegun',
        'Negev': 'machinegun'
    };

    try {
        const allItems = [];
        const categories = category === 'all'
            ? ['RIFLES', 'PISTOLS', 'SMGS', 'KNIVES', 'GLOVES', 'HEAVY']
            : [category.toUpperCase()];

        for (const cat of categories) {
            try {
                const url = `https://take.skin/api/public/v1/skins?limit=${Math.min(limit, 100)}&category=${cat}`;
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'CS2-Trading-Simulator/1.0',
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.data) {
                        for (const skin of data.data) {
                            if (!skin.price || skin.price < parseFloat(minPrice)) continue;

                            const weaponName = skin.weapon?.name || 'Unknown';
                            let itemCategory = CATEGORY_MAP[cat] || 'other';

                            // 细分HEAVY类别
                            if (itemCategory === 'heavy' && WEAPON_SUBCATEGORY[weaponName]) {
                                itemCategory = WEAPON_SUBCATEGORY[weaponName];
                            }

                            const steamPrice = skin.price;
                            const buffPrice = Math.round(steamPrice * USD_TO_CNY * 0.72 * 100) / 100;
                            const youpinPrice = Math.round(steamPrice * USD_TO_CNY * 0.74 * 100) / 100;

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
                                image: skin.image || null
                            });
                        }
                    }
                }
            } catch (err) {
                console.error(`获取 ${cat} 失败:`, err.message);
            }
        }

        // 按Steam价格降序排序
        allItems.sort((a, b) => b.prices.steam - a.prices.steam);

        // 分类统计
        const stats = {};
        allItems.forEach(item => {
            stats[item.category] = (stats[item.category] || 0) + 1;
        });

        res.status(200).json({
            success: true,
            timestamp: Date.now(),
            source: 'take.skin',
            count: allItems.length,
            stats: stats,
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
