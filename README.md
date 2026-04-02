# 🏥 SwasthBridge – Advanced Hospital Ecosystem

> **SwasthBridge** is a premium, full-stack hospital inventory and patient management ecosystem. Designed around a "Premium Tech Stack" visual aesthetic (Navy & Teal), it digitally connects medical operations, calculating mathematically precise patient queues, synchronizing live pharmacy deductions, and securing data through encrypted RBAC routing.

---

## 🚀 Technological Architecture

| Layer | Technology |
|---|---|
| **Frontend UI** | React 18, Vite, Framer Motion, Tailwind CSS v3 (Deep Navy & Teal Dark Theme) |
| **Backend Engine**| Node.js + Express.js |
| **Database** | MongoDB (Atlas compatible) + Mongoose |
| **Authentication**| JWT Bearer Tokens + bcryptjs |
| **Iconography** | Lucide React |

---

## 🔥 Core Engineering Features

### ⏱️ Mathematically Precise Queuing & Scheduling
- **Two-Shift OPD Calculations:** The queue logic natively understands "lunch breaks". Calculations seamlessly bridge across morning and afternoon shifts.
- **Dynamic Live Queues:** Token wait times are mathematically estimated in real-time based on strict 10-minute intervals and the doctor's specific shift schedules.
- **Daily Reset Engine:** The queue resets daily, simulating a true reception window scenario.
- **Leave Management Matrix:** Doctors can mark specific calendar dates as leave; the booking engine fundamentally refuses to issue tokens on those locked dates.

### 💊 Fluid Pharmacy Synchronization
- **Live Deductions:** When a doctor issues a digital prescription via the dashboard, the central `MedicineInventory` is simultaneously queried and debited.
- **Stock Depletion Warnings:** Restocking bounds alert the Admin if a drug drops below a defined threshold (`< 20 units limit`).

### 🛡️ Iron-Clad Registration & Validation
- **Strict Registration Protocols:** Only `patients` may self-register via the public portal. The creation of `Doctors` and `Admin` personnel is forcefully routed through secure Admin-only endpoints.
- **Advanced Pattern Blocking:** API endpoints and React forms strictly validate payload shapes—e.g. `phone` numbers strictly to 10 digits and `email` explicitly requiring `@` and `.com` TLDs, aggressively protecting DB integrity from junk formatting.

---

## 📋 Role Matrices

### 🧑‍💼 Patient Portal
- Book OPD appointments respecting doctor shift timelines and leave dates.
- Observe a personalized queue dashboard with minute-exact Wait Time estimates based on clock progression.
- Read historical prescriptions.
- Query global doctor queues and live Bed Availability.

### 👨‍⚕️ Doctor Dashboard
- Complete consultations visually, appending digital prescriptions directly to a patient's historical medical jacket.
- Tweak daily OPD Shift start/endpoints and assign holiday leave dates.

### 🏥 Administrator Terminal
- Gain bird's-eye analytical counts for live operations (stock metrics, personnel counts).
- Route and provision custom accounts for all newly hired Hospital Staff.
- Dictate medicine inventories and hospital bed allocations.

---

## 🗂️ Geometrical Project Structure

```
SwasthyaBridge/
├── backend/              # Node.js + Express API
│   ├── config/           # MongoDB tunnel connectivity
│   ├── controllers/      # Engine logic (Queue Math, DB checks)
│   ├── middleware/       # Deep JWT token interception & verification
│   ├── models/           # Mongoose schemas (strict definitions)
│   ├── routes/           # Mapped Express endpoints
│   ├── utils/            # Seeder payload
│   ├── .env              # Application keys
│   └── server.js         # Port ignition
└── frontend/             # Single Page Application
    └── src/
        ├── api/          # Axios interception
        ├── components/   # Floating Glass UI cards, Navbars
        ├── contexts/     # Auth states
        └── pages/        # Protected RBAC rendering layers
```

---

## ⚙️ Ignition Instructions

### Prerequisites
- Node.js v18+
- Active MongoDB instance at port 27017

### 1. Engine Start & Seed
Ensure dependencies are built and seed your initial hospital ecosystem:
```bash
cd backend
npm install
node utils/seeder.js
```
*Seeder auto-generates 60 beds, 10 medicines, and demo authentication targets.*

Configure your `.env` locally:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/swasthbridge
JWT_SECRET=production_ready_secret_key_0x00
JWT_EXPIRE=7d
```

Start the primary backend tunnel:
```bash
node server.js
# System mounts on localhost:5000
```

### 2. Frontend Spin-Up
```bash
cd frontend
npm install
npm run dev
# Vite runs on localized http://localhost:5173
```

---

## 🧪 Demo Verification Keys

Log in seamlessly via the pre-populated interface or explicitly using:
```
Admin   → admin@swasthbridge.com / admin123
Doctor  → priya@swasthbridge.com / doctor123
Patient → patient@swasthbridge.com / patient123
```
