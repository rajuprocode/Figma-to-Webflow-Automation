/* ==========================================================================
   MX3 global interactions (every page)
   Webflow: paste into Site Settings → Custom Code → Footer, after enabling
   GSAP + ScrollTrigger in Site Settings → GSAP (Webflow ships GSAP natively).
   Everything is driven by data-attributes so the markup stays class-clean:
     data-navbar / data-navbar-toggle   – mobile menu + hide on scroll
     data-animate="fade-up"             – fade + 32px rise when scrolled into view
     data-animate="stagger"             – children fade up one after another
     data-animate="split-lines"         – heading lines rise from a mask
     data-animate="image-reveal"        – clip-path reveal from bottom
     data-animate="footer-logo"         – oversized wordmark slides up
     data-parallax="0.12"               – image drifts inside its wrapper
     data-marquee / data-marquee-track  – infinite logo strip
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined";
  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Navbar: mobile toggle ---------- */
  var navbar = document.querySelector("[data-navbar]");
  var toggle = document.querySelector("[data-navbar-toggle]");
  if (navbar && toggle) {
    toggle.addEventListener("click", function () {
      var open = navbar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.style.overflow = open ? "hidden" : "";
    });
  }

  /* ---------- Navbar: hide on scroll down, show on scroll up ---------- */
  if (navbar) {
    var lastY = window.scrollY;
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (navbar.classList.contains("is-open")) return;
      navbar.classList.toggle("is-hidden", y > lastY && y > 120);
      lastY = y;
    }, { passive: true });
  }

  /* ---------- Logo marquee (duplicates the track for a seamless loop) ---------- */
  document.querySelectorAll("[data-marquee]").forEach(function (marquee) {
    var track = marquee.querySelector("[data-marquee-track]");
    if (!track) return;
    var clone = track.innerHTML;
    track.insertAdjacentHTML("beforeend", clone);
    track.querySelectorAll("img").forEach(function (img, i) {
      if (i >= track.children.length / 2) img.setAttribute("aria-hidden", "true");
    });
    if (reduceMotion || !hasGsap) return;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    var tween = gsap.to(track, {
      xPercent: -50,
      x: -gap / 2,
      duration: 40,
      ease: "none",
      repeat: -1
    });
    marquee.addEventListener("mouseenter", function () { gsap.to(tween, { timeScale: 0.2, duration: 0.6 }); });
    marquee.addEventListener("mouseleave", function () { gsap.to(tween, { timeScale: 1, duration: 0.6 }); });
  });

  if (reduceMotion || !hasGsap) return;

  /* ---------- Scroll reveals ---------- */
  gsap.utils.toArray('[data-animate="fade-up"]').forEach(function (el) {
    gsap.from(el, {
      y: 32, autoAlpha: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true }
    });
  });

  gsap.utils.toArray('[data-animate="stagger"]').forEach(function (el) {
    var items = Array.prototype.filter.call(el.children, function (c) { return !c.classList.contains("corner-mark"); });
    gsap.from(items, {
      y: 40, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.12,
      scrollTrigger: { trigger: el, start: "top 85%", once: true }
    });
  });

  /* Split heading into lines without a paid plugin: wrap words, group by offsetTop */
  function splitLines(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) { return '<span class="split-word" style="display:inline-block">' + w + "</span>"; }).join(" ");
    var lines = [], top = null;
    el.querySelectorAll(".split-word").forEach(function (w) {
      if (w.offsetTop !== top) { lines.push([]); top = w.offsetTop; }
      lines[lines.length - 1].push(w.textContent);
    });
    el.setAttribute("aria-label", words.join(" "));
    el.innerHTML = lines.map(function (l) {
      return '<span class="split-line" aria-hidden="true" style="display:block;overflow:hidden;padding-bottom:0.08em;margin-bottom:-0.08em"><span class="split-line-inner" style="display:block">' + l.join(" ") + "</span></span>";
    }).join("");
    return el.querySelectorAll(".split-line-inner");
  }

  function initSplitHeadings() {
    gsap.utils.toArray('[data-animate="split-lines"]').forEach(function (el) {
      var inner = splitLines(el);
      gsap.from(inner, {
        yPercent: 105, duration: 1.1, ease: "power4.out", stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 85%", once: true }
      });
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(initSplitHeadings);
  else window.addEventListener("load", initSplitHeadings);

  gsap.utils.toArray('[data-animate="image-reveal"]').forEach(function (el) {
    gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, {
      clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power4.inOut",
      scrollTrigger: { trigger: el, start: "top 85%", once: true }
    });
  });

  gsap.utils.toArray("[data-parallax]").forEach(function (img) {
    var amount = parseFloat(img.getAttribute("data-parallax")) || 0.1;
    gsap.fromTo(img, { yPercent: -amount * 50 }, {
      yPercent: amount * 50, ease: "none",
      scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  gsap.utils.toArray('[data-animate="footer-logo"]').forEach(function (el) {
    gsap.from(el, {
      yPercent: 40, autoAlpha: 0, duration: 1.4, ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 100%", once: true }
    });
  });
})();
