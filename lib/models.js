/* models.js - Student / Facilities / GameState / competitions 构建 */
// 依赖：constants.js, utils.js

/**
 * 天赋增减的统计埋点。
 * 只记录数字，不参与任何随机判定，因此不会破坏"同种子同结果"的可复现性。
 */
function __trackTalentEvent(key, student, talentName){
  try{
    const g = (typeof window !== 'undefined' && window.game) ? window.game : null;
    if(!g || !g.stats) return;
    g.stats[key] = Number(g.stats[key] || 0) + 1;
    if(key === 'talentGains'){
      if(!Array.isArray(g.stats.talentGainLog)) g.stats.talentGainLog = [];
      if(g.stats.talentGainLog.length < 50) g.stats.talentGainLog.push({ name: talentName, student: student && student.name, week: Number(g.week || 0) });
    }
  }catch(e){ /* 统计失败绝不能影响游戏 */ }
}

class Student {
  constructor(name,thinking,coding,mental){
    this.name=name; 
    // 基础属性（永久值）
    this._base_thinking=thinking; 
    this._base_coding=coding; 
    this._base_mental=mental;
    
    // 临时增益系统：存储比赛/模拟赛中的临时修改
    this._temp_modifiers = {
      thinking: 0,
      coding: 0,
      mental: 0,
      knowledge_ds: 0,
      knowledge_graph: 0,
      knowledge_string: 0,
      knowledge_math: 0,
      knowledge_dp: 0,
      constmental: 0  // 比赛中的临时心理值修正
    };
    
    // 兼容性：提供 getter/setter 让外部代码无感知
    Object.defineProperty(this, 'thinking', {
      get: () => this._base_thinking + (this._temp_modifiers.thinking || 0),
      set: (val) => { this._base_thinking = val; },
      enumerable: true
    });
    Object.defineProperty(this, 'coding', {
      get: () => this._base_coding + (this._temp_modifiers.coding || 0),
      set: (val) => { this._base_coding = val; },
      enumerable: true
    });
    Object.defineProperty(this, 'mental', {
      get: () => this._base_mental + (this._temp_modifiers.mental || 0),
      set: (val) => { this._base_mental = val; },
      enumerable: true
    });
    
    // talents: 特质/技能列表（Set of strings）
    // 预留接口：TalentManager 可以注册具体特质的触发逻辑，游戏事件/比赛等可调用 student.triggerTalents(eventName, ctx)
    this.talents = new Set();
  this.knowledge_ds = KNOWLEDGE_ABLILTY_START;
  this.knowledge_graph = KNOWLEDGE_ABLILTY_START;
  this.knowledge_string = KNOWLEDGE_ABLILTY_START;
  this.knowledge_math = KNOWLEDGE_ABLILTY_START;
  this.knowledge_dp = KNOWLEDGE_ABLILTY_START;
    this.pressure=20; this.comfort=50;
    // 事件产生的临时修正值（会在每周自动衰减）
    this.comfort_modifier = 0;
    this.pressure_modifier = 0;
    this.burnout_weeks=0; this.depression_count=0; this.high_pressure_weeks=0;
    this.active=true; this.sick_weeks=0;
  }
  
  // 临时增益管理方法
  applyTempModifier(attribute, value) {
    if(this._temp_modifiers && typeof this._temp_modifiers[attribute] !== 'undefined'){
      this._temp_modifiers[attribute] = value;
    }
  }
  
  clearTempModifiers() {
    if(this._temp_modifiers){
      for(const key in this._temp_modifiers){
        this._temp_modifiers[key] = 0;
      }
    }
    // 同时清理旧的备份系统
    this._talent_backup = {};
    this._talent_state = {};
  }
  
