# AGENTS.md — 仓库说明书（给 AI 协作者 / 新同学）

> 这是一份「每个文件是干什么的 + 改代码前必须知道的规矩」的速查表。
> 目标：让任何一个没有上下文的人（或 AI）在 5 分钟内知道该动哪个文件、以及**绝对不能**动坏什么。
>
> 项目本体：**OItrainer — 信息学教练模拟器**。纯静态 HTML / JS / CSS，无后端、无构建步骤、无依赖。
> 上游：<https://github.com/seve42/OItrainer>；本仓库是魔改分支：<https://github.com/HoLuc1078/OItrainer>。

---

## 0. 一分钟速览

- **怎么跑**：直接用浏览器打开 `index.html` 即可（或起一个静态服务器，见下文）。
- **没有构建**：改完 `.js` / `.css` / `.html` 直接刷新页面，没有 npm / webpack / ts。
- **数据在哪**：一局游戏 = 一个全局对象 `game`（`lib/models.js` 的 `GameState`），
  存档在 `sessionStorage` + `localStorage` 的 `oi_coach_save`。
- **两条最重要的规矩**：
  1. 影响游戏结果的随机数**必须**走 `getRandom()`，不许写 `Math.random()`（见第 2 节）；
  2. 学生的 `name` 是**身份主键**，任何地方都**不许改学生的名字**（见第 3 节）。
- **工作完成后**：把改动提交并推送到 GitHub（见最后一节）。

---

## 1. 运行与调试

方式一：直接双击打开（最简单）。但 `start.html` 的省份地图用 `fetch` 读 `assets/china.json`，
`file://` 协议下可能被 CORS 拦掉，地图会空着。

方式二：起一个静态服务器（推荐，任何语言都行）：

- `python -m http.server 8000` → 访问 <http://127.0.0.1:8000/index.html>
- 或 `npx serve .`

**调试**：F12 打开控制台，全局对象 `game` 直接可读写（例如 `game.budget = 999999`）。
`debug.js` 里有一批现成的作弊 / 调试函数：`debugzak()`、`Fuck_CCF()`（李欣隆）、
`chthollySummon()`（珂朵莉）、`kkksc03wzl()`、`debugFacility()`。

**页面入口与 URL 参数**：

- `index.html` —— 菜单 + 更新日志
- `start.html` —— 开局设置（三步向导 + 省份地图）
- `game.html?new=1&d=&p=&c=&seed=` —— 开局并直接进入游戏
  - `d` 难度 1/2/3，`p` 省份 id 1..33，`c` 初始人数 3..10，`seed` 随机种子
  - 再加上 `daily=1` 即为「今日挑战」
- `game.html`（不带参数）—— 读档续玩（走 `silentLoad`）
- `end.html` —— 赛季结算

---

## 2. ⚠️ 铁律一：随机数必须走 `getRandom()`

**为什么**：游戏要支持「同样的种子 + 同样的操作 = 完全一样的结果」
（今日挑战、种子分享、复盘都靠它）。只要有一处随机数绕过种子源，确定性就没了。

所有随机数工具都在 **`lib/utils.js`**：

| 你要做的事 | 用这个 |
| --- | --- |
| 取 [0,1) 随机数 | `getRandom()` |
| 取 [min,max] 整数 | `uniformInt(min, max)` / `randomInt(min, max)` |
| 正态分布 | `normal(mean, stddev)` |
| 从数组里等概率取一个 | `pickRandom(list)` |
| 按权重取一个 | `weightedPick(items, weightFnOrField)` |
| **纯装饰**随机（随机一言、DOM id、动画抖动） | `getCosmeticRandom()`（不消耗种子流） |
| 局部要可复现的子计算 | `withRandomSeed(seed, fn)` |

**规则**：

1. 玩法逻辑里出现 `Math.random()` = **Bug**。改代码时请顺手 grep 确认。
   例外：`index.html` 的矩阵雨背景、`render.js` 里生成 DOM 唯一 id —— 这些是允许的，已注明。
