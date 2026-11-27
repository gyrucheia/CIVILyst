# CIVILyst UI Draft

Open this folder in Antigravity. With Node.js 22.12+ and npm, run these commands in its terminal:

```powershell
npm install
npm run dev -- --host 127.0.0.1
```

Open http://localhost:8443 for the public site and http://localhost:8443/portal for the Super Admin demo.

## Walkthrough

- **Public tracking** — use `CIV-2026-000128` and January 15, 1990. Open Fees to review the draft fee and indigency guidance.
- **Super Admin** — sign in using the prefilled demo values. Open Record Search or use the global search in the top bar.
- **Filtered printout** — select Correction of Sex, set Filing Date to September 12, 2026, and click Print Results. The print view includes the active criteria and matching rows.
- **Service Fee Collections** — change the service and receipt date filters. The receipt count and total update together.

This draft uses frontend sample data. It has no live authentication, database, payment processing, or official fee approval. The collections screen assumes the office wants to monitor service fees received. The report uses case number, petition type, filing date, and stage while the office confirms its required columns.