  getTempModifier(attribute) {
    return this._temp_modifiers ? (this._temp_modifiers[attribute] || 0) : 0;
  }
  getAbilityAvg(){ return (this.thinking + this.coding + this.mental)/3.0; }
  getKnowledgeTotal(){ return (this.knowledge_ds + this.knowledge_graph + this.knowledge_string + this.knowledge_math + this.knowledge_dp)/5.0; }
  getComprehensiveAbility(){
    // 更明确地把思维/编码/心理分开加权：思维和编码对解题能力贡献更大，心理为稳定性维度
    const thinking = Number(this.thinking || 0);
    const coding = Number(this.coding || 0);
    const mental = Number(this.mental || 0);
    // weights: thinking 55% of ability part, coding 35%, mental 10%
    const abilityPart = thinking * 0.55 + coding * 0.35 + mental * 0.10;
    const knowledge_total = this.getKnowledgeTotal();
    return ABILITY_WEIGHT * abilityPart + KNOWLEDGE_WEIGHT * knowledge_total;
  }
  getMentalIndex(){
    let noise = normal(0,3.0);
    // 使用临时增益系统：基础值 + 临时增益中的 constmental 修正
    const mentalBase = this._base_mental + (this._temp_modifiers.constmental || 0);
    let result = mentalBase - ALPHA1*(this.pressure/100.0)*(1 - this.comfort/100.0) + noise;
    return clamp(result,0,100);
  }
  getPerformanceScore(difficulty,maxScore,knowledge_value){
    let comprehensive = this.getComprehensiveAbility();
    let mental_idx = this.getMentalIndex();
    
    // 知识点门槛机制（与新比赛引擎保持一致）
    const knowledgeRequirement = Math.max(15, difficulty * 0.35);
    let knowledgePenalty = 1.0;
    if(knowledge_value < knowledgeRequirement){
      const knowledgeGap = knowledgeRequirement - knowledge_value;
      knowledgePenalty = Math.exp(-knowledgeGap / 15.0);
      knowledgePenalty = Math.max(0.05, knowledgePenalty);
    }
    
    // 降低知识点直接加成（从2.0降至0.5，与新引擎保持一致）
    let knowledge_bonus = knowledge_value * 0.5;
    let effective_ability = comprehensive + knowledge_bonus;
    let performance_ratio = sigmoid((effective_ability - difficulty)/10.0);
    
    // 应用知识点门槛惩罚（乘性效果）
    performance_ratio = performance_ratio * knowledgePenalty;
    
    let stability_factor = mental_idx/100.0;
    let base_noise = 0.05;
    let sigma_performance = (100 - mental_idx)/200.0 + base_noise;
    let random_factor = normal(0, sigma_performance);
    let final_ratio = performance_ratio * stability_factor * (1 + random_factor);
    final_ratio = clamp(final_ratio,0,1);
    return Math.max(0, final_ratio * maxScore);
  }
  calculateKnowledgeGain(base_gain, facility_bonus, sick_penalty){
    let learning_efficiency = (0.6*(this.thinking/100.0) + 0.4)*(1.0 - this.pressure / FATIGUE_FROM_PRESSURE);
    return Math.floor(base_gain * learning_efficiency * facility_bonus * sick_penalty);
  }
  getKnowledgeByType(type){
    // 把比赛中的临时知识点加成（天赋写入 _temp_modifiers）一并计入，
    // 否则「伽罗瓦 / 爆发型 / 珂朵莉」等天赋的知识点效果会被静默丢弃。
    const tm = this._temp_modifiers || {};
    if(type==='数据结构') return this.knowledge_ds + (tm.knowledge_ds || 0);
    if(type==='图论') return this.knowledge_graph + (tm.knowledge_graph || 0);
    if(type==='字符串') return this.knowledge_string + (tm.knowledge_string || 0);
    if(type==='数学') return this.knowledge_math + (tm.knowledge_math || 0);
    if(type==='DP' || type==='动态规划') return this.knowledge_dp + (tm.knowledge_dp || 0);
    return 0;
  }
  addKnowledge(type,amount){
    // 安全检查：单次增幅上限100点（防止异常值导致的爆炸性增长）
    const safeAmount = Math.min(Math.max(0, amount), 100);
    
    if(safeAmount !== amount && Math.abs(amount) > 0.01){
      console.warn(`[addKnowledge] 学生${this.name} 知识点增幅异常: type=${type}, 原值=${amount}, 限制后=${safeAmount}`);
    }
    
    if(type==='数据结构') this.knowledge_ds += safeAmount;
    else if(type==='图论') this.knowledge_graph += safeAmount;
    else if(type==='字符串') this.knowledge_string += safeAmount;
    else if(type==='数学') this.knowledge_math += safeAmount;
    else if(type==='DP' || type==='动态规划') this.knowledge_dp += safeAmount;
  }
  // 统一接口：为思维/代码提供受控增幅方法
  // 规则：当目标属性（thinking 或 coding）大于阈值（400）时，对增幅进行衰减。
  // 衰减函数使用简单比例：mult = Math.min(1, 400 / currentValue)
  // 这样 current=400 时 mult=1（无衰减），current越大衰减越明显。保证不会出现负增幅。
  addThinking(amount){
    if(typeof amount !== 'number' || Math.abs(amount) < 1e-9) return;
    const cur = Number(this.thinking || 0);
    let mult = 1.0;
    if(typeof ABILITY_DECAY_THRESHOLD !== 'undefined' && cur > ABILITY_DECAY_THRESHOLD){ mult = Math.min(1.0, ABILITY_DECAY_THRESHOLD / cur); }
    else if(typeof ABILITY_DECAY_THRESHOLD === 'undefined' && cur > 400){ mult = Math.min(1.0, 400.0 / cur); }
    const applied = amount * mult;
    this.thinking = cur + applied;
  }
  addCoding(amount){
    if(typeof amount !== 'number' || Math.abs(amount) < 1e-9) return;
    const cur = Number(this.coding || 0);
    let mult = 1.0;
    if(typeof ABILITY_DECAY_THRESHOLD !== 'undefined' && cur > ABILITY_DECAY_THRESHOLD){ mult = Math.min(1.0, ABILITY_DECAY_THRESHOLD / cur); }
    else if(typeof ABILITY_DECAY_THRESHOLD === 'undefined' && cur > 400){ mult = Math.min(1.0, 400.0 / cur); }
    const applied = amount * mult;
    this.coding = cur + applied;
  }
  /* ---------- 身份 / 展示 ---------- */
  // 女队身份只作为「标签」，绝不改动 this.name —— 名字是学生的身份键，
  // 晋级资格、比赛履历等都是按名字索引的，改名会让这个"人"凭空消失。
  getTeamTag(){ return this.femaleTeamPath ? '女队' : ''; }
  getDisplayName(){ return this.name + (this.femaleTeamPath ? '（女队）' : ''); }

