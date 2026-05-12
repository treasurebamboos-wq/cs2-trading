// 调试 API - 查看 Take.Skin 返回的原始数据
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    try {
        // 只获取每个分类的第一页，用于调试
        const categories = ['RIFLES', 'PISTOLS', 'KNIVES', 'GLOVES'];
        const samples = {};

        for (const cat of categories) {
            const url = `https://take.skin/api/public/v1/skins?limit=5&page=0&category=${cat}`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'CS2-Trading-Debug/1.0',
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                samples[cat] = {
                    total: data.total,
                    sample: data.data?.slice(0, 3).map(skin => ({
                        name: skin.name,
                        rarity: skin.rarity,
                        weapon: skin.weapon,
                        price: skin.price,
                        hasStatTrak: skin.hasStatTrak,
                        hasSouvenir: skin.hasSouvenir
                    }))
                };
            }
        }

        // 统计所有唯一的 rarity 值
        const allRarities = new Set();
        Object.values(samples).forEach(cat => {
            cat.sample?.forEach(skin => {
                if (skin.rarity) allRarities.add(skin.rarity);
            });
        });

        res.status(200).json({
            success: true,
            uniqueRarities: Array.from(allRarities),
            samples
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
