/* ==========================================================================
   Homepage interactions (Webflow: Page Settings → Custom Code → Before </body>)
   Motion spec: Figma "Homepage – Motion outline – About section" (7651:5188)
   and the annotations on "Homepage – Notes" (7574:4886).
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  /* ---------- Use cases: click to switch (works with or without GSAP) ---------- */
  var usecases = document.querySelector("[data-usecases]");
  function setUsecase(index) {
    if (!usecases) return;
    usecases.querySelectorAll("[data-usecase]").forEach(function (item) {
      var active = item.getAttribute("data-usecase") === String(index);
      item.classList.toggle("is-active", active);
      item.querySelector("button").setAttribute("aria-expanded", active ? "true" : "false");
    });
    usecases.querySelectorAll("[data-usecase-bg]").forEach(function (bg) {
      bg.classList.toggle("is-active", bg.getAttribute("data-usecase-bg") === String(index));
    });
  }
  if (usecases) {
    usecases.querySelectorAll("[data-usecase]").forEach(function (item) {
      item.querySelector("button").addEventListener("click", function () {
        setUsecase(item.getAttribute("data-usecase"));
      });
    });
  }

  /* ---------- Customer stories slider ---------- */
  var slider = document.querySelector("[data-slider]");
  if (slider) {
    var track = slider.querySelector("[data-slider-track]");
    var cards = track.children;
    var prev = slider.querySelector("[data-slider-prev]");
    var next = slider.querySelector("[data-slider-next]");
    var index = 0;
    var update = function () {
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      var step = cards[0].getBoundingClientRect().width + gap;
      track.style.transform = "translateX(" + (-index * step) + "px)";
      prev.disabled = index === 0;
      next.disabled = index === cards.length - 1;
    };
    prev.addEventListener("click", function () { index = Math.max(0, index - 1); update(); });
    next.addEventListener("click", function () { index = Math.min(cards.length - 1, index + 1); update(); });
    window.addEventListener("resize", update);
    update();
  }

  if (!hasGsap || reduceMotion) return;

  /* Hero text uses the shared reveal classes (reveal-chars, reveal-lines, fade-in + delays). */

  var mm = gsap.matchMedia();

  /* ---------- About: pinned photo stream ----------
     Pins for ~1000px. Four lanes stream upward, linear with scroll:
     outer ≈3.1×, inner ≈1.9×. Mobile: two lanes at ≈2×. */
  var about = document.querySelector("[data-about-stream]");
  if (about) {
    var PIN = 1000;
    mm.add({ desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" }, function (ctx) {
      var isMobile = ctx.conditions.mobile;
      var lanes = about.querySelectorAll("[data-lane]");
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: about,
          start: "top top",
          end: "+=" + PIN,
          pin: isMobile ? false : about.querySelector("[data-about-pin]"),
          scrub: 0.6
        }
      });
      lanes.forEach(function (lane) {
        if (getComputedStyle(lane).display === "none") return;
        var speed = isMobile ? 2 : parseFloat(lane.getAttribute("data-speed")) || 2;
        var travel = PIN * speed * (isMobile ? 0.5 : 1);
        // Fill the lane so photos keep entering from the bottom for the whole pin
        var original = Array.prototype.slice.call(lane.children);
        var guard = 0;
        while (lane.scrollHeight < window.innerHeight + travel && guard < 8) {
          original.forEach(function (img) { lane.appendChild(img.cloneNode(true)); });
          guard++;
        }
        tl.to(lane, { y: -travel, ease: "none" }, 0);
      });
      return function () { gsap.set(lanes, { clearProps: "transform" }); };
    });
  }

  /* ---------- Why choose: earlier cards recede as the next one stacks ---------- */
  mm.add("(min-width: 992px)", function () {
    var whyCards = gsap.utils.toArray("[data-why-card]");
    whyCards.forEach(function (card, i) {
      var nextCard = whyCards[i + 1];
      if (!nextCard) return;
      gsap.to(card, {
        scale: 0.94, autoAlpha: 0.4, ease: "none",
        scrollTrigger: { trigger: nextCard, start: "top bottom", end: "top top+=120", scrub: 1 }
      });
    });
  });

  /* ---------- Use cases: pin and switch state halfway through ---------- */
  mm.add("(min-width: 992px)", function () {
    if (!usecases) return;
    ScrollTrigger.create({
      trigger: usecases,
      start: "top top",
      end: "+=100%",
      pin: usecases.querySelector("[data-usecases-pin]"),
      onUpdate: function (self) { setUsecase(self.progress > 0.5 ? 1 : 0); }
    });
  });

  /* ---------- Stats: count up from 0 (Figma note 7655:9314) ---------- */
  gsap.utils.toArray("[data-count]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var counter = { value: 0 };
    el.textContent = "0" + suffix;
    gsap.to(counter, {
      value: target, duration: 1.8, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
      onUpdate: function () { el.textContent = Math.round(counter.value) + suffix; }
    });
  });

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