  /* ---------- Talent 接口 ---------- */
  addTalent(talentName){
    const isNew = !this.talents.has(talentName);
    this.talents.add(talentName);
    // 统计：天赋获得 / 失去（供隐藏成就使用；与随机数无关，不会影响可复现性）
    if(isNew) __trackTalentEvent('talentGains', this, talentName);
    return isNew;
  }
  removeTalent(talentName){
    const had = this.talents.has(talentName);
    this.talents.delete(talentName);
    if(had) __trackTalentEvent('talentLosses', this, talentName);
    return had;
  }
  hasTalent(talentName){ return this.talents.has(talentName); }
  // 触发学生的特质（由外部事件/比赛调用）
  // eventName: 字符串标识事件类型；ctx: 可选上下文对象
  // 返回：天赋触发结果数组 [{talent: '天赋名', result: '描述'}]
  triggerTalents(eventName, ctx){
    // 若存在全局 TalentManager，交由其处理；否则简单遍历并尝试调用全局注册的处理器
    try{
      // debug hook (set window.__OI_DEBUG_TALENTS = true to enable)
      try{ if(typeof window !== 'undefined' && window.__OI_DEBUG_TALENTS) console.debug(`[TALENT DEBUG] triggerTalents called for ${this.name} event=${eventName} ctx=`, ctx); }catch(e){}
      if(typeof window !== 'undefined' && window.TalentManager && typeof window.TalentManager.handleStudentEvent === 'function'){
        const results = window.TalentManager.handleStudentEvent(this, eventName, ctx);
        try{ if(typeof window !== 'undefined' && window.__OI_DEBUG_TALENTS) console.debug(`[TALENT DEBUG] TalentManager returned for ${this.name}:`, results); }catch(e){}
        return results || []; // 返回天赋触发结果
      }
      // fallback: 如果没有 TalentManager，则查找 window._talentHandlers（保留兼容）
      if(typeof window !== 'undefined' && window._talentHandlers){
        const results = [];
        for(const t of this.talents){
          const h = window._talentHandlers[t];
          if(typeof h === 'function'){
            try{ 
              const res = h(this, eventName, ctx); 
              try{ if(typeof window !== 'undefined' && window.__OI_DEBUG_TALENTS) console.debug(`[TALENT DEBUG] handler ${t} returned for ${this.name}:`, res); }catch(e){}
              if(res) results.push({talent: t, result: res});
            }catch(e){ console.error('talent handler error', e); }
          }
        }
        try{ if(typeof window !== 'undefined' && window.__OI_DEBUG_TALENTS) console.debug(`[TALENT DEBUG] aggregated results for ${this.name}:`, results); }catch(e){}
        return results;
      }
    }catch(e){ console.error('triggerTalents error', e); }
    return [];
  }
}

