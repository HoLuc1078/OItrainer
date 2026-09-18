/* countries.js - 出境集训：国家 / 地区数据与专属事件
 *
 * 本文件整合两件事：
 *   1. COUNTRIES —— 出境集训可选的 56 个国家 / 地区，含费用、训练质量、
 *      能力倾向（bonus）以及一句"点到为止"的 hint（用于「查看国家」页面）。
 *   2. OVERSEAS_COUNTRY_EFFECTS —— 每个国家在集训结束时触发的专属彩蛋。
 *      效果各不相同：有的加知识点、有的减压、有的花钱、有的有风险，
 *      少数国家还有机会直接点出隐藏天赋。
 *
 * 加载顺序：需在 lib/provinces.js 与 lib/constants.js 之后加载
 *          （COUNTRIES 依赖 *_PROVINCE_BUDGET / *_TRAINING_QUALITY 常量）。
 */

/* =========== 国家 / 地区数据 =========== */
const COUNTRIES = {
  1: { name: "香港", type: "特别行政区", isNorth: false, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.0, bonus: { thinking: 1.2, coding: 1.1 }, pressureFactor: 0.9,
       hint: "国际金融中心，购物与美食的天堂" },
  2: { name: "澳门", type: "特别行政区", isNorth: false, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.0, bonus: { knowledge_string: 1.3 }, pressureFactor: 0.8,
       hint: "一河之隔，运气也是实力的一部分" },
  3: { name: "美国", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.5, bonus: { knowledge_math: 1.4 }, pressureFactor: 1.2,
       hint: "综合实力强劲，人才辈出" },
  4: { name: "日本", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.4, bonus: { coding: 1.3, knowledge_ds: 1.2 }, pressureFactor: 1.1,
       hint: "神秘资源丰富" },
  5: { name: "韩国", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.3, bonus: { thinking: 1.3, knowledge_graph: 1.4 }, pressureFactor: 1.2,
       hint: "电竞与造星工业发达，竞争极其激烈" },
  6: { name: "新加坡", type: "国家", isNorth: false, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.3, bonus: { thinking: 1.3, coding: 1.3 }, pressureFactor: 1.0,
       hint: "花园城市，东西方交汇之地" },
  7: { name: "德国", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.4, bonus: { knowledge_math: 1.5, coding: 1.2 }, pressureFactor: 1.1,
       hint: "工业与纪律的代名词，严谨到刻板" },
  8: { name: "英国", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.4, bonus: { knowledge_dp: 1.3 }, pressureFactor: 1.0,
       hint: "老牌学术重镇，传统深厚" },
  9: { name: "罗马尼亚", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.3, bonus: { thinking: 1.5, coding: 1.4 }, pressureFactor: 1.1,
       hint: "喀尔巴阡山下的古老传说" },
  10: { name: "加拿大", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.5, bonus: { knowledge_math: 1.3, thinking: 1.2 }, pressureFactor: 1.0,
       hint: "幅员辽阔，适合静心与疗愈" },
  11: { name: "保加利亚", type: "国家", isNorth: true, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.2, bonus: { coding: 1.4, knowledge_graph: 1.3 }, pressureFactor: 1.0,
       hint: "玫瑰之国，算法传统深厚" },
  12: { name: "越南", type: "国家", isNorth: false, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.1, bonus: { knowledge_dp: 1.4, thinking: 1.2 }, pressureFactor: 0.9,
       hint: "摩托车与咖啡，训练条件相当艰苦" },
  13: { name: "匈牙利", type: "国家", isNorth: true, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.2, bonus: { knowledge_math: 1.5 }, pressureFactor: 1.0,
       hint: "多瑙河畔，图论的故乡" },
  14: { name: "伊朗", type: "国家", isNorth: false, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.1, bonus: { coding: 1.3, knowledge_string: 1.2 }, pressureFactor: 1.1,
       hint: "波斯古国，数学氛围浓厚" },
  15: { name: "波兰", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.3, bonus: { knowledge_ds: 1.4, thinking: 1.3 }, pressureFactor: 1.0,
       hint: "中东欧算法重镇，人才密度极高" },
  16: { name: "马来西亚", type: "国家", isNorth: false, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.0, bonus: { coding: 1.2 }, pressureFactor: 0.8,
       hint: "多元文化交汇，物价亲民" },
  17: { name: "中国台湾", type: "地区", isNorth: false, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.0, bonus: { thinking: 1.3, knowledge_dp: 1.2 }, pressureFactor: 0.9,
       hint: "信息学氛围浓厚，选手基础扎实" },
  18: { name: "哈萨克斯坦", type: "国家", isNorth: true, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.1, bonus: { knowledge_graph: 1.2 }, pressureFactor: 1.0,
       hint: "草原辽阔，地广人稀" },
  19: { name: "澳大利亚", type: "国家", isNorth: false, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.4, bonus: { thinking: 1.2, coding: 1.2 }, pressureFactor: 1.0,
       hint: "南半球，户外与自然之国" },
  20: { name: "印度尼西亚", type: "国家", isNorth: false, baseBudget: WEAK_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.0, bonus: { knowledge_string: 1.3 }, pressureFactor: 0.9,
       hint: "千岛之国，人口稠密" },
  21: { name: "法国", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.4, bonus: { knowledge_math: 1.3, coding: 1.2 }, pressureFactor: 1.0,
       hint: "浪漫与数学并重" },
  22: { name: "印度", type: "国家", isNorth: false, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.1, bonus: { thinking: 1.3, knowledge_ds: 1.2 }, pressureFactor: 1.1,
       hint: "人口大国，外包产业发达" },
  23: { name: "泰国", type: "国家", isNorth: false, baseBudget: WEAK_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.0, bonus: { coding: 1.2 }, pressureFactor: 0.8,
       hint: "微笑之国，风情万种" },
  24: { name: "埃及", type: "国家", isNorth: true, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.1, bonus: { knowledge_string: 1.2, thinking: 1.1 }, pressureFactor: 1.0,
       hint: "尼罗河畔的古老文明" },
  25: { name: "克罗地亚", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.3, bonus: { coding: 1.3, knowledge_ds: 1.2 }, pressureFactor: 1.0,
       hint: "亚得里亚海明珠，人少但够拼" },
  26: { name: "塞尔维亚", type: "国家", isNorth: true, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.2, bonus: { thinking: 1.4, knowledge_graph: 1.3 }, pressureFactor: 1.0,
       hint: "巴尔干雄鹰，基础扎实" },
  27: { name: "瑞士", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.5, bonus: { knowledge_math: 1.5, coding: 1.4 }, pressureFactor: 1.1,
       hint: "精密与精准的代名词" },
  28: { name: "土耳其", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.3, bonus: { thinking: 1.2, knowledge_dp: 1.3 }, pressureFactor: 1.1,
       hint: "横跨欧亚的十字路口" },
  29: { name: "乌兹别克斯坦", type: "国家", isNorth: true, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.1, bonus: { coding: 1.2, knowledge_string: 1.3 }, pressureFactor: 1.0,
       hint: "丝路重镇，手抓饭管够" },
  30: { name: "荷兰", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.4, bonus: { knowledge_math: 1.4, thinking: 1.3 }, pressureFactor: 1.0,
       hint: "低地之国，思维自由" },
  31: { name: "北马其顿", type: "国家", isNorth: true, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.2, bonus: { knowledge_ds: 1.3, coding: 1.2 }, pressureFactor: 0.9,
       hint: "巴尔干小国，安静且专注" },
  32: { name: "新西兰", type: "国家", isNorth: false, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.4, bonus: { thinking: 1.3, knowledge_graph: 1.2 }, pressureFactor: 0.9,
       hint: "中土世界，与世隔绝的静修地" },
  33: { name: "吉尔吉斯斯坦", type: "国家", isNorth: true, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.1, bonus: { coding: 1.3, knowledge_dp: 1.2 }, pressureFactor: 1.0,
       hint: "天山之国，牧民生活" },
  34: { name: "斯洛伐克", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.3, bonus: { knowledge_math: 1.4, thinking: 1.2 }, pressureFactor: 1.0,
       hint: "城堡与森林之间的小国" },
  35: { name: "亚美尼亚", type: "国家", isNorth: true, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.2, bonus: { knowledge_string: 1.4, coding: 1.3 }, pressureFactor: 1.1,
       hint: "高加索山国，对字符串有信仰" },
  36: { name: "巴西", type: "国家", isNorth: false, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.3, bonus: { thinking: 1.4, knowledge_ds: 1.2 }, pressureFactor: 1.0,
       hint: "桑巴与狂欢，热情似火" },
  37: { name: "意大利", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.4, bonus: { coding: 1.3, knowledge_graph: 1.4 }, pressureFactor: 1.0,
       hint: "文艺复兴发源地，美食与艺术" },
  38: { name: "巴基斯坦", type: "国家", isNorth: false, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.1, bonus: { knowledge_math: 1.3, thinking: 1.2 }, pressureFactor: 1.1,
       hint: "南亚次大陆，教育资源紧张" },
  39: { name: "瑞典", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.4, bonus: { knowledge_dp: 1.4, coding: 1.3 }, pressureFactor: 1.0,
       hint: "北欧福利国家，重视教育" },
  40: { name: "比利时", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.4, bonus: { thinking: 1.3, knowledge_string: 1.2 }, pressureFactor: 0.9,
       hint: "巧克力与漫画之国" },
  41: { name: "菲律宾", type: "国家", isNorth: false, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.0, bonus: { coding: 1.2, knowledge_ds: 1.3 }, pressureFactor: 0.8,
       hint: "群岛国家，英语普及率高" },
  42: { name: "墨西哥", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.3, bonus: { knowledge_math: 1.3, thinking: 1.1 }, pressureFactor: 1.0,
       hint: "玉米与辣椒的故乡" },
  43: { name: "奥地利", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.4, bonus: { coding: 1.4, knowledge_graph: 1.3 }, pressureFactor: 1.0,
       hint: "音乐之都，阿尔卑斯山脚下" },
  44: { name: "古巴", type: "国家", isNorth: true, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.2, bonus: { thinking: 1.3, knowledge_dp: 1.2 }, pressureFactor: 0.9,
       hint: "加勒比海上的雪茄与老爷车" },
  45: { name: "格鲁吉亚", type: "国家", isNorth: true, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.2, bonus: { knowledge_string: 1.3, coding: 1.2 }, pressureFactor: 1.0,
       hint: "高加索山下，葡萄酒的发源地" },
  46: { name: "哥斯达黎加", type: "国家", isNorth: true, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.1, bonus: { knowledge_math: 1.2, thinking: 1.3 }, pressureFactor: 0.9,
       hint: "中美洲生态天堂，没有军队" },
  47: { name: "爱尔兰", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.4, bonus: { coding: 1.3, knowledge_ds: 1.4 }, pressureFactor: 1.0,
       hint: "绿宝石岛，软件产业发达" },
  48: { name: "立陶宛", type: "国家", isNorth: true, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.3, bonus: { thinking: 1.4, knowledge_graph: 1.2 }, pressureFactor: 1.0,
       hint: "波罗的海三国之一，专注认真" },
  49: { name: "捷克共和国", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.3, bonus: { knowledge_math: 1.4, coding: 1.3 }, pressureFactor: 1.0,
       hint: "啤酒与水晶，中欧工业重镇" },
  50: { name: "爱沙尼亚", type: "国家", isNorth: true, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.2, bonus: { knowledge_dp: 1.3, thinking: 1.2 }, pressureFactor: 1.0,
       hint: "电子之国，数字化的先锋" },
  51: { name: "沙特阿拉伯", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.4, bonus: { coding: 1.2, knowledge_string: 1.3 }, pressureFactor: 1.1,
       hint: "石油与沙漠，财大气粗" },
  52: { name: "摩洛哥", type: "国家", isNorth: true, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.1, bonus: { thinking: 1.2, knowledge_ds: 1.2 }, pressureFactor: 1.0,
       hint: "北非门户，撒哈拉边缘" },
  53: { name: "波黑", type: "国家", isNorth: true, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.2, bonus: { knowledge_math: 1.3, coding: 1.2 }, pressureFactor: 0.9,
       hint: "萨拉热窝，山地之国" },
  54: { name: "斯洛文尼亚", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.3, bonus: { knowledge_graph: 1.4, thinking: 1.3 }, pressureFactor: 1.0,
       hint: "阿尔卑斯南麓，小而美" },
  55: { name: "挪威", type: "国家", isNorth: true, baseBudget: STRONG_PROVINCE_BUDGET, trainingQuality: STRONG_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.5, bonus: { coding: 1.4, knowledge_dp: 1.3 }, pressureFactor: 1.1,
       hint: "峡湾与极昼，北欧最强" },
  56: { name: "智利", type: "国家", isNorth: false, baseBudget: NORMAL_PROVINCE_BUDGET, trainingQuality: NORMAL_PROVINCE_TRAINING_QUALITY, costMultiplier: 1.1, bonus: { thinking: 1.3, knowledge_string: 1.2 }, pressureFactor: 0.9,
       hint: "狭长的天涯之国" },
};