2. **不要在渲染函数里调用 `getRandom()`**。渲染次数取决于玩家点了几次、窗口多大，
   会打乱随机流。装饰性随机请用 `getCosmeticRandom()`。
3. 种子的生命周期：
   - 开局：`game.js` 的 `window.onload` 里 `setRandomSeed(seed)` → `initGame(..., seed)`；
     今日挑战的种子由日期派生（`getDailyChallengeParams()`），普通开局用 `generateRandomSeed()`。
   - 记录：`game.randomSeed`（种子）与 `game.rngState`（随机流快照）。
   - 存档：`saveGame()` 会先 `__captureRngIntoGame()` 把快照写进 `game.rngState`；
     读档时 `__restoreRngFromGame()` 先按种子播种、再恢复到快照位置。
4. **跨局缓存要按局隔离**。例如 `lib/task.js` 里「最近推荐过的题目」用 `game.gameToken` 做 key，
   否则同种子重开一局会拿到不同的题目（`initGame` 里会自增 `window.__oiGameToken`）。
5. 成就 / 统计的 `check()`、`progress()` 必须是**纯读**：不许改 `game`、不许调 `getRandom()`。

**自测方法**（不改任何文件，纯跑一遍确定性）：

开两局 `game.html?new=1&daily=1&d=2&p=7&c=5&seed=12345`，做完全一样的操作，
然后在控制台分别取同样的表达式对比，两者必须一模一样，例如：
`JSON.stringify([game.week, game.budget, game.students.map(s => [s.name, s._base_thinking, s.pressure, [...s.talents].sort()])])`

---

## 3. ⚠️ 铁律二：学生姓名是身份主键

晋级资格（`game.qualification`）、比赛履历（`game.careerCompetitions`）、
国家队名单（`game.nationalTeamResults`）**全都是按学生姓名索引的**。

- 想给学生加身份（比如「女队」）→ 加**标记字段**（`s.femaleTeamPath = true`），
  UI 上用 `Student.getDisplayName()` 渲染标签。
- **绝不要**写 `s.name = s.name + '（女队）'` 这种代码：一改名字，这个人的履历就全丢了。
  （历史遗留的改名已由 `migrateStudentIdentities()` 在读档时自动修复，见 `lib/models.js`。）
- 真要改名，必须调用 `__renameStudentEverywhere(game, oldName, newName)` 同步所有索引结构。

---

## 4. 文件地图

### 4.1 页面（HTML）

| 文件 | 作用 |
| --- | --- |
| `index.html` | 主入口 / 菜单 / 更新日志。含全屏「矩阵雨」背景动画（纯装饰，放心用 `Math.random`）。 |
| `start.html` | 开局设置：三步向导（难度 → 省份 → 招生）、可交互省份地图（ECharts + `assets/china.json`）、**今日挑战**按钮、对点招生 / 学前培养 / 天赋选择。 |
| `game.html` | 主游戏界面骨架：顶栏（周数 / 经费 / 声誉 / 天气 / 下场比赛 / 成就徽章）、学生卡片区、周信息、设施状态、训话框、日志、八个行动按钮。**只负责 DOM 结构**，逻辑在 `game.js` / `render.js`。 |
| `end.html` | 赛季结算页：读取存档与结局原因，渲染时间线、成绩、随机种子、成就面板（两栏 Tab）。 |
| `shared.html` | 分享结果页：解析别人分享的链接，展示对方那一局的成绩、随机种子、成就数量。 |
| `country.html` | 🌍 国家 / 地区一览：列出全部出境集训目的地的「传闻」（支持中文 / 拼音首字母 / 英文 / 关键词搜索），**不剧透具体事件**。 |
| `help.html` / `help.md` | 攻略。`help.md` 是文本版，`help.html` 是网页版。 |
| `styles.css` | 全站样式。成就面板相关的 `.ach-*` 类（含两栏 Tab、进度条）在文件末尾。 |

