// Vercel Serverless Function - 使用 Take.Skin 免费API
// 文档：https://take.skin/developers
// 完全免费，无需API Key

export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600'); // 缓存5分钟

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 我们需要查询的饰品列表
    const itemsToFetch = [
        'AK-47 | Asiimov (Field-Tested)',
        'AK-47 | Asiimov (Battle-Scarred)',
        'AWP | Asiimov (Field-Tested)',
        'AWP | Asiimov (Battle-Scarred)',
        'M4A4 | Howl (Minimal Wear)',
        'AK-47 | Vulcan (Factory New)',
        'M4A1-S | Printstream (Factory New)',
        'AK-47 | Bloodsport (Factory New)',
        'AWP | Dragon Lore (Field-Tested)',
        'AWP | Fade (Factory New)',
        'AWP | Lightning Strike (Factory New)',
        'USP-S | Kill Confirmed (Minimal Wear)',
        'Desert Eagle | Printstream (Factory New)',
        'Glock-18 | Gamma Doppler (Factory New)',
        'Desert Eagle | Blaze (Factory New)',
        'P250 | Nuclear Threat (Factory New)',
        'MAC-10 | Neon Rider (Factory New)',
        'MP9 | Dark Age (Minimal Wear)',
        'UMP-45 | Wild Child (Field-Tested)',
    ];

    try {
        const prices = {};
        const USD_TO_CNY = 7.2; // 汇率

        // 方法1：尝试批量获取（通过搜索）
        const searchTerms = ['Asiimov', 'Howl', 'Vulcan', 'Printstream', 'Dragon Lore', 'Fade', 'Doppler', 'Blaze'];

        for (const searchTerm of searchTerms) {
            try {
                const searchUrl = `https://take.skin/api/public/v1/skins?search=${encodeURIComponent(searchTerm)}&limit=50`;
                const response = await fetch(searchUrl, {
                    headers: {
                        'User-Agent': 'CS2-Trading-Simulator/1.0',
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data && data.data && Array.isArray(data.data)) {
                        for (const skin of data.data) {
                            if (skin.marketHashName && skin.price) {
                                // 检查是否是我们需要的饰品
                                const isNeeded = itemsToFetch.some(item =>
                                    skin.marketHashName.toLowerCase().includes(item.toLowerCase().split('(')[0].trim()) ||
                                    item.toLowerCase().includes(skin.marketHashName.toLowerCase().split('(')[0].trim())
                                );

                                if (isNeeded || itemsToFetch.includes(skin.marketHashName)) {
                                    prices[skin.marketHashName] = {
                                        name: skin.name || skin.marketHashName,
                                        baseName: skin.marketHashName.replace(/\s*\([^)]+\)$/, ''),
                                        steam: {
                                            ask: skin.price,
                                            askCNY: parseFloat((skin.price * USD_TO_CNY).toFixed(2)),
                                            volume: skin.volume || 0
                                        },
                                        // 估算Buff价格（通常比Steam低25-30%）
                                        buff: {
                                            askCNY: parseFloat((skin.price * USD_TO_CNY * 0.72).toFixed(2)),
                                            volume: Math.floor((skin.volume || 100) * 1.5)
                                        },
                                        // 估算悠悠有品价格
                                        youpin: {
                                            askCNY: parseFloat((skin.price * USD_TO_CNY * 0.74).toFixed(2)),
                                            volume: Math.floor((skin.volume || 100) * 1.2)
                                        },
                                        wear: skin.wear || null,
                                        rarity: skin.rarity || null,
                                        image: skin.image || null
                                    };
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.error(`搜索 ${searchTerm} 失败:`, err.message);
            }
        }

        // 如果搜索方式获取的数据不够，尝试直接获取热门饰品
        if (Object.keys(prices).length < 5) {
            try {
                const popularUrl = 'https://take.skin/api/public/v1/skins?limit=100&category=RIFLES';
                const response = await fetch(popularUrl, {
                    headers: {
                        'User-Agent': 'CS2-Trading-Simulator/1.0',
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.data && Array.isArray(data.data)) {
                        for (const skin of data.data) {
                            if (skin.marketHashName && skin.price && !prices[skin.marketHashName]) {
                                prices[skin.marketHashName] = {
                                    name: skin.name || skin.marketHashName,
                                    baseName: skin.marketHashName.replace(/\s*\([^)]+\)$/, ''),
                                    steam: {
                                        ask: skin.price,
                                        askCNY: parseFloat((skin.price * USD_TO_CNY).toFixed(2)),
                                        volume: skin.volume || 0
                                    },
                                    buff: {
                                        askCNY: parseFloat((skin.price * USD_TO_CNY * 0.72).toFixed(2)),
                                        volume: Math.floor((skin.volume || 100) * 1.5)
                                    },
                                    youpin: {
                                        askCNY: parseFloat((skin.price * USD_TO_CNY * 0.74).toFixed(2)),
                                        volume: Math.floor((skin.volume || 100) * 1.2)
                                    },
                                    wear: skin.wear || null,
                                    rarity: skin.rarity || null
                                };
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('获取热门饰品失败:', err.message);
            }
        }

        res.status(200).json({
            success: true,
            timestamp: Date.now(),
            source: 'take.skin',
            currency: 'USD',
            note: 'Buff/悠悠有品价格为基于Steam价格的估算值',
            count: Object.keys(prices).length,
            prices: prices
        });

    } catch (error) {
        console.error('Take.Skin API Error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
}
