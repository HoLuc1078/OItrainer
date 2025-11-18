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
        "嬲选手",
        "珂朵莉"
    ];
    positiveTalents.forEach(talent => superStudent.addTalent(talent));

    // 添加到学生列表
    game.students.push(superStudent);
    console.log('lxl 顺着味就来了');
    log('lxl顺着味就来了');
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
// 下面的代码是我练习 JS 自己写的，厉害吧
function kkksc03wzl() {
    if (typeof game === 'undefined' || !game) {
        console.error('游戏未初始化');
        return;
    }
    const wzl = new Student("wzl（女队）", 2919, 1929, 9999);
    wzl.femaleTeamPath = true;
    wzl.knowledge_dp = 114514;
    wzl.knowledge_ds = 998244353;
    wzl.knowledge_graph = 1929;
    wzl.knowledge_math = 2147483647;
    wzl.knowledge_string = 1078;
    wzl.active = true;
    wzl.pressure = 0;
    wzl.addTalent("世界上最幸福的女孩");
    wzl.addTalent("嬲选手");
    game.students.push(wzl);
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