/**
 * 选项系统 - 右侧面板
 * 地点选择 & 剧情选项 共用右侧 #action-panel
 */
const Choice = {
  _actionPanel: null,
  _actionButtons: null,
  _actionTitle: null,

  init() {
    this._actionPanel = document.getElementById('action-panel');
    this._actionButtons = document.getElementById('action-buttons');
    this._actionTitle = this._actionPanel.querySelector('.action-title');
  },

  /**
   * 显示剧情选项 (右侧面板)
   */
  show(options, onSelect) {
    this._actionButtons.innerHTML = '';
    this._actionTitle.textContent = '选  择';
    this._actionPanel.classList.remove('hidden', 'choice-mode');
    this._actionPanel.classList.add('choice-mode');

    options.forEach((opt) => {
      // 条件检查
      if (opt.condition) {
        const val = Attr.get(opt.condition.key);
        if (opt.condition.min !== undefined && val < opt.condition.min) return;
        if (opt.condition.max !== undefined && val > opt.condition.max) return;
      }

      const btn = document.createElement('button');
      btn.className = 'action-btn';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => {
        if (opt.attr) Attr.apply(opt.attr);
        this.hide();
        if (onSelect) onSelect(opt.next, opt);
      });
      this._actionButtons.appendChild(btn);
    });

    this._actionPanel.classList.remove('hidden');
  },

  /**
   * 显示地点选择 (右侧面板)
   */
  showLocations(onSelect) {
    const locations = Flag.getAvailableLocations();
    this._actionButtons.innerHTML = '';
    this._actionTitle.textContent = '选 择 行 动';
    this._actionPanel.classList.remove('hidden', 'choice-mode');

    locations.forEach(loc => {
      const btn = document.createElement('button');
      btn.className = 'action-btn' + (loc.unlocked ? '' : ' locked');
      btn.innerHTML = `<span class="action-icon">${loc.icon}</span>${loc.label}`;
      if (!loc.unlocked) {
        btn.title = '尚未解锁';
      }
      btn.addEventListener('click', () => {
        if (!loc.unlocked) return;
        this.hide();
        if (onSelect) onSelect(loc.id);
      });
      this._actionButtons.appendChild(btn);
    });

    this._actionPanel.classList.remove('hidden');
  },

  /**
   * 隐藏面板
   */
  hide() {
    this._actionPanel.classList.add('hidden');
    this._actionButtons.innerHTML = '';
  },

  isOpen() {
    return !this._actionPanel.classList.contains('hidden');
  },
};
