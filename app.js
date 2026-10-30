/**
 * Minimal Mobile Wedding Invitation - app.js
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. D-Day Calculator
  initDday();

  // 2. Scroll Fade-in Animation
  initScrollAnimation();

  // 3. Account Accordion
  initAccordion();

  // 4. Clipboard Copy & Toast
  initClipboard();

  // 5. Contact Modal
  initContactModal();

  // 6. RSVP Form Handler
  initRsvpForm();

  // 7. Share Link
  initShareLink();
});

/* ==========================================================================
   1. D-Day Calculator
   ========================================================================== */
function initDday() {
  const ddayElement = document.getElementById('ddayNumber');
  const ddayContainer = document.getElementById('ddayCounter');
  if (!ddayElement) return;

  const weddingDate = new Date('2027-01-16T12:00:00+09:00');
  const today = new Date();

  // Set hours to 0 to compare dates purely
  const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const weddingZero = new Date(weddingDate.getFullYear(), weddingDate.getMonth(), weddingDate.getDate());

  const diffTime = weddingZero - todayZero;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    ddayElement.textContent = diffDays;
  } else if (diffDays === 0) {
    ddayContainer.innerHTML = '<p class="dday-text"><strong>오늘, 소중한 결혼식이 열립니다. ♥</strong></p>';
  } else {
    ddayContainer.innerHTML = `<p class="dday-text">민준 ♥ 서연이 함께한 지 <span class="highlight-num">${Math.abs(diffDays)}</span>일째 되는 날입니다.</p>`;
  }
}

/* ==========================================================================
   2. Scroll Fade-in Animation
   ========================================================================== */
function initScrollAnimation() {
  const fadeElements = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(el => observer.observe(el));
  } else {
    fadeElements.forEach(el => el.classList.add('visible'));
  }
}

/* ==========================================================================
   3. Account Accordion
   ========================================================================== */
function initAccordion() {
  const headers = document.querySelectorAll('.accordion-header');

  headers.forEach(header => {
    header.addEventListener('click', () => {
      const parent = header.closest('.accordion-item');
      const body = parent.querySelector('.accordion-body');
      const isOpen = parent.classList.contains('active');

      // Close all accordions first (optional clean look)
      document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.accordion-body').style.maxHeight = null;
      });

      // Toggle current
      if (!isOpen) {
        parent.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
}

/* ==========================================================================
   4. Clipboard Copy & Toast Notification
   ========================================================================== */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function copyToClipboard(text, successMessage = '복사되었습니다.') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(successMessage))
      .catch(() => fallbackCopy(text, successMessage));
  } else {
    fallbackCopy(text, successMessage);
  }
}

function fallbackCopy(text, successMessage) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    document.execCommand('copy');
    showToast(successMessage);
  } catch (err) {
    showToast('직접 복사해 주세요: ' + text);
  }
  document.body.removeChild(textarea);
}

function initClipboard() {
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const accountData = btn.getAttribute('data-account');
      if (accountData) {
        copyToClipboard(accountData, '계좌번호가 복사되었습니다.');
      }
    });
  });
}

/* ==========================================================================
   5. Contact Modal
   ========================================================================== */
function initContactModal() {
  const modal = document.getElementById('contactModal');
  const openBtn = document.getElementById('contactBtn');
  const closeBtn = document.getElementById('closeContactModal');

  if (!modal || !openBtn) return;

  openBtn.addEventListener('click', () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

/* ==========================================================================
   6. RSVP Form Handler
   ========================================================================== */
function initRsvpForm() {
  const form = document.getElementById('rsvpForm');
  if (!form) return;

  const attendanceRadios = form.querySelectorAll('input[name="attendance"]');
  const mealGroup = document.getElementById('mealGroup');
  const countGroup = document.getElementById('countGroup');

  attendanceRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === '불참') {
        mealGroup.style.display = 'none';
        countGroup.style.display = 'none';
      } else {
        mealGroup.style.display = 'block';
        countGroup.style.display = 'block';
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const side = formData.get('side');
    const guestName = formData.get('guestName');
    const attendance = formData.get('attendance');
    const meal = formData.get('meal') || '-';
    const guestCount = formData.get('guestCount') || '0';

    const rsvpEntry = {
      side,
      guestName,
      attendance,
      meal,
      guestCount,
      timestamp: new Date().toISOString()
    };

    // Save to local storage
    try {
      const stored = JSON.parse(localStorage.getItem('wedding_rsvp_list') || '[]');
      stored.push(rsvpEntry);
      localStorage.setItem('wedding_rsvp_list', JSON.stringify(stored));
    } catch (err) {
      console.warn('Storage error:', err);
    }

    showToast('참석 정보가 전달되었습니다. 감사합니다.');
    form.reset();
    mealGroup.style.display = 'block';
    countGroup.style.display = 'block';
  });
}

/* ==========================================================================
   7. Share Link
   ========================================================================== */
function initShareLink() {
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  if (!copyLinkBtn) return;

  copyLinkBtn.addEventListener('click', () => {
    const currentUrl = window.location.href;
    copyToClipboard(currentUrl, '청첩장 주소가 복사되었습니다.');
  });
}
