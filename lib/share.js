/* share.js - 结算结果分享功能模块 */

/**
 * 结算数据分享管理器
 * 提供加密编码、生成分享链接、解密显示等功能
 */
const ShareManager = (function() {
  'use strict';

  /**
   * 简单的Base64编码（处理Unicode字符）
   */
  function base64Encode(str) {
    try {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
      }));
    } catch (e) {
      console.error('Base64 encode error:', e);
      return '';
    }
  }

  /**
   * 简单的Base64解码（处理Unicode字符）
   */
  function base64Decode(str) {
    try {
      return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    } catch (e) {
      console.error('Base64 decode error:', e);
      return null;
    }
  }

  /**
   * 简单的XOR加密/解密
   * @param {string} str - 要加密/解密的字符串
   * @param {string} key - 密钥
   */
  function xorEncrypt(str, key = 'OITrainer2024') {
    if (!str) return '';
    let result = '';
    for (let i = 0; i < str.length; i++) {
      result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  }

  /**
   * 收集当前结算页面的所有数据
   * @returns {Object} 包含所有结算信息的对象
   */
  function collectEndGameData() {
    try {
      // 优先从 sessionStorage 读取，再从 localStorage
      let raw = null;
      try { raw = sessionStorage.getItem('oi_coach_save'); } catch(e) {}
      if (!raw) {
        try { raw = localStorage.getItem('oi_coach_save'); } catch(e) {}
      }

      if (!raw) {
        console.warn('No game save data found for sharing');
        return null;
      }

      const gameData = JSON.parse(raw);
      
      // 获取结束原因
      let endingReason = '';
      try { endingReason = sessionStorage.getItem('oi_coach_ending_reason') || ''; } catch(e) {}
      if (!endingReason) {
        try { endingReason = localStorage.getItem('oi_coach_ending_reason') || ''; } catch(e) {}
      }
      if (!endingReason) {
        endingReason = gameData.endingReason || gameData.oi_coach_ending_reason || '赛季结束';
      }

      // 获取比赛生涯记录
      let careerCompetitions = gameData.careerCompetitions || [];
      if (!careerCompetitions || careerCompetitions.length === 0) {
        try {
          const separateRaw = localStorage.getItem('oi_coach_careerCompetitions');
          if (separateRaw) {
            careerCompetitions = JSON.parse(separateRaw);
          }
        } catch(e) {
          console.error('Failed to load separate career data:', e);
        }
      }

      // 构建分享数据对象（只包含必要的显示信息，减少数据量）
      const shareData = {
        version: '1.1', // 数据格式版本
        timestamp: Date.now(),
        gameState: {
          week: gameData.week || 0,
          budget: gameData.budget || 0,
          reputation: gameData.reputation || 0,
          totalExpenses: gameData.totalExpenses || 0,
          initial_students: gameData.initial_students || (gameData.students ? gameData.students.length : 0),
          difficulty: gameData.difficulty || 2, // 游戏难度：1=简单，2=普通，3=困难
          endingReason: endingReason,
          // 随机种子：分享出去对方才能复现同一局（同种子 + 同操作 = 同结果）
          randomSeed: (gameData.randomSeed !== undefined ? gameData.randomSeed : null),
          isDailyChallenge: !!gameData.isDailyChallenge,
          dailyChallengeSeed: gameData.dailyChallengeSeed || null,
          dailyChallengeDate: gameData.dailyChallengeDate || null,
          // 隐藏成就 id 列表
          achievements: (function(){
            try{
              return (gameData.hiddenAchievements || []).map(function(x){ return typeof x === 'string' ? x : (x && x.id); }).filter(Boolean);
            }catch(e){ return []; }
          })(),
          students: (gameData.students || []).map(s => ({
            name: s.name,
            active: s.active !== false, // 显式标记
            pressure: s.pressure || 0,
            thinking: s.thinking || 0,
            coding: s.coding || 0,
            mental: s.mental || 0,
            knowledge_ds: s.knowledge_ds || 0,
            knowledge_graph: s.knowledge_graph || 0,
            knowledge_string: s.knowledge_string || 0,
            knowledge_math: s.knowledge_math || 0,
            knowledge_dp: s.knowledge_dp || 0,
            talents: Array.from(s.talents || [])
          })),
          careerCompetitions: careerCompetitions
        }
      };

      return shareData;
    } catch (e) {
      console.error('Failed to collect end game data:', e);
      return null;
    }
  }

  /**
   * 生成分享链接
   * @returns {string} 完整的分享URL
   */
  function generateShareLink() {
    try {
      const data = collectEndGameData();
      if (!data) {
        throw new Error('无法收集结算数据');
      }

      // 序列化为JSON字符串
      const jsonStr = JSON.stringify(data);
      
      // 加密
      const encrypted = xorEncrypt(jsonStr);
      
      // Base64编码
      const encoded = base64Encode(encrypted);
      
      // 生成URL（使用hash参数避免服务器端处理）
      const baseUrl = window.location.origin + window.location.pathname.replace('end.html', 'shared.html');
      const shareUrl = `${baseUrl}#${encoded}`;
      
      console.log('Share link generated, data size:', encoded.length, 'chars');
      return shareUrl;
    } catch (e) {
      console.error('Failed to generate share link:', e);
      throw e;
    }
  }

  /**
   * 从URL解析分享数据
   * @returns {Object|null} 解析出的游戏数据，失败返回null
   */
  function parseSharedData() {
    try {
      // 从URL hash获取编码数据
      const hash = window.location.hash.slice(1); // 去掉 # 号
      if (!hash) {
        console.warn('No shared data in URL');
        return null;
      }

      // Base64解码
      const decoded = base64Decode(hash);
      if (!decoded) {
        throw new Error('Base64解码失败');
      }

      // 解密
      const decrypted = xorEncrypt(decoded);
      
      // 解析JSON
      const data = JSON.parse(decrypted);
      
      // 验证数据格式
      if (!data.version || !data.gameState) {
        throw new Error('数据格式不正确');
      }

      console.log('Shared data parsed successfully, version:', data.version);
      return data;
    } catch (e) {
      console.error('Failed to parse shared data:', e);
      return null;
    }
  }

  /**
   * 复制文本到剪贴板
   * @param {string} text - 要复制的文本
   * @returns {Promise<boolean>} 是否成功
   */
  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
      }
    } catch (e) {
      console.error('Copy to clipboard failed:', e);
      return false;
    }
  }

  /**
   * 显示分享对话框
   */
  function showShareDialog() {
    try {
      const shareUrl = generateShareLink();
      
      // 创建模态对话框
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.2s ease;
      `;

      const dialog = document.createElement('div');
      dialog.className = 'share-dialog';
      dialog.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease;
      `;

      dialog.innerHTML = `
        <h3 style="margin: 0 0 16px 0; color: #333; font-size: 20px;">
          🔗 分享结算结果
        </h3>
        <p style="color: #666; font-size: 14px; margin-bottom: 16px;">
          复制下面的链接分享给他人，让他们查看你的游戏结算结果！
        </p>
        <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin-bottom: 16px; word-break: break-all; font-size: 13px; color: #333; font-family: monospace; max-height: 120px; overflow-y: auto;">
          ${shareUrl}
        </div>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button id="share-copy-btn" class="btn" style="background: #4caf50; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; transition: background 0.2s;">
            📋 复制链接
          </button>
          <button id="share-close-btn" class="btn btn-ghost" style="background: #f0f0f0; color: #333; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; transition: background 0.2s;">
            关闭
          </button>
        </div>
        <div id="share-copy-feedback" style="margin-top: 12px; font-size: 13px; color: #4caf50; text-align: center; opacity: 0; transition: opacity 0.3s;"></div>
      `;

      modal.appendChild(dialog);
      document.body.appendChild(modal);

      // 绑定事件
      const copyBtn = dialog.querySelector('#share-copy-btn');
      const closeBtn = dialog.querySelector('#share-close-btn');
      const feedback = dialog.querySelector('#share-copy-feedback');

      copyBtn.addEventListener('click', async () => {
        const success = await copyToClipboard(shareUrl);
        if (success) {
          feedback.textContent = '✓ 链接已复制到剪贴板！';
          feedback.style.opacity = '1';
          copyBtn.textContent = '✓ 已复制';
          copyBtn.style.background = '#45a049';
          setTimeout(() => {
            feedback.style.opacity = '0';
          }, 2000);
        } else {
          feedback.textContent = '✗ 复制失败，请手动复制';
          feedback.style.color = '#f44336';
          feedback.style.opacity = '1';
          setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.color = '#4caf50';
          }, 2000);
        }
      });

      const closeDialog = () => {
        modal.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 200);
      };

      closeBtn.addEventListener('click', closeDialog);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeDialog();
      });

      // 添加CSS动画
      if (!document.getElementById('share-animations')) {
        const style = document.createElement('style');
        style.id = 'share-animations';
        style.textContent = `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .btn:hover {
            opacity: 0.9;
            transform: translateY(-1px);
          }
          .btn:active {
            transform: translateY(0);
          }
        `;
        document.head.appendChild(style);
      }

    } catch (e) {
      alert('生成分享链接失败：' + e.message);
      console.error('Share dialog error:', e);
    }
  }

  // 公开接口
  return {
    generateShareLink,
    parseSharedData,
    showShareDialog,
    copyToClipboard
  };
})();

// 导出到全局作用域
if (typeof window !== 'undefined') {
  window.ShareManager = ShareManager;
}
