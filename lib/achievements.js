/* achievements.js - 隐藏成就（彩蛋向）
 *
 * ============================ 设计原则 ============================
 *   - 成就在解锁前只显示"？？？"和一句提示，解锁后才亮出真名与说明；
 *   - 名字尽量玩梗，说明点到为止；
 *   - 解锁靠 AchievementManager.checkAll(game) 扫描游戏状态，或者显式 unlock(id, game)；
 *   - check(g) 必须是【纯读】函数：不能修改游戏状态，也不能消耗随机数
 *     （否则会破坏 lib/utils.js 里"同种子同结果"的约定）。
 *
 * ============================ 怎么加一个成就 ============================
 *   1. 在 HIDDEN_ACHIEVEMENTS 里加一条：
 *        { id, name, icon, category, desc, hint, check: g => ... }
 *      - id      全局唯一、只增不改（存档里存的就是它）
 *      - category 见 CATEGORY_ORDER
 *      - check   收到 game（可能为 undefined），返回布尔值
 *      - progress 可选：(g) => ({ cur, max }) 用于面板上显示进度条
 *   2. 如果条件需要新数据，优先在 lib/models.js 的 GameState.stats 里加字段，
 *      并用 game.bumpStat() / game.maxStat() 在对应玩法处埋点，
 *      不要在 check() 里做有副作用的统计。
 *   3. 面板 / 徽章 / 结算页会自动带上新成就，无需改 UI。
 *
 * 加载顺序：facilities.js / constants.js / models.js 之后、game.js 之前。
 */
