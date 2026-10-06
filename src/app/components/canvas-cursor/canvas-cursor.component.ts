import {
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  Input
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

export interface CanvasCursorConfig {
  friction: number;
  trails: number;
  size: number;
  dampening: number;
  tension: number;
  opacity: number;
  colorMode: 'rainbow' | 'cyan' | 'purple' | 'gold';
}

class Oscillator {
  phase: number;
  offset: number;
  frequency: number;
  amplitude: number;
  value: number = 0;

  constructor(options: { phase?: number; offset?: number; frequency?: number; amplitude?: number } = {}) {
    this.phase = options.phase || 0;
    this.offset = options.offset || 0;
    this.frequency = options.frequency || 0.001;
    this.amplitude = options.amplitude || 1;
  }

  update(): number {
    this.phase += this.frequency;
    this.value = this.offset + Math.sin(this.phase) * this.amplitude;
    return this.value;
  }
}

class CursorNode {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
}

class TrailLine {
  spring: number;
  friction: number;
  nodes: CursorNode[] = [];

  constructor(
    springBase: number,
    frictionBase: number,
    size: number,
    pos: { x: number; y: number }
  ) {
    this.spring = springBase + 0.1 * Math.random() - 0.02;
    this.friction = frictionBase + 0.01 * Math.random() - 0.002;
    for (let i = 0; i < size; i++) {
      const node = new CursorNode();
      node.x = pos.x;
      node.y = pos.y;
      this.nodes.push(node);
    }
  }

  update(pos: { x: number; y: number }, dampening: number, tension: number) {
    let springFactor = this.spring;
    const first = this.nodes[0];
    first.vx += (pos.x - first.x) * springFactor;
    first.vy += (pos.y - first.y) * springFactor;

    for (let i = 0; i < this.nodes.length; i++) {
      const curr = this.nodes[i];
      if (i > 0) {
        const prev = this.nodes[i - 1];
        curr.vx += (prev.x - curr.x) * springFactor;
        curr.vy += (prev.y - curr.y) * springFactor;
        curr.vx += prev.vx * dampening;
        curr.vy += prev.vy * dampening;
      }
      curr.vx *= this.friction;
      curr.vy *= this.friction;
      curr.x += curr.vx;
      curr.y += curr.vy;
      springFactor *= tension;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.nodes.length < 2) return;
    let n = this.nodes[0].x;
    let i = this.nodes[0].y;
    ctx.beginPath();
    ctx.moveTo(n, i);

    let a = 1;
    const o = this.nodes.length - 2;
    for (; a < o; a++) {
      const e = this.nodes[a];
      const t = this.nodes[a + 1];
      n = 0.5 * (e.x + t.x);
      i = 0.5 * (e.y + t.y);
      ctx.quadraticCurveTo(e.x, e.y, n, i);
    }
    const e = this.nodes[a];
    const t = this.nodes[a + 1];
    ctx.quadraticCurveTo(e.x, e.y, t.x, t.y);
    ctx.stroke();
    ctx.closePath();
  }
}

@Component({
  selector: 'app-canvas-cursor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <canvas
      #cursorCanvas
      id="cursorCanvas"
      class="canvas-cursor-bg"
    ></canvas>
  `,
  styles: [`
    :host {
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 10;
      overflow: hidden;
    }
    .canvas-cursor-bg {
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
  `]
})
export class CanvasCursorComponent implements OnInit, OnDestroy {
  @ViewChild('cursorCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() config: CanvasCursorConfig = {
    friction: 0.58,
    trails: 18,
    size: 26, // Reduced node size so tail disappears ~0.25s faster
    dampening: 0.35,
    tension: 0.98,
    opacity: 0.22,
    colorMode: 'rainbow'
  };

  private ctx: CanvasRenderingContext2D | null = null;
  private oscillator!: Oscillator;
  private lines: TrailLine[] = [];
  private pos = { x: 0, y: 0 };
  private isRunning = false;
  private animationFrameId: number | null = null;
  private hasInteracted = false;
  private idleTime = 0;

  // Bound event listeners for clean unsubscription
  private boundMoveHandler!: (e: MouseEvent | TouchEvent) => void;
  private boundResizeHandler!: () => void;
  private boundFocusHandler!: () => void;
  private boundBlurHandler!: () => void;

  constructor(
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.pos = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };

    // Run outside Angular Zone to ensure 60-120fps performance without triggering change detection
    this.ngZone.runOutsideAngular(() => {
      this.initCanvas();
    });
  }

  ngOnDestroy(): void {
    this.stopAnimation();
    this.removeEventListeners();
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    this.resizeCanvas();

    this.oscillator = new Oscillator({
      phase: Math.random() * 2 * Math.PI,
      amplitude: 85,
      frequency: 0.0015,
      offset: 285,
    });

    this.initLines();

    this.boundMoveHandler = (e: MouseEvent | TouchEvent) => this.handlePointerMove(e);
    this.boundResizeHandler = () => this.resizeCanvas();
    this.boundFocusHandler = () => {
      if (!this.isRunning) {
        this.isRunning = true;
        this.render();
      }
    };
    this.boundBlurHandler = () => {
      // Keep running or pause
    };

    // Listen on window and document so movements anywhere on screen trigger the effect
    window.addEventListener('mousemove', this.boundMoveHandler, { passive: true });
    window.addEventListener('touchmove', this.boundMoveHandler, { passive: true });
    window.addEventListener('touchstart', this.boundMoveHandler, { passive: true });
    window.addEventListener('resize', this.boundResizeHandler, { passive: true });
    window.addEventListener('orientationchange', this.boundResizeHandler, { passive: true });
    window.addEventListener('focus', this.boundFocusHandler);
    window.addEventListener('blur', this.boundBlurHandler);

    this.isRunning = true;
    this.render();
  }

  private initLines(): void {
    this.lines = [];
    for (let i = 0; i < this.config.trails; i++) {
      const spring = 0.4 + (i / this.config.trails) * 0.025;
      this.lines.push(
        new TrailLine(spring, this.config.friction, this.config.size, this.pos)
      );
    }
  }

  public setConfig(newConfig: Partial<CanvasCursorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initLines();
  }

  private handlePointerMove(e: MouseEvent | TouchEvent): void {
    this.hasInteracted = true;
    this.idleTime = 0;

    if ('touches' in e && e.touches.length > 0) {
      this.pos.x = e.touches[0].clientX;
      this.pos.y = e.touches[0].clientY;
    } else if ('clientX' in e) {
      this.pos.x = e.clientX;
      this.pos.y = e.clientY;
    }

    if (!this.lines.length) {
      this.initLines();
    }
  }

  private resizeCanvas(): void {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    // Handle High-DPI / Retina displays for crystal crisp lines
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    if (this.ctx) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset scale
      this.ctx.scale(dpr, dpr);
    }
  }

  private getStrokeColor(): string {
    const hueVal = Math.round(this.oscillator.update());
    const alpha = this.config.opacity ?? 0.22;
    switch (this.config.colorMode) {
      case 'cyan':
        return `hsla(${180 + Math.sin(this.oscillator.phase) * 30}, 90%, 60%, ${alpha})`;
      case 'purple':
        return `hsla(${275 + Math.sin(this.oscillator.phase) * 35}, 85%, 65%, ${alpha})`;
      case 'gold':
        return `hsla(${40 + Math.sin(this.oscillator.phase) * 20}, 95%, 60%, ${alpha})`;
      case 'rainbow':
      default:
        return `hsla(${hueVal % 360}, 65%, 60%, ${alpha})`;
    }
  }

  private render = (): void => {
    if (!this.isRunning || !this.ctx) return;

    const ctx = this.ctx;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Subtle autonomous orbit when user hasn't touched the screen on mobile
    if (!this.hasInteracted || this.idleTime > 120) {
      const time = Date.now() * 0.0015;
      this.pos.x = width / 2 + Math.cos(time) * (width * 0.25);
      this.pos.y = height / 2 + Math.sin(time * 1.3) * (height * 0.18);
    } else {
      this.idleTime++;
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = this.getStrokeColor();
    ctx.lineWidth = 1.2;

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      line.update(this.pos, this.config.dampening, this.config.tension);
      line.draw(ctx);
    }

    this.animationFrameId = requestAnimationFrame(this.render);
  };

  private stopAnimation(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private removeEventListeners(): void {
    window.removeEventListener('mousemove', this.boundMoveHandler);
    window.removeEventListener('touchmove', this.boundMoveHandler);
    window.removeEventListener('touchstart', this.boundMoveHandler);
    window.removeEventListener('resize', this.boundResizeHandler);
    window.removeEventListener('orientationchange', this.boundResizeHandler);
    window.removeEventListener('focus', this.boundFocusHandler);
    window.removeEventListener('blur', this.boundBlurHandler);
  }
}
