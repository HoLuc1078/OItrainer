/* utils.js - 随机/辅助/名字生成函数
 *
 * ===========================================================================
 *  随机数约定（重要，改代码前先读这段）
 * ===========================================================================
 *  1. 【所有影响游戏进程的随机数必须走 getRandom()】，
 *     不要直接写 Math.random()。只有这样，"同样的种子 + 同样的操作" 才会得到
 *     完全一样的结果（每日挑战 / 种子分享 / 复盘都依赖这一点）。
 *
 *  2. 纯粹装饰性的随机（矩阵雨、随机一言、DOM id、动画抖动）**不要**走
 *     getRandom()：它们会在渲染时被调用，调用次数与玩家的操作无关，
 *     一旦消耗种子流就会让确定性失效。请用 getCosmeticRandom()。
 *
 *  3. 随机源 = 全局唯一的一个 SeededRandom 实例（_globalRng）。
 *     用 setRandomSeed(seed) 播种；种子保存在 game.randomSeed，
 *     运行中的状态快照保存在 game.rngState，这样存读档后随机流能接上。
 *
 *  4. 需要"局部可复现"的子计算时，用 withRandomSeed(seed, fn)，
 *     它会在 fn 执行期间临时换一个独立的随机源，结束后恢复原来的流。
 * ===========================================================================
 */

// ========== 可种子化的随机数生成器 ==========

/** xmur3：把任意字符串散列成 32bit 种子序列（用于把 seed 铺开成 sfc32 的四个状态字） */
function __xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

/** 把任意 seed（数字 / 字符串）转成稳定的字符串形式 */
function normalizeSeed(seed) {
  if (seed === undefined || seed === null) return null;
  if (typeof seed === 'number') {
    if (!isFinite(seed)) return String(seed);
    // 抹掉 -0 / 浮点误差，保证同一个数字永远得到同一个种子串
    return String(Math.trunc(seed));
  }
  return String(seed);
}

/**
 * 伪随机数生成器（sfc32 + xmur3 播种）
 *   - 同一个 seed 必然产出同一串随机数；
 *   - 支持 getState()/setState()，方便把随机流写进存档。
 * 当 seed === -1 时表示"显式要求使用原生 Math.random()"（仅用于彩蛋/调试）。
 */
class SeededRandom {
  constructor(seed) {
    // 当 seed === -1 时，表示显式要求使用原生 Math.random()
    this.useNative = (seed === -1);
    const normalized = normalizeSeed(seed);
    this.seed = (normalized === null) ? Date.now() : seed;
    this.seedKey = (normalized === null) ? String(Date.now()) : normalized;
    if (!this.useNative) {
      const seedFn = __xmur3('oitrainer:' + this.seedKey);
      this.s0 = seedFn();
      this.s1 = seedFn();
      this.s2 = seedFn();
      this.s3 = seedFn();
      // 预热：扔掉开头若干个输出，避免不同种子前几个数相关性过强
      for (let i = 0; i < 12; i++) this.next();
    }
  }

  next() {
    // 如果构造时选择了原生随机，则直接返回 Math.random()
    if (this.useNative) return Math.random();

    // sfc32
    let a = this.s0, b = this.s1, c = this.s2, d = this.s3;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = ((c << 21) | (c >>> 11));
    c = (c + t) | 0;
    this.s0 = a; this.s1 = b; this.s2 = c; this.s3 = d;
    return (t >>> 0) / 4294967296;
  }

