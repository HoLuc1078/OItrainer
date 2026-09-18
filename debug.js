/*
    debug.js: 调试代码
    包含用于开发和测试的辅助函数。
*/

/**
 * 调试函数：生成超强学生并跳转到第二年NOI
 * 使用方法：在浏览器控制台中输入 debugzak() 即可
 */
function debugzak() {
  if(typeof game === 'undefined' || !game) {
    console.error('游戏未初始化，请先开始游戏');
    alert('请先开始游戏再使用调试功能');
    return;
  }
  
  console.log('🔧 [调试] 开始生成超强学生并跳转到NOI...');
  
  game.students = [];
  
  const superStudent = new Student('zak', 500, 500, 500);
  superStudent.knowledge_ds = 500;
  superStudent.knowledge_graph = 500;
  superStudent.knowledge_string = 500;
  superStudent.knowledge_math = 500;
  superStudent.knowledge_dp = 500;
  superStudent.pressure = 0;
  superStudent.comfort = 100;
  superStudent.sick_weeks = 0;
  superStudent.active = true;
  
  game.students.push(superStudent);
  console.log('✅ [调试] 已创建超强学生：', superStudent.name);
  
  game.budget = 1000000;
  console.log('✅ [调试] 已设置经费：¥1,000,000');
  
  const secondYearNOI = competitions.find(c => c.name === 'NOI' && c.week > WEEKS_PER_HALF);
  const targetWeek = secondYearNOI ? secondYearNOI.week - 1 : 27;
  
  if(game.week < targetWeek) {
    const weeksToJump = targetWeek - game.week;
    console.log(`⏭️ [调试] 从第${game.week}周跳转到第${targetWeek}周（跳过${weeksToJump}周）...`);
    game.week = targetWeek;
  }
  
  const halfIndex = 1;
  if(!game.qualification[halfIndex]) {
    game.qualification[halfIndex] = {};
  }
  
  for(let compName of COMPETITION_ORDER) {
    if(!game.qualification[halfIndex][compName]) {
      game.qualification[halfIndex][compName] = new Set();
    }
    game.qualification[halfIndex][compName].add(superStudent.name);
  }
  console.log('✅ [调试] 已授予所有比赛晋级资格');
  
  if(!game.completedCompetitions) {
    game.completedCompetitions = new Set();
  }
  
  for(let comp of competitions) {
    if(comp.week < targetWeek && comp.week > WEEKS_PER_HALF) {
      const key = `${halfIndex}_${comp.name}_${comp.week}`;
      game.completedCompetitions.add(key);
    }
  }
  console.log('✅ [调试] 已标记完成前序比赛');
  
  game.updateWeather();
  
  if(typeof renderAll === 'function') {
    renderAll();
  }
  
  
  try{ if(window.AchievementManager) window.AchievementManager.unlock('debug_user', game); }catch(e){}
  alert(`🔧 已创建"${superStudent.name}"\n 已跳转到第${game.week}周\n 已授予所有晋级资格\n`);
}