/* =========== 搜索用索引（拼音首字母 / 英文名） =========== */
/* 给「搜索国家 / 地区」用：中文名、拼音首字母、英文名都能搜到。 */
var COUNTRY_PINYIN = {
  '香港': 'xg hk hongkong', '澳门': 'am macau', '美国': 'mg usa america', '日本': 'rb jp japan',
  '韩国': 'hg korea', '新加坡': 'xjp singapore', '德国': 'dg germany', '英国': 'yg uk britain england',
  '罗马尼亚': 'lmn y romania', '加拿大': 'jnd canada', '保加利亚': 'bjly bulgaria', '越南': 'yn vietnam',
  '匈牙利': 'xyl hungary', '伊朗': 'yl iran', '波兰': 'bl poland', '马来西亚': 'mlxy malaysia',
  '中国台湾': 'zg tw taiwan', '哈萨克斯坦': 'hskst kazakhstan', '澳大利亚': 'adly australia',
  '印度尼西亚': 'ydnxy indonesia', '法国': 'fg france', '印度': 'yd india', '泰国': 'tg thailand',
  '埃及': 'aj egypt', '克罗地亚': 'kldy croatia', '塞尔维亚': 'sewy serbia', '瑞士': 'rs switzerland',
  '土耳其': 'teq turkey', '乌兹别克斯坦': 'wzbkst uzbekistan', '荷兰': 'hl netherlands holland',
  '北马其顿': 'bmqd macedonia', '新西兰': 'xxl newzealand', '吉尔吉斯斯坦': 'jejsst kyrgyzstan',
  '斯洛伐克': 'slfk slovakia', '亚美尼亚': 'ymny armenia', '巴西': 'bx brazil', '意大利': 'ydl italy',
  '巴基斯坦': 'bjst pakistan', '瑞典': 'rd sweden', '比利时': 'bls belgium', '菲律宾': 'flb philippines',
  '墨西哥': 'mxg mexico', '奥地利': 'adl austria', '古巴': 'gb cuba', '格鲁吉亚': 'gljy georgia',
  '哥斯达黎加': 'gsdlj costarica', '爱尔兰': 'ael ireland', '立陶宛': 'ltw lithuania',
  '捷克共和国': 'jkg hg czech', '爱沙尼亚': 'asny estonia', '沙特阿拉伯': 'stalb saudi',
  '摩洛哥': 'mlg morocco', '波黑': 'bh bosnia', '斯洛文尼亚': 'slwny slovenia', '挪威': 'nw norway',
  '智利': 'zl chile'
};

