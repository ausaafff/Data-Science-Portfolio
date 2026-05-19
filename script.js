/* ═══════════════════════════════════════
   TEXT ANIMATION UTILITIES
═══════════════════════════════════════ */

/**
 * scrambleReveal — decodes text left→right with random character cycling.
 * Each character scrambles in lime until it "locks" to its real value.
 */
function scrambleReveal(el, text, { charDelay = 90, scrambleDuration = 380 } = {}) {
    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
    el.innerHTML = '';
    el.style.opacity = '1';

    // Build one <span class="sc"> per character
    const spans = text.split('').map((char, i) => {
        const s = document.createElement('span');
        s.className = 'sc';
        s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        s.style.color = 'var(--accent)';
        el.appendChild(s);
        return { span: s, char };
    });

    // Each char scrambles then locks after (index * charDelay) ms
    spans.forEach(({ span, char }, i) => {
        const lockAt = i * charDelay + scrambleDuration;
        const scramble = setInterval(() => {
            span.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        }, 48);
        setTimeout(() => {
            clearInterval(scramble);
            span.textContent = char;
            span.style.color = '';
            span.style.transition = 'color 0.25s';
        }, lockAt);
    });
}

/**
 * staggerChars — wraps every character in a .sc-stagger span and slides them
 * up with per-character delay when .in is added.
 */
function staggerChars(el, text, { baseDelay = 0, charDelay = 48 } = {}) {
    el.innerHTML = '';
    el.style.opacity = '1';
    text.split('').forEach((char, i) => {
        if (char === ' ') { el.appendChild(document.createTextNode(' ')); return; }
        const s = document.createElement('span');
        s.className = 'sc-stagger';
        s.textContent = char;
        s.style.setProperty('--ci', i);
        // override with absolute delay so baseDelay shifts the whole word
        s.style.transitionDelay = (baseDelay + i * charDelay) + 'ms';
        el.appendChild(s);
    });
}

function triggerStagger(el) {
    el.querySelectorAll('.sc-stagger').forEach(s => s.classList.add('in'));
}

/**
 * splitWords — wraps every word in .word-mask > .word-inner so they can slide
 * up from a clipping container.  Works on plain-text elements only.
 */
function splitWords(el, { baseDelay = 0, wordGap = 80 } = {}) {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w, i) => {
        const delay = (baseDelay + i * wordGap) / 1000;
        return `<span class="word-mask"><span class="word-inner" style="--wi:${delay}s">${w}</span></span>`;
    }).join(' ');
}

/* ═══════════════════════════════════════
   LOADER
═══════════════════════════════════════ */
const loader    = document.getElementById('loader');
const loaderNum = document.getElementById('loader-num');
const loaderBar = document.getElementById('loader-bar');

// Pre-hide the name elements so they don't flash before JS takes over
const nameEl = document.getElementById('scramble-name');
const subEl  = document.getElementById('stagger-sub');
if (nameEl) nameEl.style.opacity = '0';
if (subEl)  subEl.style.opacity  = '0';

let count = 0;
const tick = setInterval(() => {
    count += Math.floor(Math.random() * 7) + 3;
    if (count >= 100) {
        count = 100;
        clearInterval(tick);
        setTimeout(() => {
            loader.classList.add('done');

            // 1. Reveal plain clip-reveal hero elements
            document.querySelectorAll('.hero .clip-reveal').forEach(el => {
                el.classList.add('revealed');
            });

            // 2. Scramble "AUSAAF"
            if (nameEl) scrambleReveal(nameEl, 'AUSAAF', { charDelay: 100, scrambleDuration: 350 });

            // 3. Stagger "Shaikh" — starts after AUSAAF finishes locking (~700ms)
            if (subEl) {
                staggerChars(subEl, 'Shaikh', { baseDelay: 0, charDelay: 55 });
                setTimeout(() => triggerStagger(subEl), 680);
            }

        }, 200);
    }
    if (loaderNum) loaderNum.textContent = count;
    if (loaderBar)  loaderBar.style.width = count + '%';
}, 38);

/* ═══════════════════════════════════════
   CUSTOM CURSOR (desktop only)
═══════════════════════════════════════ */
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
const dragCursor = document.getElementById('drag-cursor');

const isTouch = window.matchMedia('(pointer: coarse)').matches;

if (!isTouch && cursorDot && cursorRing) {
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        cursorDot.style.left = mx + 'px';
        cursorDot.style.top  = my + 'px';
    });

    (function followRing() {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        cursorRing.style.left = rx + 'px';
        cursorRing.style.top  = ry + 'px';
        if (dragCursor) {
            dragCursor.style.left = rx + 'px';
            dragCursor.style.top  = ry + 'px';
        }
        requestAnimationFrame(followRing);
    })();

    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
    });
}

/* ═══════════════════════════════════════
   SCROLL PROGRESS
═══════════════════════════════════════ */
const scrollLine = document.getElementById('scroll-line');
if (scrollLine) {
    window.addEventListener('scroll', () => {
        const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
        scrollLine.style.width = pct + '%';
    }, { passive: true });
}

