// Smart Applications, LLC — site interactions
// Mobile nav toggle, sticky header shrink, active-link highlight,
// scroll-reveal animation, and a placeholder contact form handler.

document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Sticky header shrink ----
  const nav = document.getElementById("siteNav");
  const onScroll = () => {
    if (window.scrollY > 12) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---- Mobile nav toggle ----
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
  });

  // ---- Active nav link on scroll ----
  const sections = Array.from(document.querySelectorAll("section[id]"));
  const navAnchors = Array.from(navLinks.querySelectorAll("a"));
  const setActive = () => {
    let current = sections[0]?.id;
    const offset = 120;
    sections.forEach((section) => {
      if (window.scrollY + offset >= section.offsetTop) current = section.id;
    });
    navAnchors.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
    });
  };
  setActive();
  window.addEventListener("scroll", setActive, { passive: true });

  // ---- Scroll-reveal ----
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  // ---- Hero aurora-ribbon animation ----
  heroAurora();

  // ---- Contact form (placeholder) ----
  // GitHub Pages is static and cannot process form submissions on its own.
  // Point `action` in index.html at a form backend (Formspree, Netlify Forms,
  // Basin, etc.) and this handler can be simplified/removed, or left as a
  // client-side confirmation layer.
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      if (form.getAttribute("action") === "#") {
        e.preventDefault();
        alert(
          "This form isn't wired up to a backend yet. Connect it to a form service (Formspree, Netlify Forms, etc.) — see CONTENT-GUIDE.md."
        );
      }
    });
  }
});

// ---- Hero aurora-ribbon canvas animation ----
// Adapted from the "Aurora ribbon hero animation" built in Claude Design,
// recolored to the Smart Applications palette (blue / green from the logo)
// instead of the original sky-blue / cyan. Layered flowing sine-wave bands
// plus a light field of drifting particles, drawn with additive blending.
function heroAurora() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Same tunables as the source design (flowSpeed / ribbonCount / showParticles)
  const speed = 1;
  const ribbonCount = 8;
  const showParticles = true;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0,
    H = 0,
    dpr = Math.min(window.devicePixelRatio || 1, 2);

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    W = r.width;
    H = r.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  // Smart Applications brand palette (blue / green / light-blue from the logo)
  const blue = [77, 141, 255];
  const green = [0, 217, 156];
  const blueLight = [127, 176, 255];
  const palette = [blue, green, blueLight];

  const bands = Array.from({ length: ribbonCount }, (_, i) => {
    const t = i / Math.max(1, ribbonCount - 1);
    const col = palette[i % palette.length];
    return {
      base: 0.28 + t * 0.5,
      amp: 60 + Math.random() * 90,
      thick: 90 + Math.random() * 120,
      freq: 0.7 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      drift: (0.15 + Math.random() * 0.35) * (i % 2 ? 1 : -1),
      col,
      op: 0.1 + Math.random() * 0.1,
    };
  });

  const dots = Array.from({ length: showParticles ? 44 : 0 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.6 + Math.random() * 1.8,
    vx: (Math.random() - 0.5) * 0.00016,
    vy: (Math.random() - 0.5) * 0.00016,
    op: 0.15 + Math.random() * 0.4,
  }));

  let t = 0;
  let raf;

  const drawFrame = () => {
    t += 0.0045 * speed;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    for (const b of bands) {
      const cy = b.base * H;
      const grad = ctx.createLinearGradient(0, cy - b.thick, 0, cy + b.thick);
      const [r, g, bl] = b.col;
      grad.addColorStop(0, `rgba(${r},${g},${bl},0)`);
      grad.addColorStop(0.5, `rgba(${r},${g},${bl},${b.op})`);
      grad.addColorStop(1, `rgba(${r},${g},${bl},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      const step = Math.max(12, W / 60);
      ctx.moveTo(-40, cy);
      for (let x = -40; x <= W + 40; x += step) {
        const nx = x / W;
        const y =
          cy +
          Math.sin(nx * Math.PI * 2 * b.freq + t * b.drift * 6 + b.phase) * b.amp +
          Math.sin(nx * Math.PI * 5 * b.freq + t * b.drift * 3) * (b.amp * 0.35);
        ctx.lineTo(x, y - b.thick * 0.5);
      }
      for (let x = W + 40; x >= -40; x -= step) {
        const nx = x / W;
        const y =
          cy +
          Math.sin(nx * Math.PI * 2 * b.freq + t * b.drift * 6 + b.phase) * b.amp +
          Math.sin(nx * Math.PI * 5 * b.freq + t * b.drift * 3) * (b.amp * 0.35);
        ctx.lineTo(x, y + b.thick * 0.5);
      }
      ctx.closePath();
      ctx.fill();
    }

    for (const d of dots) {
      d.x += d.vx * speed;
      d.y += d.vy * speed;
      if (d.x < 0) d.x = 1;
      if (d.x > 1) d.x = 0;
      if (d.y < 0) d.y = 1;
      if (d.y > 1) d.y = 0;
      const px = d.x * W,
        py = d.y * H;
      ctx.beginPath();
      ctx.arc(px, py, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,210,255,${d.op})`;
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
  };

  if (reduceMotion) {
    // Draw a single static frame instead of a continuous loop.
    drawFrame();
    return;
  }

  const loop = () => {
    drawFrame();
    raf = requestAnimationFrame(loop);
  };
  loop();
}
