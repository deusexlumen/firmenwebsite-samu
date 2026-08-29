# Performance: Effekte zähmen statt Library-Wechsel

Nach einem Performance-Audit (Hauptbefunde: scroll-getriebene Token-Interpolation auf
`:root` pro Frame, Vollbild-Filmkorn mit `mix-blend-mode`, Tween-Flut im Marquee-Handler,
Layout-Lesen in `onUpdate`-Handlern) wurde entschieden, die bestehende GSAP/ScrollTrigger-
Choreo zu behalten und die Jank-Muster gezielt zu fixen — **kein** Wechsel zu Anime.js,
obwohl ein entsprechender Agent-Skill evaluiert wurde. Begründung: Die Befunde sind
Muster-Probleme, keine Library-Probleme; eine Migration hätte die gesamte Scroll-Choreo
(zwei Pins, Schweißnähte, Funken-Pools, Signatur-Draw) ohne Performance-Gewinn neu
geschrieben. Anime.js bleibt als Lern-Werkzeug für spätere Spielwiesen-Projekte offen.

## Weitere Festlegungen aus derselben Entscheidungsrunde

- **Custom-Cursor wird entfernt** (nicht ersetzt): Awwwards-Klischee ohne Nutzen für eine
  Handwerker-Site, existiert auf Touch ohnehin nicht, und war eine Jank-Quelle.
- **Filmkorn bleibt, Blend-Mode fällt**: nur noch dezente Opacity, optisch nahezu identisch.
- **Beschichtungs-Interpolation (WEATHERED→COATED) bleibt**, wird aber in groben Stufen
  aktualisiert statt pro Frame — die Kernmetapher der Site bleibt voll erhalten.
- **Effekt-Budget als Sicherheitsnetz**: schwache Geräte bekommen automatisch reduzierte
  Deko (Funken-Rate, Aura-Drift, Korn), niemals reduzierte Inhalte. Siehe CONTEXT.md.
- **Reveal-Animationen werden narrensicher**: Inhalte sind nie länger unsichtbar, weil ein
  Trigger zu spät feuert; schnelles Scrollen zeigt den Endzustand statt schwarzer Löcher.
