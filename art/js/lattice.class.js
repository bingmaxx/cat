// 点阵数据
export const latticeDataList = [
  [
    0, 0, 0,
    0, 0, 0,
    0, 0, 0,
  ], // 0
  [
    0, 0, 0,
    0, 1, 0,
    0, 0, 0,
  ], // 1
  [
    1, 0, 0,
    0, 0, 0,
    0, 0, 1,
  ], // 2
  [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
  ], // 3
  [
    0, 0, 0,
    0, 1, 1,
    0, 1, 1,
  ], // 4
  [
    1, 0, 0,
    0, 1, 1,
    0, 1, 1,
  ], // 5
  [
    1, 1, 0,
    1, 0, 1,
    0, 1, 1,
  ], // 6
  [
    1, 1, 0,
    1, 1, 1,
    0, 1, 1,
  ], // 7
  [
    1, 1, 1,
    1, 0, 1,
    1, 1, 1,
  ], // 8
  [
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
  ], // 9
];

const DATA = 0;
const X = 0;
const Y = 0;
const N = 3;
const SIZE = 8;
const SPACE = 1;
const COLOR_0 = '#DCDFE6';
const COLOR_1 = '#00ffff';
const TYPE = 'square';

/**
 * 渲染器
 */
class Render {
  constructor(options) {
    this.objects = []; // 对象列表

    const { Canvas } = options || {};
    this.Canvas = Canvas;
  }

  /**
   * 添加对象并绘制
   * @param {Object} 图层对象
   */
  add(obj) {
    this.objects.push(obj);
    obj.draw();
  }

  /**
   * 重新渲染画布
   */
  render(style) {
    this.Canvas.clear(style);
    this.objects.forEach(obj => (obj.draw()));
  }

  /**
   * 绘制一串竖排的数字
   * TO DO: 做一个像素点从起始位置滑入显示位置的动画
   */
  drawNums(options) {
    this.Canvas.clear('white');

    const {
      ctx, width, height, radio,
    } = this.Canvas;
    const {
      style,  // 点阵样式
    } = options;
    let {
      right,  // 右边距
      bottom, // 下边距
      space,  // 间隔
      list,
    } = options;
    right *= radio;
    bottom *= radio;
    space *= radio;

    list = typeof list === 'string' ? list.split('').map(str => (Number(str) || 0)) : list;
    const len = list.length;
    list.forEach((item, i) => {
      const lattice = new Lattice({
        ...style, ctx, radio, data: item,
      });
      const { w, h } = lattice;
      const x = width - right - w;
      const y = height - bottom - (len - i) * h - (len - i - 1) * space;
      lattice.set({ x, y });
      this.add(lattice);
    });
  }

  /**
   * 按照分类绘制所有可能的点阵
   */
  drawAllByType(options) {
    const { ctx, radio } = this.Canvas;
    const { style } = options;
    let {
      padding, space,
    } = options;
    padding *= radio;
    space *= radio;

    const nn = N * N;                  // n * n 点阵的点数
    const latticeNums = 2 ** nn;       // 点阵所有可能性
    const colNums = 16;                // 一列显示点阵个数

    const latticeListByType = [];      // 分类存储点阵数组（二维数组）
    for (let i = 0; i <= nn; i++) {
      latticeListByType.push([]);
    }
    const typeNums = nn + 1;           // 分类数目（0-9）

    // 遍历点阵的所有可能性
    for (let i = 0; i < latticeNums; i++) {
      const list = [];
      let type = 0;
      // 构造当前点阵数据 list
      for (let j = nn - 1; j >= 0; j--) {
        const bit = (i >> j) & 0x01;
        type += bit;
        list.push(bit);
      }
      latticeListByType[type].push(list);
    }

    const rowNumsByType = latticeListByType.map(item => (Math.trunc(item.length / colNums) + 1)); // 当前类型点阵的行数
    const rowSumsByType = Array(typeNums).fill(0);                                                // 当前点阵前所有点阵的行数
    for (let i = 1; i < typeNums; i++) {
      rowSumsByType[i] = rowSumsByType[i - 1] + rowNumsByType[i - 1];
    }

    let w = 0;
    let h = 0;
    latticeListByType.forEach((list, type) => {
      list.forEach((item, i) => {
        const row = Math.trunc(i / colNums);
        const col = i % colNums;
        const lattice = new Lattice({
          ...style, ctx, radio, data: item,
        });
        // const { w, h } = lattice;
        w = lattice.w;
        h = lattice.h;
        const x = padding + col * (w + space);
        const row_all = row + rowSumsByType[type];
        const y = padding * (type + 1) + row_all * h + (row_all - type) * space;
        lattice.set({ x, y });
        this.objects.push(lattice);
      });
    });
    const width = 2 * padding + colNums * w + (colNums - 1) * space;
    const rowAll = rowSumsByType[typeNums - 1] + rowNumsByType[typeNums - 1];
    const height = (typeNums + 1) * padding + rowAll * h + (rowAll - typeNums) * space;
    this.Canvas.setSize({ width, height });
    this.render('white');
  }
}

/**
 * 单个点阵
 */
class Lattice {
  constructor(options) {
    const { ctx } = options;
    this.ctx = ctx;
    this.set(options);
  }

  set(options) {
    const {
      data,
      x,
      y,
      n,
      size,
      space,
      color_0,
      color_1,
      type,
      radio,
    } = options;

    // TO FIX 默认值如果不为0, 则无法设置为 0.
    this.data = data || this.data || DATA;                    // 点阵一维数组 or 数字 0 - 9
    this.x = x || this.x || X;                                // 左上角 x 坐标
    this.y = y || this.y || Y;                                // 左上角 y 坐标
    this.n = n || this.n || N;                                // n * n 点阵
    this.size = size * radio || this.size || SIZE * radio;    // 点尺寸
    this.space = space * radio || this.space || SPACE * radio;// 点间距
    this.color_0 = color_0 || this.color_0 || COLOR_0;        // 空白色
    this.color_1 = color_1 || this.color_1 || COLOR_1;        // 填充色
    this.type = type || this.type || TYPE;                    // 点样式
    this.w = this.size * this.n + this.space * (this.n - 1);  // 计算得
    this.h = this.w;                                          // 计算得
  }

  /**
   * 绘制点阵
   */
  draw() {
    const {
      ctx,
      data,
      x,
      y,
      n,
      size,
      space,
      color_0,
      color_1,
      type,
    } = this;
    const list = Array.isArray(data) ? data : latticeDataList[data] || [];
    // console.log('Lattice data: ', data, list);
    ctx.save();
    // 遍历点阵中的每一个点
    list.forEach((bit, i) => {
      const row = Math.trunc(i / n);
      const col = i % n;
      ctx.fillStyle = bit ? color_1 : color_0;
      const param = {
        x: x + row * (size + space),
        y: y + col * (size + space),
        size,
        type,
      };
      this.dotPaint(param);
    });
    ctx.restore();
  }

  /**
   * 画点
   * @param {Number} x x 坐标 (左上角)
   * @param {Number} y y 坐标
   * @param {Number} size 点的尺寸
   * @param {String} type 'square' 方块, 'circle' 圆点
   */
  dotPaint(options) {
    const {
      x,
      y,
      size,
      type,
    } = options;
    const { ctx } = this;

    ctx.beginPath();
    const func = {
      square: () => {
        ctx.fillRect(x, y, size, size);
      },
      circle: () => {
        const r = size / 2;
        ctx.arc(x + r, y + r, r, 0, Math.PI * 2, true);
        ctx.fill();
      },
    };

    func[type || TYPE]();
  }
}

export default Render;
