# OItrainer — 信息学教练模拟器

这是一个基于浏览器的文字 / 策略模拟游戏：你是一名信息学竞赛教练，要在一个赛季里把一群学生从**省赛**一路带到 **NOI / 国家队**。
项目由 **HTML / JavaScript / CSS** 构建，纯静态、无后端，双击 `index.html` 即可开玩。

---

## ✨ 原版特色

- **赛季推进与比赛模拟**：完整的赛季与周推进系统，涵盖 CSP-S、NOIP、省选、NOI、CTT / CTS / IOI 等赛事。
- **细化的学生模型**：思维、编程、心理三项能力，加上数据结构 / 图论 / 字符串 / 数学 / DP 五类知识点，并考虑压力、舒适度、天气、生病等状态。
- **多样训练与外出集训**：多种训练强度与外出集训选项，收益与代价各不相同。
- **天赋与事件系统**：天赋可获得也会失去，事件系统让每一局都有意外。
- **设施与预算管理**：机房 / 网络 / 电扇 / 空调 / 资料库的升级与维护费，让决策更有取舍。
- **模拟赛与比赛评分**：按时间节拍、子任务与知识门槛还原比赛过程，实时滚榜，并触发天赋效果。
- **沉浸的内容**：大量取材于真实信息学竞赛生活的细节。

---

## 🔧 魔改内容（本仓库）

本仓库是 [seve42/OItrainer](https://github.com/seve42/OItrainer) 的魔改分支，主要变化：

- **加训 / 打工**：加训不消耗行动值但压力 +50%；打工可以「压榨」学生换经费。
- **出境集训（56 个国家 / 地区）**：比国内集训更贵、收益更高，而且**每个国家 / 地区的彩蛋都不一样** —— 有的加知识点、有的减压、有的花钱、有的有风险，少数国家还能**直接点出隐藏天赋**。
  - 想看各国的大致印象，点游戏右上角的 **🌍 查看国家**，或直接打开 `country.html`。那里只写「点到为止」的传闻，具体会发生什么请自行上路体会。
- **强力隐藏天赋**：`嬲选手`、`珂朵莉`、`世界上最幸福的女孩`、`蒙的全对`、`算法之神`、`AK机器`、`心如止水`、`时之沙漏`、`天命之子`。它们不会在训练里随机出现，只能通过「出境集训 → 天赋激发」花 ¥20,000 博取（命中率约 25%），或在对应国家的集训彩蛋中觉醒。
- **整体难度上调**：成长变慢、压力涨得更快、分数线与题目难度都更高、花销更贵（见 `lib/constants.js` 的「全局增幅变量」）。

### 魔改灵感来源

“出于意外”，我得到了这样一串作弊代码 `game.budget = 2147483647`，因此在同学还在简单模式抱怨没钱了的时候已经在专家模式的弱省 AK IOI。

这时候桶机房一个小馋猫问：

> “能不能改名字呢”

我试了试，发现 `game.students` 里的东西还挺多，不光能改名字，还能改数值，于是有了下面的选手：

![](https://cdn.luogu.com.cn/upload/image_hosting/h0inyqfp.png)

但是，更重要的，天赋也能改。不过观察到，天赋是个 `set`，在不会 JS 的情况下根本不会用，所以就让 AI 写了一个添加新天赋的代码。可是添加完发现，新天赋根本无法生效，因此就干脆把 Git 丢给 AI，让 AI 写一个注册天赋的代码。

但这样仍然远远不够我的野心：光一把里有这个天赋有啥用，我要每把都有——魔改项目启动。

最后引用桶机房大佬的话作为结尾：

> “用 AI 魔改 AI 写的代码吗？有意思。”

---

## 🎮 游玩方式

访问 [https://holuc1078.github.io/OItrainer/](https://holuc1078.github.io/OItrainer/) 即可；
也可以把整个仓库下载到本地，直接打开 `index.html`。

遇到困难？游戏内右上角有 **📖 攻略**，或直接看 `help.html` / `help.md`。

---

## 📄 目录结构

```
index.html          主入口（菜单 + 更新日志）
start.html          开局设置（难度 / 省份 / 招生，含省份地图）
game.html           主游戏界面
end.html            赛季结算 / 分享
country.html        🌍 查看国家（出境集训国家一览）
help.html / help.md 攻略
shared.html         分享结果页

game.js             核心流程（训练 / 集训 / 出境集训 / 事件结算 / 存读档）
render.js           主界面渲染（学生卡片 / 弹窗 / 训练与模拟赛 UI）
events.js           随机事件系统
debug.js            调试与作弊函数（含彩蛋）
tutorial.js         新手引导
styles.css          样式

lib/
  constants.js      全局常量与数值平衡总开关
  countries.js      出境集训国家/地区数据 + 各国专属效果
  provinces.js      省份数据（经费 / 训练质量 / 气候关联）
  climate.js        气候与极端天气
  facilities.js     设施系统
  models.js         Student / Facilities / GameState
  utils.js          随机数与姓名生成
  talent.js         天赋注册与触发
  task.js           训练题库
  competitions.js   比赛模拟引擎
  contest-ui.js     比赛界面
  contest-integration.js  比赛与主流程的胶水层
  national-team.js  国家集训队
  share.js          分享功能
  chinese-convert.js 繁体中文转换
  echarts.min.js    省份地图依赖
assets/             图片与地图数据
```

改动并本地调试时，建议用带开发者工具的浏览器（Chrome / Edge / Firefox）直接打开 `index.html`。

---

## 🔄 与上游同步

本分支已经手工合并过上游 `seve42/OItrainer:main`。之后再同步时：

```bash
git remote add upstream https://github.com/seve42/OItrainer.git   # 只需一次
git fetch upstream
git merge upstream/main
```

冲突主要集中在 `index.html` / `start.html` / `end.html`（上游重写 UI）、`lib/talent.js`、`lib/constants.js`、`game.js`。
原则：**UI 以上游为准再补回魔改署名，数值与玩法以本分支为准**。

---

## 📜 更新日志

见 [CHANGELOG.md](CHANGELOG.md)。
设计理念见 [ZEN.md](ZEN.md)。

---

## 🤝 贡献与反馈

欢迎提交 Issue 或 Pull Request 来改进游戏体验。

---

## ✉️ 致谢与联系方式

- 原作者：**seve42**
- Luogu：`seve_`
- 邮箱：`dreamer-seve@outlook.com` 或 `dreamersseve@gmail.com`

- 魔改：**HoLuc1078**
- 洛谷：<https://www.luogu.com.cn/user/589190>
- GitHub：<https://github.com/holuc1078/OItrainer>