/* ═══════════════════════════════════════
   HEADER — scrolled state
═══════════════════════════════════════ */
const header = document.getElementById('header');
if (header) {
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
}

/* ═══════════════════════════════════════
   MOBILE MENU
═══════════════════════════════════════ */
const menuToggle = document.getElementById('menu-toggle');
const mobileNav  = document.getElementById('mobile-nav');

if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('open');
        mobileNav.classList.toggle('open');
        document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('open');
            mobileNav.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
}

/* ═══════════════════════════════════════
   SMOOTH SCROLL (RAF-eased)
═══════════════════════════════════════ */
function smoothScrollTo(y, duration = 860) {
    const startY = window.scrollY;
    const diff   = y - startY;
    let start;
    const ease = t => t < 0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
    const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        window.scrollTo(0, startY + diff * ease(p));
        if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (target) {
            e.preventDefault();
            smoothScrollTo(target.getBoundingClientRect().top + window.scrollY - 72);
        }
    });
});

/* ═══════════════════════════════════════
   REVEAL ON SCROLL — works on all screen sizes
═══════════════════════════════════════ */
const isMobile = window.matchMedia('(max-width: 768px)').matches;

const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        revealObs.unobserve(entry.target);
    });
}, {
    threshold: isMobile ? 0.02 : 0.05,
    rootMargin: isMobile ? '0px 0px -5px 0px' : '0px 0px -20px 0px'
});

// Observe everything except hero (hero fires after loader)
document.querySelectorAll('.clip-reveal').forEach(el => {
    if (!el.closest('.hero')) revealObs.observe(el);
});

/* ═══════════════════════════════════════
   WORD-SLIDE REVEALS on section titles + big text
═══════════════════════════════════════ */
const wordObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('words-revealed');
        wordObs.unobserve(entry.target);
    });
}, {
    threshold: isMobile ? 0.05 : 0.15,
    rootMargin: isMobile ? '0px 0px -10px 0px' : '0px 0px -30px 0px'
});

// Section titles — word slide with slight rotation (CSS handles the rotation)
document.querySelectorAll('.section-title').forEach(el => {
    splitWords(el, { wordGap: 70 });
    wordObs.observe(el);
});

// Big approach statement — plain text, no nested tags to worry about
const bigStmt = document.querySelector('.big-stmt');
if (bigStmt) {
    splitWords(bigStmt, { wordGap: 90 });
    wordObs.observe(bigStmt);
}

// Contact heading — "Let's work together." word by word
const contactBig = document.querySelector('.contact-big');
if (contactBig) {
    // Preserve the <em> by operating on text nodes only
    const rawText = contactBig.innerText.replace(/\n/g, ' ').trim();
    splitWords(contactBig, { wordGap: 100 });
    // Re-italicise "together." after split (last word)
    const lastInner = contactBig.querySelectorAll('.word-inner');
    if (lastInner.length) {
        const last = lastInner[lastInner.length - 1];
        last.style.color = 'var(--accent)';
        last.style.fontStyle = 'italic';
    }
    wordObs.observe(contactBig);
}

/* ═══════════════════════════════════════
   PARALLAX — hero name (desktop only)
═══════════════════════════════════════ */
if (!isTouch) {
    const heroName = document.querySelector('.hero-name');
    if (heroName) {
        window.addEventListener('scroll', () => {
            heroName.style.transform = `translateY(${window.scrollY * 0.1}px)`;
        }, { passive: true });
    }
}

/* ═══════════════════════════════════════
   BACK TO TOP
═══════════════════════════════════════ */
const backTop = document.getElementById('back-top');
if (backTop) {
    window.addEventListener('scroll', () => {
        backTop.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    backTop.addEventListener('click', () => smoothScrollTo(0));
}

/* ═══════════════════════════════════════
   KONAMI CODE
═══════════════════════════════════════ */
let seq = [];
const code = [38,38,40,40,37,39,37,39,66,65];
document.addEventListener('keydown', e => {
    seq.push(e.keyCode);
    if (seq.length > code.length) seq.shift();
    if (seq.join() === code.join()) toast('🎉 You found the easter egg!');
});

/* ═══════════════════════════════════════
   TOAST
═══════════════════════════════════════ */
function toast(msg) {
    const el = document.createElement('div');
    el.textContent = msg;
    Object.assign(el.style, {
        position: 'fixed', bottom: '2rem', right: '2rem', zIndex: '99999',
        background: '#C8FF00', color: '#0D0D0D',
        fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem',
        padding: '0.8rem 1.4rem', borderRadius: '4px', fontWeight: '700',
        transform: 'translateY(20px)', opacity: '0',
        transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)', letterSpacing: '0.04em',
    });
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.transform = 'translateY(0)'; el.style.opacity = '1'; });
    setTimeout(() => {
        el.style.transform = 'translateY(20px)'; el.style.opacity = '0';
        setTimeout(() => el.remove(), 400);
    }, 3500);
}

console.log('%c AS ', 'background:#C8FF00;color:#0D0D0D;font-size:20px;font-weight:bold;padding:4px 8px;');
console.log('%c Ausaaf Shaikh — Portfolio ', 'color:#C8FF00;font-size:12px;');
