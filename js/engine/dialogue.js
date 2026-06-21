/**
 * 对话引擎
 * 逐字打印、富文本、点击推进
 */
const Dialogue = {
  _textBox: null,
  _textEl: null,
  _nameTag: null,
  _nameText: null,
  _continueIndicator: null,
  _dialogueArea: null,

  _timer: null,
  _currentText: '',
  _displayedChars: 0,
  _isTyping: false,
  _speed: 40,
  _onComplete: null,
  _isWaitingForClick: false,
  _skipMode: false,        // 跳过模式
  _currentSpeaker: null,   // 当前说话人(用于历史)
  _history: [],            // 对话历史

  // 富文本标签正则
  _tagRegex: /<(\/)?(shake|color=#[0-9a-fA-F]+|big|small|speed=\d+)>/g,

  /**
   * 初始化DOM引用 & 事件
   */
  init() {
    this._textBox = document.getElementById('text-box');
    this._textEl = document.getElementById('dialogue-text');
    this._nameTag = document.getElementById('name-tag');
    this._nameText = document.getElementById('name-text');
    this._continueIndicator = document.getElementById('continue-indicator');
    this._dialogueArea = document.getElementById('dialogue-area');

    // 点击文本框推进对话
    this._textBox.addEventListener('click', () => this._onClick());
    // 空格键推进
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this._onClick();
      }
    });
  },

  /**
   * 显示一段对话
   * @param {object} line - { speaker?, text, onComplete? }
   *   speaker: 角色ID或null（旁白）
   *   text: 对话文本，支持富文本标签
   *   onComplete: 对话推进后的回调
   */
  show(line) {
    // 清除之前的定时器
    this._stopTyping();

    const speaker = line.speaker || null;
    const text = line.text || '';
    this._onComplete = line.onComplete || null;

    // 设置说话人
    if (speaker && CHARACTERS[speaker]) {
      const char = CHARACTERS[speaker];
      this._nameText.textContent = char.name;
      this._nameTag.classList.remove('hidden');
      this._nameTag.style.borderColor = char.color;
      // 高亮说话人立绘
      Sprite.setSpeaker(speaker);
    } else if (speaker) {
      // 直接显示名字（不在角色表中）
      this._nameText.textContent = speaker;
      this._nameTag.classList.remove('hidden');
      this._nameTag.style.borderColor = 'var(--panel-border)';
      Sprite.setSpeaker(null);
    } else {
      // 旁白/叙述
      this._nameTag.classList.add('hidden');
      Sprite.setSpeaker(null);
    }

    // 记录历史
    this._currentSpeaker = speaker;
    this._history.push({ speaker, text, timestamp: Date.now() });

    // 跳过模式：直接完成，自动推进
    if (this._skipMode && text.length > 0) {
      this._currentText = text;
      this._displayedChars = text.length;
      this._textEl.innerHTML = this._parseRichText(text);
      this._isTyping = false;
      this._isWaitingForClick = false;
      if (this._onComplete) {
        const cb = this._onComplete;
        this._onComplete = null;
        setTimeout(() => cb(), 30);
      }
      return;
    }

    // 开始逐字打印
    this._currentText = text;
    this._displayedChars = 0;
    this._textEl.innerHTML = '';
    this._continueIndicator.style.display = 'none';
    this._isTyping = true;
    this._isWaitingForClick = false;

    this._typeNextChar();
  },

  /**
   * 打印下一个字符
   */
  _typeNextChar() {
    if (this._displayedChars >= this._currentText.length) {
      // 打印完成
      this._isTyping = false;
      this._continueIndicator.style.display = 'block';
      this._isWaitingForClick = true;
      // 立即执行回调（不等待点击）的情况由 onComplete 控制
      if (this._onComplete && this._currentText === '') {
        // 空文本立即推进
        const cb = this._onComplete;
        this._onComplete = null;
        cb();
      }
      return;
    }

    // 按字符打印（汉字一个char，ASCII一个char）
    const char = this._currentText[this._displayedChars];
    this._displayedChars++;

    // 检查是否有未闭合的标签
    const partial = this._currentText.substring(0, this._displayedChars);
    this._textEl.innerHTML = this._parseRichText(partial);

    // 根据字符调整速度
    let delay = this._speed;
    if (char === '，' || char === '、') delay = this._speed * 2;
    if (char === '。' || char === '！' || char === '？') delay = this._speed * 3;
    if (char === '…' || char === '…') delay = this._speed * 4;
    if (char === '\n') delay = this._speed * 2;

    this._timer = setTimeout(() => this._typeNextChar(), delay);
  },

  /**
   * 解析富文本标签
   * 支持: <shake>文字</shake> <color=#ff0000>文字</color> <big>文字</big> <speed=20>文字</speed>
   */
  _parseRichText(text) {
    let result = text;
    // 对标签做HTML转换
    result = result.replace(/<shake>/g, '<span class="shake-text">');
    result = result.replace(/<\/shake>/g, '</span>');
    result = result.replace(/<color=([^>]+)>/g, '<span style="color:$1">');
    result = result.replace(/<\/color>/g, '</span>');
    result = result.replace(/<big>/g, '<span style="font-size:1.3em">');
    result = result.replace(/<\/big>/g, '</span>');
    result = result.replace(/<small>/g, '<span style="font-size:0.8em; color:#a0a0b0">');
    result = result.replace(/<\/small>/g, '</span>');
    // speed标签不在HTML中渲染，仅用于解析时调整速度
    result = result.replace(/<speed=\d+>/g, '');
    result = result.replace(/<\/speed>/g, '');
    return result;
  },

  /**
   * 点击处理
   */
  _onClick() {
    // 如果菜单/存档/选项面板打开，忽略点击
    if (!document.getElementById('menu-panel').classList.contains('hidden') ||
        !document.getElementById('save-panel').classList.contains('hidden') ||
        !document.getElementById('action-panel').classList.contains('hidden')) {
      return;
    }

    if (this._isTyping) {
      // 正在打印 → 立即显示全部
      this._skipToEnd();
    } else if (this._isWaitingForClick) {
      // 等待点击 → 推进到下一句
      this._advance();
    }
  },

  /**
   * 跳过打印，立即显示全部文本
   */
  _skipToEnd() {
    this._stopTyping();
    this._displayedChars = this._currentText.length;
    this._textEl.innerHTML = this._parseRichText(this._currentText);
    this._isTyping = false;
    this._continueIndicator.style.display = 'block';
    this._isWaitingForClick = true;
  },

  /**
   * 推进到下一句对话
   */
  _advance() {
    this._isWaitingForClick = false;
    this._continueIndicator.style.display = 'none';
    // 调用回调推进剧本
    if (this._onComplete) {
      const cb = this._onComplete;
      this._onComplete = null;
      cb();
    }
  },

  /**
   * 停止打印
   */
  _stopTyping() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  },

  /**
   * 检查是否正在打字或等待点击
   */
  isBusy() {
    return this._isTyping || this._isWaitingForClick;
  },

  /** 开启/关闭跳过模式 */
  setSkipMode(on) {
    this._skipMode = on;
    const btn = document.getElementById('skip-btn');
    if (btn) {
      if (on) btn.classList.add('skipping');
      else btn.classList.remove('skipping');
    }
    // 如果当前正在等待点击且开启跳过，自动推进
    if (on && this._isWaitingForClick) {
      this._advance();
    }
  },

  isSkipMode() { return this._skipMode; },

  /** 获取对话历史 */
  getHistory() { return [...this._history]; },

  /**
   * 强制结束当前对话（用于场景切换等）
   */
  forceEnd() {
    this._stopTyping();
    this._isTyping = false;
    this._isWaitingForClick = false;
    this._continueIndicator.style.display = 'none';
    this._textEl.innerHTML = '';
    this._nameTag.classList.add('hidden');
    this._onComplete = null;
  },

  /**
   * 序列化（对话状态一般不存，存剧本位置即可）
   */
  serialize() {
    return {
      currentText: this._currentText,
      displayedChars: this._displayedChars,
      isTyping: this._isTyping,
    };
  },

  /**
   * 反序列化
   */
  deserialize(data) {
    // 读档后通常强制结束当前对话，重新从剧本位置播放
    this.forceEnd();
  },
};
