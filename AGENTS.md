# AGENTS.md — Firmenwebsite SaMu

## Projektüberblick

Statische Firmenwebsite für **Firma SaMu — Sascha Mundt** (Dachbeschichtung, Reparatur- und
Schweißarbeiten, Hausmeisterservice, Malerarbeiten, Dachrinnenreinigung, Gartenpflege) aus
Kamen. Reines HTML/CSS/JS, **kein Framework, kein Bundler, kein Backend, kein Formular** —
die Kernaktion des Besuchers ist Anruf oder WhatsApp. Ziel-Domain: `mundt-dienstleistungen.de`
(noch nicht geschaltet). Git-Remote: `github.com/deusexlumen/firmenwebsite-samu` (Branch
`main`, Conventional Commits, kurze deutsche Messages). Es gibt bewusst keine
Manifest-Dateien (`package.json` o. ä.).

## Verzeichnisstruktur

```
site/                    → die Website (Webroot, Deploy-Quelle)
  index.html             → One-Pager (#leistungen, #ablauf, #referenzen, #ueber-uns,
                           #faq, #kontakt)
  impressum.html / datenschutz.html → Rechtsseiten
  styles.css             → komplettes Stylesheet, Design-Tokens in :root
  script.js              → alle Interaktionen (Vanilla JS, IIFE, ES5-Stil mit var)
  build_artifact.py      → Build: erzeugt artifact.html aus den Quellen (Stdlib only)
  artifact.html          → GENERIERT (~6,6 MB, self-contained), nie von Hand editieren,
                           gitignoriert (bei Bedarf lokal neu bauen)
  rebuild_gallery.py     → aktuelles Bildskript (WA-Rohfotos → gallery-1..7/hero/about.webp,
                           volle Frames aus geprüfter Auswahl, löscht nie, beliebig wiederholbar)
  prepare_images.py / optimize_images.py → KAPUTTE Einmal-Skripte, NICHT ausführen
                           (lesen gelöschte JPGs, optimize löscht Dateien; nur Beleg)
  vectorize_signature.py → Werkzeug (Raster → Mittellinien-SVG), aktuell nicht im Einsatz;
                           Lauf vom Projektroot: `python site/vectorize_signature.py`
  build_sig_mask.py      → erzeugt aus signature-outline.svg die Mittellinien-Maske
                           (signature-mask.svg) für den Signatur-Self-Draw; nach Masken-
                           Änderung die .sig-stroke-Pfade in den SIG-Block übernehmen
  signature-outline.svg  → gelieferte Outline-Vektorisierung der Unterschrift — Quelle des
                           .sig-Blocks in index.html (zwischen SIG:START/SIG:END)
  signature-mask.svg     → GENERIERT (build_sig_mask.py): 24 Mittellinien-Striche,
                           inline als `<mask id="sigDraw">` im SIG-Block
  robots.txt / sitemap.xml → Crawler-Basics für mundt-dienstleistungen.de
  .vercelignore          → hält IMG-*.jpg, *.py, .env* und .vercel aus dem Deploy
  assets/img/            → hero-bg, gallery-1..7, about, sascha, logo-header (alles .webp),
                           favicon-32.png, apple-touch-icon.png, og-image.jpg
  assets/fonts/          → self-hosted woff2 (Archivo Black, Barlow, Barlow Condensed,
                           Newsreader Italic, Space Mono)
  assets/js/             → gsap.min.js, ScrollTrigger.min.js, Flip.min.js (self-hosted;
                           Flip animiert den Lightbox-Übergang)
IMG-20260825-WA*.jpg     → Original-Rohfotos (Quelle für rebuild_gallery.py; gitignoriert,
                           unzensiert — gehören weder ins Repo noch ins Web)
sascha-dach-raw.png / sascha-freisteller-raw.png → Retusche-Quellen für about.webp
                           bzw. sascha.webp (Input von rebuild_gallery.py; gitignoriert)
signatur-mundt.png       → Raster-Vorlage der Unterschrift (für vectorize_signature.py;
                           gitignoriert — echte Unterschrift, nicht ins Repo)
.kimi-code/skills/samu-stunning-web/  → projekteigener Design-/Motion-Workflow-Skill
                           (SKILL.md + SIGNATURE-MOMENTS.md + PRE-FLIGHT.md). Bei jeder
                           Design-/Animations-/Copy-Arbeit an site/ anwenden.
.skill-output/           → Referenzmaterial der Quell-Skills (gitignoriert)
.claude/docs/ai/         → Analyse-Notizen (10x-Strategie)
```

## Build & Vorschau

Kein Dev-Server, keine Testsuite. „Test" = Build (validiert sich selbst) + Browser-Check.

