/**
 * Smooothy Physics Slider Engine
 * Ultra-smooth 120fps direct touch tracking, flick momentum, and seamless infinite loop wrapping.
 * Zero-boundary locking: finger dragging can never get stuck across slide boundaries.
 */

export interface SmooothyOptions {
  wrapper: HTMLElement;
  container: HTMLElement;
  slides: HTMLElement[];
  realSlideCount?: number;
  initialIndex?: number;
  lerpFactor?: number;
  dragSpeed?: number;
  snap?: boolean;
  infinite?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onIndexChange?: (index: number) => void;
  onProgress?: (progress: number) => void;
}

function getTranslateX(element: HTMLElement): number {
  if (typeof window === 'undefined') return 0;
  const style = window.getComputedStyle(element);
  const matrix = style.transform || (style as any).webkitTransform;
  if (!matrix || matrix === 'none') return 0;
  if (matrix.startsWith('matrix3d(')) {
    const parts = matrix.slice(9, -1).split(',');
    return parseFloat(parts[12]) || 0;
  }
  if (matrix.startsWith('matrix(')) {
    const parts = matrix.slice(7, -1).split(',');
    return parseFloat(parts[4]) || 0;
  }
  return 0;
}

export class Smooothy {
  private wrapper: HTMLElement;
  private container: HTMLElement;
  private slides: HTMLElement[];
  private realSlideCount: number;
  private infinite: boolean;
  private autoPlay: boolean;
  private autoPlayInterval: number;
  private onIndexChange?: (index: number) => void;
  private onProgress?: (progress: number) => void;

  private currentX = 0;
  private isPointerDown = false;
  private isDragging = false;
  private isHorizontalDrag = false;
  private axisDetermined = false;
  private hasMoved = false;

  private startX = 0;
  private startY = 0;
  private lastX = 0;
  private lastTime = 0;
  private velocityX = 0;

  private slideWidth = 0;
  private totalTrackWidth = 0;
  private currentIndex = 0;
  private autoPlayTimer: any = null;
  private transitionTimer: any = null;
  private isDestroyed = false;

  constructor(options: SmooothyOptions) {
    this.wrapper = options.wrapper;
    this.container = options.container;
    this.slides = options.slides;
    this.realSlideCount = options.realSlideCount ?? options.slides.length;
    this.infinite = (options.infinite ?? true) && this.realSlideCount > 1;
    this.autoPlay = options.autoPlay ?? true;
    this.autoPlayInterval = Math.max(options.autoPlayInterval ?? 5000, 2500);
    this.onIndexChange = options.onIndexChange;
    this.onProgress = options.onProgress;

    // Track index: with infinite loop, real slide 0 starts at track index 1 (after the clone of last slide)
    this.currentIndex = options.initialIndex ?? (this.infinite ? 1 : 0);

    this.init();
  }

  private init() {
    this.updateDimensions();
    this.currentX = -this.currentIndex * this.slideWidth;
    this.applyTransform(this.currentX, 0);

    this.bindEvents();
    if (this.autoPlay) {
      this.startAutoPlay();
    }
  }

  public updateDimensions() {
    if (!this.wrapper || this.slides.length === 0) return;
    this.slideWidth = this.wrapper.clientWidth || this.slides[0]?.offsetWidth || window.innerWidth;
    this.totalTrackWidth = this.slideWidth * this.slides.length;
  }

  private applyTransform(x: number, durationMs = 0, easing = 'cubic-bezier(0.22, 1, 0.36, 1)') {
    if (!this.container) return;
    if (durationMs > 0) {
      this.container.style.transition = `transform ${durationMs}ms ${easing}`;
    } else {
      this.container.style.transition = 'none';
    }
    this.container.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;

    if (this.onProgress && this.totalTrackWidth > 0) {
      const progress = Math.max(0, Math.min(1, -x / (this.totalTrackWidth - this.slideWidth || 1)));
      this.onProgress(progress);
    }
  }

  private bindEvents() {
    // Touch Events for 100% native mobile responsiveness
    this.wrapper.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', this.onTouchEnd, { passive: true });

    // Pointer / Mouse events for desktop dragging
    this.wrapper.addEventListener('pointerdown', this.onPointerDown, { passive: true });
    window.addEventListener('pointermove', this.onPointerMove, { passive: false });
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);

    window.addEventListener('resize', this.onResize);
    this.wrapper.addEventListener('mouseenter', this.pauseAutoPlay);
    this.wrapper.addEventListener('mouseleave', this.resumeAutoPlay);
    this.wrapper.addEventListener('click', this.onWrapperClick, true);

