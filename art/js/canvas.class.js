import { downloadByTagA } from '../../utils/index.js';

/**
 * Canvas 类
 */
class Canvas {
  constructor(options) {
    const { radio } = options;
    this.canvas = null;
    this.ctx = null;
    this.width = 300;                                 // 画布宽度
    this.height = 150;                                // 画布高度
    this.center = [this.width / 2, this.height / 2];  // 画布中心点
    this.radio = radio || 1;                          // 画布缩放倍数

    this.init(options);
  }

  init({ canvas, width, height }) {
    if (!canvas) return;
    this.canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;
    if (!this.canvas.getContext) return;
    this.ctx = this.canvas.getContext('2d');

    width *= this.radio;
    height *= this.radio;
    this.setSize({ width, height });
  }

  /**
   * 设置画布尺寸
   */
  setSize(data) {
    const { width, height } = data;
    this.width = width || this.width;
    this.height = height || this.height;
    this.center = [this.width / 2, this.height / 2];
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  /**
   * 清除画布
   * @param { String } style fillStyle 参数
   */
  clear(style) {
    this.ctx.save();
    if (style) {
      this.ctx.fillStyle = style;
      this.ctx.fillRect(0, 0, this.width, this.height);
    } else {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
    this.ctx.restore();
  }

  /**
   * 将画布保存为图片
   */
  download({ mimeType, quality } = {}) {
    mimeType = mimeType || 'image/png';
    quality = quality || 1;
    console.log(this.canvas);
    const base64 = this.canvas.toDataURL(mimeType, quality);
    downloadByTagA({ URL: base64 });
  }
}
export default Canvas;
