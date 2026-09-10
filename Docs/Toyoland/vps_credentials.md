# Toyoland — BDIX VPS 2 Login & Server Credentials

This document stores the complete login credentials, SSH access, control panel information, and billing details for the **Toyoland BDIX VPS 2** server hosted with **Putul Host**.

---

## 1. VPS Server & SSH Root Login

| Parameter | Details |
| :--- | :--- |
| **Server Hostname** | `host.toyoland.com` |
| **Main IP Address** | `144.79.218.122` |
| **SSH Username** | `root` |
| **SSH Port** | `22` |
| **Root Password** | `P@ss02654` |
| **Direct SSH Command** | `ssh root@144.79.218.122` |

---

## 2. VPS Management Control Panel

| Parameter | Details |
| :--- | :--- |
| **Panel URL (Primary)** | [http://vps-bdix.webxlogin.com](http://vps-bdix.webxlogin.com) |
| **Panel URL (Alternative / Direct Port)** | [http://vpsus.webrserver.com:4083/](http://vpsus.webrserver.com:4083/) |
| **Control Panel Username** | `hosttoyo` |
| **Control Panel Password** | `P@ss02654` |
| **Features** | Server Reboot, Rebuild OS, VNC Console, Bandwidth & Resource Monitoring |

---

## 3. Service & Billing Details

| Parameter | Details |
| :--- | :--- |
| **Provider** | Putul Host ([https://putulhost.com](https://putulhost.com)) |
| **Service Plan** | BDIX VPS 2 |
| **Client Name** | MD Omer Faruk |
| **Amount** | TK 950.00 BDT |
| **Billing Cycle** | 1 Month |
| **Next Due Date** | 10/10/2026 |
| **Payment Method** | bKash Payment Instant |

---

## 4. Quick Connection Instructions

### A. Windows PowerShell / macOS / Linux Terminal
```bash
ssh root@144.79.218.122
# When prompted for password, enter: P@ss02654
```

### B. PuTTY SSH Client
1. **Host Name (or IP address):** `144.79.218.122`
2. **Port:** `22`
3. **Connection Type:** `SSH`
4. Click **Open**
5. Login as: `root`
6. Password: `P@ss02654`

### C. MongoDB Compass (SSH Tunnel Access)
1. **Host:** `mongodb://localhost:27017`
2. **Proxy / SSH Tunnel Tab:**
   - **Proxy Method:** `SSH with Password`
   - **SSH Hostname:** `144.79.218.122`
   - **SSH Port:** `22`
   - **SSH Username:** `root`
   - **SSH Password:** `P@ss02654`