/** 返回某个国家 / 地区用于搜索的额外关键词（拼音首字母 / 英文名） */
function countryPinyin(name){ return COUNTRY_PINYIN[name] || ''; }

/* =========== 出境集训 · 国家专属效果 =========== */

var OVERSEAS_KNOWLEDGE_TYPES = {
  '数据结构': 'knowledge_ds', '图论': 'knowledge_graph', '字符串': 'knowledge_string',
  '数学': 'knowledge_math', '动态规划': 'knowledge_dp', 'DP': 'knowledge_dp'
};

function __overseasClampPct(v){ v = Number(v) || 0; return v < 0 ? 0 : (v > 100 ? 100 : v); }

/**
 * 通用上下文工具。每个国家效果函数接收一个 ctx，并返回一句结果文案。
 * ctx 提供：
 *   pick()                   本次掷骰"轮到"的那名学生（负面事件里则是随机一名）
 *   all() / each(fn)         全部参加集训的学生
 *   k(s, n)                  五类知识点同时 +n
 *   kt(s, type, n)           指定知识点 +n（type 为中文：数据结构/图论/字符串/数学/动态规划）
 *   think/code/mental(s, n)  思维 / 编程 / 心理 +n
 *   pressure(s, n)           压力 +n（自动夹在 0~100）
 *   comfort(s, n)            舒适度 +n（自动夹在 0~100）
 *   money(delta)             经费 +delta（可为负）
 *   talent(s, name, prob)    以 prob 概率授予天赋，返回是否授予成功
 *   event(name, desc)        推一张事件卡
 *   log(msg)                 写一行日志
 *   uniformInt(a, b)         [a, b] 随机整数
 *
 * @param {Array} students    本次参加集训的全部学生
 * @param {Object|null} current 当前触发事件的学生；为 null 时 pick() 随机取一名
 * @param {string} countryName 国家 / 地区名
 */
