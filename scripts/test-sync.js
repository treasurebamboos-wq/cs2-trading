// 本地测试脚本 - 测试 Take.Skin API 数据获取
// 运行方式: node scripts/test-sync.js

const https = require('https');

const USD_TO_CNY = 7.2;
const LIMIT_PER_PAGE = 100;
const MAX_PAGES = 10;

const categories = [
    'RIFLES', 'PISTOLS', 'SMGS', 'KNIVES', 'GLOVES', 'HEAVY',
    'AGENTS', 'STICKERS', 'CASES', 'GRAFFITI', 'MUSIC_KITS', 'PATCHES', 'PINS', 'TOOLS'
];

async function fetchPage(category, page) {
    return new Promise((resolve, reject) => {
        const url = `https://take.skin/api/public/v1/skins?limit=${LIMIT_PER_PAGE}&page=${page}&category=${category}`;

        https.get(url, {
            headers: {
                'User-Agent': 'CS2-Trading-Test/1.0',
                'Accept': 'application/json'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    reject(new Error(`解析失败: ${e.message}`));
                }
            });
        }).on('error', reject);
    });
}

async function fetchCategory(category) {
    const items = [];
    console.log(`正在获取 ${category}...`);

    for (let page = 0; page < MAX_PAGES; page++) {
        try {
            const data = await fetchPage(category, page);

            if (!data.data || data.data.length === 0) {
                break;
            }

            items.push(...data.data);
            process.stdout.write(`  第 ${page + 1} 页: ${data.data.length} 件`);

            if (page === 0) {
                console.log(` (总计 ${data.total} 件, ${data.totalPages} 页)`);
            } else {
                console.log('');
            }

            if (data.data.length < LIMIT_PER_PAGE) {
                break;
            }

            // 添加延迟避免请求过快
            await new Promise(r => setTimeout(r, 200));

        } catch (err) {
            console.error(`  获取第 ${page + 1} 页失败:`, err.message);
            break;
        }
    }

    return items;
}

async function main() {
    console.log('='.repeat(50));
    console.log('Take.Skin API 数据获取测试');
    console.log('='.repeat(50));
    console.log('');

    const allItems = [];
    const stats = {};

    for (const cat of categories) {
        const items = await fetchCategory(cat);
        stats[cat] = items.length;
        allItems.push(...items);
        console.log(`  ✓ ${cat}: ${items.length} 件`);
        console.log('');
    }

    console.log('='.repeat(50));
    console.log('统计结果:');
    console.log('='.repeat(50));

    let total = 0;
    for (const [cat, count] of Object.entries(stats)) {
        console.log(`  ${cat.padEnd(15)}: ${count} 件`);
        total += count;
    }

    console.log('-'.repeat(30));
    console.log(`  总计: ${total} 件饰品`);
    console.log('');

    // 显示价格分布
    const priceRanges = {
        '0-10 USD': 0,
        '10-50 USD': 0,
        '50-100 USD': 0,
        '100-500 USD': 0,
        '500+ USD': 0
    };

    allItems.forEach(item => {
        const price = item.price || 0;
        if (price < 10) priceRanges['0-10 USD']++;
        else if (price < 50) priceRanges['10-50 USD']++;
        else if (price < 100) priceRanges['50-100 USD']++;
        else if (price < 500) priceRanges['100-500 USD']++;
        else priceRanges['500+ USD']++;
    });

    console.log('价格分布:');
    for (const [range, count] of Object.entries(priceRanges)) {
        console.log(`  ${range.padEnd(15)}: ${count} 件`);
    }

    console.log('');
    console.log('测试完成！');
}

main().catch(console.error);
