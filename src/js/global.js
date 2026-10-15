/* ==========================================================================
   MX3 global interactions (every page)
   Webflow: paste into Site Settings → Custom Code → Footer, after enabling
   GSAP + ScrollTrigger in Site Settings → GSAP (Webflow ships GSAP natively).
   Everything is driven by data-attributes so the markup stays class-clean:
     data-navbar / data-navbar-toggle   – mobile menu + hide on scroll
     data-animate="image-reveal"        – clip-path reveal from bottom
     data-animate="footer-logo"         – oversized wordmark slides up
     data-parallax="0.12"               – image drifts inside its wrapper (smoothed)
     data-marquee / data-marquee-track  – infinite logo strip
   Smooth scrolling: Webflow loads Lenis (duration 1.2, expo-out) in Site
   Settings → Footer; this build uses the matching inertia below.
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

  /* ---------- Smooth scrolling (mouse wheel only; touch and keyboard stay native) ----------
     Eases toward the wheel target like Lenis (duration 1.2, expo-out), so every
     ScrollTrigger scrub and parallax glides instead of stepping. */
  if (!reduceMotion && hasGsap && window.matchMedia("(pointer: fine)").matches) {
    var target = window.scrollY, current = target, gliding = false;
    var maxScroll = function () { return document.documentElement.scrollHeight - window.innerHeight; };
    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey || document.documentElement.style.overflow === "hidden" || e.target.closest("[data-lenis-prevent]")) return;
      e.preventDefault();
      if (!gliding) target = current = window.scrollY;
      var step = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      target = Math.max(0, Math.min(maxScroll(), target + step));
      gliding = true;
    }, { passive: false });
    window.addEventListener("scroll", function () { if (!gliding) target = current = window.scrollY; }, { passive: true });
    gsap.ticker.add(function (time, dt) {
      if (!gliding) return;
      current += (target - current) * (1 - Math.exp(-dt / 140));
      if (Math.abs(target - current) < 0.5) { current = target; gliding = false; }
      window.scrollTo(0, current);
    });
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

  /* Text reveals live in reveal.js (Webflow class names). */

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
      scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: 1 }
    });
  });

  gsap.utils.toArray('[data-animate="footer-logo"]').forEach(function (el) {
    gsap.from(el, {
      yPercent: 40, autoAlpha: 0, duration: 1.4, ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 100%", once: true }
    });
  });
})();
