# Product Requirements Document (PRD)
## Project 12: Online Health Consultation Platform

**Author**: Development Team  
**Version**: 1.0.0  
**Target Submission**: Capstone / GUVI Geek Network Evaluation  
**Status**: Approved & In Development  

---

## 1. Project Overview & Vision
The **Online Health Consultation Platform** is a web-based telemedicine system engineered to make healthcare consultations accessible, reliable, and efficient. It enables patients to connect with qualified medical specialists, book appointments, attend consultations, receive digital prescriptions, and maintain their personal health records. Healthcare professionals can manage their consultation hours, conduct consultations, issue clinical advice, and access longitudinal patient histories. Administrators retain complete oversight over platform users, appointment schedules, system-wide configurations, and analytics.

---

## 2. Target User Personas & Use Cases

### 2.1 Administrator
* **Role**: Platform Manager & Auditor.
* **Objectives**:
  * Oversee user registrations and assign roles (`ADMIN`, `DOCTOR`, `PATIENT`).
  * Monitor and manage all system-wide appointment schedules.
  * Adjust operational parameters (slot durations, platform branding, support email, notification triggers).
  * Review analytical metrics (booking volume, consultation completion rate, platform utilization).

### 2.2 Healthcare Professional (Doctor)
* **Role**: Medical Provider & Consultant.
* **Objectives**:
  * Configure recurring working hours and availability slots.
  * Review queued patient consultations and symptom summaries.
  * Conduct consultations, formulate diagnostic assessments, and issue electronic medical advice/prescriptions.
  * Search and review comprehensive patient medical histories.
  * Communicate directly with patients regarding consultations.

### 2.3 Patient
* **Role**: Healthcare Consumer.
* **Objectives**:
  * Discover doctors by specialty and availability.
  * Book consultation appointments with real-time slot conflict checks.
  * Receive and review post-consultation medical advice, dosages, and follow-up guidance.
  * Maintain personal health profile (blood type, known allergies, chronic conditions, emergency contact).
  * Manage account profile and communicate with doctors.

---

## 3. Detailed Functional Specifications

### 3.1 Administrator Functionalities
| Feature ID | Feature Name | Inputs | Outputs | Functionality Description |
| :--- | :--- | :--- | :--- | :--- |
| **ADM-01** | User Management | User details: Name, Email, Password, Role, Specialty, Status | Confirmation message for successful user creation, update, or deletion; updated user table | Full CRUD operations on user accounts. Allows admins to activate or deactivate accounts, reset credentials, and filter by role. |
| **ADM-02** | Appointment Management | Appointment filters (Doctor, Patient, Date, Status) | Confirmation message for updates; comprehensive appointment list | Global overview of all scheduled, completed, and cancelled appointments with override controls to cancel or reschedule. |
| **ADM-03** | System Settings | System configurations (Platform Title, Working Hours Default, Slot Duration, Support Email) | Confirmation message for successful settings update | Dynamic system configuration persisted in database to control operational rules. |
| **ADM-04** | System Analytics | Date range, Metric filters | Analytical reports, KPI count cards, visual charts | Visual metrics on user growth, appointment volume, completion rates, doctor specialty distribution. |

### 3.2 Healthcare Professional (Doctor) Functionalities
| Feature ID | Feature Name | Inputs | Outputs | Functionality Description |
| :--- | :--- | :--- | :--- | :--- |
| **DOC-01** | Schedule Management | Availability schedule (Days of week, Working hours, Slot duration) | Confirmation message for schedule update; refreshed slot schedule | Define weekly recurring shift hours and slot intervals for patient booking. |
| **DOC-02** | Consultation Provision | Patient consultation details, clinical diagnosis, medical advice, prescriptions, follow-up date | Confirmation message for completed consultation; digital prescription record | Document medical findings, enter structured medication guidelines, and mark appointment as completed. |
| **DOC-03** | Patient Record Access | Patient ID or selection from appointment | Patient medical history dossier, past consultations, allergies, existing conditions | Access verified patient medical history to make informed clinical decisions. |
| **DOC-04** | Communication Tools | Message content, recipient patient ID | Message delivery status, consultation chat log | Bidirectional messaging thread between doctor and patient for pre- and post-consultation queries. |

### 3.3 Patient Functionalities
| Feature ID | Feature Name | Inputs | Outputs | Functionality Description |
| :--- | :--- | :--- | :--- | :--- |
| **PAT-01** | Consultation Booking | Doctor selection, Appointment date, Time slot, Symptoms/Reason | Booking confirmation with Appointment ID and schedule summary | Select available doctor and time slot, perform real-time conflict checking, and schedule appointment. |
| **PAT-02** | Receive Medical Advice | Consultation record query | Structured medical advice, diagnosis, prescription list, follow-up advice | View and review post-consultation summaries and digital prescriptions issued by doctors. |
| **PAT-03** | Health Record Management | Health profile details (Blood group, Allergies, Chronic conditions, Emergency contact) | Confirmation of record update; updated personal health dossier | Maintain and update personal health history accessible to consulting physicians. |
| **PAT-04** | Profile Management | Personal details (Name, Phone, Address, Date of Birth, Password) | Updated profile confirmation | Manage personal demographics and account security settings. |

---

## 4. Non-Functional Requirements

### 4.1 Security & Compliance
* **Authentication**: JSON Web Token (JWT) with secure HTTP headers.
* **Authorization**: Role-Based Access Control (RBAC) enforced on both client routes and backend API endpoints.
* **Password Hashing**: Bcrypt with minimum 10 salt rounds.
* **Data Isolation**: Patients can only inspect their own records and advice; doctors can only inspect records of patients with scheduled or completed consultations; admins have auditable oversight.

### 4.2 Usability & Responsiveness
* Clean, medical-grade UI/UX with modern Tailwind CSS design.
* Accessible color contrast (WCAG AA compliant), clear typographic hierarchy, and responsive layout across desktop, tablet, and mobile devices.
* Demo role switcher for instant evaluator inspection without manual credential re-entry.

### 4.3 Reliability & Performance
* Sub-200ms API response time under normal local development loads.
* Relational integrity maintained with foreign key cascades and transactions.
* Self-contained database setup (SQLite) requiring zero external database server installation.

---

## 5. Technology Stack Selection

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | Lightning-fast HMR, component modularity, clean virtual DOM lifecycle. |
| **Styling** | Tailwind CSS | Utility-first, responsive, zero-runtime overhead, medical clean aesthetic. |
| **Icons** | Lucide React | Modern, clean healthcare and operational icon set. |
| **Routing** | React Router v6 | Declarative client-side routing with role guards. |
| **Backend Engine** | Node.js + Express | Lightweight, event-driven RESTful API architecture with MVC layout. |
| **Database** | SQLite (`better-sqlite3`) | High performance, zero external service dependency, instant portability for evaluators. |
| **Security** | `jsonwebtoken`, `bcryptjs` | Industry-standard authentication and password encryption. |

---

## 6. Deliverables Checklist
- [x] Product Requirements Document (`docs/PRD.md`)
- [x] Architecture & Database Schema (`docs/ARCHITECTURE.md`)
- [x] API Specifications (`docs/API_DOCUMENTATION.md`)
- [x] Project Presentation Deck (`docs/PRESENTATION.md` & `docs/presentation.html`)
- [x] Backend Service with Express, SQLite, Auth, RBAC, and Seed Data (`server/`)
- [x] Frontend Application with Admin, Doctor, and Patient Portals (`client/`)
- [x] Complete Setup and Execution Guide (`README.md`)
