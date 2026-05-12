// Vercel Serverless Function - 代理 cs2.sh 价格API
// 文档：https://cs2.sh/docs/quickstart

export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 从环境变量获取API Key
    const API_KEY = process.env.CS2SH_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({
            success: false,
            error: '未配置 CS2SH_API_KEY 环境变量',
            timestamp: Date.now()
        });
    }

    // 我们需要查询的饰品列表（使用 market_hash_name 格式）
    const itemsToFetch = [
        // 步枪
        'AK-47 | Asiimov (Field-Tested)',
        'AK-47 | Asiimov (Battle-Scarred)',
        'M4A4 | Howl (Minimal Wear)',
        'M4A4 | Howl (Field-Tested)',
        'AK-47 | Vulcan (Factory New)',
        'AK-47 | Vulcan (Minimal Wear)',
        'M4A1-S | Printstream (Factory New)',
        'M4A1-S | Printstream (Minimal Wear)',
        'AK-47 | Bloodsport (Factory New)',
        'AK-47 | Bloodsport (Minimal Wear)',
        // 狙击枪
        'AWP | Asiimov (Field-Tested)',
        'AWP | Asiimov (Battle-Scarred)',
        'AWP | Dragon Lore (Field-Tested)',
        'AWP | Dragon Lore (Minimal Wear)',
        'AWP | Fade (Factory New)',
        'AWP | Lightning Strike (Factory New)',
        // 手枪
        'USP-S | Kill Confirmed (Minimal Wear)',
        'USP-S | Kill Confirmed (Field-Tested)',
        'Desert Eagle | Printstream (Factory New)',
        'Desert Eagle | Printstream (Minimal Wear)',
        'Glock-18 | Gamma Doppler (Factory New)',
        'Desert Eagle | Blaze (Factory New)',
        'P250 | Nuclear Threat (Factory New)',
        // 冲锋枪
        'MAC-10 | Neon Rider (Factory New)',
        'MAC-10 | Neon Rider (Minimal Wear)',
        'MP9 | Dark Age (Minimal Wear)',
        'UMP-45 | Wild Child (Field-Tested)',
        // 刀（多普勒有Phase变体，这里用基础名）
        '★ Butterfly Knife | Doppler (Factory New)',
        '★ Karambit | Marble Fade (Factory New)',
        '★ M9 Bayonet | Tiger Tooth (Factory New)',
        '★ Flip Knife | Doppler (Factory New)',
        // 手套
        '★ Sport Gloves | Hedge Maze (Field-Tested)',
        '★ Driver Gloves | Crimson Weave (Field-Tested)',
        '★ Hand Wraps | Slaughter (Minimal Wear)',
    ];

    try {
        // 调用 cs2.sh API
        const response = await fetch('https://api.cs2.sh/v1/prices/latest', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip',
            },
            body: JSON.stringify({
                items: itemsToFetch
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API responded with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // 转换数据格式，方便前端使用
        const prices = {};

        if (data && data.items) {
            for (const [marketHashName, itemData] of Object.entries(data.items)) {
                // 提取基础饰品名（去掉磨损度）
                const baseName = marketHashName
                    .replace(/★\s*/g, '')  // 去掉★
                    .replace(/\s*\([^)]+\)$/, '');  // 去掉磨损度括号

                prices[marketHashName] = {
                    baseName: baseName,
                    // Buff价格（人民币，ask是最低售价）
                    buff: itemData.buff ? {
                        ask: itemData.buff.ask,  // USD
                        askCNY: parseFloat((itemData.buff.ask * 7.2).toFixed(2)),  // 转换为CNY
                        bid: itemData.buff.bid,
                        volume: itemData.buff.ask_volume,
                        updatedAt: itemData.buff.updated_at
                    } : null,
                    // 悠悠有品价格
                    youpin: itemData.youpin ? {
                        ask: itemData.youpin.ask,
                        askCNY: parseFloat((itemData.youpin.ask * 7.2).toFixed(2)),
                        bid: itemData.youpin.bid,
                        volume: itemData.youpin.ask_volume,
                        updatedAt: itemData.youpin.updated_at
                    } : null,
                    // Steam价格
                    steam: itemData.steam ? {
                        ask: itemData.steam.ask,
                        askCNY: parseFloat((itemData.steam.ask * 7.2).toFixed(2)),
                        volume: itemData.steam.ask_volume,
                        updatedAt: itemData.steam.updated_at
                    } : null,
                    // CSFloat价格
                    csfloat: itemData.csfloat ? {
                        ask: itemData.csfloat.ask,
                        askCNY: parseFloat((itemData.csfloat.ask * 7.2).toFixed(2)),
                        volume: itemData.csfloat.ask_volume,
                        updatedAt: itemData.csfloat.updated_at
                    } : null,
                };
            }
        }

        res.status(200).json({
            success: true,
            timestamp: Date.now(),
            currency: data.currency || 'USD',
            responseTime: data.response_time,
            count: Object.keys(prices).length,
            prices: prices
        });

    } catch (error) {
        console.error('cs2.sh API Error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
}
