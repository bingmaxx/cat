/**
 * Clock 类
 * 属性:
 * 方法:
 */
class Clock {
  constructor(options) {
    const {
      Canvas,
    } = options;
    const { radio } = Canvas;
    this.Canvas = Canvas;

    this.GRAY_MAIN = 'rgb(97, 97, 97)';
    this.GRAY_BORDER = 'rgb(88, 88, 88)';
    this.RED_MAIN = 'rgb(199, 78, 81)';
    this.RED_CIRCLE = 'rgb(182, 72, 74)';

    // 指针样式
    this.POINTER_H = {
      l0: 0, // 反向长度, 值为表盘直径的占比.
      l1: 0.2, // 指针长度
      r0: 0.025, // 指针尾端半径
      r1: 0.025, // 指针尖端半径
      rgb: this.GRAY_MAIN, // 指针颜色
      rgb_b: this.GRAY_BORDER, // 指针边框颜色
    };
    this.POINTER_M = {
      l0: 0,
      l1: 0.25,
      r0: 0.0215,
      r1: 0.0215,
      rgb: this.GRAY_MAIN,
      rgb_b: this.GRAY_BORDER,
    };
    this.POINTER_S = {
      l0: 0.06,
      l1: 0.35,
      r0: 0.0028,
      r1: 0.0015,
      rgb: this.RED_MAIN,
      rgb_b: this.RED_MAIN,
    };

    // 指针上实心圆样式 - 时针/分针
    this.CIRCLE_0 = {
      r: 0.036, // 半径
      rgb: this.GRAY_MAIN, // 填充颜色
      rgb_b: this.GRAY_BORDER, // 边框颜色
    };
    // 指针上实心圆样式 - 秒针
    this.CIRCLE_1 = {
      r: 0.016,
      rgb: this.RED_CIRCLE,
      rgb_b: this.RED_CIRCLE,
    };

    this.SHADOW = {
      blur: 8 * radio,
      color: 'rgba(0, 0, 0, 0.2)',
      x: 3 * radio,
      y: 6 * radio,
    };

    this.refrash();
  }

  /**
   * desc: 绘制表盘
   */
  drawCircle() {
    const {
      ctx, width, height, radio,
    } = this.Canvas;
    const SHADOW = {
      blur: 10 * radio,
      color: 'rgba(0, 0, 0, 0.1)',
      x: 2 * radio,
      y: 3 * radio,
    };

    const R1 = 0.4; // 内表盘半径
    const R2 = 0.45; // 最大半径
    const R3 = 0.32; // 数字所在位置半径
    const FONT_SIZE = 0.06;
    ctx.save();
    ctx.translate(width / 2, height / 2);

    // 内表盘
    ctx.fillStyle = '#fafafa';
    ctx.beginPath();
    ctx.arc(0, 0, R1 * width, 0, 2 * Math.PI);
    ctx.fill();

    // 边框
    ctx.lineWidth = (R2 - R1) * width;
    ctx.strokeStyle = 'white';
    this.shadow(SHADOW);
    ctx.beginPath();
    ctx.arc(0, 0, ((R2 + R1) / 2) * width, 0, 2 * Math.PI);
    ctx.stroke();

    // 边框描边
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#e0e0e0';
    this.shadow(null);
    ctx.beginPath();
    ctx.arc(0, 0, R2 * width, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, R1 * width, 0, 2 * Math.PI);
    ctx.stroke();

    // 数字
    ctx.fillStyle = this.GRAY_MAIN;
    ctx.font = `600 ${FONT_SIZE * width}px SimHei, STheiti`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('12', 0, -R3 * width);
    ctx.textAlign = 'start';
    ctx.fillText('3', R3 * width, 0);

    ctx.restore();
  }

  // 绘制所有指针
  drawPointer() {
    const { ctx, width, height } = this.Canvas;
    const date = new Date();
    const h = date.getHours() % 12;
    const m = date.getMinutes();
    const s = date.getSeconds();
    const h_deg = ((m / 60 + h) / 12) * 2 * Math.PI;
    const m_deg = ((s / 60 + m) / 60) * 2 * Math.PI;
    const s_deg = (s / 60) * 2 * Math.PI;

    ctx.save();
    ctx.translate(width / 2, height / 2);
    this.shadow(this.SHADOW); // 阴影
    this.pointer(this.POINTER_H, h_deg); // 时针
    this.pointer(this.POINTER_M, m_deg); // 分针
    this.circle(this.CIRCLE_0); // 大圆盘
    this.pointer(this.POINTER_S, s_deg); // 秒针
    this.circle(this.CIRCLE_1); // 小圆盘
    ctx.restore();
  }

  /**
   * 绘制指针
   * @param {Object} P 指针尺寸，颜色
   * @param {Number} deg 指针角度（起点为 12 点钟方向）
   */
  pointer(P, deg) {
    const { ctx, radio, width } = this.Canvas;
    ctx.save();
    ctx.rotate(deg - Math.PI / 2);
    ctx.lineWidth = radio;
    ctx.strokeStyle = P.rgb_b;
    ctx.fillStyle = P.rgb;
    ctx.beginPath();
    ctx.moveTo(-P.l0 * width, -P.r0 * width);
    ctx.lineTo(P.l1 * width, -P.r1 * width);
    ctx.arc(P.l1 * width, 0, P.r1 * width, -0.5 * Math.PI, 0.5 * Math.PI);
    ctx.lineTo(P.l0 * width, P.r0 * width);
    ctx.arc(-P.l0 * width, 0, P.r0 * width, 0.5 * Math.PI, 1.5 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  /**
   * 绘制实心圆
   * @param {Object} C 圆尺寸，颜色
   */
  circle(C) {
    const { ctx, radio, width } = this.Canvas;
    ctx.save();
    ctx.lineWidth = radio;
    ctx.strokeStyle = C.rgb_b;
    ctx.fillStyle = C.rgb;
    ctx.beginPath();
    ctx.arc(0, 0, C.r * width, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  shadow(data) {
    const { ctx } = this.Canvas;
    if (!data) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0)';
    } else {
      ctx.shadowBlur = data.blur;
      ctx.shadowColor = data.color;
      ctx.shadowOffsetX = data.x;
      ctx.shadowOffsetY = data.y;
    }
  }

  refrash() {
    this.drawCircle();
    this.drawPointer();
  }
}
export default Clock;
