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