- Vorschau: `python -m http.server` in `site/`, oder index.html direkt öffnen.
- Artifact-Build (CWD = `site/`): `python build_artifact.py` — inlined CSS/JS/Assets als
  data-URIs, zieht den Impressum-Block als `#impressum`-Sektion rein, failt laut bei
  fehlendem `<style>`, JSON-LD, viewport-meta oder Google-Fonts-Requests.
- Bilder ändern: `rebuild_gallery.py` anpassen, laufen lassen, danach Build.

## Konventionen

- **Sprache**: Inhalte Deutsch (`lang="de"`); Kommentare im Stil der Datei (JS/Python
  überwiegend Englisch/Deutsch gemischt, CSS-Header Deutsch).
- **CSS**: Tokens in `:root` (`--ground`, `--panel`, `--spark`, `--hotmetal`, `--radius`).
  Dark-Design „Anthrazit & Markenblau": Akzent `--spark: #2b7de1` (bright `#6fb3ff`, deep
  `#123f78`), Buttons mit `--on-spark: #081426`. Früher „Schweißfunken-Amber" (#ee8f2f).
  Beim Scrollen interpoliert script.js die Tokens WEATHERED → COATED (das Callbar-Grün
  `--wa` läuft mit). Hero: Beschichtungsfront wischt `--hotmetal` frei (Klasse `.metal`).
  Breakpoints 520–1020 px, `prefers-reduced-motion` vorhanden. Handwerks-Motive:
  Zollstock-Striche (`.step`), Referenzen als ruhiges Editorial-Grid
  (`.gallery-grid`, 7 Kacheln, Nummer in Space Mono + Caption in Newsreader
  Italic unter dem Bild; die frühere horizontale Rail und die angetackerten
  Polaroids sind entfernt),
  Filzstift-Unterstrich (`.accent .stroke`), Stempel-SVG (`.stamp`), Filmkorn
  (`body::after`), Unterschrift als Outline-SVG (`.sig`, Self-Draw per
  Mittellinien-Maske `#sigDraw`, Attribution als `.sr-only`-cite). Zweite
  Schriftstimme: Newsreader Italic (Zitat, Captions) + Space Mono (Nummern,
  Tags, Stempel) — beide self-hosted. Hintergrund-Aura (`.bg-aura`, fixed,
  z-index -1): drei Leuchtflecke hinter dem Inhalt, Farbe aus `--spark-glow`
  (wächst mit der Scroll-Beschichtung), Drift per GSAP in drei Tempi.
  Panel-Kanten-Naht (`.panel-seam .bead`): Schrägkante der `.section-panel`s
  wird per Scrub eingeschweißt, Rotation auf die Clip-Kante (feste Winkel,
  `--seam-slope` für die JS-Bahn), CSS-Default fertige Naht. Karten-Tilt
  (`.js-tilt` nimmt die transform-Transition raus) — nur unter `hover:hover`
  + `pointer:fine` + no-preference + vollem Effekt-Budget. Der frühere
  Custom-Cursor ist entfernt (Jank); der native Zeiger gilt überall.
- **JS** (`script.js`): eine IIFE, `"use strict"`, ES5 (`var`). Jahr im Footer, Mobile-Nav,
  Lightbox (Fokus-Rückgabe, ESC), aktiver Nav-Link (IntersectionObserver). Scroll-Choreo
  über **GSAP + ScrollTrigger** (self-hosted, per `<script>` vor script.js — DSGVO, keine
  CDNs). Ablauf-Schweißnaht: Wide gepinnt (260 px/Station, scrub 1), Narrow einmalig
  gestaffelt beim Reinscrollen; Schweißpunkt (`.weld-tip`, Kern flackert) + Lichtwurf
  (`.weld-glow`) + Funken-Pool (`.weld-sparks`, Grundrate + Velocity-Bonus, **nie**
  `overflow: hidden` darauf — clippt die nach oben stiebenden Funken weg). Signatur:
  Draw-Maske `#sigDraw` erst per JS, Striche per stroke-dashoffset in Schreibreihenfolge.
  Panel-Kanten-Nähte: Bead liegt im Panel, Schweißpunkt/Glow/Funken auf Dokument-Ebene
  (der `clip-path` des Panels würde sie an der Kante abschneiden), Geometrie wird bei
  `onRefresh` in Dokument-Koordinaten gecacht (nicht pro onUpdate-Frame lesen);
  Pool-Funken werden auf (0,0) resettet (scrollWidth). quickTo-Elemente (Tilt,
  Marquee-timeScale) niemals mit `overwrite: true` tweenen (killt die
  quickTo-Tweens) — immer `overwrite: "auto"`.
  CSS-Defaults sind überall „sichtbar", GSAP setzt Ausgangszustände per
  `.from()`/`.fromTo()` — Anker-Sprünge lassen nichts unsichtbar hängen. Deko läuft
  unter `gsap.matchMedia("no-preference")`.
  Performance-Konventionen (2026-08, Jank-Paket): `coat()` schreibt die
  Wetter-Tokens nur bei Wechsel der quantisierten Stufe (24 Stufen);
  Funken-Spawn ist zeitgedeckelt (40 ms); mousemove-Handler sind rAF-gegatet
  und cachen das Rect bei `mouseenter`; Scrubs laufen auf ungefilterten
  Hüllen (`.hero-figure-wrap`), nie auf gefilterten Bildern;
  Hero-Endlosanimationen (kenburns, glowDrift, metalShift) pausieren per
  IntersectionObserver über die Klasse `.offscreen`; Flicker-Tweens laufen
  nur bei sichtbarem Schweißpunkt. `lowBudget` (coarse Pointer ODER
  ≤ 4 Kerne ODER ≤ 4 GB RAM) drosselt nur Deko: Funken-Deckel 80 ms, keine
  Aura-Drift-Tweens, kein Magnetic/Tilt.
  Neue GSAP-Skript-Tags müssen in `build_artifact.py` mit inlined werden.
