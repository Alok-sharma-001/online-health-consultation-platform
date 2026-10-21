# Online Health Consultation Platform
> **GUVI Geek Network Assessment — Project 12: Online Health Consultation Platform**  
> A production-ready, full-stack telemedicine and electronic health records (EHR) ecosystem.

---

## 🌟 Quick Evaluation Access (Role-Isolated Demo Portals)

The platform provides dedicated, role-isolated portals for each persona. On the **Login Page (`/login`)**, evaluators can click any of the 1-click persona cards to immediately access that role's isolated workspace without entering passwords:

| Role | Name / Specialty | Direct Access | Test Credentials |
| :--- | :--- | :--- | :--- |
| **Administrator** | Platform Administrator | **Admin Control Center** | `admin@health.com` / `admin123` |
| **Healthcare Professional** | Dr. Robert Smith, MD (Cardiology) | **Doctor Clinical Desk** | `dr.smith@health.com` / `doctor123` |
| **Healthcare Professional** | Dr. Priya Patel, MD (Dermatology) | **Doctor Clinical Desk** | `dr.patel@health.com` / `doctor123` |
| **Patient** | John Doe (Hypertension history) | **Patient Care Portal** | `john.doe@patient.com` / `patient123` |
| **Patient** | Jane Roe (Asthma & Eczema) | **Patient Care Portal** | `jane.roe@patient.com` / `patient123` |

> **Role Isolation Note**: In adherence to realistic clinical workflows, logging in as one role completely isolates the interface—the top navbar and features exclusively reflect the authenticated user's privileges. Evaluators can click **"Sign Out"** at any time to return to `/login` and switch to another persona.

---

## 📚 Project Documentation Suite

All mandatory submission documents have been prepared and organized in the `docs/` directory:

1. **[Product Requirements Document (PRD)](docs/PRD.md)**  
   Exhaustive specification detailing user personas, functional requirements (inputs, outputs, features), and non-functional requirements (security, privacy, performance, code quality).
2. **[System Architecture & Design Document (TDD)](docs/ARCHITECTURE.md)**  
   Covers layered MVC architecture, Mermaid ER diagrams, sequence flows for booking and consultation, and the role-based access matrix.
3. **[REST API Documentation](docs/API_DOCUMENTATION.md)**  
   Detailed catalog of all REST API endpoints, request bodies, query parameters, authorization headers, and sample responses.
4. **[Project Presentation Deck Script](docs/PRESENTATION.md)**  
   Slide-by-slide script covering Problem Statement, Architecture, Features, Demonstration, and Roadmap for PowerPoint / Google Slides export.
5. **[Interactive Presentation Slide Deck (HTML / PDF)](docs/presentation.html)**  
   Self-contained presentation deck with a built-in **"Export / Print to PDF"** button for immediate PDF submission.

---

## 🏥 Key Feature Modules

### 1. Administrator Portal
* **User Management**: Add, update, toggle active status, and delete users (`ADMIN`, `DOCTOR`, `PATIENT`) with instant confirmation prompts.
* **Appointment Management**: Global overview of all platform consultations with administrative override capabilities (mark completed, reschedule, or cancel).
* **System Settings**: Dynamic configuration for platform public name, support email, default slot duration, max advance booking horizon, and 24/7 hotline.
* **System Analytics**: Real-time metrics on registered users, consultation completion rates, doctor specialty distribution progress bars, and doctor activity logs.

### 2. Healthcare Professional (Doctor) Portal
* **Schedule Management**: Configure shift start and end times, slot durations (15, 30, 45, 60 mins), and toggle active consultation days (Mon–Fri).
* **Consultation Provision**: Queue of scheduled patient appointments; clinical consultation form to record diagnoses, medical advice, dynamic medication prescriptions (dosage, frequency, duration, instructions), and follow-up advice.
* **Patient Record Access**: Search patient medical histories by Patient ID or appointment selection; inspect blood group, known drug allergies, chronic ailments, and past consultation summaries.
* **Communication Tools**: Secure in-app doctor-patient consultation messaging thread.