  /** [min, max] 闭区间整数 */
  nextInt(min, max) {
    min = Math.ceil(min); max = Math.floor(max);
    if (max < min) { const t = min; min = max; max = t; }
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** 导出当前状态（可 JSON 序列化） */
  getState() {
    if (this.useNative) return { seed: -1, useNative: true };
    return { seed: this.seed, seedKey: this.seedKey, useNative: false, state: [this.s0 >>> 0, this.s1 >>> 0, this.s2 >>> 0, this.s3 >>> 0] };
  }

  /** 恢复状态（配合 getState 使用） */
  setState(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return false;
    if (snapshot.useNative) { this.useNative = true; return true; }
    if (!Array.isArray(snapshot.state) || snapshot.state.length !== 4) return false;
    this.useNative = false;
    if (snapshot.seed !== undefined && snapshot.seed !== null) this.seed = snapshot.seed;
    if (snapshot.seedKey !== undefined && snapshot.seedKey !== null) this.seedKey = snapshot.seedKey;
    this.s0 = snapshot.state[0] >>> 0;
    this.s1 = snapshot.state[1] >>> 0;
    this.s2 = snapshot.state[2] >>> 0;
    this.s3 = snapshot.state[3] >>> 0;
    return true;
  }
}

// 全局随机数生成器实例（全局唯一的"游戏随机源"）
let _globalRng = null;

// 设置全局种子（数字或字符串；-1 表示改用原生 Math.random；null/undefined 表示取消种子）
function setRandomSeed(seed) {
  if (seed !== null && seed !== undefined) {
    _globalRng = new SeededRandom(seed);
    if (seed === -1) {
      console.log('[Random] 已设置为使用原生 Math.random()（种子 -1）');
    } else {
      console.log(`[Random] 随机种子已设置: ${seed}`);
    }
  } else {
    _globalRng = null;
    console.log(`[Random] 使用默认随机数生成器`);
  }
  return _globalRng ? _globalRng.seed : null;
}

// 获取随机数（0-1之间）—— 游戏逻辑专用的唯一随机源
function getRandom() {
  if (_globalRng) {
    return _globalRng.next();
  }
  return Math.random();
}

/**
 * 纯装饰性的随机数：永远使用原生 Math.random()，**不消耗种子流**。
 * 适用于随机一言、DOM 随机 id、动画抖动等"不影响游戏结果"的地方。
 */
function getCosmeticRandom() {
  return Math.random();
}

/** 当前是否处于"可复现"的种子模式 */
function isSeededRandom() {
  return !!(_globalRng && !_globalRng.useNative);
}

/** 当前全局种子（未播种时返回 null） */
function getRandomSeed() {
  if (!_globalRng) return null;
  return _globalRng.seed;
}

/** 导出当前随机流状态（写存档用） */
function getRandomState() {
  if (!_globalRng) return null;
  return _globalRng.getState();
}

/**
 * 恢复随机流状态。若全局还没有随机源，会先用 snapshot.seed 播种。
 * @returns {boolean} 是否恢复成功
 */
function restoreRandomState(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (!_globalRng) {
    if (snapshot.seed === undefined || snapshot.seed === null) return false;
    setRandomSeed(snapshot.seed);
  }
  return _globalRng.setState(snapshot);
}

/**
 * 生成一个全新的随机种子（用于普通开局：每局不同，但局内可复现）
 * @param {number} max 上界（不含）
 */
function generateRandomSeed(max) {
  const bound = (typeof max === 'number' && max > 0) ? Math.floor(max) : 2147483647;
  return Math.floor(Math.random() * bound) + 1;
}

/**
 * 在一个独立的、临时的随机源里执行 fn，执行完恢复原来的随机流。
 * 用于"局部需要可复现"的计算，且不希望污染主随机流。
 */
function withRandomSeed(seed, fn) {
  const backup = _globalRng;
  let result;
  try {
    _globalRng = new SeededRandom(seed);
    result = fn();
  } finally {
    _globalRng = backup;
  }
  return result;
}

/** [min,max] 闭区间整数（getRandom 的语法糖） */
function randomInt(min, max) { return uniformInt(min, max); }

/** 从数组里等概率取一个 */
function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) return undefined;
  return list[Math.floor(getRandom() * list.length)];
}

/**
 * 按权重取一个元素。
 * @param {Array} items
 * @param {Function|string} weight 权重取值函数，或字段名
 */
function weightedPick(items, weight) {
  if (!Array.isArray(items) || items.length === 0) return undefined;
  const getW = (typeof weight === 'function') ? weight : (it) => Number((it && it[weight]) || 0);
  let total = 0;
  for (const it of items) { const w = Number(getW(it)) || 0; total += w > 0 ? w : 0; }
  if (total <= 0) return pickRandom(items);
  let roll = getRandom() * total;
  for (const it of items) {
    const w = Number(getW(it)) || 0;
    if (w <= 0) continue;
    roll -= w;
    if (roll <= 0) return it;
  }
  return items[items.length - 1];
}

