/* =========================================================
   David & Marcela — scripts
   ========================================================= */

// Data em que tudo começou ♥  (16 de março de 2025)
const START_DATE = new Date(2025, 2, 16, 0, 0, 0);

/* ---------- Preloader ---------- */
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  setTimeout(() => pre.classList.add('hidden'), 1400);
});

/* ---------- AOS ---------- */
AOS.init({ once: true, duration: 1000, easing: 'ease-out-cubic', offset: 90 });

/* ---------- Efeito de digitação ---------- */
new Typed('#typed', {
  strings: [
    'Você é o meu lugar favorito. ♥',
    'Cada dia ao seu lado é um presente.',
    'Eu te escolheria em todas as vidas.',
    'Para sempre não seria tempo suficiente.',
  ],
  typeSpeed: 55, backSpeed: 28, backDelay: 1900, startDelay: 1600,
  loop: true, smartBackspace: true,
});

/* ---------- Contador ---------- */
function pad(n) { return String(n).padStart(2, '0'); }

function diffBreakdown(start, now) {
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();
  let seconds = now.getSeconds() - start.getSeconds();
  if (seconds < 0) { seconds += 60; minutes--; }
  if (minutes < 0) { minutes += 60; hours--; }
  if (hours < 0) { hours += 24; days--; }
  if (days < 0) { days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); months--; }
  if (months < 0) { months += 12; years--; }
  return { years, months, days, hours, minutes, seconds };
}

const el = {
  years: document.getElementById('years'),
  months: document.getElementById('months'),
  days: document.getElementById('days'),
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds'),
  totalDays: document.getElementById('total-days'),
};

function updateCounter() {
  const now = new Date();
  const d = diffBreakdown(START_DATE, now);
  el.years.textContent = d.years;
  el.months.textContent = d.months;
  el.days.textContent = d.days;
  el.hours.textContent = pad(d.hours);
  el.minutes.textContent = pad(d.minutes);
  el.seconds.textContent = pad(d.seconds);
  const totalDays = Math.floor((now - START_DATE) / 86400000);
  el.totalDays.textContent = totalDays.toLocaleString('pt-BR');
}
updateCounter();
setInterval(updateCounter, 1000);

/* ---------- Barra de progresso ---------- */
const progressBar = document.getElementById('progress-bar');
function updateProgress() {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
  progressBar.style.width = Math.min(100, Math.max(0, scrolled * 100)) + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

/* ---------- Lightbox: clicar em qualquer foto amplia ---------- */
const zoomSelectors = '.polaroid img, .moment-img, .ring-photo img, .tl-content img, .her-photo img';
const photos = Array.from(document.querySelectorAll(zoomSelectors));
const elements = photos.map((img) => ({ href: img.getAttribute('src'), type: 'image' }));
const lightbox = GLightbox({ elements, loop: true, touchNavigation: true });
photos.forEach((img, i) => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', (e) => { e.preventDefault(); lightbox.openAt(i); });
});

/* ---------- Música de fundo ---------- */
const music = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-toggle');
music.volume = 0.45;

function playMusic() {
  return music.play().then(() => musicBtn.classList.add('playing'));
}
function pauseMusic() {
  music.pause();
  musicBtn.classList.remove('playing');
}

// Botão liga/desliga
musicBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (music.paused) {
    playMusic().catch(() => { musicBtn.title = 'Coloque um arquivo em assets/musica.mp3'; });
  } else {
    pauseMusic();
  }
});

// Toca sozinha; se o navegador bloquear, começa na 1ª interação (clique/toque/rolagem)
const startEvents = ['pointerdown', 'touchstart', 'keydown', 'scroll'];
function startOnInteraction() {
  playMusic().catch(() => {});
  startEvents.forEach((ev) => window.removeEventListener(ev, startOnInteraction));
}
playMusic().catch(() => {
  startEvents.forEach((ev) => window.addEventListener(ev, startOnInteraction, { passive: true }));
});