### 4.2 顶层脚本

| 文件 | 作用 |
| --- | --- |
| `game.js` | **核心流程**：`initGame()` 开局、`weeklyUpdate()` / `safeWeeklyUpdate()` 推进周、训练 / 集训 / 出境集训结算、`evaluateQuitRisk()` 退队与退队保护、存读档（`saveGame` / `loadGame` / `silentLoad`）、结局判定（`checkAndTriggerEnding` / `triggerGameEnding`）、随机流的存读档接续、行动统计埋点。 |
| `render.js` | **主界面渲染**：`renderAll()`、学生卡片、各类弹窗（训练 / 娱乐 / 模拟赛 / 集训 / 出境集训 / 打工 / 加训 / 劝退）、日志与事件卡片、`log()`、赛季结算 `renderEndSummary()`。UI 里触发的玩法动作（加训、打工等）也在这里。 |
| `events.js` | **随机事件系统**：`EventManager`，注册所有随机事件（天气灾害、赞助、转学生、劝退挽留……）并在每周触发；训话输入（含彩蛋口令）。 |
| `tutorial.js` | 新手引导：首次进入 `game.html` 时的分步高亮教学，入口是 `window.tutorialManager`（`finish()` 可跳过）。 |
| `debug.js` | 调试 / 作弊函数：`debugzak()`、`Fuck_CCF()`（李欣隆）、`chthollySummon()`（珂朵莉）、`kkksc03wzl()`、`debugFacility()`。文件末尾有一段作者留言。 |

### 4.3 `lib/` — 模块（加载顺序见 `game.html` 底部的 `<script>` 列表）

| 文件 | 作用 |
| --- | --- |
| `climate.js` | 气候与天气：按省份 + 周数推导气温 / 天气 / 季节，定义极端天气阈值。 |
| `chinese-convert.js` | 简繁转换（香港 / 澳门开局时启用）。 |
| `facilities.js` | 设施系统：机房 / 计算机 / 网络 / 电扇 / 空调 / 资料库的等级、效果、升级费用、维护费与升级 UI。`FACILITY_DEFS` 在这里。 |
| `provinces.js` | 省份数据（33 个）：强弱属性、初始经费、训练质量、气候关联、初始设施，以及 `getProvinceBaseComfort()` / `getProvinceAbilityRange()`。 |
| `constants.js` | **全局数值平衡总开关**：各类概率、阈值、倍率、「全局增幅变量」（训练收益 / 压力 / 分数线 / 花销）、退队保护阈值、比赛与题目常量。调平衡先来这里。 |
| `countries.js` | 出境集训数据：56 个国家 / 地区的费用倍率与**各国专属彩蛋效果**（`OVERSEAS_COUNTRY_EFFECTS`）、**意外事件池**（`OVERSEAS_INCIDENTS`）、按学生触发的概率 `CHUJINGFAZHI`、搜索索引。 |
| `utils.js` | **随机数基础设施**（`SeededRandom` / `getRandom` / `setRandomSeed` / `getRandomState` / `withRandomSeed` …）+ 数值工具（`clamp` / `sigmoid` / `uniformInt` / `normal`）+ 字母等级 `getLetterGrade` + 姓名生成（含少数民族姓名池）+ **今日挑战参数** `getDailyChallengeParams()`。 |
| `models.js` | 数据模型：`Student`（能力 / 知识点 / 压力 / 舒适度 / 天赋 / 比赛中的临时修正）、`GameState`（全局状态 + `stats` 统计 + 随机种子字段 + `bumpStat` / `maxStat` / `minStat`）、比赛日程构建、旧存档迁移 `migrateStudentIdentities()`。 |
| `talent.js` | **天赋系统**：`TalentManager` 注册全部天赋（普通 + 隐藏 + 负面）、触发逻辑、获取 / 失去概率、初始天赋分配、天赋标签渐变配色。加天赋基本只动这个文件。 |
| `achievements.js` | **成就系统（93 个，两类）**：`PUBLIC_ACHIEVEMENTS`（38 个**外显成就**，锁着也显示名字 / 条件 / 进度条）+ `HIDDEN_ACHIEVEMENTS`（55 个**隐藏成就**，解锁前只显示 ？？？）；`AchievementManager.checkAll` / `unlock` / `renderPanelHtml`（两栏 Tab，切换函数 `oiAchTab`，刷新 `oiAchRefresh`，清档 `oiAchReset`）、分类与进度条、顶栏徽章。**解锁记录跨局持久化在 `localStorage['oi_achievements_profile_v1']`，不随存档走**。加成就前先读文件头的说明。 |
| `task.js` | 训练题库（`TASK_POOL`）、选题（`selectRandomTasks`：按吸收率推荐 + 随机）、做题增幅曲线、洗牌。 |
| `competitions.js` | **比赛模拟引擎**：`CompetitionEngine` —— 生成题目（难度 / 标签 / 子任务 / 部分分）、选手逐题模拟（思维检定 / 编码检定 / 失误 / 换题）、排名与滚榜。 |
| `contest-ui.js` | 比赛界面：实时滚榜、逐题进度、比赛过程展示。 |
| `contest-integration.js` | **赛事与主流程的胶水层**：把 `competitions.js` 的引擎接进赛季（判定资格、生成国际选手、算分数线与拨款、发奖牌、写 `careerCompetitions`、触发结局、统计埋点）。 |
| `national-team.js` | 国家集训队：CTT / CTS 计分与 IOI 名单选拔（`game.nationalTeamResults`）。 |
| `share.js` | 分享功能：收集结算数据、编码成链接、解析别人的分享（`gameState` 里含随机种子与成就 id 列表）。 |
| `echarts.min.js` | 第三方库，省份地图用。**不要手改**。 |