// Facilities 类已迁移至 lib/facilities.js

class GameState {
  constructor(){
    this.students=[];
    this.facilities=new Facilities();
    this.budget=100000;
    this.week=1;
    this.reputation=50;
    this.temperature=20;
    this.weather="晴";
    this.province_name="";
    this.province_type="";
    this.is_north=false;
    this.difficulty=2;
    this.base_comfort=50;
    this.initial_students=0;
    this.quit_students=0;
    this.had_good_result_recently=false;
    this.weeks_since_entertainment=0;
    this.weeks_since_good_result=0;
    this.noi_rankings=[];
    this.qualification = [ {}, {} ];
    for(let name of COMPETITION_ORDER){ this.qualification[0][name] = new Set(); this.qualification[1][name] = new Set(); }
    this.seasonEndTriggered = false;
    this.completedCompetitions = new Set();
    this.careerCompetitions = [];
    // 累计消费金额跟踪
    this.totalExpenses = 0;
    // 隐藏成就（存 id 数组）与统计计数
    this.hiddenAchievements = [];
    this.stats = {
      /* ---- 出境集训 ---- */
      overseasTrips: 0,
      overseasCountries: [],
      overseasFailures: 0,
      maxOverseasCost: 0,
      maxIncidentsInTrip: 0,
      maxHiddenTalentsOnOneStudent: 0,
      /* ---- 行动次数 ---- */
      trainings: 0,
      extraTrainings: 0,
      works: 0,
      entertainments: 0,
      mockContests: 0,
      outings: 0,
      talks: 0,
      /* ---- 天赋 ---- */
      talentGains: 0,
      talentLosses: 0,
      talentGainLog: [],
      /* ---- 经营 ---- */
      maxBudget: 0,
      minBudget: null,
      totalEarned: 0,
      maxReputation: 50,
      /* ---- 心态 / 队伍 ---- */
      maxPressureSeen: 0,
      quitTendencies: 0,
      rescues: 0,
      evictions: 0,
      sicknesses: 0,
      /* ---- 比赛 ---- */
      contestsPlayed: 0,
      perfectScores: 0,
      goldMedals: 0,
      silvers: 0,
      bronzes: 0,
      ioiFullScores: 0,
      firstPlaces: 0,
      /* ---- 结局 ---- */
      bankruptEnding: false,
      badEnding: false,
      seasonFinished: false
    };

    /* ---- 随机数：种子与随机流快照 ----
     * randomSeed 是本局种子；rngState 是运行中的随机流快照（写存档时刷新）。
     * 只要两者都在，"同样的种子 + 同样的操作" 就能复现同样的结果。
     */
    this.randomSeed = null;
    this.rngState = null;
  // teaching_points 已弃用，保留向后兼容性字段已移除
  }

  /* ---------- 统计辅助（供隐藏成就读取） ---------- */

  /** 读一个统计值 */
  stat(key, fallback) {
    if (!this.stats || typeof this.stats !== 'object') this.stats = {};
    const v = this.stats[key];
    return (v === undefined || v === null) ? fallback : v;
  }

  /** 累加一个统计值（并返回累加后的值） */
  bumpStat(key, delta) {
    if (!this.stats || typeof this.stats !== 'object') this.stats = {};
    const next = Number(this.stats[key] || 0) + Number(delta === undefined ? 1 : delta);
    this.stats[key] = next;
    return next;
  }

