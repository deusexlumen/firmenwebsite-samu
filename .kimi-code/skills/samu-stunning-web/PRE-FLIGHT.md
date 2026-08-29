# Pre-Flight Check - SaMu Stunning Web

Vor jedem "fertig". Mechanisch prüfen, wo möglich - die Grep-Befehle unten aus dem
Projektroot laufen lassen. Ein Haken, der nicht ehrlich gesetzt werden kann = nicht fertig.

## Mechanische Sweeps (Grep auf `site/`)

| Check | Befund = Fail |
| --- | --- |
| `rg "transition:\s*all" site/styles.css` | jeder Treffer |
| `rg "ease-in[^-]" site/styles.css site/script.js` | `ease-in` auf UI (ease-in-out ok) |
| `rg "scale\(0" site/` | jeder Treffer (Ziel: 0.9-0.97) |
| `rg "addEventListener\(['\"]scroll" site/script.js` | jeder Treffer (ScrollTrigger nutzen) |
| `rg "fonts\.(googleapis|gstatic)" site/` | jeder Treffer (DSGVO, Build failt eh) |
| `rg "picsum|unsplash|placehold" site/` | jeder Treffer (nur echte Fotos) |
| `rg "100vh" site/styles.css` | prüfen: Viewport-Sektionen müssen `100dvh` sein |
| `rg "z-index:\s*(9{3,}|[0-9]{4,})" site/styles.css` | Willkür-Werte |
| `rg "9999|lorem|John Doe|Acme" site/` | jeder Treffer |
| Eyebrow-Zählung: Space-Mono-Labels über Headlines | > ceil(Sektionen / 3) |
| Marquee-Zählung | > 1 |

## Build & Sync

- [ ] `python build_artifact.py` aus `site/` läuft fehlerfrei (validiert style-Tag, JSON-LD,
      viewport, Google-Fonts selbst)
- [ ] Neue Bilder/Fonts in `ASSETS`/`FONTS` von `build_artifact.py` eingetragen, mit
      `width`/`height` im HTML
- [ ] Neue GSAP-Skript-Tags werden vom Build inlined (keine toten `<script src>` im Artifact)
- [ ] FAQ-HTML und `FAQPage`-JSON-LD synchron
- [ ] Kontaktdaten (Tel, E-Mail, Adresse) an allen Stellen identisch, falls angefasst
- [ ] Impressum/Datenschutz unangetastet (oder explizit beauftragt)

## Design-Locks

- [ ] Theme-Lock: alle Sektionen dark, nur Anthrazit-Familien-Töne
- [ ] Color-Lock: ein Akzent (`--spark`), Buttons mit `--on-spark`-Schrift (Kontrast geprüft,
      WCAG AA)
- [ ] Shape-Lock: Radius-System konsistent
- [ ] Kein Light-Block mitten in der Dark-Page, kein zweiter Akzent
- [ ] Kein generischer Karten-Look ohne Grund (border + shadow + Fläche nur bei echter Hierarchie)

## Layout-Disziplin

- [ ] Hero: Headline ≤ 2 Zeilen, Subtext ≤ 20 Worte, CTA ohne Scroll sichtbar, Top-Padding moderat
- [ ] Nav eine Zeile auf Desktop, Höhe ≤ 80 px
- [ ] Kein 3-gleiche-Karten-Feature-Row neu eingeführt
- [ ] Zigzag-Cap: max 2 Bild+Text-Splits in Folge
- [ ] Section-Layout-Wiederholung: keine zwei Sektionen derselben Layout-Familie neu geschaffen
- [ ] Mobile-Collapse pro Sektion explizit; < 768 px einspaltig
- [ ] CTA-Labels einzeilig auf Desktop, ein Intent = ein Label

## Motion

- [ ] Jede Animation hat ihre Ein-Satz-Motivation (im Plan/Kommentar)
- [ ] Signature-Moment-Budget: ≤ 3 aktiv (Katalog SIGNATURE-MOMENTS.md aktualisiert)
- [ ] Nur `transform`/`opacity` animiert; UI-Animationen < 300 ms; Press-Feedback 100-160 ms
- [ ] Stagger 30-80 ms, blockiert keine Interaktion
- [ ] Hover-Motion unter `@media (hover: hover) and (pointer: fine)`
- [ ] Reduced-Motion: Bewegung weg, Opacity-/Farb-Feedback bleibt; komplette Seite statisch
      vollständig sichtbar (CSS-Defaults sind "sichtbar", GSAP setzt Ausgangszustände)
- [ ] Keine Cut-off-ScrollTriggers, `useEffect`-/GSAP-Cleanups korrekt (context/revert)

## Content & Recht

- [ ] Copy-Self-Audit: jeder sichtbare String gelesen, keine KI-Phrasen, keine Füll-Verben
- [ ] Keine erfundenen Zahlen/Referenzen; Bildunterschriften = tatsächlicher Zustand (§ 5 UWG)
- [ ] Keine Scroll-Cues, Status-Dots, Orts-/Zeit-Strips, Footer-Versions-Stempel
- [ ] Gedankenstriche sparsam, keiner in Buttons/Labels
- [ ] Zitate ≤ 3 Zeilen, Attribution mit Name + Kontext
- [ ] Neue Fotos: Kennzeichen/Personen/Nachbargrundstücke zensiert (AGENTS.md-Regeln,
      `rebuild_gallery.py` ist der einzige Bildweg)

## Feel-Check (nicht optional)

- [ ] DevTools Animations-Panel auf 10 %: Reveals laufen sauber, nichts poppt
- [ ] `prefers-reduced-motion` im Rendering-Panel aktivieren: Seite vollständig nutzbar
- [ ] Echtes Smartphone oder Emulation: Touch-Targets, Callbar, Lightbox, keine Hover-Falle
- [ ] Scroll-Verhalten: Anker-Sprünge (`#leistungen` etc.) lassen kein Element unsichtbar hängen
- [ ] LCP plausibel: Hero-Bild mit Maßen, nicht lazy; CLS: kein Layout-Shift beim Laden