// 在 debug.js 文件中，debugzak() 函数之后添加
function Fuck_CCF() {
    if (typeof game === 'undefined' || !game) {
        console.error('游戏未初始化');
        return;
    }

    // 创建超强学生
    const superStudent = new Student('李欣隆', 2147483647, 2147483647, 2147483647);
    // 设置所有知识点为最大值
    superStudent.knowledge_ds = 2147483647;
    superStudent.knowledge_graph = 2147483647;
    superStudent.knowledge_string = 2147483647;
    superStudent.knowledge_math = 2147483647;
    superStudent.knowledge_dp = 2147483647;
    // 其他属性设置
    superStudent.pressure = 0;
    superStudent.comfort = 100;
    superStudent.sick_weeks = 0;
    superStudent.active = true;

    // 添加所有正面天赋（从 talent.js 中提取的正面天赋名称）
    const positiveTalents = [
        "冷静",           // 比赛中保持冷静，所有能力+20%
        "伽罗瓦",         // 数学题爆发，数学知识与思维+50%
        "爆发型",         // 连续换题后下题爆发，知识点与思维翻倍
        "心态稳定",       // 解题达3题后，心理素质+50%
        "Ad-hoc大师",     // 思考阶段小概率直接得满分
        "数据结构狂热者", // 数据结构题临时能力翻倍
        "图论直觉",       // 图论题30%概率图论+60%、思维+20%
        "赛场狂热",       // 比赛前半段思维+25%
        "最后一搏",       // 比赛最后一题所有知识+100%
        "跳跃思维",       // 每跳题一次思维+10%（最多3层）
        "慢热",           // 后半场思维与编程+20%
        "虎头蛇尾",       // 前半场思维与心理+30%
        "完美主义",       // 满分时压力清零
        "绝境逢生",       // 比赛过半零分时概率爆发
        "遇强则强",       // 挑战高难度题目更兴奋
        "读题专家",       // 思维检定优势
        "键盘侠",         // 编码速度极快
        "字符串魔法师",   // 字符串相关能力提升
        "知识熔炉",       // 解题时可能提升其他知识点
        "举一反三",       // 训练时其他知识点可能微增
        "专注",           // 高强度训练压力增长减缓
        "劳逸结合",       // 娱乐效果翻倍
        "乐天派",         // 每周压力恢复增加，不易燃尽
        "铁人",           // 生病概率大幅降低
        "自愈",           // 生病恢复速度加快
        "压力转化",       // 压力越高思维越活跃（可控范围内正面）
        "省钱大师",       // 外出集训开支减少5000
        "氪金玩家",       // 付费模拟赛效果提升
        "美食家",         // 食堂对舒适度和压力恢复影响翻倍
        "追风者",         // 台风时压力清零
        "摸鱼大师",       // 训练强度>80时50%概率取消压力增加
        "抗压奇才",       // 压力增加超10时减半
        "睡觉也在想题",   // 放假结束随机提升知识点+压力-5
        // ===== 隐藏天赋（名字都是梗，效果请自行体会）=====
        "嬲选手",
        "珂朵莉",
        "世界上最幸福的女孩",
        "样例过了就是过了",
        "暴力出奇迹",
        "你怎么知道我 AK 了",
        "稳如老狗",
        "Deadline 是第一生产力",
        "欧皇"
    ];
    positiveTalents.forEach(talent => superStudent.addTalent(talent));
    try{ if(window.AchievementManager) window.AchievementManager.unlock('debug_user', game); }catch(e){}

    // 添加到学生列表
    game.students.push(superStudent);
    console.log('lxl 顺着味就来了');
    log('lxl顺着味就来了');
    try{ if(window.AchievementManager) window.AchievementManager.checkAll(game); }catch(e){}
    // 授予所有比赛晋级资格（当前学期和下学期）
    for (let halfIndex = 0; halfIndex <= 1; halfIndex++) {
        if (!game.qualification[halfIndex]) {
            game.qualification[halfIndex] = {};
        }

        for (let compName of COMPETITION_ORDER) {
            if (!game.qualification[halfIndex][compName]) {
                game.qualification[halfIndex][compName] = new Set();
            }
            game.qualification[halfIndex][compName].add(superStudent.name);
        }
    }
    // 刷新界面
    if (typeof renderAll === 'function') {
        renderAll();
    }
}
/**
 * 超级学生：珂朵莉
 * 触发方式：在训话框里输入「chtholly」（每局仅一次，和「李欣隆」共用同一份额度）
 */
function chthollySummon() {
    if (typeof game === 'undefined' || !game) {
        console.error('游戏未初始化');
        return;
    }

    const MAXV = 2147483647;
    const chtholly = new Student('珂朵莉', MAXV, MAXV, MAXV);
    chtholly.knowledge_ds = MAXV;
    chtholly.knowledge_graph = MAXV;
    chtholly.knowledge_string = MAXV;
    chtholly.knowledge_math = MAXV;
    chtholly.knowledge_dp = MAXV;
    chtholly.pressure = 0;
    chtholly.comfort = 100;
    chtholly.sick_weeks = 0;
    chtholly.active = true;

    [
        '珂朵莉',
        '世界上最幸福的女孩',
        '嬲选手',
        '样例过了就是过了',
        '暴力出奇迹',
        '你怎么知道我 AK 了',
        '稳如老狗',
        'Deadline 是第一生产力',
        '欧皇'
    ].forEach(function (t) { chtholly.addTalent(t); });

    game.students.push(chtholly);
    game.hasChtholly = true;
    log('如果幸福有颜色，那一定是被终末之红染尽的苍蓝。');
    try { if (typeof pushEvent === 'function') pushEvent({ name: '珂朵莉', description: '「我永远喜欢珂朵莉。」', week: game.week }); } catch (e) { }

    // 授予所有比赛晋级资格（当前学期和下学期）
    for (let halfIndex = 0; halfIndex <= 1; halfIndex++) {
        if (!game.qualification[halfIndex]) game.qualification[halfIndex] = {};
        for (let compName of COMPETITION_ORDER) {
            if (!game.qualification[halfIndex][compName]) game.qualification[halfIndex][compName] = new Set();
            game.qualification[halfIndex][compName].add(chtholly.name);
        }
    }

    try { if (window.AchievementManager) { window.AchievementManager.unlock('debug_user', game); window.AchievementManager.checkAll(game); } } catch (e) { }
    if (typeof renderAll === 'function') renderAll();
}

