# 🚀 White-Label E-commerce (Demo / Plexivia) — Deployment & Credentials Reference

> **Environment:** Production Instance  
> **Client ID:** `00` (Key: `demo`)  
> **Primary Domain:** `plexivia.online`  
> **Dashboard (Cloudflare Pages):** [https://dashboard.plexivia.online](https://dashboard.plexivia.online)  
> **Backend REST API (GCP VM):** [https://api.plexivia.online](https://api.plexivia.online)  
> **Host Server:** Google Cloud Platform (`mat-server`, Mumbai `asia-south1-a` - `35.200.130.118`)  
> **Cloudflare Pages Project:** `plexivia-dashboard` (`https://plexivia-dashboard.pages.dev`)  
> **Last Updated:** September 12, 2026  

---

## 🌐 ১. লাইভ ডোমেন ও এন্ডপয়েন্ট তালিকা

| সার্ভিস | লাইভ URL | প্ল্যাটফর্ম / হোস্টিং | স্ট্যাটাস |
| :--- | :--- | :--- | :--- |
| **👑 Admin Dashboard** | [https://dashboard.plexivia.online](https://dashboard.plexivia.online) | Cloudflare Pages (`plexivia-dashboard`) | 🟢 Live (200 OK, Edge CDN) |
| **⚡ Direct Pages URL** | [https://plexivia-dashboard.pages.dev](https://plexivia-dashboard.pages.dev) | Cloudflare Pages Global Network | 🟢 Live (200 OK) |
| **🔌 Backend REST API** | [https://api.plexivia.online](https://api.plexivia.online) | GCP VM (`35.200.130.118:5095`) via Nginx | 🟢 Live (200 OK, Healthy) |
| **🗄️ Database Engine** | `demo-mongodb-live` | Docker on GCP VM (`127.0.0.1:27019`) | 🟢 Connected (`demo-db`) |
| **☁️ Media / File Uploads** | Cloudflare R2 (`client-hub`) | [https://media.engulfic.com](https://media.engulfic.com) | 🟢 R2 Sync Active |

---

## ☁️ ২. Cloudflare Pages ড্যাশবোর্ড ডিপ্লয়মেন্ট বিস্তারিত

* **Project Name:** `plexivia-dashboard`
* **Account ID:** `fa0942a4bd8e442e22f78fdb6a2a605a`
* **Custom Domain:** `dashboard.plexivia.online` (CNAME `plexivia-dashboard.pages.dev`, Active & Verified)
* **SPA Routing:** `_redirects` রুল যুক্ত (`/*  /index.html  200`) যাতে পেজ রিলোড দিলে 404 না আসে।
* **API Base URL:** `https://api.plexivia.online`

### ড্যাশবোর্ড আপডেট ও রি-ডিপ্লয় করার কমান্ড:
```bash
cd d:\mtEcomWhite
node scripts/sync-config.js demo

cd d:\mtEcomWhite\dashboard
$env:VITE_API_BASE_URL="https://api.plexivia.online"
$env:VITE_CLIENT="demo"
npm run build

$env:CLOUDFLARE_API_TOKEN="[REDACTED_CLOUDFLARE_TOKEN]"
$env:CLOUDFLARE_ACCOUNT_ID="fa0942a4bd8e442e22f78fdb6a2a605a"
npx wrangler pages deploy dist --project-name=plexivia-dashboard --branch=main --commit-dirty=true
```

---

## 🖥️ ৩. ব্যাকএন্ড ও সার্ভার কানেকশন (GCP VM)

* **Server IP:** `35.200.130.118`
* **SSH Login:** `ssh root@35.200.130.118` (বা `ssh mat-server`)
* **Code Path:** `/opt/live` (Branch: `Live`)
* **Configs Path:** `/opt/demo/configs`
* **Uploads Staging:** `/opt/demo/uploads`
* **Backend Host Port:** `5095`
* **MongoDB Host Port:** `27019`

---

## 🗄️ ৪. ডাটাবেস ক্রেডেনশিয়াল (MongoDB)

* **User:** `admin`
* **Password:** `PlexiviaPass2026`
* **Database:** `demo-db`
* **Internal Docker URI:** `mongodb://admin:PlexiviaPass2026@demo-mongodb-live:27017/demo-db?authSource=admin`
* **Local Host URI:** `mongodb://admin:PlexiviaPass2026@127.0.0.1:27019/demo-db?authSource=admin`

---

## ☁️ ৫. ক্লাউডফ্লেয়ার R2 অবজেক্ট স্টোরেজ

* **Account ID:** `fa0942a4bd8e442e22f78fdb6a2a605a`
* **Access Key ID:** `5f0500c118548702bac32a3d027bc355`
* **Secret Access Key:** `78903a1d53535384109a104e7a49e2c85ab6d08936f645124430a41c32b051c7`
* **S3 Endpoint:** `https://fa0942a4bd8e442e22f78fdb6a2a605a.r2.cloudflarestorage.com`
* **Bucket Name:** `client-hub`
* **Public Asset URL:** `https://media.engulfic.com`