### 4.4 `assets/`

| 文件 | 作用 |
| --- | --- |
| `china.json` | 中国省份 GeoJSON，`start.html` 的 ECharts 地图数据源。 |
| `renliang1.png` / `renliang2.png` | 训话输入彩蛋口令时弹出的图片（见 `events.js` 的 `tryShowImage`）。 |

### 4.5 文档

| 文件 | 作用 |
| --- | --- |
| `README.md` | 项目介绍、魔改内容、游玩方式、目录结构。 |
| `CHANGELOG.md` | 更新日志。**每次有玩家可感知的改动都往这里加一段**。 |
| `ZEN.md` | 设计哲学 + 关于「为什么不提供自定义学生姓名」。改玩法前建议读一遍。 |
| `AGENTS.md` | 本文件。 |

---

## 5. 常见改动指引

| 我想…… | 去哪改 |
| --- | --- |
| 加一个新天赋 | `lib/talent.js` 的 `registerDefaultTalents()` 里 `registerTalent({...})`。隐藏天赋名要同步加到 `HIDDEN_TALENTS`。 |
| 加一个外显成就 | `lib/achievements.js` 的 `PUBLIC_ACHIEVEMENTS`（玩家看得见名字和条件，用来指方向）。 |
| 加一个隐藏成就 | `lib/achievements.js` 的 `HIDDEN_ACHIEVEMENTS`（必须给 `hint`，不许剧透）。 |
| 给成就加新统计 | 在 `lib/models.js` 的 `GameState.stats` 加字段，并用 `trackAction()` / `game.bumpStat()` / `game.maxStat()` 在**真正执行操作**的地方埋点（别在打开弹窗时埋）。 |
| 加一个出境国家 / 彩蛋 | `lib/countries.js`：`COUNTRIES` 加条目，`OVERSEAS_COUNTRY_EFFECTS` 加同名函数；`country.html` 同步加「传闻」。 |
| 加一个随机事件 | `events.js` 的 `registerDefaultEvents()`。 |
| 调数值平衡 | `lib/constants.js`（优先用「全局增幅变量」），个别值在 `lib/provinces.js` / `lib/facilities.js` / `lib/countries.js`。 |
| 加一场比赛 | `lib/constants.js` 的 `COMPETITION_SCHEDULE` / `COMPETITION_ORDER`。 |
| 改界面 | 结构在 `game.html`，渲染在 `render.js`，样式在 `styles.css`。 |

