# ☁️ Cloudflare R2 Object Storage Credentials & Configuration

> **Project:** White-Label E-commerce (Client: Demo / Plexivia)  
> **Target Domain:** `api.plexivia.online`  
> **Last Updated:** September 12, 2026  

---

## 🔑 1. R2 API & Storage Credentials

| Parameter | Value |
| :--- | :--- |
| **Account ID** | `fa0942a4bd8e442e22f78fdb6a2a605a` |
| **Access Key ID** | `5f0500c118548702bac32a3d027bc355` |
| **Secret Access Key** | `78903a1d53535384109a104e7a49e2c85ab6d08936f645124430a41c32b051c7` |
| **S3 API Endpoint** | `https://fa0942a4bd8e442e22f78fdb6a2a605a.r2.cloudflarestorage.com` |
| **R2 Bucket Name** | `client-hub` |
| **Public Asset URL** | `https://media.engulfic.com` |
| **Storage Prefix / Path** | `uploads/` |

---

## 🛠️ 2. Environment Configuration (`backend.env`)

These credentials have been configured into the production environment file at `/opt/demo/configs/backend.env`:

```env
# Cloudflare R2 Object Storage
R2_ACCOUNT_ID=fa0942a4bd8e442e22f78fdb6a2a605a
R2_ACCESS_KEY_ID=5f0500c118548702bac32a3d027bc355
R2_SECRET_ACCESS_KEY=78903a1d53535384109a104e7a49e2c85ab6d08936f645124430a41c32b051c7
R2_BUCKET_NAME=client-hub
R2_PUBLIC_URL=https://media.engulfic.com
R2_SYNC_ENABLED=true
R2_SYNC_INTERVAL_DAYS=1
```

---

## 🔄 3. How Uploads & R2 Sync Work

1. **Local Staging**: Uploaded assets (product pictures, hero sliders, categories, etc.) are first written to the local uploads directory mounted at `/opt/demo/uploads`.
2. **Nginx Fast Delivery**: Nginx delivers cached static assets directly through `/uploads/` route from `/opt/demo/uploads/`.
3. **Automated R2 Differential Synchronization**: The backend background scheduler (`r2Sync.service.js`) periodically scans the local uploads and synchronizes new or updated assets directly into Cloudflare R2 bucket `client-hub`.
4. **On-Demand Synchronization**: Can also be triggered directly via API endpoint:
   ```bash
   POST https://api.plexivia.online/api/media-audit/r2-sync
   ```