- **HTML**: FAQ = natives `<details>`/`<summary>` + `FAQPage`-JSON-LD — beide synchron
  halten. SEO: meta description, OG (`assets/img/og-image.jpg`, 1200×630), twitter:card,
  JSON-LD `RoofingContractor` mit `areaServed` Kamen. **Kontaktdaten stehen an vielen
  Stellen** (Header, Hero, Kontakt, Footer, Callbar, JSON-LD) — bei Änderungen alle
  synchron halten: Tel `+4915151100567`, Mail `saschamundt83@freenet.de`,
  Feuerbachstraße 2a, 59174 Kamen.
- **Bilder**: als `assets/img/*.webp` (max. 1600 px, Pillow `quality=80, method=6`), mit
  `width`/`height` im HTML **und** in `ASSETS` (bzw. `FONTS`) von `build_artifact.py`
  eintragen, sonst fehlen sie im Artifact.

## Deployment

Live auf **Vercel**: https://firmenwebsite-samu.vercel.app — CLI aus `site/`:
`vercel deploy --yes --prod`. Kein Git-Auto-Deploy (Projekt nicht verknüpft); nach
Änderungen manuell deployen oder im Dashboard Git anbinden. `.vercelignore` hält
Rohfotos (`IMG-*.jpg`) und Werkzeugskripte (`*.py`) aus dem Deploy — die lagen zeitweise
als Duplikate im Webroot (2026-08 entfernt, waren unzensierte Rohfotos öffentlich
erreichbar gewesen). Alternativ: `artifact.html` als Single-File-Build publizieren.
`.vercel/` ist gitignoriert.

## Sicherheit & Datenschutz (harte Regeln)

- **Keine externen Font-/Script-Requests** (DSGVO); der Build erzwingt lokale Fonts.
- **Kennzeichen/Personen in neuen Fotos zensieren** vor Veröffentlichung.
- **Fotos zeigen fremde Grundstücke.** Panoramafreiheit (§ 59 UrhG) deckt nur den Blick
  von öffentlichen Wegen; die Galerie nutzt nur geprüfte volle Frames (keine Kennzeichen,
  Personen oder Hausnummern im Bild). Bewusst ungenutzt: `WA0152` (Lokal lesbar, Passantin),
  `WA0142` (Blick in Kundenflur), `WA0133`/`WA0140`/`WA0141` (Hausnummern/Straßenzug
  lesbar), `WA0146`/`WA0147` (Blick in Nachbars Garten), `WA0137` (90° gedreht).
  Diese Dateien gehören auch nicht ins öffentliche
  Webroot (siehe .vercelignore).
- **Bildunterschriften = tatsächlicher Zustand** (§ 5 UWG). Frühere Fails: unbehandeltes
  Dach als „nach Beschichtung", Beschichtungsfoto als „Neueindeckung" (keine Leistung).
- **Kein Kontaktformular, keine Cookies** — bewusste Entscheidung, nicht nachrüsten ohne
  expliziten Wunsch. Datenschutzerklärung beschreibt WhatsApp als externen Dienst.
- Impressum ist live-tauglich ohne Platzhalter; ein HTML-Kommentar dort erklärt, wann
  USt-IdNr./Handwerksrolle zu ergänzen sind (nur falls vorhanden).
