---
name: samu-stunning-web
description: Projekteigener Design- und Motion-Workflow für die SaMu-Website (site/). Destilliert aus den Skills design-taste-frontend, high-end-visual-design, redesign-existing-projects und improve-animations, übersetzt auf den Vanilla-Stack dieser Seite (kein React, kein Tailwind, GSAP self-hosted). IMMER nutzen bei Design-, Animations-, Redesign- oder Copy-Arbeit an site/. Motto: "Mehr ist nicht immer mehr - aber das richtige Mehr ist auf jeden Fall geil."
---

# SaMu Stunning Web - Der Workflow

> Das Motto ist die oberste Regel: **Mehr ist nicht immer mehr - aber das richtige Mehr ist auf
> jeden Fall geil.** Diese Seite gewinnt nicht durch Effekt-Dichte, sondern durch wenige,
> handwerklich perfekte Signature-Momente auf einem ruhigen, hochwertigen Fundament.

Quellen (vollständige Originale liegen in `.skill-output/`, Supporting-Files des Animations-Audits
in `.skill-output/supporting/improve-animations/`):

- `design-taste-frontend.txt` - Brief Inference, Dials, Layout-Disziplin, AI-Tells, Pre-Flight
- `high-end-visual-design.txt` - Double-Bezel, Button-in-Button, Spatial Rhythm, Performance-Guardrails
- `redesign-existing-projects.txt` - Audit-First, Fix-Priorität, Component-Patterns
- `improve-animations.txt` + `AUDIT.md` + `PLAN-TEMPLATE.md` - Motion-Kategorien, exakte Werte, Plan-Format

---

## 0. Die eine Regel: Das Signature-Moment-Budget

Eine Seite hat **maximal 3 aktive Signature-Momente** (Definition und Katalog:
[SIGNATURE-MOMENTS.md](SIGNATURE-MOMENTS.md)) plus **höchstens 1 ruhiges Einmal-Detail**
(einmaliger, dezenter Effekt ohne Scrub/Partikel, z. B. eine sich zeichnende Unterschrift).
Alles andere ist Fundament: sauber, ruhig, schnell.

- Jede Animation braucht eine **Ein-Satz-Motivation** (Hierarchie, Storytelling, Feedback,
  Zustandswechsel). "Sieht geil aus" allein reicht nicht - "die Schweißnaht zieht sich beim
  Scrollen durch den Ablauf, weil der Besucher den Prozess selbst vollendet" reicht.
- Frequenz schlägt Effekt (Kowalski-Tabelle): Elemente, die der Nutzer dutzendfach pro Besuch
  auslöst (Hover, Nav, FAQ), bekommen **kürzere oder keine** Animation. Seltene Momente
  (erster Seitenaufruf, Signatur, Schweißnaht) dürfen Delight-Budget ausgeben.
- Bevor ein neuer Effekt rein darf: prüfen, ob das Budget schon ausgegeben ist. Wenn ja,
  muss ein bestehender Moment weichen oder der neue bleibt draußen.

## 1. Design Read (immer zuerst, eine Zeile)

Vor jeder Design- oder Motion-Entscheidung eine Zeile ausgeben:

> "Lese das als: lokale Handwerks-One-Pager für Privatkunden in Kamen, kernige
> Anthrazit-und-Markenblau-Sprache, Scroll-Choreografie als Markenzeichen, Vertrauen über
> Nähe und echte Fotos statt Agentur-Glitzer."

Abweichungen davon (z. B. "User will experimenteller") explizit benennen. Nicht raten, wenn der
Auftrag klar ist - und genau **eine** Rückfrage, wenn er es nicht ist.

## 2. Die drei Dials - projektfest verstellt

Aus design-taste-frontend, auf diese Marke eingemessen (nicht still am Baseline-Wert drehen):

| Dial | Wert | Begründung |
| --- | --- | --- |
| `DESIGN_VARIANCE` | **6** | Offset und Handwerks-Motive (Taped-Fotos, Zollstock, Stempel), aber keine Arty-Chaos-Layouts - die Zielgruppe will Kompetenz lesen, nicht Awwwards |
| `MOTION_INTENSITY` | **7** | Scroll-Choreo ist das Markenzeichen (Beschichtungs-Wipe, Token-Interpolation, Schweißnaht); UI selbst bleibt unter 300 ms |
| `VISUAL_DENSITY` | **4** | Marketing-Seite mit Luft, keine Cockpit-Dichte |

## 3. Projekt-Realität schlägt Skill-Defaults

Die Quell-Skills sind React/Tailwind-zentriert. Dieses Projekt ist Vanilla. Übersetzungstabelle
(**verbindlich**, verhindert Halluzinations-Imports):

