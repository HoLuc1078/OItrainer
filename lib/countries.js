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

/* =========== 出境集训 · 国家专属效果 =========== */

/**
 * 通用上下文工具。每个国家效果函数接收一个 ctx，并返回一句结果文案。
 * ctx 提供：
 *   pick()                   随机取一名参加集训的学生
 *   all() / each(fn)         全部参加集训的学生
 *   k(s, n)                  五类知识点同时 +n
 *   kt(s, type, n)           指定知识点 +n（type 为中文：数据结构/图论/字符串/数学/动态规划）
 *   think/code/mental(s, n)  思维 / 编程 / 心理 +n
 *   pressure(s, n)           压力 +n（自动夹在 0~100）
 *   comfort(s, n)            舒适度 +n（自动夹在 0~100）
 *   money(delta)             经费 +delta（可为负）
 *   talent(s, name, prob)    以 prob 概率授予天赋，返回是否授予成功
 *   event(name, desc)        推一张事件卡
 */
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
    if (c.talent(s, '蒙的全对', 0.08)) {
      return s.name + '在日本神秘资源丰富的夜里顿悟，压力清零，并觉醒隐藏天赋「蒙的全对」！';
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
      s.femaleTeamPath = true;
      try { s.name = s.name + '（女队）'; } catch (e) { }
      return s.name + '在泰国受到启发，走上了女队发展道路';
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
    if (c.talent(s, '时之沙漏', 0.08)) {
      return s.name + '在印度接了几天外包，数学 +20、编程 +5、收入 ¥' + income + '，并觉醒隐藏天赋「时之沙漏」！';
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
    if (c.talent(s, '算法之神', 0.08)) {
      return s.name + '在德国接受了刻板的严谨训练，思维 +15、数据结构 +10、压力 +15，并觉醒隐藏天赋「算法之神」！';
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
    if (c.talent(s, '心如止水', 0.08)) {
      return s.name + '在瑞士学会了极致的精准，编程 +12、数据结构 +8、压力 -5，并觉醒隐藏天赋「心如止水」！';
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
    if (c.talent(s, 'AK机器', 0.08)) {
      return s.name + '在台湾与当地选手交流，思维 +13、DP +12，并觉醒隐藏天赋「AK机器」！';
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

/**
 * 触发出境集训的国家专属效果。
 * @param {string} countryName 国家/地区名
 * @param {string[]} participantNames 参加集训的学生姓名
 * @returns {string|null} 结果文案；若无参加者则返回 null
 */
function applyOverseasCountryEffect(countryName, participantNames) {
  try {
    if (typeof game === 'undefined' || !game) return null;
    var names = Array.isArray(participantNames) ? participantNames : [];
    var students = (game.students || []).filter(function(s){ return s && s.active && names.indexOf(s.name) >= 0; });
    if (students.length === 0) return null;

    var effect = OVERSEAS_COUNTRY_EFFECTS[countryName] || OVERSEAS_COUNTRY_EFFECTS['__default__'];
    function clampPct(v){ v = Number(v) || 0; return v < 0 ? 0 : (v > 100 ? 100 : v); }
    var KNOWN_TYPES = { '数据结构': 'knowledge_ds', '图论': 'knowledge_graph', '字符串': 'knowledge_string', '数学': 'knowledge_math', '动态规划': 'knowledge_dp', 'DP': 'knowledge_dp' };

    var ctx = {
      uniformInt: function(a, b){ return (typeof uniformInt === 'function') ? uniformInt(a, b) : (a + Math.floor(Math.random() * (b - a + 1))); },
      pick: function(){ return students[Math.floor(Math.random() * students.length)]; },
      all: function(){ return students.slice(); },
      each: function(fn){ students.forEach(fn); },
      k: function(s, amount){
        if (!s) return;
        s.knowledge_ds = Number(s.knowledge_ds || 0) + amount;
        s.knowledge_graph = Number(s.knowledge_graph || 0) + amount;
        s.knowledge_string = Number(s.knowledge_string || 0) + amount;
        s.knowledge_math = Number(s.knowledge_math || 0) + amount;
        s.knowledge_dp = Number(s.knowledge_dp || 0) + amount;
      },
      kt: function(s, type, amount){
        if (!s) return;
        var key = KNOWN_TYPES[type] || type;
        if (typeof s[key] === 'undefined') return;
        s[key] = Number(s[key] || 0) + amount;
      },
      think: function(s, d){ if (s) s.thinking = Number(s.thinking || 0) + d; },
      code: function(s, d){ if (s) s.coding = Number(s.coding || 0) + d; },
      mental: function(s, d){ if (s) s.mental = clampPct(Number(s.mental || 0) + d); },
      pressure: function(s, d){ if (s) s.pressure = clampPct(Number(s.pressure || 0) + d); },
      comfort: function(s, d){ if (s) s.comfort = clampPct(Number(s.comfort || 0) + d); },
      money: function(delta){
        var g = (typeof game !== 'undefined' && game) ? game : null;
        if (!g) return;
        if (delta < 0) { try { if (g.recordExpense) g.recordExpense(-delta, '出境集训·当地开支'); else g.budget += delta; } catch (e) { g.budget += delta; } }
        else { g.budget += delta; }
      },
      talent: function(s, name, prob){
        if (!s || !name) return false;
        if (typeof s.hasTalent === 'function' && s.hasTalent(name)) return false;
        if (Math.random() >= (typeof prob === 'number' ? prob : 0.1)) return false;
        try { s.addTalent(name); } catch (e) { return false; }
        try { if (typeof window !== 'undefined' && window.pushEvent) window.pushEvent({ name: '天赋觉醒', description: s.name + ' 在出境集训中觉醒了天赋「' + name + '」！', week: game.week }); } catch (e) { }
        return true;
      },
      event: function(name, desc){ try { if (typeof window !== 'undefined' && window.pushEvent) window.pushEvent({ name: name, description: desc, week: game.week }); } catch (e) { } },
      log: function(msg){ try { if (typeof log === 'function') log(msg); } catch (e) { } }
    };

    var text = effect(ctx);
    if (text) {
      ctx.event('出境集训 · ' + countryName, text);
      ctx.log('[' + countryName + '] ' + text);
    }
    return text || null;
  } catch (e) {
    console.error('applyOverseasCountryEffect failed for', countryName, e);
    return null;
  }
}

/* =========== 导出到全局 =========== */
if (typeof window !== 'undefined') {
  window.COUNTRIES = COUNTRIES;
  window.OVERSEAS_COUNTRY_EFFECTS = OVERSEAS_COUNTRY_EFFECTS;
  window.applyOverseasCountryEffect = applyOverseasCountryEffect;
}
