/* ==========================================================================
   Text reveals — same classes, timings and eases as the Webflow site's
   page footer code (Home → Page Settings → Before </body>), so markup ports 1:1.
     .fade-in / .fade-in-down   – element fades up (or down) into place
     .reveal-chars              – characters rise and fade in
     .reveal-lines              – lines rise and fade in
     .reveal-line-fade          – each line rises while its characters fade in
     .reveal-cascade            – characters cascade line by line
     .delay-0.2s                – combo class: start delay in seconds
     data-reveal-load           – play on load instead of on scroll
   Webflow uses GSAP's SplitText; this build uses the small splitter below,
   which gives the same lines/words/chars arrays.
   ========================================================================== */
(function () {
  "use strict";

  var SELECTOR = ".fade-in,.fade-in-down,.reveal-line-fade,.reveal-chars,.reveal-lines,.reveal-cascade";
  var root = document.documentElement;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.gsap || !window.ScrollTrigger) {
    root.classList.add("reveal-failsafe");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  var EASE = "expo.out";
  var START = "90%";

  function getDelay(el) {
    for (var i = 0; i < el.classList.length; i++) {
      var m = el.classList[i].match(/^delay-(\d+)(?:[.-](\d+))?s?$/);
      if (m) return parseFloat(m[1] + "." + (m[2] || "0"));
    }
    return parseFloat(el.dataset.delay) || 0;
  }

  /* Wraps every word (rv-word) and character (rv-char) in place, keeping inline
     elements such as coloured spans and <br>, then groups words into lines by top offset. */
  function split(el) {
    var original = el.innerHTML;
    var words = [], chars = [];
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var word = document.createElement("span");
            word.className = "rv-word";
            Array.from(part).forEach(function (c) {
              var ch = document.createElement("span");
              ch.className = "rv-char";
              ch.textContent = c;
              word.appendChild(ch);
              chars.push(ch);
            });
            words.push(word);
            frag.appendChild(word);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          walk(child);
        }
      });
    }
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    walk(el);
    var lines = [], top = null;
    words.forEach(function (w) {
      var t = Math.round(w.offsetTop);
      if (top === null || Math.abs(t - top) > 2) { lines.push([]); top = t; }
      lines[lines.length - 1].push(w);
    });
    return {
      words: words, chars: chars, lines: lines,
      revert: function () { el.innerHTML = original; el.removeAttribute("aria-label"); }
    };
  }
  function charsIn(line) {
    return line.reduce(function (all, w) { return all.concat(Array.prototype.slice.call(w.children)); }, []);
  }

  var done = [], lastW = window.innerWidth;
  window.addEventListener("resize", function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    done.forEach(function (s) { s.revert(); });
    done = [];
  });

  function run(el, tl, s) {
    tl.delay(getDelay(el)).pause();
    if (s) tl.eventCallback("onComplete", function () { done.push(s); });
    gsap.set(el, { visibility: "visible" });
    if (el.hasAttribute("data-reveal-load")) return tl.play();
    var st;
    function play() { tl.play(); if (st) { st.kill(); st = null; } }
    st = ScrollTrigger.create({
      trigger: el,
      start: "top " + (el.dataset.start || START),
      end: "max",
      onEnter: play,
      onRefresh: function (self) { if (self.scroll() >= self.start) play(); }
    });
    if (st && st.scroll() >= st.start) play();
  }

  var builders = {
    "fade-in-down": function (el) {
      run(el, gsap.timeline().fromTo(el, { y: -4, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power2.out" }));
    },
    "fade-in": function (el) {
      run(el, gsap.timeline().fromTo(el, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power2.out" }));
    },
    "reveal-line-fade": function (el) {
      var s = split(el), tl = gsap.timeline();
      s.lines.forEach(function (line, i) {
        var at = i * 0.1;
        tl.from(line, { yPercent: 80, opacity: 0, duration: 1.6, ease: EASE }, at);
        tl.from(charsIn(line), { opacity: 0, duration: 0.56, stagger: 0.02, ease: EASE }, at);
      });
      run(el, tl, s);
    },
    "reveal-chars": function (el) {
      var s = split(el), tl = gsap.timeline();
      tl.from(s.chars, { yPercent: 45, opacity: 0, duration: 1.6, stagger: 0.025, ease: EASE });
      run(el, tl, s);
    },
    "reveal-lines": function (el) {
      var s = split(el), tl = gsap.timeline();
      s.lines.forEach(function (line, i) {
        tl.from(line, { yPercent: 100, duration: 1.6, ease: EASE }, i * 0.06);
        tl.from(line, { opacity: 0, duration: 1.2, ease: "power1.inOut" }, i * 0.06);
      });
      run(el, tl, s);
    },
    "reveal-cascade": function (el) {
      var s = split(el), tl = gsap.timeline();
      s.lines.forEach(function (line, i) {
        tl.from(charsIn(line), { yPercent: 45, opacity: 0, duration: 1.6, stagger: 0.025, ease: EASE }, i * 0.1);
      });
      run(el, tl, s);
    }
  };

  function init() {
    Object.keys(builders).forEach(function (cls) {
      document.querySelectorAll("." + cls).forEach(function (el) {
        if (el._rv) return;
        el._rv = 1;
        builders[cls](el);
      });
    });
    var t;
    new ResizeObserver(function () { clearTimeout(t); t = setTimeout(function () { ScrollTrigger.refresh(); }, 150); }).observe(document.body);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
  else window.addEventListener("load", init);
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });

  /* Failsafe: never leave text hidden if something above throws */
  setTimeout(function () {
    document.querySelectorAll(SELECTOR).forEach(function (el) { if (!el._rv) root.classList.add("reveal-failsafe"); });
  }, 4000);
})();
