# 🚀 White-Label E-commerce (Demo / Plexivia) — Deployment & Credentials Reference

> **Environment:** Production Instance (Isolated)  
> **Client ID:** `00` (Key: `demo`)  
> **Primary Domain:** `plexivia.online`  
> **Backend API URL:** [https://api.plexivia.online](https://api.plexivia.online)  
> **Admin Dashboard URL:** [https://admin.plexivia.online](https://admin.plexivia.online)  
> **Host Server:** Google Cloud Platform (`mat-server`, Mumbai `asia-south1-a`)  
> **Host IP:** `35.200.130.118`  
> **Date:** September 12, 2026  

---

## 📌 ১. সার্ভার ও কানেকশন তথ্য (Server Connection)

| প্রপার্টি | বিস্তারিত বিবরণ |
| :--- | :--- |
| **সার্ভার পাবলিক আইপি** | `35.200.130.118` |
| **হোস্টিং প্রোভাইডার** | Google Cloud Platform (Compute Engine VM) |
| **SSH ইউজার** | `root` |
| **SSH লগইন কমান্ড** | `ssh root@35.200.130.118` (বা লোকাল পিসি থেকে `ssh mat-server`) |
| **কোডবেস পাথ** | `/opt/live` (Repository: `https://github.com/ikram3031/mtEcomWhite.git`, Branch: `Live`) |
| **ক্লায়েন্ট কনফিগারেশন পাথ** | `/opt/demo/configs` |
| **ক্লায়েন্ট আপলোড স্টোরেজ** | `/opt/demo/uploads` |

---

## 🌐 ২. পোর্ট ও ডোমেন রাউটিং (Isolated Routing)

সার্ভারে Monsur Ali Travels এর লাইভ এবং ডেভ প্রজেক্ট চলছে। কোনো ধরনের পোর্ট কনফ্লিক্ট ছাড়া ডেমো প্রজেক্টটি নিচের নির্দিষ্ট পোর্টে পরিচালিত হচ্ছে:

| সার্ভিস | ডোমেন / এন্ডপয়েন্ট | অভ্যন্তরীণ হোস্ট পোর্ট | প্রোটোকল / রিভার্স প্রক্সি |
| :--- | :--- | :--- | :--- |
| **Backend REST API** | [https://api.plexivia.online](https://api.plexivia.online) | `5095` | Nginx ➔ `127.0.0.1:5095` (SSL Active) |
| **MongoDB Engine** | `demo-mongodb-live` | `27019` | Docker Network (`client-network`), Host `127.0.0.1:27019` |
| **Admin Dashboard** | [https://admin.plexivia.online](https://admin.plexivia.online) | `8019` | Nginx ➔ `127.0.0.1:8019` |

---

## 🗄️ ৩. ডাটাবেস ক্রেডেনশিয়াল (MongoDB Credentials)

* **Database Engine:** MongoDB 7.0 (Docker container: `demo-mongodb-live`)
* **Root Username:** `admin`
* **Root Password:** `PlexiviaPass2026`
* **Database Name:** `demo-db`
* **Internal Docker URI:** `mongodb://admin:PlexiviaPass2026@demo-mongodb-live:27017/demo-db?authSource=admin`
* **Host Local Connection:** `mongodb://admin:PlexiviaPass2026@127.0.0.1:27019/demo-db?authSource=admin`

---

## ☁️ ৪. ক্লাউডফ্লেয়ার R2 অবজেক্ট স্টোরেজ (Media & Uploads)

* **Account ID:** `fa0942a4bd8e442e22f78fdb6a2a605a`
* **Access Key ID:** `5f0500c118548702bac32a3d027bc355`
* **Secret Access Key:** `78903a1d53535384109a104e7a49e2c85ab6d08936f645124430a41c32b051c7`
* **S3 Endpoint:** `https://fa0942a4bd8e442e22f78fdb6a2a605a.r2.cloudflarestorage.com`
* **Bucket Name:** `client-hub`
* **Public Asset URL:** `https://media.engulfic.com`

---

## 🔒 ৫. এসএসএল ও এনজিনএক্স কনফিগারেশন (Nginx Reverse Proxy)

* **SSL সার্টিফিকেট:** `/etc/letsencrypt/live/admin.plexivia.online/fullchain.pem`
* **SSL প্রাইভেট কি:** `/etc/letsencrypt/live/admin.plexivia.online/privkey.pem`
* **Nginx কনফিগ পাথ:** `/etc/nginx/sites-available/demo-ecommerce` (সক্রিয়: `/etc/nginx/sites-enabled/demo-ecommerce`)

---

## 🛠️ ৬. প্রয়োজনীয় কমান্ডস ও মেইনটেনেন্স

```bash
# ১. ডকার কনটেইনারের স্ট্যাটাস দেখা:
docker ps --filter "name=demo"

# ২. ব্যাকএন্ডের লাইভ লগ দেখা:
docker logs -f demo-backend-live

# ৩. ডাটাবেসের লাইভ লগ দেখা:
docker logs -f demo-mongodb-live

# ৪. নতুন কোড আপডেট ও ডিপ্লয় করা:
cd /opt/live
git pull origin Live
make deploy CLIENT=demo

# ৫. শুধু ব্যাকএন্ড রিস্টার্ট করা:
docker restart demo-backend-live
```
