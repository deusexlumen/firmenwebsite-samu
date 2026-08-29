(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Effekt-Budget (Sicherheitsnetz): grobe Erkennung schwacher Geräte —
     Touch-Pointer, <= 4 Kerne oder <= 4 GB RAM. Im reduzierten Modus bleiben
     Inhalte und Optik identisch, nur die Deko wird gedrosselt: halbe
     Funkenrate, keine Aura-Drift-Tweens, kein Magnetic/Tilt. */
  var lowBudget = window.matchMedia("(pointer: coarse)").matches ||
    (navigator.hardwareConcurrency || 8) <= 4 ||
    (navigator.deviceMemory || 8) <= 4;

  /* ---------- Year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  var header = document.getElementById("header");
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  if (navToggle && header) {
    navToggle.addEventListener("click", function () {
      var open = header.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    });
  }

  if (navLinks && header && navToggle) {
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        header.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Menü öffnen");
      });
    });
  }

  /* ESC schließt das geöffnete Mobil-Menü und gibt den Fokus an den Toggle
     zurück, statt ihn mitten im zugeklappten Menü zu verlieren. */
  if (header && navToggle) {
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("open")) {
        header.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Menü öffnen");
        navToggle.focus();
      }
    });
  }

  /* ---------- Scroll choreography (GSAP + ScrollTrigger, self-hosted) ----------
     All scroll-driven motion lives here: progress bar, sticky header, hero
     parallax, section reveals and the Ablauf seam. Initial states come from
     GSAP from-tweens, so the CSS default is "visible": without JS or with
     prefers-reduced-motion the page is complete and static. ScrollTrigger is
     position-based, so an anchor jump cannot strand elements invisible — the
     flaw that ruled out IntersectionObserver for reveals.

     Die Unterseiten (impressum/datenschutz) laden script.js ohne GSAP — dort
     wird dieser ganze Block übersprungen (Jahr, Mobil-Nav und der Observer
     weiter unten laufen überall). Der Blockkörper bleibt bewusst auf dem
     alten Einrück-Level, damit der Guard ein Zwei-Zeilen-Diff bleibt. */
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var marqueeBand = null;
  var marqueeManualPause = false;

  if (hasGsap) {

  var progress = document.getElementById("progress");
  var heroMedia = document.getElementById("heroMedia");

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Die Seite trägt ihre Beschichtung auf ----------
     Oben steht der verwitterte Zustand: warme, stumpfe Töne, und der Akzent
     ist noch kein Markenblau, sondern das tote Graubraun einer ausgewaschenen
     Betonpfanne. Nach unten hin kippt jeder Token in den beschichteten
     Zustand — tiefes Anthrazit, und das Blau der frischen Beschichtung
     leuchtet. Wer die Seite herunterliest, sieht dieselbe Verwandlung, für
     die er den Betrieb zahlt.

     Der beschichtete Satz sind exakt die Werte aus dem :root-Block, damit
     ohne JS und bei reduzierter Bewegung der Endzustand gilt. */
  var WEATHERED = {
    ground: "#131110",
    panel: "#1c1815",
    "panel-2": "#231d18",
    line: "#2a231c",
    "line-bright": "#3a3129",
    text: "#d6cfc4",
    "text-muted": "#9c9184",
    "text-dim": "#8a8074",
    /* Helleres Kalkbraun als früher (#7e7367): auf diesem Wert steht der
       Hero-CTA beim Laden, und mit der dunklen --on-spark-Schrift brauchte er
       ~4,5:1 Kontrast. Die Interpolation zum Markenblau bleibt unberührt. */
    spark: "#8a7f71",
    "spark-bright": "#a2988a",
    "spark-deep": "#4a4239",
    /* Abgedimmtes Moosgrün für den Start: die WhatsApp-Callbar soll die noch
       unbeschichtete Primäraktion oben nicht überstrahlen. */
    wa: "#4a5545"
  };

  var COATED = {
    ground: "#07090c",
    panel: "#0e1318",
    "panel-2": "#121820",
    line: "#1d252e",
    "line-bright": "#2b3641",
    text: "#e6ecf2",
    "text-muted": "#8b98a6",
    "text-dim": "#79838f",
    spark: "#2b7de1",
    "spark-bright": "#6fb3ff",
    "spark-deep": "#123f78",
    wa: "#0d7d3f"
  };

  if (!reduceMotion) {
    var root = document.documentElement;
    var ramp = {};
    Object.keys(COATED).forEach(function (token) {
      ramp[token] = gsap.utils.interpolate(WEATHERED[token], COATED[token]);
    });

    /* Die Beschichtung ist nach zwei Dritteln der Seite fertig — der
       Kontakt-Bereich soll voll durchgezeichnet sein, nicht halbtot. */
    /* Nur bei Stufenwechsel schreiben: jeder coat()-Lauf setzt 14 Custom
       Properties auf :root und rechnet damit die Stile des ganzen Dokuments
       neu. 24 quantisierte Stufen sind fluessig genug und deckeln die
       dokumentweiten Neuberechnungen auf ~24 pro voller Fahrt. */
    var COAT_STEPS = 24;
    var lastCoatStep = -1;
    var coat = function (progress) {
      var p = gsap.utils.clamp(0, 1, progress / 0.66);
      var step = Math.round(p * COAT_STEPS);
      if (step === lastCoatStep) return;
      lastCoatStep = step;
      Object.keys(ramp).forEach(function (token) {
        root.style.setProperty("--" + token, ramp[token](p));
      });
      root.style.setProperty("--spark-glow", "rgba(43, 125, 225, " + (0.08 + p * 0.27).toFixed(3) + ")");
    };

    ScrollTrigger.create({
      start: 0,
      end: "max",
      scrub: 0.5,
      onUpdate: function (self) { coat(self.progress); },
      /* onUpdate feuert erst bei der ersten Scroll-Bewegung. Ohne diesen
         Anfangsanstrich stuende die Seite oben schon fertig beschichtet da
         und die ganze Verwandlung fiele aus. */
      onRefresh: function (self) { coat(self.progress); }
    });

    coat(0);
  }

  /* Functional mappings, tied directly to the scroll position — they stay
     active for reduced-motion users too (no autonomous motion). */
  if (progress) {
    gsap.fromTo(progress, { scaleX: 0 }, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 }
    });
  }

  if (header) {
    ScrollTrigger.create({
      start: 30,
      end: "max",
      toggleClass: { targets: header, className: "stuck" }
    });
  }

  /* Decorative motion only runs when the user has not asked for reduced
     motion; gsap.matchMedia reverts everything if the preference changes. */
  var mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", function () {

    /* ----- Hero entrance -----
       Die Zeilen steigen aus ihrem Maskenfenster, und danach laeuft die
       Beschichtungsfront ueber die Chromzeilen: stumpfes Kalkgrau vorn, Metall
       dahinter, harte Kante dazwischen. Der Auftritt der Seite ist derselbe
       Vorgang, den der Betrieb verkauft — deshalb bekommt er die Hauptrolle
       und alles andere haelt sich zurueck. */
    /* Maske nur fuers Reinrutschen noetig, deshalb erst hier gesetzt und nach
       der Animation wieder entfernt — sonst schneidet overflow:hidden den
       Glow von .accent hart am Rand ab und es erscheint ein sichtbarer
       Kasten um "Stark.". */
    gsap.set(".hero h1 .line", { overflow: "hidden" });

    var heroTl = gsap.timeline({ defaults: { ease: "expo.out" } });
    heroTl
      .from(".hero .label", { y: 22, autoAlpha: 0, duration: 1.05 }, 0.15)
      .from(".hero h1 .line > span", { yPercent: 118, duration: 1.35, stagger: 0.14 }, 0.25)
      .set(".hero h1 .line", { overflow: "visible" })
      .fromTo(".hero h1 .line > span.metal",
        { "--coat": "0%" },
        { "--coat": "100%", duration: 1.55, ease: "power2.inOut", stagger: 0.18 },
        0.85)
      .from(".hero-lead", { y: 26, autoAlpha: 0, duration: 1.1 }, "-=0.8")
      .from(".hero-actions", { y: 26, autoAlpha: 0, duration: 1.1 }, "-=0.9")
      /* Sascha tritt zuletzt und von rechts ins Bild — er kommentiert die
         Zeilen, statt sie anzukuendigen. */
      .from(".hero-figure-wrap", { x: 70, autoAlpha: 0, duration: 1.3 }, "-=1.1")
      .from(".scroll-cue", { autoAlpha: 0, duration: 0.8 }, "-=0.4");

    /* Der Marker-Strich unter "Stark." wird wie mit dem Filzstift nachgezogen,
       sobald die Beschichtungsfront durch ist. CSS-Default ist der fertige
       Strich — ohne JS oder bei reduzierter Bewegung steht er einfach da. */
    var marker = document.querySelector(".hero h1 .accent .stroke path");
    if (marker) {
      var markerLen = marker.getTotalLength();
      marker.style.strokeDasharray = String(markerLen);
      heroTl.fromTo(marker,
        { strokeDashoffset: markerLen },
        { strokeDashoffset: 0, duration: 0.85, ease: "power2.inOut" }, "-=0.55");
    }

    /* ----- Hero scroll-out: the medium sinks, the content lifts away -----
       fromTo, so the scrub never records a mid-entrance value as its start. */
    if (heroMedia) {
      gsap.fromTo(heroMedia, { yPercent: 0 }, {
        yPercent: 16,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }

    gsap.fromTo(".hero-inner", { y: 0, autoAlpha: 1 }, {
      y: -70,
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "70% top", scrub: true }
    });

    /* Der Freisteller sinkt langsamer als der Text und schneller als das
       Hintergrundfoto — drei Tempi, drei Ebenen, eine Tiefe. Der Scrub
       bewegt die ungefilterte Huelle (.hero-figure-wrap): das Bild traegt
       drop-shadow + Maske und muesste sonst pro Frame neu rastern. */
    gsap.fromTo(".hero-figure-wrap", { yPercent: 0, autoAlpha: 1 }, {
      yPercent: 9,
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    gsap.fromTo(".scroll-cue", { autoAlpha: 1 }, {
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: { start: 40, end: 220, scrub: true }
    });

    /* ----- Section reveals: quiet 24px rise with a long, soft settle
       (expo.out), honoring the existing --delay and data-reveal-dir hooks;
       gallery shots un-clip from the top. ----- */
    [].forEach.call(document.querySelectorAll("[data-reveal]"), function (el) {
      if (el.closest(".hero")) return; /* hero pieces run in the entrance timeline */

      /* Elemente, die beim Setup schon oberhalb des Viewports liegen (Anker-
         Sprung, Reload mitten auf der Seite), gar nicht erst verstecken —
         der CSS-Default ist sichtbar und bleibt es. So hinterlaesst selbst
         schnelles Durchscrollen keine schwarzen Loecher. */
      if (el.getBoundingClientRect().bottom <= 0) return;

      var delay = parseFloat(getComputedStyle(el).getPropertyValue("--delay")) / 1000 || 0;
      var dir = el.getAttribute("data-reveal-dir");
      var fromVars = { autoAlpha: 0 };
      if (dir === "left") fromVars.x = -40;
      else if (dir === "right") fromVars.x = 40;
      else fromVars.y = 24;

      var trigger = { trigger: el, start: "top 95%", once: true };

      if (el.classList.contains("shot")) {
        fromVars.clipPath = "inset(0 0 100% 0)";
        gsap.fromTo(el, fromVars, {
          autoAlpha: 1, x: 0, y: 0, clipPath: "inset(0 0 0% 0)",
          duration: 1.25, ease: "expo.out", delay: delay, scrollTrigger: trigger
        });
      } else {
        fromVars.duration = 1.15;
        fromVars.ease = "expo.out";
        fromVars.delay = delay;
        fromVars.scrollTrigger = trigger;
        gsap.from(el, fromVars);
      }
    });

    /* Kein SplitText auf den Metall-Woertern: die tragen ihre Verlaufs-
       flaeche ueber background-clip:text. Zerlegt man sie in Zeichen-Spans,
       erben die Kinder die transparente Schriftfarbe, haben aber selbst keinen
       Hintergrund — die Woerter verschwinden ersatzlos. Das Metallband wandert
       ohnehin schon per metalShift ueber die Schrift; ein zweiter Effekt an
       derselben Stelle waere eine Dekoration zuviel. */

    /* ----- Service strip: the band already scrolls on its own. Hanging its
       timeScale on the scroll velocity makes it surge when the visitor moves
       fast and run backwards when they scroll up — the page feels driven
       rather than played back. ----- */
    var marquee = document.querySelector(".marquee");
    if (marquee) {
      marquee.classList.add("js-marquee"); /* hands over from the CSS keyframes */

      marqueeBand = gsap.to(marquee, {
        xPercent: -50,
        duration: 38,
        ease: "none",
        repeat: -1
      });

      var direction = 1;

      /* Einmal erzeugt, danach setzt der Scroll-Handler nur noch den Zielwert —
         keine Timeline-Allokation pro Scroll-Frame mehr. Der pausierte
         delayedCall faengt das Ende der Fahrt ab und laesst das Band auf
         Schritttempo ausklingen (restart allokiert nichts). */
      var marqueeSpeed = gsap.quickTo(marqueeBand, "timeScale", { duration: 0.45, ease: "power2.out" });
      var marqueeSettle = gsap.delayedCall(0.5, function () { marqueeSpeed(direction); }).pause();

      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: function (self) {
          if (marqueeManualPause) return;
          var v = self.getVelocity();
          if (v > 0 && direction !== 1) direction = 1;
          else if (v < 0 && direction !== -1) direction = -1;

          /* Surge with the scroll, dann sanft ausklingend, damit das Band
             traeg wirkt statt nervoes. */
          marqueeSpeed(direction * (1 + Math.abs(v) / 1400));
          marqueeSettle.restart(true);
        }
      });

      var strip = document.querySelector(".strip");
      if (strip) {
        /* Hover-Pause greift nur, solange der Besucher nicht über den
           Pause-Button selbst angehalten hat. */
        strip.addEventListener("mouseenter", function () { if (!marqueeManualPause) marqueeBand.pause(); });
        strip.addEventListener("mouseleave", function () { if (!marqueeManualPause) marqueeBand.play(); });
      }
    }

    /* ----- Hintergrund-Aura: drei Flecke, drei Tempi -----
       Die Leuchtflecke driften gegenlaeufig zum Scroll und schweben zusaetzlich
       ganz sacht hin und her — die Flaeche hinter der Seite lebt, ohne je vor
       den Inhalt zu treten (z-index -1, kein Filter, nur Gradients).
       Im reduzierten Effekt-Budget bleiben die Flecke statisch sichtbar. */
    var aura = document.querySelector(".bg-aura");
    if (aura && !lowBudget) {
      var drift = [-6, 9, -12];
      [].forEach.call(aura.querySelectorAll("i"), function (blob, i) {
        var d = drift[i % drift.length];
        gsap.fromTo(blob, { yPercent: d }, {
          yPercent: -d,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 1.2 }
        });
        gsap.to(blob, {
          x: (i - 1) * 26,
          duration: 7 + i * 2.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        });
      });
    }
  });

  /* Einmal neu vermessen, nachdem alle Scrubs und Reveals oben registriert
     sind — so laufen die Trigger auf finalen statt auf veralteten Positionen. */
  ScrollTrigger.refresh();

  /* ---------- Ablauf: the weld runs while the section is held ----------
     On a wide screen the five stations are pinned and the seam is laid across
     them as the visitor scrolls — the process is performed rather than listed.
     On narrow screens pinning fights the small viewport, so the seams weld in
     on arrival instead — weld tip and spark pool travel along in both layouts.
     Both paths end in the same finished state, and with reduced motion the CSS
     default already shows every seam complete. */
  var stepsMedia = gsap.matchMedia();

  stepsMedia.add({
    wide: "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
    narrow: "(max-width: 899px) and (prefers-reduced-motion: no-preference)"
  }, function (context) {
    var steps = gsap.utils.toArray(".step");
    if (!steps.length) return;

    var weld = function (step) { step.classList.add("welded"); };
    var unweld = function (step) { step.classList.remove("welded"); };
    var stepsEl = document.querySelector(".steps");

    /* Stations-Geometrie einmal messen und bei jedem Refresh neu — im
       Tween-onUpdate waeren offsetLeft/offsetTop/offsetWidth pro Frame
       Layout-Lesezugriffe. */
    var stepGeo = [];
    var measureSteps = function () {
      stepGeo = steps.map(function (step) {
        return { left: step.offsetLeft, top: step.offsetTop, width: step.offsetWidth };
      });
    };
    measureSteps();
    ScrollTrigger.addEventListener("refresh", measureSteps);

    /* Schweißpunkt + Lichtwurf + Funken-Pool: Deko-Ebene, existiert nur solange
       die Bedingungen greifen (Cleanup entfernt alles wieder). Teilen sich Wide
       und Narrow — auf dem Handy schweißt die Naht beim Reinscrollen genauso
       sichtbar wie am Desktop beim Scrubben. */
    var tip = document.createElement("span");
    tip.className = "weld-tip";
    tip.setAttribute("aria-hidden", "true");
    tip.appendChild(document.createElement("b"));
    stepsEl.appendChild(tip);
    var glow = document.createElement("span");
    glow.className = "weld-glow";
    glow.setAttribute("aria-hidden", "true");
    stepsEl.appendChild(glow);
    var sparkBox = document.createElement("span");
    sparkBox.className = "weld-sparks";
    sparkBox.setAttribute("aria-hidden", "true");
    stepsEl.appendChild(sparkBox);

    var allSparks = [];
    var pool = [];
    var si;
    for (si = 0; si < 26; si++) {
      var sp = document.createElement("i");
      sparkBox.appendChild(sp);
      allSparks.push(sp);
      pool.push(sp);
    }
    gsap.set(tip, { xPercent: -50, yPercent: -50 });
    gsap.set(glow, { xPercent: -50, yPercent: -50 });

    /* Der Lichtkern flackert wie ein Lichtbogen — aber nur, solange der
       Schweißpunkt sichtbar ist (showTip/hideTip koppeln den Flicker-Tween);
       aufgeraeumt wird er mit der Ebene. */
    var flicker = gsap.to(tip.firstChild, {
      scale: 1.16,
      opacity: 0.76,
      duration: 0.07,
      ease: "none",
      repeat: -1,
      yoyo: true,
      repeatRefresh: true,
      paused: true
    });

    var showTip = function () {
      flicker.play();
      gsap.to([tip, glow], { opacity: 1, duration: 0.2, overwrite: true });
    };
    var hideTip = function () {
      flicker.pause();
      gsap.to([tip, glow], { opacity: 0, duration: 0.3, overwrite: true });
    };
    var moveTip = function (x, y) {
      gsap.set(tip, { x: x, y: y });
      gsap.set(glow, { x: x, y: y });
    };

    /* Zeitdeckel statt ungedrosselt Funken pro Tween-Frame: maximal ein
       Funke alle 40 ms (reduziertes Effekt-Budget: 80 ms), der Zeitstempel
       des letzten Spawns wird gemerkt. */
    var lastSpark = 0;
    var sparkGap = lowBudget ? 80 : 40;

    /* Funken fliegen in einem Kegel nach oben, Gravitation zieht sie runter.
       Gut ein Drittel sind laengliche Tracer, entlang der Flugrichtung gedreht —
       das liest sich als Spritzer, nicht als Konfetti. */
    var spawnSpark = function (x, y, power) {
      var now = performance.now();
      if (now - lastSpark < sparkGap) return;
      lastSpark = now;
      if (!pool.length) return;
      var s = pool.pop();
      var ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      var dist = 24 + Math.random() * 62 * power;
      var tracer = Math.random() < 0.35;
      var base = 0.7 + Math.random() * 0.9;
      gsap.set(s, {
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 4,
        opacity: 1,
        rotation: tracer ? ang * 180 / Math.PI + 90 : 0,
        scaleX: tracer ? base * 2.6 : base,
        scaleY: base
      });
      gsap.to(s, {
        x: x + Math.cos(ang) * dist,
        y: y + Math.sin(ang) * dist + 34,
        opacity: 0,
        duration: 0.45 + Math.random() * 0.45,
        ease: "power1.in",
        overwrite: true,
        onComplete: function () {
          /* Zurueck auf (0,0), sonst bläht der Pool die Scrollbreite auf */
          gsap.set(s, { x: 0, y: 0 });
          pool.push(s);
        }
      });
    };

    var destroyDeco = function () {
      steps.forEach(unweld);
      ScrollTrigger.removeEventListener("refresh", measureSteps);
      flicker.kill();
      gsap.killTweensOf(allSparks);
      gsap.killTweensOf(tip);
      gsap.killTweensOf(glow);
      tip.remove();
      glow.remove();
      sparkBox.remove();
    };

    if (context.conditions.wide) {
      var velocity = 0;
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".steps",
          start: "center center",
          end: "+=" + (steps.length * 260),
          pin: true,
          /* Langes Nachschmieren (scrub 1): die Naht folgt dem Scroll wie
             geschmolzenes Metall — träge, nicht nervös. */
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) { velocity = self.getVelocity(); }
        }
      });

      steps.forEach(function (step, idx) {
        var seam = step.querySelector(".seam");
        if (!seam) return;
        tl.fromTo(seam, { scaleX: 0 }, {
          scaleX: 1,
          duration: 1,
          ease: "power2.inOut",
          onStart: showTip,
          onUpdate: function () {
            /* Schweißpunkt sitzt auf der Nahtfront; Grundrate an Funken,
               solange geschweißt wird — Scroll-Tempo legt Anzahl und
               Wurfweite nur obendrauf. Geometrie aus dem Refresh-Cache. */
            var g = stepGeo[idx];
            var x = g.left + g.width * this.progress();
            var y = g.top - 1;
            moveTip(x, y);
            var v = Math.abs(velocity);
            var n = 2 + Math.min(3, Math.round(v / 700));
            var power = 0.75 + Math.min(1.5, v / 1600);
            for (var k = 0; k < n; k++) spawnSpark(x, y, power);
          },
          onComplete: function () {
            weld(step);
            hideTip(); /* Elektrode hebt zwischen zwei Stationen ab */
          },
          onReverseComplete: function () {
            unweld(step);
            hideTip();
          }
        }).fromTo(step, { y: 14, autoAlpha: 0.45 }, { y: 0, autoAlpha: 1, duration: 1 }, "<");
        /* kurze Atempause: die Elektrode setzt an der naechsten Station neu an */
        if (idx < steps.length - 1) tl.to({}, { duration: 0.3 });
      });

      return destroyDeco;
    }

    /* Narrow: kein Pinning (kaempft mit dem kleinen Viewport), die Naehte
       schweissen beim Reinscrollen einmal nacheinander — mit Schweißpunkt und
       Funken, damit der Moment auch auf dem Handy ankommt. */
    steps.forEach(function (step, i) {
      var seam = step.querySelector(".seam");
      if (!seam) return;
      gsap.fromTo(seam, { scaleX: 0 }, {
        scaleX: 1,
        duration: 1.05,
        ease: "power2.inOut",
        delay: i * 0.4,
        scrollTrigger: { trigger: ".steps", start: "top 80%", once: true },
        onStart: showTip,
        onUpdate: function () {
          var g = stepGeo[i];
          var x = g.left + g.width * this.progress();
          var y = g.top - 1;
          moveTip(x, y);
          spawnSpark(x, y, 0.9);
          spawnSpark(x, y, 0.7);
        },
        onComplete: function () {
          weld(step);
          hideTip();
        }
      });
    });

    return destroyDeco;
  });

  /* ---------- Panel-Kanten: die Schraegkante wird beim Reinscrollen eingeschweisst ----------
     Dieselbe Bildsprache wie die Ablauf-Naht (Bead, Schweißpunkt, Lichtwurf,
     Funken), aber am Gehaeuse der Seite: das Panel wird festgeschweißt,
     waehrend der Besucher hineinfaehrt — rueckwaerts loest sich die Naht
     wieder. Der Bead liegt IM Panel (3 px unter der Clip-Kante, per CSS
     rotiert auf die Schraegung); Schweißpunkt, Glow und Funken dagegen auf
     Dokument-Ebene, weil der clip-path des Panels sie sonst an der Kante
     abschneiden wuerde — derselbe Fail-Modus wie overflow:hidden bei den
     Ablauf-Funken. CSS-Default ist die fertige Naht. */
  var seamMedia = gsap.matchMedia();

  seamMedia.add("(prefers-reduced-motion: no-preference)", function () {
    var seams = gsap.utils.toArray(".panel-seam");
    if (!seams.length) return;

    var teardowns = [];

    seams.forEach(function (seam) {
      var bead = seam.querySelector(".bead");
      var host = seam.parentNode;
      if (!bead || !host) return;

      /* Steigung der Kante aus der CSS-Variablen (0.026, unter 860px 0.034) —
         so bleibt die Bahn des Schweißpunkts exakt auf der rotierten Naht. */
      var slope = parseFloat(getComputedStyle(seam).getPropertyValue("--seam-slope")) || 0;

      var tip = document.createElement("span");
      tip.className = "weld-tip";
      tip.setAttribute("aria-hidden", "true");
      tip.appendChild(document.createElement("b"));
      var glow = document.createElement("span");
      glow.className = "weld-glow";
      glow.setAttribute("aria-hidden", "true");
      var sparkBox = document.createElement("span");
      sparkBox.className = "weld-sparks";
      sparkBox.setAttribute("aria-hidden", "true");
      document.body.appendChild(tip);
      document.body.appendChild(glow);
      document.body.appendChild(sparkBox);

      var allSparks = [];
      var pool = [];
      var i;
      for (i = 0; i < 12; i++) {
        var sp = document.createElement("i");
        sparkBox.appendChild(sp);
        allSparks.push(sp);
        pool.push(sp);
      }
      gsap.set(tip, { xPercent: -50, yPercent: -50 });
      gsap.set(glow, { xPercent: -50, yPercent: -50 });

      /* Flackert nur, solange der Schweißpunkt auf dieser Kante aktiv ist
         (play/pause im tipOn-Wechsel unten). */
      var flicker = gsap.to(tip.firstChild, {
        scale: 1.16, opacity: 0.76, duration: 0.07,
        ease: "none", repeat: -1, yoyo: true, repeatRefresh: true,
        paused: true
      });

      /* Kegel nach oben (Dokument-Koordinaten), wie im Ablauf — nur kleiner
         Pool und weniger Funken, die Kante ist Beiprogramm, nicht Hauptakt. */
      var spawnSpark = function (x, y, power) {
        if (!pool.length) return;
        var s = pool.pop();
        var ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
        var dist = 18 + Math.random() * 48 * power;
        var base = 0.6 + Math.random() * 0.8;
        gsap.set(s, { x: x, y: y, opacity: 1, rotation: 0, scaleX: base, scaleY: base });
        gsap.to(s, {
          x: x + Math.cos(ang) * dist,
          y: y + Math.sin(ang) * dist + 28,
          opacity: 0,
          duration: 0.4 + Math.random() * 0.4,
          ease: "power1.in",
          overwrite: true,
          /* Zurueck an den Ursprung im Pool: gelandete (unsichtbare) Funken
             wuerden sonst mit ihren Endkoordinaten den scrollWidth aufblaehen. */
          onComplete: function () { gsap.set(s, { x: 0, y: 0 }); pool.push(s); }
        });
      };

      var tipOn = null;
      var lastX = -1;

      /* Geometrie nur beim Refresh messen (in Dokument-Koordinaten) — im
         onUpdate-Frame waere getBoundingClientRect() ein Layout-Lesezugriff
         pro Frame. Die Schweissphase (host-Top von 96 % auf 18 %) laeuft,
         bevor ein Panel gepinnt wird; in normalem Fluss ist die Dokument-
         Position zwischen zwei Refreshes stabil. */
      var hostX = 0, hostY = 0, hostW = 0, seamTop = 0;
      var measure = function () {
        var rect = host.getBoundingClientRect();
        hostX = rect.left + window.pageXOffset;
        hostY = rect.top + window.pageYOffset;
        hostW = host.offsetWidth;
        seamTop = seam.offsetTop;
      };
      measure();

      var tween = gsap.fromTo(bead, { scaleX: 0 }, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: host,
          start: "top 96%",
          end: "top 18%",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onRefresh: measure
        },
        onUpdate: function () {
          var p = this.progress();
          var xLocal = p * hostW;
          var yLocal = seamTop - xLocal * slope;
          /* Panel-Punkt → Dokument-Koordinaten (Refresh-Cache): so folgen
             Punkt und Funken der Kante ohne Layout-Lesezugriff pro Frame. */
          var x = hostX + xLocal;
          var y = hostY + yLocal;

          var active = p > 0.001 && p < 0.999;
          if (active !== tipOn) {
            tipOn = active;
            if (active) flicker.play(); else flicker.pause();
            gsap.to([tip, glow], { opacity: active ? 1 : 0, duration: active ? 0.2 : 0.3, overwrite: true });
          }
          gsap.set(tip, { x: x, y: y });
          gsap.set(glow, { x: x, y: y });

          if (active && Math.abs(x - lastX) > 8) {
            lastX = x;
            spawnSpark(x, y, 0.9);
            if (Math.random() < 0.5) spawnSpark(x, y, 0.7);
          }
        }
      });

      teardowns.push(function () {
        tween.scrollTrigger && tween.scrollTrigger.kill();
        tween.kill();
        flicker.kill();
        gsap.killTweensOf(allSparks);
        gsap.killTweensOf([tip, glow]);
        gsap.set(bead, { clearProps: "all" });
        tip.remove();
        glow.remove();
        sparkBox.remove();
      });
    });

    return function () {
      teardowns.forEach(function (fn) { fn(); });
    };
  });

  /* ---------- Signatur: zeichnet sich einmal selbst, wenn das Zitat kommt ----------
     Die Unterschrift ist ein Outline-SVG; die Maske #sigDraw enthaelt die aus der
     Outline berechneten Mittellinien (site/build_sig_mask.py). Jeder Strich zieht
     die Tinte per stroke-dashoffset entlang des echten Schreibzugs — Strich fuer
     Strich, leicht ueberlappt, in gleichmaessigem Federtempo aus der Gesamtlaenge.
     CSS-Default ist die komplette Unterschrift; die Maske haengt erst per JS,
     Reduced-Motion und No-JS sehen alles sofort. */
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", function () {
    var sig = document.querySelector(".sig");
    var ink = sig && sig.querySelector(".sig-ink");
    var strokes = sig ? sig.querySelectorAll(".sig-stroke") : null;
    if (!ink || !strokes || !strokes.length) return;

    /* Erst alle Striche "abziehen", dann die Maske anhaengen — umgekehrt
       bluept die komplette Unterschrift fuer einen Frame auf. */
    var lengths = [];
    var total = 0;
    [].forEach.call(strokes, function (p) {
      var len = p.getTotalLength();
      lengths.push(len);
      total += len;
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = String(len);
    });

    ink.setAttribute("mask", "url(#sigDraw)");

    var speed = total / 3.4; /* ein handschriftlicher Zug, keine Eile */
    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: ".quote", start: "top 78%", once: true }
    });
    [].forEach.call(strokes, function (p, i) {
      tl.to(p, { strokeDashoffset: 0, duration: Math.max(0.1, lengths[i] / speed) },
        i === 0 ? 0 : ">-0.05");
    });

    return function () {
      ink.removeAttribute("mask");
      [].forEach.call(strokes, function (p) {
        p.style.strokeDasharray = "";
        p.style.strokeDashoffset = "";
      });
    };
  });

  /* ---------- Karten-Tilt (nur Desktop-Maus, keine Reduced Motion) ----------
     Reine Ambient-Feedback-Ebene: die Karten neigen sich wenige Grad zum
     Cursor (Tiefe statt Fläche). Touch-Geräte, Tastatur, Reduced-Motion und
     das reduzierte Effekt-Budget bekommen davon nichts. Der fruehere
     Custom-Cursor ist komplett entfernt (Jank) — der native Zeiger bleibt
     ueberall der einzige Zeiger. */
  var fineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (fineHover && !reduceMotion && !lowBudget) {

    /* Karten-Tilt: CSS-Transition auf transform würde die GSAP-Werte
       verschleppen — .js-tilt nimmt sie raus (siehe styles.css).
       mousemove merkt nur die Position; angewendet wird einmal pro Frame
       per rAF, das Rect wird bei mouseenter gecacht statt pro Event. */
    [].forEach.call(document.querySelectorAll(".service, .contact-card"), function (el) {
      el.classList.add("js-tilt");
      gsap.set(el, { transformPerspective: 750 });
      var tiltX = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" });
      var tiltY = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" });
      var rect = null, px = 0, py = 0, queued = false;
      el.addEventListener("mouseenter", function () { rect = el.getBoundingClientRect(); });
      el.addEventListener("mousemove", function (e) {
        px = e.clientX; py = e.clientY;
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () {
          queued = false;
          if (!rect) return;
          tiltY(((px - rect.left) / rect.width - 0.5) * 7);
          tiltX(((py - rect.top) / rect.height - 0.5) * -7);
        });
      });
      el.addEventListener("mouseleave", function () { rect = null; tiltX(0); tiltY(0); });
    });
  }

  } /* end hasGsap — ab hier läuft alles auch auf den GSAP-losen Unterseiten */

  /* ---------- Marquee-Pause-Button ----------
     Das Band läuft unendlich neben dem restlichen Inhalt, also braucht es
     einen per Tastatur erreichbaren Stopp (reines Hover-Pausieren reicht
     nicht). Ohne GSAP stoppt die Klasse .paused die CSS-Animation. */
  var marqueePause = document.getElementById("marqueePause");
  if (marqueePause) {
    marqueePause.addEventListener("click", function () {
      marqueeManualPause = marqueePause.getAttribute("aria-pressed") !== "true";
      marqueePause.setAttribute("aria-pressed", String(marqueeManualPause));
      marqueePause.textContent = marqueeManualPause ? "Weiter" : "Pause";
      var strip = marqueePause.closest(".strip");
      if (strip) strip.classList.toggle("paused", marqueeManualPause);
      if (marqueeBand) {
        if (marqueeManualPause) marqueeBand.pause();
        else marqueeBand.play();
      }
    });
  }

  /* ---------- Hero-Endlosanimationen pausieren, wenn unsichtbar ----------
     Kenburns, Lichtdrift und das wandernde Metallband der Ueberschrift
     laufen nur, solange der Hero im Viewport ist — die CSS-Klasse
     .offscreen setzt animation-play-state: paused (siehe styles.css). */
  var heroSection = document.querySelector(".hero");
  if (heroSection && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      heroSection.classList.toggle("offscreen", !entries[0].isIntersecting);
    }).observe(heroSection);
  }

  /* ---------- Active nav link on scroll ---------- */
  var sections = document.querySelectorAll("main section[id]");

  if ("IntersectionObserver" in window && navLinks) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.querySelectorAll("a").forEach(function (link) {
            var isActive = link.getAttribute("href") === "#" + entry.target.id;
            link.classList.toggle("active", isActive);
            /* Die aktive Station ist sonst nur visuell (Farbe) markiert. */
            if (isActive) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { threshold: 0.35, rootMargin: "-20% 0px -55% 0px" }
    );

    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxClose = document.getElementById("lightboxClose");
  var lastFocused = null;

  var hasFlip = typeof window.gsap !== "undefined" && typeof window.Flip !== "undefined";
  if (hasFlip) gsap.registerPlugin(Flip);

  /* The thumbnail itself travels into the overlay instead of a copy fading in:
     Flip records where the picture sits in the grid, we move the real node into
     the lightbox, and Flip animates the difference. The viewer keeps track of
     which photo they opened, because it never stopped being the same photo.
     originSlot holds the thumbnail's place in the grid so it can go home. */
  var originSlot = null;

  function openLightbox(shot) {
    if (!lightbox || !shot) return;
    var img = shot.querySelector("img");
    if (!img) return;

    lastFocused = document.activeElement;

    /* Swap in the full-size file before measuring, so the flight lands sharp. */
    var full = shot.getAttribute("data-full");
    if (full && img.getAttribute("src") !== full) img.setAttribute("src", full);

    var state = hasFlip ? Flip.getState(img) : null;

    originSlot = document.createElement("span");
    originSlot.className = "shot-slot";
    img.parentNode.insertBefore(originSlot, img);

    lightbox.classList.add("open");
    lightbox.insertBefore(img, lightbox.firstChild);
    document.body.style.overflow = "hidden";

    if (state) {
      Flip.from(state, {
        duration: reduceMotion ? 0 : 0.55,
        ease: "power3.inOut",
        absolute: true
      });
    }

    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;

    var img = lightbox.querySelector("img");

    if (img && originSlot && originSlot.parentNode) {
      var state = hasFlip ? Flip.getState(img) : null;
      originSlot.parentNode.insertBefore(img, originSlot);
      originSlot.parentNode.removeChild(originSlot);
      originSlot = null;

      if (state) {
        Flip.from(state, {
          duration: reduceMotion ? 0 : 0.45,
          ease: "power3.inOut",
          absolute: true,
          onComplete: function () { lightbox.classList.remove("open"); }
        });
      } else {
        lightbox.classList.remove("open");
      }
    } else {
      lightbox.classList.remove("open");
    }

    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll(".shot").forEach(function (shot) {
    shot.addEventListener("click", function () { openLightbox(shot); });
    shot.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(shot);
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);

  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (!lightbox || !lightbox.classList.contains("open")) return;
    if (e.key === "Escape") { closeLightbox(); return; }
    /* Fokus-Trap: die Lightbox hat genau ein bedienbares Element (den
       Schließen-Button), also kreist Tab darauf, statt hinter den modalen
       Dialog auf die abgedunkelte Seite zu fallen. */
    if (e.key === "Tab" && lightboxClose) {
      e.preventDefault();
      lightboxClose.focus();
    }
  });

  /* ---------- Premium pointer interactions (desktop mice only) ----------
     Alle mousemove-Handler merken nur die Position und wenden sie einmal
     pro Frame per rAF an (letzter Stand gewinnt); das Rect wird bei
     mouseenter gecacht statt pro Event gelesen. */
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (finePointer) {
    /* Spotlight glow that trails the cursor across cards (--mx/--my in CSS) */
    [].forEach.call(document.querySelectorAll(".service, .contact-card"), function (el) {
      var rect = null, px = 0, py = 0, queued = false;
      el.addEventListener("mouseenter", function () { rect = el.getBoundingClientRect(); });
      el.addEventListener("mousemove", function (e) {
        px = e.clientX; py = e.clientY;
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () {
          queued = false;
          if (!rect) return;
          el.style.setProperty("--mx", px - rect.left + "px");
          el.style.setProperty("--my", py - rect.top + "px");
        });
      });
      el.addEventListener("mouseleave", function () { rect = null; });
    });

    if (!reduceMotion && !lowBudget) {
      /* Magnetic buttons: primary actions lean a few pixels toward the cursor */
      [].forEach.call(document.querySelectorAll(".btn-primary, .nav-phone"), function (el) {
        var rect = null, px = 0, py = 0, queued = false;
        el.classList.add("js-magnetic");
        el.addEventListener("mouseenter", function () { rect = el.getBoundingClientRect(); });
        el.addEventListener("mousemove", function (e) {
          px = e.clientX; py = e.clientY;
          if (queued) return;
          queued = true;
          requestAnimationFrame(function () {
            queued = false;
            if (!rect) return;
            var dx = (px - (rect.left + rect.width / 2)) * 0.2;
            var dy = (py - (rect.top + rect.height / 2)) * 0.2;
            dx = Math.max(-8, Math.min(8, dx));
            dy = Math.max(-8, Math.min(8, dy));
            el.style.transform = "translate(" + dx + "px," + dy + "px)";
          });
        });

        el.addEventListener("mouseleave", function () {
          rect = null;
          el.style.transform = "";
        });
      });
    }
  }
})();
