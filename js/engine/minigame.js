/**
 * Canvas roundRect polyfill
 */
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
    this.beginPath(); this.moveTo(x + r.tl, y);
    this.lineTo(x + w - r.tr, y); this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
    this.lineTo(x + w, y + h - r.br); this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
    this.lineTo(x + r.bl, y + h); this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
    this.lineTo(x, y + r.tl); this.quadraticCurveTo(x, y, x + r.tl, y);
    this.closePath(); return this;
  };
}

const Minigame = {
  _container: null, _canvas: null, _ctx: null, _btnArea: null,

  SUITS: ['A', 'K', 'Q'],
  JOKER_BIG: '大丑', JOKER_SMALL: '小丑',

  _deck: [], _playerHand: [], _opponentHand: [],
  _coreCard: null,
  _playerPlayed: [], _opponentPlayed: [],
  _playerScore: 0, _opponentScore: 0,
  _isPlayerTurn: true,
  _selectedCards: [],
  _phase: 'idle',
  _mode: 'tutorial',
  _callback: null,
  _opponentInfo: null,
  _message: '',
  _roundNum: 0,
  _prevScene: null,

  init() {
    this._container = document.createElement('div');
    this._container.id = 'minigame-container';
    this._container.style.cssText =
      'position:absolute;inset:0;z-index:150;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:6px;padding-bottom:14px;pointer-events:none;';
    this._canvas = document.createElement('canvas');
    this._canvas.width = 1000;
    this._canvas.height = 720;
    this._canvas.style.cssText = 'border-radius:12px;pointer-events:auto;';
    this._ctx = this._canvas.getContext('2d');
    this._container.appendChild(this._canvas);

    this._btnArea = document.createElement('div');
    this._btnArea.id = 'minigame-btns';
    this._btnArea.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;justify-content:center;min-height:36px;pointer-events:auto;';
    this._container.appendChild(this._btnArea);

    document.getElementById('game-container').appendChild(this._container);
    this._container.classList.add('hidden');
    this._canvas.addEventListener('click', (e) => this._onCanvasClick(e));
  },

  // ========== 入口 ==========
  start(opts = {}) {
    this._mode = opts.mode || 'tutorial';
    this._callback = opts.callback || null;
    this._opponentInfo = opts.opponent || null;
    this._heroinePose = opts.heroinePose || 'home';
    this._showVSScreen(() => {
      this._initGame();
      this._container.classList.remove('hidden');
      // 延迟让立绘先渲染
      setTimeout(() => this._nextRound(), 100);
    });
  },

  _initGame() {
    this._deck = [];
    for (const s of this.SUITS) for (let i = 0; i < 6; i++) this._deck.push(s);
    this._deck.push(this.JOKER_BIG, this.JOKER_SMALL);
    this._shuffle(this._deck);
    this._playerHand = this._deck.splice(0, 5);
    this._opponentHand = this._deck.splice(0, 5);
    this._playerScore = 0; this._opponentScore = 0;
    this._selectedCards = []; this._isPlayerTurn = true;
    this._message = ''; this._roundNum = 0;

    this._prevScene = Scene.getCurrent();
    Scene.set('牌桌', 'instant');
    // 抬高立绘层
    document.getElementById('sprite-layer').classList.add('on-top');
    // 牌局中立绘：女主裁切，对手半身
    Sprite.show('heroine', this._heroinePose || 'home', 'left');
    if (this._opponentInfo) {
      Sprite.show(this._opponentInfo.charId, 'play', 'right');
    }
  },

  _nextRound() {
    // 玩家手牌出完 → 玩家直接赢
    if (this._playerHand.length === 0) {
      this._playerScore = Math.max(this._playerScore + 1, this._opponentScore + 1);
      this._endGame(); return;
    }
    // 对手手牌出完 → 对手赢
    if (this._opponentHand.length === 0) {
      this._opponentScore = Math.max(this._opponentScore + 1, this._playerScore + 1);
      this._endGame(); return;
    }

    this._roundNum++;
    this._coreCard = this.SUITS[Math.floor(Math.random() * 3)];
    this._playerPlayed = []; this._opponentPlayed = [];
    this._selectedCards = [];
    this._isPlayerTurn = true;
    this._phase = 'select';

    this._showRoundBanner();
    this._render();
    this._showPlayerActions();
  },

  _showRoundBanner() {
    const banner = document.createElement('div');
    banner.style.cssText = `
      position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      color:#c9a96e;font-size:40px;font-weight:bold;letter-spacing:8px;
      z-index:155;pointer-events:none;
      animation: fadeInOut 2s ease forwards;
    `;
    banner.textContent = `第 ${this._roundNum} 回合`;
    this._container.appendChild(banner);
    setTimeout(() => banner.remove(), 2000);
  },

  // ========== 玩家选牌 ==========
  _showPlayerActions() {
    this._btnArea.innerHTML = '';
    this._phase = 'select';
    const info = document.createElement('div');
    info.style.cssText = 'color:#ddd;text-align:center;font-size:15px;width:100%;';
    info.textContent = `核心牌【${this._coreCard}】— 选1-3张出牌`;
    this._btnArea.appendChild(info);

    if (this._selectedCards.length >= 1 && this._selectedCards.length <= 3) {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = `出牌（${this._selectedCards.length}张 → 全是【${this._coreCard}】）`;
      btn.addEventListener('click', () => this._playerPlay());
      this._btnArea.appendChild(btn);
    }
    if (this._selectedCards.length > 0) {
      const btn = document.createElement('button');
      btn.className = 'choice-btn'; btn.style.opacity = '0.6';
      btn.textContent = '取消';
      btn.addEventListener('click', () => { this._selectedCards = []; this._render(); this._showPlayerActions(); });
      this._btnArea.appendChild(btn);
    }
  },

  _onCanvasClick(e) {
    if (this._phase !== 'select') return;
    const rect = this._canvas.getBoundingClientRect();
    const scaleX = this._canvas.width / rect.width;
    const scaleY = this._canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    // 玩家手牌在下方 (row2Bottom + 90 = 270+180+90 = 540)
    const cardW = 130, cardH = 180, gap = 20;
    const totalW = this._playerHand.length * (cardW + gap) - gap;
    const startX = (this._canvas.width - totalW) / 2;
    const y = 566;

    for (let i = 0; i < this._playerHand.length; i++) {
      const cx = startX + i * (cardW + gap);
      const cy = this._selectedCards.includes(i) ? y - 24 : y;
      if (mx >= cx && mx <= cx + cardW && my >= cy && my <= cy + cardH) {
        const idx = this._selectedCards.indexOf(i);
        if (idx >= 0) this._selectedCards.splice(idx, 1);
        else if (this._selectedCards.length < 3) this._selectedCards.push(i);
        this._selectedCards.sort((a, b) => a - b);
        this._render();
        this._showPlayerActions();
        return;
      }
    }
  },

  // ========== 玩家出牌 ==========
  _playerPlay() {
    if (this._selectedCards.length === 0) return;
    this._playerPlayed = this._selectedCards.map(i => this._playerHand[i]).sort();
    const sorted = [...this._selectedCards].sort((a, b) => b - a);
    for (const i of sorted) this._playerHand.splice(i, 1);
    this._selectedCards = [];
    this._phase = 'opponentTurn';
    this._btnArea.innerHTML = '';
    this._render();
    setTimeout(() => {
      // 出完手牌 → 直接赢
      if (this._playerHand.length === 0) {
        this._playerScore++;
        this._render();
        setTimeout(() => this._endGame(), 600);
        return;
      }
      this._opponentDecide();
    }, 500);
  },

  // ========== 对手决策 ==========
  _opponentDecide() {
    const mustChallenge = this._playerHand.length === 0;
    let challenge = mustChallenge || this._aiDecide();
    if (challenge) {
      this._resolveChallenge('player');
    } else {
      this._message = '';
      this._isPlayerTurn = false;
      this._render();
      this._btnArea.innerHTML = '';
      setTimeout(() => this._opponentPlay(), 400);
    }
  },

  _aiDecide() {
    const cards = this._playerPlayed;
    if (cards.length === 1 && cards[0] === this.JOKER_SMALL) return Math.random() < 0.25;
    if (this._mode === 'tutorial') return Math.random() < 0.35;
    const hasCore = cards.includes(this._coreCard);
    const hasJoker = cards.includes(this.JOKER_BIG) || cards.includes(this.JOKER_SMALL);
    if (cards.length >= 2 && !hasCore && !hasJoker) return Math.random() < 0.7;
    if (cards.length === 3) return Math.random() < 0.55;
    return Math.random() < 0.4;
  },

  // ========== 对手出牌 ==========
  _opponentPlay() {
    // 对手出完手牌 → 对手直接赢
    if (this._opponentHand.length === 0) {
      this._opponentScore++;
      this._message = '对手手牌出完了！对手赢了！';
      this._render();
      setTimeout(() => this._endGame(), 1000);
      return;
    }

    const hand = this._opponentHand;
    const count = Math.min(hand.length, Math.floor(Math.random() * 3) + 1);
    const avail = hand.map((_, i) => i);
    const indices = [];
    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * avail.length);
      indices.push(avail.splice(r, 1)[0]);
    }
    indices.sort((a, b) => a - b);
    this._opponentPlayed = indices.map(i => hand[i]);
    const sorted = [...indices].sort((a, b) => b - a);
    for (const i of sorted) this._opponentHand.splice(i, 1);

    // 对手出完 → 赢
    if (this._opponentHand.length === 0) {
      this._opponentScore++;
      this._render();
      setTimeout(() => this._endGame(), 600);
      return;
    }

    const must = false;
    this._message = '';
    this._phase = 'playerDecide';
    this._render();
    this._showChallengeBtns(must);
  },

  _showChallengeBtns(must) {
    this._btnArea.innerHTML = '';

    const chal = document.createElement('button');
    chal.className = 'choice-btn';
    chal.textContent = '质疑！';
    chal.addEventListener('click', () => { this._btnArea.innerHTML = ''; this._resolveChallenge('opponent'); });
    this._btnArea.appendChild(chal);

    const bel = document.createElement('button');
    bel.className = 'choice-btn'; bel.style.opacity = '0.7';
    bel.textContent = '相信';
    bel.addEventListener('click', () => {
      this._btnArea.innerHTML = '';
      this._message = '';
      this._phase = 'select'; this._isPlayerTurn = true;
      this._playerPlayed = []; this._opponentPlayed = []; this._selectedCards = [];
      this._coreCard = this.SUITS[Math.floor(Math.random() * 3)];
      this._render(); this._showPlayerActions();
    });
    this._btnArea.appendChild(bel);
  },

  // ========== 质疑结算 ==========
  _resolveChallenge(whoPlayed) {
    this._phase = 'reveal';
    const cards = whoPlayed === 'player' ? this._playerPlayed : this._opponentPlayed;
    const allMatch = cards.every(c => c === this._coreCard || c === this.JOKER_BIG || c === this.JOKER_SMALL);
    const soloSmall = cards.length === 1 && cards[0] === this.JOKER_SMALL;

    let roundLoser = null;
    if (soloSmall) {
      roundLoser = whoPlayed === 'player' ? 'opponent' : 'player';
    } else if (!allMatch) {
      roundLoser = whoPlayed;
    } else {
      roundLoser = whoPlayed === 'player' ? 'opponent' : 'player';
    }

    if (roundLoser === 'player') this._opponentScore++;
    else this._playerScore++;

    this._message = '';
    this._btnArea.innerHTML = '';
    this._render();

    setTimeout(() => {
      this._playerPlayed = []; this._opponentPlayed = []; this._selectedCards = [];
      this._nextRound();
    }, 1000);
  },

  // ========== 结束 ==========
  _endGame() {
    this._phase = 'finalResult';
    const won = this._playerScore > this._opponentScore;
    const tie = this._playerScore === this._opponentScore;

    // 恢复立绘层
    document.getElementById('sprite-layer').classList.remove('on-top');
    if (this._prevScene) Scene.set(this._prevScene, 'fade');
    // 恢复全身立绘
    const restorePose = (this._mode === 'tutorial') ? 'home' : 'casino';
    Sprite.hide();
    Sprite.show('heroine', restorePose, 'left');

    this._btnArea.innerHTML = '';
    const title = document.createElement('div');
    title.style.cssText = `color:${won ? '#c9a96e' : '#e74c3c'};font-size:22px;text-align:center;width:100%;font-weight:bold;`;
    title.textContent = tie ? '平局！' : (won ? '你赢了！' : '你输了...');
    this._btnArea.appendChild(title);

    const detail = document.createElement('div');
    detail.style.cssText = 'color:#aaa;text-align:center;font-size:15px;';
    detail.textContent = `比分：你 ${this._playerScore} - ${this._opponentScore} 对手`;
    this._btnArea.appendChild(detail);
    this._render();

    if (!won && !tie && this._mode === 'tutorial') {
      const retry = document.createElement('button');
      retry.className = 'choice-btn'; retry.textContent = '再试一次';
      retry.addEventListener('click', () => { this._initGame(); this._nextRound(); });
      this._btnArea.appendChild(retry);
      const giveUp = document.createElement('button');
      giveUp.className = 'choice-btn'; giveUp.style.opacity = '0.5'; giveUp.textContent = '放弃...';
      giveUp.addEventListener('click', () => {
        this._container.classList.add('hidden');
        document.getElementById('sprite-layer').classList.remove('on-top');
        if (this._prevScene) Scene.set(this._prevScene, 'instant');
        const restorePose2 = (this._mode === 'tutorial') ? 'home' : 'casino';
        Sprite.hide(); Sprite.show('heroine', restorePose2, 'left');
        if (this._callback) this._callback({ won: false });
      });
      this._btnArea.appendChild(giveUp);
    } else {
      setTimeout(() => {
        this._container.classList.add('hidden');
        if (this._prevScene) Scene.set(this._prevScene, 'instant');
        Sprite.hide(); Sprite.show('heroine', this._heroinePose || 'home', 'left');
        if (this._callback) this._callback({ won: won || tie });
      }, 2000);
    }
  },

  // ========== VS画面 (双方全身) ==========
  _showVSScreen(onDone) {
    const vs = document.getElementById('vs-screen');
    if (!vs) { onDone(); return; }
    const vsLeft = document.getElementById('vs-left-img');
    const vsPose = (this._mode === 'tutorial') ? 'home' : 'casino';
    vsLeft.src = CHARACTERS.heroine.sprites[vsPose] || CHARACTERS.heroine.sprites.home;
    vsLeft.style.height = '70vh';
    document.getElementById('vs-left-name').textContent = CHARACTERS.heroine.name;
    if (this._opponentInfo) {
      const opp = CHARACTERS[this._opponentInfo.charId];
      if (opp) {
        // VS用全身(default)，不用play
        document.getElementById('vs-right-img').src = opp.sprites.default;
        document.getElementById('vs-right-name').textContent = opp.name;
      }
    }
    vs.classList.remove('hidden');
    let done = false;
    const go = () => { if (done) return; done = true; vs.classList.add('hidden'); onDone(); };
    vs.addEventListener('click', go, { once: true });
    setTimeout(go, 2500);
  },

  // ========== 辅助 ==========
  _shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } },

  // ========== 渲染 ==========
  _render() {
    const ctx = this._ctx, W = this._canvas.width, H = this._canvas.height;
    ctx.clearRect(0, 0, W, H);

    const bigW = 130, bigH = 180, gap90 = 90;

    // === 比分 (最顶上) ===
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 16px "Microsoft YaHei",sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`${this._playerScore} : ${this._opponentScore}`, W / 2, 16);

    // === 对手手牌（牌背，贴顶） ===
    const backW = 130, backH = 180, backGap = 10;
    const obTotalW = this._opponentHand.length * (backW + backGap) - backGap;
    const obStartX = (W - obTotalW) / 2;
    for (let i = 0; i < this._opponentHand.length; i++)
      this._drawCardBack(ctx, obStartX + i * (backW + backGap), 26, backW, backH);
    const row1Bottom = 206;

    // === 对手出的牌（缩小，不重叠） ===
    if (this._opponentPlayed.length > 0) {
      const sW = 60, sH = 84, sGap = 12;
      const total = this._opponentPlayed.length * (sW + sGap) - sGap;
      const sx = (W - total) / 2;
      for (let i = 0; i < this._opponentPlayed.length; i++)
        this._drawCard(ctx, sx + i * (sW + sGap), row1Bottom + 6, this._opponentPlayed[i], sW, sH);
    }

    // === 核心牌 ===
    const coreY = row1Bottom + gap90;
    const coreX = W / 2 - bigW / 2;
    this._drawCard(ctx, coreX, coreY, this._coreCard, bigW, bigH);
    ctx.fillStyle = '#c9a96e'; ctx.font = '13px "Microsoft YaHei",sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('核心牌', W / 2, coreY + bigH + 18);
    const row2Bottom = coreY + bigH;

    // === 你出的牌（缩小，不重叠） ===
    if (this._playerPlayed.length > 0) {
      const sW = 60, sH = 84, sGap = 12;
      const total = this._playerPlayed.length * (sW + sGap) - sGap;
      const sx = (W - total) / 2;
      for (let i = 0; i < this._playerPlayed.length; i++)
        this._drawCard(ctx, sx + i * (sW + sGap), row2Bottom + 6, this._playerPlayed[i], sW, sH);
    }

    // === 玩家手牌 ===
    const cardW = bigW, cardH = bigH, gap = 20;
    const totalW = this._playerHand.length * (cardW + gap) - gap;
    const startX = (W - totalW) / 2;
    const y = row2Bottom + gap90;

    for (let i = 0; i < this._playerHand.length; i++) {
      const offY = this._selectedCards.includes(i) ? -24 : 0;
      this._drawCard(ctx, startX + i * (cardW + gap), y + offY, this._playerHand[i], cardW, cardH);
      if (this._selectedCards.includes(i)) {
        ctx.strokeStyle = '#c9a96e'; ctx.lineWidth = 4;
        ctx.strokeRect(startX + i * (cardW + gap) - 3, y + offY - 3, cardW + 6, cardH + 6);
      }
    }
  },

  _drawCard(ctx, x, y, v, w, h) {
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#999'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 6); ctx.fill(); ctx.stroke();
    let d = v, c = '#1a1a2e';
    if (v === this.JOKER_BIG) { d = '🤡'; c = '#8b00ff'; }
    else if (v === this.JOKER_SMALL) { d = '🃏'; c = '#ff1493'; }
    else if (v === 'A') c = '#c0392b';
    else if (v === 'K') c = '#2c3e50';
    else if (v === 'Q') c = '#2980b9';
    ctx.fillStyle = c;
    const fs = v.length > 1 ? 38 : Math.floor(w * 0.45);
    ctx.font = `${fs}px "Microsoft YaHei",sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(d, x + w / 2, y + h / 2 + (v.length > 1 ? 12 : w * 0.14));
  },

  _drawCardBack(ctx, x, y, w, h) {
    w = w || 40; h = h || 56;
    ctx.fillStyle = '#2a3a6a'; ctx.strokeStyle = '#4a5a8a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3a4a7a'; ctx.fillRect(x + 8, y + 8, w - 16, h - 16);
    ctx.fillStyle = '#556'; ctx.font = `${Math.floor(h*0.35)}px "Microsoft YaHei",sans-serif`;
    ctx.textAlign = 'center'; ctx.fillText('?', x + w / 2, y + h / 2 + Math.floor(h*0.08));
  },
};