// 下面的代码是我练习 JS 自己写的，厉害吧
function kkksc03wzl() {
    if (typeof game === 'undefined' || !game) {
        console.error('游戏未初始化');
        return;
    }
    // 注意：女队只是"标记"，不能改名字 —— 名字是身份键，改了会让这个人的履历全丢
    const wzl = new Student("wzl", 2919, 1929, 9999);
    wzl.femaleTeamPath = true;
    wzl.femaleTeamWeek = game.week;
    wzl.knowledge_dp = 114514;
    wzl.knowledge_ds = 998244353;
    wzl.knowledge_graph = 1929;
    wzl.knowledge_math = 2147483647;
    wzl.knowledge_string = 1078;
    wzl.active = true;
    wzl.pressure = 0;
    wzl.addTalent("世界上最幸福的女孩");
    wzl.addTalent("嬲选手");
    wzl.addTalent("你怎么知道我 AK 了");
    game.students.push(wzl);
    try{ if(window.AchievementManager){ window.AchievementManager.unlock('debug_user', game); window.AchievementManager.checkAll(game); } }catch(e){}
    //好吧，下面还是得CV
    // 授予所有比赛晋级资格（当前学期和下学期）
    for (let halfIndex = 0; halfIndex <= 1; halfIndex++) {
        if (!game.qualification[halfIndex]) {
            game.qualification[halfIndex] = {};
        }

        for (let compName of COMPETITION_ORDER) {
            if (!game.qualification[halfIndex][compName]) {
                game.qualification[halfIndex][compName] = new Set();
            }
            game.qualification[halfIndex][compName].add(wzl.name);
        }
    }
    // 刷新界面
    if (typeof renderAll === 'function') {
        renderAll();
    }
}

/* =============================================================================
 *  Dev Tool —— 控制台作弊工具箱
 * -----------------------------------------------------------------------------
 *  用法（必须在浏览器控制台里输入，页面上没有任何入口）：
 *
 *      dev_tool()                 打开 / 关闭作弊面板
 *      dev_tool('help')           只打印命令列表
 *      dev_tool('money', 5000000) 直接跑一条命令
 *      DEV.money(5000000)         等价的函数式写法
 *
 *  想加新功能：在 DEV 里加一个方法，再往 DEV_GROUPS 里补一条按钮即可。
 *  所有命令都会打印日志，方便确认到底改了什么。
 * ========================================================================== */
