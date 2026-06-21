/**
 * 全局剧情标记系统
 * 控制地点解锁、事件触发、路线分歧
 */
const Flag = {
  _flags: {},

  /**
   * 初始化/重置所有标记
   */
  init() {
    this._flags = {
      // 地点解锁
      unlockedSchool: true,       // 学校（初始可用）
      unlockedBar: true,         // 酒吧打工（初始可用）
      unlockedCasino: false,     // 赌场（酒吧剧情后解锁）
      unlockedPark: false,       // 公园（赌场初访后解锁）
      unlockedCasinoHall: false, // 赌场大厅（签协议后解锁）
      unlockedVIP: false,        // 包间（累计4次后解锁）

      // 剧情进度
      finishedSchool: false,     // 完成上学
      finishedBar: false,        // 完成酒吧打工
      barEventTriggered: false,  // 酒吧剧情已触发
      metA: false,               // 见过A先生
      metWaiter: false,          // 见过兔子服务生
      acceptedBet: false,        // 接受赌局
      signedContract: false,     // 签订协议
      tutorialDone: false,       // 教学局完成
      tutorialWon: false,        // 教学局获胜
      ending1Triggered: false,   // 结局1已触发

      // 计数
      rejectCount: 0,
      currentDay: 1,
      actionPoints: 2,
      visitedCasinoHall: false,  // 是否已去过赌场大厅
    };
  },

  /**
   * 获取标记值
   */
  get(key) {
    return this._flags[key] ?? null;
  },

  /**
   * 设置标记
   */
  set(key, value) {
    this._flags[key] = value;
  },

  /**
   * 切换布尔标记
   */
  toggle(key) {
    this._flags[key] = !this._flags[key];
  },

  /**
   * 检查地点是否解锁
   */
  isLocationUnlocked(location) {
    const map = {
      'school': 'unlockedSchool',
      'bar': 'unlockedBar',
      'casino': 'unlockedCasino',
      'park': 'unlockedPark',
      'casinoHall': 'unlockedCasinoHall',
      'vip': 'unlockedVIP',
    };
    return this._flags[map[location]] ?? false;
  },

  /**
   * 获取当前可用地点列表
   */
  getAvailableLocations() {
    const all = [
      { id: 'school', label: '去上学', icon: '📚' },
      { id: 'bar', label: '酒吧打工', icon: '🍺' },
      { id: 'casino', label: '去赌场', icon: '🎰' },
      { id: 'park', label: '去公园', icon: '🌳' },
    ];
    return all.map(loc => ({
      ...loc,
      unlocked: this.isLocationUnlocked(loc.id),
    }));
  },

  /**
   * 序列化（供存档用）
   */
  serialize() {
    return JSON.parse(JSON.stringify(this._flags));
  },

  /**
   * 反序列化（供读档用）
   */
  deserialize(data) {
    this._flags = JSON.parse(JSON.stringify(data));
  },
};
