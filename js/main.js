/* Loading screen */
(function() {
  var bar = document.getElementById('loadingBar');
  var progress = 0;
  var interval = setInterval(function() {
    progress += Math.random() * 25 + 10;
    if (progress >= 100) {
      progress = 100;
      bar.style.width = '100%';
      clearInterval(interval);
      setTimeout(function() {
        document.getElementById('loadingScreen').classList.add('hidden');
      }, 400);
    } else {
      bar.style.width = progress + '%';
    }
  }, 200);
})();

/* ---- COIN GAME ---- */
var collectedCoins = 0;
var totalCoins = document.querySelectorAll('.deco-coin.collectible').length;
document.querySelectorAll('.qblock').forEach(function(b) {
  totalCoins += (parseInt(b.getAttribute('data-points')) || 100) / 100;
});

document.querySelectorAll('.deco-coin.collectible').forEach(function(coin) {
  coin.addEventListener('click', function() {
    if (this.classList.contains('collected')) return;
    this.classList.add('collected');
    collectedCoins++;

    var rect = this.getBoundingClientRect();
    var fx = document.createElement('div');
    fx.className = 'coin-collect-fx';
    fx.textContent = '+100';
    fx.style.left = rect.left + rect.width / 2 - 30 + 'px';
    fx.style.top = rect.top + 'px';
    document.body.appendChild(fx);
    setTimeout(function() { fx.remove(); }, 1000);

    var score = collectedCoins * 100;
    document.getElementById('coinScore').textContent = String(score).padStart(4, '0');

    if (collectedCoins >= totalCoins) {
      setTimeout(function() { openModal('prizeModal'); }, 800);
    }
  });
});

/* ---- MODALS ---- */
function openModal(id) {
  var modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  if (id === 'videoModal') {
    document.getElementById('videoContainer').innerHTML =
      '<iframe src="https://kinescope.io/embed/vpCPLC4yMqey4Yn7NR2cRg" allow="autoplay; fullscreen" allowfullscreen></iframe>';
  }
  if (id === 'prikolModal') {
    document.getElementById('prikolContainer').innerHTML =
      '<iframe src="https://vk.com/video_ext.php?oid=-229336623&id=456239085&hd=2" allow="autoplay; fullscreen" allowfullscreen></iframe>';
  }
}

function closeModal(id) {
  var modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
  if (id === 'videoModal') document.getElementById('videoContainer').innerHTML = '';
  if (id === 'prikolModal') document.getElementById('prikolContainer').innerHTML = '';
}

document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) closeModal(this.id);
  });
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(function(m) { closeModal(m.id); });
    closeBSOD();
  }
});

/* ---- TV / VIDEO ---- */
document.getElementById('tvFrame').addEventListener('click', function() { openModal('videoModal'); });

/* ---- TV PHOTO AUTO-CYCLE WITH PIXEL DISSOLVE ---- */
(function() {
  var front = document.getElementById('tvImageFront');
  var back = document.getElementById('tvImageBack');
  var canvas = document.getElementById('tvCanvas');
  var ctx = canvas.getContext('2d');
  var images = ['images/che_1.jpg', 'images/che_2.jpg'];
  var currentIndex = 0;
  var SHOW_DURATION = 4000;

  function pixelDissolve(callback) {
    var screen = document.getElementById('tvScreen');
    var w = screen.offsetWidth;
    var h = screen.offsetHeight;
    canvas.width = w;
    canvas.height = h;
    canvas.style.display = 'block';

    // Draw current front image to canvas
    ctx.drawImage(front, 0, 0, w, h);

    // Pixelation steps: progressively lower resolution
    var steps = [
      { size: 4, duration: 120 },
      { size: 8, duration: 120 },
      { size: 16, duration: 140 },
      { size: 24, duration: 140 },
      { size: 32, duration: 160 },
      { size: 48, duration: 160 }
    ];

    // Hide front image, show canvas
    front.style.visibility = 'hidden';
    var stepIndex = 0;

    function nextStep() {
      if (stepIndex >= steps.length) {
        // Fade out last frame
        canvas.style.transition = 'opacity 0.2s';
        canvas.style.opacity = '0';
        setTimeout(function() {
          canvas.style.display = 'none';
          canvas.style.transition = '';
          canvas.style.opacity = '';
          // Swap images
          var nextIndex = (currentIndex + 1) % images.length;
          front.src = images[nextIndex];
          back.src = images[currentIndex];
          front.style.visibility = '';
          currentIndex = nextIndex;
          if (callback) callback();
        }, 200);
        return;
      }

      var s = steps[stepIndex];
      var pixelSize = s.size;

      // Draw pixelated version: scale down then back up
      ctx.clearRect(0, 0, w, h);
      var sw = Math.max(1, Math.ceil(w / pixelSize));
      var sh = Math.max(1, Math.ceil(h / pixelSize));
      ctx.imageSmoothingEnabled = false;
      // Draw source image at tiny size
      ctx.drawImage(front, 0, 0, sw, sh);
      // Copy that tiny region back to full size (pixelated)
      ctx.drawImage(ctx.canvas, 0, 0, sw, sh, 0, 0, w, h);

      stepIndex++;
      setTimeout(nextStep, s.duration);
    }

    nextStep();
  }

  function cyclePhoto() {
    pixelDissolve(function() {
      setTimeout(cyclePhoto, SHOW_DURATION);
    });
  }

  // Wait for the first image to load, then start cycling
  if (front.complete) {
    setTimeout(cyclePhoto, SHOW_DURATION);
  } else {
    front.addEventListener('load', function() {
      setTimeout(cyclePhoto, SHOW_DURATION);
    });
  }
})();