(function (global) {

  /** 成就分类（面板按这个顺序分组展示） */
  const CATEGORY_ORDER = ['出境集训', '队伍与教练', '天赋', '比赛', '经营', '心态', '彩蛋'];

  /* ==================== 外显成就（不藏，直接告诉你目标） ====================
   * 和隐藏成就的区别：
   *   - 名称 / 图标 / 说明始终可见，锁着的时候也看得见，还带进度条；
   *   - 走的是「一步一步来」的正向里程碑，用来给玩家一个明确的方向感；
   *   - 也存进 game.hiddenAchievements（沿用同一个已解锁列表，读档兼容）。
   */
  const PUBLIC_ACHIEVEMENTS = [
    /* ---------- 出境集训 ---------- */
    {
      id: 'p_outing_1', name: '第一次集训', icon: '🚌', category: '出境集训',
      desc: '完成 1 次外出集训。',
      check: g => Number(g?.stats?.outings || 0) >= 1,
      progress: g => ({ cur: Number(g?.stats?.outings || 0), max: 1 })
    },
    {
      id: 'p_outing_5', name: '集训达人', icon: '🚄', category: '出境集训',
      desc: '完成 5 次外出集训。',
      check: g => Number(g?.stats?.outings || 0) >= 5,
      progress: g => ({ cur: Number(g?.stats?.outings || 0), max: 5 })
    },
    {
      id: 'p_overseas_1', name: '出国看看', icon: '✈️', category: '出境集训',
      desc: '完成 1 次出境集训。',
      check: g => Number(g?.stats?.overseasTrips || 0) >= 1,
      progress: g => ({ cur: Number(g?.stats?.overseasTrips || 0), max: 1 })
    },
    {
      id: 'p_overseas_3', name: '常旅客', icon: '🛫', category: '出境集训',
      desc: '完成 3 次出境集训。',
      check: g => Number(g?.stats?.overseasTrips || 0) >= 3,
      progress: g => ({ cur: Number(g?.stats?.overseasTrips || 0), max: 3 })
    },

    /* ---------- 队伍与教练 ---------- */
    {
      id: 'p_train_1', name: '第一次训练', icon: '🏫', category: '队伍与教练',
      desc: '安排 1 次训练。',
      check: g => Number(g?.stats?.trainings || 0) >= 1,
      progress: g => ({ cur: Number(g?.stats?.trainings || 0), max: 1 })
    },
    {
      id: 'p_train_25', name: '勤能补拙', icon: '🏋️', category: '队伍与教练',
      desc: '累计安排 25 次训练。',
      check: g => Number(g?.stats?.trainings || 0) >= 25,
      progress: g => ({ cur: Number(g?.stats?.trainings || 0), max: 25 })
    },
    {
      id: 'p_train_75', name: '训练狂人', icon: '🥇', category: '队伍与教练',
      desc: '累计安排 75 次训练。',
      check: g => Number(g?.stats?.trainings || 0) >= 75,
      progress: g => ({ cur: Number(g?.stats?.trainings || 0), max: 75 })
    },
    {
      id: 'p_team_8', name: '队伍成型', icon: '👥', category: '队伍与教练',
      desc: '同时在队的学生达到 8 人。',
      check: g => Number(g?.stats?.maxParty || 0) >= 8,
      progress: g => ({ cur: Number(g?.stats?.maxParty || 0), max: 8 })
    },
    {
      id: 'p_week_10', name: '十周过去了', icon: '📅', category: '队伍与教练',
      desc: '把赛季推进到第 10 周。',
      check: g => Number(g?.week || 0) >= 10,
      progress: g => ({ cur: Math.min(Number(g?.week || 0), 10), max: 10 })
    },
    {
      id: 'p_week_20', name: '时间过半', icon: '⏳', category: '队伍与教练',
      desc: '把赛季推进到第 20 周。',
      check: g => Number(g?.week || 0) >= 20,
      progress: g => ({ cur: Math.min(Number(g?.week || 0), 20), max: 20 })
    },
    {
      id: 'p_season_done', name: '带完一个赛季', icon: '🎓', category: '队伍与教练',
      desc: '完整打完一个赛季。',
      check: g => !!g?.stats?.seasonFinished
    },

    /* ---------- 天赋 ---------- */
    {
      id: 'p_talent_1', name: '天赋初现', icon: '✨', category: '天赋',
      desc: '获得第 1 个天赋。',
      check: g => Number(g?.stats?.talentGains || 0) >= 1,
      progress: g => ({ cur: Number(g?.stats?.talentGains || 0), max: 1 })
    },
    {
      id: 'p_talent_5', name: '天赋成堆', icon: '🌟', category: '天赋',
      desc: '累计获得 5 个天赋。',
      check: g => Number(g?.stats?.talentGains || 0) >= 5,
      progress: g => ({ cur: Number(g?.stats?.talentGains || 0), max: 5 })
    },
    {
      id: 'p_talent_15', name: '天赋批发', icon: '🎇', category: '天赋',
      desc: '累计获得 15 个天赋。',
      check: g => Number(g?.stats?.talentGains || 0) >= 15,
      progress: g => ({ cur: Number(g?.stats?.talentGains || 0), max: 15 })
    },
    {
      id: 'p_talent_4_on_one', name: '六边形选手', icon: '🔷', category: '天赋',
      desc: '让一名学生同时拥有 3 个天赋。',
      check: g => (g?.students || []).some(s => s && s.talents && s.talents.size >= 3),
      progress: g => ({ cur: Math.max(0, ...(g?.students || []).map(s => (s && s.talents) ? s.talents.size : 0)), max: 3 })
    },

    /* ---------- 比赛 ---------- */
    {
      id: 'p_contest_1', name: '初登赛场', icon: '🎯', category: '比赛',
      desc: '参加第 1 场比赛。',
      check: g => Number(g?.stats?.contestsPlayed || 0) >= 1,
      progress: g => ({ cur: Number(g?.stats?.contestsPlayed || 0), max: 1 })
    },
    {
      id: 'p_contest_5', name: '老练选手', icon: '📜', category: '比赛',
      desc: '参加 5 场比赛。',
      check: g => Number(g?.stats?.contestsPlayed || 0) >= 5,
      progress: g => ({ cur: Number(g?.stats?.contestsPlayed || 0), max: 5 })
    },
    {
      id: 'p_contest_10', name: '身经百战', icon: '🗡️', category: '比赛',
      desc: '参加 10 场比赛。',
      check: g => Number(g?.stats?.contestsPlayed || 0) >= 10,
      progress: g => ({ cur: Number(g?.stats?.contestsPlayed || 0), max: 10 })
    },
    {
      id: 'p_pass_first', name: '首次晋级', icon: '✅', category: '比赛',
      desc: '有学生在任意一场比赛里成功晋级。',
      check: g => __career(g).some(rec => rec && Number(rec.passedCount || 0) >= 1)
    },
    {
      id: 'p_reach_noip', name: '打进 NOIP', icon: '🚩', category: '比赛',
      desc: '有学生拿到 NOIP 的参赛资格或成绩。',
      check: g => __reachedComp(g, 'NOIP')
    },
    {
      id: 'p_reach_prov', name: '省选选手', icon: '🏵️', category: '比赛',
      desc: '有学生打进省选。',
      check: g => __reachedComp(g, '省选')
    },
    {
      id: 'p_reach_noi', name: '站上 NOI', icon: '🏛️', category: '比赛',
      desc: '有学生打进 NOI。',
      check: g => __reachedComp(g, 'NOI')
    },
    {
      id: 'p_medal_first', name: '第一枚奖牌', icon: '🎖️', category: '比赛',
      desc: '学生在 NOI 或 IOI 拿到任意一枚奖牌。',
      check: g => __hasAnyMedal(g)
    },
    {
      id: 'p_perfect', name: '满分时刻', icon: '💯', category: '比赛',
      desc: '有学生在比赛里拿到全场满分。',
      check: g => Number(g?.stats?.perfectScores || 0) >= 1,
      progress: g => ({ cur: Number(g?.stats?.perfectScores || 0), max: 1 })
    },
    {
      id: 'p_first_place', name: '全场第一', icon: '🏆', category: '比赛',
      desc: '有学生在任意一场比赛里拿到最高分。',
      check: g => Number(g?.stats?.firstPlaces || 0) >= 1,
      progress: g => ({ cur: Number(g?.stats?.firstPlaces || 0), max: 1 })
    },

    /* ---------- 经营 ---------- */
    {
      id: 'p_budget_250k', name: '经费充裕', icon: '💰', category: '经营',
      desc: '经费达到 ¥250,000。',
      check: g => Number(g?.stats?.maxBudget || g?.budget || 0) >= 250000,
      progress: g => ({ cur: Math.min(Number(g?.stats?.maxBudget || 0), 250000), max: 250000 })
    },
    {
      id: 'p_budget_500k', name: '财大气粗', icon: '🏦', category: '经营',
      desc: '经费达到 ¥500,000。',
      check: g => Number(g?.stats?.maxBudget || g?.budget || 0) >= 500000,
      progress: g => ({ cur: Math.min(Number(g?.stats?.maxBudget || 0), 500000), max: 500000 })
    },
    {
      id: 'p_facility_total5', name: '设施起步', icon: '🏢', category: '经营',
      desc: '设施总等级达到 5。',
      check: g => __facilityTotal(g) >= 5,
      progress: g => ({ cur: __facilityTotal(g), max: 5 })
    },
    {
      id: 'p_facility_all1', name: '全都置办上', icon: '🧰', category: '经营',
      desc: '机房之外的每一种设施都至少升到 mk1。',
      check: g => __allFacilitiesAtLeastOne(g),
      progress: g => __facilityAtLeastOneProgress(g)
    },
    {
      id: 'p_mock_5', name: '以赛代练', icon: '📝', category: '经营',
      desc: '举办 5 场模拟赛。',
      check: g => Number(g?.stats?.mockContests || 0) >= 5,
      progress: g => ({ cur: Number(g?.stats?.mockContests || 0), max: 5 })
    },
    {
      id: 'p_entertain_10', name: '张弛有度', icon: '🎮', category: '经营',
      desc: '安排 10 次娱乐活动。',
      check: g => Number(g?.stats?.entertainments || 0) >= 10,
      progress: g => ({ cur: Number(g?.stats?.entertainments || 0), max: 10 })
    },
    {
      id: 'p_work_10', name: '半工半读', icon: '🧱', category: '经营',
      desc: '让学生去打工 10 次。',
      check: g => Number(g?.stats?.works || 0) >= 10,
      progress: g => ({ cur: Number(g?.stats?.works || 0), max: 10 })
    },

    /* ---------- 心态 ---------- */
    {
      id: 'p_rep_70', name: '小有名气', icon: '🌟', category: '心态',
      desc: '声誉达到 70。',
      check: g => Number(g?.stats?.maxReputation || g?.reputation || 0) >= 70,
      progress: g => ({ cur: Math.min(Number(g?.stats?.maxReputation || 0), 70), max: 70 })
    },
    {
      id: 'p_comfort_70', name: '环境舒适', icon: '🛋️', category: '心态',
      desc: '有学生的舒适度达到 70。',
      check: g => (g?.students || []).some(s => s && s.active !== false && Number(s.comfort || 0) >= 70),
      progress: g => ({ cur: Math.round(Math.max(0, ...(g?.students || []).map(s => (s && s.active !== false) ? Number(s.comfort || 0) : 0))), max: 70 })
    },
    {
      id: 'p_no_sick_10', name: '平安十周', icon: '🩺', category: '心态',
      desc: '打到第 10 周，期间没有任何学生生病。',
      check: g => Number(g?.week || 0) >= 10 && Number(g?.stats?.sicknesses || 0) === 0,
      progress: g => ({ cur: Math.min(Number(g?.week || 0), 10), max: 10 })
    },
    {
      id: 'p_calm_team', name: '全员轻松', icon: '😌', category: '心态',
      desc: '某一周里，所有在队学生的压力都不超过 40。',
      check: g => {
        const act = (g?.students || []).filter(s => s && s.active !== false);
        return act.length >= 3 && act.every(s => Number(s.pressure || 0) <= 40);
      }
    },

    /* ---------- 彩蛋 ---------- */
    {
      id: 'p_daily_played', name: '今日挑战', icon: '📆', category: '彩蛋',
      desc: '开一局今日挑战。',
      check: g => !!g?.isDailyChallenge
    },
    {
      id: 'p_talk_10', name: '教练的嘴', icon: '🗣️', category: '彩蛋',
      desc: '训话 10 次。',
      check: g => Number(g?.stats?.talks || 0) >= 10,
      progress: g => ({ cur: Number(g?.stats?.talks || 0), max: 10 })
    }
  ];

  /** 全部隐藏成就定义 */
  const HIDDEN_ACHIEVEMENTS = [
    /* ==================== 出境集训 ==================== */
    {
      id: 'world_tour', name: '世界那么大', icon: '🌍', category: '出境集训',
      desc: '完成第一次出境集训。',
      hint: '迈出第一步总是最贵的。',
      check: g => Number(g?.stats?.overseasTrips || 0) >= 1,
      progress: g => ({ cur: Math.min(1, Number(g?.stats?.overseasTrips || 0)), max: 1 })
    },
    {
      id: 'globetrotter', name: '护照盖满了', icon: '🛂', category: '出境集训',
      desc: '同一局游戏内去过 12 个不同的国家 / 地区集训。',
      hint: '多出去走走。',
      check: g => Array.isArray(g?.stats?.overseasCountries) && g.stats.overseasCountries.length >= 12,
      progress: g => ({ cur: (g?.stats?.overseasCountries || []).length, max: 12 })
    },
    {
      id: 'world_tourer_all', name: '环球旅行家', icon: '✈️', category: '出境集训',
      desc: '同一局游戏内去过 30 个不同的国家 / 地区集训。',
      hint: '地球就这么大。',
      check: g => Array.isArray(g?.stats?.overseasCountries) && g.stats.overseasCountries.length >= 30,
      progress: g => ({ cur: (g?.stats?.overseasCountries || []).length, max: 30 })
    },
    {
      id: 'money_printer', name: '钞能力', icon: '💸', category: '出境集训',
      desc: '单次出境集训花费达到 ¥200,000。',
      hint: '有钱真的可以为所欲为。',
      check: g => Number(g?.stats?.maxOverseasCost || 0) >= 200000
    },
    {
      id: 'almost_broke', name: '就剩一口气', icon: '🫠', category: '出境集训',
      desc: '一次出境集训结算后，经费不足 ¥5,000。',
      hint: '差点就回不来了。',
      check: g => !!g?.stats?.almostBrokeOverseas
    },
    {
      id: 'overseas_fail', name: '学费交够了', icon: '🧾', category: '出境集训',
      desc: '因为经费不足，出境集训直接失败。',
      hint: '钱包给上的第一课。',
      check: g => Number(g?.stats?.overseasFailures || 0) >= 1
    },
    {
      id: 'incident_survivor', name: '活着回来就算赢', icon: '🧳', category: '出境集训',
      desc: '一次出境集训里连着遇到两起意外。',
      hint: '人在囧途。',
      check: g => Number(g?.stats?.maxIncidentsInTrip || 0) >= 2
    },
    {
      id: 'home_away', name: '出门在外', icon: '🚄', category: '出境集训',
      desc: '累计进行 10 次集训（国内 / 出境都算）。',
      hint: '训练基地在哪都不重要。',
      check: g => Number(g?.stats?.outings || 0) + Number(g?.stats?.overseasTrips || 0) >= 10,
      progress: g => ({ cur: Number(g?.stats?.outings || 0) + Number(g?.stats?.overseasTrips || 0), max: 10 })
    },

    /* ==================== 队伍与教练 ==================== */
    {
      id: 'full_house', name: '满编出征', icon: '👥', category: '队伍与教练',
      desc: '同时在队的学生达到 10 人。',
      hint: '人多热闹。',
      check: g => Number(g?.stats?.maxParty || 0) >= 10,
      progress: g => ({ cur: Number(g?.stats?.maxParty || 0), max: 10 })
    },
    {
      id: 'no_quit_season', name: '一个都不能少', icon: '🤝', category: '队伍与教练',
      desc: '完整打完一个赛季，且没有任何学生退队。',
      hint: '带完整支队伍比带出一个天才更难。',
      check: g => !!g?.stats?.seasonFinished && Number(g?.quit_students || 0) === 0
    },
    {
      id: 'all_quit', name: '团灭', icon: '🪦', category: '队伍与教练',
      desc: '所有学生都退队了，项目失败。',
      hint: '空荡荡的机房。',
      check: g => !!g?.stats?.badEnding && (g?.students || []).filter(s => s && s.active !== false).length === 0
    },
    {
      id: 'lone_survivor', name: '独苗', icon: '🌱', category: '队伍与教练',
      desc: '队伍里只剩下 1 名学生，而且还没有结束。',
      hint: '还有一个人在。',
      check: g => {
        const act = (g?.students || []).filter(s => s && s.active !== false).length;
        return act === 1 && Number(g?.week || 0) >= 5 && !g?.seasonEndTriggered;
      }
    },
    {
      id: 'evict_one', name: '挥泪斩马谡', icon: '📤', category: '队伍与教练',
      desc: '主动劝退一名学生。',
      hint: '有时候放手才是负责。',
      check: g => Number(g?.stats?.evictions || 0) >= 1
    },
    {
      id: 'evict_five', name: '人事主管', icon: '🗂️', category: '队伍与教练',
      desc: '一局游戏里劝退 5 名学生。',
      hint: '队里不缺人。',
      check: g => Number(g?.stats?.evictions || 0) >= 5,
      progress: g => ({ cur: Number(g?.stats?.evictions || 0), max: 5 })
    },
    {
      id: 'comeback', name: '悬崖勒马', icon: '🧗', category: '队伍与教练',
      desc: '把一名已经产生「退队倾向」的学生拉了回来。',
      hint: '一周时间，够了。',
      check: g => Number(g?.stats?.rescues || 0) >= 1
    },
    {
      id: 'mass_tendency', name: '集体边缘', icon: '⚠️', category: '队伍与教练',
      desc: '同一周里有 3 名学生同时产生退队倾向。',
      hint: '是不是该放假了。',
      check: g => (g?.students || []).filter(s => s && s.active !== false && Number(s.quit_tendency_weeks || 0) >= 1).length >= 3
    },
    {
      id: 'female_team', name: '女队之路', icon: '🚺', category: '队伍与教练',
      desc: '有学生走上了女队发展道路。',
      hint: '泰国是个好地方。',
      check: g => (g?.students || []).some(s => s && s.femaleTeamPath)
    },

    /* ==================== 天赋 ==================== */
    {
      id: 'talent_factory', name: '天赋工厂', icon: '🏭', category: '天赋',
      desc: '一局游戏里累计获得 10 个天赋。',
      hint: '天赋是可以造出来的。',
      check: g => Number(g?.stats?.talentGains || 0) >= 10,
      progress: g => ({ cur: Number(g?.stats?.talentGains || 0), max: 10 })
    },
    {
      id: 'talent_lost', name: '花无百日红', icon: '🍂', category: '天赋',
      desc: '第一次目睹学生失去天赋。',
      hint: '得到过，也会失去。',
      check: g => Number(g?.stats?.talentLosses || 0) >= 1
    },
    {
      id: 'talent_hoarder', name: '天赋收藏家', icon: '🎖️', category: '天赋',
      desc: '同一局游戏内集齐 5 种隐藏天赋。',
      hint: '收集癖的胜利。',
      check: g => __countDistinctHiddenTalents(g) >= 5,
      progress: g => ({ cur: __countDistinctHiddenTalents(g), max: 5 })
    },
    {
      id: 'talent_hoarder_all', name: '图鉴全开', icon: '🧩', category: '天赋',
      desc: '集齐全部隐藏天赋。',
      hint: '一个都不能漏。',
      check: g => {
        const total = __hiddenTalentList().length;
        return total > 0 && __countDistinctHiddenTalents(g) >= total;
      },
      progress: g => ({ cur: __countDistinctHiddenTalents(g), max: __hiddenTalentList().length })
    },
    {
      id: 'triple_crown', name: '三花聚顶', icon: '🃏', category: '天赋',
      desc: '同一名学生同时拥有 3 个隐藏天赋。',
      hint: '一个人就是一支队伍。',
      check: g => (g?.students || []).some(s => __countStudentHiddenTalents(s) >= 3)
    },
    {
      id: 'talent_maxed', name: '天赋异禀', icon: '✨', category: '天赋',
      desc: '有学生把天赋栏塞满了。',
      hint: '塞满就对了。',
      check: g => (g?.students || []).some(s => s && s.talents && s.talents.size >= 4)
    },
    {
      id: 'chtholly', name: '我永远喜欢珂朵莉', icon: '💙', category: '天赋',
      desc: '招收到珂朵莉。',
      hint: '如果幸福有颜色。',
      check: g => (g?.students || []).some(s => s && s.name === '珂朵莉')
    },
    {
      id: 'lxl', name: '你还想要几个李欣隆？', icon: '🐉', category: '天赋',
      desc: '把超级学生李欣隆招进队伍。',
      hint: '顺着味就来了。',
      check: g => (g?.students || []).some(s => s && s.name === '李欣隆')
    },
    {
      id: 'wzl', name: '珂学家', icon: '🧪', category: '天赋',
      desc: '把 wzl 招进队伍。',
      hint: '有人练 JS 练出了人。',
      check: g => (g?.students || []).some(s => s && s.name === 'wzl')
    },

    /* ==================== 比赛 ==================== */
    {
      id: 'contest_veteran', name: '身经百战', icon: '📜', category: '比赛',
      desc: '一局游戏里打完 12 场比赛。',
      hint: '打得多总会赢一次。',
      check: g => Number(g?.stats?.contestsPlayed || 0) >= 12,
      progress: g => ({ cur: Number(g?.stats?.contestsPlayed || 0), max: 12 })
    },
    {
      id: 'first_place', name: '力压群雄', icon: '🏆', category: '比赛',
      desc: '有学生在任意一场比赛里拿到全场最高分。',
      hint: '第一名的位置只有一个。',
      check: g => Number(g?.stats?.firstPlaces || 0) >= 1
    },
    {
      id: 'perfect_score', name: '满分选手', icon: '💯', category: '比赛',
      desc: '有学生在比赛里拿到满分。',
      hint: '一个点都没丢。',
      check: g => Number(g?.stats?.perfectScores || 0) >= 1
    },
    {
      id: 'podium', name: '站上领奖台', icon: '🎖️', category: '比赛',
      desc: '学生在 NOI 或 IOI 拿到任意一枚奖牌。',
      hint: '铜的也算。',
      check: g => __hasAnyMedal(g)
    },
    {
      id: 'noi_gold', name: '金光闪闪', icon: '🥇', category: '比赛',
      desc: '学生在 NOI 拿到金牌。',
      hint: '含金量拉满。',
      check: g => __hasMedal(g, 'NOI', 'gold')
    },
    {
      id: 'ioi_medal', name: '世界舞台', icon: '🌐', category: '比赛',
      desc: '学生在 IOI 拿到奖牌。',
      hint: '站上去了。',
      check: g => __hasAnyMedal(g, 'IOI')
    },
    {
      id: 'ioi_ak', name: 'AK IOI', icon: '👑', category: '比赛',
      desc: '学生在 IOI 上拿到满分。',
      hint: '人类智慧的巅峰。',
      check: g => __hasIoiFullScore(g) || (g?.endingReason && String(g.endingReason).indexOf('AKIOI') >= 0)
    },
    {
      id: 'national_team', name: '国家队', icon: '🎽', category: '比赛',
      desc: '有学生入选国家队（IOI 名单）。',
      hint: '差一步就是世界冠军。',
      check: g => Array.isArray(g?.nationalTeamResults?.ioiQualified) && g.nationalTeamResults.ioiQualified.length >= 1
    },
    {
      id: 'sweep', name: '横扫千军', icon: '🧹', category: '比赛',
      desc: '同一场比赛里，你的学生包揽前三名。',
      hint: '颁奖台不够站。',
      check: g => __hasSweep(g)
    },

    /* ==================== 经营 ==================== */
    {
      id: 'tycoon', name: '富可敌国', icon: '💰', category: '经营',
      desc: '经费曾经达到 ¥1,000,000。',
      hint: '钱多到花不完。',
      check: g => Number(g?.stats?.maxBudget || g?.budget || 0) >= 1000000,
      progress: g => ({ cur: Math.min(Number(g?.stats?.maxBudget || 0), 1000000), max: 1000000 })
    },
    {
      id: 'tight_belt', name: '勒紧裤腰带', icon: '🪙', category: '经营',
      desc: '经费一度低于 ¥5,000，但还是把赛季打完了。',
      hint: '穷过，但没倒。',
      check: g => Number(g?.stats?.minBudget) <= 5000 && !!g?.stats?.seasonFinished
    },
    {
      id: 'facility_max', name: '五星机房', icon: '🏢', category: '经营',
      desc: '把所有设施都升到满级。',
      hint: '硬件也是实力的一部分。',
      check: g => __allFacilitiesMax(g),
      progress: g => __facilityProgress(g)
    },
    {
      id: 'reputation_90', name: '名声在外', icon: '🌟', category: '经营',
      desc: '声誉曾经达到 90。',
      hint: '圈里人都认识你。',
      check: g => Number(g?.stats?.maxReputation || g?.reputation || 0) >= 90,
      progress: g => ({ cur: Number(g?.stats?.maxReputation || 0), max: 90 })
    },
    {
      id: 'reputation_low', name: '声名狼藉', icon: '🗑️', category: '经营',
      desc: '声誉掉到 10 以下。',
      hint: '口碑也是资产。',
      check: g => Number(g?.reputation || 0) <= 10
    },
    {
      id: 'workaholic', name: '黑心教练', icon: '🧱', category: '经营',
      desc: '让学生去打工 20 次。',
      hint: '压榨也是一种培养。',
      check: g => Number(g?.stats?.works || 0) >= 20,
      progress: g => ({ cur: Number(g?.stats?.works || 0), max: 20 })
    },
    {
      id: 'train_100', name: '百炼成钢', icon: '🏋️', category: '经营',
      desc: '累计进行 100 次训练。',
      hint: '没有捷径。',
      check: g => Number(g?.stats?.trainings || 0) >= 100,
      progress: g => ({ cur: Number(g?.stats?.trainings || 0), max: 100 })
    },
    {
      id: 'extra_maniac', name: '加训狂魔', icon: '🔥', category: '经营',
      desc: '累计加训 30 次。',
      hint: '卷是可以卷死人的。',
      check: g => Number(g?.stats?.extraTrainings || 0) >= 30,
      progress: g => ({ cur: Number(g?.stats?.extraTrainings || 0), max: 30 })
    },
    {
      id: 'relax_master', name: '劳逸结合', icon: '🎮', category: '经营',
      desc: '累计安排 30 次娱乐活动。',
      hint: '会休息的人才会训练。',
      check: g => Number(g?.stats?.entertainments || 0) >= 30,
      progress: g => ({ cur: Number(g?.stats?.entertainments || 0), max: 30 })
    },
    {
      id: 'mock_regular', name: '模拟赛常客', icon: '📝', category: '经营',
      desc: '累计举办 20 场模拟赛。',
      hint: '以赛代练。',
      check: g => Number(g?.stats?.mockContests || 0) >= 20,
      progress: g => ({ cur: Number(g?.stats?.mockContests || 0), max: 20 })
    },

    /* ==================== 心态 ==================== */
    {
      id: 'pressure_max', name: '压力山大', icon: '🌋', category: '心态',
      desc: '有学生的压力顶到了 100。',
      hint: '绷不住了。',
      check: g => (g?.students || []).some(s => s && s.active !== false && Number(s.pressure || 0) >= 100) ||
                 Number(g?.stats?.maxPressureSeen || 0) >= 100
    },
    {
      id: 'all_sick', name: '病友交流会', icon: '🤒', category: '心态',
      desc: '同一周里有 3 名学生生病。',
      hint: '队医到底在哪。',
      check: g => (g?.students || []).filter(s => s && s.active !== false && Number(s.sick_weeks || 0) > 0).length >= 3 ||
                 Number(g?.stats?.sickAtOnce || 0) >= 3
    },
    {
      id: 'zen', name: '全员归零', icon: '🧘', category: '心态',
      desc: '某一周里，所有在队学生的压力都是 0。',
      hint: '难得清净。',
      check: g => {
        const act = (g?.students || []).filter(s => s && s.active !== false);
        return act.length > 0 && act.every(s => Number(s.pressure || 0) <= 0);
      }
    },
    {
      id: 'comfort_max', name: '宾至如归', icon: '🛋️', category: '心态',
      desc: '有学生的舒适度达到 100。',
      hint: '环境是最好的老师。',
      check: g => (g?.students || []).some(s => s && s.active !== false && Number(s.comfort || 0) >= 100)
    },
    {
      id: 'iron_body', name: '铁打的身体', icon: '💪', category: '心态',
      desc: '整个赛季没有任何学生生病。',
      hint: '队医终于领到了工资。',
      check: g => !!g?.stats?.seasonFinished && Number(g?.stats?.sicknesses || 0) === 0
    },
    {
      id: 'big_mouth', name: '嘴强王者', icon: '🗣️', category: '心态',
      desc: '累计训话 50 次。',
      hint: '说多了都是泪。',
      check: g => Number(g?.stats?.talks || 0) >= 50,
      progress: g => ({ cur: Number(g?.stats?.talks || 0), max: 50 })
    },

    /* ==================== 彩蛋 ==================== */
    {
      id: 'bankrupt', name: '破产也是一种结局', icon: '💀', category: '彩蛋',
      desc: '以"经费耗尽"收场。',
      hint: '钱花完了，故事也就结束了。',
      check: g => !!g?.stats?.bankruptEnding
    },
    {
      id: 'daily_challenge', name: '今日挑战者', icon: '📅', category: '彩蛋',
      desc: '完成一局今日挑战（赛季结算）。',
      hint: '今天所有人都在同一条起跑线上。',
      check: g => !!g?.isDailyChallenge && !!g?.stats?.seasonFinished
    },
    {
      id: 'daily_played', name: '签到一下', icon: '🗓️', category: '彩蛋',
      desc: '开一局今日挑战。',
      hint: '每天一次，不亏。',
      check: g => !!g?.isDailyChallenge
    },
    {
      id: 'debug_user', name: '作弊可耻但有用', icon: '🐞', category: '彩蛋',
      desc: '在控制台里呼唤过作弊函数。',
      hint: 'F12 是你的朋友。',
      check: () => false // 只能由调试函数显式 unlock
    }
  ];

  /* ==================== 两类成就的合并 ==================== */

  /* kind 标记：'public' = 外显成就（一直可见），'hidden' = 隐藏成就（解锁前只显示 ？？？） */
  PUBLIC_ACHIEVEMENTS.forEach(function (d) { d.kind = 'public'; });
  HIDDEN_ACHIEVEMENTS.forEach(function (d) { d.kind = 'hidden'; });

  /** 全部成就（外显 + 隐藏） */
  const ALL_ACHIEVEMENTS = PUBLIC_ACHIEVEMENTS.concat(HIDDEN_ACHIEVEMENTS);

  /* ==================== 内部辅助（纯读取，无副作用） ==================== */

  function __st(g, key, dflt) {
    try {
      const v = g && g.stats ? g.stats[key] : undefined;
      return (v === undefined || v === null) ? dflt : v;
    } catch (e) { return dflt; }
  }

  function __hiddenTalentList() {
    try {
      if (typeof HIDDEN_TALENTS !== 'undefined' && Array.isArray(HIDDEN_TALENTS)) {
        return HIDDEN_TALENTS.filter(n => n !== '__talent_cleanup__');
      }
    } catch (e) { }
    return [];
  }

  function __countStudentHiddenTalents(s) {
    try {
      if (!s || !s.talents || typeof s.talents.has !== 'function') return 0;
      return __hiddenTalentList().filter(n => s.talents.has(n)).length;
    } catch (e) { return 0; }
  }

  function __countDistinctHiddenTalents(g) {
    const found = new Set();
    __hiddenTalentList().forEach(function (n) {
      if ((g?.students || []).some(s => s && s.talents && typeof s.talents.has === 'function' && s.talents.has(n))) found.add(n);
    });
    return found.size;
  }

  function __career(g) {
    return (g && Array.isArray(g.careerCompetitions)) ? g.careerCompetitions : [];
  }

  function __hasMedal(g, compName, medal) {
    try {
      return __career(g).some(rec => rec && rec.name === compName && Array.isArray(rec.entries) &&
        rec.entries.some(e => e && e.medal === medal));
    } catch (e) { return false; }
  }

  function __hasAnyMedal(g, compName) {
    try {
      return __career(g).some(rec => {
        if (!rec || !Array.isArray(rec.entries)) return false;
        if (compName && rec.name !== compName) return false;
        return rec.entries.some(e => e && (e.medal === 'gold' || e.medal === 'silver' || e.medal === 'bronze'));
      });
    } catch (e) { return false; }
  }

  function __hasIoiFullScore(g) {
    try {
      return __career(g).some(rec => {
        if (!rec || rec.name !== 'IOI' || !Array.isArray(rec.entries)) return false;
        return rec.entries.some(e => e && Number(e.score || 0) >= 400);
      });
    } catch (e) { return false; }
  }

  /** 是否打进过某场比赛（有成绩记录，或拿到了该比赛的晋级资格） */
  function __reachedComp(g, name) {
    try {
      if (__career(g).some(rec => rec && rec.name === name && Number(rec.totalStudents || 0) > 0)) return true;
      const q = (g && Array.isArray(g.qualification)) ? g.qualification : [];
      return q.some(function (half) {
        const set = half && half[name];
        return !!(set && typeof set.size === 'number' && set.size > 0);
      });
    } catch (e) { return false; }
  }

  /** 设施总等级（不含机房） */
  function __facilityTotal(g) {
    const defs = __facilityDefs();
    const fac = g && g.facilities ? g.facilities : null;
    if (!defs || !fac) return 0;
    return Object.keys(defs).filter(k => k !== 'computer_room')
      .reduce((sum, k) => sum + Number(fac[k] || 0), 0);
  }

  /** 机房之外的每一种设施是否都至少 mk1 */
  function __allFacilitiesAtLeastOne(g) {
    const defs = __facilityDefs();
    const fac = g && g.facilities ? g.facilities : null;
    if (!defs || !fac) return false;
    return Object.keys(defs).filter(k => k !== 'computer_room').every(k => Number(fac[k] || 0) >= 1);
  }

  /** 「全都置办上」的进度 */
  function __facilityAtLeastOneProgress(g) {
    const defs = __facilityDefs();
    const fac = g && g.facilities ? g.facilities : null;
    if (!defs || !fac) return { cur: 0, max: 1 };
    const keys = Object.keys(defs).filter(k => k !== 'computer_room');
    return { cur: keys.filter(k => Number(fac[k] || 0) >= 1).length, max: Math.max(1, keys.length) };
  }

  /** 同一场比赛里，自己的学生包揽前三名 */
  function __hasSweep(g) {
    try {
      return __career(g).some(rec => {
        if (!rec || !Array.isArray(rec.entries)) return false;
        const top3 = rec.entries.filter(e => e && Number(e.rank || 0) >= 1 && Number(e.rank || 0) <= 3).length;
        return top3 >= 3 && Number(rec.totalStudents || 0) >= 3;
      });
    } catch (e) { return false; }
  }

  function __facilityDefs() {
    try { if (typeof FACILITY_DEFS !== 'undefined' && FACILITY_DEFS) return FACILITY_DEFS; } catch (e) { }
    return null;
  }

  function __facilityProgress(g) {
    const defs = __facilityDefs();
    const fac = g && g.facilities ? g.facilities : null;
    if (!defs || !fac) return { cur: 0, max: 1 };
    const keys = Object.keys(defs).filter(k => k !== 'computer_room');
    let cur = 0, max = 0;
    keys.forEach(function (k) {
      const lv = Number(fac[k] || 0);
      cur += Math.min(lv, defs[k].maxLevel);
      max += defs[k].maxLevel;
    });
    return { cur: cur, max: Math.max(1, max) };
  }

  function __allFacilitiesMax(g) {
    const defs = __facilityDefs();
    const fac = g && g.facilities ? g.facilities : null;
    if (!defs || !fac) return false;
    return Object.keys(defs).every(function (k) {
      const lv = Number(fac[k] || 0);
      return lv >= defs[k].maxLevel;
    });
  }

  /* ==================== 成就管理器 ==================== */

  const AchievementManager = {
    _achievements: HIDDEN_ACHIEVEMENTS,
    _checking: false,

    /** @param {'public'|'hidden'} [kind] 不传则返回全部 */
    list(kind) {
      if (!kind) return ALL_ACHIEVEMENTS.slice();
      return ALL_ACHIEVEMENTS.filter(a => a.kind === kind);
    },
    /** @param {'public'|'hidden'} [kind] 不传则统计全部 */
    total(kind) {
      if (!kind) return ALL_ACHIEVEMENTS.length;
      return ALL_ACHIEVEMENTS.filter(a => a.kind === kind).length;
    },
    get(id) { return ALL_ACHIEVEMENTS.find(a => a.id === id) || null; },
    categories() { return CATEGORY_ORDER.slice(); },
    /** 两类成就的定义表 */
    kinds() { return ['public', 'hidden']; },

    /** 当前已解锁的 id 列表 */
    unlockedIds(game) {
      const g = game || (typeof window !== 'undefined' ? window.game : null);
      try {
        if (!g || !Array.isArray(g.hiddenAchievements)) return [];
        return g.hiddenAchievements.map(x => (typeof x === 'string' ? x : (x && x.id))).filter(Boolean);
      } catch (e) { return []; }
    },
    has(id, game) { return this.unlockedIds(game).indexOf(id) >= 0; },
    count(game) { return this.unlockedIds(game).length; },

    /** 已解锁数量（可按类别筛选） */
    countOf(game, kind) {
      const unlocked = this.unlockedIds(game);
      if (!kind) return unlocked.length;
      return ALL_ACHIEVEMENTS.filter(a => a.kind === kind && unlocked.indexOf(a.id) >= 0).length;
    },

    /** 按分类统计解锁进度（可按类别筛选） */
    countsByCategory(game, kind) {
      const unlocked = this.unlockedIds(game);
      const out = {};
      CATEGORY_ORDER.forEach(function (c) { out[c] = { unlocked: 0, total: 0 }; });
      ALL_ACHIEVEMENTS.forEach(function (def) {
        if (kind && def.kind !== kind) return;
        const c = def.category || '彩蛋';
        if (!out[c]) out[c] = { unlocked: 0, total: 0 };
        out[c].total++;
        if (unlocked.indexOf(def.id) >= 0) out[c].unlocked++;
      });
      // 该类别下没有任何成就的分类，从结果里去掉，避免面板出现空分组
      if (kind) {
        Object.keys(out).forEach(function (c) { if (out[c].total === 0) delete out[c]; });
      }
      return out;
    },

    /** 单个成就的进度（没有 progress 的实现就返回 null） */
    progressOf(id, game) {
      const def = this.get(id);
      if (!def || typeof def.progress !== 'function') return null;
      try {
        const g = game || (typeof window !== 'undefined' ? window.game : null);
        const p = def.progress(g);
        if (!p || typeof p.cur !== 'number' || typeof p.max !== 'number' || p.max <= 0) return null;
        return { cur: Math.max(0, Math.min(p.cur, p.max)), max: p.max };
      } catch (e) { return null; }
    },

    /** 解锁一个成就；返回是否"本次新解锁" */
    unlock(id, game) {
      const g = game || (typeof window !== 'undefined' ? window.game : null);
      const def = this.get(id);
      if (!g || !def) return false;
      try {
        if (!Array.isArray(g.hiddenAchievements)) g.hiddenAchievements = [];
        if (this.unlockedIds(g).indexOf(id) >= 0) return false;
        g.hiddenAchievements.push({ id: id, week: Number(g.week || 0), kind: def.kind || 'hidden' });
        const label = (def.kind === 'public') ? '成就' : '隐藏成就';
        const text = (def.icon || '🏅') + ' ' + label + '解锁：「' + def.name + '」——' + def.desc;
        try { if (typeof window !== 'undefined' && window.pushEvent) window.pushEvent({ name: label, description: text, week: g.week }); } catch (e) { }
        try {
          if (typeof window !== 'undefined' && window.toastManager && typeof window.toastManager.show === 'function') {
            window.toastManager.show((def.icon || '🏅') + ' ' + label + '解锁：' + def.name, 'success');
          }
        } catch (e) { }
        try { if (typeof log === 'function') log('[' + label + '] ' + def.name + '（' + def.desc + '）'); } catch (e) { }
        try { if (typeof window !== 'undefined' && typeof window.updateAchievementBadge === 'function') window.updateAchievementBadge(); } catch (e) { }
        return true;
      } catch (e) { console.error('AchievementManager.unlock failed', e); return false; }
    },

    /** 全量扫描一遍游戏状态，自动解锁所有已满足条件的成就 */
    checkAll(game) {
      const g = game || (typeof window !== 'undefined' ? window.game : null);
      if (!g) return [];
      if (this._checking) return [];
      this._checking = true;
      const gained = [];
      try {
        ALL_ACHIEVEMENTS.forEach(function (def) {
          try {
            if (typeof def.check !== 'function') return;
            if (AchievementManager.has(def.id, g)) return;
            if (def.check(g) && AchievementManager.unlock(def.id, g)) gained.push(def.id);
          } catch (e) { console.error('achievement check failed', def && def.id, e); }
        });
      } catch (e) { console.error('AchievementManager.checkAll failed', e); }
      this._checking = false;
      return gained;
    },

    /** 单个成就卡片的 HTML */
    cardHtml(def, on, g) {
      let progressHtml = '';
      if (!on) {
        const p = this.progressOf(def.id, g);
        if (p) {
          const pct = Math.round(p.cur / p.max * 100);
          progressHtml = '<div class="ach-progress"><div class="ach-progress-bar" style="width:' + pct + '%"></div></div>' +
            '<div class="ach-progress-text">' + p.cur + ' / ' + p.max + '</div>';
        }
      }
      // 外显成就：锁着也把名字 / 说明亮出来，配进度条，告诉玩家目标在哪
      // 隐藏成就：解锁前只有 ？？？ 和一句提示
      const isPublic = def.kind === 'public';
      const showName = on || isPublic;
      const title = showName ? ((def.icon || '🏅') + ' ' + def.name) : '❓ ？？？';
      const descText = on ? def.desc : (isPublic ? def.desc : def.hint);
      return '<div class="ach-card' + (on ? ' ach-on' : '') + (isPublic ? ' ach-public' : ' ach-secret') + '">' +
        '<div class="ach-title">' + title + '</div>' +
        '<div class="ach-desc">' + descText + '</div>' +
        progressHtml +
        '</div>';
    },

    /** 一个类别区（一组卡片）的 HTML */
    sectionHtml(kind, g, unlocked) {
      const byCat = this.countsByCategory(g, kind);
      const defsAll = ALL_ACHIEVEMENTS.filter(d => d.kind === kind);
      let html = '';

      // 分类总览
      html += '<div class="ach-cats">';
      CATEGORY_ORDER.forEach(function (c) {
        if (!byCat[c]) return;
        const s = byCat[c];
        const done = s.total > 0 && s.unlocked >= s.total;
        html += '<span class="ach-cat-chip' + (done ? ' ach-cat-done' : '') + '">' + c + ' ' + s.unlocked + '/' + s.total + '</span>';
      });
      html += '</div>';

      CATEGORY_ORDER.forEach(function (c) {
        const defs = defsAll.filter(d => (d.category || '彩蛋') === c);
        if (defs.length === 0) return;
        const s = byCat[c] || { unlocked: 0, total: 0 };
        html += '<div class="ach-group-title">' + c + ' <span class="muted small">' + s.unlocked + '/' + s.total + '</span></div>';
        html += '<div class="ach-grid">';
        defs.forEach(function (def) {
          html += AchievementManager.cardHtml(def, unlocked.indexOf(def.id) >= 0, g);
        });
        html += '</div>';
      });

      return html;
    },

    /**
     * 成就面板 HTML。
     * 分两栏（Tab）：🏅 成就（外显，随时可看） / ❓ 隐藏成就（解锁前不剧透）。
     */
    renderPanelHtml(game) {
      const g = game || (typeof window !== 'undefined' ? window.game : null);
      const unlocked = this.unlockedIds(g);
      const pubCount = this.countOf(g, 'public');
      const hidCount = this.countOf(g, 'hidden');
      const pubTotal = this.total('public');
      const hidTotal = this.total('hidden');

      let html = '<div class="ach-panel">';
      html += '<div class="ach-head">🏅 成就 ' + unlocked.length + ' / ' + ALL_ACHIEVEMENTS.length + '</div>';

      // 两栏 Tab
      html += '<div class="ach-tabs">' +
        '<button type="button" class="ach-tab ach-tab-on" data-ach-tab="public" onclick="oiAchTab(\'public\')">🏅 成就 <span class="ach-tab-num">' + pubCount + '/' + pubTotal + '</span></button>' +
        '<button type="button" class="ach-tab" data-ach-tab="hidden" onclick="oiAchTab(\'hidden\')">❓ 隐藏成就 <span class="ach-tab-num">' + hidCount + '/' + hidTotal + '</span></button>' +
        '</div>';

      // 第一栏：外显成就
      html += '<div class="ach-section" data-ach-kind="public" style="display:block">';
      html += '<div class="ach-hint small muted">明牌目标：解锁前后都能看到名字和条件，照着做就行。</div>';
      html += this.sectionHtml('public', g, unlocked);
      html += '</div>';

      // 第二栏：隐藏成就
      html += '<div class="ach-section" data-ach-kind="hidden" style="display:none">';
      html += '<div class="ach-hint small muted">本轮偷偷记录着的彩蛋成就，解锁前只显示「？？？」和一句提示。</div>';
      html += this.sectionHtml('hidden', g, unlocked);
      html += '</div>';

      html += '</div>';
      return html;
    },

    /** 一句话汇报（结算页 / 控制台用） */
    summaryText(game) {
      const unlocked = this.unlockedIds(game);
      return '成就 ' + unlocked.length + ' / ' + ALL_ACHIEVEMENTS.length +
        '（外显 ' + this.countOf(game, 'public') + '/' + this.total('public') +
        ' · 隐藏 ' + this.countOf(game, 'hidden') + '/' + this.total('hidden') + '）';
    }
  };

  /** 成就面板的 Tab 切换（面板 HTML 里用 onclick 直接调用） */
  function oiAchTab(kind) {
    try {
      const root = document.querySelector('.ach-panel');
      if (!root) return;
      Array.prototype.forEach.call(root.querySelectorAll('.ach-tab'), function (el) {
        if (el.dataset.achTab === kind) el.classList.add('ach-tab-on');
        else el.classList.remove('ach-tab-on');
      });
      Array.prototype.forEach.call(root.querySelectorAll('.ach-section'), function (el) {
        el.style.display = (el.dataset.achKind === kind) ? 'block' : 'none';
      });
    } catch (e) { console.error('oiAchTab failed', e); }
  }

  /** 顶栏徽章计数（外显 + 隐藏的总数） */
  function updateAchievementBadge() {
    try {
      const el = document.getElementById('ach-badge-count');
      if (!el) return;
      el.textContent = AchievementManager.count() + '/' + AchievementManager.total();
    } catch (e) { }
  }

  /** 打开成就面板（两栏：外显成就 / 隐藏成就） */
  function showAchievementPanel() {
    const html = AchievementManager.renderPanelHtml();
    try {
      if (typeof window.showModal === 'function') {
        window.showModal('<h3>🏅 成就</h3>' + html +
          '<div class="modal-actions" style="margin-top:14px"><button class="btn btn-ghost" onclick="closeModal()">关闭</button></div>');
        return;
      }
    } catch (e) { console.error('showAchievementPanel failed', e); }
    try { alert('已解锁 ' + AchievementManager.count() + ' / ' + AchievementManager.total() + ' 个成就'); } catch (e) { }
  }

  global.updateAchievementBadge = updateAchievementBadge;
  global.showAchievementPanel = showAchievementPanel;
  global.oiAchTab = oiAchTab;
  window.updateAchievementBadge = updateAchievementBadge;
  window.showAchievementPanel = showAchievementPanel;
  window.oiAchTab = oiAchTab;

  global.PUBLIC_ACHIEVEMENTS = PUBLIC_ACHIEVEMENTS;
  global.HIDDEN_ACHIEVEMENTS = HIDDEN_ACHIEVEMENTS;
  global.ALL_ACHIEVEMENTS = ALL_ACHIEVEMENTS;
  global.ACHIEVEMENT_CATEGORIES = CATEGORY_ORDER;
  global.AchievementManager = AchievementManager;
  window.PUBLIC_ACHIEVEMENTS = PUBLIC_ACHIEVEMENTS;
  window.HIDDEN_ACHIEVEMENTS = HIDDEN_ACHIEVEMENTS;
  window.ALL_ACHIEVEMENTS = ALL_ACHIEVEMENTS;
  window.AchievementManager = AchievementManager;
  window.ACHIEVEMENT_CATEGORIES = CATEGORY_ORDER;
})(typeof window !== 'undefined' ? window : this);