(function () {
  'use strict';

  const PANEL_ID = 'oi-dev-panel';

  function devLog(msg) {
    try { console.log('%c[DEV] ' + msg, 'color:#e11d48;font-weight:700'); } catch (e) { console.log('[DEV] ' + msg); }
  }
  function devWarn(msg) {
    try { console.warn('[DEV] ' + msg); } catch (e) { }
  }

  /** 取当前对局；没有就提示并返回 null */
  function needGame() {
    const g = (typeof window !== 'undefined') ? window.game : null;
    if (!g) {
      devWarn('当前没有进行中的对局。请先在游戏里开局，再回控制台调用 dev_tool()。');
      return null;
    }
    return g;
  }

  function activeStudents(g) {
    return (g.students || []).filter(s => s && s.active !== false);
  }

  function eachStudent(g, fn) {
    activeStudents(g).forEach(function (s) { try { fn(s); } catch (e) { devWarn('学生 ' + s.name + ' 处理失败：' + e.message); } });
  }

  function bump(name, value) {
    try { if (typeof trackAction === 'function') trackAction(name, value); } catch (e) { }
  }

  /** 重绘界面 + 跑一次成就判定（大部分命令用这个） */
  function refresh() {
    refreshView();
    try { if (window.AchievementManager) window.AchievementManager.checkAll(window.game); } catch (e) { }
    try { if (typeof window.updateAchievementBadge === 'function') window.updateAchievementBadge(); } catch (e) { }
  }

  /** 只重绘，不跑成就判定（清空成就记录之后用，免得条件还满足又立刻解锁回去） */
  function refreshView() {
    try { if (typeof window.renderAll === 'function') window.renderAll(); } catch (e) { }
    try { if (typeof window.updateAchievementBadge === 'function') window.updateAchievementBadge(); } catch (e) { }
    try { if (typeof window.oiAchRefresh === 'function') window.oiAchRefresh(); } catch (e) { }
  }

  /* ==================== 命令实现 ==================== */

  const DEV = {
    /* ---------- 资源 ---------- */
    money(amount) {
      const g = needGame(); if (!g) return;
      const v = (amount === undefined) ? 1000000 : Number(amount);
      g.budget = v;
      try { g.maxStat('maxBudget', v); } catch (e) { }
      devLog('经费已设为 ¥' + v.toLocaleString());
      refresh();
    },
    addMoney(amount) {
      const g = needGame(); if (!g) return;
      const v = (amount === undefined) ? 500000 : Number(amount);
      return DEV.money(Number(g.budget || 0) + v);
    },
    infiniteMoney() {
      const g = needGame(); if (!g) return;
      DEV.money(2147483647);
      devLog('经费已拉满（还是会被每周维护费慢慢扣，且照样会触发破产结局，谨慎使用）');
    },
    reputation(v) {
      const g = needGame(); if (!g) return;
      const n = (v === undefined) ? 100 : Number(v);
      g.reputation = n;
      try { g.maxStat('maxReputation', n); } catch (e) { }
      devLog('声誉为 ' + n);
      refresh();
    },

    /* ---------- 学生 ---------- */
    maxAbility(value) {
      const g = needGame(); if (!g) return;
      const v = (value === undefined) ? 500 : Number(value);
      eachStudent(g, function (s) {
        s._base_thinking = v; s._base_coding = v; s._base_mental = v;
      });
      devLog('全队思维 / 代码 / 心理 已设为 ' + v);
      refresh();
    },
    maxKnowledge(value) {
      const g = needGame(); if (!g) return;
      const v = (value === undefined) ? 500 : Number(value);
      eachStudent(g, function (s) {
        s.knowledge_ds = v; s.knowledge_graph = v; s.knowledge_string = v;
        s.knowledge_math = v; s.knowledge_dp = v;
      });
      devLog('全队五类知识点已设为 ' + v);
      refresh();
    },
    calm() {
      const g = needGame(); if (!g) return;
      eachStudent(g, function (s) {
        s.pressure = 0;
        s.sick_weeks = 0;
        s.comfort = 100;
        s.quit_tendency_weeks = 0;
        s.quit_grace_pending = false;
        s.high_pressure_weeks = 0;
        s.burnout_weeks = 0;
        if (typeof s.clearTempModifiers === 'function') s.clearTempModifiers();
      });
      devLog('全队压力清零、病愈、舒适度拉满、退队倾向解除');
      refresh();
    },
    pressure(v) {
      const g = needGame(); if (!g) return;
      const n = (v === undefined) ? 0 : Number(v);
      eachStudent(g, function (s) { s.pressure = n; });
      devLog('全队压力已设为 ' + n + (n >= 90 ? '（注意：下周会进入退队判定）' : ''));
      refresh();
    },
    addStudent(name) {
      const g = needGame(); if (!g) return;
      if (typeof Student !== 'function') { devWarn('Student 未加载'); return; }
      const nm = name || ('测试学生' + (activeStudents(g).length + 1));
      const s = new Student(nm, 120, 120, 120);
      s.knowledge_ds = s.knowledge_graph = s.knowledge_string = s.knowledge_math = s.knowledge_dp = 120;
      s.pressure = 0; s.comfort = 80; s.active = true;
      g.students.push(s);
      devLog('已加入测试学生「' + nm + '」');
      refresh();
    },
    superStudent() {
      const g = needGame(); if (!g) return;
      if (typeof Fuck_CCF === 'function') { Fuck_CCF(); devLog('已召唤李欣隆（自带全部天赋）'); }
      else devWarn('Fuck_CCF 未加载');
    },

    /* ---------- 天赋 ---------- */
    allTalents() {
      const g = needGame(); if (!g) return;
      const list = (window.TalentManager && typeof window.TalentManager.getRegistered === 'function')
        ? window.TalentManager.getRegistered() : [];
      if (!list.length) { devWarn('没有已注册的天赋'); return; }
      eachStudent(g, function (s) { list.forEach(function (t) { try { s.addTalent(t); } catch (e) { } }); });
      devLog('全队已获得全部 ' + list.length + ' 个天赋');
      refresh();
    },
    hiddenTalents() {
      const g = needGame(); if (!g) return;
      const list = (typeof HIDDEN_TALENTS !== 'undefined') ? HIDDEN_TALENTS.filter(t => t !== '__talent_cleanup__') : [];
      if (!list.length) { devWarn('HIDDEN_TALENTS 未加载'); return; }
      eachStudent(g, function (s) { list.forEach(function (t) { try { s.addTalent(t); } catch (e) { } }); });
      devLog('全队已获得全部 ' + list.length + ' 个隐藏天赋');
      refresh();
    },
    talent(name) {
      const g = needGame(); if (!g) return;
      if (!name) { devWarn('用法：dev_tool(\'talent\', \'天赋名\')'); return; }
      eachStudent(g, function (s) { try { s.addTalent(name); } catch (e) { } });
      devLog('全队已获得天赋「' + name + '」');
      refresh();
    },
    clearTalents() {
      const g = needGame(); if (!g) return;
      eachStudent(g, function (s) { try { s.talents.clear(); } catch (e) { } });
      devLog('全队天赋已清空');
      refresh();
    },

    /* ---------- 设施 / 队伍 ---------- */
    maxFacilities() {
      const g = needGame(); if (!g) return;
      const defs = (typeof FACILITY_DEFS !== 'undefined') ? FACILITY_DEFS : null;
      if (!defs) { devWarn('FACILITY_DEFS 未加载'); return; }
      Object.keys(defs).forEach(function (k) {
        if (k === 'computer_room') { g.facilities[k] = 1; return; }
        g.facilities[k] = defs[k].maxLevel;
      });
      devLog('全部设施已升到满级');
      refresh();
    },
    nextWeek(n) {
      const g = needGame(); if (!g) return;
      const weeks = (n === undefined) ? 1 : Math.max(1, Number(n));
      devLog('推进 ' + weeks + ' 周…');
      if (typeof safeWeeklyUpdate === 'function') safeWeeklyUpdate(weeks);
      else if (typeof weeklyUpdate === 'function') weeklyUpdate(weeks);
      devLog('现在是第 ' + g.week + ' 周');
      refresh();
    },
    setWeek(w) {
      const g = needGame(); if (!g) return;
      const n = Number(w);
      if (!isFinite(n)) { devWarn('用法：dev_tool(\'setWeek\', 12)'); return; }
      g.week = Math.max(1, Math.round(n));
      devLog('周数已直接设为 ' + g.week + '（注意：这只是改数字，不会补发这段时间的成长与费用）');
      refresh();
    },
    jumpToNextContest() {
      const g = needGame(); if (!g) return;
      if (typeof competitions === 'undefined' || !Array.isArray(competitions)) { devWarn('比赛日程未加载'); return; }
      const next = competitions.slice().sort((a, b) => a.week - b.week).find(c => c.week > g.week);
      if (!next) { devWarn('后面没有比赛了'); return; }
      const delta = Math.max(0, next.week - g.week - 1);
      if (delta > 0 && typeof safeWeeklyUpdate === 'function') safeWeeklyUpdate(delta);
      devLog('已跳到「' + next.name + '」前一周（第 ' + g.week + ' 周）');
      refresh();
    },
    qualifyAll() {
      const g = needGame(); if (!g) return;
      let n = 0;
      for (let half = 0; half <= 1; half++) {
        if (!g.qualification[half]) g.qualification[half] = {};
        for (const compName of COMPETITION_ORDER) {
          if (!g.qualification[half][compName]) g.qualification[half][compName] = new Set();
          activeStudents(g).forEach(function (s) { g.qualification[half][compName].add(s.name); n++; });
        }
      }
      devLog('已给全队授予全部比赛的晋级资格（' + n + ' 条）');
      refresh();
    },

    /* ---------- 成就 / 测试 ---------- */
    unlockAllAchievements() {
      const g = needGame(); if (!g) return;
      const AM = window.AchievementManager; if (!AM) { devWarn('成就系统未加载'); return; }
      let n = 0;
      AM.list().forEach(function (def) { try { if (AM.unlock(def.id, g)) n++; } catch (e) { } });
      devLog('已解锁全部成就（新增 ' + n + ' 个，累计 ' + AM.count(g) + ' / ' + AM.total() + '）');
      refresh();
    },
    resetAchievements() {
      const AM = window.AchievementManager; if (!AM) { devWarn('成就系统未加载'); return; }
      AM.resetProfile();
      devLog('成就记录已清空（当前条件仍然满足的成就会在下次判定时重新解锁，想彻底重来请先把统计归零）');
      refreshView();
    },
    /** 把所有数值型统计刷成一个大数：用来快速验证成就是否能正确触发 */
    statsFill(value) {
      const g = needGame(); if (!g) return;
      const v = (value === undefined) ? 999999 : Number(value);
      let n = 0;
      Object.keys(g.stats || {}).forEach(function (k) {
        if (typeof g.stats[k] === 'number') { g.stats[k] = v; n++; }
      });
      devLog('已把 ' + n + ' 个数值型统计刷成 ' + v + '（下一次 checkAll 会解锁一大批成就）');
      refresh();
    },
    statsReset() {
      const g = needGame(); if (!g) return;
      Object.keys(g.stats || {}).forEach(function (k) { if (typeof g.stats[k] === 'number') g.stats[k] = 0; });
      devLog('统计数字已全部归零');
      refresh();
    },
    showStats() {
      const g = needGame(); if (!g) return;
      try { console.table(g.stats); } catch (e) { console.log(g.stats); }
      return g.stats;
    },

    /* ---------- 随机数 / 存档 ---------- */
    seed(s) {
      if (s === undefined) {
        const g = needGame(); if (!g) return;
        devLog('当前种子：' + (g.randomSeed !== undefined ? g.randomSeed : '（未播种）'));
        return g.randomSeed;
      }
      const g = needGame(); if (!g) return;
      if (typeof setRandomSeed !== 'function') { devWarn('setRandomSeed 未加载'); return; }
      setRandomSeed(s);
      g.randomSeed = s;
      try { g.rngState = getRandomState(); } catch (e) { }
      devLog('随机种子已改为 ' + s + '（注意：中途换种子会破坏「同种子同结果」，仅用于调试）');
    },
    save() {
      const g = needGame(); if (!g) return;
      if (typeof saveGame === 'function') { saveGame(true); devLog('已手动存档'); }
      else devWarn('saveGame 未加载');
    },
    wipeSave() {
      try {
        localStorage.removeItem('oi_coach_save');
        sessionStorage.removeItem('oi_coach_save');
        devLog('存档已清除（刷新页面会回到开始菜单）');
      } catch (e) { devWarn('清除存档失败：' + e.message); }
    },
    bankrupt() {
      const g = needGame(); if (!g) return;
      g.budget = 0;
      try { g.minStat('minBudget', 0); } catch (e) { }
      devLog('经费已归零 —— 下一次推进周数就会触发「经费不足」结局');
      refresh();
    },

    /* ---------- 汇总 ---------- */
    help() { DEV.printHelp(); },

    printHelp() {
      const rows = [];
      DEV_GROUPS.forEach(function (grp) {
        grp.items.forEach(function (it) {
          rows.push({ 分组: grp.title, 命令: 'dev_tool(\'' + it.cmd + '\')', 说明: it.title });
        });
      });
      try { console.log('%c[DEV] 可用命令（也可以直接用 DEV.xxx() 或 window.DEV）', 'color:#e11d48;font-weight:700'); console.table(rows); }
      catch (e) { rows.forEach(r => console.log(r.命令 + '  ' + r.说明)); }
      return rows;
    }
  };

  /* ==================== 面板按钮分组 ==================== */

  const DEV_GROUPS = [
    {
      title: '资源', items: [
        { cmd: 'money', title: '经费 = 100 万', run: () => DEV.money(1000000) },
        { cmd: 'addMoney', title: '经费 +50 万', run: () => DEV.addMoney(500000) },
        { cmd: 'infiniteMoney', title: '经费拉满', run: () => DEV.infiniteMoney() },
        { cmd: 'reputation', title: '声誉 = 100', run: () => DEV.reputation(100) }
      ]
    },
    {
      title: '学生', items: [
        { cmd: 'maxAbility', title: '全队能力 500', run: () => DEV.maxAbility(500) },
        { cmd: 'maxKnowledge', title: '全队知识点 500', run: () => DEV.maxKnowledge(500) },
        { cmd: 'calm', title: '全员减压 / 治愈', run: () => DEV.calm() },
        { cmd: 'pressure', title: '全员压力 0', run: () => DEV.pressure(0) },
        { cmd: 'addStudent', title: '加一名测试学生', run: () => DEV.addStudent() },
        { cmd: 'superStudent', title: '召唤李欣隆', run: () => DEV.superStudent() }
      ]
    },
    {
      title: '天赋', items: [
        { cmd: 'hiddenTalents', title: '全员隐藏天赋', run: () => DEV.hiddenTalents() },
        { cmd: 'allTalents', title: '全员全部天赋', run: () => DEV.allTalents() },
        { cmd: 'clearTalents', title: '清空全员天赋', run: () => DEV.clearTalents() }
      ]
    },
    {
      title: '设施 / 赛程', items: [
        { cmd: 'maxFacilities', title: '设施全满级', run: () => DEV.maxFacilities() },
        { cmd: 'nextWeek', title: '推进 1 周', run: () => DEV.nextWeek(1) },
        { cmd: 'jumpToNextContest', title: '跳到下场比赛', run: () => DEV.jumpToNextContest() },
        { cmd: 'qualifyAll', title: '全队全部晋级资格', run: () => DEV.qualifyAll() }
      ]
    },
    {
      title: '成就 / 测试', items: [
        { cmd: 'unlockAllAchievements', title: '解锁全部成就', run: () => DEV.unlockAllAchievements() },
        { cmd: 'statsFill', title: '统计刷满（测成就）', run: () => DEV.statsFill(999999) },
        { cmd: 'statsReset', title: '统计归零', run: () => DEV.statsReset() },
        { cmd: 'showStats', title: '打印统计表', run: () => DEV.showStats() },
        { cmd: 'resetAchievements', title: '清空成就记录', run: () => DEV.resetAchievements() }
      ]
    },
    {
      title: '随机数 / 存档', items: [
        { cmd: 'seed', title: '打印当前种子', run: () => DEV.seed() },
        { cmd: 'save', title: '立即存档', run: () => DEV.save() },
        { cmd: 'wipeSave', title: '清除存档', run: () => DEV.wipeSave() },
        { cmd: 'bankrupt', title: '☠️ 经费归零', run: () => DEV.bankrupt() }
      ]
    }
  ];

  /* ==================== 面板 UI ==================== */

  function buildPanel() {
    const el = document.createElement('div');
    el.id = PANEL_ID;
    el.style.cssText = [
      'position:fixed', 'right:16px', 'bottom:16px', 'z-index:99999',
      'width:480px', 'max-width:calc(100vw - 32px)', 'max-height:70vh',
      'display:flex', 'flex-direction:column',
      'background:#0f172a', 'color:#e2e8f0',
      'border:1px solid #334155', 'border-radius:12px',
      'box-shadow:0 18px 48px rgba(0,0,0,.5)',
      'font:12px/1.6 "SF Mono","Consolas","Menlo",monospace',
      'overflow:hidden'
    ].join(';');

    const bar = document.createElement('div');
    bar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#1e293b;border-bottom:1px solid #334155;cursor:default';
    bar.innerHTML = '<span style="font-weight:700;color:#f87171">🛠 DEV TOOL</span>' +
      '<span style="opacity:.6">week ' + ((window.game && window.game.week) || '-') + '</span>';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭 ✕';
    closeBtn.style.cssText = 'margin-left:12px;background:#334155;color:#e2e8f0;border:none;border-radius:6px;padding:3px 9px;cursor:pointer;font:inherit';
    closeBtn.onclick = function () { closePanel(); };
    bar.appendChild(closeBtn);

    const body = document.createElement('div');
    body.style.cssText = 'padding:10px 12px;overflow-y:auto';

    DEV_GROUPS.forEach(function (grp) {
      const t = document.createElement('div');
      t.textContent = grp.title;
      t.style.cssText = 'margin:8px 0 6px;font-weight:700;color:#93c5fd;letter-spacing:1px';
      body.appendChild(t);
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px';
      grp.items.forEach(function (it) {
        const b = document.createElement('button');
        b.textContent = it.title;
        b.title = 'dev_tool(\'' + it.cmd + '\')';
        b.style.cssText = 'background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:4px 9px;cursor:pointer;font:inherit';
        b.onmouseenter = function () { b.style.background = '#334155'; };
        b.onmouseleave = function () { b.style.background = '#1e293b'; };
        b.onclick = function () { try { it.run(); } catch (e) { devWarn(it.cmd + ' 执行失败：' + e.message); } };
        wrap.appendChild(b);
      });
      body.appendChild(wrap);
    });

    const foot = document.createElement('div');
    foot.style.cssText = 'margin-top:12px;padding-top:8px;border-top:1px dashed #334155;opacity:.7';
    foot.innerHTML = '控制台里也能直接敲：<br><code style="color:#fca5a5">dev_tool(\'money\', 5000000)</code> · <code style="color:#fca5a5">DEV.help()</code> · <code style="color:#fca5a5">DEV.showStats()</code>';
    body.appendChild(foot);

    el.appendChild(bar);
    el.appendChild(body);
    return el;
  }

  function openPanel() {
    closePanel();
    try { document.body.appendChild(buildPanel()); }
    catch (e) { devWarn('面板创建失败：' + e.message); }
  }

  function closePanel() {
    try { const old = document.getElementById(PANEL_ID); if (old && old.parentNode) old.parentNode.removeChild(old); } catch (e) { }
  }

  /* ==================== 入口 ==================== */

  /**
   * 控制台入口：dev_tool() / dev_tool('help') / dev_tool(\'命令\', 参数…)
   * 页面里没有任何入口，只有主动在控制台调用才会激活。
   */
  function dev_tool(cmd, ...args) {
    console.log('%c🛠 DEV TOOL 已激活', 'color:#f87171;font-weight:700;font-size:14px');

    if (cmd === undefined) {
      DEV.printHelp();
      openPanel();
      return DEV;
    }
    if (cmd === 'help') {
      return DEV.printHelp();
    }

    if (cmd === 'close' || cmd === 'off') { closePanel(); devLog('面板已关闭'); return DEV; }
    if (cmd === 'panel' || cmd === 'on') { openPanel(); devLog('面板已打开'); return DEV; }

    const fn = DEV[cmd];
    if (typeof fn !== 'function') {
      devWarn('没有这条命令：' + cmd + '（用 dev_tool(\'help\') 看全部命令）');
      return undefined;
    }
    try {
      return fn.apply(DEV, args);
    } catch (e) {
      console.error('[DEV] ' + cmd + ' 执行失败：', e);
      return undefined;
    }
  }

  if (typeof window !== 'undefined') {
    window.dev_tool = dev_tool;
    window.DEV = DEV;
  }
  if (typeof globalThis !== 'undefined') globalThis.dev_tool = dev_tool;
})();
//如果你看到这里了 ，那我就可以告诉你一个“惊喜 ”
//我不知道会不会有人看这个代码，工整吧
//半个小时 才写出来的
//这个没有road多
//我妈给我报的课我基本没上，纯跟AI学
//AI讲的可明白多了，还是1对1
//总之，看到的话不要惊讶
//昨天AI告诉我，可读的变量名可以让人读的更清楚
//我本来没打算这么写来着，但是有趣的是Deepseek严厉的批评了我
//所以特意去英语速成啦
//至于这个应该没人看见，因为是机器判题
/**
 * 调试函数：直接打开设施升级页面
 * 使用方法：在浏览器控制台中输入 debugFacility() 即可
 */
function debugFacility() {
  if(typeof game === 'undefined' || !game) {
    console.error('游戏未初始化，请先开始游戏');
    alert('请先开始游戏再使用调试功能');
    return;
  }

  if(typeof showFacilityUpgradeModal === 'function') {
    console.log('[调试] 打开设施升级页面...');
    showFacilityUpgradeModal();
  } else {
    console.error('showFacilityUpgradeModal 函数未加载');
    alert('设施升级模块未加载，请检查 facilities.js 是否已引入');
  }
}