---

## 6. 存档、兼容与健壮性

- **存档位置**：`sessionStorage.oi_coach_save`（优先）+ `localStorage.oi_coach_save`；结局原因在 `oi_coach_ending_reason`。
- **写存档一律用 `saveGame()`**，不要自己写 `JSON.stringify(game)`：
  - `saveGame()` 会用 replacer 把 `Set` 转成数组，并保存随机流快照；
  - 直接 stringify 会把 `Set`（比如学生的 `talents`）变成 `{}`，刷新一次天赋就全没了。
- **JSON 没有 `Set`**：读档时 `__restoreSetFields(game, o)` 负责还原 `completedCompetitions`、`qualification` 和学生的 `talents`。
  新增 Set 字段时记得在这里补一条，否则会报 `xxx.has is not a function`。
  ⚠️ 顺序有讲究：学生相关的还原必须放在 `game.students` 被实例化成 `Student` **之后**，
  否则随后的 `map` 会把已经还原好的 `Set` 当成普通对象读成空集。
- **成就不在存档里**：解锁记录跨局持久化在 `localStorage['oi_achievements_profile_v1']`（见 `lib/achievements.js` 的
  `__profile()` / `__profileUnlock()`）。判定"是否已解锁"用 `AchievementManager.allUnlockedIds(game)`（本局 ∪ 档案），
  `unlockedIds(game)` 只是本局记录。新增成就时不需要额外做什么，写盘会自动发生。
- **新字段要有兜底**：`lib/models.js` 的 `migrateStudentIdentities()` 是旧存档的兼容入口，
  新增 `stats` 字段 / 结构字段时在这里补默认值，旧存档才不会炸。
- **容错风格**：存档、统计、成就、天赋钩子相关的代码请用 `try/catch` 包住并写日志，
  绝不让锦上添花的功能拖垮主流程。

---

## 7. 代码风格与约定

- 全部是浏览器全局脚本，**没有模块系统**：函数直接声明在顶层，跨文件通过全局名互相调用。
  加载顺序在各页面底部的 `<script>` 列表里，**顺序不能随便改**。
- 新文件如果要给别的文件用，记得挂到 `window`（老代码大量依赖 `window.xxx` 判空调用）。
- 中文注释是刻意保留的，请继续用中文写注释和玩家可见文案。
- 文案里对未解锁内容**点到为止**（隐藏天赋 / 国家彩蛋 / 隐藏成就都不许剧透具体数值）。
- 事件推送统一用 `pushEvent({ name, description, week })`，日志用 `log()`。
- **改完必须手动回归**：打开 `index.html` → 开始游戏，把训练、加训、娱乐、模拟赛、集训、出境集训、打工各点一次，
  并确认控制台没有新的报错（F12 → Console）。

---

## 8. 提交与协作

- 分支 `main`；远端 `origin` = 本仓库，`upstream` = 原作者仓库。
- 提交信息用**中文**，格式 `feat: …` / `fix: …` / `docs: …`，参考现有 `git log`。
- 有玩家可感知的改动，同步在 `CHANGELOG.md` 顶部加一段（日期 + 新增 / 修复 / 平衡 / 文档）。
- 与上游同步：`git fetch upstream && git merge upstream/main`。
  冲突主要集中在 `index.html` / `start.html` / `end.html`（上游重写过 UI）、`lib/talent.js`、`lib/constants.js`、`game.js`。
  原则：**UI 以上游为准再补回魔改署名，数值与玩法以本分支为准**。

---

所有工作完成后，推送到 Github。


