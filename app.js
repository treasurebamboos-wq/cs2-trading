// ==================== 数据存储 ====================
const STORAGE_KEY = 'cs2_trading_data';
const POSTS_KEY = 'cs2_community_posts';
const API_BASE = '/api'; // Vercel Serverless API

// 是否使用真实价格
let useRealPrices = true;
let lastPriceUpdate = null;

// 默认账户数据
const defaultAccount = {
    balance: 100000,
    portfolio: [],
    history: [],
    steamId: null,
    steamInventory: [],
    username: '我',
    likedPosts: [],
};

// 模拟饰品数据（增加分类信息）
const mockItems = [
    // 步枪
    { id: 1, name: 'AK-47 | 二西莫夫', nameEn: 'AK-47 | Asiimov', wear: '久经沙场', category: 'rifle', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEmyVQ7MEpiLuSrYmnjVLj-UM-ZGD7JYLDe1A5NAnW_Ae5wOi-0JC5vJjXmHR9-n51X0aXog/256fx256f', buffPrice: 1580.00, youpinPrice: 1620.00, steamPrice: 2150.00, change24h: 2.5, volume: 1250 },
    { id: 3, name: 'M4A4 | 龙王', nameEn: 'M4A4 | Howl', wear: '略有磨损', category: 'rifle', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alDL_UhFRd4cJ5nqeT9N-g0Qbs80ZuYG37I9SXcwY3YwvQ-gK4xOy6hJ67tJ7Km3s27yMl4ynfzBazhxxJbONxxavJdkAZJQ/256fx256f', buffPrice: 38500.00, youpinPrice: 39200.00, steamPrice: 52000.00, change24h: 0.8, volume: 45 },
    { id: 6, name: 'AK-47 | 火神', nameEn: 'AK-47 | Vulcan', wear: '崭新出厂', category: 'rifle', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszOeC9H_9mkhIWFg8j1OO-GqWlD6dN-teHE9Jrsxgzn8hY_YDzwJY_EcgRqNl3T-APoxOu8g57p6JrLwCBh6T5iuyi1hP7Vfw/256fx256f', buffPrice: 2450.00, youpinPrice: 2520.00, steamPrice: 3300.00, change24h: 1.8, volume: 680 },
    { id: 11, name: 'M4A1-S | 印花集', nameEn: 'M4A1-S | Printstream', wear: '崭新出厂', category: 'rifle', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO3mr-ZkvPLPu_Qx3hu5Mx2gv2Po9ut3w3m8kVkYW_6coeXewM2ZgnS_QC6xO-6jZ68v5zKzXA1vCUq4XrYmEe1n1gSOai-WvI/256fx256f', buffPrice: 1850.00, youpinPrice: 1890.00, steamPrice: 2450.00, change24h: 4.2, volume: 380 },
    { id: 12, name: 'AK-47 | 血腥运动', nameEn: 'AK-47 | Bloodsport', wear: '崭新出厂', category: 'rifle', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV0969i5KPhMj5Nr_Yg2Yf6cYniLrHotqj3VC3_UFqYGH6ctKSIFRtZV7TqFG9xbi-gJG46JnBnHRn7iMh43bVmhG1gR9LOLM4h_KfSELsUaVdN-Ud/256fx256f', buffPrice: 720.00, youpinPrice: 745.00, steamPrice: 980.00, change24h: -0.5, volume: 890 },
    // 狙击枪
    { id: 2, name: 'AWP | 二西莫夫', nameEn: 'AWP | Asiimov', wear: '久经沙场', category: 'sniper', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJK9cyzhr-KmsjwPKvBmm5u5cB1g_zMu4qgjgCy_kE9ZWumJIeTdABoN1jS-1m-we_p0MO1u5XJzXA17CA8pSGKWU-9J1I/256fx256f', buffPrice: 890.00, youpinPrice: 910.00, steamPrice: 1180.00, change24h: -1.2, volume: 2100 },
    { id: 8, name: 'AWP | 龙狼', nameEn: 'AWP | Dragon Lore', wear: '久经沙场', category: 'sniper', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7cqWdQ689jxLzFoIqh0QXg-0VuYj_wLYaccAQ6MlrV-wW6yOy7hZC86s6ayiA26Skq4H_SnEG_0BobbOVpmrXWHFL9SA/256fx256f', buffPrice: 48000.00, youpinPrice: 49500.00, steamPrice: 65000.00, change24h: 1.2, volume: 28 },
    { id: 13, name: 'AWP | 渐变之色', nameEn: 'AWP | Fade', wear: '崭新出厂', category: 'sniper', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAZh7PLfYQJK9cO_mIGZmOb1PbLummJW4NE_j-rEoYjw0Azk8hFtNmH0JNCUdlc8ZF_T_Ve2k7q90JO0tczMzHpgvnUmtnqIzRzigR4dPLI40-DPEFmcUsMLffPqjg/256fx256f', buffPrice: 3200.00, youpinPrice: 3280.00, steamPrice: 4300.00, change24h: 2.1, volume: 156 },
    { id: 14, name: 'AWP | 雷击', nameEn: 'AWP | Lightning Strike', wear: '崭新出厂', category: 'sniper', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAZh7PLfYQJP7c-ikZKSqPv9NLPF2GJU7cFOhuDG-oLKhFWyqBJrMWj6JNOXdQU8aVyG81O_lebmgJC5v5_MziQ36CU8pSGKRw7chkY/256fx256f', buffPrice: 1650.00, youpinPrice: 1680.00, steamPrice: 2200.00, change24h: -2.3, volume: 210 },
    // 手枪
    { id: 7, name: 'USP-S | 杀意大名', nameEn: 'USP-S | Kill Confirmed', wear: '略有磨损', category: 'pistol', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09-jq5WYh8jgDLfYkWNF18lwmO7Eu9Wt0A2xrRBtYGj6doLEdQNvNFvY8lnqxO3v1565vZXMySAyvCAgtyvelkTigh5PbLc/256fx256f', buffPrice: 680.00, youpinPrice: 695.00, steamPrice: 920.00, change24h: 0.5, volume: 420 },
    { id: 9, name: 'Desert Eagle | 印花集', nameEn: 'Desert Eagle | Printstream', wear: '崭新出厂', category: 'pistol', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLAtl7PDdTjlH7du6kb-HnvD8J_WEzjwJvpUp07uUrN6mjgey-hFpZW-hLdTDJlRqYg7T-VK6w-fs0MS6vM-am3NlvyNxsirUy0Dmgk5NYOQ8h_7NVxzAUFeeB3vq/256fx256f', buffPrice: 1250.00, youpinPrice: 1280.00, steamPrice: 1650.00, change24h: 3.2, volume: 520 },
    { id: 10, name: 'Glock-18 | 伽马多普勒', nameEn: 'Glock-18 | Gamma Doppler', wear: '崭新出厂', category: 'pistol', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0Ob3djFN79eJnY6PnvD7DLbUkmJE5Yt3j7jAotSljgLlrkBuYzr0LY-TJwZqaFyG8wK3xO7mgp-5tZXIznRq6yIn7S2OyxG00xodaLRvhPaeBFD5Hq0DGiU/256fx256f', buffPrice: 2850.00, youpinPrice: 2920.00, steamPrice: 3800.00, change24h: -0.8, volume: 165 },
    { id: 15, name: 'Desert Eagle | 炽烈之炎', nameEn: 'Desert Eagle | Blaze', wear: '崭新出厂', category: 'pistol', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLAtl7PLJTjtO7dGzh7-HnvD8DLbUhFRd4cJ5nqfE9tzw0A3nrkBkZmj1doeXdQU5MwnRqVG3yenqgZe8uZ2YyXBqvCMh4SuJzUe3gE5YYOQ8gPvNVxzAUPTCQyVgpQ/256fx256f', buffPrice: 4500.00, youpinPrice: 4620.00, steamPrice: 5900.00, change24h: 1.5, volume: 88 },
    { id: 16, name: 'P250 | 核子危机', nameEn: 'P250 | Nuclear Threat', wear: '崭新出厂', category: 'pistol', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopuP1FABz7P_NfT5H_9-_lb-YmvXgDKvYkG5Q_NV9j-3Q9ojwxAS1qERlZW6nItORJwFtZl7V-Ae7wu68g5K87J6YwCZmuyUj7XjamxfihBlLcKUx0uDPS7Y/256fx256f', buffPrice: 1890.00, youpinPrice: 1950.00, steamPrice: 2500.00, change24h: -1.8, volume: 65 },
    // 冲锋枪
    { id: 17, name: 'MAC-10 | 霓虹骑士', nameEn: 'MAC-10 | Neon Rider', wear: '崭新出厂', category: 'smg', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou7umeldf0Ob3fDxBvYyJhIWFmfX4Nr_ulGRD78A_jL2To9T02QXgqRVoZDj0Jo6RcgU6aQrRqFS4xL-9h5K4u5-cziN9-n515P2cVA/256fx256f', buffPrice: 125.00, youpinPrice: 128.00, steamPrice: 165.00, change24h: 5.2, volume: 1580 },
    { id: 18, name: 'MP9 | 黑暗时代', nameEn: 'MP9 | Dark Age', wear: '略有磨损', category: 'smg', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6r8FA957ODYfTxW-Nmkx7-HnvD8J4Tdl3hU18hzteXI8oThxgTg-kZqMWGnctOVIwdsMFzZ_VS7wue90MTp6p-dzHBqvyEr4HfYlRa30R4aOLI50avJdVBPGL1VEYOi/256fx256f', buffPrice: 85.00, youpinPrice: 88.00, steamPrice: 115.00, change24h: -2.1, volume: 920 },
    { id: 19, name: 'UMP-45 | 荒野反叛', nameEn: 'UMP-45 | Wild Child', wear: '久经沙场', category: 'smg', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo7e1f1Jf1_L3fDhN49KJlYG0mvLwOq7cqWdQ689j3urHpIn3ilGwrhVrYzuiJYbBdwU9Y1HU-wS3k-u60ce1uczNyyBiuCQj4niJyxa1hBpOPOdx0KGAURBfM1u8iw/256fx256f', buffPrice: 45.00, youpinPrice: 48.00, steamPrice: 62.00, change24h: 1.2, volume: 2100 },
    // 刀
    { id: 4, name: '蝴蝶刀 | 多普勒', nameEn: 'Butterfly Knife | Doppler', wear: '崭新出厂', category: 'knife', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqPD1PqzBl2Ju5cB1g_zMu42j3gft8kVtZWvwJYPGJwM7NArWqVO7xOfq1pPpupjMm3FquCgg7C7flRzhh0xPPeJvmqnNhApEJ_c/256fx256f', buffPrice: 12800.00, youpinPrice: 13100.00, steamPrice: 17500.00, change24h: -3.5, volume: 180 },
    { id: 20, name: '爪子刀 | 渐变大理石', nameEn: 'Karambit | Marble Fade', wear: '崭新出厂', category: 'knife', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJl5G0k_jkI7fUhFRB4MRij7j--YXygECLpxI9YG_7ctCTdQRoYw3V_lm7wbi50cS5uJqfn3BiuChz7CuJnRGz0UlKbLVv1PWeBF2dVPfJ5Qfq4w/256fx256f', buffPrice: 9800.00, youpinPrice: 10050.00, steamPrice: 13200.00, change24h: -5.2, volume: 95 },
    { id: 21, name: 'M9 刺刀 | 虎牙', nameEn: 'M9 Bayonet | Tiger Tooth', wear: '崭新出厂', category: 'knife', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3ObcGWxSu4ykxL-DkvbiKoTcl2xU18hzteXI8oThxgTg-kZqMWymINWUdw9rMwqErlK5x-bm0ZW4v5udwHIx7z5iuyg4G3-QBA/256fx256f', buffPrice: 7200.00, youpinPrice: 7380.00, steamPrice: 9600.00, change24h: -4.8, volume: 120 },
    { id: 22, name: '折叠刀 | 多普勒', nameEn: 'Flip Knife | Doppler', wear: '崭新出厂', category: 'knife', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOklY20k_jkI7fUhFRd4cJ5nqeQ9N-niguwr0JlYWqlddKTewE6Mg3Y_VK4kbi90MS4uZTNmyQyuCk8pSGKHfqT8g/256fx256f', buffPrice: 4850.00, youpinPrice: 4980.00, steamPrice: 6500.00, change24h: -2.9, volume: 210 },
    // 手套
    { id: 5, name: '运动手套 | 树篱迷宫', nameEn: 'Sport Gloves | Hedge Maze', wear: '久经沙场', category: 'glove', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopL-zJAt21uH3Yi5FvISJmYGZnPLmDL3QhmJS78B0j-rX8I_33gXl_URoZWqlJ9PBIFc4Zl7Z81a7wO27hpS86cvPyXox6yMj5HrYmhGyhk9KbeVsgP2fRR8q3pAjPw/256fx256f', buffPrice: 5200.00, youpinPrice: 5350.00, steamPrice: 7100.00, change24h: -8.2, volume: 95 },
    { id: 23, name: '驾驶手套 | 深红织物', nameEn: 'Driver Gloves | Crimson Weave', wear: '久经沙场', category: 'glove', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0Ob3djFN79eJkIGKnv-mKoXXl3Nu5Mx2gv2Pos-m3lGy-0s5NjygJIXHew43M1rVrwK6lO29h5Lq7pjJzSYysyYm4CmIzhaygk4ZcLRvgvvKRgPU/256fx256f', buffPrice: 6800.00, youpinPrice: 6980.00, steamPrice: 9100.00, change24h: -6.5, volume: 68 },
    { id: 24, name: '裹手 | 屠夫', nameEn: 'Hand Wraps | Slaughter', wear: '略有磨损', category: 'glove', image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxfIe3OdytP4IO6kL-KlvHLP7rDXmhR_NZlj-nS-JjwhBqLuxBqZDqkd9PCJwFtYFvZ-1nrx-rq15-5uJ_OwXExsiUq7X-PzRS10hsdZuBohP7JVxzAUKRyXF9Y/256fx256f', buffPrice: 4200.00, youpinPrice: 4320.00, steamPrice: 5600.00, change24h: -7.1, volume: 82 },
];

// 筛选状态
let filterState = {
    category: 'all',
    wear: 'all',
    sort: 'default',
    search: ''
};

// CS2 历史重大事件（用于K线图标注）
const cs2Events = [
    { date: '2023-09-27', name: 'CS2 正式发布', impact: '全线饰品价格大幅上涨，市场情绪高涨', priceEffect: 15 },
    { date: '2023-11-15', name: '首个大更新', impact: '修复大量Bug，市场趋于稳定', priceEffect: 3 },
    { date: '2024-01-10', name: '革命武器箱发布', impact: '新皮肤涌入市场，部分老皮肤价格下跌', priceEffect: -5 },
    { date: '2024-03-28', name: '十合一隐秘更新', impact: '刀/手套价格暴跌30%，低级皮肤价格大涨', priceEffect: -25 },
    { date: '2024-06-15', name: 'Armory 补给站更新', impact: '印花、胶囊价格波动，收藏品市场活跃', priceEffect: 8 },
    { date: '2024-09-01', name: 'Major 大赛开始', impact: '赛事相关饰品价格上涨，纪念品热销', priceEffect: 12 },
    { date: '2025-01-20', name: '新年活动', impact: '限定饰品发售，市场交易量增加', priceEffect: 5 },
    { date: '2025-03-15', name: '平衡性更新', impact: '武器数据调整，相关皮肤价格波动', priceEffect: -3 },
];

// 生成模拟历史价格数据
function generatePriceHistory(item, days) {
    const history = [];
    const now = new Date();
    let price = item.buffPrice;

    // 从过去往现在生成
    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // 检查是否有事件影响
        const dateStr = date.toISOString().split('T')[0];
        const event = cs2Events.find(e => e.date === dateStr);

        // 基础随机波动
        let dailyChange = (Math.random() - 0.5) * 0.04; // ±2%

        // 如果有事件，加入事件影响
        if (event) {
            // 根据饰品类型调整事件影响
            let eventImpact = event.priceEffect / 100;

            // 十合一更新对刀和手套影响更大
            if (event.name.includes('十合一') && (item.name.includes('刀') || item.name.includes('手套'))) {
                eventImpact *= 1.5;
            }

            dailyChange += eventImpact;
        }

        // 应用价格变化
        if (i < days) {
            price = price / (1 + dailyChange);
        }

        // 生成OHLC数据
        const open = price;
        const volatility = price * 0.015; // 日内波动
        const high = open + Math.random() * volatility;
        const low = open - Math.random() * volatility;
        const close = low + Math.random() * (high - low);

        history.push({
            time: Math.floor(date.getTime() / 1000),
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
        });

        price = close;
    }

    // 确保最后一个价格接近当前价格
    if (history.length > 0) {
        const last = history[history.length - 1];
        last.close = item.buffPrice;
        last.high = Math.max(last.high, item.buffPrice);
        last.low = Math.min(last.low, item.buffPrice);
    }

    return history;
}

// 获取时间范围内的事件
function getEventsInRange(days) {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    return cs2Events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startDate && eventDate <= now;
    });
}

// 模拟其他用户数据（用于社区和排行榜）
const mockUsers = [
    { id: 1, name: '龙王收藏家', avatar: '🐉', totalValue: 285000, profitRate: 42.5, portfolio: [{ itemId: 3, quantity: 2 }, { itemId: 8, quantity: 1 }] },
    { id: 2, name: '刀狂人', avatar: '🔪', totalValue: 156000, profitRate: 28.3, portfolio: [{ itemId: 4, quantity: 3 }, { itemId: 5, quantity: 2 }] },
    { id: 3, name: '稳健玩家', avatar: '🎯', totalValue: 89000, profitRate: 15.2, portfolio: [{ itemId: 1, quantity: 5 }, { itemId: 2, quantity: 8 }] },
    { id: 4, name: '新手小白', avatar: '🌱', totalValue: 72000, profitRate: -8.5, portfolio: [{ itemId: 6, quantity: 2 }, { itemId: 7, quantity: 3 }] },
    { id: 5, name: '佛系躺平', avatar: '🧘', totalValue: 105000, profitRate: 5.2, portfolio: [{ itemId: 2, quantity: 10 }] },
    { id: 6, name: '全仓龙狼', avatar: '🎰', totalValue: 480000, profitRate: 380.0, portfolio: [{ itemId: 8, quantity: 10 }] },
    { id: 7, name: '印花哥', avatar: '🎨', totalValue: 45000, profitRate: -12.3, portfolio: [{ itemId: 9, quantity: 15 }, { itemId: 10, quantity: 5 }] },
    { id: 8, name: '手套党', avatar: '🧤', totalValue: 198000, profitRate: 32.1, portfolio: [{ itemId: 5, quantity: 8 }] },
];

// 模拟CS2资讯数据（来源：HLTV/CS2官方/市场动态）
const mockNews = [
    {
        id: 1,
        title: 'G2 3-0 横扫 Spirit 夺得 IEM 科隆冠军',
        summary: 'G2 Esports 在决赛中以 3-0 的完美比分击败 Spirit，成功捧起 IEM 科隆冠军奖杯。NiKo 获得 MVP。',
        source: 'hltv',
        url: 'https://www.hltv.org',
        image: '🏆',
        time: Date.now() - 3600000 * 2,
        hot: true
    },
    {
        id: 2,
        title: 'CS2 更新：新增死斗模式地图轮换',
        summary: 'Valve 发布最新更新，死斗模式新增多张地图，同时修复了多个已知Bug。',
        source: 'cs2',
        url: 'https://blog.counter-strike.net',
        image: '🎮',
        time: Date.now() - 3600000 * 5,
        hot: false
    },
    {
        id: 3,
        title: '印花集系列皮肤价格持续上涨',
        summary: '随着赛事临近，印花集系列皮肤（M4A1-S、沙鹰等）价格在过去一周上涨了15%。',
        source: 'market',
        url: '#',
        image: '📈',
        time: Date.now() - 3600000 * 8,
        hot: true
    },
    {
        id: 4,
        title: 'FaZe 宣布阵容变动：ropz 离队',
        summary: 'FaZe Clan 官方宣布，ropz 将离开队伍寻求新机会。俱乐部感谢他的贡献。',
        source: 'hltv',
        url: 'https://www.hltv.org',
        image: '📋',
        time: Date.now() - 3600000 * 12,
        hot: true
    },
    {
        id: 5,
        title: 'CS2 Major 日程公布：上海站确定',
        summary: 'Valve 正式公布 2025 年 Major 赛事日程，上海站将于11月举行，预计影响国区饰品市场。',
        source: 'cs2',
        url: 'https://blog.counter-strike.net',
        image: '🗓️',
        time: Date.now() - 3600000 * 24,
        hot: true
    },
    {
        id: 6,
        title: '龙狼 AWP 价格创历史新高',
        summary: 'AWP | 龙狼 崭新出厂版本在 Buff 平台成交价突破 12 万元，创下历史新高。市场分析师认为稀缺性推动价格上涨。',
        source: 'market',
        url: '#',
        image: '💰',
        time: Date.now() - 3600000 * 36,
        hot: false
    },
    {
        id: 7,
        title: 'NAVI 官宣：s1mple 正式复出',
        summary: 'Natus Vincere 宣布 s1mple 正式结束休息期，将在下月的 BLAST 赛事中重返赛场。',
        source: 'hltv',
        url: 'https://www.hltv.org',
        image: '⭐',
        time: Date.now() - 3600000 * 48,
        hot: true
    },
    {
        id: 8,
        title: '武器箱概率公示：金色几率为 0.26%',
        summary: 'Valve 在部分地区法规要求下公布了武器箱开箱概率，金色物品掉落率为 0.26%。',
        source: 'cs2',
        url: 'https://blog.counter-strike.net',
        image: '🎰',
        time: Date.now() - 3600000 * 72,
        hot: false
    },
    {
        id: 9,
        title: '蝴蝶刀多普勒价格企稳回升',
        summary: '十合一更新利空消化完毕，蝴蝶刀多普勒价格近一周回升 8%，市场信心逐步恢复。',
        source: 'market',
        url: '#',
        image: '🔪',
        time: Date.now() - 3600000 * 96,
        hot: false
    },
    {
        id: 10,
        title: 'Astralis 新阵容首秀告捷',
        summary: 'Astralis 全新阵容在 ESL 资格赛中取得开门红，新人选手 dev1ce 表现亮眼。',
        source: 'hltv',
        url: 'https://www.hltv.org',
        image: '🌟',
        time: Date.now() - 3600000 * 120,
        hot: false
    },
];

// 当前新闻筛选源
let currentNewsSource = 'all';

// 模拟社区帖子
const defaultPosts = [
    { id: 1, authorId: 6, content: '十合一更新后，龙狼涨疯了！当时全仓买入，现在收益翻了好几倍。建议大家关注大版本更新，机会都在其中。', sharePortfolio: true, likes: 128, time: Date.now() - 3600000 * 2 },
    { id: 2, authorId: 1, content: '龙王终于回血了，之前套了半年，现在终于看到曙光。长期持有才是王道！', sharePortfolio: true, likes: 45, time: Date.now() - 3600000 * 5 },
    { id: 3, authorId: 3, content: '稳健玩家的心得：不追高，不杀跌，分散持仓，细水长流。', sharePortfolio: false, likes: 89, time: Date.now() - 3600000 * 12 },
    { id: 4, authorId: 2, content: '蝴蝶刀多普勒最近跌得有点多，但我觉得是入手好时机。十合一利空已经消化，后续应该会反弹。', sharePortfolio: true, likes: 67, time: Date.now() - 3600000 * 24 },
    { id: 5, authorId: 7, content: '印花集系列真的好看，虽然亏了点但是值得！有没有同好来交流？', sharePortfolio: true, likes: 23, time: Date.now() - 3600000 * 36 },
];

// ==================== 账户管理 ====================
let account = loadAccount();
let posts = loadPosts();
let currentLeaderboardType = 'profit';

function loadAccount() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        return JSON.parse(saved);
    }
    return { ...defaultAccount, portfolio: [], history: [], steamInventory: [], likedPosts: [] };
}

function saveAccount() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
}

function loadPosts() {
    const saved = localStorage.getItem(POSTS_KEY);
    if (saved) {
        return JSON.parse(saved);
    }
    return [...defaultPosts];
}

function savePosts() {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

function resetAccount() {
    if (confirm('确定要重置账户吗？\n\n所有持仓和交易记录都会清空，资金恢复到10万。')) {
        account = { ...defaultAccount, portfolio: [], history: [], steamInventory: [], likedPosts: [] };
        saveAccount();
        updateUI();
        showToast('账户已重置');
    }
}

// ==================== UI 更新 ====================
function updateUI() {
    updateBalance();
    updatePortfolioSummary();
    renderMarket();
    renderPortfolio();
    renderHistory();
    renderCommunity();
    renderLeaderboard();
    updateTrustScore();
}

function renderHistory() {
    const container = document.getElementById('historyList');

    if (account.history.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无交易记录</div>';
        return;
    }

    const sortedHistory = [...account.history].reverse();

    container.innerHTML = sortedHistory.map(record => {
        const item = mockItems.find(i => i.id === record.itemId);
        const itemName = item ? item.name : '未知饰品';

        return `
            <div class="history-item">
                <div class="history-info">
                    <div class="history-type ${record.type}">${record.type === 'buy' ? '买' : '卖'}</div>
                    <div class="history-details">
                        <h4>${itemName}</h4>
                        <p>¥${formatNum(record.price)} × ${record.quantity}</p>
                    </div>
                </div>
                <div class="history-amount">
                    <div class="amount" style="color: ${record.type === 'buy' ? 'var(--loss-red)' : 'var(--profit-green)'}">
                        ${record.type === 'buy' ? '-' : '+'}¥${formatNum(record.price * record.quantity)}
                    </div>
                    <div class="time">${formatTimeAgo(record.time)}</div>
                </div>
            </div>
        `;
    }).join('');
}

function updateBalance() {
    document.getElementById('balance').textContent = formatMoney(account.balance);
}

function updatePortfolioSummary() {
    let portfolioValue = 0;
    let totalCost = 0;

    account.portfolio.forEach(holding => {
        const item = mockItems.find(i => i.id === holding.itemId);
        if (item) {
            portfolioValue += item.buffPrice * holding.quantity;
            totalCost += holding.avgCost * holding.quantity;
        }
    });

    const profit = portfolioValue - totalCost;

    document.getElementById('portfolioValue').textContent = formatMoney(portfolioValue);

    const profitEl = document.getElementById('totalProfit');
    profitEl.textContent = (profit >= 0 ? '+' : '') + formatMoney(profit);
    profitEl.className = 'stat-value ' + (profit >= 0 ? 'profit' : 'loss');

    document.getElementById('holdingCount').textContent = account.portfolio.length;
    document.getElementById('tradeCount').textContent = account.history.length;
}

function updateTrustScore() {
    const trustEl = document.getElementById('trustScore');
    if (!account.steamId || account.steamInventory.length === 0) {
        trustEl.textContent = '未同步';
        return;
    }

    let matched = 0;
    let total = account.portfolio.length;

    account.portfolio.forEach(holding => {
        const item = mockItems.find(i => i.id === holding.itemId);
        if (item && account.steamInventory.includes(item.nameEn)) {
            matched++;
        }
    });

    const score = total > 0 ? Math.round((matched / total) * 100) : 0;
    trustEl.textContent = score + '%';
}

function renderMarket() {
    const container = document.getElementById('marketList');
    const statsContainer = document.getElementById('marketStats');

    // 获取筛选条件
    filterState.search = document.getElementById('searchInput').value.toLowerCase();

    // 应用筛选
    let filteredItems = mockItems.filter(item => {
        // 搜索条件
        const matchSearch = filterState.search === '' ||
            item.name.toLowerCase().includes(filterState.search) ||
            item.nameEn.toLowerCase().includes(filterState.search);

        // 分类条件
        const matchCategory = filterState.category === 'all' || item.category === filterState.category;

        // 品质条件
        const matchWear = filterState.wear === 'all' || item.wear === filterState.wear;

        return matchSearch && matchCategory && matchWear;
    });

    // 应用排序
    switch (filterState.sort) {
        case 'price-asc':
            filteredItems.sort((a, b) => a.buffPrice - b.buffPrice);
            break;
        case 'price-desc':
            filteredItems.sort((a, b) => b.buffPrice - a.buffPrice);
            break;
        case 'change-desc':
            filteredItems.sort((a, b) => b.change24h - a.change24h);
            break;
        case 'change-asc':
            filteredItems.sort((a, b) => a.change24h - b.change24h);
            break;
        case 'volume-desc':
            filteredItems.sort((a, b) => b.volume - a.volume);
            break;
        default:
            // 默认按ID排序
            filteredItems.sort((a, b) => a.id - b.id);
    }

    // 显示筛选统计
    const isFiltered = filterState.category !== 'all' || filterState.wear !== 'all' || filterState.search !== '';
    statsContainer.innerHTML = `
        <span>共 <span class="count">${filteredItems.length}</span> 件饰品${isFiltered ? '（已筛选）' : ''}</span>
        ${isFiltered ? '<button class="clear-filter" onclick="clearFilters()">清除筛选</button>' : ''}
    `;

    // 渲染列表
    if (filteredItems.length === 0) {
        container.innerHTML = '<div class="empty-state">没有找到符合条件的饰品</div>';
        return;
    }

    container.innerHTML = filteredItems.map(item => `
        <div class="item-card">
            <img src="${item.image}" alt="${item.name}" onerror="this.style.background='var(--bg-secondary)'" onclick="openChartModal(${item.id})">
            <div class="item-details" onclick="openChartModal(${item.id})">
                <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-wear">${item.wear}</div>
                </div>
                <div class="item-prices">
                    <span class="price-tag buff">Buff ¥${formatNum(item.buffPrice)}</span>
                    <span class="price-tag youpin">悠悠 ¥${formatNum(item.youpinPrice)}</span>
                    <span class="price-tag steam">Steam ¥${formatNum(item.steamPrice)}</span>
                </div>
            </div>
            <div class="item-actions">
                <div class="item-change ${item.change24h >= 0 ? 'up' : 'down'}">
                    ${item.change24h >= 0 ? '+' : ''}${item.change24h}%
                </div>
                <div class="item-btns">
                    <button class="item-btn chart-btn" onclick="openChartModal(${item.id})" title="查看走势">📈</button>
                    <button class="item-btn trade-btn" onclick="openTradeModal(${item.id})" title="交易">💰</button>
                </div>
            </div>
        </div>
    `).join('');
}

// 清除所有筛选
function clearFilters() {
    filterState = { category: 'all', wear: 'all', sort: 'default', search: '' };

    // 重置UI
    document.getElementById('searchInput').value = '';

    document.querySelectorAll('#categoryFilter .filter-tag').forEach(tag => {
        tag.classList.toggle('active', tag.dataset.category === 'all');
    });
    document.querySelectorAll('#wearFilter .filter-tag').forEach(tag => {
        tag.classList.toggle('active', tag.dataset.wear === 'all');
    });
    document.querySelectorAll('#sortFilter .filter-tag').forEach(tag => {
        tag.classList.toggle('active', tag.dataset.sort === 'default');
    });

    renderMarket();
}

function renderPortfolio() {
    const container = document.getElementById('portfolioList');

    if (account.portfolio.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无持仓，去市场买点饰品吧</div>';
        return;
    }

    container.innerHTML = account.portfolio.map(holding => {
        const item = mockItems.find(i => i.id === holding.itemId);
        if (!item) return '';

        const currentValue = item.buffPrice * holding.quantity;
        const cost = holding.avgCost * holding.quantity;
        const profit = currentValue - cost;
        const profitPercent = ((currentValue / cost - 1) * 100).toFixed(2);

        return `
            <div class="holding-card" onclick="openTradeModal(${item.id})">
                <div class="holding-header">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="holding-info">
                        <div class="holding-name">${item.name}</div>
                        <div class="holding-quantity">持有 ${holding.quantity} 件</div>
                    </div>
                </div>
                <div class="holding-stats">
                    <div class="holding-stat">
                        <div class="holding-stat-label">成本</div>
                        <div class="holding-stat-value">¥${formatNum(holding.avgCost)}</div>
                    </div>
                    <div class="holding-stat">
                        <div class="holding-stat-label">现价</div>
                        <div class="holding-stat-value">¥${formatNum(item.buffPrice)}</div>
                    </div>
                    <div class="holding-stat">
                        <div class="holding-stat-label">盈亏</div>
                        <div class="holding-stat-value" style="color: ${profit >= 0 ? 'var(--profit-green)' : 'var(--loss-red)'}">
                            ${profit >= 0 ? '+' : ''}${profitPercent}%
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== 资讯功能 ====================
function renderNews() {
    const container = document.getElementById('newsList');

    // 筛选新闻
    let filteredNews = mockNews;
    if (currentNewsSource !== 'all') {
        filteredNews = mockNews.filter(news => news.source === currentNewsSource);
    }

    if (filteredNews.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无相关资讯</div>';
        return;
    }

    container.innerHTML = filteredNews.map(news => {
        const sourceLabel = {
            'hltv': 'HLTV',
            'cs2': 'CS2官方',
            'market': '市场动态'
        }[news.source];

        const sourceClass = news.source;

        return `
            <div class="news-card ${news.hot ? 'hot' : ''}" onclick="openNewsUrl('${news.url}')">
                <div class="news-icon">${news.image}</div>
                <div class="news-content">
                    <div class="news-meta">
                        <span class="news-source ${sourceClass}">${sourceLabel}</span>
                        <span class="news-time">${formatTimeAgo(news.time)}</span>
                        ${news.hot ? '<span class="news-hot">🔥 热门</span>' : ''}
                    </div>
                    <h4 class="news-title">${news.title}</h4>
                    <p class="news-summary">${news.summary}</p>
                </div>
                <div class="news-arrow">→</div>
            </div>
        `;
    }).join('');
}

function openNewsUrl(url) {
    if (url && url !== '#') {
        window.open(url, '_blank');
    }
}

function refreshNews() {
    showToast('正在刷新资讯...');
    // 模拟刷新延迟
    setTimeout(() => {
        // 随机更新一些新闻的时间，模拟获取新数据
        mockNews.forEach(news => {
            if (Math.random() > 0.7) {
                news.time = Date.now() - Math.random() * 3600000 * 24;
            }
        });
        renderNews();
        showToast('资讯已更新');
    }, 800);
}

// ==================== 社区功能 ====================
function renderCommunity() {
    const container = document.getElementById('communityList');

    const sortedPosts = [...posts].sort((a, b) => b.time - a.time);

    container.innerHTML = sortedPosts.map(post => {
        const author = mockUsers.find(u => u.id === post.authorId) || { name: account.username, avatar: '😊', profitRate: getMyProfitRate() };
        const isLiked = account.likedPosts.includes(post.id);
        const isMyPost = post.authorId === 0;

        let portfolioHtml = '';
        if (post.sharePortfolio) {
            const holdings = isMyPost ? account.portfolio : author.portfolio;
            if (holdings && holdings.length > 0) {
                const items = holdings.map(h => {
                    const item = mockItems.find(i => i.id === h.itemId);
                    return item ? `<span class="portfolio-tag">${item.name} ×${h.quantity}</span>` : '';
                }).join('');
                portfolioHtml = `
                    <div class="post-portfolio">
                        <div class="post-portfolio-title">持仓展示</div>
                        <div class="post-portfolio-items">${items}</div>
                    </div>
                `;
            }
        }

        return `
            <div class="post-card">
                <div class="post-header">
                    <div class="post-author">
                        <div class="author-avatar">${author.avatar}</div>
                        <div class="author-info">
                            <span class="author-name" onclick="openUserModal(${post.authorId})">${author.name}</span>
                            <span class="author-stats">收益率 <span class="${author.profitRate >= 0 ? 'profit' : 'loss'}">${author.profitRate >= 0 ? '+' : ''}${author.profitRate.toFixed(1)}%</span></span>
                        </div>
                    </div>
                    <span class="post-time">${formatTimeAgo(post.time)}</span>
                </div>
                <div class="post-content">${post.content}</div>
                ${portfolioHtml}
                <div class="post-actions">
                    <button class="post-action ${isLiked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                        ${isLiked ? '❤️' : '🤍'} ${post.likes}
                    </button>
                    <button class="post-action" onclick="copyPost(${post.id})">
                        📋 复制持仓
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function openPostModal() {
    document.getElementById('postContent').value = '';
    document.getElementById('sharePortfolio').checked = false;
    document.getElementById('postModal').classList.add('active');
}

function closePostModal() {
    document.getElementById('postModal').classList.remove('active');
}

function submitPost() {
    const content = document.getElementById('postContent').value.trim();
    if (!content) {
        showToast('请输入内容');
        return;
    }

    const newPost = {
        id: Date.now(),
        authorId: 0, // 0 表示当前用户
        content: content,
        sharePortfolio: document.getElementById('sharePortfolio').checked,
        likes: 0,
        time: Date.now(),
    };

    posts.unshift(newPost);
    savePosts();
    closePostModal();
    renderCommunity();
    showToast('发布成功');
}

function toggleLike(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const index = account.likedPosts.indexOf(postId);
    if (index > -1) {
        account.likedPosts.splice(index, 1);
        post.likes--;
    } else {
        account.likedPosts.push(postId);
        post.likes++;
    }

    saveAccount();
    savePosts();
    renderCommunity();
}

function copyPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post || !post.sharePortfolio) {
        showToast('该帖子未分享持仓');
        return;
    }

    const author = post.authorId === 0 ? { portfolio: account.portfolio } : mockUsers.find(u => u.id === post.authorId);
    if (!author || !author.portfolio) return;

    const items = author.portfolio.map(h => {
        const item = mockItems.find(i => i.id === h.itemId);
        return item ? `${item.name} ×${h.quantity}` : '';
    }).filter(Boolean).join('\n');

    navigator.clipboard.writeText(items).then(() => {
        showToast('持仓已复制到剪贴板');
    }).catch(() => {
        showToast('复制失败');
    });
}

// ==================== 排行榜功能 ====================
function renderLeaderboard() {
    const container = document.getElementById('leaderboardList');

    // 计算当前用户的数据
    const myData = getMyStats();

    // 合并用户数据
    let allUsers = [...mockUsers, { id: 0, name: '我', avatar: '😊', totalValue: myData.totalValue, profitRate: myData.profitRate, portfolio: account.portfolio }];

    // 根据类型排序
    if (currentLeaderboardType === 'profit') {
        allUsers.sort((a, b) => b.profitRate - a.profitRate);
    } else {
        allUsers.sort((a, b) => b.totalValue - a.totalValue);
    }

    container.innerHTML = allUsers.map((user, index) => {
        const rank = index + 1;
        let rankClass = '';
        if (rank === 1) rankClass = 'top-1';
        else if (rank === 2) rankClass = 'top-2';
        else if (rank === 3) rankClass = 'top-3';

        const isMe = user.id === 0;
        const mainValue = currentLeaderboardType === 'profit'
            ? `${user.profitRate >= 0 ? '+' : ''}${user.profitRate.toFixed(1)}%`
            : formatMoney(user.totalValue);
        const subValue = currentLeaderboardType === 'profit'
            ? `资产 ${formatMoney(user.totalValue)}`
            : `收益 ${user.profitRate >= 0 ? '+' : ''}${user.profitRate.toFixed(1)}%`;

        return `
            <div class="rank-card ${rankClass}" onclick="openUserModal(${user.id})">
                <div class="rank-number">${rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}</div>
                <div class="rank-avatar">${user.avatar}</div>
                <div class="rank-info">
                    <div class="rank-name">${user.name}${isMe ? ' (我)' : ''}</div>
                    <div class="rank-detail">${user.portfolio ? user.portfolio.length : 0} 个持仓</div>
                </div>
                <div class="rank-value">
                    <div class="rank-main ${user.profitRate >= 0 ? 'profit' : 'loss'}">${mainValue}</div>
                    <div class="rank-sub">${subValue}</div>
                </div>
            </div>
        `;
    }).join('');
}

function getMyStats() {
    let totalValue = account.balance;
    let totalCost = 100000; // 初始资金

    account.portfolio.forEach(holding => {
        const item = mockItems.find(i => i.id === holding.itemId);
        if (item) {
            totalValue += item.buffPrice * holding.quantity;
        }
    });

    const profitRate = ((totalValue / totalCost - 1) * 100);
    return { totalValue, profitRate };
}

function getMyProfitRate() {
    return getMyStats().profitRate;
}

// ==================== 用户详情弹窗 ====================
function openUserModal(userId) {
    const isMe = userId === 0;
    const user = isMe
        ? { name: '我', avatar: '😊', ...getMyStats(), portfolio: account.portfolio }
        : mockUsers.find(u => u.id === userId);

    if (!user) return;

    document.getElementById('userModalTitle').textContent = isMe ? '我的持仓' : `${user.name} 的持仓`;

    const profileHtml = `
        <div class="user-avatar-lg">${user.avatar}</div>
        <div class="user-info-lg">
            <h4>${user.name}</h4>
            <div class="user-stats-row">
                <span class="user-stat">总资产 <span>¥${formatNum(user.totalValue)}</span></span>
                <span class="user-stat">收益率 <span class="${user.profitRate >= 0 ? 'profit' : ''}">${user.profitRate >= 0 ? '+' : ''}${user.profitRate.toFixed(1)}%</span></span>
            </div>
        </div>
    `;
    document.getElementById('userProfile').innerHTML = profileHtml;

    let holdingsHtml = '<h5>持仓明细</h5>';
    if (user.portfolio && user.portfolio.length > 0) {
        holdingsHtml += user.portfolio.map(h => {
            const item = mockItems.find(i => i.id === h.itemId);
            if (!item) return '';
            return `
                <div class="user-holding-item">
                    <div>
                        <div class="user-holding-name">${item.name}</div>
                        <div class="user-holding-qty">×${h.quantity}</div>
                    </div>
                    <div class="user-holding-value">
                        <div class="user-holding-price">¥${formatNum(item.buffPrice * h.quantity)}</div>
                        <div class="user-holding-change ${item.change24h >= 0 ? 'profit' : 'loss'}">${item.change24h >= 0 ? '+' : ''}${item.change24h}%</div>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        holdingsHtml += '<div class="empty-state" style="padding: 24px;">暂无持仓</div>';
    }
    document.getElementById('userHoldings').innerHTML = holdingsHtml;

    document.getElementById('userModal').classList.add('active');
}

function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
}

// ==================== K线图功能 ====================
let currentChartItem = null;
let currentChart = null;
let currentPeriod = 30;

function openChartModal(itemId) {
    currentChartItem = mockItems.find(i => i.id === itemId);
    if (!currentChartItem) return;

    document.getElementById('chartModalTitle').textContent = '价格走势';

    // 显示饰品信息
    const itemInfoHtml = `
        <img src="${currentChartItem.image}" alt="${currentChartItem.name}">
        <div class="chart-item-details">
            <h4>${currentChartItem.name}</h4>
            <div class="chart-item-prices">
                <span class="price-main">Buff ¥${formatNum(currentChartItem.buffPrice)}</span>
                <span class="price-change ${currentChartItem.change24h >= 0 ? 'up' : 'down'}">
                    ${currentChartItem.change24h >= 0 ? '+' : ''}${currentChartItem.change24h}%
                </span>
            </div>
        </div>
    `;
    document.getElementById('chartItemInfo').innerHTML = itemInfoHtml;

    // 重置周期选择
    document.querySelectorAll('.period-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.period === '30') {
            tab.classList.add('active');
        }
    });
    currentPeriod = 30;

    document.getElementById('chartModal').classList.add('active');

    // 延迟渲染图表，确保DOM已经显示
    setTimeout(() => {
        renderChart(currentPeriod);
        renderChartEvents(currentPeriod);
    }, 100);
}

function closeChartModal() {
    document.getElementById('chartModal').classList.remove('active');
    if (currentChart) {
        currentChart.remove();
        currentChart = null;
    }
    currentChartItem = null;
}

function renderChart(days) {
    const container = document.getElementById('priceChart');
    container.innerHTML = '';

    if (!currentChartItem) return;

    // 生成价格历史数据
    const priceData = generatePriceHistory(currentChartItem, days);

    // 创建图表
    currentChart = LightweightCharts.createChart(container, {
        width: container.clientWidth,
        height: 280,
        layout: {
            background: { type: 'solid', color: '#f7f6f3' },
            textColor: '#37352f',
        },
        grid: {
            vertLines: { color: '#e3e2de' },
            horzLines: { color: '#e3e2de' },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        rightPriceScale: {
            borderColor: '#e3e2de',
        },
        timeScale: {
            borderColor: '#e3e2de',
            timeVisible: true,
            secondsVisible: false,
        },
    });

    // 添加K线系列
    const candlestickSeries = currentChart.addCandlestickSeries({
        upColor: '#0f7b6c',
        downColor: '#e03e3e',
        borderDownColor: '#e03e3e',
        borderUpColor: '#0f7b6c',
        wickDownColor: '#e03e3e',
        wickUpColor: '#0f7b6c',
    });

    candlestickSeries.setData(priceData);

    // 添加事件标记
    const events = getEventsInRange(days);
    const markers = events.map(event => {
        const eventDate = new Date(event.date);
        return {
            time: Math.floor(eventDate.getTime() / 1000),
            position: 'aboveBar',
            color: '#d9730d',
            shape: 'circle',
            text: '⚡',
        };
    });

    if (markers.length > 0) {
        candlestickSeries.setMarkers(markers);
    }

    // 自适应图表大小
    currentChart.timeScale().fitContent();
}

function renderChartEvents(days) {
    const events = getEventsInRange(days);
    const container = document.getElementById('chartEvents');

    if (events.length === 0) {
        container.innerHTML = `
            <div class="chart-events-title">时间范围内的重大事件</div>
            <div style="color: var(--text-muted); font-size: 13px; padding: 12px 0;">
                最近 ${days} 天内没有重大事件
            </div>
        `;
        return;
    }

    const eventsHtml = events.map(event => `
        <div class="event-item">
            <div class="event-date">${formatEventDate(event.date)}</div>
            <div class="event-content">
                <div class="event-name">⚡ ${event.name}</div>
                <div class="event-impact">${event.impact}</div>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="chart-events-title">时间范围内的重大事件</div>
        <div class="event-list">${eventsHtml}</div>
    `;
}

function formatEventDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function openTradeFromChart() {
    if (currentChartItem) {
        closeChartModal();
        setTimeout(() => {
            openTradeModal(currentChartItem.id);
        }, 200);
    }
}

// 周期切换事件
document.querySelectorAll('.period-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const period = parseInt(tab.dataset.period);
        currentPeriod = period;

        document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        renderChart(period);
        renderChartEvents(period);
    });
});

// ==================== 交易功能 ====================
let currentTradeItem = null;
let currentTradeType = 'buy';

function openTradeModal(itemId) {
    currentTradeItem = mockItems.find(i => i.id === itemId);
    if (!currentTradeItem) return;

    document.getElementById('modalTitle').textContent = '交易';
    document.getElementById('modalItemImg').src = currentTradeItem.image;
    document.getElementById('modalItemName').textContent = currentTradeItem.name;
    document.getElementById('modalBuffPrice').textContent = '¥' + formatNum(currentTradeItem.buffPrice);
    document.getElementById('modalYoupinPrice').textContent = '¥' + formatNum(currentTradeItem.youpinPrice);
    document.getElementById('modalSteamPrice').textContent = '¥' + formatNum(currentTradeItem.steamPrice);
    document.getElementById('tradeQuantity').value = 1;

    setTradeType('buy');
    updateTradeTotal();

    document.getElementById('tradeModal').classList.add('active');
}

function closeModal() {
    document.getElementById('tradeModal').classList.remove('active');
    currentTradeItem = null;
}

function setTradeType(type) {
    currentTradeType = type;
    document.querySelectorAll('.trade-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.trade-btn.${type}`).classList.add('active');
    updateTradeTotal();
}

function adjustQuantity(delta) {
    const input = document.getElementById('tradeQuantity');
    let value = parseInt(input.value) + delta;
    if (value < 1) value = 1;
    input.value = value;
    updateTradeTotal();
}

function updateTradeTotal() {
    if (!currentTradeItem) return;
    const quantity = parseInt(document.getElementById('tradeQuantity').value) || 1;
    const total = currentTradeItem.buffPrice * quantity;
    document.getElementById('tradeTotal').textContent = formatMoney(total);
}

function confirmTrade() {
    if (!currentTradeItem) return;

    const quantity = parseInt(document.getElementById('tradeQuantity').value) || 1;
    const price = currentTradeItem.buffPrice;
    const total = price * quantity;

    if (currentTradeType === 'buy') {
        if (total > account.balance) {
            showToast('余额不足');
            return;
        }

        account.balance -= total;

        const existingHolding = account.portfolio.find(h => h.itemId === currentTradeItem.id);
        if (existingHolding) {
            const totalCost = existingHolding.avgCost * existingHolding.quantity + total;
            existingHolding.quantity += quantity;
            existingHolding.avgCost = totalCost / existingHolding.quantity;
        } else {
            account.portfolio.push({
                itemId: currentTradeItem.id,
                quantity: quantity,
                avgCost: price,
            });
        }

        showToast(`买入 ${quantity} 件 ${currentTradeItem.name}`);
    } else {
        const holding = account.portfolio.find(h => h.itemId === currentTradeItem.id);
        if (!holding || holding.quantity < quantity) {
            showToast('持仓不足');
            return;
        }

        account.balance += total;
        holding.quantity -= quantity;

        if (holding.quantity === 0) {
            account.portfolio = account.portfolio.filter(h => h.itemId !== currentTradeItem.id);
        }

        showToast(`卖出 ${quantity} 件 ${currentTradeItem.name}`);
    }

    account.history.push({
        type: currentTradeType,
        itemId: currentTradeItem.id,
        price: price,
        quantity: quantity,
        time: Date.now(),
    });

    saveAccount();
    closeModal();
    updateUI();
}

// ==================== Steam 库存同步 ====================
function syncSteamInventory() {
    document.getElementById('steamModal').classList.add('active');
}

function closeSteamModal() {
    document.getElementById('steamModal').classList.remove('active');
}

function doSyncSteam() {
    const input = document.getElementById('steamIdInput').value.trim();
    if (!input) {
        showToast('请输入 Steam 链接');
        return;
    }

    showToast('正在同步...');

    setTimeout(() => {
        account.steamId = input;
        account.steamInventory = ['AK-47 | Asiimov', 'AWP | Asiimov', 'Desert Eagle | Printstream'];

        saveAccount();
        closeSteamModal();
        updateUI();

        showToast('同步完成！发现 3 件饰品');

        setTimeout(() => {
            const unsyncedItems = account.steamInventory.filter(name => {
                const item = mockItems.find(i => i.nameEn === name);
                if (!item) return false;
                return !account.portfolio.find(h => h.itemId === item.id);
            });

            if (unsyncedItems.length > 0) {
                if (confirm(`发现 ${unsyncedItems.length} 件饰品在真实库存中但不在模拟盘，是否同步买入？`)) {
                    unsyncedItems.forEach(name => {
                        const item = mockItems.find(i => i.nameEn === name);
                        if (item && account.balance >= item.buffPrice) {
                            account.balance -= item.buffPrice;
                            account.portfolio.push({ itemId: item.id, quantity: 1, avgCost: item.buffPrice });
                            account.history.push({ type: 'buy', itemId: item.id, price: item.buffPrice, quantity: 1, time: Date.now() });
                        }
                    });
                    saveAccount();
                    updateUI();
                    showToast('已同步买入');
                }
            }
        }, 500);
    }, 1500);
}

// ==================== 真实价格API ====================
async function fetchRealPrices() {
    if (!useRealPrices) return;

    try {
        showToast('正在获取最新价格...');

        const response = await fetch(`${API_BASE}/prices`);
        const data = await response.json();

        if (data.success && data.prices) {
            let updatedCount = 0;

            // 遍历返回的价格数据
            for (const [itemName, priceData] of Object.entries(data.prices)) {
                // 查找匹配的饰品
                const item = mockItems.find(i => {
                    const itemNameLower = itemName.toLowerCase();
                    const searchName = i.nameEn.toLowerCase();
                    return itemNameLower.includes(searchName) || searchName.includes(itemNameLower.split('(')[0].trim());
                });

                if (item && priceData) {
                    // 保存旧价格用于计算涨跌幅
                    const oldPrice = item.buffPrice;

                    // 更新价格（Buff价格，单位转换：API返回的是美元或人民币）
                    if (priceData.buff && priceData.buff > 0) {
                        item.buffPrice = parseFloat(priceData.buff.toFixed(2));
                        updatedCount++;
                    } else if (priceData.buff_avg && priceData.buff_avg > 0) {
                        item.buffPrice = parseFloat(priceData.buff_avg.toFixed(2));
                        updatedCount++;
                    }

                    // 更新Steam价格
                    if (priceData.steam && priceData.steam > 0) {
                        // Steam价格通常是美元，转换为人民币（汇率约7.2）
                        item.steamPrice = parseFloat((priceData.steam * 7.2).toFixed(2));
                    }

                    // 估算悠悠有品价格（通常在Buff和Steam之间）
                    item.youpinPrice = parseFloat((item.buffPrice * 1.02).toFixed(2));

                    // 计算24小时涨跌幅
                    if (oldPrice > 0) {
                        item.change24h = parseFloat(((item.buffPrice / oldPrice - 1) * 100).toFixed(2));
                    }
                }
            }

            lastPriceUpdate = Date.now();

            if (updatedCount > 0) {
                showToast(`价格已更新：${updatedCount} 件饰品`);
                updateUI();
            } else {
                showToast('暂无新价格数据');
            }
        } else {
            throw new Error(data.error || '获取价格失败');
        }

    } catch (error) {
        console.error('获取价格失败:', error);
        showToast('获取价格失败，使用模拟数据');
        useRealPrices = false;
    }
}

// 切换真实/模拟价格
function togglePriceMode() {
    useRealPrices = !useRealPrices;
    if (useRealPrices) {
        fetchRealPrices();
    } else {
        showToast('已切换为模拟价格');
    }
}

// ==================== 标签页切换 ====================
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;

        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    });
});

// 排行榜类型切换
document.querySelectorAll('.lb-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const type = tab.dataset.lb;
        currentLeaderboardType = type;

        document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        renderLeaderboard();
    });
});

// 持仓子标签切换
document.querySelectorAll('.sub-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const subtab = tab.dataset.subtab;

        document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        document.querySelectorAll('.subtab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(subtab).classList.add('active');
    });
});

// 社区子标签切换（讨论/资讯）
document.querySelectorAll('.comm-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const commtab = tab.dataset.commtab;

        document.querySelectorAll('.comm-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        document.querySelectorAll('.commtab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(commtab).classList.add('active');

        // 切换到资讯时渲染新闻
        if (commtab === 'news') {
            renderNews();
        }
    });
});

// 新闻来源筛选
document.querySelectorAll('.source-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const source = tab.dataset.source;
        currentNewsSource = source;

        document.querySelectorAll('.source-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        renderNews();
    });
});

// 搜索功能
document.getElementById('searchInput').addEventListener('input', renderMarket);

// 分类筛选
document.querySelectorAll('#categoryFilter .filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        document.querySelectorAll('#categoryFilter .filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        filterState.category = tag.dataset.category;
        renderMarket();
    });
});

// 品质筛选
document.querySelectorAll('#wearFilter .filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        document.querySelectorAll('#wearFilter .filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        filterState.wear = tag.dataset.wear;
        renderMarket();
    });
});

// 排序筛选
document.querySelectorAll('#sortFilter .filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        document.querySelectorAll('#sortFilter .filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        filterState.sort = tag.dataset.sort;
        renderMarket();
    });
});