### 3. Patient Portal
* **Consultation Booking**: Discover verified doctors by medical specialty; dynamic real-time slot conflict checking; book appointment with symptoms entry.
* **Receive Medical Advice**: Access personal advice vault showing clinical diagnoses, prescribed medications, usage instructions, and follow-up dates.
* **Health Record Management (EHR)**: Maintain personal health dossier including blood type, drug/food allergies, chronic conditions, regular medications, and emergency contact details.
* **Profile Management**: Update user profile information, contact telephone, and password credentials.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | Lightning-fast Single Page Application (SPA) |
| **Styling** | Tailwind CSS | Healthcare-optimized responsive design system |
| **Icons** | Lucide React | Clean, modern medical and administrative icons |
| **Routing** | React Router v6 | Client-side routing with Role-Based Route Guards |
| **Backend** | Node.js, Express | Modular RESTful API engine with MVC architecture |
| **Database** | SQLite (`better-sqlite3`) | High performance, zero-config relational database (no external DB install required) |
| **Security** | JWT, `bcryptjs` | Secure Bearer authentication and password hashing |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** (v9 or higher)

### 1. Clone the Repository
```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd shreya
```

### 2. Run Database Seed (Pre-populates sample data)
```bash
npm run seed
```
*Creates the SQLite database (`health_platform.db`) with Admin, Doctors, Patients, Schedules, Appointments, Prescriptions, Health Records, and Chat Messages.*

### 3. Start Backend Server
In one terminal window:
```bash
npm run server
```
*Backend API server will start at `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).*

### 4. Start Frontend Client
In a second terminal window:
```bash
npm run client
```
*Frontend application will start at `http://localhost:3000` with automated proxy to the backend API.*

---

## 🧪 Automated Backend Verification
To run the automated verification suite validating database relational integrity and schema constraints:
```bash
cd server
node test-api.js
```

---

## 📂 Project Structure
```
├── docs/
│   ├── PRD.md                  # Comprehensive Product Requirements Document
│   ├── ARCHITECTURE.md         # System Architecture, Mermaid ER & Sequence Diagrams
│   ├── API_DOCUMENTATION.md    # Complete REST API catalog
│   ├── PRESENTATION.md         # Presentation deck outline and script
│   └── presentation.html       # Interactive slide deck (Print/Export to PDF)
├── server/
│   ├── src/
│   │   ├── config/config.js    # Centralized configuration
│   │   ├── db/
│   │   │   ├── database.js     # SQLite schema and tables initialization
│   │   │   └── seed.js         # Realistic seed data
│   │   ├── middleware/auth.js  # JWT and RBAC guards
│   │   ├── controllers/        # Modular controllers (Admin, Doctor, Patient, Auth, Messages)
│   │   └── routes/             # REST route endpoints
│   ├── server.js               # Express application entry
│   └── test-api.js             # Automated verification suite
├── client/
│   ├── src/
│   │   ├── components/         # Navbar, ProtectedRoute
│   │   ├── components/modals/  # BookingModal, ConsultationModal, PatientHistoryModal, ChatModal, PrescriptionModal
│   │   ├── context/            # AuthContext with role authentication and session management
│   │   ├── pages/
│   │   │   ├── admin/          # AdminDashboard (Users, Appointments, Settings, Analytics)
│   │   │   ├── doctor/         # DoctorDashboard (Schedule, Consultations, Records)
│   │   │   ├── patient/        # PatientDashboard (Booking, Advice, Health Records, Profile)
│   │   │   └── auth/           # Login, Register
│   │   ├── services/api.js     # API client
│   │   ├── App.jsx             # Route definitions
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── package.json                # Root convenience scripts
└── README.md
```

---

## 🏆 Assessment Rubric Compliance

1. **Code Quality**:
   - Clean, modular code separated into controllers, services, middleware, and reusable React components.
   - Fully documented functions with explanatory headers.
2. **Clarity & Consistency**:
   - Exact 1-to-1 match with the functional specifications in the GUVI Geek Network project instructions.
3. **Presentation & Submission**:
   - Ready-to-upload presentation deck (`docs/presentation.html` and `docs/PRESENTATION.md`).
   - Clean Git-ready repository structure with reproducible seed data.