| Skill sagt | Hier gilt |
| --- | --- |
| Tailwind-Utilities (`py-24`, `dark:`, `max-w-7xl`) | Konzept übernehmen, Umsetzung in `styles.css` über die Tokens in `:root` (`--ground`, `--panel`, `--spark`, `--radius`) und die bestehenden Breakpoints (520-1020 px) |
| `motion/react`, `useMotionValue`, `whileInView` | GSAP + ScrollTrigger (self-hosted in `assets/js/`), `.from()`/`.fromTo()`, ScrollTrigger für Viewport-Reveals |
| `useReducedMotion()` | `gsap.matchMedia("(prefers-reduced-motion: no-preference)")` + CSS `@media (prefers-reduced-motion: reduce)` |
| `next/font`, Google-Fonts-Verbot via `<link>` | Self-hosted woff2 in `assets/fonts/` - **DSGVO-Hartregel**, Build bricht bei externen Font-Requests ab |
| Picsum/Unsplash-Platzhalter | **Niemals.** Nur echte Fotos über `rebuild_gallery.py` aus den WA-Rohdateien (Datenschutz-Zuschnitte beachten, siehe AGENTS.md) |
| Phosphor/HugeIcons-Package | Keine Icon-Library installiert und keine gewünscht - die wenigen vorhandenen Inline-SVGs (Stempel, Plus, Pfeile) behalten, neue sparsam und im gleichen Strich-Stil |
| `min-h-[100dvh]` statt `h-screen` | Gilt 1:1 in CSS: `min-height: 100dvh` |
| npm/npx install | Nichts installieren. Keine Dependencies. Punkt. |
| Em-Dash-Bann (englischer AI-Tell) | Abgeschwächt: deutscher Gedankenstrich ist legitime Typografie, aber **nicht** als Deko-Flourish in jedem zweiten Satz und nie in Buttons/Labels |
| React Server/Client-Isolation | Nicht relevant - stattdessen: script.js bleibt eine IIFE, ES5-Stil der Datei respektieren |

## 4. Der Workflow

### Phase A - Audit (bei Bestandsarbeit, immer zuerst)

Bestand dokumentieren, bevor etwas geändert wird (redesign-existing-projects: Scan → Diagnose → Fix):

1. **Brand-Tokens**: `--spark`-Familie, Fonts (Archivo Black, Barlow, Barlow Condensed,
   Newsreader Italic, Space Mono), `--radius`, Handwerks-Motive.
2. **Motion-Inventar**: bestehende Signature-Momente und UI-Transitions auflisten
   (Sweeps: `transition`, `animation`, `@keyframes`, `gsap.`, `ScrollTrigger`, `ease-in`,
   `transition: all`, `scale(0)` in `styles.css` und `script.js`).
3. **Kategorien-Audit** bei Motion-Fragen nach den 8 Kategorien aus
   `.skill-output/supporting/improve-animations/AUDIT.md` (Purpose/Frequency, Easing/Duration,
   Physicality, Interruptibility, Performance, Accessibility, Cohesion, Missed Opportunities).
   Werte daraus **wortwörtlich** übernehmen, nie approximieren.
4. **Preserve-Liste**: was bleibt unangetastet (IA, Anker-IDs, Kontaktdaten, JSON-LD,
   Copy-Stimme, Impressum/Datenschutz, SEO-Basics). Nie still ändern: URLs, Nav-Labels,
   Telefon/E-Mail/Adresse (überall synchron!), FAQ-HTML ↔ FAQ-JSON-LD-Sync.

### Phase B - Design Read + Dial-Check

Eine Zeile Design Read (Abschnitt 1), Dial-Werte gegen den Auftrag prüfen (Abschnitt 2).

### Phase C - Plan (bei allem über einer Kleinigkeit)

Für Motion-Arbeiten das Plan-Template `.skill-output/supporting/improve-animations/PLAN-TEMPLATE.md`
nutzen: exakte Werte, Ist-Code wörtlich zitiert, Boundaries, Verification mit **Feel-Check**
(10 %-Playback in DevTools, Reduced-Motion-Toggle, echtes Smartphone). Pläne unter `plans/`
ablegen, `plans/README.md` mit Reihenfolge und Status pflegen. Für reine Copy-/CSS-Korrekturen
reicht die Todo-Liste.

### Phase D - Build

Fix-Priorität (redesign-existing-projects, größte Wirkung bei kleinstem Risiko zuerst):

1. Typografie 2. Farbe/Tokens 3. Hover-/Active-States 4. Layout/Spacing 5. Komponenten 6. Polish

Dabei die harten Regeln aus Abschnitt 5 einhalten und neue Signature-Momente **nur** nach dem
Katalog in [SIGNATURE-MOMENTS.md](SIGNATURE-MOMENTS.md) bauen (oder dort zuerst dokumentieren).