  /** 记录历史最大值 */
  maxStat(key, value) {
    if (!this.stats || typeof this.stats !== 'object') this.stats = {};
    const cur = Number(this.stats[key] || 0);
    const next = Math.max(cur, Number(value || 0));
    this.stats[key] = next;
    return next;
  }

  /** 记录历史最小值（首次写入时直接采用） */
  minStat(key, value) {
    if (!this.stats || typeof this.stats !== 'object') this.stats = {};
    const cur = this.stats[key];
    const v = Number(value || 0);
    if (cur === undefined || cur === null || !isFinite(Number(cur))) { this.stats[key] = v; return v; }
    const next = Math.min(Number(cur), v);
    this.stats[key] = next;
    return next;
  }

  /** 打一个一次性的布尔标记 */
  flagStat(key, value) {
    if (!this.stats || typeof this.stats !== 'object') this.stats = {};
    if (value === undefined) this.stats[key] = true;
    else this.stats[key] = value;
    return this.stats[key];
  }
  getWeatherFactor(){
    let extreme_temp = (this.temperature < EXTREME_COLD_THRESHOLD || this.temperature > EXTREME_HOT_THRESHOLD);
    if(!extreme_temp) return 1.0;
    /* 委托给设施系统：根据电扇/空调等级返回不同的天气压力因子 */
    return this.facilities.getWeatherFactor();
  }
  getComfort(){
    let comfort = this.base_comfort;
    /* 设施舒适度加成（电扇 + 空调） */
    comfort += this.facilities.getComfortBonus();
    let weather_penalty = 0;
    if(this.temperature < EXTREME_COLD_THRESHOLD || this.temperature > EXTREME_HOT_THRESHOLD){
      weather_penalty = this.facilities.getWeatherPenalty();
    }
    return clamp(comfort - weather_penalty, 0, 100);
  }
  getWeeklyCost(){
    // treat student as active unless explicitly set to false (backwards compatible)
    let active_count = Array.isArray(this.students) ? this.students.filter(s => s && s.active !== false).length : 0;
    return 1000 + 50*active_count + this.facilities.getMaintenanceCost();
  }
  getDifficultyModifier(){ if(this.difficulty===1) return 0.9; if(this.difficulty===3) return 1.1; return 1.0; }
  getNextCompetition(){ if(Array.isArray(competitions) && competitions.length > 0){ const sorted = competitions.slice().sort((a, b) => a.week - b.week); const next = sorted.find(c => c.week > this.week); if(next){ let weeks_left = next.week - this.week; return next.name + ` (还有${weeks_left}周)`; } } return "无"; }
  updateWeather(){
    // 使用独立的 climate.js 模块获取当前天气
    // 周数→季节映射保持不变（9月开学=第1周，每学年16周，共32周）
    try{
      const provinceName = this.province_name || '';
      // 规范化省份名：去除"省/市/自治区/特别行政区"后缀
      let name = String(provinceName).replace(/(省|市|自治区|特别行政区)/g, '').trim();

      const result = determineWeather(name, this.week);
      this.temperature = result.temperature;
      this.weather = result.weather;
      this.season = result.season;
    }catch(e){
      // fallback: 使用旧版简化模型
      const weekInYear = ((this.week - 1) % 16) + 1;
      if(weekInYear >= 1 && weekInYear <= 4){
        if(this.is_north) this.temperature = uniform(5,20);
        else this.temperature = uniform(15,28);
        this.season = 'autumn';
      } else if(weekInYear >= 5 && weekInYear <= 8){
        if(this.is_north) this.temperature = uniform(-10,5);
        else this.temperature = uniform(5,15);
        this.season = 'winter';
      } else if(weekInYear >= 9 && weekInYear <= 12){
        if(this.is_north) this.temperature = uniform(8,22);
        else this.temperature = uniform(18,28);
        this.season = 'spring';
      } else {
        if(this.is_north) this.temperature = uniform(20,32);
        else this.temperature = uniform(25,35);
        this.season = 'summer';
      }
      let roll = getRandom();
      if(roll < 0.65) this.weather="晴";
      else if(roll < 0.80) this.weather="阴";
      else if(roll < 0.93) this.weather="雨";
      else this.weather="雪";
    }
  }
  getFutureExpense(){ const weekly = this.getWeeklyCost(); const activeCount = Array.isArray(this.students) ? this.students.filter(s => s && s.active !== false).length : 0; const mult = activeCount * 0.3; return Math.round(weekly * 4 * mult); }
  getExpenseMultiplier(){ try{ const activeCount = Array.isArray(this.students) ? this.students.filter(s => s && s.active !== false).length : 0; return Math.max(0, activeCount * 0.3); }catch(e){ return 1.0; } }
  getWeatherDescription(){
    try{
      let desc = this.weather;
      if(this.weather==="雪") desc += " ❄️";
      else if(this.weather==="雨") desc += " 🌧️";
      else if(this.weather==="晴") desc += " ☀️";
      else desc += " ☁️";
      if(typeof this.temperature === 'number'){
        if(this.temperature < 0) desc += " (寒)";
        else if(this.temperature < 10) desc += " (寒冷)";
        else if(this.temperature < 20) desc += " (凉爽)";
        else if(this.temperature < 30) desc += " (温暖)";
        else desc += " (炎热)";
      }
      return desc;
    }catch(e){ return `${this.weather || '晴'} ${this.temperature || 0}\u00b0C`; }
  }
  