/* ---------- Motivos pra te amar ---------- */
const REASONS = [
  'O seu sorriso, que ilumina o meu dia inteiro.',
  'O jeito que você fica linda mesmo recém-acordada.',
  'O seu abraço, que é o meu lugar mais seguro do mundo.',
  'A forma como você cuida da nossa família.',
  'O seu cheiro, que eu reconheceria em qualquer lugar.',
  'As suas risadas bobas no meio da madrugada.',
  'O jeito que você fala "eu te amo" e eu derreto todinho.',
  'A sua força nos momentos difíceis.',
  'O seu coração enorme e generoso.',
  'A paz que eu sinto quando estou do seu lado.',
  'O jeito que você me entende sem eu precisar falar nada.',
  'Os seus olhos, onde eu me perco todo dia.',
  'A sua mão na minha, que cabe perfeitamente.',
  'O jeito que você canta desafinado e não liga.',
  'A sua teimosia fofa quando quer ter razão.',
  'Cada "bom dia" e cada "boa noite" com você.',
  'O jeito que você me apoia em tudo que eu sonho.',
  'A sua beleza, por dentro e por fora.',
  'Os planos que a gente faz juntos pro futuro.',
  'O jeito que você torce comigo (vai, Corinthians!).',
  'A nossa cumplicidade em tudo.',
  'O carinho que você tem com as pessoas que ama.',
  'O jeito que você transforma um dia comum em especial.',
  'A saudade que eu sinto até quando você está pertinho.',
  'O simples fato de você existir e ser minha.',
  'Por me escolher, todos os dias, do seu jeitinho.',
];
const reasonText = document.getElementById('reason-text');
const reasonNum = document.getElementById('reason-num');
const reasonBtn = document.getElementById('reason-btn');
let lastReason = 0;
function showReason() {
  let i;
  do { i = (Math.random() * REASONS.length) | 0; } while (i === lastReason && REASONS.length > 1);
  lastReason = i;
  reasonText.style.opacity = '0';
  reasonText.style.transform = 'translateY(8px)';
  setTimeout(() => {
    reasonText.textContent = REASONS[i];
    reasonNum.textContent = 'motivo nº ' + (i + 1);
    reasonText.style.opacity = '1';
    reasonText.style.transform = 'translateY(0)';
  }, 220);
}
if (reasonBtn) reasonBtn.addEventListener('click', (e) => { e.stopPropagation(); showReason(); });

/* ---------- Carta de amor (envelope) ---------- */
const letter = document.getElementById('letter');
if (letter) {
  const seal = letter.querySelector('.letter-seal');
  seal.addEventListener('click', () => letter.classList.add('open'));
}

/* ---------- Corações que sobem ao clicar ---------- */
const CLICK_HEARTS = ['💖', '💕', '💗', '❤️', '💘', '💞', '🩷'];
document.addEventListener('click', (e) => {
  if (e.target.closest('#music-toggle') || e.target.closest('.glightbox-container')) return;
  for (let k = 0; k < 4; k++) {
    const h = document.createElement('span');
    h.className = 'click-heart';
    h.textContent = CLICK_HEARTS[(Math.random() * CLICK_HEARTS.length) | 0];
    h.style.left = e.clientX + (Math.random() * 40 - 20) + 'px';
    h.style.top = e.clientY + (Math.random() * 20 - 10) + 'px';
    h.style.fontSize = 0.9 + Math.random() * 1.1 + 'rem';
    h.style.animationDelay = Math.random() * 0.15 + 's';
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1400);
  }
});

/* ---------- Corações flutuando (canvas) ---------- */
(function heartsBackground() {
  const canvas = document.getElementById('hearts-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, hearts;
  const COLORS = ['#e8568a', '#f4a6c0', '#ff7a6b', '#e0b54a', '#b98ad6', '#ffd5b8', '#ff8fb1'];

  function resize() { w = canvas.width = innerWidth; h = canvas.height = innerHeight; }
  addEventListener('resize', resize); resize();

  function makeHeart() {
    return {
      x: Math.random() * w, y: h + 40,
      size: 6 + Math.random() * 16, speed: 0.4 + Math.random() * 1.2,
      drift: (Math.random() - 0.5) * 0.8, sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.01 + Math.random() * 0.02,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      alpha: 0.35 + Math.random() * 0.45,
    };
  }

  const COUNT = innerWidth < 600 ? 20 : 38;
  hearts = Array.from({ length: COUNT }, () => { const p = makeHeart(); p.y = Math.random() * h; return p; });

  function drawHeart(x, y, size, color, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color;
    ctx.beginPath();
    const s = size / 16;
    ctx.moveTo(x, y + 4 * s);
    ctx.bezierCurveTo(x, y, x - 8 * s, y - 6 * s, x - 8 * s, y + 2 * s);
    ctx.bezierCurveTo(x - 8 * s, y + 9 * s, x, y + 12 * s, x, y + 16 * s);
    ctx.bezierCurveTo(x, y + 12 * s, x + 8 * s, y + 9 * s, x + 8 * s, y + 2 * s);
    ctx.bezierCurveTo(x + 8 * s, y - 6 * s, x, y, x, y + 4 * s);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    hearts.forEach((p, i) => {
      p.y -= p.speed; p.sway += p.swaySpeed;
      p.x += Math.sin(p.sway) * 0.6 + p.drift;
      drawHeart(p.x, p.y, p.size, p.color, p.alpha);
      if (p.y < -40) hearts[i] = makeHeart();
    });
    requestAnimationFrame(animate);
  }

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) animate();
})();