// 数量输入框监听
document.getElementById('tradeQuantity').addEventListener('input', updateTradeTotal);

// 点击弹窗外部关闭
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// ==================== 工具函数 ====================
function formatMoney(amount) {
    return '¥' + amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatNum(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w';
    }
    return num.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
}

function formatTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
}

function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// ==================== 初始化 ====================
updateUI();

// 启动时获取真实价格
setTimeout(() => {
    fetchRealPrices();
}, 1000);

// 定期更新价格（每5分钟）
setInterval(() => {
    if (useRealPrices) {
        fetchRealPrices();
    } else {
        // 如果不使用真实价格，则模拟波动
        mockItems.forEach(item => {
            const change = (Math.random() - 0.5) * 0.04;
            item.buffPrice = item.buffPrice * (1 + change);
            item.youpinPrice = item.youpinPrice * (1 + change * 0.9);
            item.steamPrice = item.steamPrice * (1 + change * 0.8);
            item.change24h = parseFloat((item.change24h + change * 100).toFixed(2));
        });
        updateUI();
    }
}, 300000); // 5分钟

// 图表大小自适应
window.addEventListener('resize', () => {
    if (currentChart && document.getElementById('chartModal').classList.contains('active')) {
        const container = document.getElementById('priceChart');
        currentChart.applyOptions({
            width: container.clientWidth,
        });
    }
});

console.log('CS2 饰品模拟交易 - K线图版');
