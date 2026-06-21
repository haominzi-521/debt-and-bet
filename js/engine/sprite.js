/**
 * 立绘管理
 * 左侧=女主(默认)，右侧=其他角色
 */
const Sprite = {
  _slots: {
    left: { container: null, img: null, charId: null, pose: null },
    right: { container: null, img: null, charId: null, pose: null },
  },
  _activeSpeaker: null,

  init() {
    this._slots.left.container = document.getElementById('sprite-left');
    this._slots.left.img = document.getElementById('sprite-left-img');
    this._slots.right.container = document.getElementById('sprite-right');
    this._slots.right.img = document.getElementById('sprite-right-img');
  },

  /**
   * 显示角色立绘
   * @param {string} charId - 角色ID
   * @param {string} pose - 姿态 (默认 'default')
   * @param {string} side - 'left' | 'right' (不传则用角色默认位置)
   */
  show(charId, pose = 'default', side = null) {
    const char = CHARACTERS[charId];
    if (!char) {
      console.warn(`[Sprite] 未知角色: ${charId}`);
      return;
    }

    const targetSide = side || char.defaultSide || 'right';
    const spritePath = char.sprites?.[pose] || char.sprites?.default;

    if (!spritePath) {
      console.warn(`[Sprite] 角色 ${charId} 无立绘 "${pose}"`);
      this.hide(charId);
      return;
    }

    const slot = this._slots[targetSide];
    if (!slot) return;

    slot.img.src = spritePath;
    slot.img.alt = char.name;
    slot.container.classList.remove('hidden');
    slot.charId = charId;
    slot.pose = pose;

    const isMale = (charId !== 'heroine');
    if (isMale) {
      slot.img.style.maxHeight = (pose === 'play') ? '30vh' : '82vh';
    } else {
      if (pose === 'play_card_casino') {
        slot.img.style.maxHeight = '45vh';
      } else if (pose === 'play_card_home') {
        slot.img.style.maxHeight = '38vh';
      } else if (pose === 'play') {
        slot.img.style.maxHeight = '25vh';
      } else {
        slot.img.style.maxHeight = '70vh';
      }
    }
    slot.img.style.objectFit = 'contain';
    slot.img.style.objectPosition = 'center bottom';
    slot.container.style.bottom = '0';

    // 非说话者暗化
    if (this._activeSpeaker && this._activeSpeaker !== charId) {
      slot.container.classList.add('dimmed');
    } else {
      slot.container.classList.remove('dimmed');
    }
  },

  /**
   * 隐藏角色立绘
   * @param {string} charId - 不传则隐藏所有
   */
  hide(charId = null) {
    if (charId) {
      for (const [side, slot] of Object.entries(this._slots)) {
        if (slot.charId === charId) {
          slot.container.classList.add('hidden');
          slot.img.src = '';
          slot.charId = null;
          slot.pose = null;
          break;
        }
      }
    } else {
      for (const [side, slot] of Object.entries(this._slots)) {
        slot.container.classList.add('hidden');
        slot.img.src = '';
        slot.charId = null;
        slot.pose = null;
      }
    }
  },

  /**
   * 高亮说话者立绘，暗化其他人
   */
  setSpeaker(charId) {
    this._activeSpeaker = charId;
    // 没有指定说话人 → 女主说话，高亮女主
    const highlightId = charId || 'heroine';
    for (const [side, slot] of Object.entries(this._slots)) {
      if (slot.charId === highlightId) {
        slot.container.classList.remove('dimmed');
      } else if (slot.charId !== null) {
        slot.container.classList.add('dimmed');
      }
    }
  },

  clear() {
    this.hide(null);
    this._activeSpeaker = null;
  },

  serialize() {
    const sprites = {};
    for (const [side, slot] of Object.entries(this._slots)) {
      if (slot.charId) {
        sprites[side] = { charId: slot.charId, pose: slot.pose };
      }
    }
    return sprites;
  },

  deserialize(data) {
    this.clear();
    if (!data) return;
    for (const [side, info] of Object.entries(data)) {
      if (info.charId) {
        this.show(info.charId, info.pose, side);
      }
    }
  },
};
