// Vercel Serverless Function - 代理饰品价格API
// 解决浏览器跨域限制问题

export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

    try {
        // 从 cs2.sh 获取价格数据（免费API）
        const response = await fetch('https://cs2.sh/api/prices', {
            headers: {
                'User-Agent': 'CS2-Trading-Simulator/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();

        // 处理数据，提取我们需要的饰品
        const itemsToFetch = [
            'AK-47 | Asiimov',
            'AWP | Asiimov',
            'M4A4 | Howl',
            'AK-47 | Vulcan',
            'USP-S | Kill Confirmed',
            'AWP | Dragon Lore',
            'Desert Eagle | Printstream',
            'Glock-18 | Gamma Doppler',
            'M4A1-S | Printstream',
            'AK-47 | Bloodsport',
            'AWP | Fade',
            'AWP | Lightning Strike',
            'Desert Eagle | Blaze',
            'P250 | Nuclear Threat',
            'MAC-10 | Neon Rider',
            'MP9 | Dark Age',
            'UMP-45 | Wild Child',
            'Butterfly Knife | Doppler',
            'Karambit | Marble Fade',
            'M9 Bayonet | Tiger Tooth',
            'Flip Knife | Doppler',
            'Sport Gloves | Hedge Maze',
            'Driver Gloves | Crimson Weave',
            'Hand Wraps | Slaughter',
        ];

        // 提取匹配的饰品价格
        const prices = {};

        if (data && typeof data === 'object') {
            for (const [itemName, itemData] of Object.entries(data)) {
                // 检查是否是我们需要的饰品
                const matchedItem = itemsToFetch.find(name =>
                    itemName.toLowerCase().includes(name.toLowerCase())
                );

                if (matchedItem && itemData) {
                    prices[itemName] = {
                        steam: itemData.steam?.last_24h || itemData.steam?.last_7d || null,
                        buff: itemData.buff163?.starting_at?.price || null,
                        buff_avg: itemData.buff163?.avg || null,
                    };
                }
            }
        }

        res.status(200).json({
            success: true,
            timestamp: Date.now(),
            count: Object.keys(prices).length,
            prices: prices
        });

    } catch (error) {
        console.error('Price API Error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
}
