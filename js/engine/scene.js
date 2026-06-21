/**
 * 场景管理
 */
const Scene = {
  _bgLayer: null,
  _bgImage: null,
  _currentBg: null,

  init() {
    this._bgLayer = document.getElementById('background-layer');
    this._bgImage = document.getElementById('bg-image');
  },

  set(bgKey, transition = 'fade') {
    if (bgKey === this._currentBg) return;

    const bgMap = {
      'black':    null,
      '卧室':     '场景/卧室/晴天马赛克.png',
      '学校':     '场景/学校.png',
      '酒吧':     '场景/酒吧最终版.png',
      '打工酒吧': '场景/酒吧最终版.png',
      '包厢':     '场景/包厢最终版.png',
      '赌场':     '场景/赌场最终版.png',
      '牌桌':     '场景/赌牌桌最终版.png',
      '包间':     '场景/包厢最终版.png',
      '公园':     '场景/卧室/公园.png',
      '卧室_夜':  '场景/卧室/阴天马赛克.png',
      '卧室_雨':  '场景/卧室/雨天马赛克.png',
    };

    const path = bgMap[bgKey];
    this._currentBg = bgKey;

    if (bgKey === 'black') {
      this._bgLayer.classList.add('black');
      this._bgImage.style.opacity = '0';
      return;
    }

    this._bgLayer.classList.remove('black');

    if (transition === 'instant') {
      this._bgImage.style.transition = 'none';
      this._bgImage.src = path || '';
      this._bgImage.style.opacity = '1';
      requestAnimationFrame(() => {
        this._bgImage.style.transition = 'opacity 0.4s ease';
      });
    } else {
      this._bgImage.classList.add('fade-out');
      setTimeout(() => {
        this._bgImage.src = path || '';
        this._bgImage.classList.remove('fade-out');
      }, 400);
    }
  },

  getCurrent() { return this._currentBg; },
  serialize() { return { bg: this._currentBg }; },
  deserialize(data) { if (data.bg) this.set(data.bg, 'instant'); },
};