function buildOverseasContext(students, current, countryName){
  students = Array.isArray(students) ? students : [];
  function pickOne(){
    if(current && students.indexOf(current) >= 0) return current;
    if(students.length === 0) return null;
    return students[Math.floor(Math.random() * students.length)];
  }
  return {
    country: countryName,
    uniformInt: function(a, b){ return (typeof uniformInt === 'function') ? uniformInt(a, b) : (a + Math.floor(Math.random() * (b - a + 1))); },
    pick: pickOne,
    all: function(){ return students.slice(); },
    each: function(fn){ students.forEach(function(s){ try{ fn(s); }catch(e){ console.error('overseas each failed', e); } }); },
    k: function(s, amount){
      if(!s) return;
      s.knowledge_ds = Number(s.knowledge_ds || 0) + amount;
      s.knowledge_graph = Number(s.knowledge_graph || 0) + amount;
      s.knowledge_string = Number(s.knowledge_string || 0) + amount;
      s.knowledge_math = Number(s.knowledge_math || 0) + amount;
      s.knowledge_dp = Number(s.knowledge_dp || 0) + amount;
    },
    kt: function(s, type, amount){
      if(!s) return;
      var key = OVERSEAS_KNOWLEDGE_TYPES[type] || type;
      if(typeof s[key] === 'undefined') return;
      s[key] = Number(s[key] || 0) + amount;
    },
    think: function(s, d){ if(s) s.thinking = Math.max(0, Number(s.thinking || 0) + d); },
    code: function(s, d){ if(s) s.coding = Math.max(0, Number(s.coding || 0) + d); },
    mental: function(s, d){ if(s) s.mental = __overseasClampPct(Number(s.mental || 0) + d); },
    pressure: function(s, d){ if(s) s.pressure = __overseasClampPct(Number(s.pressure || 0) + d); },
    comfort: function(s, d){ if(s) s.comfort = __overseasClampPct(Number(s.comfort || 0) + d); },
    sick: function(s, weeks){ if(s) s.sick_weeks = Math.max(0, Number(s.sick_weeks || 0) + Number(weeks || 0)); },
    money: function(delta){
      var g = (typeof game !== 'undefined' && game) ? game : null;
      if(!g) return;
      if(delta < 0){ try{ if(g.recordExpense) g.recordExpense(-delta, '出境集训·当地开支'); else g.budget += delta; }catch(e){ g.budget += delta; } }
      else { g.budget += delta; }
    },
    talent: function(s, name, prob){
      if(!s || !name) return false;
      if(typeof s.hasTalent === 'function' && s.hasTalent(name)) return false;
      if(Math.random() >= (typeof prob === 'number' ? prob : 0.1)) return false;
      try{ s.addTalent(name); }catch(e){ return false; }
      try{ if(typeof window !== 'undefined' && window.pushEvent) window.pushEvent({ name: '天赋觉醒', description: s.name + ' 在出境集训中觉醒了天赋「' + name + '」！', week: game.week }); }catch(e){}
      try{ if(typeof window !== 'undefined' && window.AchievementManager) window.AchievementManager.checkAll(game); }catch(e){}
      return true;
    },
    event: function(name, desc){ try{ if(typeof window !== 'undefined' && window.pushEvent) window.pushEvent({ name: name, description: desc, week: game.week }); }catch(e){} },
    log: function(msg){ try{ if(typeof log === 'function') log(msg); }catch(e){} }
  };
}