    this.container.addEventListener('transitionend', this.onTransitionEnd);
  }

  private unbindEvents() {
    this.wrapper.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('touchcancel', this.onTouchEnd);

    this.wrapper.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);

    window.removeEventListener('resize', this.onResize);
    this.wrapper.removeEventListener('mouseenter', this.pauseAutoPlay);
    this.wrapper.removeEventListener('mouseleave', this.resumeAutoPlay);
    this.wrapper.removeEventListener('click', this.onWrapperClick, true);

    if (this.container) {
      this.container.removeEventListener('transitionend', this.onTransitionEnd);
    }
  }

  private onWrapperClick = (e: MouseEvent) => {
    if (this.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  private handleDragStart(clientX: number, clientY: number) {
    this.pauseAutoPlay();
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }

    // Freeze mid-flight animation at exact pixel position
    const currentComputedX = getTranslateX(this.container);
    if (!isNaN(currentComputedX) && currentComputedX !== 0) {
      this.currentX = currentComputedX;
    }

    // Normalize boundaries BEFORE user starts dragging so we never hit an edge
    if (this.infinite && this.slideWidth > 0) {
      const realWidth = this.realSlideCount * this.slideWidth;
      if (this.currentX <= -(this.realSlideCount + 0.5) * this.slideWidth) {
        this.currentX += realWidth;
      } else if (this.currentX >= -0.5 * this.slideWidth) {
        this.currentX -= realWidth;
      }
    }

    this.applyTransform(this.currentX, 0);

    this.isPointerDown = true;
    this.isDragging = false;
    this.isHorizontalDrag = false;
    this.axisDetermined = false;
    this.hasMoved = false;

    this.startX = clientX;
    this.startY = clientY;
    this.lastX = clientX;
    this.lastTime = performance.now();
    this.velocityX = 0;
  }

  private handleDragMove(clientX: number, clientY: number, originalEvent: Event) {
    if (!this.isPointerDown) return;

    const diffX = clientX - this.startX;
    const diffY = clientY - this.startY;

    // Detect gesture intent (vertical page scroll vs horizontal slider drag)
    if (!this.axisDetermined) {
      if (Math.abs(diffY) > 8 && Math.abs(diffY) > Math.abs(diffX)) {
        // User intends to scroll the page vertically
        this.axisDetermined = true;
        this.isPointerDown = false;
        return;
      }
      if (Math.abs(diffX) > 6 && Math.abs(diffX) >= Math.abs(diffY)) {
        // User intends to swipe the slider horizontally
        this.axisDetermined = true;
        this.isHorizontalDrag = true;
        this.isDragging = true;
        this.wrapper.style.cursor = 'grabbing';
      }
    }

    if (!this.isDragging) return;

    if (originalEvent.cancelable) {
      originalEvent.preventDefault();
    }

    if (Math.abs(diffX) > 6) {
      this.hasMoved = true;
    }

    const deltaX = clientX - this.lastX;
    const now = performance.now();
    const dt = Math.max(now - this.lastTime, 1);
    this.velocityX = deltaX / dt; // pixels per ms
    this.lastX = clientX;
    this.lastTime = now;

    this.currentX += deltaX;

    // ── DYNAMIC CONTINUOUS DRAG WRAPPING (Never hits a wall!) ──
    if (this.infinite && this.slideWidth > 0) {
      const realWidth = this.realSlideCount * this.slideWidth;
      // If dragged past clone of first slide (moving left)
      if (this.currentX < -(this.realSlideCount + 1) * this.slideWidth) {
        this.currentX += realWidth;
        this.startX += realWidth;
      }
      // If dragged past clone of last slide (moving right)
      else if (this.currentX > 0) {
        this.currentX -= realWidth;
        this.startX -= realWidth;
      }
    }

    // Direct 1:1 hardware-accelerated finger tracking
    this.applyTransform(this.currentX, 0);
  }

  private handleDragEnd() {
    if (!this.isPointerDown && !this.isDragging) return;

    const wasDragging = this.isDragging;
    this.isPointerDown = false;
    this.isDragging = false;
    this.isHorizontalDrag = false;
    this.wrapper.style.cursor = '';

    if (!wasDragging) {
      this.resumeAutoPlay();
      return;
    }

    if (this.slideWidth <= 0) {
      this.updateDimensions();
    }

    const W = this.slideWidth || 1;
    const continuousIndex = -this.currentX / W;

    // Determine target slide based on flick velocity or distance
    let targetIndex = Math.round(continuousIndex);

    // Fast flick gesture detection (> 0.25px/ms)
    if (Math.abs(this.velocityX) > 0.25) {
      if (this.velocityX < 0) {
        // Swiped left -> next slide
        targetIndex = Math.ceil(continuousIndex);
        if (targetIndex <= continuousIndex) targetIndex += 1;
      } else {
        // Swiped right -> previous slide
        targetIndex = Math.floor(continuousIndex);
        if (targetIndex >= continuousIndex) targetIndex -= 1;
      }
    }

    // Animate smoothly to the target index
    this.animateToTrackIndex(targetIndex);
  }

  public animateToTrackIndex(trackIndex: number, forcedDuration?: number) {
    if (this.slides.length === 0) return;
    this.updateDimensions();
    const W = this.slideWidth || 1;

    let target = trackIndex;
    if (!this.infinite) {
      target = Math.max(0, Math.min(this.slides.length - 1, trackIndex));
    }

    this.currentIndex = target;
    const targetX = -target * W;
    const distance = Math.abs(targetX - this.currentX);

    // Dynamic duration: snappy yet buttery smooth (between 260ms and 400ms)
    const duration = forcedDuration ?? Math.min(420, Math.max(260, Math.round(distance * 0.75)));

    this.applyTransform(targetX, duration, 'cubic-bezier(0.22, 1, 0.36, 1)');
    this.currentX = targetX;

    // Notify real index to UI
    let realIndex = 0;
    if (this.infinite) {
      if (target <= 0) {
        realIndex = this.realSlideCount - 1;
      } else if (target >= this.realSlideCount + 1) {
        realIndex = 0;
      } else {
        realIndex = target - 1;
      }
    } else {
      realIndex = (target + this.slides.length) % this.slides.length;
    }
    this.onIndexChange?.(realIndex);

    // Fallback timer in case transitionend does not fire
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    this.transitionTimer = setTimeout(() => {
      this.onTransitionEnd();
    }, duration + 30);
  }

  private onTransitionEnd = () => {
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }

    if (!this.infinite || this.realSlideCount <= 1 || this.slideWidth <= 0) {
      this.resumeAutoPlay();
      return;
    }

    const W = this.slideWidth;

    // ── INSTANT SEAMLESS BOUNDARY WRAPPING ──
    // When landed on clone of first slide (index = realSlideCount + 1)
    if (this.currentIndex >= this.realSlideCount + 1) {
      this.currentIndex = 1;
      this.currentX = -1 * W;
      this.applyTransform(this.currentX, 0);
      // Force DOM reflow so subsequent transitions animate properly
      if (this.container) void this.container.offsetHeight;
    }
    // When landed on clone of last slide (index = 0)
    else if (this.currentIndex <= 0) {
      this.currentIndex = this.realSlideCount;
      this.currentX = -this.realSlideCount * W;
      this.applyTransform(this.currentX, 0);
      if (this.container) void this.container.offsetHeight;
    }

    this.resumeAutoPlay();
  };

  // ── Touch Event Handlers ──
  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    this.handleDragStart(touch.clientX, touch.clientY);
  };

  private onTouchMove = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    this.handleDragMove(touch.clientX, touch.clientY, e);
  };

  private onTouchEnd = () => {
    this.handleDragEnd();
  };

  // ── Pointer / Mouse Event Handlers ──
  private onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return; // Handled by native touchstart for maximum fidelity
    if (e.button !== 0) return;
    this.handleDragStart(e.clientX, e.clientY);
  };

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    this.handleDragMove(e.clientX, e.clientY, e);
  };

  private onPointerUp = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    this.handleDragEnd();
  };

  // ── Public Navigation API ──
  public next() {
    if (this.infinite) {
      // If already at clone of first, normalize before advancing
      if (this.currentIndex >= this.realSlideCount + 1) {
        this.currentIndex = 1;
        this.currentX = -1 * this.slideWidth;
        this.applyTransform(this.currentX, 0);
        if (this.container) void this.container.offsetHeight;
      }
      this.animateToTrackIndex(this.currentIndex + 1);
    } else {
      this.goTo((this.currentIndex + 1) % this.slides.length);
    }
  }

  public prev() {
    if (this.infinite) {
      // If already at clone of last, normalize before retreating
      if (this.currentIndex <= 0) {
        this.currentIndex = this.realSlideCount;
        this.currentX = -this.realSlideCount * this.slideWidth;
        this.applyTransform(this.currentX, 0);
        if (this.container) void this.container.offsetHeight;
      }
      this.animateToTrackIndex(this.currentIndex - 1);
    } else {
      this.goTo((this.currentIndex - 1 + this.slides.length) % this.slides.length);
    }
  }

  public goTo(realIndex: number) {
    if (this.infinite) {
      this.animateToTrackIndex(realIndex + 1);
    } else {
      const bounded = (realIndex + this.slides.length) % this.slides.length;
      this.animateToTrackIndex(bounded);
    }
  }

  private onResize = () => {
    this.updateDimensions();
    this.currentX = -this.currentIndex * this.slideWidth;
    this.applyTransform(this.currentX, 0);
  };

  private startAutoPlay() {
    if (!this.autoPlay || this.realSlideCount <= 1 || this.isDestroyed) return;
    this.stopAutoPlay();
    this.autoPlayTimer = setTimeout(() => {
      this.next();
      this.startAutoPlay();
    }, this.autoPlayInterval);
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
    if (this.autoPlay && !this.isPointerDown && !this.isDragging) {
      this.startAutoPlay();
    }
  };

  public destroy() {
    this.isDestroyed = true;
    this.stopAutoPlay();
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }
    this.unbindEvents();
  }
}