function uniform(min, max){ return min + getRandom()*(max-min); }
function uniformInt(min, max){ return Math.floor(min + getRandom()*(max - min + 1)); }
function normal(mean=0, stddev=1){
  let u=0,v=0;
  while(u===0) u=getRandom();
  while(v===0) v=getRandom();
  let z=Math.sqrt(-2.0*Math.log(u))*Math.cos(2*Math.PI*v);
  return z*stddev + mean;
}
function clamp(val,min,max){ return Math.max(min,Math.min(max,val)); }
function clampInt(v,min,max){ return Math.max(min,Math.min(max,Math.round(v))); }
function sigmoid(x){ return 1.0 / (1.0 + Math.exp(-x)); }

/* ========== 今日挑战（每日挑战） ========== */

/** 把日期格式化成 YYYYMMDD（本地时区） */
function formatDateKey(date) {
  const d = date ? new Date(date) : new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * 由日期派生今日挑战的种子。
 * 所有玩家在同一天拿到同一个种子 —— 而且这个种子只跟日期有关，
 * 与"什么时候点开按钮"完全无关，所以是真正可比的。
 */
function getDailyChallengeSeed(dateKey) {
  const key = dateKey || formatDateKey();
  // 用独立随机源推导，避免污染（也避免依赖）当前游戏的随机流
  return withRandomSeed('oitrainer-daily-seed:' + key, function () {
    return Math.floor(getRandom() * 2147483646) + 1;
  });
}

/* 今日挑战：根据日期生成种子和挑战参数 */
function getDailyChallengeParams(dateInput) {
  const today = dateInput ? new Date(dateInput) : new Date();
  const dateStr = formatDateKey(today);

  // 同一个日期 → 同一个省份 + 同一个随机种子（全世界一致）
  return withRandomSeed('oitrainer-daily:' + dateStr, function () {
    const provinceCount = (typeof PROVINCES !== 'undefined' && PROVINCES) ? Object.keys(PROVINCES).length : 33;
    const provinceId = Math.floor(getRandom() * provinceCount) + 1;
    const gameSeed = getDailyChallengeSeed(dateStr);
    return {
      date: dateStr,
      provinceId: provinceId,
      difficulty: 2, // 固定普通难度
      seed: gameSeed,
      seedText: dateStr + '-' + gameSeed,
      displayDate: `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
    };
  });
}

/** 给玩家看的种子文本（分享 / 排障用） */
function describeRandomSeed(gameObj) {
  const g = gameObj || (typeof window !== 'undefined' ? window.game : null);
  if (!g) return '（无对局）';
  if (g.isDailyChallenge && g.dailyChallengeSeed) {
    return `今日挑战 ${g.dailyChallengeDate || ''} · 种子 ${g.dailyChallengeSeed}`;
  }
  if (g.randomSeed !== undefined && g.randomSeed !== null && g.randomSeed !== -1) {
    return `种子 ${g.randomSeed}`;
  }
  return '自由随机（未播种）';
}

function getLetterGradeAbility(val){
    return getLetterGrade(val / 2);
}

function getLetterGrade(val) {
  // 更细化的字母等级，包含带+的中间值。阈值略微上调以匹配数值显示
  // 等级（从低到高）： E, E+, D, D+, C, C+, B, B+, A, A+, S, S+, SS, SS+, SSS
  if (val < 8) return 'E';
  if (val < 16) return 'E+';
  if (val < 30) return 'D';
  if (val < 40) return 'D+';
  if (val < 50) return 'C';
  if (val < 60) return 'C+';
  if (val < 68) return 'B';
  if (val < 76) return 'B+';
  if (val < 82) return 'A';
  if (val < 88) return 'A+';
  if (val < 92) return 'S';
  if (val < 96) return 'S+';
  if (val < 99) return 'SS';
  if (val < 100) return 'SS+';
  // 保持 100 为 SSS，且在 100 之后扩展为不封顶的 U 级别：U1e ... U1sss, U2e ...
  const n = Math.floor(val);
  if (n === 100) return 'SSS';
  if (n > 100) {
    const subs = ['e','e+','d','d+','c','c+','b','b+','a','a+','s','s+','ss','ss+','sss'];
    const v = Number(val);
    // 保留 101-109 的向后兼容整数步进映射（原有行为）
    if (v > 100 && v < 110) {
      const offset = n - 101; // 0-based offset after 100
      const tier = Math.floor(offset / subs.length) + 1;
      const idx = offset % subs.length;
      return `U${tier}${subs[idx]}`;
    }
    // 从 110 起，每个 100 的区间对应 U1, U2, U3...，区间内按 subs 均匀映射
    if (v >= 110) {
      const tier = Math.floor((v - 110) / 100) + 1; // 110-209.999 -> tier 1, 210-309.999 -> tier 2
      const rangeStart = 110 + (tier - 1) * 100;
      const rel = (v - rangeStart) / 100.0; // [0,1)
      let idx = Math.floor(rel * subs.length);
      if (idx < 0) idx = 0;
      if (idx >= subs.length) idx = subs.length - 1;
      return `U${tier}${subs[idx]}`;
    }
    // 兜底：保留原有按整数步进的映射
    const offset = n - 101;
    const tier = Math.floor(offset / subs.length) + 1;
    const idx = offset % subs.length;
    return `U${tier}${subs[idx]}`;
  }
  return 'SSS';
}

/* 名字生成 */
const surnames = [
  "张","李","王","刘","陈","杨","黄","赵","周","吴",
  "徐","孙","马","朱","胡","郭","何","林","罗","高",
  "梁","宋","郑","谢","韩","唐","冯","于","董","萧","曹",
  "潘","袁","许","曾","蒋","蔡","余","杜","叶","程",
  "苏","魏","吕","丁","任","沈","姚","卢","姜","崔"
];

const compoundSurnames = [
  "欧阳","司马","上官","诸葛","卢石","赫连","尉迟","慕容",
  "公孙","长孙","夏侯","闻人","皇甫","澹台","尉氏"
];

const namesPool = [
  "伟","刚","勇","毅","俊","峰","强","军","平","保",
  "东","文","辉","力","明","永","健","世","广","志",
  "义","兴","良","海","山","仁","波","宁","贵","福",
  "生","龙","元","全","国","胜","学","祥","才","发",
  "武","新","利","清","飞","彬","富","顺","信","杰",
  "涛","昌","成","康","星","光","天","达","安","岩",
  "中","茂","进","林","有","坚","和","彪","博","诚",
  "先","敬","震","振","壮","会","思","群","豪","心",
  "邦","承","乐","绍","功","松","善","厚","庆","民",
  "友","裕","河","哲","江","超","浩","亮","政","谦",
  "亨","奇","固","之","翰","朗","伯","宏","言","鸣",
  "朋","斌","梁","栋","维","启","克","伦","翔","旭",
  "鹏","泽","晨","辰","士","建","家","致","树","炎",
  "德","行","时","泰","盛","雄","琛","钧","冠","策",
  "腾","楠","榕","岳","然","煜","鑫","骏","宸","珩",
  "骁","恒","博","尧","奕","澄","峻","逸","尘","晟",
  "烨","翎","晗","卓","麟","皓","煦","栩","瀚","燊",
  "烁","霖","屹","骞","嵩","澜","漾","渊","峥","祺",
  "淞","珺","珞","瑜","瑾","琨","铠","铭","锴","锋",
  "铎","锐","剑","戎","霆","震","骢","骥","昊","煊",
  "炜","昱","曜","桦","槐","栋","森","澔","淳","湛",
  "涵","灿","焱","燎","炎","尧","哲","航","睿","凯",
  "琪","澔","玮","珂","洺","源","湧","鸣","俊","煜",
  "翰","云","哲","诚","邦","尘","恒","鸣","渊","森",
  "桓","泽","弘","川","渝","岳","帆","栋","弈","奇",
  "锐","琪","嵩","铠","恺","诚","轩","峰","晟","远",
  "铭","凯","炜","煜","杰","烽","志","朗","逸","骞",
  "宸","烨","骁","尧","腾","珩","霖","泽","航","瑞",
  "煊","岳","麟","博","晗","昀","嘉","澄","桦","骅",
  "澜","然","尘","奕","翰","栩","祺","瑜","珺","骏",
  "峻","晟","尧","钧","骋","锐","承","炎","帆","弘"
];


// 少数民族姓名池
const minorityPools = {
  '西藏': {
    // 藏族名字多为2-3个音节，有固定搭配
    fullNames: [
      "扎西多吉", "次仁旺堆", "丹增旺姆", "洛桑次仁", "强巴赤列",
      "贡布扎西", "索朗卓玛", "才让卓玛", "尼玛次仁", "普布次仁",
      "德吉卓玛", "白玛旺杰", "格桑次仁", "央金拉姆", "达瓦次仁",
      "次仁卓嘎", "扎西平措", "洛桑江村", "丹增曲扎", "贡觉次旦",
      "旺堆次仁", "尼玛扎西", "白玛曲珍", "格桑德吉", "次仁罗布",
      "扎西顿珠", "强巴格列", "德庆卓玛", "普布顿珠", "边巴次仁",
      "曲珍卓玛", "洛桑平措", "次仁德吉", "扎西旺堆", "才旦卓玛"
    ]
  },
  '新疆': {
    // 维吾尔族名字分男女，常见结构：本名（1-2词），不用姓
    uyghurNames: [
      "阿迪力", "艾力", "买买提", "阿不都热依木", "努尔买买提",
      "古丽娜尔", "热依汗", "阿依努尔", "帕提古丽", "伊明江",
      "图尔逊", "麦麦提", "赛比热", "阿布都卡德尔", "玉素甫",
      "阿布都拉", "阿不都克里木", "艾合买提", "古丽巴哈尔", "热娜古丽",
      "阿依夏木", "木合塔尔", "努尔艾力", "阿曼尼莎", "库尔班",
      "古丽仙", "阿布都热合曼", "赛福鼎", "哈丽旦", "依明尼亚孜",
      "买买提明", "阿依古丽", "帕尔哈提", "热合曼", "吐尔逊娜依"
    ],
    // 哈萨克族（新疆北部）
    kazakhNames: [
      "叶尔肯", "巴合提", "阿依波力", "加那尔", "努尔兰",
      "萨吾列", "卡米拉", "阿娜尔", "别克江", "阿依努尔",
      "努尔别克", "叶尔扎提", "阿尔达克", "玛依拉", "赛力克",
      "古丽娜孜", "哈依沙", "阿斯卡尔", "库力江", "阿依达娜",
      "布尔兰", "阿克江", "沙娜", "托合塔尔", "达列力汗",
      "巴合提江", "古丽孜娜", "阿勒腾", "叶尔兰", "赛依娜"
    ],
  },
  '内蒙古': {
    // 蒙古族：部分有汉化姓（如包、白、乌），部分无姓
    mongolianWithSurname: [
      "巴特尔", "那日松", "乌云其其格", "包志强", "白图雅",
      "乌兰巴特", "额尔敦", "苏和", "宝音", "其木格",
      "包海燕", "白嘎达", "乌力吉", "那顺", "宝音达来",
      "苏日娜", "额尔德尼", "孟和", "朝鲁", "乌日娜",
      "包玉山", "白秀兰", "乌云格日乐", "那顺乌力吉", "宝音其其格",
      "苏雅拉", "额尔敦巴特", "孟根", "朝克", "乌仁其木格"
    ],
    mongolianWithoutSurname: [
      "成吉思", "呼和", "巴音", "嘎达梅林", "朝鲁",
      "阿拉坦", "乌力吉", "娜仁", "孟和", "达来",
      "巴雅尔", "赛音", "其木德", "额尔敦", "敖登",
      "特木尔", "乌兰", "其其格", "宝力德", "哈斯巴根",
      "斯琴", "高娃", "伊德", "那顺", "呼格吉乐",
      "巴特尔苏和", "呼和巴特", "阿拉坦仓", "达木林", "赛罕"
    ],
    // 蒙古姓氏（汉化后使用）
    surnames: ["包", "白", "乌", "那", "宝", "苏", "额", "图", "朝", "孟",
              "敖", "达", "巴", "哈", "云", "胡", "特", "呼", "斯", "高"]
  }
};

/**
 * 生成少数民族名字（合理结构）
 */
function generateMinorityName(region) {
  const pool = minorityPools[region];
  if (!pool) return null;

  if (region === '西藏') {
    return pool.fullNames[uniformInt(0, pool.fullNames.length - 1)];
  }

  if (region === '新疆') {
    const r = getRandom();
    if (r < 0.7) {
      return pool.uyghurNames[uniformInt(0, pool.uyghurNames.length - 1)];
    } else {
      return pool.kazakhNames[uniformInt(0, pool.kazakhNames.length - 1)];
    }
  }

  if (region === '内蒙古') {
    if (getRandom() < 0.6) {
      // 60% 带汉化姓（更符合现代城市/官方登记习惯）
      const surname = pool.surnames[uniformInt(0, pool.surnames.length - 1)];
      const given = pool.mongolianWithSurname[uniformInt(0, pool.mongolianWithSurname.length - 1)];
      return surname + given;
    } else {
      // 40% 用传统无姓名
      return pool.mongolianWithoutSurname[uniformInt(0, pool.mongolianWithoutSurname.length - 1)];
    }
  }

  return null;
}

/**
 * 主生成函数
 */
function generateName(opts = {}) {
  const region = opts.region || null;

  // 1. 小概率复姓（2%）
  if (getRandom() < 0.02) {
    const cs = compoundSurnames[uniformInt(0, compoundSurnames.length - 1)];
    let n = namesPool[uniformInt(0, namesPool.length - 1)];
    if (getRandom() > 0.4) n += namesPool[uniformInt(0, namesPool.length - 1)];
    return cs + n;
  }

  // 2. 少数民族名字概率（按地区调整）
  let minorityProb = 0.005; // 全国默认
  if (region === '西藏') minorityProb = 0.9;
  else if (region === '新疆') minorityProb = 0.6;
  else if (region === '内蒙古') minorityProb = 0.3;

  if (getRandom() < minorityProb) {
    const name = generateMinorityName(region);
    if (name) return name;
  }

  // 3. 默认汉族名字
  const s = surnames[uniformInt(0, surnames.length - 1)];
  let n = namesPool[uniformInt(0, namesPool.length - 1)];
  if (getRandom() > 0.4) n += namesPool[uniformInt(0, namesPool.length - 1)];
  return s + n;
}

/**
 * 生成不重复的名字
 * @param {Object} opts - 选项参数
 * @param {string} opts.region - 地区名称（用于生成特定地区的名字）
 * @param {Array<string>} opts.existingNames - 已存在的名字列表
 * @param {number} opts.maxRetries - 最大重试次数，默认 100
 * @returns {string} 生成的不重复名字
 */
function generateUniqueName(opts = {}) {
  const region = opts.region || null;
  const existingNames = opts.existingNames || [];
  const maxRetries = opts.maxRetries || 100;
  
  // 如果没有已存在的名字，直接生成
  if (!Array.isArray(existingNames) || existingNames.length === 0) {
    return generateName({ region });
  }
  
  // 将已存在的名字转换为 Set 以提高查找效率
  const nameSet = new Set(existingNames);
  
  // 尝试生成不重复的名字
  for (let i = 0; i < maxRetries; i++) {
    const name = generateName({ region });
    if (!nameSet.has(name)) {
      return name;
    }
  }
  
  // 如果重试多次仍然重复，添加数字后缀确保唯一性
  let baseName = generateName({ region });
  let counter = 2;
  while (nameSet.has(baseName)) {
    baseName = generateName({ region });
    if (counter > maxRetries) break; // 防止无限循环
    counter++;
  }
  
  // 如果还是重复，强制添加后缀
  if (nameSet.has(baseName)) {
    counter = 2;
    let uniqueName = `${baseName}${counter}`;
    while (nameSet.has(uniqueName)) {
      counter++;
      uniqueName = `${baseName}${counter}`;
    }
    return uniqueName;
  }
  
  return baseName;
}