/* ---- FOLDER CLICKS ---- */
document.querySelectorAll('.folder[data-modal]').forEach(function(folder) {
  folder.addEventListener('click', function() { openModal(this.dataset.modal); });
});

document.getElementById('systemFolder').addEventListener('click', function() {
  document.getElementById('bluescreen').classList.add('active');
  document.body.style.overflow = 'hidden';
});

function closeBSOD() {
  document.getElementById('bluescreen').classList.remove('active');
  document.body.style.overflow = '';
}

/* ---- HEART -> QUOTE POPUP ---- */
document.getElementById('heartBtn').addEventListener('click', function() {
  openModal('quoteModal');
});

/* ---- GALLERY ---- */
var galleryIndex = 0;
var galleryTotal = 15;

function galleryMove(dir) {
  galleryIndex = (galleryIndex + dir + galleryTotal) % galleryTotal;
  document.getElementById('galleryTrack').style.transform =
    'translateX(-' + (galleryIndex * 100) + '%)';
  document.getElementById('galleryCounter').textContent =
    (galleryIndex + 1) + ' / ' + galleryTotal;
}

document.addEventListener('keydown', function(e) {
  if (!document.getElementById('galleryModal').classList.contains('active')) return;
  if (e.key === 'ArrowLeft') galleryMove(-1);
  if (e.key === 'ArrowRight') galleryMove(1);
});

(function() {
  var track = document.getElementById('galleryTrack');
  var startX = 0, isDragging = false;
  track.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
    isDragging = true;
  });
  track.addEventListener('touchend', function(e) {
    if (!isDragging) return;
    var diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) galleryMove(diff > 0 ? 1 : -1);
    isDragging = false;
  });
})();

/* ---- FORMS ---- */
function submitContactForm() {
  var phone = document.getElementById('contactPhone');
  var consent = document.getElementById('contactConsent');
  if (!phone.value || !consent.checked) {
    if (!phone.value) phone.style.borderColor = 'var(--fire-red)';
    return;
  }
  document.getElementById('contactForm').style.display = 'none';
  document.getElementById('contactSuccess').classList.add('active');
}

function submitPrizeForm() {
  var email = document.getElementById('prizeEmail');
  if (!email.value || !email.value.includes('@')) {
    email.style.borderColor = 'var(--fire-red)';
    return;
  }
  document.getElementById('prizeForm').style.display = 'none';
  document.getElementById('prizeSuccess').classList.add('active');
}

/* ---- SCROLL REVEAL ---- */
var revealObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(function(el) { revealObserver.observe(el); });


/* ---- QUESTION BLOCK ACHIEVEMENTS ---- */
document.querySelectorAll('.qblock').forEach(function(block) {
  block.addEventListener('click', function() {
    if (this.classList.contains('hit')) return;
    this.classList.add('hit', 'bounce');

    // Insert the relevant icon emoji into the block face
    var icon = this.getAttribute('data-icon');
    if (icon) {
      var iconEl = document.createElement('span');
      iconEl.className = 'qblock-icon';
      iconEl.textContent = icon;
      this.querySelector('.qblock-face').appendChild(iconEl);
    }

    // Points: secret block gives 500, others give 100
    var points = parseInt(this.getAttribute('data-points')) || 100;
    collectedCoins += points / 100;
    var score = Math.round(collectedCoins * 100);
    document.getElementById('coinScore').textContent = String(score).padStart(4, '0');

    // Show floating points text from the block
    var rect = this.getBoundingClientRect();
    var fx = document.createElement('div');
    fx.className = 'coin-collect-fx';
    fx.textContent = '+' + points;
    if (points > 100) fx.style.color = '#f8d878';
    fx.style.left = rect.left + rect.width / 2 - 30 + 'px';
    fx.style.top = rect.top - 20 + 'px';
    document.body.appendChild(fx);
    setTimeout(function() { fx.remove(); }, 1000);

    // Check if all coins collected (including qblock coins)
    if (collectedCoins >= totalCoins) {
      setTimeout(function() { openModal('prizeModal'); }, 800);
    }

    var wrap = this.closest('.qblock-wrap');
    setTimeout(function() {
      wrap.classList.add('unlocked');
    }, 350);
    this.addEventListener('animationend', function handler() {
      block.classList.remove('bounce');
      block.removeEventListener('animationend', handler);
    });
  });
});