  // 记录消费并更新累计金额
  recordExpense(amount, description = '') {
    // 应用全局经费消耗增幅
    const costMult = (typeof COST_MULTIPLIER !== 'undefined' ? COST_MULTIPLIER : 1.0);
    const expense = Math.max(0, amount * costMult);
    this.budget = Math.max(0, this.budget - expense);
    this.totalExpenses = (this.totalExpenses || 0) + expense;
    
    // 可选：记录消费日志（但不重复推送事件）
    // if (description && typeof window !== 'undefined' && window.pushEvent) {
    //   try {
    //     window.pushEvent({
    //       name: '消费记录',
    //       description: `${description}: -¥${expense}`,
    //       week: this.week
    //     });
    //   } catch(e) {
    //     console.error('Failed to log expense:', e);
    //   }
    // }
    
    return expense;
  }
}

/* =========== 比赛数据复刻（两赛季） =========== */
const WEEKS_PER_HALF = Math.floor(SEASON_WEEKS / 2);
let competitions = [];
if(Array.isArray(COMPETITION_SCHEDULE)){
  const totalOrig = ORIGINAL_SEASON_WEEKS;
  const firstHalfSize = WEEKS_PER_HALF;
  const secondHalfSize = SEASON_WEEKS - WEEKS_PER_HALF;
  for (let name of COMPETITION_ORDER) {
    const src = COMPETITION_SCHEDULE.find(c => c.name === name);
    if (!src) continue;
    const p = (src.week - 1) / Math.max(1, (totalOrig - 1));
    let newWeek = 1 + Math.round(p * Math.max(0, firstHalfSize - 1));
    if (newWeek < 1) newWeek = 1;
    if (newWeek > firstHalfSize) newWeek = firstHalfSize;
    let copy = Object.assign({}, src);
    // ensure numProblems and maxScore consistency: default each problem worth 100
    if(!copy.numProblems) copy.numProblems = Math.max(1, Math.round((copy.maxScore||400)/100));
    if(!copy.maxScore) copy.maxScore = copy.numProblems * 100;
    copy.week = newWeek;
    competitions.push(copy);
  }
  for (let name of COMPETITION_ORDER) {
    const src = COMPETITION_SCHEDULE.find(c => c.name === name);
    if (!src) continue;
    const p = (src.week - 1) / Math.max(1, (totalOrig - 1));
    let newWeek2 = WEEKS_PER_HALF + 1 + Math.round(p * Math.max(0, secondHalfSize - 1));
    if (newWeek2 < WEEKS_PER_HALF + 1) newWeek2 = WEEKS_PER_HALF + 1;
    if (newWeek2 > SEASON_WEEKS) newWeek2 = SEASON_WEEKS;
    let copy = Object.assign({}, src);
    if(!copy.numProblems) copy.numProblems = Math.max(1, Math.round((copy.maxScore||400)/100));
    if(!copy.maxScore) copy.maxScore = copy.numProblems * 100;
    copy.week = newWeek2;
    competitions.push(copy);
  }
} else { competitions = []; }

