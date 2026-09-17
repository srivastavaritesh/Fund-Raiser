# Sudhir Kumar Srivastava — Fundraising Website

A simple, mobile-friendly fundraising website for treatment support.

## Included
- Public fundraising page
- Patient/treatment information
- Treatment cost section
- Admin-only login
- Admin-only editing of patient/treatment details
- Admin-only bank-detail editing
- Admin-only QR upload/replacement
- Admin-only medical-document upload/removal ("drop box")
- Public document viewing
- Responsive design

## Run locally

1. Install Node.js 18+.
2. Open this folder in a terminal.
3. Run:
   `npm install`
4. Copy `.env.example` to `.env`.
5. Set:
   - `ADMIN_PASSWORD` to a strong private password
   - `SESSION_SECRET` to a long random value
6. Run:
   `npm start`
7. Open `http://localhost:3000`
8. Admin panel: `http://localhost:3000/admin.html`

## Before going public

- Deploy behind HTTPS.
- Set secure environment variables on the hosting provider.
- Set the session cookie to secure in production.
- Use a persistent database/object storage instead of local JSON/files if the site will receive significant traffic.
- Verify the bank account/QR information before publishing.
- Have the family confirm that all medical details and costs are accurate and appropriate to publish.

## Current treatment details
- Disease: Liver Cancer (Hepatocellular Carcinoma HCC) and Cirrhosis
- Duration: Once per month for a year (12 times) for Durvalumab 1500mg; one time at the start for Tremelimumab 300mg
