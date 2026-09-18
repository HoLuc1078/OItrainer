/* achievements.js - 隐藏成就（彩蛋向）
 *
 * 设计原则：
 *   - 成就在解锁前只显示"？？？"和一句提示，解锁后才亮出真名与说明；
 *   - 名字尽量玩梗，说明点到为止；
 *   - 解锁靠 AchievementManager.checkAll(game) 扫描游戏状态，或者显式 unlock(id, game)。
 *
 * 加载顺序：在 constants.js / models.js 之后、game.js 之前加载。
 */
(function (global) {

  /** 全部隐藏成就定义 */
  const HIDDEN_ACHIEVEMENTS = [
    {
      id: 'world_tour', name: '世界那么大', icon: '🌍',
      desc: '完成第一次出境集训。',
      hint: '迈出第一步总是最贵的。',
      check: g => Number(g?.stats?.overseasTrips || 0) >= 1
    },
    {
      id: 'globetrotter', name: '护照盖满了', icon: '🛂',
      desc: '同一局游戏内去过 12 个不同的国家 / 地区集训。',
      hint: '多出去走走。',
      check: g => Array.isArray(g?.stats?.overseasCountries) && g.stats.overseasCountries.length >= 12
    },
    {
      id: 'money_printer', name: '钞能力', icon: '💸',
      desc: '单次出境集训花费达到 ¥200,000。',
      hint: '有钱真的可以为所欲为。',
      check: g => Number(g?.stats?.maxOverseasCost || 0) >= 200000
    },
    {
      id: 'almost_broke', name: '就剩一口气', icon: '🫠',
      desc: '一次出境集训结算后，经费不足 ¥5,000。',
      hint: '差点就回不来了。',
      check: g => !!g?.stats?.almostBrokeOverseas
    },
    {
      id: 'overseas_fail', name: '学费交够了', icon: '🧾',
      desc: '因为经费不足，出境集训直接失败。',
      hint: '钱包给上的第一课。',
      check: g => Number(g?.stats?.overseasFailures || 0) >= 1
    },
    {
      id: 'incident_survivor', name: '活着回来就算赢', icon: '🧳',
      desc: '一次出境集训里连着遇到两起意外。',
      hint: '人在囧途。',
      check: g => Number(g?.stats?.maxIncidentsInTrip || 0) >= 2
    },
    {
      id: 'talent_hoarder', name: '天赋收藏家', icon: '🎖️',
      desc: '同一局游戏内集齐 5 种隐藏天赋。',
      hint: '收集癖的胜利。',
      check: g => __countDistinctHiddenTalents(g) >= 5
    },
    {
      id: 'triple_crown', name: '三花聚顶', icon: '🃏',
      desc: '同一名学生同时拥有 3 个隐藏天赋。',
      hint: '一个人就是一支队伍。',
      check: g => (g?.students || []).some(s => __countStudentHiddenTalents(s) >= 3)
    },
    {
      id: 'talent_maxed', name: '天赋异禀', icon: '✨',
      desc: '有学生把天赋栏塞满了。',
      hint: '塞满就对了。',
      check: g => (g?.students || []).some(s => s && s.talents && s.talents.size >= 4)
    },
    {
      id: 'chtholly', name: '我永远喜欢珂朵莉', icon: '💙',
      desc: '招收到珂朵莉。',
      hint: '如果幸福有颜色。',
      check: g => (g?.students || []).some(s => s && s.name === '珂朵莉')
    },
    {
      id: 'lxl', name: '你还想要几个李欣隆？', icon: '🐉',
      desc: '把超级学生李欣隆招进队伍。',
      hint: '顺着味就来了。',
      check: g => (g?.students || []).some(s => s && s.name === '李欣隆')
    },
    {
      id: 'female_team', name: '女队之路', icon: '🚺',
      desc: '有学生走上了女队发展道路。',
      hint: '泰国是个好地方。',
      check: g => (g?.students || []).some(s => s && s.femaleTeamPath)
    },
    {
      id: 'all_sick', name: '病友交流会', icon: '🤒',
      desc: '同一周里有 3 名学生生病。',
      hint: '队医到底在哪。',
      check: g => (g?.students || []).filter(s => s && s.active !== false && Number(s.sick_weeks || 0) > 0).length >= 3
    },
    {
      id: 'pressure_max', name: '压力山大', icon: '🌋',
      desc: '有学生的压力顶到了 100。',
      hint: '绷不住了。',
      check: g => (g?.students || []).some(s => s && s.active !== false && Number(s.pressure || 0) >= 100)
    },
    {
      id: 'noi_gold', name: '金光闪闪', icon: '🥇',
      desc: '学生在 NOI 拿到金牌。',
      hint: '含金量拉满。',
      check: g => __hasMedal(g, 'NOI', 'gold')
    },
    {
      id: 'ioi_ak', name: 'AK IOI', icon: '👑',
      desc: '学生在 IOI 上拿到满分。',
      hint: '人类智慧的巅峰。',
      check: g => __hasIoiFullScore(g) || g?.endingReason && String(g.endingReason).indexOf('AKIOI') >= 0
    },
    {
      id: 'bankrupt', name: '破产也是一种结局', icon: '💀',
      desc: '以"经费耗尽"收场。',
      hint: '钱花完了，故事也就结束了。',
      check: g => !!g?.stats?.bankruptEnding
    }
  ];

  function __hiddenTalentList(){
    try{
      if(typeof HIDDEN_TALENTS !== 'undefined' && Array.isArray(HIDDEN_TALENTS)){
        return HIDDEN_TALENTS.filter(n => n !== '__talent_cleanup__');
      }
    }catch(e){}
    return [];
  }
  function __countStudentHiddenTalents(s){
    try{
      if(!s || !s.talents || typeof s.talents.has !== 'function') return 0;
      return __hiddenTalentList().filter(n => s.talents.has(n)).length;
    }catch(e){ return 0; }
  }
  function __countDistinctHiddenTalents(g){
    const found = new Set();
    __hiddenTalentList().forEach(function(n){
      if((g?.students || []).some(s => s && s.talents && typeof s.talents.has === 'function' && s.talents.has(n))) found.add(n);
    });
    return found.size;
  }
  function __hasMedal(g, compName, medal){
    try{
      const list = Array.isArray(g?.careerCompetitions) ? g.careerCompetitions : [];
      return list.some(rec => rec && rec.name === compName && Array.isArray(rec.entries) &&
        rec.entries.some(e => e && e.medal === medal));
    }catch(e){ return false; }
  }
  function __hasIoiFullScore(g){
    try{
      const list = Array.isArray(g?.careerCompetitions) ? g.careerCompetitions : [];
      return list.some(rec => {
        if(!rec || rec.name !== 'IOI' || !Array.isArray(rec.entries)) return false;
        return rec.entries.some(e => e && Number(e.score || 0) >= 400);
      });
    }catch(e){ return false; }
  }

  const AchievementManager = {
    _achievements: HIDDEN_ACHIEVEMENTS,
    _checking: false,

    list(){ return HIDDEN_ACHIEVEMENTS.slice(); },
    total(){ return HIDDEN_ACHIEVEMENTS.length; },
    get(id){ return HIDDEN_ACHIEVEMENTS.find(a => a.id === id) || null; },

    /** 当前已解锁的 id 列表 */
    unlockedIds(game){
      const g = game || (typeof window !== 'undefined' ? window.game : null);
      try{
        if(!g || !Array.isArray(g.hiddenAchievements)) return [];
        return g.hiddenAchievements.map(x => (typeof x === 'string' ? x : (x && x.id))).filter(Boolean);
      }catch(e){ return []; }
    },
    has(id, game){ return this.unlockedIds(game).indexOf(id) >= 0; },
    count(game){ return this.unlockedIds(game).length; },

    /** 解锁一个成就；返回是否"本次新解锁" */
    unlock(id, game){
      const g = game || (typeof window !== 'undefined' ? window.game : null);
      const def = this.get(id);
      if(!g || !def) return false;
      try{
        if(!Array.isArray(g.hiddenAchievements)) g.hiddenAchievements = [];
        if(this.unlockedIds(g).indexOf(id) >= 0) return false;
        g.hiddenAchievements.push({ id: id, week: Number(g.week || 0) });
        const text = (def.icon || '🏅') + ' 隐藏成就解锁：「' + def.name + '」——' + def.desc;
        try{ if(typeof window !== 'undefined' && window.pushEvent) window.pushEvent({ name: '隐藏成就', description: text, week: g.week }); }catch(e){}
        try{
          if(typeof window !== 'undefined' && window.toastManager && typeof window.toastManager.show === 'function'){
            window.toastManager.show('🏅 隐藏成就解锁：' + def.name, 'success');
          }
        }catch(e){}
        try{ if(typeof log === 'function') log('[隐藏成就] ' + def.name + '（' + def.desc + '）'); }catch(e){}
        return true;
      }catch(e){ console.error('AchievementManager.unlock failed', e); return false; }
    },

    /** 全量扫描一遍游戏状态，自动解锁所有已满足条件的成就 */
    checkAll(game){
      const g = game || (typeof window !== 'undefined' ? window.game : null);
      if(!g) return [];
      if(this._checking) return [];
      this._checking = true;
      const gained = [];
      try{
        HIDDEN_ACHIEVEMENTS.forEach(function(def){
          try{
            if(typeof def.check !== 'function') return;
            if(AchievementManager.has(def.id, g)) return;
            if(def.check(g) && AchievementManager.unlock(def.id, g)) gained.push(def.id);
          }catch(e){ console.error('achievement check failed', def && def.id, e); }
        });
      }catch(e){ console.error('AchievementManager.checkAll failed', e); }
      this._checking = false;
      return gained;
    },

    /** 成就面板 HTML（未解锁的只显示问号 + 提示） */
    renderPanelHtml(game){
      const g = game || (typeof window !== 'undefined' ? window.game : null);
      const unlocked = this.unlockedIds(g);
      let html = '<div class="ach-panel">';
      html += '<div class="ach-head">🏅 隐藏成就 ' + unlocked.length + ' / ' + this.total() + '</div>';
      html += '<div class="small muted" style="margin-bottom:10px">这些成就不会被提前剧透，解锁后才会亮出真面目。</div>';
      html += '<div class="ach-grid">';
      HIDDEN_ACHIEVEMENTS.forEach(function(def){
        const on = unlocked.indexOf(def.id) >= 0;
        html += '<div class="ach-card' + (on ? ' ach-on' : '') + '">' +
          '<div class="ach-title">' + (on ? (def.icon || '🏅') + ' ' + def.name : '❓ ？？？') + '</div>' +
          '<div class="ach-desc">' + (on ? def.desc : def.hint) + '</div>' +
          '</div>';
      });
      html += '</div></div>';
      return html;
    }
  };

  /** 顶栏徽章计数 */
  function updateAchievementBadge(){
    try{
      const el = document.getElementById('ach-badge-count');
      if(!el) return;
      el.textContent = AchievementManager.count() + '/' + AchievementManager.total();
    }catch(e){}
  }

  /** 打开隐藏成就面板（未解锁的显示问号 + 提示） */
  function showAchievementPanel(){
    const html = AchievementManager.renderPanelHtml();
    try{
      if(typeof window.showModal === 'function'){
        window.showModal('<h3>🏅 隐藏成就</h3>' + html +
          '<div class="modal-actions" style="margin-top:14px"><button class="btn btn-ghost" onclick="closeModal()">关闭</button></div>');
        return;
      }
    }catch(e){ console.error('showAchievementPanel failed', e); }
    try{ alert('已解锁 ' + AchievementManager.count() + ' / ' + AchievementManager.total() + ' 个隐藏成就'); }catch(e){}
  }

  global.updateAchievementBadge = updateAchievementBadge;
  global.showAchievementPanel = showAchievementPanel;
  window.updateAchievementBadge = updateAchievementBadge;
  window.showAchievementPanel = showAchievementPanel;

  global.HIDDEN_ACHIEVEMENTS = HIDDEN_ACHIEVEMENTS;
  global.AchievementManager = AchievementManager;
  window.AchievementManager = AchievementManager;
  window.HIDDEN_ACHIEVEMENTS = HIDDEN_ACHIEVEMENTS;
})(typeof window !== 'undefined' ? window : this);
