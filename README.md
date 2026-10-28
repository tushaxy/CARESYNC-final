# CareSync — India-First AI-Assisted Telemedicine Platform

> Production-ready, deployable telemedicine web platform connecting patients across India with instant AI symptom triage, verified specialists, WebRTC video consults, digital e-prescriptions, and doorstep pharmacy fulfillment.

---

## 1. Architecture Overview

```
                           +-----------------------------------------------+
                           |          CareSync React 18 + Vite             |
                           |       (Tailwind CSS "Calm Clinic" UI)         |
                           +-----------------------+-----------------------+
                                                   |
                        +--------------------------+--------------------------+
                        |                                                     |
                        v                                                     v
      +----------------------------------+                  +----------------------------------+
      |        CareSync AI Assistant     |                  |       WebRTC Video Room          |
      |   - Floating AI Orb              |                  |   - Jitsi External Meet API      |
      |   - Gemini 2.0 Flash / Fallback  |                  |   - Peer-to-Peer Encrypted       |
      |   - Emergency 112/108 Screening  |                  |   - One-Click Doctor Link Share  |
      +-----------------+----------------+                  +-----------------+----------------+
                        |                                                     |
                        +--------------------------+--------------------------+
                                                   |
                                                   v
                           +-----------------------------------------------+
                           |          Express 4 + Node 20 REST API         |
                           |  - Helmet, CORS, Rate Limiters, Multer        |
                           |  - JWT Bearer Authentication (7-day expiry)   |
                           +-----------------------+-----------------------+
                                                   |
                        +--------------------------+--------------------------+
                        |                          |                          |
                        v                          v                          v
      +----------------------------+  +----------------------------+  +----------------------------+
      |       MongoDB Atlas        |  |     Razorpay Test Gateway  |  |    CareSync Pharmacy Hub   |
      | - 25 Bengaluru Doctors     |  | - HMAC SHA256 Verification |  | - 24 SKUs (OTC & Devices)  |
      | - 2,800 Appointment Slots  |  | - Order creation & webhook|  | - Delivery fee rules        |
      | - Prescriptions & Orders   |  | - Zero real money movement |  | - 4-stage tracking status  |
      +----------------------------+  +----------------------------+  +----------------------------+
```

---

## 2. Tech Stack

| Layer | Technologies | Justification & Architecture Notes |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite 5, React Router 6, Tailwind CSS 3, Axios, Lucide React | Clean, high-performance client with custom calm-clinic neumorphic design system. No heavy UI kits. |
| **State Management** | React Context (`AuthContext`, `CartContext`, `ToastContext`) | Lightweight, zero-boilerplate state with JWT in `localStorage` and cart synchronization. |
| **Backend** | Node 20, Express 4, Mongoose 8, Helmet, CORS, Express-Rate-Limit, Multer | Modular architecture with strict input validation and security headers. |
| **Database** | MongoDB Atlas (with automated local embedded fallback) | Document schema storing Doctors, Slots, Appointments, Prescriptions, Medicines, Orders, and ChatSessions. |
| **AI Triage** | Google Gemini REST API (`gemini-2.0-flash`) via Axios | Strict JSON schema generation with red-flag emergency bypass (112/108) and deterministic keyword fallback. |
| **Video Telehealth** | Jitsi Meet WebRTC (`https://meet.jit.si`) | Real peer-to-peer audio/video streaming requiring zero custom signaling infrastructure. |
| **Payment Gateway**| Razorpay Checkout (TEST Mode) | Server-side order creation and cryptographic HMAC SHA-256 signature verification. |

---

## 3. Environment Variables

