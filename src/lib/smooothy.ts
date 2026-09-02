/**
 * Smooothy Physics Slider Engine
 * Inspired by github.com/vallafederico/smooothy
 * Ultra-smooth, 60fps momentum drag, physics lerp interpolation, and touch gestures.
 */

export interface SmooothyOptions {
  wrapper: HTMLElement;
  container: HTMLElement;
  slides: HTMLElement[];
  lerpFactor?: number; // 0.05 to 0.2 (lower = smoother inertia, higher = snappier)
  dragSpeed?: number;
  snap?: boolean;
  infinite?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onIndexChange?: (index: number) => void;
  onProgress?: (progress: number) => void;
}

export class Smooothy {
  private wrapper: HTMLElement;
  private container: HTMLElement;
  private slides: HTMLElement[];
  private lerpFactor: number;
  private dragSpeed: number;
  private snap: boolean;
  private infinite: boolean;
  private autoPlay: boolean;
  private autoPlayInterval: number;
  private onIndexChange?: (index: number) => void;
  private onProgress?: (progress: number) => void;

  private currentX = 0;
  private targetX = 0;
  private isDragging = false;
  private startX = 0;
  private prevDragX = 0;
  private velocity = 0;
  private rafId: number | null = null;
  private autoPlayTimer: any = null;
  private slideWidth = 0;
  private totalWidth = 0;
  private currentIndex = 0;
  private isDestroyed = false;

  constructor(options: SmooothyOptions) {
    this.wrapper = options.wrapper;
    this.container = options.container;
    this.slides = options.slides;
    this.lerpFactor = options.lerpFactor ?? 0.1;
    this.dragSpeed = options.dragSpeed ?? 1.15;
    this.snap = options.snap ?? true;
    this.infinite = options.infinite ?? false;
    this.autoPlay = options.autoPlay ?? false;
    this.autoPlayInterval = options.autoPlayInterval ?? 5000;
    this.onIndexChange = options.onIndexChange;
    this.onProgress = options.onProgress;

    this.init();
  }

  private init() {
    this.updateDimensions();
    this.bindEvents();
    this.startRenderLoop();
    if (this.autoPlay) {
      this.startAutoPlay();
    }
  }

  public updateDimensions() {
    if (!this.wrapper || this.slides.length === 0) return;
    this.slideWidth = this.wrapper.clientWidth || this.slides[0]?.offsetWidth || window.innerWidth;
    this.totalWidth = this.slideWidth * this.slides.length;
  }

  private bindEvents() {
    // Pointer / Touch Events on Wrapper
    this.wrapper.addEventListener('pointerdown', this.onPointerDown, { passive: false });
    window.addEventListener('pointermove', this.onPointerMove, { passive: false });
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    window.addEventListener('resize', this.onResize);

    this.wrapper.addEventListener('mouseenter', this.pauseAutoPlay);
    this.wrapper.addEventListener('mouseleave', this.resumeAutoPlay);
  }

  private unbindEvents() {
    this.wrapper.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    window.removeEventListener('resize', this.onResize);

    this.wrapper.removeEventListener('mouseenter', this.pauseAutoPlay);
    this.wrapper.removeEventListener('mouseleave', this.resumeAutoPlay);
  }

  private startRenderLoop() {
    if (this.isDestroyed || this.rafId !== null) return;
    this.rafId = requestAnimationFrame(this.render);
  }

  private onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    this.isDragging = true;
    this.startX = e.clientX;
    this.prevDragX = e.clientX;
    this.velocity = 0;
    this.pauseAutoPlay();
    this.startRenderLoop();
    this.wrapper.style.cursor = 'grabbing';
    try {
      this.wrapper.setPointerCapture?.(e.pointerId);
    } catch { }
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isDragging) return;
    const delta = (e.clientX - this.prevDragX) * this.dragSpeed;
    this.prevDragX = e.clientX;
    this.velocity = delta;

    this.targetX += delta;

    // Apply elastic bounds resistance if not infinite
    if (!this.infinite) {
      const minX = -(this.totalWidth - this.slideWidth);
      const maxX = 0;
      if (this.targetX > maxX) {
        this.targetX = maxX + (this.targetX - maxX) * 0.35;
      } else if (this.targetX < minX) {
        this.targetX = minX + (this.targetX - minX) * 0.35;
      }
    }
    this.startRenderLoop();
  };

  private onPointerUp = (e: PointerEvent) => {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.wrapper.style.cursor = '';
    try {
      this.wrapper.releasePointerCapture?.(e.pointerId);
    } catch { }

    // Add inertia momentum from drag release velocity
    this.targetX += this.velocity * 6;

    if (this.snap) {
      this.snapToClosest();
    }
    this.startRenderLoop();
    this.resumeAutoPlay();
  };

  private snapToClosest() {
    const minX = -(this.totalWidth - this.slideWidth);
    const clampedTarget = Math.max(minX, Math.min(0, this.targetX));
    const closestIndex = Math.round(-clampedTarget / this.slideWidth);
    const validIndex = Math.max(0, Math.min(this.slides.length - 1, closestIndex));
    this.goTo(validIndex);
  }

  public goTo(index: number) {
    if (this.slides.length === 0) return;
    const boundedIndex = (index + this.slides.length) % this.slides.length;
    this.currentIndex = boundedIndex;
    this.targetX = -boundedIndex * this.slideWidth;
    this.onIndexChange?.(boundedIndex);
    this.startRenderLoop();
  }

  public next() {
    this.goTo((this.currentIndex + 1) % this.slides.length);
  }

  public prev() {
    this.goTo((this.currentIndex - 1 + this.slides.length) % this.slides.length);
  }

  private render = () => {
    if (this.isDestroyed) return;

    const diff = this.targetX - this.currentX;

    // If resting and not dragging, snap exactly and pause the render loop (0% idle CPU)
    if (!this.isDragging && Math.abs(diff) < 0.05) {
      this.currentX = this.targetX;
      if (this.container) {
        this.container.style.transform = `translate3d(${this.currentX.toFixed(2)}px, 0, 0)`;
      }
      if (this.onProgress && this.totalWidth > 0) {
        const progress = Math.max(0, Math.min(1, -this.currentX / (this.totalWidth - this.slideWidth || 1)));
        this.onProgress(progress);
      }
      this.rafId = null;
      return;
    }

    // Linear Interpolation (Physics Lerp)
    this.currentX += diff * this.lerpFactor;

    // Direct hardware-accelerated transform (translate3d)
    if (this.container) {
      this.container.style.transform = `translate3d(${this.currentX.toFixed(2)}px, 0, 0)`;
    }

    if (this.onProgress && this.totalWidth > 0) {
      const progress = Math.max(0, Math.min(1, -this.currentX / (this.totalWidth - this.slideWidth || 1)));
      this.onProgress(progress);
    }

    this.rafId = requestAnimationFrame(this.render);
  };

  private onResize = () => {
    this.updateDimensions();
    this.goTo(this.currentIndex);
  };

  private startAutoPlay() {
    if (!this.autoPlay || this.slides.length <= 1) return;
    this.stopAutoPlay();
    this.autoPlayTimer = setTimeout(() => {
      this.next();
      this.startAutoPlay();
    }, Math.max(this.autoPlayInterval, 2000));
  }

  private stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearTimeout(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  private pauseAutoPlay = () => {
    this.stopAutoPlay();
  };

  private resumeAutoPlay = () => {
    if (this.autoPlay) {
      this.startAutoPlay();
    }
  };

  public destroy() {
    this.isDestroyed = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.stopAutoPlay();
    this.unbindEvents();
  }
}
