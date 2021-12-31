class Animation {
  constructor(options) {
    this.params = {
      RADIUS: 150,                // 整体大球的坐标
      LAYER_BALL_NUM: 24,         // 球的个数 24
      LAYER_INTERVAL_UP: 24,      // layer 层数
    };
    this.center = [];             // canvas 中点坐标

    this.balls = [];              // 球体上所有的点
    this.loop = null;
    this.isrunning = false;
    this.angleX = Math.PI / 120;
    this.angleY = Math.PI / 120;

    const { canvas } = options || {};
    this.canvasInit(canvas);
    this.init();
    this.start();
    this.bindEvent();
  }

  canvasInit(canvas) {
    if (!canvas) return;
    this.canvas = canvas;
    if (typeof canvas === 'string') this.canvas = document.getElementById(canvas);
    if (!this.canvas.getContext) return;

    this.ctx = this.canvas.getContext('2d');
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.canvas.width = width;
    this.canvas.height = height;
    this.center = [width / 2, height / 2];
  }

  init() {
    // 假定每一层 间隔30  画上半球
    const { LAYER_INTERVAL_UP } = this.params;
    for (let i = 0; i <= LAYER_INTERVAL_UP; i++) {
      const layer = new Layer({
        ctx: this.ctx,
        center: this.center,
        i,
        params: this.params,
      });
      layer.setLayer();
      const balls = layer.setBalls();
      this.balls = [...this.balls, ...balls];
    }
  }

  bindEvent() {
    window.addEventListener('mousemove', this.move);
  }

  /**
   * 修改绕坐标轴旋转的角度
   * @param {Object} event mousemove 参数
   */
  move = event => {
    if (!this.canvas) return;
    const { offsetLeft, offsetTop } = this.canvas;
    const { clientX, clientY } = event;
    const [x0, y0] = this.center;
    const x = clientX - offsetLeft - x0;
    const y = clientY - offsetTop - y0;

    this.angleY = -x * 0.0001;
    this.angleX = -y * 0.0001;
  }

  start() {
    this.isrunning = true;
    this.animate();
  }

  stop() {
    this.isrunning = false;
  }

  cancel() {
    cancelAnimationFrame(this.loop);
  }

  animate = () => {
    const { canvas, ctx } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.rotateX();
    this.rotateY();
    this.rotateZ();

    for (let i = 0; i < this.balls.length; i++) {
      this.balls[i].paint();
    }
    if (this.isrunning) {
      this.loop = requestAnimationFrame(this.animate);
    }
  }

  // 绕 X 轴旋转
  rotateX() {
    const cos = Math.cos(this.angleX);
    const sin = Math.sin(this.angleX);
    for (let i = 0; i < this.balls.length; i++) {
      const y1 = this.balls[i].y * cos - this.balls[i].z * sin;
      const z1 = this.balls[i].z * cos + this.balls[i].y * sin;
      this.balls[i].y = y1;
      this.balls[i].z = z1;
    }
  }

  rotateY() {
    const cos = Math.cos(this.angleY);
    const sin = Math.sin(this.angleY);
    for (let i = 0; i < this.balls.length; i++) {
      const x1 = this.balls[i].x * cos - this.balls[i].z * sin;
      const z1 = this.balls[i].z * cos + this.balls[i].x * sin;
      this.balls[i].x = x1;
      this.balls[i].z = z1;
    }
  }

  rotateZ() {
    const cos = Math.cos(this.angleY);
    const sin = Math.sin(this.angleY);
    for (let i = 0; i < this.balls.length; i++) {
      const x1 = this.balls[i].x * cos - this.balls[i].y * sin;
      const y1 = this.balls[i].y * cos + this.balls[i].x * sin;
      this.balls[i].x = x1;
      this.balls[i].y = y1;
    }
  }
}

/**
 * 画俯视图的圆 & 圆上分布的球
 */
class Layer {
  constructor(options) {
    const {
      ctx,
      center,
      i,
      params,
    } = options;
    this.ctx = ctx;
    this.center = center;
    this.params = params;
    const { RADIUS, LAYER_INTERVAL_UP } = params;
    this.radius = RADIUS * Math.abs(Math.cos((i * Math.PI * 2) / LAYER_INTERVAL_UP)); // 俯视图圆的半径(绝对值)
    this.height = RADIUS * Math.sin((i * Math.PI * 2) / LAYER_INTERVAL_UP);           // 同层中, 球的高度(有正有负)
  }

  /**
  * 画纬度线
  */
  setLayer() {
    const { ctx } = this;
    ctx.beginPath();
    const [x, y] = this.center;
    ctx.arc(x, y, this.radius, 0, 2 * Math.PI, true);
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
  }

  /**
  * 画纬度线上所有的点
  */
  setBalls() {
    const balls = [];
    const { LAYER_BALL_NUM } = this.params;
    for (let i = 0; i < LAYER_BALL_NUM; i++) {
      const angle = (2 * Math.PI * i) / LAYER_BALL_NUM;
      const x = this.radius * Math.cos(angle);
      const y = this.radius * Math.sin(angle);
      const b = new Ball({
        x,
        y,
        z: this.height,
        r: 1.5,
        ctx: this.ctx,
        center: this.center,
        params: this.params,
      });
      b.paint();
      balls.push(b);
    }
    return balls;
  }
}

/**
 * 画点的类
 */
class Ball {
  constructor(options) {
    const {
      x,
      y,
      z,
      r,
      ctx,
      center,
      params,
    } = options;
    this.x = x;
    this.y = y;
    this.z = z;
    this.r = r;
    this.ctx = ctx;
    this.center = center;
    this.params = params;
  }

  paint() {
    const { ctx, params } = this;
    const fl = 450; // 焦距
    ctx.save();
    ctx.beginPath();
    const scale = fl / (fl - this.z);
    const alpha = (this.z + params.RADIUS) / (2 * params.RADIUS);
    const [x, y] = this.center;
    ctx.arc(x + this.x, y + this.y, this.r * scale, 0, 2 * Math.PI, true);
    ctx.fillStyle = `rgba(255,255,255,${alpha + 0.5})`;
    ctx.fill();
    ctx.restore();
  }
}

export default Animation;
