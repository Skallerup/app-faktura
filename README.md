# Bilag Scanner

PWA-app til at scanne og sende bilag direkte til bogføring via email.

## Opsætning

### 1. Gmail App Password

Du skal bruge en Gmail-konto til at sende billagene fra:

1. Gå til [myaccount.google.com](https://myaccount.google.com)
2. **Sikkerhed** → **2-trinsbekræftelse** (aktiver hvis ikke allerede aktiv)
3. **Sikkerhed** → **App-adgangskoder** → Opret ny
4. Vælg "Mail" og "Windows-computer" → Kopier det 16-cifrede password

### 2. GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create app-faktura --public --push
```

Eller opret manuelt på [github.com](https://github.com/new) og push.

### 3. Vercel Deploy

1. Gå til [vercel.com](https://vercel.com) og log ind
2. **Add New → Project** → Importer dit GitHub repo
3. Under **Environment Variables**, tilføj:
   - `GMAIL_USER` = din@gmail.com
   - `GMAIL_APP_PASSWORD` = dit-app-password
4. Klik **Deploy**

Vercel registrerer automatisk fremtidige pushes til GitHub og deployer.

### 4. Hjemmeskærms-genvej (PWA)

**Android (Chrome):**
- Åbn siden → Menu (⋮) → "Føj til startskærm"

**iPhone/iPad (Safari):**
- Åbn siden → Del-knap → "Føj til hjemmeskærm"

## Lokalt udviklingsmiljø

```bash
# Kopier miljøvariabler
cp .env.local.example .env.local
# Udfyld .env.local med dine værdier

npm install
npm run dev
```

Åbn [http://localhost:3000](http://localhost:3000)

## Teknisk info

- **Framework**: Next.js 15 (App Router)
- **Email**: Nodemailer via Gmail SMTP
- **Deploy**: Vercel (serverless)
- **Database**: Ingen — billagene sendes direkte
- **Filformater**: JPG, JPEG, PNG, PDF (maks 4 MB)
- **Modtager**: 85c3e708ce@inbox.hifranklin.com