const OVERSEAS_COUNTRY_EFFECTS = {

  /* ---------- 特别行政区 ---------- */
  '香港': function(c){
    var s = c.pick();
    var cost = c.uniformInt(1000, 5000);
    c.money(-cost);
    c.pressure(s, -20);
    c.comfort(s, 10);
    return s.name + '在香港血拼消费 ¥' + cost + '，压力 -20、舒适度 +10';
  },
  '澳门': function(c){
    var s = c.pick();
    var delta = c.uniformInt(-10000, 10000);
    c.money(delta);
    if (delta > 0) return s.name + '在澳门手气爆棚，为队伍赢回 ¥' + delta;
    if (delta < 0) return s.name + '在澳门输掉了 ¥' + Math.abs(delta);
    return s.name + '在澳门不输不赢，白玩一场';
  },

  /* ---------- 北美 / 南美 ---------- */
  '美国': function(c){
    var s = c.pick();
    if (Math.random() < 0.10) {
      c.think(s, 30); c.code(s, 30); c.mental(s, 30);
      return s.name + '在美国受到顶尖大佬点拨，全能力 +30';
    }
    c.think(s, 10); c.code(s, 10); c.mental(s, 10); c.pressure(s, 20);
    return s.name + '在美国与顶尖选手切磋，全能力 +10、压力 +20';
  },
  '加拿大': function(c){
    var s = c.pick();
    c.pressure(s, -25); c.mental(s, 10);
    return s.name + '在加拿大的自然环境中彻底放松，压力 -25、心理 +10';
  },
  '墨西哥': function(c){
    var s = c.pick();
    c.kt(s, '数学', 13); c.think(s, 11);
    return s.name + '在墨西哥的烈日下刷了一天数学，数学 +13、思维 +11';
  },
  '古巴': function(c){
    var s = c.pick();
    c.money(-5000);
    c.think(s, 13); c.kt(s, '动态规划', 12);
    return s.name + '在古巴的物资紧缺中坚持训练，思维 +13、DP +12（额外支出 ¥5000）';
  },
  '巴西': function(c){
    var s = c.pick();
    if (Math.random() < 0.4) {
      c.pressure(s, -Number(s.pressure || 0)); c.mental(s, 15);
      return s.name + '被巴西狂欢节彻底治愈，压力清零、心理 +15';
    }
    c.pressure(s, 20);
    return s.name + '在巴西被狂欢节分了心，压力 +20';
  },
  '智利': function(c){
    var s = c.pick();
    c.think(s, 13); c.kt(s, '字符串', 12);
    return s.name + '在智利狭长的海岸线上想通了字符串，思维 +13、字符串 +12';
  },

  /* ---------- 东亚 / 东南亚 ---------- */
  '日本': function(c){
    var s = c.pick();
    c.pressure(s, -Number(s.pressure || 0));
    c.comfort(s, 20);
    if (c.talent(s, '样例过了就是过了', 0.08)) {
      return s.name + '在日本神秘资源丰富的夜里顿悟，压力清零，并觉醒隐藏天赋「样例过了就是过了」！';
    }
    return s.name + '在日本体验了神秘资源，压力清零、舒适度 +20';
  },
  '韩国': function(c){
    var s = c.pick();
    if (c.talent(s, '电竞选手', 0.35)) {
      c.pressure(s, -10);
      return s.name + '在韩国接受了电竞式训练，压力 -10，并获得天赋「电竞选手」';
    }
    c.pressure(s, 25); c.think(s, 8); c.code(s, 8);
    return s.name + '在韩国被高强度训练卷到怀疑人生，思维 +8、编程 +8、压力 +25';
  },
  '新加坡': function(c){
    var s = c.pick();
    c.think(s, 12); c.code(s, 8); c.pressure(s, -10);
    return s.name + '在新加坡的双语环境里开了窍，思维 +12、编程 +8、压力 -10';
  },
  '马来西亚': function(c){
    var s = c.pick();
    c.code(s, 12); c.pressure(s, -10);
    return s.name + '在马来西亚的多元氛围里轻松备赛，编程 +12、压力 -10';
  },
  '泰国': function(c){
    var s = c.pick();
    if (!s.femaleTeamPath) {
      // 只打标记，不改名字！名字是学生的身份，改名会导致晋级记录、比赛履历全部对不上号。
      // 女队身份在 UI 上以「女队」小标签呈现（见 Student.getDisplayName / render.js）。
      s.femaleTeamPath = true;
      s.femaleTeamWeek = (typeof game !== 'undefined' && game) ? game.week : undefined;
      try { if (typeof window !== 'undefined' && window.AchievementManager) window.AchievementManager.unlock('female_team', game); } catch (e) { }
      return s.name + '在泰国受到启发，走上了女队发展道路（比赛代码难度大幅降低）';
    }
    c.pressure(s, -15); c.comfort(s, 10);
    return s.name + '再次造访泰国，压力 -15、舒适度 +10';
  },
  '越南': function(c){
    var s = c.pick();
    c.code(s, 20); c.pressure(s, 30);
    if (c.talent(s, '铁人', 0.15)) {
      return s.name + '在越南的艰苦条件下练出钢筋铁骨，编程 +20、压力 +30，并获得天赋「铁人」';
    }
    return s.name + '在越南接受艰苦训练，编程 +20、压力 +30';
  },
  '菲律宾': function(c){
    var s = c.pick();
    c.code(s, 12); c.kt(s, '数据结构', 13); c.pressure(s, -8);
    return s.name + '在菲律宾的群岛之间刷题，编程 +12、数据结构 +13、压力 -8';
  },
  '印度尼西亚': function(c){
    var s = c.pick();
    c.kt(s, '字符串', 13); c.pressure(s, -10);
    return s.name + '在印尼的千岛之间琢磨字符串，字符串 +13、压力 -10';
  },

  /* ---------- 南亚 / 西亚 / 中亚 ---------- */
  '印度': function(c){
    var s = c.pick();
    var income = c.uniformInt(0, 10000);
    c.money(income);
    c.kt(s, '数学', 20); c.code(s, 5);
    if (c.talent(s, 'Deadline 是第一生产力', 0.08)) {
      return s.name + '在印度接了几天外包，数学 +20、编程 +5、收入 ¥' + income + '，并觉醒隐藏天赋「Deadline 是第一生产力」！';
    }
    return s.name + '在印度接了几天外包，数学 +20、编程 +5、收入 ¥' + income;
  },
  '巴基斯坦': function(c){
    var s = c.pick();
    c.kt(s, '数学', 13); c.think(s, 12); c.pressure(s, 15);
    return s.name + '在巴基斯坦顶着压力刷数学，数学 +13、思维 +12、压力 +15';
  },
  '伊朗': function(c){
    var s = c.pick();
    c.code(s, 13); c.kt(s, '字符串', 12);
    return s.name + '在伊朗的波斯古韵中打磨代码，编程 +13、字符串 +12';
  },
  '土耳其': function(c){
    var s = c.pick();
    c.think(s, 12); c.kt(s, '动态规划', 13); c.pressure(s, 10);
    return s.name + '在横跨欧亚的土耳其来回横跳，思维 +12、DP +13、压力 +10';
  },
  '沙特阿拉伯': function(c){
    var s = c.pick();
    c.money(-8000);
    c.code(s, 12); c.kt(s, '字符串', 13);
    return s.name + '在沙特顶着高物价训练，编程 +12、字符串 +13（额外支出 ¥8000）';
  },
  '哈萨克斯坦': function(c){
    var s = c.pick();
    c.kt(s, '图论', 12); c.pressure(s, -5);
    return s.name + '在哈萨克斯坦的草原上放空了几天，图论 +12、压力 -5';
  },
  '乌兹别克斯坦': function(c){
    var s = c.pick();
    c.code(s, 12); c.kt(s, '字符串', 13);
    return s.name + '在乌兹别克斯坦的丝路古城扎营，编程 +12、字符串 +13';
  },
  '吉尔吉斯斯坦': function(c){
    var s = c.pick();
    c.code(s, 13); c.kt(s, '动态规划', 12); c.comfort(s, -10);
    return s.name + '在吉尔吉斯斯坦的牧区里刷 DP，编程 +13、DP +12、舒适度 -10';
  },

  /* ---------- 欧洲 ---------- */
  '德国': function(c){
    var s = c.pick();
    c.think(s, 15); c.kt(s, '数据结构', 10); c.pressure(s, 15);
    if (c.talent(s, '暴力出奇迹', 0.08)) {
      return s.name + '在德国接受了刻板的严谨训练，思维 +15、数据结构 +10、压力 +15，并觉醒隐藏天赋「暴力出奇迹」！';
    }
    return s.name + '在德国接受严谨训练，思维 +15、数据结构 +10、压力 +15';
  },
  '英国': function(c){
    var s = c.pick();
    c.kt(s, '数学', 12); c.kt(s, '字符串', 8); c.mental(s, 5);
    return s.name + '在英国感受老牌学术传统，数学 +12、字符串 +8、心理 +5';
  },
  '法国': function(c){
    var s = c.pick();
    c.think(s, 12); c.kt(s, '图论', 8);
    return s.name + '在法国把图论当成了艺术，思维 +12、图论 +8';
  },
  '瑞士': function(c){
    var s = c.pick();
    c.code(s, 12); c.kt(s, '数据结构', 8); c.pressure(s, -5);
    if (c.talent(s, '稳如老狗', 0.08)) {
      return s.name + '在瑞士学会了极致的精准，编程 +12、数据结构 +8、压力 -5，并觉醒隐藏天赋「稳如老狗」！';
    }
    return s.name + '在瑞士接受精准训练，编程 +12、数据结构 +8、压力 -5';
  },
  '意大利': function(c){
    var s = c.pick();
    var cost = c.uniformInt(800, 2000);
    c.money(-cost);
    c.pressure(s, -25); c.comfort(s, 10);
    return s.name + '在意大利享受美食消费 ¥' + cost + '，压力 -25、舒适度 +10';
  },
  '荷兰': function(c){
    var s = c.pick();
    c.kt(s, '数学', 14); c.think(s, 13);
    if (c.talent(s, '冷静', 0.12)) {
      return s.name + '在荷兰的自由氛围中想通了数学，数学 +14、思维 +13，并获得天赋「冷静」';
    }
    return s.name + '在荷兰的低地之国想通了数学，数学 +14、思维 +13';
  },
  '比利时': function(c){
    var s = c.pick();
    c.think(s, 13); c.kt(s, '字符串', 12);
    return s.name + '在比利时一边啃巧克力一边刷题，思维 +13、字符串 +12';
  },
  '奥地利': function(c){
    var s = c.pick();
    c.code(s, 14); c.kt(s, '图论', 13);
    return s.name + '在奥地利伴着圆舞曲写代码，编程 +14、图论 +13';
  },
  '波兰': function(c){
    var s = c.pick();
    c.kt(s, '数据结构', 14); c.think(s, 13);
    if (c.talent(s, '数据结构狂热者', 0.15)) {
      return s.name + '在波兰这个算法重镇开了窍，数据结构 +14、思维 +13，并获得天赋「数据结构狂热者」';
    }
    return s.name + '在波兰的算法重镇埋头苦修，数据结构 +14、思维 +13';
  },
  '捷克共和国': function(c){
    var s = c.pick();
    c.kt(s, '数学', 14); c.code(s, 13);
    return s.name + '在捷克的工业重镇精雕细琢，数学 +14、编程 +13';
  },
  '斯洛伐克': function(c){
    var s = c.pick();
    c.kt(s, '数学', 14); c.think(s, 12);
    return s.name + '在斯洛伐克的古堡里闭关，数学 +14、思维 +12';
  },
  '匈牙利': function(c){
    var s = c.pick();
    c.kt(s, '图论', 10);
    if (c.talent(s, '图论直觉', 0.12)) {
      return s.name + '在匈牙利学会了匈牙利算法，图论 +10，并获得天赋「图论直觉」';
    }
    return s.name + '在匈牙利学会了匈牙利算法，图论 +10';
  },
  '罗马尼亚': function(c){
    var s = c.pick();
    c.think(s, 14); c.kt(s, '图论', 10);
    return s.name + '在罗马尼亚的古老传说中受到启发，思维 +14、图论 +10';
  },
  '保加利亚': function(c){
    var s = c.pick();
    c.code(s, 14); c.kt(s, '图论', 12);
    return s.name + '在保加利亚的玫瑰谷里闭关，编程 +14、图论 +12';
  },
  '克罗地亚': function(c){
    var s = c.pick();
    c.code(s, 13); c.kt(s, '数据结构', 12); c.pressure(s, 10);
    return s.name + '在克罗地亚以赛代练，编程 +13、数据结构 +12、压力 +10';
  },
  '塞尔维亚': function(c){
    var s = c.pick();
    c.think(s, 14); c.kt(s, '图论', 13);
    return s.name + '在塞尔维亚与当地选手对练，思维 +14、图论 +13';
  },
  '斯洛文尼亚': function(c){
    var s = c.pick();
    c.kt(s, '图论', 14); c.think(s, 13);
    return s.name + '在斯洛文尼亚的阿尔卑斯山脚下静修，图论 +14、思维 +13';
  },
  '波黑': function(c){
    var s = c.pick();
    c.kt(s, '数学', 13); c.code(s, 12);
    return s.name + '在波黑的群山之间刷题，数学 +13、编程 +12';
  },
  '北马其顿': function(c){
    var s = c.pick();
    c.kt(s, '数据结构', 13); c.code(s, 12);
    return s.name + '在北马其顿安静地啃数据结构，数据结构 +13、编程 +12';
  },
  '立陶宛': function(c){
    var s = c.pick();
    c.think(s, 14); c.kt(s, '图论', 12);
    return s.name + '在立陶宛按部就班地推进，思维 +14、图论 +12';
  },
  '爱沙尼亚': function(c){
    var s = c.pick();
    c.kt(s, '动态规划', 13); c.think(s, 12);
    return s.name + '在电子之国爱沙尼亚刷 DP，DP +13、思维 +12';
  },
  '爱尔兰': function(c){
    var s = c.pick();
    c.code(s, 13); c.kt(s, '数据结构', 14);
    return s.name + '在爱尔兰的软件产业区实习式训练，编程 +13、数据结构 +14';
  },
  '瑞典': function(c){
    var s = c.pick();
    c.kt(s, '动态规划', 14); c.code(s, 13);
    return s.name + '在瑞典安心刷 DP，DP +14、编程 +13';
  },
  '挪威': function(c){
    var s = c.pick();
    c.code(s, 14); c.kt(s, '动态规划', 13); c.mental(s, 10);
    return s.name + '在挪威的峡湾与极昼中沉淀，编程 +14、DP +13、心理 +10';
  },
  '格鲁吉亚': function(c){
    var s = c.pick();
    c.kt(s, '字符串', 13); c.code(s, 12);
    return s.name + '在格鲁吉亚的葡萄酒乡琢磨字符串，字符串 +13、编程 +12';
  },
  '亚美尼亚': function(c){
    var s = c.pick();
    c.kt(s, '字符串', 14); c.code(s, 13);
    return s.name + '在亚美尼亚的高加索山国钻研字符串，字符串 +14、编程 +13';
  },

  /* ---------- 非洲 / 大洋洲 ---------- */
  '埃及': function(c){
    var s = c.pick();
    c.think(s, 15); c.kt(s, '数学', 10);
    return s.name + '在尼罗河畔受到古文明启发，思维 +15、数学 +10';
  },
  '摩洛哥': function(c){
    var s = c.pick();
    c.think(s, 12); c.kt(s, '数据结构', 12);
    return s.name + '在摩洛哥的撒哈拉边缘闭关，思维 +12、数据结构 +12';
  },
  '澳大利亚': function(c){
    var s = c.pick();
    if (Math.random() < 0.10) {
      s.sick_weeks = Number(s.sick_weeks || 0) + 2;
      return s.name + '在澳大利亚的野外冒险中受伤，病程 +2 周';
    }
    c.mental(s, 20); c.pressure(s, -15);
    return s.name + '在澳大利亚的户外拓展中放飞自我，心理 +20、压力 -15';
  },
  '新西兰': function(c){
    var s = c.pick();
    c.mental(s, 20); c.pressure(s, -20);
    return s.name + '在中土世界的与世隔绝中静修，心理 +20、压力 -20';
  },
  '哥斯达黎加': function(c){
    var s = c.pick();
    c.kt(s, '数学', 12); c.think(s, 13); c.pressure(s, -15);
    return s.name + '在哥斯达黎加的生态天堂里回归自然，数学 +12、思维 +13、压力 -15';
  },

  /* ---------- 中国台湾 ---------- */
  '中国台湾': function(c){
    var s = c.pick();
    c.think(s, 13); c.kt(s, '动态规划', 12);
    if (c.talent(s, '你怎么知道我 AK 了', 0.08)) {
      return s.name + '在台湾与当地选手交流，思维 +13、DP +12，并觉醒隐藏天赋「你怎么知道我 AK 了」！';
    }
    return s.name + '在台湾与当地选手交流切磋，思维 +13、DP +12';
  },

  /* ---------- 兜底：未单独配置的国家 ---------- */
  '__default__': function(c){
    var s = c.pick();
    c.think(s, 8); c.code(s, 8); c.pressure(s, 10);
    return s.name + '在当地完成了常规集训，思维 +8、编程 +8、压力 +10';
  }
};

