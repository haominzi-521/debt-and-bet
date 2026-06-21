/**
 * 《债与赌》游戏主控
 */
const Game = {
  _currentNode: null,
  _scriptIndex: 0,
  _script: null,
  _isRunning: false,

  /**
   * 入口
   */
  init() {
    // 初始化子系统
    Scene.init();
    Sprite.init();
    Dialogue.init();
    Choice.init();
    Attr.init();
    Flag.init();
    Save.init();
    Minigame.init();

    // 跳过按钮
    document.getElementById('skip-btn').addEventListener('click', () => {
      Dialogue.setSkipMode(!Dialogue.isSkipMode());
    });

    // 全屏按钮
    document.getElementById('fullscreen-btn').addEventListener('click', () => {
      this._toggleFullscreen();
    });

    // 双击背景切换全屏
    document.getElementById('background-layer').addEventListener('dblclick', () => {
      this._toggleFullscreen();
    });

    // 标题画面按钮
    document.getElementById('btn-start').addEventListener('click', () => {
      this._requestFullscreen();
      this._startNewGame();
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
      document.getElementById('menu-panel').classList.add('hidden');
      Dialogue.forceEnd();
      Choice.hide();
      this._returnToTitle();
    });

    // 检查自动存档 → 显示「继续游戏」
    const autoSave = Save.getAutoSave();
    if (autoSave && autoSave.scriptIndex && autoSave.scriptIndex.node) {
      const continueBtn = document.getElementById('btn-continue');
      continueBtn.style.display = '';
      continueBtn.addEventListener('click', () => {
        this._loadAutoSave(autoSave);
      });
    }
    // 第一章完成后显示「第二章」
    if (localStorage.getItem('debt_ch1_done') === '1') {
      const ch2Btn = document.getElementById('btn-ch2');
      if (ch2Btn) {
        ch2Btn.style.display = '';
        ch2Btn.addEventListener('click', () => {
          this._startChapter2();
        });
      }
    }
  },

  /**
   * 返回标题
   */
  _returnToTitle() {
    this._isRunning = false;
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('title-screen').style.display = '';
    // 刷新继续按钮
    const autoSave = Save.getAutoSave();
    const continueBtn = document.getElementById('btn-continue');
    if (autoSave && autoSave.scriptIndex && autoSave.scriptIndex.node) {
      continueBtn.style.display = '';
    } else {
      continueBtn.style.display = 'none';
    }
  },

  /**
   * 切换全屏
   */
  _toggleFullscreen() {
    const el = document.getElementById('game-container');
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      this._requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  },

  /**
   * 请求全屏
   */
  _requestFullscreen() {
    const el = document.getElementById('game-container');
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  },

  /**
   * 新游戏
   */
  _startNewGame() {
    Flag.init();
    Attr._values = { study: 5, health: 5, mood: 5, debt: 1000, fund: 0 };
    Attr._updateUI();
    Sprite.clear();

    // 清理残留元素
    const oldEnding = document.getElementById('ending-screen');
    if (oldEnding) oldEnding.remove();
    const minigame = document.getElementById('minigame-container');
    if (minigame) minigame.classList.add('hidden');
    const vsScreen = document.getElementById('vs-screen');
    if (vsScreen) vsScreen.classList.add('hidden');

    // 隐藏标题，显示游戏
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game-container').style.display = '';
    Sprite.clear();

    this._runNode('bedroom_start');
  },

  /**
   * 继续游戏
   */
  _loadAutoSave(data) {
    Flag.deserialize(data.flags);
    Attr.deserialize(data.attributes);
    Scene.deserialize(data.scene);
    Sprite.deserialize(data.sprites);

    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game-container').style.display = '';

    if (data.scriptIndex && data.scriptIndex.node) {
      this._runNode(data.scriptIndex.node);
      this._scriptIndex = data.scriptIndex.index || 0;
    } else {
      this._runNode('bedroom_start');
    }
  },

  /**
   * 执行节点
   */
  _runNode(nodeName) {
    // 赌场大厅：没AP了强制回房间
    if (nodeName === 'casino_hall_return' && Flag.get('actionPoints') <= 0) {
      nodeName = 'free_room';
    }
    this._currentNode = nodeName;
    this._scriptIndex = 0;
    this._script = CHAPTER_1.nodes[nodeName];

    if (!this._script) {
      console.error(`[Game] 未知节点: ${nodeName}`);
      // 尝试路由
      const routed = CHAPTER_1.route(nodeName);
      if (routed && CHAPTER_1.nodes[routed]) {
        this._runNode(routed);
      }
      return;
    }

    this._isRunning = true;
    this._executeNextLine();
  },

  _executeNextLine() {
    if (!this._isRunning) return;
    if (this._scriptIndex >= this._script.length) {
      this._isRunning = false;
      return;
    }

    const line = this._script[this._scriptIndex];
    this._scriptIndex++;

    switch (line.type) {
      case 'scene':
        Scene.set(line.bg, line.transition || 'fade');
        this._executeNextLine();
        break;
      case 'narration':
        Dialogue.show({
          speaker: null,
          text: line.text,
          onComplete: () => this._executeNextLine(),
        });
        break;
      case 'dialogue':
        if (line.sprite) {
          const s = line.sprite;
          Sprite.show(s.char, s.pose || 'default', s.side || null);
        }
        Dialogue.show({
          speaker: line.speaker,
          text: line.text,
          onComplete: () => this._executeNextLine(),
        });
        break;
      case 'choice':
        Dialogue.setSkipMode(false);
        Choice.show(line.options, (next) => {
          if (next) this._runNode(next);
          else this._executeNextLine();
        });
        break;
      case 'showLocations':
        this._execShowLocations(line);
        break;
      case 'sprite':
        Sprite.show(line.char, line.pose || 'default', line.side || null);
        this._executeNextLine();
        break;
      case 'hideSprite':
        Sprite.hide(line.char || null);
        this._executeNextLine();
        break;
      case 'attr':
        this._execAttr(line);
        break;
      case 'minigame':
        Dialogue.setSkipMode(false);
        // 随机对手（如果不是A先生）
        let opp = line.opponent;
        if (!opp) {
          const pool = ['gentle', 'dark', 'suit'];
          const pick = pool[Math.floor(Math.random() * pool.length)];
          opp = { charId: pick, pose: 'play' };
          // 如果该角色没有play pose，用default
          if (!CHARACTERS[pick].sprites.play) opp.pose = 'default';
        }
        Minigame.start({
          mode: line.mode || 'normal',
          rounds: line.rounds || 3,
          opponent: opp,
          heroinePose: Flag.get('unlockedCasinoHall') ? 'play_card_casino' : 'play_card_home',
          callback: (result) => {
            if (result.won && line.nextWin) this._runNode(line.nextWin);
            else if (!result.won && line.nextLose) this._runNode(line.nextLose);
            else this._executeNextLine();
          },
        });
        break;
      case 'unlock':
        const unlockMap = {
          'school': 'unlockedSchool', 'bar': 'unlockedBar',
          'casino': 'unlockedCasino', 'park': 'unlockedPark',
          'casinoHall': 'unlockedCasinoHall', 'vip': 'unlockedVIP',
        };
        if (unlockMap[line.location]) {
          Flag.set(unlockMap[line.location], true);
          // casinoHall 也解锁普通赌场入口
          if (line.location === 'casinoHall') {
            Flag.set('unlockedCasino', true);
          }
        }
        this._executeNextLine();
        break;
      case 'jump':
        this._runNode(line.target);
        break;
      case 'ending':
        this._triggerEnding(line.id);
        break;
      case 'wait':
        setTimeout(() => this._executeNextLine(), line.ms || 500);
        break;
      case 'label':
        this._executeNextLine();
        break;
      default:
        console.warn('[Game] 未知类型:', line.type);
        this._executeNextLine();
    }
  },

  _execShowLocations(line) {
    const ap = Flag.get('actionPoints');
    // 更新AP显示
    this._updateAPDisplay();

    if (ap !== undefined && ap <= 0) {
      // AP用完 → 只能睡觉
      Dialogue.show({
        speaker: null,
        text: '行动点用完了。只能睡觉了...',
        onComplete: () => {
          Choice.show([{
            text: '上床睡觉',
            next: null,
          }], () => {
            Choice.hide();
            const day = Flag.get('currentDay') || 1;
            Flag.set('currentDay', day + 1);
            Flag.set('actionPoints', 2);
            this._updateAPDisplay();
            // 夜晚
            const nightBg = Math.random() < 0.5 ? '卧室_夜' : '卧室_雨';
            Scene.set(nightBg, 'fade');
            Dialogue.show({
              speaker: null,
              text: '夜深了...',
              onComplete: () => {
                Dialogue.show({
                  speaker: null,
                  text: `—— 第 ${day + 1} 天 ——`,
                  onComplete: () => {
                    Scene.set('卧室', 'fade');
                    Sprite.show('heroine', 'home', 'left');
                    this._updateAPDisplay();
                    this._checkStatusEndings(() => {
                      Choice.showLocations((location) => {
                        this._routeLocation(location);
                      });
                    });
                  },
                });
              },
            });
          });
        },
      });
      return;
    }
    this._checkStatusEndings(() => {
      Choice.showLocations((location) => {
        this._routeLocation(location);
      });
    });
  },

  /**
   * 更新行动点显示
   */
  _updateAPDisplay() {
    const ap = Flag.get('actionPoints');
    const el = document.getElementById('ap-text');
    if (el) {
      el.textContent = `行动点 ${ap}/2`;
      el.style.color = ap <= 0 ? '#e74c3c' : '#c9a96e';
    }
  },

  /**
   * 智能路由：根据flag选择节点
   */
  _routeLocation(location) {
    // 签协议后：上学→只上课
    if (location === 'school' && Flag.get('unlockedCasinoHall')) {
      this._runNode('school_work');
      return;
    }
    // 签协议后：酒吧→只打工赚钱
    if (location === 'bar' && Flag.get('unlockedCasinoHall')) {
      this._runNode('bar_work');
      return;
    }
    // 签协议后：赌场→直接进大厅
    if (location === 'casino' && Flag.get('unlockedCasinoHall')) {
      if (Flag.get('visitedCasinoHall')) {
        this._runNode('casino_hall_return');
      } else {
        Flag.set('visitedCasinoHall', true);
        this._runNode('casino_hall');
      }
      return;
    }
    // casino：如果之前拒绝过，走 revisit
    if (location === 'casino') {
      const rejected = Flag.get('rejectCount') || 0;
      if (rejected > 0 && CHAPTER_1.nodes['casino_revisit']) {
        this._runNode('casino_revisit');
        return;
      }
    }
    const node = CHAPTER_1.route(location);
    if (node) this._runNode(node);
  },

  _checkStatusEndings(callback) {
    const health = Attr.get('health');
    const mood = Attr.get('mood');
    const debt = Attr.get('debt');
    if (health <= 0 || mood <= 0) {
      this._triggerEnding('ending4');
      return;
    }
    if (debt <= 0) {
      this._triggerEnding('ending2');
      return;
    }
    callback();
  },

  _execAttr(line) {
    const changes = { ...line.changes };
    if (changes.actionPoints !== undefined) {
      const current = Flag.get('actionPoints');
      Flag.set('actionPoints', current + changes.actionPoints);
      this._updateAPDisplay();
      delete changes.actionPoints;
    }
    if (changes.rejectCount !== undefined) {
      const current = Flag.get('rejectCount');
      Flag.set('rejectCount', current + changes.rejectCount);
      delete changes.rejectCount;
    }
    if (Object.keys(changes).length > 0) {
      Attr.apply(changes);
    }
    this._executeNextLine();
  },

  _triggerEnding(endingId) {
    this._isRunning = false;
    Dialogue.forceEnd();
    Choice.hide();

    const endingData = ENDINGS[endingId] || { title: '未知结局', text: '...' };
    const container = document.getElementById('game-container');
    const screen = document.createElement('div');
    screen.id = 'ending-screen';

    let buttons = '<button class="menu-btn" id="btn-back-title">返回标题画面</button>';
    if (endingId === 'ch1_complete') {
      buttons = `
        <button class="menu-btn" id="btn-ch2-start" style="border-color:#c9a96e;color:#c9a96e;">进入第二章</button>
        <button class="menu-btn" id="btn-back-title">返回标题画面</button>
      `;
    }

    screen.innerHTML = `
      <h1>${endingData.title}</h1>
      <p>${endingData.text}</p>
      ${buttons}
    `;
    container.appendChild(screen);

    if (endingId === 'ch1_complete') {
      // 标记第一章完成
      try { localStorage.setItem('debt_ch1_done', '1'); } catch(e) {}
      document.getElementById('btn-ch2-start').addEventListener('click', () => {
        screen.remove();
        this._startChapter2();
      });
    }

    document.getElementById('btn-back-title').addEventListener('click', () => {
      screen.remove();
      this._returnToTitle();
    });
  },

  /**
   * 开始第二章
   */
  _startChapter2() {
    document.getElementById('game-container').style.display = '';
    document.getElementById('title-screen').style.display = 'none';
    Flag.set('actionPoints', 2);
    Flag.set('currentDay', 1);
    Sprite.clear();
    this._runNode('free_room');
  },

  getScriptIndex() {
    return { node: this._currentNode, index: this._scriptIndex };
  },

  jumpTo(scriptIndex) {
    Dialogue.forceEnd();
    Choice.hide();
    if (scriptIndex && scriptIndex.node) {
      this._runNode(scriptIndex.node);
      this._scriptIndex = scriptIndex.index || 0;
    }
  },
};

/**
 * 结局定义
 */
const ENDINGS = {
  ending1: {
    title: '结局一：专业的事交给专业的人干',
    text: '你输掉了教学局。也许这座赌场本就不属于你。\n生活还要继续，债务也还要继续...',
  },
  ending2: {
    title: '结局二：翻身',
    text: '你的债务终于还清了。\n这一刻，你等了太久。',
  },
  ending3: {
    title: '结局三：平凡救赎',
    text: '你选择了另一条路。\n不是靠赌，而是靠自己。',
  },
  ending4: {
    title: '结局四：彻底毁灭',
    text: '身心俱疲。\n你再也撑不下去了...',
  },
  ending5: {
    title: '结局五：反抗',
    text: '你不愿意继续做赌场的棋子。\n你要挣脱这个牢笼。',
  },
  ch1_complete: {
    title: '第一章 完',
    text: '',
  },
};

// ===== 启动 =====
window.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
