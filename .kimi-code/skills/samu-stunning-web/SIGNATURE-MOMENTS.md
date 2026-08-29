# Signature Moments - Katalog

Ein Signature-Moment ist eine Animation, an die man sich erinnert. Budget: **maximal 3 aktiv
pro Seite** (siehe SKILL.md Abschnitt 0). Jeder Moment unten hat: Motivation (ein Satz),
Umsetzung im Projekt-Stack (Vanilla + GSAP self-hosted), Performance-Notizen,
Reduced-Motion-Fallback.

**Aktuell aktiv auf der Seite:**

1. Hero-Beschichtungs-Wipe (`.metal`, `--hotmetal`-Ramp)
2. Token-Interpolation Weathered → Coated beim Scrollen
3. Ablauf-Schweißnaht mit Schweißpunkt und Funken (seit 2026-08-28, siehe Moment 1),
   erweitert um die **Panel-Kanten-Nähte** (Moment 1b, gleiche Bildsprache)

Dazu **ein ruhiges Einmal-Detail** (kein voller Moment: einmalig, kein Scrub, keine
Partikel): die Signatur Self-Draw im Über-uns-Zitat (Moment 2).

Damit ist das Budget **voll**. Neue Momente = ein bestehender weicht, oder der neue ersetzt
einen als Upgrade desselben Moments.

**Ambient-Ebene (zählt nicht ins Moment-Budget, weil reine Feedback-/Fundament-Ebene,
nur Desktop-Maus + no-preference):** Karten-Tilt (`.service`/`.contact-card`, max ±3,5°
per quickTo), Hintergrund-Aura (drei Leuchtflecke hinter dem Inhalt, Farbe aus
`--spark-glow`, driften in drei Tempi). Regeln dafür: niemals auf Touch (`hover: hover`
+ `pointer: fine`), niemals bei Reduced-Motion. Der frühere Custom-Cursor
(Punkt + Ring) ist 2026-08-28 entfernt worden (Jank, kein Mehrwert) — der native
Zeiger gilt überall, kein Ersatz geplant.

---

## Moment 1b: Panel-Kanten-Schweißnaht (GEBAUT, aktiv seit 2026-08-28)

**Motivation:** Die Schrägkanten der Panel-Sektionen (Referenzen, Kontakt) werden
eingeschweißt, während der Besucher hineinfährt — dasselbe Handwerk wie die Ablauf-Naht,
nur am Gehäuse der Seite. Gehört zu Moment 1 (gleiche Bildsprache, gleiche Regeln).

**Umsetzung (ist-Stand, `site/index.html` .panel-seam + `site/styles.css` + `site/script.js` "Panel-Kanten"):**

- `<span class="panel-seam"><i class="bead"></i></span>` liegt als erstes Kind im
  `.section-panel`. CSS rotiert die Naht auf die Schrägung der Clip-Kante — die ist
  viewport-unabhängig konstant (Pitch steht in vw), deshalb zwei feste Winkel
  (-1.4907°, unter 860 px -1.9475°) + `--seam-slope` (0.026/0.034) für die JS-Bahn.
- CSS-Default ist die fertige Naht (kein Transform) — No-JS und Reduced-Motion sehen
  sie komplett. JS (nur no-preference) setzt per fromTo scaleX 0→1 mit Scrub
  (`start "top 96%"`, `end "top 18%"`), rückwärts löst sich die Naht wieder.
- **Bead liegt IM Panel, Schweißpunkt/Glow/Funken auf Dokument-Ebene** (appendChild
  body): der `clip-path` des Panels würde sie an der Kante abschneiden — derselbe
  Fail-Modus wie `overflow: hidden` bei den Ablauf-Funken. Position pro onUpdate aus
  `host.getBoundingClientRect()` + pageYOffset, damit sie auch beim Pin stimmen.
- Funken-Pool nur 12 (Kante ist Beiprogramm); gelandete Funken werden beim
  Zurücklegen in den Pool auf (0,0) resettet, sonst blähen ihre Endkoordinaten den
  scrollWidth auf (body `overflow-x: hidden` fängt es zwar, aber sauber ist sauber).

**Fail-Modi (behoben):** `overwrite: true` auf opacity-/scale-Tweens killt ALLE Tweens
des Elements — beim Cursor starben so die quickTo-x/y und der Zeiger fror bei der
Initialposition ein. Für Ambient-Elemente mit quickTo immer `overwrite: "auto"`.

