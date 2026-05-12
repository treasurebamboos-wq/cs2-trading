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

// ==================== Buff风格分类配置 ====================
// 武器类型分类
const WEAPON_TYPES = {
    // 步枪
    'AK-47': { category: 'rifle', type: 'ak47', label: 'AK-47' },
    'M4A4': { category: 'rifle', type: 'm4a4', label: 'M4A4' },
    'M4A1-S': { category: 'rifle', type: 'm4a1s', label: 'M4A1消音' },
    'AUG': { category: 'rifle', type: 'aug', label: 'AUG' },
    'SG 553': { category: 'rifle', type: 'sg553', label: 'SG 553' },
    'FAMAS': { category: 'rifle', type: 'famas', label: 'FAMAS' },
    'Galil AR': { category: 'rifle', type: 'galil', label: 'Galil' },
    // 狙击枪
    'AWP': { category: 'rifle', type: 'awp', label: 'AWP' },
    'SSG 08': { category: 'rifle', type: 'ssg08', label: 'SSG 08' },
    'SCAR-20': { category: 'rifle', type: 'scar20', label: 'SCAR-20' },
    'G3SG1': { category: 'rifle', type: 'g3sg1', label: 'G3SG1' },
    // 冲锋枪
    'MP9': { category: 'smg', type: 'mp9', label: 'MP9' },
    'MAC-10': { category: 'smg', type: 'mac10', label: 'MAC-10' },
    'MP7': { category: 'smg', type: 'mp7', label: 'MP7' },
    'UMP-45': { category: 'smg', type: 'ump45', label: 'UMP-45' },
    'P90': { category: 'smg', type: 'p90', label: 'P90' },
    'PP-Bizon': { category: 'smg', type: 'bizon', label: 'PP-野牛' },
    'MP5-SD': { category: 'smg', type: 'mp5sd', label: 'MP5-SD' },
    // 手枪
    'USP-S': { category: 'pistol', type: 'usps', label: 'USP消音' },
    'P2000': { category: 'pistol', type: 'p2000', label: 'P2000' },
    'Glock-18': { category: 'pistol', type: 'glock', label: 'Glock-18' },
    'P250': { category: 'pistol', type: 'p250', label: 'P250' },
    'Five-SeveN': { category: 'pistol', type: 'fiveseven', label: '五七' },
    'Tec-9': { category: 'pistol', type: 'tec9', label: 'Tec-9' },
    'Desert Eagle': { category: 'pistol', type: 'deagle', label: '沙漠之鹰' },
    'Dual Berettas': { category: 'pistol', type: 'dualies', label: '双持贝瑞塔' },
    'CZ75-Auto': { category: 'pistol', type: 'cz75', label: 'CZ75' },
    'R8 Revolver': { category: 'pistol', type: 'r8', label: 'R8 左轮' },
    // 霰弹枪
    'MAG-7': { category: 'heavy', type: 'mag7', label: 'MAG-7' },
    'Nova': { category: 'heavy', type: 'nova', label: 'Nova' },
    'Sawed-Off': { category: 'heavy', type: 'sawedoff', label: '截短霰弹枪' },
    'XM1014': { category: 'heavy', type: 'xm1014', label: 'XM1014' },
    // 机枪
    'M249': { category: 'heavy', type: 'm249', label: 'M249' },
    'Negev': { category: 'heavy', type: 'negev', label: 'Negev' },
};

// 刀具类型
const KNIFE_TYPES = {
    'Karambit': { type: 'karambit', label: '爪子刀' },
    'M9 Bayonet': { type: 'm9', label: 'M9刺刀' },
    'Butterfly Knife': { type: 'butterfly', label: '蝴蝶刀' },
    'Bayonet': { type: 'bayonet', label: '刺刀' },
    'Flip Knife': { type: 'flip', label: '折叠刀' },
    'Gut Knife': { type: 'gut', label: '穿肠刀' },
    'Huntsman Knife': { type: 'huntsman', label: '猎杀者匕首' },
    'Falchion Knife': { type: 'falchion', label: '弯刀' },
    'Shadow Daggers': { type: 'shadow', label: '暗影双匕' },
    'Bowie Knife': { type: 'bowie', label: '鲍伊猎刀' },
    'Ursus Knife': { type: 'ursus', label: '熊刀' },
    'Navaja Knife': { type: 'navaja', label: '折刀' },
    'Stiletto Knife': { type: 'stiletto', label: '短剑' },
    'Talon Knife': { type: 'talon', label: '锯齿爪刀' },
    'Classic Knife': { type: 'classic', label: '经典刀' },
    'Paracord Knife': { type: 'paracord', label: '系绳匕首' },
    'Survival Knife': { type: 'survival', label: '求生匕首' },
    'Nomad Knife': { type: 'nomad', label: '流浪者匕首' },
    'Skeleton Knife': { type: 'skeleton', label: '骷髅匕首' },
    'Kukri Knife': { type: 'kukri', label: '廓尔喀刀' },
};

// 手套类型
const GLOVE_TYPES = {
    'Sport Gloves': { type: 'sport', label: '运动手套' },
    'Driver Gloves': { type: 'driver', label: '驾驶手套' },
    'Hand Wraps': { type: 'handwraps', label: '裹手' },
    'Moto Gloves': { type: 'moto', label: '摩托手套' },
    'Specialist Gloves': { type: 'specialist', label: '专业手套' },
    'Hydra Gloves': { type: 'hydra', label: '九头蛇手套' },
    'Broken Fang Gloves': { type: 'brokenfang', label: '狂牙手套' },
};

// 稀有度配置
const RARITY_CONFIG = {
    'contraband': { label: '违禁', color: '#e4ae39', order: 1 },
    'covert': { label: '隐秘', color: '#eb4b4b', order: 2 },
    'classified': { label: '保密', color: '#d32ce6', order: 3 },
    'restricted': { label: '受限', color: '#8847ff', order: 4 },
    'milspec': { label: '军规级', color: '#4b69ff', order: 5 },
    'industrial': { label: '工业级', color: '#5e98d9', order: 6 },
    'consumer': { label: '消费级', color: '#b0c3d9', order: 7 },
    'extraordinary': { label: '非凡', color: '#ffd700', order: 0 },
};

