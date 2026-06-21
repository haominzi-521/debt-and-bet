/**
 * 存档系统
 * 3个手动档位 + 1个自动存档
 */
const Save = {
  _savePanel: null,
  _saveSlots: null,
  _mode: 'save',  // 'save' | 'load'
  _scriptIndex: 0, // 当前剧本索引（由Game更新）
  _autoSaveKey: 'debt_and_bet_autosave',

  /**
   * 初始化DOM引用 & 事件
   */
  init() {
    this._savePanel = document.getElementById('save-panel');
    this._saveSlots = document.getElementById('save-slots');

    // 设置按钮
    document.getElementById('settings-btn').addEventListener('click', () => {
      document.getElementById('menu-panel').classList.toggle('hidden');
    });

    // 菜单按钮
    document.getElementById('btn-save').addEventListener('click', () => {
      document.getElementById('menu-panel').classList.add('hidden');
      this.open('save');
    });
    document.getElementById('btn-load').addEventListener('click', () => {
      document.getElementById('menu-panel').classList.add('hidden');
      this.open('load');
    });
    // btn-restart 由 main.js 处理（返回标题画面）
    document.getElementById('btn-close-menu').addEventListener('click', () => {
      document.getElementById('menu-panel').classList.add('hidden');
    });

    // 存档面板
    document.getElementById('btn-close-save').addEventListener('click', () => {
      this._savePanel.classList.add('hidden');
    });

    // 模式切换
    document.querySelectorAll('#save-mode-toggle .menu-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#save-mode-toggle .menu-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._mode = btn.dataset.mode;
        this._refreshSlots();
      });
    });

    // 存档槽点击
    this._saveSlots.addEventListener('click', (e) => {
      const slot = e.target.closest('.save-slot');
      if (!slot) return;
      const slotIdx = parseInt(slot.dataset.slot);
      if (this._mode === 'save') {
        this.save(slotIdx);
      } else {
        this.load(slotIdx);
      }
    });

    // 自动存档
    this._autoSave();
    window.addEventListener('beforeunload', () => this._autoSave());
  },

  /**
   * 打开存档面板
   */
  open(mode = 'save') {
    this._mode = mode;
    // 更新模式按钮状态
    document.querySelectorAll('#save-mode-toggle .menu-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });
    this._refreshSlots();
    this._savePanel.classList.remove('hidden');
  },

  /**
   * 存档
   */
  save(slotIdx) {
    const data = {
      timestamp: new Date().toLocaleString('zh-CN'),
      flags: Flag.serialize(),
      attributes: Attr.serialize(),
      scene: Scene.serialize(),
      sprites: Sprite.serialize(),
      scriptIndex: Game.getScriptIndex(),
    };

    const key = `debt_and_bet_save_${slotIdx}`;
    localStorage.setItem(key, JSON.stringify(data));
    this._refreshSlots();

    // 短暂提示
    this._flashSlot(slotIdx);
  },

  /**
   * 读档
   */
  load(slotIdx) {
    const key = `debt_and_bet_save_${slotIdx}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;

    try {
      const data = JSON.parse(raw);

      // 先关闭面板
      this._savePanel.classList.add('hidden');

      // 恢复状态
      Flag.deserialize(data.flags);
      Attr.deserialize(data.attributes);
      Scene.deserialize(data.scene);
      Sprite.deserialize(data.sprites);

      // 恢复剧本位置
      Game.jumpTo(data.scriptIndex);
    } catch (e) {
      console.error('[Save] 读档失败:', e);
      alert('读档失败，存档可能已损坏。');
    }
  },

  /**
   * 自动存档
   */
  _autoSave() {
    if (!Game || typeof Game.getScriptIndex !== 'function') return;
    const data = {
      timestamp: new Date().toLocaleString('zh-CN'),
      flags: Flag.serialize(),
      attributes: Attr.serialize(),
      scene: Scene.serialize(),
      sprites: Sprite.serialize(),
      scriptIndex: Game.getScriptIndex(),
    };
    try {
      localStorage.setItem(this._autoSaveKey, JSON.stringify(data));
    } catch (e) {
      // localStorage满，忽略
    }
  },

  /**
   * 获取自动存档
   */
  getAutoSave() {
    const raw = localStorage.getItem(this._autoSaveKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  /**
   * 刷新存档槽显示
   */
  _refreshSlots() {
    for (let i = 0; i < 3; i++) {
      const key = `debt_and_bet_save_${i}`;
      const raw = localStorage.getItem(key);
      const infoEl = document.getElementById(`slot-info-${i}`);
      if (raw) {
        try {
          const data = JSON.parse(raw);
          infoEl.textContent = data.timestamp || '已存档';
          infoEl.style.color = 'var(--accent)';
        } catch (e) {
          infoEl.textContent = '损坏';
          infoEl.style.color = 'var(--danger)';
        }
      } else {
        infoEl.textContent = '空';
        infoEl.style.color = 'var(--text-dim)';
      }
    }
  },

  /**
   * 闪烁槽位反馈
   */
  _flashSlot(slotIdx) {
    const el = document.getElementById(`slot-info-${slotIdx}`);
    if (!el) return;
    el.style.color = '#2ecc71';
    setTimeout(() => {
      this._refreshSlots();
    }, 500);
  },
};