---

## Moment 1: Scroll-Schweißnaht (GEBAUT, aktiv)

**Motivation:** Die Naht zwischen den Ablauf-Stationen schweißt nur weiter, während der
Besucher scrollt - er vollendet den Prozess selbst. Storytelling + Scrub-Feedback.

**Umsetzung (ist-Stand, `site/script.js` "Ablauf" + `site/styles.css` .seam/.weld-tip/.weld-glow/.weld-sparks):**

- Wide (>= 900 px, no-preference): `.steps` ist gepinnt (`start: "center center"`,
  `end: += 5 * 260`, **`scrub: 1`** - die Naht folgt traeg wie geschmolzenes Metall),
  jede Stations-Naht (`.seam`) wischt per `scaleX 0 → 1` nacheinander, mit 0.3-s-Atempause
  dazwischen (die Elektrode setzt neu an). Steht der Scroll, steht die Naht.
- Die fertige Naht ist ein 4-px-Bead mit Glow (`box-shadow` in `--spark-bright`), damit
  sie sich vom Zollstock-Raster darunter abhebt.
- Schweißpunkt (`.weld-tip`): 20-px-Wrapper mit Kern `<b>` - der Kern **flackert**
  (eigener GSAP-Yoyo-Tween, scale/opacity, `repeatRefresh`), der Wrapper folgt im
  `onUpdate` des aktiven Naht-Tweens der Nahtfront. `.weld-glow` (170-px-Halo) legt den
  Lichtschein auf die Stationen. Zwischen zwei Stationen blendet beides aus.
- Funken (`.weld-sparks i`): Pool aus 26 `<i>`-Elementen. **Grundrate 2 pro Frame,
  solange geschweißt wird** - Scroll-Velocity legt nur Anzahl (+3) und Wurfweite obendrauf
  (kein Velocity-Gate mehr: normales Lesescrollen erzeugte vorher null Funken). Gut ein
  Drittel sind laengliche Tracer, entlang der Flugrichtung gedreht. Kegel nach oben +
  34 px Gravitation, nur `transform`/`opacity`, 0.45-0.9 s.
- **KEIN `overflow: hidden` auf `.weld-sparks`**: die Funken stieben von der Oberkante
  der Stationen nach oben und wurden im einzeiligen Wide-Layout komplett weggeclippt -
  der Grund fuer "ich sehe keine Funken".
- Narrow (< 900 px): kein Pinning, die Nähte schweißen einmalig gestaffelt (1.05 s,
  Delay 0.4 s) beim Reinscrollen - Schweißpunkt, Glow und Funken fahren mit.
- Reduced Motion / No-JS: Elemente existieren nicht im DOM; CSS-Default zeigt die fertigen
  Nähte und gefüllte Nummern.
- Cleanup: `matchMedia`-Rueckgabe killt Flicker-/Spark-/Tip-Tweens und entfernt alle
  Deko-Elemente.

**Fail-Modi (beobachtet/behoben):** Tip muss im Tween-`onUpdate` positioniert werden, nicht
im ScrollTrigger (folgt sonst dem Scrub nicht rueckwaerts). Velocity-Gate + Overflow-Clip =
unsichtbare Funken (beides entfernt). Flicker gehoert auf den Kern, nicht auf den Wrapper -
der Wrapper wird fuer Show/Hide getweent und wuerde kollidieren.

---

## Moment 2: Signatur Self-Draw (GEBAUT, aktiv als ruhiges Einmal-Detail)

**Motivation:** Saschas Unterschrift unter seinem Zitat im Über-uns-Bereich schreibt sich
beim ersten Reinscrollen selbst - persönlicher Handschlag statt Corporate-Signoff.
Bewusst **ruhig** gehalten (einmalig, kein Scrub, keine Partikel), damit sie nicht mit den
drei choreografierten Momenten konkurriert.

**Umsetzung (ist-Stand):**

- Quelle ist die **gelieferte Outline-Vektorisierung** `site/signature-outline.svg`
  (Kalligraphie mit echter Druckvariation). Outline-Pfade taugen NICHT fuer sichtbaren
  dash-Draw (zeichnet Konturen, nicht den Schreibzug) und auto-tracerte Mittellinien als
  sichtbare Kunst wirken kuenstlich ("Blindenschrift").
