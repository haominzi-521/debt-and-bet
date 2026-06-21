/**
 * 属性系统 (0-10 级)
 * 学业: 优秀/普通/低下
 * 健康: 康健/一般/虚弱
 * 心情: 高兴/平静/低落
 */
const Attr = {

  // 颜色阈值
  LEVELS: {
    good:  { min: 7, color: '#2ecc71', barClass: '' },
    mid:   { min: 4, color: '#f39c12', barClass: '' },
    bad:   { min: 0, color: '#e74c3c', barClass: '' },
  },

  // 各属性对应的文字
  WORDS: {
    study:  { good: '优秀', mid: '普通', bad: '低下' },
    health: { good: '康健', mid: '一般', bad: '虚弱' },
    mood:   { good: '高兴', mid: '平静', bad: '低落' },
  },

  _values: {
    study: 5,
    health: 5,
    mood: 5,
    debt: 1000,
    fund: 0,
  },

  _elements: {},

  init() {
    this._elements = {
      studyBar: document.getElementById('attr-study'),
      healthBar: document.getElementById('attr-health'),
      moodBar: document.getElementById('attr-mood'),
      studyWord: document.getElementById('attr-study-word'),
      healthWord: document.getElementById('attr-health-word'),
      moodWord: document.getElementById('attr-mood-word'),
      debtVal: document.getElementById('attr-debt-val'),
      fundVal: document.getElementById('attr-fund-val'),
    };
    this._updateUI();
  },

  get(key) {
    return this._values[key] ?? 0;
  },

  /**
   * 获取等级 (good/mid/bad)
   */
  _getLevel(val) {
    if (val >= 7) return 'good';
    if (val >= 4) return 'mid';
    return 'bad';
  },

  /**
   * 修改属性
   */
  apply(changes) {
    const floatLayer = document.getElementById('float-layer');
    const attrPanel = document.getElementById('attr-panel');

    for (const [key, delta] of Object.entries(changes)) {
      if (key === 'debt' || key === 'fund') {
        this._values[key] = Math.max(0, this._values[key] + delta);
        this._showFloat(floatLayer, attrPanel, key, delta);
      } else {
        const old = this._values[key];
        this._values[key] = Math.max(0, Math.min(10, old + delta));
        this._showFloat(floatLayer, attrPanel, key, delta);
      }
    }
    this._updateUI();
  },

  _showFloat(layer, panel, key, delta) {
    if (delta === 0) return;
    const el = document.createElement('span');
    el.className = 'float-num ' + (delta >= 0 ? 'positive' : 'negative');
    if (key === 'debt' || key === 'fund') {
      el.textContent = (delta >= 0 ? '+' : '') + delta + '万';
    } else {
      el.textContent = (delta >= 0 ? '+' : '') + delta;
    }
    const panelRect = panel.getBoundingClientRect();
    const idx = { study: 0, health: 1, mood: 2, debt: 3, fund: 4 }[key] || 0;
    el.style.left = (panelRect.left + panelRect.width / 2) + 'px';
    el.style.top = (panelRect.top + 25 + idx * 28) + 'px';
    layer.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  },

  _updateUI() {
    const e = this._elements;

    // 学业、健康、心情：条+文字联动
    const bars = [
      { key: 'study', bar: e.studyBar, word: e.studyWord },
      { key: 'health', bar: e.healthBar, word: e.healthWord },
      { key: 'mood', bar: e.moodBar, word: e.moodWord },
    ];

    bars.forEach(({ key, bar, word }) => {
      if (!bar || !word) return;
      const val = this._values[key];
      const level = this._getLevel(val);
      const levelInfo = this.LEVELS[level];
      const wordText = this.WORDS[key][level];

      // 条宽度 (0-10 → 0-100%)
      bar.style.width = (val * 10) + '%';
      // 条颜色
      bar.style.background = levelInfo.color;

      // 文字
      word.textContent = wordText;
      word.style.color = levelInfo.color;
    });

    // 欠债、赌资
    if (e.debtVal) e.debtVal.textContent = this._values.debt + '万';
    if (e.fundVal) e.fundVal.textContent = this._values.fund + '万';
  },

  serialize() {
    return { ...this._values };
  },

  deserialize(data) {
    this._values = { ...data };
    this._updateUI();
  },
};
