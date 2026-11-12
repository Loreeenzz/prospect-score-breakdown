/* ==========================================================================
   Interactive Slide Deck Engine
   ========================================================================== */

class Deck {
  constructor() {
    this.slides = Array.from(document.querySelectorAll('.slide'));
    this.currentIndex = 0;
    this.counterEl = document.querySelector('.slide-counter');
    this.dotsContainer = document.querySelector('.dot-indicators');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.notesDrawer = document.getElementById('notesDrawer');
    this.notesContent = document.getElementById('notesContent');

    if (this.slides.length === 0) return;

    this.initDots();
    this.bindEvents();
    this.update();
  }

  initDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';
    this.slides.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (index === this.currentIndex) dot.classList.add('active');
      dot.title = `Go to Slide ${index + 1}`;
      dot.addEventListener('click', () => this.goTo(index));
      this.dotsContainer.appendChild(dot);
    });
  }

  bindEvents() {
    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          this.next();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          this.prev();
          break;
        case 'Home':
          e.preventDefault();
          this.goTo(0);
          break;
        case 'End':
          e.preventDefault();
          this.goTo(this.slides.length - 1);
          break;
        case 'f':
        case 'F':
          this.toggleFullscreen();
          break;
        case 'n':
        case 'N':
          this.toggleNotes();
          break;
        case 'Escape':
          if (this.notesDrawer && this.notesDrawer.classList.contains('open')) {
            this.notesDrawer.classList.remove('open');
          }
          break;
      }
    });

    // Control buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    window.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchEndX < touchStartX - 50) this.next();
      if (touchEndX > touchStartX + 50) this.prev();
    }, { passive: true });
  }

  update() {
    this.slides.forEach((slide, index) => {
      slide.classList.remove('active', 'prev');
      if (index === this.currentIndex) {
        slide.classList.add('active');
      } else if (index < this.currentIndex) {
        slide.classList.add('prev');
      }
    });

    // Update dots
    const dots = this.dotsContainer ? Array.from(this.dotsContainer.children) : [];
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });

    // Update counter (e.g., "01 / 05")
    if (this.counterEl) {
      const current = String(this.currentIndex + 1).padStart(2, '0');
      const total = String(this.slides.length).padStart(2, '0');
      this.counterEl.textContent = `${current} / ${total}`;
    }

    // Update speaker notes
    const activeSlide = this.slides[this.currentIndex];
    const notes = activeSlide ? activeSlide.getAttribute('data-notes') : '';
    if (this.notesContent) {
      this.notesContent.textContent = notes || 'No speaker notes for this slide.';
    }
  }

  next() {
    if (this.currentIndex < this.slides.length - 1) {
      this.currentIndex++;
      this.update();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.update();
    }
  }

  goTo(index) {
    if (index >= 0 && index < this.slides.length) {
      this.currentIndex = index;
      this.update();
    }
  }

  toggleNotes() {
    if (this.notesDrawer) {
      this.notesDrawer.classList.toggle('open');
    }
  }

  toggleFullscreen() {
    const target = document.getElementById('deckViewport') || document.documentElement;
    if (!document.fullscreenElement) {
      target.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.deck = new Deck();
});
