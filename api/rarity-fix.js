// Vercel Serverless Function - 修复稀有度数据
// 使用 SteamWebAPI 免费接口获取正确的稀有度信息

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800'); // 缓存1天

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // 使用 SteamWebAPI 获取 CS2 物品数据（包含正确的稀有度）
        const response = await fetch('https://steamwebapi.com/steam/api/items?key=FREE&game=CS2&select=markethashname,rarity,itemtype,itemgroup,wear,isstattrack,pricelatest', {
            headers: {
                'User-Agent': 'CS2-Trading-Simulator/1.0',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('SteamWebAPI 请求失败');
        }

        const items = await response.json();

        if (!items || !Array.isArray(items)) {
            throw new Error('数据格式错误');
        }

        // 转换为我们的格式
        const rarityMap = {};
        items.forEach(item => {
            if (item.markethashname && item.rarity) {
                rarityMap[item.markethashname] = {
                    rarity: mapRarity(item.rarity),
                    category: mapCategory(item.itemgroup),
                    weapon: item.itemtype || 'unknown',
                    isStatTrak: item.isstattrack === 1
                };
            }
        });

        res.status(200).json({
            success: true,
            count: Object.keys(rarityMap).length,
            rarityMap,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('Rarity Fix API Error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
}

// 映射稀有度
function mapRarity(rarity) {
    const map = {
        'contraband': 'contraband',
        'covert': 'covert',
        'classified': 'classified',
        'restricted': 'restricted',
        'milspec': 'milspec',
        'mil-spec': 'milspec',
        'industrial': 'industrial',
        'consumer': 'consumer',
        'extraordinary': 'extraordinary',
        'exotic': 'exotic',
        'remarkable': 'remarkable',
        'high grade': 'highgrade',
        'highgrade': 'highgrade',
        'master': 'master'
    };

    const key = (rarity || '').toLowerCase().trim();
    return map[key] || 'milspec';
}

// 映射分类
function mapCategory(itemgroup) {
    const map = {
        'rifle': 'rifle',
        'pistol': 'pistol',
        'smg': 'smg',
        'shotgun': 'heavy',
        'machinegun': 'heavy',
        'heavy': 'heavy',
        'knife': 'knife',
        'glove': 'glove',
        'gloves': 'glove',
        'agent': 'other',
        'sticker': 'other',
        'case': 'other',
        'graffiti': 'other',
        'musickit': 'other',
        'patch': 'other',
        'pin': 'other'
    };

    const key = (itemgroup || '').toLowerCase().trim();
    return map[key] || 'other';
}