### `server/.env`
| Variable | Description | Source / Where to obtain |
| :--- | :--- | :--- |
| `PORT` | Backend port (Default: `5000`) | Internal configuration |
| `NODE_ENV` | Environment mode (`development` / `production`) | Internal configuration |
| `MONGO_URI` | MongoDB Atlas connection string | [MongoDB Atlas](https://cloud.mongodb.com) -> Cluster -> Connect |
| `JWT_SECRET` | 64-character random string for signing JWT tokens | Password generator / random crypto string |
| `JWT_EXPIRES` | Token lifetime (Default: `7d`) | Internal configuration |
| `CLIENT_URL` | Frontend origin for CORS (`http://localhost:5173` or Vercel URL) | Deployment URL |
| `GEMINI_API_KEY` | Google AI Studio Gemini API key | [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | Gemini model name (`gemini-2.0-flash`) | Google AI Studio |
| `RAZORPAY_KEY_ID` | Razorpay Test Key ID (`rzp_test_...`) | [Razorpay Dashboard](https://dashboard.razorpay.com) -> Settings -> API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay Test Key Secret | Razorpay Dashboard |

### `client/.env`
| Variable | Description | Source / Where to obtain |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base API URL (Default: `/api` via Vite proxy, or Render backend URL) | Backend deployment URL |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Test Key ID (`rzp_test_...`) | Razorpay Dashboard |

---

## 4. Quickstart (Run Locally)

Run the full project locally with three commands:

```bash
# 1. Install all dependencies across root, server, and client
npm run install-all

# 2. Populate 25 doctors, 24 medicines, 2,800 slots, demo user & prescription
npm run seed

# 3. Boot both server (port 5000) and client (port 5173) concurrently
npm run dev
```

Visit the application in your browser at: **`http://localhost:5173`**

---

## 5. Seed Data & Test Credentials

The database seeder is idempotent (`npm run seed`) and automatically populates:
- **25 Doctors** across Bengaluru (Koramangala, Indiranagar, HSR Layout, Whitefield, Jayanagar, etc.) with coordinates for Haversine distance ranking.
- **24 Pharmacy Products** across OTC, Devices, and Wellness with indicative retail INR prices.
- **2,800 Consultation Slots** spanning 7 days.
- **Pre-configured Demo Account**:
  - **Email:** `demo@caresync.in`
  - **Password:** `Demo@123`
- **1 Completed Video Appointment with Dr. Ananya Iyer** containing a verified sample prescription (Cetirizine 10mg + Calamine lotion) and an initial order so dashboards and medical records are populated upon first login.

---

## 6. Razorpay Test Payment Instructions

CareSync uses **Razorpay Test Mode** only. No real money moves.
- When the payment modal opens:
  - **Card Number:** `4111 1111 1111 1111`
  - **Expiry:** Any future date (e.g. `12/30`)
  - **CVV:** Any 3 digits (e.g. `123`)
  - **OTP:** Any 4 or 6 digits (e.g. `1234`)
- Alternatively, select **UPI** and enter `success@razorpay`.
- On success, the backend verifies the SHA-256 HMAC signature against the secret, confirms the appointment as `paid`, marks the slot as `booked`, and unlocks the Jitsi video room.

---

## 7. Video Consultation Flow

1. **Patient Preflight Check (`/consult/:id`):** Tests device permissions (camera preview and mic check) and confirms private encryption.
2. **In-Room Consultation:** Powered by Jitsi Meet WebRTC. Both the patient and doctor join the private room URL.
3. **Doctor Invite Link:** Press **Copy Invite Link for Doctor** to share the room URL.
4. **Prescription Minting:** Click **End Consultation** to mark the consult completed and automatically issue the e-prescription.

---

## 8. Deployment Guide

### A. Database (MongoDB Atlas)
1. Create a free M0 cluster on [MongoDB Atlas](https://cloud.mongodb.com).
2. Under Network Access, allow access from anywhere (`0.0.0.0/0`).
3. Create a database user and copy the connection string:
   `mongodb+srv://<USER>:<PASSWORD>@cluster0.xxxxx.mongodb.net/caresync`
4. Run `npm run seed` pointing to your Atlas connection string to populate the live database.

### B. Backend (Render)
1. Connect your GitHub repository to [Render](https://render.com) as a **Web Service**.
2. Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add the environment variables from Section 3.
6. Verify the health check at: `https://<your-render-url>/api/health`

### C. Frontend (Vercel)
1. Import the same repository on [Vercel](https://vercel.com).
2. Root Directory: `client`
3. Framework Preset: `Vite`
4. Environment Variables:
   - `VITE_API_URL`: `https://<your-render-url>/api`
   - `VITE_RAZORPAY_KEY_ID`: `rzp_test_...`
5. Deploy and set `CLIENT_URL` on Render to your new Vercel domain.

---

## 9. Assumptions & Design Decisions

1. **Patient-Side Only:** Per the specification, there is no doctor login or doctor-facing dashboard. The doctor joins the consultation directly via the unique invitation link.
2. **Safety First:** Red-flag phrases (chest pain, breathing difficulty, unconsciousness, etc.) short-circuit the AI pipeline immediately to provide national emergency instructions (112 and 108) without querying the model.
3. **Offline Zero-Config Fallback:** If a remote MongoDB instance is not supplied in development, the system launches an embedded in-memory database instance automatically, allowing instant offline demonstrations.
4. **INR Currency Formatting:** All prices render with the Rupee symbol (`₹`) and tabular figures.