/* =========== 出境集训 · 意外事件（负面） =========== */

/**
 * 出门在外不可能事事顺心。
 * 每次出境集训有 OVERSEAS_INCIDENT_PROB 的概率发生一起"意外"，效果基本都是负面的；
 * 有较小的概率雪上加霜，直接连着来第二起。
 * 条目可选 countries 字段，只在指定国家 / 地区有机会发生。
 */
const OVERSEAS_INCIDENTS = [
  { name: '水土不服', weight: 12, apply: function(c){
      c.each(function(s){ c.pressure(s, 15); c.comfort(s, -15); });
      return '全队水土不服，上吐下泻，全员压力 +15、舒适度 -15';
  }},
  { name: '倒时差', weight: 10, apply: function(c){
      c.each(function(s){ c.mental(s, -8); c.pressure(s, 8); });
      return '时差没倒过来，白天犯困晚上精神，全员心理 -8、压力 +8';
  }},
  { name: '物价刺客', weight: 10, apply: function(c){
      var cost = c.uniformInt(6000, 16000);
      c.money(-cost);
      return '当地物价远超预算，一顿饭吃掉 ¥' + cost;
  }},
  { name: '行李丢失', weight: 8, apply: function(c){
      var s = c.pick();
      var cost = c.uniformInt(3000, 9000);
      c.money(-cost);
      c.comfort(s, -15);
      c.pressure(s, 12);
      return s.name + '的行李在转机时不知道飞去了哪里，重新置办花了 ¥' + cost + '（压力 +12、舒适度 -15）';
  }},
  { name: '被当地选手吊打', weight: 11, apply: function(c){
      var s = c.pick();
      c.pressure(s, 25); c.mental(s, -10); c.code(s, 5);
      return s.name + '被当地选手在训练赛里 4:0 带走，压力 +25、心理 -10（编程 +5，知耻后勇）';
  }},
  { name: '训练营临时取消', weight: 7, apply: function(c){
      var cost = c.uniformInt(8000, 15000);
      c.money(-cost);
      c.each(function(s){ c.pressure(s, 18); c.comfort(s, -10); });
      return '对方训练营临时取消，报名费 ¥' + cost + ' 打了水漂，全员压力 +18、舒适度 -10';
  }},
  { name: '食物中毒', weight: 7, apply: function(c){
      var s = c.pick();
      c.sick(s, 1);
      c.comfort(s, -20); c.pressure(s, 10);
      return s.name + '吃坏了肚子，病程 +1 周、舒适度 -20（压力 +10）';
  }},
  { name: '语言不通', weight: 8, apply: function(c){
      var s = c.pick();
      c.think(s, -6); c.pressure(s, 12);
      return s.name + '听不懂教练在讲什么，白白坐了一下午，思维 -6、压力 +12';
  }},
  { name: '想家了', weight: 8, apply: function(c){
      var s = c.pick();
      c.mental(s, -15); c.pressure(s, 12);
      return s.name + '半夜想家想哭了，心理 -15、压力 +12';
  }},
  { name: '网络不通', weight: 7, apply: function(c){
      c.each(function(s){ c.comfort(s, -10); c.pressure(s, 10); });
      return '住处网络时断时续，题库刷不动，全员舒适度 -10、压力 +10';
  }},
  { name: '通关卡壳', weight: 6, apply: function(c){
      var cost = c.uniformInt(2000, 6000);
      c.money(-cost);
      c.each(function(s){ c.pressure(s, 8); });
      return '入境手续卡了两天，滞留期间多花了 ¥' + cost + '，全员压力 +8';
  }},
  { name: '突降暴雨', weight: 7, apply: function(c){
      var s = c.pick();
      c.sick(s, 2); c.comfort(s, -15);
      return s.name + '在暴雨里淋透了，病程 +2 周、舒适度 -15';
  }},
  { name: '训练基地停电', weight: 6, apply: function(c){
      c.each(function(s){ c.code(s, -4); c.pressure(s, 10); });
      return '训练基地持续停电，敲不了代码，全员编程 -4、压力 +10';
  }},
  { name: '钱包被偷', weight: 5, apply: function(c){
      var s = c.pick();
      var cost = c.uniformInt(8000, 20000);
      c.money(-cost);
      c.mental(s, -12); c.pressure(s, 15);
      return s.name + '在地铁上被摸走了钱包，损失 ¥' + cost + '，心理 -12、压力 +15';
  }},
  /* ---------- 只在特定国家 / 地区发生的意外 ---------- */
  { name: '野生动物上门', weight: 6, countries: ['澳大利亚', '新西兰'], apply: function(c){
      var s = c.pick();
      c.sick(s, 2); c.comfort(s, -20); c.pressure(s, 15);
      return s.name + '被当地野生动物"热情招待"了一下，病程 +2 周、舒适度 -20、压力 +15';
  }},
  { name: '极端高温', weight: 6, countries: ['印度', '埃及', '沙特阿拉伯', '泰国', '印度尼西亚', '巴基斯坦'], apply: function(c){
      c.each(function(s){ c.pressure(s, 15); c.comfort(s, -15); });
      return '当地高温预警，训练馆像蒸笼，全员压力 +15、舒适度 -15';
  }},
  { name: '公共交通瘫痪', weight: 6, countries: ['法国', '意大利', '德国', '英国', '比利时'], apply: function(c){
      var cost = c.uniformInt(2000, 7000);
      c.money(-cost);
      c.each(function(s){ c.pressure(s, 10); c.comfort(s, -10); });
      return '当地公共交通大罢工，全靠两条腿走了三天，额外花掉 ¥' + cost + '，全员压力 +10、舒适度 -10';
  }}
];