/* ---- RPG DIALOGUE ---- */
(function() {
  var dialogues = [
    'Привет! Я <span class="hl">Данила Стрельников</span>.',
    '<span class="hl">ИП Стрельников.</span> Знаю свои реквизиты наизусть, гостей-то ваших запомню.',
    'Сын кандидата биологических наук и режиссера массовых мероприятий.',
    'Больше <span class="hl">артист</span>, чем ведущий. Больше <span class="hl">человек</span>, чем артист.',
    'Жанр: <span class="hl">легкое веселое человечное.</span>',
    'Пою в полупопулярной группе <span class="hl">«ДИСКОПРОВОКАЦИЯ»</span>.',
    'Открываю франшизы квиза и помогаю зарабатывать другим.',
    'Тщательно скрываю, что я хедлайнер вечера.',
    'Вел свадьбу во Флоренции, проводил в Турции, мерил жизнь унциями.',
    '5 лет организовываю авторские туры на <span class="hl">Алтай</span>. Вожу бывших заказчиков, а впоследствии — друзей.'
  ];

  var textEl = document.getElementById('rpgText');
  var counterEl = document.getElementById('rpgCounter');
  var prevBtn = document.getElementById('rpgPrev');
  var nextBtn = document.getElementById('rpgNext');
  var ctaEl = document.getElementById('rpgCta');
  var dialogueEl = document.getElementById('rpgDialogue');
  var characterEl = document.getElementById('aboutCharacter');
  var sceneEl = document.querySelector('.about-scene');

  var currentIndex = 0;
  var isTyping = false;
  var typeTimer = null;
  var autoTimer = null;
  var started = false;
  var autoStopped = false;
  var AUTO_DELAY = 3000;

  function typeText(html, callback) {
    isTyping = true;
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    var fullText = tempDiv.textContent;
    var charIndex = 0;

    textEl.innerHTML = '';
    var displaySpan = document.createElement('span');
    textEl.appendChild(displaySpan);

    function tick() {
      charIndex++;
      if (charIndex <= fullText.length) {
        var visibleCount = 0;
        var htmlPos = 0;
        var inTag = false;
        for (var i = 0; i < html.length; i++) {
          if (html[i] === '<') inTag = true;
          if (!inTag) visibleCount++;
          if (visibleCount > charIndex && !inTag) break;
          htmlPos = i + 1;
          if (html[i] === '>') inTag = false;
        }
        displaySpan.innerHTML = html.substring(0, htmlPos);
        typeTimer = setTimeout(tick, 30);
      } else {
        displaySpan.innerHTML = html;
        isTyping = false;
        if (callback) callback();
      }
    }
    tick();
  }

  function showDialogue(index, skipTyping) {
    clearTimeout(typeTimer);
    clearTimeout(autoTimer);
    currentIndex = index;
    counterEl.textContent = (currentIndex + 1) + '/' + dialogues.length;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = false;

    if (currentIndex === dialogues.length - 1 || autoStopped) {
      ctaEl.classList.add('show');
    }

    if (skipTyping) {
      textEl.innerHTML = dialogues[currentIndex];
      isTyping = false;
      scheduleAuto();
    } else {
      typeText(dialogues[currentIndex], function() {
        scheduleAuto();
      });
    }
  }

  function scheduleAuto() {
    clearTimeout(autoTimer);
    if (autoStopped) return;
    if (currentIndex < dialogues.length - 1) {
      autoTimer = setTimeout(function() {
        showDialogue(currentIndex + 1, false);
      }, AUTO_DELAY);
    }
  }

  function stopAuto() {
    autoStopped = true;
    clearTimeout(autoTimer);
  }

  function advance() {
    stopAuto();
    if (isTyping) {
      clearTimeout(typeTimer);
      textEl.innerHTML = dialogues[currentIndex];
      isTyping = false;
    } else if (currentIndex < dialogues.length - 1) {
      showDialogue(currentIndex + 1, false);
    }
  }

  // Event listeners
  document.querySelector('.rpg-dialogue-box').addEventListener('click', advance);

  prevBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    stopAuto();
    if (currentIndex > 0) showDialogue(currentIndex - 1, true);
  });

  nextBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    advance();
  });

  // Keyboard
  document.addEventListener('keydown', function(e) {
    if (!started) return;
    var aboutRect = document.getElementById('about').getBoundingClientRect();
    if (aboutRect.bottom < 0 || aboutRect.top > window.innerHeight) return;

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      advance();
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
      showDialogue(currentIndex - 1, true);
    } else if (e.key === 'ArrowRight') {
      advance();
    }
  });

  // Start sequence when section becomes visible
  var aboutObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !started) {
        started = true;
        // 1. Character rises from pipe
        setTimeout(function() {
          characterEl.classList.add('risen');
        }, 200);
        // 2. Dialogue box appears
        setTimeout(function() {
          dialogueEl.classList.add('active');
        }, 600);
        // 3. First message starts typing
        setTimeout(function() {
          showDialogue(0, false);
        }, 1100);
      }
    });
  }, { threshold: 0.3 });

  if (sceneEl) aboutObserver.observe(sceneEl);
})();
