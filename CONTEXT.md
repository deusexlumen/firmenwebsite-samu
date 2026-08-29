# Firmenwebsite SaMu

Statische Firmenwebsite für Sascha Mundt (Dachbeschichtung u. a., Kamen). Zentrales
Produktziel: maximaler Wow-Eindruck, der auf schwachen Geräten niemanden ausschließt —
die Site muss für Saschas Kunden überall flüssig benutzbar bleiben.

## Language

**Effekt-Budget**:
Adaptive Qualitätsstufen der reinen Deko-Effekte (Funken-Rate, Filmkorn, Aura-Drift,
Cursor). Wird auf schwachen Geräten automatisch reduziert, ohne Inhalte oder
Kernfunktionen zu entfernen.
_Avoid_: Degrading, Fallback, Low-Mode

**Schwaches Gerät**:
Ein Gerät mit begrenzter CPU/GPU oder wenig RAM (ältere Smartphones, günstige Laptops),
auf dem die volle Effekt-Show ruckeln würde. Zuschneidekriterium fürs Effekt-Budget,
nie für Inhalte.

**Beschichtung**:
Die Scroll-Metapher der Site: Beim Scrollen interpoliert sich das Farbsystem von
WEATHERED (unbehandelt) nach COATED (beschichtet) — inklusive Hero-Beschichtungsfront
und wachsendem `--spark-glow`.
_Avoid_: Theme-Wechsel, Farbübergang
