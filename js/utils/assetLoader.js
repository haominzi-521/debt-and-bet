/**
 * 图片预加载工具
 */
const AssetLoader = {
  cache: {},

  /**
   * 预加载单张图片
   * @param {string} key - 资源标识
   * @param {string} path - 图片路径
   * @returns {Promise<HTMLImageElement>}
   */
  loadImage(key, path) {
    return new Promise((resolve, reject) => {
      if (this.cache[key]) {
        return resolve(this.cache[key]);
      }
      const img = new Image();
      img.onload = () => {
        this.cache[key] = img;
        resolve(img);
      };
      img.onerror = () => {
        // 图片不存在时用灰色占位图，不阻塞游戏
        console.warn(`[AssetLoader] 无法加载: ${path}`);
        const placeholder = this._createPlaceholder(key);
        this.cache[key] = placeholder;
        resolve(placeholder);
      };
      img.src = path;
    });
  },

  /**
   * 获取已缓存的图片
   */
  get(key) {
    return this.cache[key] || null;
  },

  /**
   * 创建占位图
   */
  _createPlaceholder(key) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 400, 600);
    ctx.fillStyle = '#333';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`[${key}]`, 200, 300);
    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  }
};