- Die Loesung: **Mittellinien als unsichtbare Maske**. `site/build_sig_mask.py`
  rasterisiert die Outline (Winding-Loecher korrekt), skelettiert die Tinte und traced
  24 Federstriche in Schreibreihenfolge (links → rechts, vertikal oben → unten) mit
  Strichstaerke aus der lokalen Silhouetten-Dicke × 1.35. Ergebnis:
  `site/signature-mask.svg` - wird als `<mask id="sigDraw">` inline im SIG-Block der
  index.html ueber die echte Outline gelegt.
- script.js haengt die Maske erst per JS an `.sig-ink` und zieht jeden Strich per
  `stroke-dashoffset` nacheinander durch: gleichmaessiges Federtempo (Dauer ∝ Länge,
  Summe ≈ 3.4 s), Ueberlapp 0.05 s, ScrollTrigger `once` bei `.quote top 78%`.
  **Reihenfolge im Code: erst dash-Werte setzen, dann Maske anhaengen** - sonst bluept
  die komplette Unterschrift fuer einen Frame auf.
- Die Tinte waechst also entlang des echten Schreibzugs (großer S-Schwung zuerst,
  t-Querstrich zuletzt), das sichtbare Ergebnis bleibt die originale Kalligraphie.
- Tintenfarbe `var(--text)` (`fill: currentColor`) - eine Unterschrift ist Tinte, kein Logo.
  Die alte Space-Mono-Attribution steht als `<cite class="sr-only">` noch im Markup.
- Reduced Motion / No-JS: Maske existiert nur per JS-Attribut, CSS-Default ist komplett
  sichtbar (Cleanup entfernt Attribut und dash-Werte wieder).
- Nach Aenderung an `signature-outline.svg`: `python site/build_sig_mask.py` laufen lassen
  und die neuen `<path class="sig-stroke">`-Zeilen in den SIG-Block uebernehmen.
  `site/vectorize_signature.py` (Raster → Mittellinien) bleibt als Werkzeug fuer reine
  Raster-Vorlagen bestehen, wird fuer die Maske nicht mehr gebraucht.

**Fail-Modi (behoben):** Dash-Draw auf Outline = Kontur-Nachfahren (verworfen). Wisch-Maske
(stumpfes Rechteck von links) = "ohne Liebe", kein Schreibgefühl (verworfen). Maske im
Markup statt per JS = No-JS-Nutzer sehen gar nichts (Regel: CSS-Default sichtbar).
Mittellinien SICHTBAR gerendert = Blindenschrift; als unsichtbare Maske ist die
Geometrie dagegen exakt richtig.

---

## Moment 3: Hero-Beschichtungs-Wipe (bestehend - Schutzregeln)

**Motivation:** Die Beschichtungsfront wischt `--hotmetal` frei - das Kerngeschäft als
erster Eindruck.

**Regeln:** Behalten, nicht duplizieren. Kein zweiter Wipe-Effekt anderswo auf der Seite
(ein Wipe ist Signatur, zwei Wipes sind Template). Änderungen nur am Timing/der Ramp,
niemals ein zweites Element mit demselben Mechanismus.

---

## Kandidaten (nicht aktiv - nur bei freiem Budget und explizitem Wunsch)

- **Magnetic CTA** (Desktop, `pointer: fine` only): primärer Anruf-Button zieht leicht zum
  Cursor. Motivation: Feedback/Aufmerksamkeit auf der Kernaktion. Umsetzung ohne
  Motion-Library: `mousemove` auf dem Button-Wrapper, `transform` per GSAP `quickTo`.
  Achtung: kollidiert mit Budget - aktuell draußen bleiben.
- **Lightbox Shared-Element-Feel:** Öffnen aus dem angeklickten Galerie-Bild heraus skaliert
  (scale 0.95 → 1, nie scale(0)), Schließen umgekehrt. Motivation: räumliche Konsistenz.
- **Galerie-Clip-Reveal:** `clip-path: inset()`-Reveal beim Scroll-Eintritt, gestaffelt
  30-80 ms. Motivation: Hierarchie. Billig, aber Budget-frage.

## Neue Momente erfinden

Nur mit: Ein-Satz-Motivation, Platz im Budget, Skeleton-Code im Projekt-Stil,
Performance-Notiz, Reduced-Motion-Fallback, Fail-Modi. Dann hier dokumentieren,
**bevor** gebaut wird.