function __pickOverseasIncident(countryName, excludeNames){
  var pool = OVERSEAS_INCIDENTS.filter(function(it){
    if(excludeNames && excludeNames.indexOf(it.name) >= 0) return false;
    if(it.countries && it.countries.length && it.countries.indexOf(countryName) < 0) return false;
    return true;
  });
  // 特定国家的条目更"稀有"：只在通用池之外额外参与抽取
  if(pool.length === 0) return null;
  var total = 0;
  pool.forEach(function(it){ total += Number(it.weight || 1); });
  var roll = Math.random() * total;
  for(var i = 0; i < pool.length; i++){
    roll -= Number(pool[i].weight || 1);
    if(roll <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

/**
 * 触发出境集训途中的意外事件（负面）。
 * @param {string} countryName 国家/地区名
 * @param {string[]} participantNames 参加集训的学生姓名
 * @returns {{count:number, text:string|null}} 发生了几起、以及合并后的文案
 */
function applyOverseasIncident(countryName, participantNames){
  try{
    if(typeof game === 'undefined' || !game) return { count: 0, text: null };
    var names = Array.isArray(participantNames) ? participantNames : [];
    var students = (game.students || []).filter(function(s){ return s && s.active && names.indexOf(s.name) >= 0; });
    if(students.length === 0) return { count: 0, text: null };

    var prob = (typeof OVERSEAS_INCIDENT_PROB !== 'undefined') ? Number(OVERSEAS_INCIDENT_PROB) : 0.4;
    if(!(Math.random() < prob)) return { count: 0, text: null };

    var happened = [];
    var texts = [];
    for(var round = 0; round < 2; round++){
      if(round === 1 && !(Math.random() < 0.15)) break; // 雪上加霜的概率很低
      var incident = __pickOverseasIncident(countryName, happened);
      if(!incident) break;
      happened.push(incident.name);
      var ctx = buildOverseasContext(students, null, countryName);
      var text = null;
      try{ text = incident.apply(ctx); }catch(e){ console.error('overseas incident failed', incident.name, e); }
      if(text){
        var full = '【意外 · ' + incident.name + '】' + text;
        texts.push(full);
        ctx.event('出境集训 · 意外：' + incident.name, full);
        ctx.log('[' + countryName + '·意外] ' + full);
      }
    }
    return { count: texts.length, text: texts.length ? texts.join('\n') : null };
  }catch(e){
    console.error('applyOverseasIncident failed for', countryName, e);
    return { count: 0, text: null };
  }
}

/**
 * 触发出境集训的国家专属效果。
 *
 * 注意：这是【按学生】触发的 —— 每名参加集训的学生各自独立掷一次骰子
 * （概率为 CHUJINGFAZHI），所以一次集训可能有好几个人分别遇到不同的事，
 * 也可能一个人都没遇上；而不是"整支队伍固定触发一次"。
 *
 * @param {string} countryName 国家/地区名
 * @param {string[]} participantNames 参加集训的学生姓名
 * @returns {string|null} 结果文案（多人的用换行连接）；若无参加者 / 无人触发则返回 null
 */
function applyOverseasCountryEffect(countryName, participantNames) {
  try {
    if (typeof game === 'undefined' || !game) return null;
    var names = Array.isArray(participantNames) ? participantNames : [];
    var students = (game.students || []).filter(function(s){ return s && s.active && names.indexOf(s.name) >= 0; });
    if (students.length === 0) return null;

    var effect = OVERSEAS_COUNTRY_EFFECTS[countryName] || OVERSEAS_COUNTRY_EFFECTS['__default__'];
    var perStudentProb = (typeof CHUJINGFAZHI !== 'undefined') ? Number(CHUJINGFAZHI) : 0.6;
    if (!(perStudentProb > 0)) return null;

    var texts = [];
    for (var i = 0; i < students.length; i++) {
      var s = students[i];
      if (perStudentProb < 1 && Math.random() >= perStudentProb) continue; // 每名学生各自掷骰
      var ctx = buildOverseasContext(students, s, countryName);
      var text = null;
      try { text = effect(ctx); } catch (e) { console.error('overseas country effect item failed', countryName, e); }
      if (text) {
        texts.push(text);
        ctx.event('出境集训 · ' + countryName, text);
        ctx.log('[' + countryName + '] ' + text);
      }
    }
    return texts.length ? texts.join('\n') : null;
  } catch (e) {
    console.error('applyOverseasCountryEffect failed for', countryName, e);
    return null;
  }
}

/* =========== 导出到全局 =========== */
if (typeof window !== 'undefined') {
  window.COUNTRIES = COUNTRIES;
  window.OVERSEAS_COUNTRY_EFFECTS = OVERSEAS_COUNTRY_EFFECTS;
  window.OVERSEAS_INCIDENTS = OVERSEAS_INCIDENTS;
  window.buildOverseasContext = buildOverseasContext;
  window.applyOverseasCountryEffect = applyOverseasCountryEffect;
  window.applyOverseasIncident = applyOverseasIncident;
  window.COUNTRY_PINYIN = COUNTRY_PINYIN;
  window.countryPinyin = countryPinyin;
}