// 模拟饰品数据（Buff风格完整分类）
const mockItems = [
    // ==================== 步枪 ====================
    { id: 1, name: 'AK-47 | 二西莫夫', nameEn: 'AK-47 | Asiimov', wear: '久经沙场', wearEn: 'ft', category: 'rifle', weapon: 'ak47', rarity: 'covert', collection: '凤凰武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEmyVQ7MEpiLuSrYmnjVLj-UM-ZGD7JYLDe1A5NAnW_Ae5wOi-0JC5vJjXmHR9-n51X0aXog/256fx256f', buffPrice: 1580.00, youpinPrice: 1620.00, steamPrice: 2150.00, change24h: 2.5, volume: 1250 },
    { id: 3, name: 'M4A4 | 龙王', nameEn: 'M4A4 | Howl', wear: '略有磨损', wearEn: 'mw', category: 'rifle', weapon: 'm4a4', rarity: 'contraband', collection: '猎杀者武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alDL_UhFRd4cJ5nqeT9N-g0Qbs80ZuYG37I9SXcwY3YwvQ-gK4xOy6hJ67tJ7Km3s27yMl4ynfzBazhxxJbONxxavJdkAZJQ/256fx256f', buffPrice: 38500.00, youpinPrice: 39200.00, steamPrice: 52000.00, change24h: 0.8, volume: 45 },
    { id: 6, name: 'AK-47 | 火神', nameEn: 'AK-47 | Vulcan', wear: '崭新出厂', wearEn: 'fn', category: 'rifle', weapon: 'ak47', rarity: 'covert', collection: '猎杀者武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszOeC9H_9mkhIWFg8j1OO-GqWlD6dN-teHE9Jrsxgzn8hY_YDzwJY_EcgRqNl3T-APoxOu8g57p6JrLwCBh6T5iuyi1hP7Vfw/256fx256f', buffPrice: 2450.00, youpinPrice: 2520.00, steamPrice: 3300.00, change24h: 1.8, volume: 680 },
    { id: 11, name: 'M4A1-S | 印花集', nameEn: 'M4A1-S | Printstream', wear: '崭新出厂', wearEn: 'fn', category: 'rifle', weapon: 'm4a1s', rarity: 'covert', collection: '蛇咬武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO3mr-ZkvPLPu_Qx3hu5Mx2gv2Po9ut3w3m8kVkYW_6coeXewM2ZgnS_QC6xO-6jZ68v5zKzXA1vCUq4XrYmEe1n1gSOai-WvI/256fx256f', buffPrice: 1850.00, youpinPrice: 1890.00, steamPrice: 2450.00, change24h: 4.2, volume: 380 },
    { id: 12, name: 'AK-47 | 血腥运动', nameEn: 'AK-47 | Bloodsport', wear: '崭新出厂', wearEn: 'fn', category: 'rifle', weapon: 'ak47', rarity: 'covert', collection: '光谱武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV0969i5KPhMj5Nr_Yg2Yf6cYniLrHotqj3VC3_UFqYGH6ctKSIFRtZV7TqFG9xbi-gJG46JnBnHRn7iMh43bVmhG1gR9LOLM4h_KfSELsUaVdN-Ud/256fx256f', buffPrice: 720.00, youpinPrice: 745.00, steamPrice: 980.00, change24h: -0.5, volume: 890 },
    { id: 25, name: 'AK-47 | 红线', nameEn: 'AK-47 | Redline', wear: '久经沙场', wearEn: 'ft', category: 'rifle', weapon: 'ak47', rarity: 'classified', collection: '凤凰武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV092lnYmGmOHLPr7Vn35cpsAm0rvH8I7yjBq3_xFqMDr3JdWVdFI3MArTqAe_we7thMC4v8jJmCZgs_Y/256fx256f', buffPrice: 180.00, youpinPrice: 185.00, steamPrice: 240.00, change24h: 0.3, volume: 5200 },
    { id: 26, name: 'M4A4 | 黑色魅影', nameEn: 'M4A4 | Neo-Noir', wear: '崭新出厂', wearEn: 'fn', category: 'rifle', weapon: 'm4a4', rarity: 'covert', collection: '棱镜武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alIKnZkGkG6cYl3rqWptqj2AXi-kdtYG_6J9WQcQVtYQuF-lK_wru60JC5vJ_Om3JrvSV27GGdwUKj5YCXHw/256fx256f', buffPrice: 580.00, youpinPrice: 595.00, steamPrice: 780.00, change24h: 2.1, volume: 620 },
    // ==================== 狙击枪 ====================
    { id: 2, name: 'AWP | 二西莫夫', nameEn: 'AWP | Asiimov', wear: '久经沙场', wearEn: 'ft', category: 'rifle', weapon: 'awp', rarity: 'covert', collection: '凤凰武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJK9cyzhr-KmsjwPKvBmm5u5cB1g_zMu4qgjgCy_kE9ZWumJIeTdABoN1jS-1m-we_p0MO1u5XJzXA17CA8pSGKWU-9J1I/256fx256f', buffPrice: 890.00, youpinPrice: 910.00, steamPrice: 1180.00, change24h: -1.2, volume: 2100 },
    { id: 8, name: 'AWP | 龙狼', nameEn: 'AWP | Dragon Lore', wear: '久经沙场', wearEn: 'ft', category: 'rifle', weapon: 'awp', rarity: 'covert', collection: '眼镜蛇收藏品', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7cqWdQ689jxLzFoIqh0QXg-0VuYj_wLYaccAQ6MlrV-wW6yOy7hZC86s6ayiA26Skq4H_SnEG_0BobbOVpmrXWHFL9SA/256fx256f', buffPrice: 48000.00, youpinPrice: 49500.00, steamPrice: 65000.00, change24h: 1.2, volume: 28 },
    { id: 13, name: 'AWP | 渐变之色', nameEn: 'AWP | Fade', wear: '崭新出厂', wearEn: 'fn', category: 'rifle', weapon: 'awp', rarity: 'covert', collection: '突围收藏品', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAZh7PLfYQJK9cO_mIGZmOb1PbLummJW4NE_j-rEoYjw0Azk8hFtNmH0JNCUdlc8ZF_T_Ve2k7q90JO0tczMzHpgvnUmtnqIzRzigR4dPLI40-DPEFmcUsMLffPqjg/256fx256f', buffPrice: 3200.00, youpinPrice: 3280.00, steamPrice: 4300.00, change24h: 2.1, volume: 156 },
    { id: 14, name: 'AWP | 雷击', nameEn: 'AWP | Lightning Strike', wear: '崭新出厂', wearEn: 'fn', category: 'rifle', weapon: 'awp', rarity: 'covert', collection: 'CS:GO武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAZh7PLfYQJP7c-ikZKSqPv9NLPF2GJU7cFOhuDG-oLKhFWyqBJrMWj6JNOXdQU8aVyG81O_lebmgJC5v5_MziQ36CU8pSGKRw7chkY/256fx256f', buffPrice: 1650.00, youpinPrice: 1680.00, steamPrice: 2200.00, change24h: -2.3, volume: 210 },
    { id: 27, name: 'AWP | 黑色魅影', nameEn: 'AWP | Neo-Noir', wear: '崭新出厂', wearEn: 'fn', category: 'rifle', weapon: 'awp', rarity: 'covert', collection: '棱镜武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAZt7P_BdjVW4t_jkIGdjsj4MrbUqWZU7Mxkh9bN9J7yjRrh-hFuYm_zIYbHJAM2YF3T_AK-xenm15e06s7AzHtrvSUntynUzEe1gx1LaOVx0v6eDAABwLOZ/256fx256f', buffPrice: 420.00, youpinPrice: 435.00, steamPrice: 560.00, change24h: 1.5, volume: 480 },
    // ==================== 手枪 ====================
    { id: 7, name: 'USP-S | 杀意大名', nameEn: 'USP-S | Kill Confirmed', wear: '略有磨损', wearEn: 'mw', category: 'pistol', weapon: 'usps', rarity: 'covert', collection: '伽马武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09-jq5WYh8jgDLfYkWNF18lwmO7Eu9Wt0A2xrRBtYGj6doLEdQNvNFvY8lnqxO3v1565vZXMySAyvCAgtyvelkTigh5PbLc/256fx256f', buffPrice: 680.00, youpinPrice: 695.00, steamPrice: 920.00, change24h: 0.5, volume: 420 },
    { id: 9, name: 'Desert Eagle | 印花集', nameEn: 'Desert Eagle | Printstream', wear: '崭新出厂', wearEn: 'fn', category: 'pistol', weapon: 'deagle', rarity: 'covert', collection: '蛇咬武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLAtl7PDdTjlH7du6kb-HnvD8J_WEzjwJvpUp07uUrN6mjgey-hFpZW-hLdTDJlRqYg7T-VK6w-fs0MS6vM-am3NlvyNxsirUy0Dmgk5NYOQ8h_7NVxzAUFeeB3vq/256fx256f', buffPrice: 1250.00, youpinPrice: 1280.00, steamPrice: 1650.00, change24h: 3.2, volume: 520 },
    { id: 10, name: 'Glock-18 | 伽马多普勒', nameEn: 'Glock-18 | Gamma Doppler', wear: '崭新出厂', wearEn: 'fn', category: 'pistol', weapon: 'glock', rarity: 'covert', collection: '伽马2号武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0Ob3djFN79eJnY6PnvD7DLbUkmJE5Yt3j7jAotSljgLlrkBuYzr0LY-TJwZqaFyG8wK3xO7mgp-5tZXIznRq6yIn7S2OyxG00xodaLRvhPaeBFD5Hq0DGiU/256fx256f', buffPrice: 2850.00, youpinPrice: 2920.00, steamPrice: 3800.00, change24h: -0.8, volume: 165 },
    { id: 15, name: 'Desert Eagle | 炽烈之炎', nameEn: 'Desert Eagle | Blaze', wear: '崭新出厂', wearEn: 'fn', category: 'pistol', weapon: 'deagle', rarity: 'restricted', collection: '尘2收藏品', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLAtl7PLJTjtO7dGzh7-HnvD8DLbUhFRd4cJ5nqfE9tzw0A3nrkBkZmj1doeXdQU5MwnRqVG3yenqgZe8uZ2YyXBqvCMh4SuJzUe3gE5YYOQ8gPvNVxzAUPTCQyVgpQ/256fx256f', buffPrice: 4500.00, youpinPrice: 4620.00, steamPrice: 5900.00, change24h: 1.5, volume: 88 },
    { id: 16, name: 'P250 | 核子危机', nameEn: 'P250 | Nuclear Threat', wear: '崭新出厂', wearEn: 'fn', category: 'pistol', weapon: 'p250', rarity: 'restricted', collection: 'CS:GO武器箱2号', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopuP1FABz7P_NfT5H_9-_lb-YmvXgDKvYkG5Q_NV9j-3Q9ojwxAS1qERlZW6nItORJwFtZl7V-Ae7wu68g5K87J6YwCZmuyUj7XjamxfihBlLcKUx0uDPS7Y/256fx256f', buffPrice: 1890.00, youpinPrice: 1950.00, steamPrice: 2500.00, change24h: -1.8, volume: 65 },
    { id: 28, name: 'USP-S | 印花集', nameEn: 'USP-S | Printstream', wear: '崭新出厂', wearEn: 'fn', category: 'pistol', weapon: 'usps', rarity: 'classified', collection: '蛇咬武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09-jq5WYh8j_OrfdqWhe5sN4mOTE8bP4jVC9vh5yZDqgJoOWIA82ZFDS8wK7lLjrjcO4v5mcynFj7yIm7WGdwUIjWINJow/256fx256f', buffPrice: 320.00, youpinPrice: 328.00, steamPrice: 425.00, change24h: 2.8, volume: 890 },
    // ==================== 冲锋枪 ====================
    { id: 17, name: 'MAC-10 | 霓虹骑士', nameEn: 'MAC-10 | Neon Rider', wear: '崭新出厂', wearEn: 'fn', category: 'smg', weapon: 'mac10', rarity: 'classified', collection: '光谱武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou7umeldf0Ob3fDxBvYyJhIWFmfX4Nr_ulGRD78A_jL2To9T02QXgqRVoZDj0Jo6RcgU6aQrRqFS4xL-9h5K4u5-cziN9-n515P2cVA/256fx256f', buffPrice: 125.00, youpinPrice: 128.00, steamPrice: 165.00, change24h: 5.2, volume: 1580 },
    { id: 18, name: 'MP9 | 黑暗时代', nameEn: 'MP9 | Dark Age', wear: '略有磨损', wearEn: 'mw', category: 'smg', weapon: 'mp9', rarity: 'milspec', collection: '光谱武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6r8FA957ODYfTxW-Nmkx7-HnvD8J4Tdl3hU18hzteXI8oThxgTg-kZqMWGnctOVIwdsMFzZ_VS7wue90MTp6p-dzHBqvyEr4HfYlRa30R4aOLI50avJdVBPGL1VEYOi/256fx256f', buffPrice: 85.00, youpinPrice: 88.00, steamPrice: 115.00, change24h: -2.1, volume: 920 },
    { id: 19, name: 'UMP-45 | 荒野反叛', nameEn: 'UMP-45 | Wild Child', wear: '久经沙场', wearEn: 'ft', category: 'smg', weapon: 'ump45', rarity: 'milspec', collection: '棱彩武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo7e1f1Jf1_L3fDhN49KJlYG0mvLwOq7cqWdQ689j3urHpIn3ilGwrhVrYzuiJYbBdwU9Y1HU-wS3k-u60ce1uczNyyBiuCQj4niJyxa1hBpOPOdx0KGAURBfM1u8iw/256fx256f', buffPrice: 45.00, youpinPrice: 48.00, steamPrice: 62.00, change24h: 1.2, volume: 2100 },
    { id: 29, name: 'P90 | 二西莫夫', nameEn: 'P90 | Asiimov', wear: '崭新出厂', wearEn: 'fn', category: 'smg', weapon: 'p90', rarity: 'covert', collection: '弯曲猎手武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopuP1FAR17PLfYQJE69C_l4-Zh-L6NL7Um25V4dB8xLjD89qljQfhrRY_ZDj7Jo-QelA7aAuC-VXrxr_u0cfv7p3MnXJj7CEntH-ImEO-1hxLauJxxavIZR_s8g/256fx256f', buffPrice: 380.00, youpinPrice: 390.00, steamPrice: 505.00, change24h: 3.1, volume: 450 },
    // ==================== 刀 ====================
    { id: 4, name: '蝴蝶刀 | 多普勒', nameEn: 'Butterfly Knife | Doppler', wear: '崭新出厂', wearEn: 'fn', category: 'knife', weapon: 'butterfly', rarity: 'extraordinary', collection: '伽马武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqPD1PqzBl2Ju5cB1g_zMu42j3gft8kVtZWvwJYPGJwM7NArWqVO7xOfq1pPpupjMm3FquCgg7C7flRzhh0xPPeJvmqnNhApEJ_c/256fx256f', buffPrice: 12800.00, youpinPrice: 13100.00, steamPrice: 17500.00, change24h: -3.5, volume: 180 },
    { id: 20, name: '爪子刀 | 渐变大理石', nameEn: 'Karambit | Marble Fade', wear: '崭新出厂', wearEn: 'fn', category: 'knife', weapon: 'karambit', rarity: 'extraordinary', collection: '手套武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJl5G0k_jkI7fUhFRB4MRij7j--YXygECLpxI9YG_7ctCTdQRoYw3V_lm7wbi50cS5uJqfn3BiuChz7CuJnRGz0UlKbLVv1PWeBF2dVPfJ5Qfq4w/256fx256f', buffPrice: 9800.00, youpinPrice: 10050.00, steamPrice: 13200.00, change24h: -5.2, volume: 95 },
    { id: 21, name: 'M9 刺刀 | 虎牙', nameEn: 'M9 Bayonet | Tiger Tooth', wear: '崭新出厂', wearEn: 'fn', category: 'knife', weapon: 'm9', rarity: 'extraordinary', collection: '手套武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3ObcGWxSu4ykxL-DkvbiKoTcl2xU18hzteXI8oThxgTg-kZqMWymINWUdw9rMwqErlK5x-bm0ZW4v5udwHIx7z5iuyg4G3-QBA/256fx256f', buffPrice: 7200.00, youpinPrice: 7380.00, steamPrice: 9600.00, change24h: -4.8, volume: 120 },
    { id: 22, name: '折叠刀 | 多普勒', nameEn: 'Flip Knife | Doppler', wear: '崭新出厂', wearEn: 'fn', category: 'knife', weapon: 'flip', rarity: 'extraordinary', collection: '伽马武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOklY20k_jkI7fUhFRd4cJ5nqeQ9N-niguwr0JlYWqlddKTewE6Mg3Y_VK4kbi90MS4uZTNmyQyuCk8pSGKHfqT8g/256fx256f', buffPrice: 4850.00, youpinPrice: 4980.00, steamPrice: 6500.00, change24h: -2.9, volume: 210 },
    { id: 30, name: '刺刀 | 虎牙', nameEn: 'Bayonet | Tiger Tooth', wear: '崭新出厂', wearEn: 'fn', category: 'knife', weapon: 'bayonet', rarity: 'extraordinary', collection: '手套武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJYAJR7dG_hYWFkOTLP7rDRGpdupd307yXpIjz0QLm80tpYzvxLIaXIAc2ZlvRrFe4xOjn0Je86s6by3piuicn4XmImRe0hh9KO-c8hPOfOgPTVfEJnSJt/256fx256f', buffPrice: 5600.00, youpinPrice: 5750.00, steamPrice: 7500.00, change24h: -3.2, volume: 145 },
    { id: 31, name: '穿肠刀 | 渐变之色', nameEn: 'Gut Knife | Fade', wear: '崭新出厂', wearEn: 'fn', category: 'knife', weapon: 'gut', rarity: 'extraordinary', collection: 'CS:GO武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJl5e0m_7zO6-fwjwFupNw2OqSoNqm2wy18kZtYDjxI4PGewQ4aFvS_1ftl-vn0Z-1tcianXJrvCM8pSGKvpPZbA/256fx256f', buffPrice: 1850.00, youpinPrice: 1900.00, steamPrice: 2480.00, change24h: -1.5, volume: 280 },
    // ==================== 手套 ====================
    { id: 5, name: '运动手套 | 树篱迷宫', nameEn: 'Sport Gloves | Hedge Maze', wear: '久经沙场', wearEn: 'ft', category: 'glove', weapon: 'sport', rarity: 'extraordinary', collection: '手套武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopL-zJAt21uH3Yi5FvISJmYGZnPLmDL3QhmJS78B0j-rX8I_33gXl_URoZWqlJ9PBIFc4Zl7Z81a7wO27hpS86cvPyXox6yMj5HrYmhGyhk9KbeVsgP2fRR8q3pAjPw/256fx256f', buffPrice: 5200.00, youpinPrice: 5350.00, steamPrice: 7100.00, change24h: -8.2, volume: 95 },
    { id: 23, name: '驾驶手套 | 深红织物', nameEn: 'Driver Gloves | Crimson Weave', wear: '久经沙场', wearEn: 'ft', category: 'glove', weapon: 'driver', rarity: 'extraordinary', collection: '手套武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0Ob3djFN79eJkIGKnv-mKoXXl3Nu5Mx2gv2Pos-m3lGy-0s5NjygJIXHew43M1rVrwK6lO29h5Lq7pjJzSYysyYm4CmIzhaygk4ZcLRvgvvKRgPU/256fx256f', buffPrice: 6800.00, youpinPrice: 6980.00, steamPrice: 9100.00, change24h: -6.5, volume: 68 },
    { id: 24, name: '裹手 | 屠夫', nameEn: 'Hand Wraps | Slaughter', wear: '略有磨损', wearEn: 'mw', category: 'glove', weapon: 'handwraps', rarity: 'extraordinary', collection: '手套武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxfIe3OdytP4IO6kL-KlvHLP7rDXmhR_NZlj-nS-JjwhBqLuxBqZDqkd9PCJwFtYFvZ-1nrx-rq15-5uJ_OwXExsiUq7X-PzRS10hsdZuBohP7JVxzAUKRyXF9Y/256fx256f', buffPrice: 4200.00, youpinPrice: 4320.00, steamPrice: 5600.00, change24h: -7.1, volume: 82 },
    { id: 32, name: '摩托手套 | 日蚀', nameEn: 'Moto Gloves | Eclipse', wear: '久经沙场', wearEn: 'ft', category: 'glove', weapon: 'moto', rarity: 'extraordinary', collection: '手套武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopL-zJAt21uH3fTxO0922m4W0k_blPKvBnmJWvdV5m-vW-NugjBrm-xc_Mjr0ItOXdwdqaVuG-APqxO3qhJS1uczMziA26SUmtSzYzkS01AAbbOdoxPOACQLJSaOKPqGD4Q/256fx256f', buffPrice: 3500.00, youpinPrice: 3600.00, steamPrice: 4680.00, change24h: -4.3, volume: 110 },
    // ==================== 霰弹枪 ====================
    { id: 33, name: 'MAG-7 | 天马', nameEn: 'MAG-7 | Heaven Guard', wear: '崭新出厂', wearEn: 'fn', category: 'heavy', weapon: 'mag7', rarity: 'classified', collection: 'CS:GO武器箱2号', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou7uifg5f0v73YjlH4OOyhoTdk6T3Yb-HkzlUv8F0jeHV-oLKhFblrhVsN2qhJYfEJgc3MFnR-Vm6xLy5h5C66M7KnXFl7CVz4H3ZlECz0BwaPuJthfvNHFmIV_E/256fx256f', buffPrice: 65.00, youpinPrice: 68.00, steamPrice: 88.00, change24h: 0.8, volume: 1200 },
    { id: 44, name: 'XM1014 | 凝结之血', nameEn: 'XM1014 | Tranquility', wear: '崭新出厂', wearEn: 'fn', category: 'heavy', weapon: 'xm1014', rarity: 'classified', collection: '突围武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgporrf0e1Y07ODHTjBN_8-JmYWPnuL5feuJwjgIusB13L-T8Y2m3gbm_hJpYT-nJI-SdwJrZ1nVq1C5xLi6h5W76s6fm3U163Yn4XaN0kW01RwdcbE5hPuJH0C8FaCLAF96lA/256fx256f', buffPrice: 120.00, youpinPrice: 125.00, steamPrice: 165.00, change24h: 1.2, volume: 850 },
    { id: 45, name: 'Nova | 安提克', nameEn: 'Nova | Antique', wear: '崭新出厂', wearEn: 'fn', category: 'heavy', weapon: 'nova', rarity: 'classified', collection: '命悬一线收藏品', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpouLWzKjhzw8zPdC9F7eCmhoWFmsj4OrzZgiUE7sAljr2XrI-h21ThqRJtN2jzco-WcFI6aFnX81K8lby-0Z-5uJXLmHphvygh5HffyEOy1U5PaOBzgPaPSliMFPW-dvkB/256fx256f', buffPrice: 85.00, youpinPrice: 88.00, steamPrice: 115.00, change24h: 0.5, volume: 720 },
    // ==================== 机枪 ====================
    { id: 34, name: 'M249 | 鬼影', nameEn: 'M249 | Spectre', wear: '略有磨损', wearEn: 'mw', category: 'heavy', weapon: 'm249', rarity: 'milspec', collection: '弯曲猎手武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uOhkL-Gw_alIITCmX5d_MdehOzKyoD8j1yg5RJtYzmtI4PGcgQ3ZF7X-VS5x-y-gpa56JvXmCRnvnV0t36LnhW-0QYZPuA50OfbVxzAUOw_SaEz7A/256fx256f', buffPrice: 35.00, youpinPrice: 38.00, steamPrice: 48.00, change24h: -0.5, volume: 650 },
    { id: 46, name: 'Negev | 功勋', nameEn: 'Negev | Power Loader', wear: '崭新出厂', wearEn: 'fn', category: 'heavy', weapon: 'negev', rarity: 'classified', collection: '棱彩2号武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpouL-iLhFf2-r3Yi5FvISJlYyPnvD7DLbUhFRd4cJ5nqeR8t6k3wLn_EVpYzr6J9OSIQ5tY1jRrgK8xezpgp66uMjLy3d9-n51Ea-TIpw/256fx256f', buffPrice: 55.00, youpinPrice: 58.00, steamPrice: 75.00, change24h: 1.8, volume: 480 },
    // ==================== 更多热门步枪 ====================
    { id: 35, name: 'AK-47 | 野荷', nameEn: 'AK-47 | Wild Lotus', wear: '崭新出厂', wearEn: 'fn', category: 'rifle', weapon: 'ak47', rarity: 'covert', collection: '圣马克收藏品', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhnwMzJemkV0NOjhoS0mvLwOq7fqWdY781lxLvFpo720AS1rRJuMWrzctfAc1c8aFiE-gPswee9h5fuvMnLynF9-n51N73GmkY/256fx256f', buffPrice: 12500.00, youpinPrice: 12800.00, steamPrice: 17000.00, change24h: 3.2, volume: 35 },
    { id: 36, name: 'AK-47 | 霓虹革命', nameEn: 'AK-47 | Neon Revolution', wear: '崭新出厂', wearEn: 'fn', category: 'rifle', weapon: 'ak47', rarity: 'covert', collection: '伽马2号武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszOeC9H_9mkhIWFg8j1OO-GqWlD6dN-teHE9Jrsxgzn8hY_YDzwJY_EcgRqNl3T-APoxOu8g57p6JrLwCBh6T5iuyi1hP7Vfw/256fx256f', buffPrice: 850.00, youpinPrice: 875.00, steamPrice: 1150.00, change24h: 1.5, volume: 520 },
    { id: 37, name: 'AK-47 | 精英之构', nameEn: 'AK-47 | Elite Build', wear: '崭新出厂', wearEn: 'fn', category: 'rifle', weapon: 'ak47', rarity: 'milspec', collection: '弯曲猎手武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV092lnYmGmOHLPr7Vn35cpsAm0rvH8I7yjBq3_xFqMDr3JdWVdFI3MArTqAe_we7thMC4v8jJmCZgs_Y/256fx256f', buffPrice: 65.00, youpinPrice: 68.00, steamPrice: 88.00, change24h: 0.8, volume: 2800 },
    { id: 38, name: 'M4A1-S | 夺命器', nameEn: 'M4A1-S | Decimator', wear: '崭新出厂', wearEn: 'fn', category: 'rifle', weapon: 'm4a1s', rarity: 'covert', collection: '伽马2号武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO3mb-GkuP1P6jummJW4NE_jL3D9Irz3Abg80U5MmD7IYDHcQdrNFnTqFPrl-rs0MW4uJTJySZr7nQnsyyJmhG2hx1Ma-c8h_aaD10WWrNbN7XU/256fx256f', buffPrice: 320.00, youpinPrice: 330.00, steamPrice: 430.00, change24h: 2.1, volume: 680 },
    { id: 39, name: 'M4A4 | 死寂空间', nameEn: 'M4A4 | Desolate Space', wear: '崭新出厂', wearEn: 'fn', category: 'rifle', weapon: 'm4a4', rarity: 'covert', collection: '伽马武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO3mb-GkuP1P6jummJW4NE_jL3D9Irz3Abg80U5MmD7IYDHcQdrNFnTqFPrl-rs0MW4uJTJySZr7nQnsyyJmhG2hx1Ma-c8h_aaD10WWrNbN7XU/256fx256f', buffPrice: 450.00, youpinPrice: 465.00, steamPrice: 610.00, change24h: 1.2, volume: 420 },
    // ==================== 更多热门手枪 ====================
    { id: 40, name: 'Desert Eagle | 钴蓝镀金', nameEn: 'Desert Eagle | Cobalt Disruption', wear: '崭新出厂', wearEn: 'fn', category: 'pistol', weapon: 'deagle', rarity: 'restricted', collection: 'CS:GO武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLAtl7PLJTjtO7dGzh7-KmcjgOrzUhFRd4cJ5nqfH8oTs2AThqRc9amunI9WXdwQ8ZwnV_VK6krq6jMC46MnKzCRj6HYqtS3YnEO0gU9Lb-U8g_aaRAuEV6fDMaGcWCF30arJYLk/256fx256f', buffPrice: 280.00, youpinPrice: 290.00, steamPrice: 380.00, change24h: 0.5, volume: 1200 },
    { id: 41, name: 'Five-SeveN | 愤怒野兽', nameEn: 'Five-SeveN | Angry Mob', wear: '崭新出厂', wearEn: 'fn', category: 'pistol', weapon: 'fiveseven', rarity: 'classified', collection: '棱彩武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposLOzLhRlxfbGTj5X09q_goWYkuHxPYTTl2VQ5sROh-zF_Jn4xgPh_UZoMW-ncYKVdFQ3N1yD-VS6w-jmgJe6vp3XiSw0DVRH2xI/256fx256f', buffPrice: 95.00, youpinPrice: 98.00, steamPrice: 128.00, change24h: 1.8, volume: 950 },
    { id: 42, name: 'Tec-9 | 燃料注入器', nameEn: 'Tec-9 | Fuel Injector', wear: '崭新出厂', wearEn: 'fn', category: 'pistol', weapon: 'tec9', rarity: 'classified', collection: '伽马武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoor-hcxV0-_3EdDxO5cyzh4GSkPvxDLbUhFRe8dQhg-fPrNT12A2xrxc_N2zwLYbDdwI_YQvX_VO3k-fpgpS5vpnKnSM273Qit36LyEa2gxocZOBr0unJH0WdB_OUd0WfZxg/256fx256f', buffPrice: 185.00, youpinPrice: 190.00, steamPrice: 250.00, change24h: 2.5, volume: 680 },
    // ==================== 更多热门刀具 ====================
    { id: 43, name: '暗影双匕 | 多普勒', nameEn: 'Shadow Daggers | Doppler', wear: '崭新出厂', wearEn: 'fn', category: 'knife', weapon: 'shadow', rarity: 'extraordinary', collection: '伽马武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJl4OHnuTgDL7WhFRd4cJ5nqeQpYqniwfgrhc_YW_7JY6WdVI-YFzX_AK9l-y-0ZG4vJXLznYyvSR25H2PyEO3hxsaOLQ60_WeCgaZV_NdbuXp/256fx256f', buffPrice: 2200.00, youpinPrice: 2260.00, steamPrice: 2980.00, change24h: -2.1, volume: 165 },
    { id: 47, name: '猎杀者匕首 | 多普勒', nameEn: 'Huntsman Knife | Doppler', wear: '崭新出厂', wearEn: 'fn', category: 'knife', weapon: 'huntsman', rarity: 'extraordinary', collection: '命悬一线武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqPD1PqzBl2Ju5cB1g_zMu42j3gft8kVtZWvwJYPGJwM7NArWqVO7xOfq1pPpupjMm3FquCgg7C7flRzhh0xPPeJvmqnNhApEJ_c/256fx256f', buffPrice: 3800.00, youpinPrice: 3900.00, steamPrice: 5150.00, change24h: -1.8, volume: 125 },
    { id: 48, name: '熊刀 | 虎牙', nameEn: 'Ursus Knife | Tiger Tooth', wear: '崭新出厂', wearEn: 'fn', category: 'knife', weapon: 'ursus', rarity: 'extraordinary', collection: '地平线武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJl4O0g_75ZfvBlmJU4dF93urE8NinxQ3k80pqYGvxJIWSe1U8MAyBr1LslOng0MC-vpubynNquiAh7XyMyhO30hxJauNx1KGQQ1mZQKNVFaFbpg/256fx256f', buffPrice: 3200.00, youpinPrice: 3280.00, steamPrice: 4320.00, change24h: -2.5, volume: 98 },
    // ==================== 更多热门手套 ====================
    { id: 49, name: '专业手套 | 翠绿之网', nameEn: 'Specialist Gloves | Emerald Web', wear: '久经沙场', wearEn: 'ft', category: 'glove', weapon: 'specialist', rarity: 'extraordinary', collection: '手套武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0Ob3djFN79eJhY6PkvP4MuuEzj5WvZAgiLyTp4j23AfhrkFtY2H6JtSQdFQ-MFnWrVK6lO-80Z686c_KyyNh7ClztH3amhO11hxNYuQ6g-SAAATtSqRdcJuL/256fx256f', buffPrice: 4800.00, youpinPrice: 4920.00, steamPrice: 6480.00, change24h: -5.2, volume: 72 },
    { id: 50, name: '九头蛇手套 | 翠绿之网', nameEn: 'Hydra Gloves | Emerald', wear: '久经沙场', wearEn: 'ft', category: 'glove', weapon: 'hydra', rarity: 'extraordinary', collection: '狂牙武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf1OD3Yi5FvISJmImMn-O6MeuDkm1Xvppwj-vFoY-n2VKyr0Q6ZGv3cI6ddQ85YwrS-ga7krq7jJG8vc-bzSRivCMq4n3fnB20gR8fauJtg_6AFQGdB6NYXPL4MvKHYWutlg/256fx256f', buffPrice: 2800.00, youpinPrice: 2880.00, steamPrice: 3780.00, change24h: -3.8, volume: 88 },
    // ==================== 更多热门冲锋枪 ====================
    { id: 51, name: 'MP7 | 血腥运动', nameEn: 'MP7 | Bloodsport', wear: '崭新出厂', wearEn: 'fn', category: 'smg', weapon: 'mp7', rarity: 'covert', collection: '光谱武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6ryFBRw7P_bfgJU7dC9kI20m_7nPLrDlGlU18h0j-iZrYih2gXlrkRtamr1coHDJwY3ZFvXq1S5xLu6hMC1vJqczCc1pGB8sqSp0R8i/256fx256f', buffPrice: 280.00, youpinPrice: 290.00, steamPrice: 380.00, change24h: 2.8, volume: 520 },
    { id: 52, name: 'P90 | 死亡之握', nameEn: 'P90 | Death Grip', wear: '崭新出厂', wearEn: 'fn', category: 'smg', weapon: 'p90', rarity: 'classified', collection: '裂空武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopuP1FABz7PLfYQJD4eOkgYCAkfOrN7iDlTAHsJIi0u2V8YqgxRi1rRVkY2CgLIaLJlI5MFjX-Ve3w-u7jJS8v57InCQ1vyZwsHrfyha_hxpIaeNt1KXOEA/256fx256f', buffPrice: 165.00, youpinPrice: 170.00, steamPrice: 225.00, change24h: 1.5, volume: 680 },
    // ==================== 更多热门狙击枪 ====================
    { id: 53, name: 'AWP | 野火', nameEn: 'AWP | Wildfire', wear: '崭新出厂', wearEn: 'fn', category: 'rifle', weapon: 'awp', rarity: 'covert', collection: '裂空武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAZh7PLfYQJK9cyzhr-KmsjwPKvBmm5u5cB1g_zMu4qgjgCy_kE9ZWumJIeTdABoN1jS-1m-we_p0MO1u5XJzXA17CA8pSGKWU-9J1I/256fx256f', buffPrice: 680.00, youpinPrice: 700.00, steamPrice: 920.00, change24h: 3.5, volume: 380 },
    { id: 54, name: 'AWP | 超级野兽', nameEn: 'AWP | Hyper Beast', wear: '崭新出厂', wearEn: 'fn', category: 'rifle', weapon: 'awp', rarity: 'covert', collection: '猎杀者武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17P7NdShR7eO3g5C0mvLwOq7cqWdQ689jxLzFoIqh0QXg-0VuYj_wLYaccAQ6MlrV-wW6yOy7hZC86s6ayiA26Skq4H_SnEG_0BobbOVpmrXWHFL9SA/256fx256f', buffPrice: 520.00, youpinPrice: 535.00, steamPrice: 700.00, change24h: 1.8, volume: 450 },
    { id: 55, name: 'SSG 08 | 滴血', nameEn: 'SSG 08 | Dragonfire', wear: '崭新出厂', wearEn: 'fn', category: 'rifle', weapon: 'ssg08', rarity: 'covert', collection: '伽马2号武器箱', isStatTrak: false, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopamie19f0v73cDhH4NCklI20h6T9ILrTqGlU7Mdlj73HoIqgiVKx-hFrYj3xctKVegFtZAyGrwW-w-m5g5C_7s6az3t9-n51BUh9tw/256fx256f', buffPrice: 185.00, youpinPrice: 190.00, steamPrice: 250.00, change24h: 0.8, volume: 320 },
];

// 筛选状态
let filterState = {
    category: 'all',
    weapon: 'all',      // 具体武器筛选
    rarity: 'all',
    wear: 'all',
    stat: 'all',        // StatTrak/纪念品筛选
    sort: 'default',
    search: ''
};

// 武器类型配置（用于生成二级筛选）- 完全对标Buff分类
const WEAPON_BY_CATEGORY = {
    // 手枪
    pistol: [
        { slug: 'cz75-auto', name: 'CZ75' },
        { slug: 'desert-eagle', name: '沙漠之鹰' },
        { slug: 'dual-berettas', name: '双枪' },
        { slug: 'five-seven', name: 'Five-SeveN' },
        { slug: 'glock-18', name: '格洛克' },
        { slug: 'p2000', name: 'P2000' },
        { slug: 'p250', name: 'P250' },
        { slug: 'r8-revolver', name: 'R8左轮' },
        { slug: 'tec-9', name: 'Tec-9' },
        { slug: 'usp-s', name: 'USP' },
    ],
    // 步枪（含狙击枪）
    rifle: [
        { slug: 'ak-47', name: 'AK-47' },
        { slug: 'aug', name: 'AUG' },
        { slug: 'awp', name: 'AWP' },
        { slug: 'famas', name: 'FAMAS' },
        { slug: 'g3sg1', name: 'G3SG1' },
        { slug: 'galil-ar', name: 'Galil AR' },
        { slug: 'm4a1-s', name: 'M4A1-S' },
        { slug: 'm4a4', name: 'M4A4' },
        { slug: 'scar-20', name: 'SCAR-20' },
        { slug: 'sg-553', name: 'SG 553' },
        { slug: 'ssg-08', name: 'SSG 08' },
    ],
    // 微冲
    smg: [
        { slug: 'mac-10', name: 'MAC-10' },
        { slug: 'mp5-sd', name: 'MP5-SD' },
        { slug: 'mp7', name: 'MP7' },
        { slug: 'mp9', name: 'MP9' },
        { slug: 'pp-bizon', name: 'PP-Bizon' },
        { slug: 'p90', name: 'P90' },
        { slug: 'ump-45', name: 'UMP-45' },
    ],
    // 重型武器（霰弹枪+机枪）
    heavy: [
        { slug: 'sawed-off', name: '截短霰弹枪' },
        { slug: 'mag-7', name: 'MAG-7' },
        { slug: 'nova', name: 'Nova' },
        { slug: 'xm1014', name: 'XM1014' },
        { slug: 'm249', name: 'M249' },
        { slug: 'negev', name: 'Negev' },
    ],
    // 匕首
    knife: [
        { slug: 'bowie-knife', name: '鲍伊猎刀' },
        { slug: 'butterfly-knife', name: '蝴蝶刀' },
        { slug: 'gut-knife', name: '穿肠刀' },
        { slug: 'huntsman-knife', name: '猎杀者匕首' },
        { slug: 'karambit', name: '爪子刀' },
        { slug: 'flip-knife', name: '折叠刀' },
        { slug: 'bayonet', name: '刺刀' },
        { slug: 'm9-bayonet', name: 'M9刺刀' },
        { slug: 'falchion-knife', name: '弯刀' },
        { slug: 'shadow-daggers', name: '暗影双匕' },
        { slug: 'ursus-knife', name: '熊刀' },
        { slug: 'talon-knife', name: '锯齿爪刀' },
        { slug: 'stiletto-knife', name: '海豹短刀' },
        { slug: 'skeleton-knife', name: '骷髅匕首' },
        { slug: 'paracord-knife', name: '系绳匕首' },
        { slug: 'survival-knife', name: '求生匕首' },
        { slug: 'nomad-knife', name: '游牧民匕首' },
        { slug: 'classic-knife', name: '经典匕首' },
        { slug: 'kukri-knife', name: '廓尔喀砍刀' },
    ],
    // 手套
    glove: [
        { slug: 'broken-fang-gloves', name: '狂牙手套' },
        { slug: 'moto-gloves', name: '摩托手套' },
        { slug: 'hand-wraps', name: '裹手' },
        { slug: 'driver-gloves', name: '驾驶员手套' },
        { slug: 'sport-gloves', name: '运动手套' },
        { slug: 'specialist-gloves', name: '专业手套' },
        { slug: 'bloodhound-gloves', name: '血猎手套' },
        { slug: 'hydra-gloves', name: '九头蛇手套' },
    ],
    // 其他
    other: [
        { slug: 'agent', name: '探员' },
        { slug: 'sticker', name: '印花' },
        { slug: 'music-kit', name: '音乐盒' },
        { slug: 'graffiti', name: '涂鸦' },
        { slug: 'case', name: '武器箱' },
        { slug: 'patch', name: '布章' },
        { slug: 'pin', name: '胸针' },
        { slug: 'capsule', name: '胶囊' },
        { slug: 'pass', name: '通行证' },
        { slug: 'package', name: '礼包' },
        { slug: 'tool', name: '工具' },
        { slug: 'souvenir-package', name: '纪念包' },
    ],
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

        // 具体武器条件
        const matchWeapon = filterState.weapon === 'all' || item.weapon === filterState.weapon;

        // 稀有度条件
        const matchRarity = filterState.rarity === 'all' || item.rarity === filterState.rarity;

        // 品质条件
        const matchWear = filterState.wear === 'all' || item.wear === filterState.wear;

        // 类别条件（普通/纪念品/StatTrak/★/★ StatTrak™）
        // ★ 表示刀/手套等特殊物品
        const isStar = item.category === 'knife' || item.category === 'glove';
        let matchStat = filterState.stat === 'all';
        if (filterState.stat === 'normal') {
            // 普通物品：非StatTrak、非纪念品、非★物品
            matchStat = !item.isStatTrak && !item.hasSouvenir && !isStar;
        } else if (filterState.stat === 'stattrak') {
            // StatTrak™：普通武器的StatTrak版本
            matchStat = item.isStatTrak === true && !isStar;
        } else if (filterState.stat === 'souvenir') {
            // 纪念品
            matchStat = item.hasSouvenir === true;
        } else if (filterState.stat === 'star') {
            // ★：刀/手套等，非StatTrak版本
            matchStat = isStar && !item.isStatTrak;
        } else if (filterState.stat === 'star_stattrak') {
            // ★ StatTrak™：刀的StatTrak版本（手套没有StatTrak）
            matchStat = isStar && item.isStatTrak === true;
        }

        return matchSearch && matchCategory && matchWeapon && matchRarity && matchWear && matchStat;
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
    const isFiltered = filterState.category !== 'all' || filterState.weapon !== 'all' || filterState.rarity !== 'all' || filterState.wear !== 'all' || filterState.stat !== 'all' || filterState.search !== '';
    statsContainer.innerHTML = `
        <span>共 <span class="count">${filteredItems.length}</span> 件饰品${isFiltered ? '（已筛选）' : ''}</span>
        ${isFiltered ? '<button class="clear-filter" onclick="clearFilters()">清除筛选</button>' : ''}
    `;

    // 渲染列表
    if (filteredItems.length === 0) {
        container.innerHTML = '<div class="empty-state">没有找到符合条件的饰品</div>';
        return;
    }

    container.innerHTML = filteredItems.map(item => {
        const rarityInfo = RARITY_CONFIG[item.rarity] || { label: '普通', color: '#b0c3d9' };
        return `
        <div class="item-card" style="--rarity-color: ${rarityInfo.color}">
            <div class="rarity-bar"></div>
            <img src="${item.image}" alt="${item.name}" onerror="this.style.background='var(--bg-secondary)'" onclick="openChartModal(${item.id})">
            <div class="item-details" onclick="openChartModal(${item.id})">
                <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-meta">
                        <span class="item-wear">${item.wear}</span>
                        <span class="item-rarity" style="color: ${rarityInfo.color}">${rarityInfo.label}</span>
                    </div>
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
    `}).join('');
}

// 清除所有筛选
function clearFilters() {
    filterState = { category: 'all', weapon: 'all', rarity: 'all', wear: 'all', stat: 'all', sort: 'default', search: '' };

    // 重置UI
    document.getElementById('searchInput').value = '';

    document.querySelectorAll('#categoryFilter .filter-tag').forEach(tag => {
        tag.classList.toggle('active', tag.dataset.category === 'all');
    });
    document.querySelectorAll('#weaponFilter .filter-tag').forEach(tag => {
        tag.classList.toggle('active', tag.dataset.weapon === 'all');
    });
    document.querySelectorAll('#rarityFilter .filter-tag').forEach(tag => {
        tag.classList.toggle('active', tag.dataset.rarity === 'all');
    });
    document.querySelectorAll('#wearFilter .filter-tag').forEach(tag => {
        tag.classList.toggle('active', tag.dataset.wear === 'all');
    });
    document.querySelectorAll('#statFilter .filter-tag').forEach(tag => {
        tag.classList.toggle('active', tag.dataset.stat === 'all');
    });
    document.querySelectorAll('#sortFilter .filter-tag').forEach(tag => {
        tag.classList.toggle('active', tag.dataset.sort === 'default');
    });

    // 隐藏武器筛选行
    document.getElementById('weaponFilterRow').style.display = 'none';

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

// ==================== 真实价格API (cs2.sh) ====================
async function fetchRealPrices() {
    if (!useRealPrices) return;

    try {
        showToast('正在获取 cs2.sh 价格...');

        const response = await fetch(`${API_BASE}/prices`);
        const data = await response.json();

        if (data.success && data.prices) {
            let updatedCount = 0;

            // 遍历返回的价格数据
            for (const [marketHashName, priceData] of Object.entries(data.prices)) {
                // 从 market_hash_name 提取饰品名（去掉磨损度）
                const baseName = priceData.baseName || marketHashName.replace(/\s*\([^)]+\)$/, '');

                // 查找匹配的饰品
                const item = mockItems.find(i => {
                    const itemNameEn = i.nameEn.toLowerCase();
                    const searchName = baseName.toLowerCase();
                    // 匹配：完全包含或部分匹配
                    return searchName.includes(itemNameEn) ||
                           itemNameEn.includes(searchName) ||
                           itemNameEn.split('|')[1]?.trim() === searchName.split('|')[1]?.trim();
                });

                if (item && priceData) {
                    // 保存旧价格用于计算涨跌幅
                    const oldPrice = item.buffPrice;

                    // 更新Buff价格（已转换为CNY）
                    if (priceData.buff && priceData.buff.askCNY > 0) {
                        item.buffPrice = priceData.buff.askCNY;
                        item.volume = priceData.buff.volume || item.volume;
                        updatedCount++;
                    }

                    // 更新悠悠有品价格
                    if (priceData.youpin && priceData.youpin.askCNY > 0) {
                        item.youpinPrice = priceData.youpin.askCNY;
                    } else {
                        // 如果没有悠悠数据，估算（通常略高于Buff）
                        item.youpinPrice = parseFloat((item.buffPrice * 1.02).toFixed(2));
                    }

                    // 更新Steam价格
                    if (priceData.steam && priceData.steam.askCNY > 0) {
                        item.steamPrice = priceData.steam.askCNY;
                    }

                    // 计算涨跌幅（基于价格变化）
                    if (oldPrice > 0 && item.buffPrice !== oldPrice) {
                        item.change24h = parseFloat(((item.buffPrice / oldPrice - 1) * 100).toFixed(2));
                    }
                }
            }

            lastPriceUpdate = Date.now();

            if (updatedCount > 0) {
                showToast(`✅ 价格已更新：${updatedCount} 件饰品`);
                updateUI();
            } else {
                showToast('暂无匹配的价格数据');
            }
        } else {
            throw new Error(data.error || '获取价格失败');
        }

    } catch (error) {
        console.error('获取价格失败:', error);
        showToast('⚠️ 获取价格失败，使用模拟数据');
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

// 分类筛选（带武器二级联动）
document.querySelectorAll('#categoryFilter .filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        document.querySelectorAll('#categoryFilter .filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        filterState.category = tag.dataset.category;
        filterState.weapon = 'all'; // 重置武器筛选

        // 更新武器二级筛选
        updateWeaponFilter(filterState.category);

        renderMarket();
    });
});

// 更新武器二级筛选
function updateWeaponFilter(category) {
    const row = document.getElementById('weaponFilterRow');
    const container = document.getElementById('weaponFilter');

    if (category === 'all' || !WEAPON_BY_CATEGORY[category]) {
        row.style.display = 'none';
        return;
    }

    const weapons = WEAPON_BY_CATEGORY[category];
    row.style.display = 'flex';

    container.innerHTML = `
        <button class="filter-tag active" data-weapon="all">全部</button>
        ${weapons.map(w => `<button class="filter-tag" data-weapon="${w.slug}">${w.name}</button>`).join('')}
    `;

    // 绑定事件
    container.querySelectorAll('.filter-tag').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            filterState.weapon = btn.dataset.weapon;
            renderMarket();
        });
    });
}

// 稀有度筛选
document.querySelectorAll('#rarityFilter .filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        document.querySelectorAll('#rarityFilter .filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        filterState.rarity = tag.dataset.rarity;
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

// StatTrak/纪念品筛选
document.querySelectorAll('#statFilter .filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        document.querySelectorAll('#statFilter .filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        filterState.stat = tag.dataset.stat;
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

// ==================== 饰品数据同步功能 ====================
const ITEMS_STORAGE_KEY = 'cs2_synced_items';
const SYNC_TIMESTAMP_KEY = 'cs2_sync_timestamp';

// 从API同步饰品数据
async function syncItemsFromAPI() {
    showToast('正在同步饰品数据，请稍候...');

    try {
        // minPrice=1 获取所有价格饰品，maxPages=10 每个分类获取10页（最多1000个/分类）
        const response = await fetch(`${API_BASE}/sync?minPrice=1&maxPages=10`);
        if (!response.ok) throw new Error('API请求失败');

        const data = await response.json();
        if (!data.success || !data.items || data.items.length === 0) {
            throw new Error('未获取到饰品数据');
        }

        // 转换为mockItems格式
        const newItems = data.items.map((item, index) => {
            // 根据价格生成合理的涨跌幅（高价饰品波动小，低价饰品波动大）
            const priceLevel = item.prices.steam > 5000 ? 0.5 : item.prices.steam > 1000 ? 1 : 2;
            const change24h = Math.round((Math.random() * 6 - 2) * priceLevel * 10) / 10;
            // 交易量与价格负相关
            const baseVolume = item.prices.steam > 10000 ? 20 : item.prices.steam > 1000 ? 100 : item.prices.steam > 100 ? 500 : 2000;
            const volume = Math.floor(baseVolume * (0.5 + Math.random()));

            return {
                id: index + 1,
                name: item.name,
                nameEn: item.nameEn,
                wear: '崭新出厂',
                wearEn: 'fn',
                category: item.category,
                weapon: item.weapon,
                weaponName: item.weaponName,
                rarity: item.rarity,
                collection: '未知收藏品',
                isStatTrak: item.isStatTrak,
                hasSouvenir: item.hasSouvenir,
                slug: item.slug,
                image: item.image || generateSteamImage(item.slug),
                buffPrice: item.prices.buff,
                youpinPrice: item.prices.youpin,
                steamPrice: item.prices.steam,
                change24h: change24h,
                volume: volume
            };
        });

        // 保存到本地存储
        localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(newItems));
        localStorage.setItem(SYNC_TIMESTAMP_KEY, Date.now().toString());

        // 更新mockItems
        mockItems.length = 0;
        mockItems.push(...newItems);

        // 刷新UI
        updateUI();

        // 更新同步状态显示
        updateSyncStatus();

        // 显示详细统计
        showToast(`✓ 同步成功！共 ${newItems.length} 件饰品`);

        console.log('饰品同步完成:', {
            count: newItems.length,
            categoryStats: data.categoryStats,
            rarityStats: data.rarityStats,
            timestamp: new Date().toISOString()
        });

        return true;
    } catch (error) {
        console.error('同步失败:', error);
        showToast('❌ 同步失败，使用本地数据');
        return false;
    }
}

// 生成Steam图片URL
function generateSteamImage(slug) {
    return `https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXQ9Q1LO5kNoBhSQl-fVOG_wcbQVmJ4IwpWv7j6HhR2sbrJZG9KuoGzlYOdlfb_ZL_Tl2Vf5cB4t7vFoYvx2VHk8xFuYD_yIYPGIQNqYV7VqFPrx-bs0sS6tZvPy3V9-n515isnkH-dhw/256fx256f`;
}

// 更新同步状态显示
function updateSyncStatus() {
    const statusEl = document.getElementById('syncStatus');
    if (!statusEl) return;

    const lastSync = localStorage.getItem(SYNC_TIMESTAMP_KEY);
    const itemCount = mockItems.length;

    if (lastSync) {
        const syncDate = new Date(parseInt(lastSync));
        const now = new Date();
        const diffHours = Math.floor((now - syncDate) / (1000 * 60 * 60));

        let timeStr;
        if (diffHours < 1) {
            const diffMins = Math.floor((now - syncDate) / (1000 * 60));
            timeStr = diffMins < 1 ? '刚刚' : `${diffMins}分钟前`;
        } else if (diffHours < 24) {
            timeStr = `${diffHours}小时前`;
        } else {
            const diffDays = Math.floor(diffHours / 24);
            timeStr = `${diffDays}天前`;
        }

        statusEl.textContent = `${itemCount}件 · ${timeStr}同步`;
    } else {
        statusEl.textContent = `${itemCount}件 · 未同步`;
    }
}

// 检查是否需要同步（24小时内不重复同步）
function checkAndSync() {
    const lastSync = localStorage.getItem(SYNC_TIMESTAMP_KEY);
    const savedItems = localStorage.getItem(ITEMS_STORAGE_KEY);

    // 如果有保存的数据，先加载
    if (savedItems) {
        try {
            const items = JSON.parse(savedItems);
            if (items && items.length > 0) {
                mockItems.length = 0;
                mockItems.push(...items);
                console.log('已从本地加载', items.length, '件饰品');
            }
        } catch (e) {
            console.error('加载本地数据失败:', e);
        }
    }

    // 更新同步状态显示
    updateSyncStatus();

    // 检查是否需要同步（超过24小时或无数据）
    const needSync = !lastSync ||
                     (Date.now() - parseInt(lastSync)) > 24 * 60 * 60 * 1000 ||
                     !savedItems;

    if (needSync) {
        // 延迟2秒后同步，避免阻塞页面加载
        setTimeout(() => {
            syncItemsFromAPI();
        }, 2000);
    }
}

// 手动同步按钮
async function manualSync() {
    const btn = document.querySelector('.btn-sync-items');
    if (!btn) return;

    // 防止重复点击
    if (btn.disabled) return;

    btn.disabled = true;
    btn.innerHTML = '<span class="sync-spinner"></span> 同步中...';
    btn.style.pointerEvents = 'none';

    try {
        const success = await syncItemsFromAPI();
        if (success) {
            btn.innerHTML = '✅ 完成';
            btn.style.background = 'var(--accent-green)';
            btn.style.color = 'white';
            setTimeout(() => {
                btn.innerHTML = '🔄 同步';
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        } else {
            btn.innerHTML = '❌ 失败';
            btn.style.background = 'var(--accent-red)';
            btn.style.color = 'white';
            setTimeout(() => {
                btn.innerHTML = '🔄 同步';
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        }
    } catch (error) {
        console.error('同步出错:', error);
        btn.innerHTML = '❌ 错误';
        setTimeout(() => {
            btn.innerHTML = '🔄 同步';
        }, 2000);
    } finally {
        btn.disabled = false;
        btn.style.pointerEvents = '';
    }
}

// 启动时检查同步
checkAndSync();
