# 🎤 SwasthBridge: Interview Preparation & Architecture Guide

This document is your ultimate cheat-sheet for explaining **SwasthBridge** to an interviewer. It breaks down the architecture, data flow, key algorithms, and the exact database queries powering the system.

---

## 1. The "Elevator Pitch" (Overview)
**What is SwasthBridge?**
"SwasthBridge is a full-stack MERN Hospital Management Ecosystem. I built it to solve the chaos of hospital waiting rooms. Instead of static time slots, it uses a dynamic, mathematically calculated daily token queue that inherently understands doctor shifts and lunch breaks. It also securely connects role-based portals (Admin, Doctor, Patient) and automatically synchronizes pharmacy inventory when a doctor issues a digital prescription."

---

## 2. System Architecture & Data Flow

SwasthBridge follows a standard **Client-Server-Database (3-Tier) Architecture**:

### Layer 1: Frontend (Client Layer)
*   **Tech:** React.js, Vite, Tailwind CSS, Framer Motion.
*   **Role:** Renders the UI and intercepts user inputs. Before sending data to the server, it enforces **strict client-side validation** (e.g., regex testing emails for `@` and `.com`, testing phones for exactly 10 digits).
*   **State & Networking:** Uses `axios` to make HTTP requests. Context API holds the JWT authentication state globally.

### Layer 2: Backend (Business Logic & API Layer)
*   **Tech:** Node.js, Express.js.
*   **Role:** Acts as the middleman. It intercepts HTTP requests, authenticates the JWT bearer token, and runs it through a `roleGuard` middleware to ensure the user has permission (e.g., only `admin` can create doctors). 
*   **Security:** Uses `bcryptjs` to hash passwords before database entry. Re-validates data strictly (protecting against Postman/API-level tampering).

### Layer 3: Database (Persistence Layer)
*   **Tech:** MongoDB (Atlas), Mongoose ORM.
*   **Role:** Stores unstructured NoSQL JSON documents. Connects to Node.js via Mongoose schemas which enforce strict data typing.

---

## 3. Core Algorithms (The "Wow" Factors)

If the interviewer asks *what was the hardest part*, talk about the **Dynamic Queue & Shift Algorithm**.

### Problem: 
Old booking systems use hardcoded "slots" (9:00, 9:20, 9:40). If a doctor takes 5 minutes longer on a patient, the entire schedule fractures. 

### Your Solution: 
You built a **Fluid Token Queue** based on daily resets and interval math.
*   **The Math:** You assign 10 minutes per token. Wait time is calculated by: `(Total Tokens Ahead * 10 mins)`.
*   **Shift Bridging:** The algorithm grabs the doctor's "Morning Shift" and "Afternoon Shift". If the accumulated calculated time hits the lunch break, the algorithm executes a gap-jump, pushing the estimated time exactly to the start of the afternoon shift.
*   **Real-time Math:** Estimated wait times for the patient are calculated by deducting the *current system clock time* from the *calculated token time*.

---

## 4. Database Schema & Relationships

SwasthBridge operates on **5 Primary Tables (Collections)**. Let the interviewer know you understand how pseudo-relational schemas act in NoSQL via `mongoose.Schema.Types.ObjectId`.

**Total Tables (5):**
1. `users`
2. `doctors`
3. `appointments`
4. `medicineinventories`
5. `beds`

**Total Users / Roles (3):**
The `user` table uses a strict Enum for roles: `['patient', 'doctor', 'admin']`.

### The Relational Architecture
*   **User Table (The Root)**: Holds generic auth logic. No foreign keys. (`role, name, email, password, phone`).
*   **Doctor Table (Profile Extension)**: Has a 1-to-1 connection to the User table. 
    *   *Foreign Key:* `user_id` -> references: `User`.
*   **Appointment Table (The Junction)**: Has multiple connections. It is the bridge between Patients and Doctors.
    *   *Foreign Key 1:* `doctor_id` -> references: `Doctor`.
    *   *Foreign Key 2:* `patient_id` -> references: `User` (specifically where role='patient').
*   **Medicine & Bed Tables**: Standalone inventory tracking tables managed strictly by the Admin role.

---

## 5. Exact Queries & Operations (To mention in the interview)

### 1. Authenticating & Populating (The Login Flow)
**Query:** Finding a user by email, and deliberately selecting the password (since it's hidden by default).
```javascript
// AuthController.js
const user = await User.findOne({ email: req.body.email }).select('+password');
const isMatch = await bcrypt.compare(req.body.password, user.password);
```

### 2. Generating the Daily Queue
**Query:** To find a patient's exact token number for *Today*, the system counts all other "booked" or "completed" appointments for that specific doctor, on the current date string.
```javascript
// AppointmentController.js
const todayAppointments = await Appointment.find({
  doctor_id: doctorId,
  date: todayString, // Format: YYYY-MM-DD
  status: { $in: ['booked', 'completed'] }
}).sort({ queue_position: 1 });

const newQueuePosition = todayAppointments.length + 1; // Generates the sequential token
```

### 3. Fluid Pharmacy Sync (Transaction Simulation)
**Operation:** When a doctor completes an appointment and writes a prescription, the system maps over the prescribed medicines array and manually decrements the global inventory.
```javascript
// AppointmentController.js - inside completeAppointment
if (medicines_prescribed && medicines_prescribed.length > 0) {
  for (let item of medicines_prescribed) {
    await MedicineInventory.findOneAndUpdate(
      { medicine_name: item.name },
      { $inc: { quantity: -item.quantity } } // The exact MongoDB Decrement Operator
    );
  }
}
```

### 4. Fetching Filtered Data via Population
**Query:** When a patient views their dashboard, they need to see doctor details. Because NoSQL is non-relational, you heavily utilized Mongoose **Populate** (similar to a SQL JOIN) to cross-reference data.
```javascript
const appointments = await Appointment.find({ patient_id: req.user._id })
  .populate({
    path: 'doctor_id',
    select: 'specialization consultation_fee user_id',
    populate: { path: 'user_id', select: 'name' } // Nested population!
  });
```

---

## 6. Security Implementation

Be ready to explain how you secured the application:
1.  **Dual-Layer Validation:** If an attacker bypasses the frontend React Regex checks using Postman, the Node.js controllers run the exact same `/^\d{10}$/` regex against the payload before database insertion.
2.  **JWT Verification:** A token is passed in the `Authorization: Bearer <token>` header. A specialized `authCheck` middleware intercepts every request, decodes the token using `process.env.JWT_SECRET`, and extracts the `user_id`.
3.  **Role Guards:** An array authorization middleware `protectRole('admin', 'doctor')` checks the decoded user's role. If a 'patient' tries to hit `DELETE /api/doctors/123`, the server throws an HTTP 403 Forbidden.

---

## 7. Common Interview Q&A

**Q: Why MongoDB over SQL for a hospital system?**
> A: "Hospital records, especially changing structures like prescriptions or doctor opd timings, benefit greatly from the flexible schema architecture of NoSQL. If we want to add an array of 'allergies' to an appointment later, MongoDB handles that seamlessly without complex table migrations."

**Q: How did you handle React performance or visual glitches?**
> A: "I utilized `useEffect` carefully to orchestrate data fetching, preventing infinite re-renders. For UI, I relied on Framer Motion's `AnimatePresence` to ensure components mounted and unmounted flawlessly, giving the app a native, premium feel."

**Q: What would you do next to scale this?**
> A: "Right now the wait times are fetched strictly on HTTP requests. I would integrate `Socket.io` to establish full-duplex WebSocket connections so that when the doctor completes an appointment, the next patient's phone automatically updates its wait-time live without refreshing the page."
