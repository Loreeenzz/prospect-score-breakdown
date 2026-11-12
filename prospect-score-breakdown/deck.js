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
    this.initLightbox();
    this.initBusinessSwitcher();
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

      // If lightbox is open, handle Escape or prevent slide navigation
      if (this.lightbox && this.lightbox.classList.contains('active')) {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.closeLightbox();
        }
        return;
      }

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

  initLightbox() {
    this.lightbox = document.getElementById('imageLightbox');
    this.lightboxImg = document.getElementById('lightboxImg');
    this.lightboxCaption = document.getElementById('lightboxCaption');
    this.lightboxCloseBtn = document.getElementById('lightboxCloseBtn');

    if (!this.lightbox || !this.lightboxImg) return;

    // Attach click-to-zoom to all content images across slides
    const contentImages = document.querySelectorAll('.slide img:not(.slide-brand-watermark):not(.main-logo-img)');
    contentImages.forEach(img => {
      img.setAttribute('title', 'Click to zoom and view full resolution');
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openLightbox(img.src, img.alt);
      });
    });

    // Close when clicking backdrop or anywhere outside the modal image
    this.lightbox.addEventListener('click', (e) => {
      if (e.target !== this.lightboxImg) {
        this.closeLightbox();
      }
    });

    if (this.lightboxCloseBtn) {
      this.lightboxCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeLightbox();
      });
    }
  }

  openLightbox(src, caption) {
    if (!this.lightbox || !this.lightboxImg) return;
    this.lightboxImg.src = src;
    if (this.lightboxCaption) {
      this.lightboxCaption.textContent = caption || '';
    }
    this.lightbox.classList.add('active');
    this.lightbox.setAttribute('aria-hidden', 'false');
  }

  closeLightbox() {
    if (!this.lightbox) return;
    this.lightbox.classList.remove('active');
    this.lightbox.setAttribute('aria-hidden', 'true');
    if (this.lightboxImg) {
      this.lightboxImg.src = '';
    }
  }

  initBusinessSwitcher() {
    const isPapaVitos = window.location.pathname.includes('papa-vitos') || window.location.hash === '#papa-vitos';
    this.currentBiz = isPapaVitos ? 'papa-vitos' : 'matchbox';
    this.applyBusiness(this.currentBiz);

    const buttons = document.querySelectorAll('.biz-pill[data-biz]');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetBiz = btn.getAttribute('data-biz');
        if (targetBiz && targetBiz !== this.currentBiz) {
          this.switchBusiness(targetBiz);
        }
      });
    });
  }

  switchBusiness(biz) {
    this.currentBiz = biz;
    this.applyBusiness(biz);
    try {
      history.replaceState(null, '', biz === 'papa-vitos' ? '#papa-vitos' : '#matchbox');
    } catch (err) {}
  }

  applyBusiness(biz) {
    // Update active pill state
    document.querySelectorAll('.biz-pill[data-biz]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-biz') === biz);
    });

    // Update Slide 5 Intro Title and Image
    const introTitle = document.querySelector('.screenshot-intro-title');
    const introImg = document.querySelector('.screenshot-frame img');

    if (biz === 'papa-vitos') {
      if (introTitle) {
        introTitle.innerHTML = 'Sample Business: <span class="highlight-text">Papa Vito\'s Italian Restaurant And Pizza Kitchen</span>';
      }
      if (introImg) {
        introImg.src = 'assets/sample-business-papa-vitos.jpg';
        introImg.alt = 'Papa Vito\'s Italian Restaurant And Pizza Kitchen Sample Business Audit Screenshot';
      }
    } else {
      if (introTitle) {
        introTitle.innerHTML = 'Sample Business: <span class="highlight-text">Matchbox</span>';
      }
      if (introImg) {
        introImg.src = 'assets/sample-business-matchbox.jpg';
        introImg.alt = 'Matchbox Sample Business Audit Screenshot';
      }
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
