
# OItrainer — 信息学教练模拟器

这是一个基于浏览器的文字/策略模拟游戏，模拟信息学教练训练选手从赛季训练到正式比赛的成长与抉择。  
项目由 **HTML / JavaScript / CSS** 构建，无需后端即可运行。

## 魔改灵感来源

“出于意外”，我得到了这样一串作弊代码 `game.budget = 2147483647`，因此在同学还在简单模式抱怨没钱了的时候已经在专家模式的弱省 AK IOI。

这时候桶机房一个小馋猫问：

> “能不能改名字呢”

我试了试，发现 `game.students` 里的东西还挺多，不光能改名字，还能改数值，于是有了下面的选手：

![](https://cdn.luogu.com.cn/upload/image_hosting/h0inyqfp.png)

但是，更重要的，天赋也能改。不过观察到，可是天赋是个 `set`，在不会 JS 的情况下根本不会用，所以就让 AI 写了一个添加新天赋的代码。可是添加完发现，新天赋根本无法生效，因此就干脆把 Git 丢给 AI，让 AI 写一个注册天赋的代码。

但这样仍然远远不够我的野心：光一把里有这个天赋有啥用，我要每把都有——魔改项目启动。

最后引用桶机房大佬的话作为结尾：

> “用 AI 魔改 AI 写的代码吗？有意思。”

## 🎮 游玩方式

访问 [https://holuc1078.github.io/OItrainer/](https://holuc1078.github.io/OItrainer/)  即可

或者可以下载文件到本地，打开 `index.html`。

---

## 日志

`upodate 2025/11/13`：增加了加训、海外集训和一些隐藏天赋，当然也有彩蛋。

## 🧩 开发信息

- **项目类型**：前端静态页面（HTML + JavaScript + CSS）  
- **主要目录结构**：
  - `index.html`：主入口  
  - `game.js`, `render.js`, `debug.js`, `lib/`：核心逻辑脚本（比赛模拟、天赋、事件、模型等）  
  - `assets/`：图片与资源文件  
  - 其他脚本如 `tutorial.js`：用于教学与新手引导  

若需修改并本地调试，建议使用带开发者工具的浏览器（Chrome / Edge / Firefox）。  

---

## 🤝 贡献与反馈

欢迎提交 Issue 或 Pull Request 来改进游戏体验。

---

## ✉️ 致谢与联系方式

- 作者：**seve42**  
- Luogu：`seve_`  
- 邮箱：`dreamer-seve@outlook.com` 或 `dreamersseve@gmail.com`

- 魔改：**HoLuc1078**

---