### Phase E - Pre-Flight + Verifikation

[PRE-FLIGHT.md](PRE-FLIGHT.md) komplett durchlaufen - mechanisch, wo möglich (Grep-Befehle
stehen dort). Danach:

1. `python build_artifact.py` aus `site/` (validiert sich selbst; neue Assets vorher in
   `ASSETS`/`FONTS` eintragen).
2. Browser-Check: Desktop + Mobile-Breakpoints, Lightbox, Mobile-Nav, Anker-Navigation.
3. Feel-Check Motion: 10 %-Playback, `prefers-reduced-motion` togglen, Touch-Gerät.
4. Deploy nur auf ausdrücklichen Wunsch (`vercel deploy --yes --prod` aus `site/`).

## 5. Harte Regeln (destilliert, projekt-angepasst)

**Motion**

- Nur `transform` und `opacity` animieren. `transition: all` ist immer ein Finding.
- UI-Animationen < 300 ms; Button-Press 100-160 ms (`scale(0.97)` auf `:active`).
- `ease-in` auf UI verboten. Tokens statt Hand-Curves: starke ease-out
  `cubic-bezier(0.23, 1, 0.32, 1)`, on-screen `cubic-bezier(0.77, 0, 0.175, 1)`,
  Drawer `cubic-bezier(0.32, 0.72, 0, 1)` - als Custom Properties in `:root` ergänzen, wenn gebraucht.
- Nie `scale(0)` - Ziel `scale(0.9-0.97)` + Opacity. Popover skalieren vom Trigger, nicht vom Zentrum.
- Stagger 30-80 ms, niemals interaktionsblockierend.
- Kein `window.addEventListener('scroll')` - ScrollTrigger ist da.
- `prefers-reduced-motion`: Bewegung weg, Opacity-/Farb-Feedback bleibt. Nicht alles nuken.
- Hover-Motion nur unter `@media (hover: hover) and (pointer: fine)` (Touch feuert falsche Hovers).
- Ein Marquee pro Seite, maximal.

**Layout & Fläche**

- Theme-Lock: die Seite ist dark, alle Sektionen dark. Töne innerhalb der Anthrazit-Familie variieren, kein Hell-Block dazwischen.
- Color-Lock: ein Akzent, `--spark` (Markenblau), überall identisch. Buttons tragen `--on-spark`-Schrift (Kontrast!). WhatsApp-Grün nur in der Callbar.
- Shape-Lock: ein Radius-System (`--radius` + dokumentierte Ausnahmen).
- Hero-Disziplin: Headline max 2 Zeilen, Subtext max 20 Worte, CTA ohne Scroll sichtbar, Top-Padding moderat.
- Eyebrow-Ration: max 1 pro 3 Sektionen. Die bestehenden Space-Mono-Labels (Schritt-Nummern, Service-Tags) zählen mit.
- Zigzag-Cap: max 2 Bild+Text-Splits in Folge.
- Bento/Grids: Zellen = Inhalt (keine Leerzellen), mindestens 2-3 Zellen mit echtem visuellen Material (Foto, nicht nur Text).
- Mobile-Collapse explizit pro Sektion; asymmetrische Layouts < 768 px strikt einspaltig.
- `min-height: 100dvh` statt `100vh` für Viewport-Sektionen.

**Content & Copy**

- Deutsche, klare Handwerker-Sprache. Keine Füll-Verben ("Elevate", "Seamless"), keine
  erfundenen Präzisions-Zahlen, keine Fake-Referenzen - nur echte.
- Bildunterschriften benennen den tatsächlichen Zustand (§ 5 UWG, siehe AGENTS.md).
- Keine Scroll-Cues ("Scroll ↓"), keine dekorativen Status-Dots, keine Orts-/Zeit-Strips,
  keine Versions-Stempel im Footer, keine Section-Nummern-Eyebrows (`01 / Leistungen`).
- CTA-Intent eindeutig: ein Label pro Absicht (Anruf/WhatsApp), keine Wraps auf Desktop.
- Copy-Self-Audit vor jedem Ship: jeden sichtbaren String nochmal lesen.

**Perf & A11y**

- LCP: Hero-Bild hat feste Maße, wird nicht lazy-geladen; alles darunter schon.
- Grain/Noise nur auf `body::after` (fixed, pointer-events: none) - existiert bereits.
- Blur-Filter sparsam, nie auf scrollenden Containern.
- z-index-Skala dokumentiert, keine `9999`-Willkür.
- Fokus-Ringe sichtbar, Lightbox mit Fokus-Rückgabe (existiert), Skip-Link prüfen.
