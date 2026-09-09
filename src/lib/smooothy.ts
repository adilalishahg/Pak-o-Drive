/**
 * Smooothy Physics Slider Engine
 * Inspired by github.com/vallafederico/smooothy
 * Ultra-smooth, 60fps momentum drag, physics lerp interpolation, and touch gestures.
 */

export interface SmooothyOptions {
  wrapper: HTMLElement;
  container: HTMLElement;
  slides: HTMLElement[];
  realSlideCount?: number;
  initialIndex?: number;
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
  private realSlideCount: number;
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
  private isPointerDown = false;
  private isHorizontalDrag = false;
  private hasMoved = false;
  private startX = 0;
  private startY = 0;
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
    this.realSlideCount = options.realSlideCount ?? options.slides.length;
    this.lerpFactor = options.lerpFactor ?? 0.12;
    this.dragSpeed = options.dragSpeed ?? 1.15;
    this.snap = options.snap ?? true;
    this.infinite = options.infinite ?? false;
    this.autoPlay = options.autoPlay ?? false;
    this.autoPlayInterval = options.autoPlayInterval ?? 5000;
    this.onIndexChange = options.onIndexChange;
    this.onProgress = options.onProgress;

    this.currentIndex = options.initialIndex ?? (this.infinite && this.realSlideCount > 1 ? 1 : 0);

    this.init();
  }

  private init() {
    this.updateDimensions();
    this.targetX = -this.currentIndex * this.slideWidth;
    this.currentX = this.targetX;
    if (this.container) {
      this.container.style.transform = `translate3d(${this.currentX.toFixed(2)}px, 0, 0)`;
    }
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
    this.wrapper.addEventListener('pointerdown', this.onPointerDown, { passive: true });
    window.addEventListener('pointermove', this.onPointerMove, { passive: false });
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    window.addEventListener('resize', this.onResize);

    this.wrapper.addEventListener('mouseenter', this.pauseAutoPlay);
    this.wrapper.addEventListener('mouseleave', this.resumeAutoPlay);
    this.wrapper.addEventListener('click', this.onWrapperClick, true);
  }

  private unbindEvents() {
    this.wrapper.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    window.removeEventListener('resize', this.onResize);

    this.wrapper.removeEventListener('mouseenter', this.pauseAutoPlay);
    this.wrapper.removeEventListener('mouseleave', this.resumeAutoPlay);
    this.wrapper.removeEventListener('click', this.onWrapperClick, true);
  }

  private onWrapperClick = (e: MouseEvent) => {
    if (this.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  private startRenderLoop() {
    if (this.isDestroyed || this.rafId !== null) return;
    this.rafId = requestAnimationFrame(this.render);
  }

  private onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    this.isPointerDown = true;
    this.isHorizontalDrag = false;
    this.hasMoved = false;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.prevDragX = e.clientX;
    this.velocity = 0;
    this.pauseAutoPlay();
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown) return;

    const diffX = e.clientX - this.startX;
    const diffY = e.clientY - this.startY;

    if (!this.isHorizontalDrag) {
      if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 8) {
        this.isPointerDown = false;
        return;
      }
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
        this.isHorizontalDrag = true;
        this.isDragging = true;
        this.wrapper.style.cursor = 'grabbing';
        this.startRenderLoop();
        try {
          this.wrapper.setPointerCapture?.(e.pointerId);
        } catch { }
      }
    }

    if (this.isDragging) {
      if (e.cancelable) {
        e.preventDefault();
      }
      if (Math.abs(diffX) > 8) {
        this.hasMoved = true;
      }
      const delta = (e.clientX - this.prevDragX) * this.dragSpeed;
      this.prevDragX = e.clientX;
      this.velocity = delta;
      this.targetX += delta;

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
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    if (!this.isPointerDown && !this.isDragging) return;
    const wasDragging = this.isDragging;
    this.isPointerDown = false;
    this.isDragging = false;
    this.isHorizontalDrag = false;
    this.wrapper.style.cursor = '';
    try {
      this.wrapper.releasePointerCapture?.(e.pointerId);
    } catch { }

    if (wasDragging && this.snap) {
      const projectedX = this.targetX + this.velocity * 4;
      let targetTrackIndex = Math.round(-projectedX / (this.slideWidth || 1));
      targetTrackIndex = Math.max(0, Math.min(this.slides.length - 1, targetTrackIndex));
      this.goToTrackIndex(targetTrackIndex);
    } else if (wasDragging) {
      this.startRenderLoop();
    }

    this.resumeAutoPlay();
  };

  public goToTrackIndex(trackIndex: number) {
    if (this.slides.length === 0) return;
    const clampedIndex = Math.max(0, Math.min(this.slides.length - 1, trackIndex));
    this.currentIndex = clampedIndex;
    this.targetX = -clampedIndex * this.slideWidth;

    let realIndex = 0;
    if (this.infinite && this.realSlideCount > 1) {
      if (clampedIndex === 0) {
        realIndex = this.realSlideCount - 1;
      } else if (clampedIndex >= this.realSlideCount + 1) {
        realIndex = 0;
      } else {
        realIndex = clampedIndex - 1;
      }
    } else {
      realIndex = (clampedIndex + this.slides.length) % this.slides.length;
    }

    this.onIndexChange?.(realIndex);
    this.startRenderLoop();
  }

  public goTo(realIndex: number) {
    if (this.infinite && this.realSlideCount > 1) {
      this.goToTrackIndex(realIndex + 1);
    } else {
      const bounded = (realIndex + this.slides.length) % this.slides.length;
      this.currentIndex = bounded;
      this.targetX = -bounded * this.slideWidth;
      this.onIndexChange?.(bounded);
      this.startRenderLoop();
    }
  }

  public next() {
    if (this.infinite && this.realSlideCount > 1) {
      this.goToTrackIndex(this.currentIndex + 1);
    } else {
      this.goTo((this.currentIndex + 1) % this.slides.length);
    }
  }

  public prev() {
    if (this.infinite && this.realSlideCount > 1) {
      this.goToTrackIndex(this.currentIndex - 1);
    } else {
      this.goTo((this.currentIndex - 1 + this.slides.length) % this.slides.length);
    }
  }

  private render = () => {
    if (this.isDestroyed) return;

    const diff = this.targetX - this.currentX;

    // If resting and not dragging, snap exactly and check infinite loop wrap
    if (!this.isDragging && Math.abs(diff) < 0.15) {
      this.currentX = this.targetX;

      // Seamless Infinite Loop Wrapping
      if (this.infinite && this.realSlideCount > 1) {
        if (this.currentIndex >= this.realSlideCount + 1) {
          this.currentIndex = 1;
          this.targetX = -1 * this.slideWidth;
          this.currentX = this.targetX;
        } else if (this.currentIndex <= 0) {
          this.currentIndex = this.realSlideCount;
          this.targetX = -this.realSlideCount * this.slideWidth;
          this.currentX = this.targetX;
        }
      }

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
    this.targetX = -this.currentIndex * this.slideWidth;
    this.currentX = this.targetX;
    if (this.container) {
      this.container.style.transform = `translate3d(${this.currentX.toFixed(2)}px, 0, 0)`;
    }
  };

  private startAutoPlay() {
    if (!this.autoPlay || this.realSlideCount <= 1) return;
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