/* =========== 存档迁移：学生身份与天赋改名 =========== */

/**
 * 把"按名字索引"的数据里出现的旧名字替换成新名字。
 * 学生名字是全局身份键，任何改名都必须同步这些结构，否则学生会像"换了一个人"。
 */
function __renameStudentEverywhere(game, oldName, newName){
  if(!game || !oldName || !newName || oldName === newName) return;
  try{
    // 1. 晋级资格（Set of names）
    if(Array.isArray(game.qualification)){
      game.qualification.forEach(function(half){
        if(!half || typeof half !== 'object') return;
        Object.keys(half).forEach(function(comp){
          var set = half[comp];
          if(set && typeof set.has === 'function' && set.has(oldName)){
            set.delete(oldName);
            set.add(newName);
          }
        });
      });
    }
    // 2. 生涯比赛履历
    if(Array.isArray(game.careerCompetitions)){
      game.careerCompetitions.forEach(function(rec){
        if(rec && Array.isArray(rec.entries)){
          rec.entries.forEach(function(e){ if(e && e.name === oldName) e.name = newName; });
        }
      });
    }
    // 3. 最后一届 IOI 全部成绩
    if(Array.isArray(game.lastIOIAllResults)){
      game.lastIOIAllResults.forEach(function(r){ if(r && r.name === oldName) r.name = newName; });
    }
    // 4. 国家队晋级名单
    try{
      if(game.nationalTeamResults && Array.isArray(game.nationalTeamResults.ioiQualified)){
        game.nationalTeamResults.ioiQualified = game.nationalTeamResults.ioiQualified.map(function(n){
          return n === oldName ? newName : n;
        });
      }
    }catch(e){}
  }catch(e){ console.error('__renameStudentEverywhere failed', e); }
}

/**
 * 读档后的兼容处理：
 *   1. 隐藏天赋旧名字 → 新名字（梗化改名后旧存档仍可继续玩）；
 *   2. 旧存档里"走上女队道路"的学生曾被直接改名为「XXX（女队）」，
 *      这里把名字恢复成本名，并同步所有按名字索引的记录，找回原本的比赛履历。
 */
function migrateStudentIdentities(game){
  try{
    if(!game || !Array.isArray(game.students)) return;
    var aliases = (typeof LEGACY_TALENT_ALIASES !== 'undefined' && LEGACY_TALENT_ALIASES) ? LEGACY_TALENT_ALIASES : {};
    game.students.forEach(function(s){
      if(!s) return;
      if(s.talents && typeof s.talents.has === 'function'){
        Object.keys(aliases).forEach(function(oldTalent){
          if(s.talents.has(oldTalent)){
            s.talents.delete(oldTalent);
            s.talents.add(aliases[oldTalent]);
          }
        });
      }
      var nm = String(s.name == null ? '' : s.name);
      if(s.femaleTeamPath && /（女队）$/.test(nm)){
        var baseName = nm.replace(/（女队）$/, '');
        if(baseName){
          s.name = baseName;
          __renameStudentEverywhere(game, nm, baseName);
        }
      }
    });
    if(!game.stats || typeof game.stats !== 'object') game.stats = {};
    if(!Array.isArray(game.hiddenAchievements)) game.hiddenAchievements = [];
    // 统计字段兜底（老存档没有这些字段）
    if(!Array.isArray(game.stats.talentGainLog)) game.stats.talentGainLog = [];
    if(!Array.isArray(game.stats.overseasCountries)) game.stats.overseasCountries = [];
    // 随机数：老存档没有种子，补成 null（读档时会退回自由随机）
    if(game.randomSeed === undefined) game.randomSeed = null;
    if(game.rngState === undefined) game.rngState = null;
  }catch(e){ console.error('migrateStudentIdentities failed', e); }
}

/* 全局导出（保持与旧代码兼容的全局变量） */
window.Student = Student;
window.Facilities = Facilities;
window.GameState = GameState;
window.competitions = competitions;
window.WEEKS_PER_HALF = WEEKS_PER_HALF;
