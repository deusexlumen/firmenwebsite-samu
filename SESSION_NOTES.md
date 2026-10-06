# SESSION_NOTES — Firmenwebsite SaMu

## 2026-10-06 — Goal: Optimierungen nach Domain-Schaltung www.sa-mu.de

**Ziel:** Alles umsetzen, was ohne Saschas Zusage und ohne Live-Eingriff geht, lokal
verifizieren, auf Branch `worktree-domain-sa-mu` committen + pushen. Kein Merge, kein Prod-Deploy.

**Akzeptanzkriterien**
1. `site/vercel.json`: 301 vercel.app → www.sa-mu.de (exakter Host), Cache-Header, Security-Header inkl. CSP.
2. `.vercelignore`: artifact.html + Signatur-Quell-SVGs nicht mehr öffentlich (live war artifact.html 200/6,6 MB).
3. `site/404.html` mit root-absoluten Pfaden, noindex, im Seiten-Design.
4. Sitemap `lastmod` aktuell.
5. Unbelegte Claims (Frost/Werterhalt/Nachhaltig) neutralisiert — keine neuen Geschäftsversprechen.
6. Optional: srcset 800 px für Galerie.
7. Verifikation: Build grün; lokaler Server mit vercel.json-Headern; Playwright ohne Konsolen-/CSP-Fehler (375 px + Desktop).

**Bewusst NICHT autonom:** Festpreis-Zusage, Rückruf-Zeitversprechen (§ 5 UWG → Sascha), E-Mail-Umzug, Deploy, Merge.

**Ergebnis (2026-10-06)** — alle Kriterien lokal erfüllt; Redirect vercel.app erst nach Deploy prüfbar.
- 💾 Galerie-srcset: w-Angaben = echte Breite (Hochformat ~1200 w, nur Querformat g7 hat -1200).
  DPR-3-Handys laden bewusst das volle Bild. `responsive()` in rebuild_gallery.py hält Varianten synchron.
- 💾 CSP: `style-src 'self' 'unsafe-inline'` (style-src-attr kennt älteres Safari/Firefox nicht).
- 💾 Lokaler Vercel-Ersatz-Server: Header aus vercel.json + 404-Fallback; Playwright 390/1440 px × DPR 1–3: 0 CSP-Verstöße.
- ⚠️ Offen: Impressum „§ 5 TMG" → „§ 5 DDG" (TMG seit 14.05.2024 außer Kraft) — braucht Auftrag.
- Offen: Merge + Deploy, Google-Profil, Search Console, Festpreis/Rückruf/Ehrlichkeits-Block (Sascha), info@sa-mu.de.

**Entscheidung (2026-10-06):** Google nur verlinken, nichts einbetten (Datenschutz, kein Pflegeaufwand). Bewertungs-Button kommt, sobald Sascha den Profil-Link schickt (dann auch `sameAs` im JSON-LD).
- SEO umgesetzt (Subagent-Audit): HomeAndConstructionBusiness, Title/Description, H1 sr-only, H2 Ortsbezug, Sitemap ohne lastmod.
- Offen mit Saschas Angabe: weitere Orte für areaServed + FAQ Region; Impressum § 5 DDG (Auftrag fehlt).
