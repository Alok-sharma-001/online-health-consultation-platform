import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar,
  ClipboardList,
  Heart,
  User,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  Pill,
  Stethoscope,
  XCircle,
  FileCheck,
  Save,
  Printer,
  ChevronRight,
  RotateCw,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import BookingModal from '../../components/modals/BookingModal';
import ChatModal from '../../components/modals/ChatModal';
import PrescriptionModal from '../../components/modals/PrescriptionModal';

export default function PatientDashboard() {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Active tab directly derived from route path to ensure top Navbar works immediately
  const getActiveTab = () => {
    if (location.pathname.includes('/advice')) return 'advice';
    if (location.pathname.includes('/records')) return 'records';
    if (location.pathname.includes('/profile')) return 'profile';
    return 'book';
  };

  const activeTab = getActiveTab();
  const [consultationSubTab, setConsultationSubTab] = useState('ALL'); // 'ALL', 'UPCOMING', 'PAST'
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicalAdviceList, setMedicalAdviceList] = useState([]);
  const [healthRecord, setHealthRecord] = useState({
    bloodGroup: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    password: '',
  });

  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', text: '' });

  // Modals
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [activeChatApt, setActiveChatApt] = useState(null);
  const [viewingPrescription, setViewingPrescription] = useState(null);

  const notify = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification({ type: '', text: '' }), 4000);
  };

  const loadDoctors = async () => {
    try {
      let query = specialtyFilter ? `?specialty=${encodeURIComponent(specialtyFilter)}` : '';
      const res = await api.getDoctors(query);
      if (res.success) setDoctors(res.doctors);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await api.getPatientAppointments();
      if (res.success) setAppointments(res.appointments);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const loadMedicalAdvice = async () => {
    try {
      const res = await api.getMedicalAdvice();
      if (res.success) setMedicalAdviceList(res.medicalAdvice);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const loadHealthRecord = async () => {
    try {
      const res = await api.getHealthRecord();
      if (res.success && res.healthRecord) {
        setHealthRecord(res.healthRecord);
      }
    } catch (err) {
      notify('error', err.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'book') {
      Promise.all([loadDoctors(), loadAppointments(), loadMedicalAdvice()]).finally(() => setLoading(false));
    } else if (activeTab === 'advice') {
      loadMedicalAdvice().finally(() => setLoading(false));
    } else if (activeTab === 'records') {
      loadHealthRecord().finally(() => setLoading(false));
    } else if (activeTab === 'profile') {
      setLoading(false);
    }
  }, [activeTab, specialtyFilter]);

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await api.cancelAppointment(id);
      notify('success', res.message);
      loadAppointments();
    } catch (err) {
      notify('error', err.message);
    }
  };

  const handleSaveHealthRecord = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateHealthRecord(healthRecord);
      notify('success', res.message);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateProfile(profileForm);
      notify('success', res.message);
      refreshUser();
    } catch (err) {
      notify('error', err.message);
    }
  };

  // Re-book / follow up with doctor
  const handleFollowUpBooking = (doctorId, doctorName, specialty) => {
    const docObj = doctors.find((d) => d.id === doctorId) || {
      id: doctorId,
      name: doctorName,
      specialty: specialty,
    };
    setBookingDoctor(docObj);
  };

  // Open prescription slip modal
  const handleViewPrescription = (apt) => {
    // Check if in medical advice list for rich prescription
    const adviceMatch = medicalAdviceList.find((adv) => adv.appointmentId === apt.id);
    if (adviceMatch) {
      setViewingPrescription(adviceMatch);
    } else {
      setViewingPrescription({
        appointmentId: apt.id,
        doctorName: apt.doctorName,
        doctorSpecialty: apt.doctorSpecialty,
        appointmentDate: apt.appointmentDate,
        timeSlot: apt.timeSlot,
        diagnosis: apt.diagnosis || 'Clinical Consultation',
        medicalAdvice: apt.medicalAdvice || 'Follow medical regimen discussed during the appointment.',
        prescriptions: apt.prescriptions || [],
        patientName: user.name,
        patientId: user.id,
      });
    }
  };

  const upcomingAppointments = appointments.filter((a) => a.status === 'SCHEDULED');
  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Patient Health Profile Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-sky-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] uppercase tracking-wider font-extrabold bg-teal-400/20 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-400/30">
              Personal Health Dossier
            </span>
            <span className="text-xs text-sky-300 font-mono">ID: {user?.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {user?.name || 'Patient'}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Book consultations with specialist doctors, review official prescription slips, manage follow-ups, and track your medical history.
          </p>
        </div>

        <div className="text-right hidden md:block">
          <span className="text-xs text-teal-300 font-medium block">Current View:</span>
          <span className="text-sm font-black text-white uppercase tracking-wider bg-white/10 px-3 py-1 rounded-lg inline-block mt-0.5 border border-white/10">
            {activeTab === 'book' ? '📅 Consultations & Booking' : activeTab === 'advice' ? '💊 Prescriptions & Advice' : activeTab === 'records' ? '📂 Personal Health Record' : '👤 Profile Settings'}
          </span>
        </div>
      </div>

      {/* Patient Vitals Quick Snapshot Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Upcoming Visits</span>
            <span className="text-xl font-black text-slate-900">{upcomingAppointments.length}</span>
            <span className="text-[10px] text-sky-600 font-medium block">Scheduled slots</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Completed Consultations</span>
            <span className="text-xl font-black text-slate-900">{completedAppointments.length}</span>
            <span className="text-[10px] text-emerald-600 font-medium block">Prescriptions on file</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Blood Group</span>
            <span className="text-xl font-black text-rose-600">
              {healthRecord.bloodGroup || 'O+'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">Verified donor group</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Allergy Alerts</span>
            <span className="text-xs font-bold text-slate-800 truncate block max-w-[120px]">
              {healthRecord.allergies && healthRecord.allergies !== 'None reported' ? healthRecord.allergies : 'No allergies'}
            </span>
            <span className="text-[10px] text-amber-600 font-medium block">Logged in EHR</span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification.text && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 border shadow-sm transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: CONSULTATIONS & APPOINTMENTS                      */}
      {/* ======================================================== */}
      {activeTab === 'book' && (
        <div className="space-y-8">
          {/* Sub-navigation for My Consultations */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">My Consultation Encounters & History</h3>
                <p className="text-xs text-slate-500">
                  Review upcoming sessions or view past clinical diagnoses and official prescription slips.
                </p>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setConsultationSubTab('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    consultationSubTab === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>All ({appointments.length})</span>
                </button>
                <button
                  onClick={() => setConsultationSubTab('UPCOMING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    consultationSubTab === 'UPCOMING'
                      ? 'bg-sky-600 text-white'
                      : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                  }`}
                >
                  <span>Upcoming ({upcomingAppointments.length})</span>
                </button>
                <button
                  onClick={() => setConsultationSubTab('PAST')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    consultationSubTab === 'PAST'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <span>Past Consultations ({completedAppointments.length})</span>
                </button>
              </div>
            </div>

            {/* Appointments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appointments
                .filter((apt) => {
                  if (consultationSubTab === 'UPCOMING') return apt.status === 'SCHEDULED';
                  if (consultationSubTab === 'PAST') return apt.status === 'COMPLETED';
                  return true;
                })
                .map((apt) => {
                  const isCompleted = apt.status === 'COMPLETED';

                  return (
                    <div
                      key={apt.id}
                      className={`bg-white rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                        isCompleted
                          ? 'border-emerald-200/90 hover:border-emerald-300 ring-1 ring-emerald-50'
                          : 'border-sky-200/90 hover:border-sky-300 ring-1 ring-sky-50'
                      }`}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                apt.doctorAvatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctorName)}&background=0284c7&color=fff`
                              }
                              alt=""
                              className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200"
                            />
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{apt.doctorName}</h4>
                              <span className="text-xs font-semibold text-sky-600 block">{apt.doctorSpecialty}</span>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : apt.status === 'SCHEDULED'
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>

                        {/* Schedule & Complaint Strip */}
                        <div className="mt-3.5 p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
                          <div className="flex justify-between text-slate-700">
                            <span className="text-slate-400 font-medium">Date & Slot:</span>
                            <span className="font-bold text-slate-900 font-mono">
                              {apt.appointmentDate} ({apt.timeSlot})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/50">
                            <span className="font-semibold text-slate-700">Complaint:</span> {apt.reason || 'General Teleconsultation'}
                          </div>
                        </div>

                        {/* Completed Advice Highlight */}
                        {isCompleted && (
                          <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                              Prescribed Diagnosis & Advice Ready
                            </span>
                            <p className="text-slate-600 text-[11px]">
                              Your doctor has finalized clinical findings and authorized your digital prescription.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setActiveChatApt(apt)}
                            className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Consultation Chat</span>
                          </button>

                          {apt.status === 'SCHEDULED' && (
                            <button
                              onClick={() => handleCancelAppointment(apt.id)}
                              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>

                        {/* Completed Encounter Actions: View Prescription & Book Follow-up */}
                        {isCompleted && (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => handleViewPrescription(apt)}
                              className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs transition"
                            >
                              <Printer className="w-3 h-3" />
                              <span>View Rx Slip</span>
                            </button>

                            <button
                              onClick={() => handleFollowUpBooking(apt.doctorId, apt.doctorName, apt.doctorSpecialty)}
                              className="w-full py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition"
                            >
                              <RotateCw className="w-3 h-3" />
                              <span>Book Follow-up</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

              {appointments.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                  You have not scheduled any consultations yet. Explore verified medical specialists below to book!
                </div>
              )}
            </div>
          </div>

          {/* Section B: Find & Book Specialist Doctors */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-sky-600" />
                  <span>Explore Verified Healthcare Specialists</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select a certified specialist, browse available shifts, and book your online health consultation.
                </p>
              </div>

              {/* Specialty filter */}
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="">All Medical Specialties</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="General Medicine">General Medicine</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={
                        doc.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=0284c7&color=fff`
                      }
                      alt=""
                      className="w-13 h-13 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                      <span className="text-xs font-semibold text-sky-600 block">{doc.specialty}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{doc.phone || doc.email}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      Active Teleconsult
                    </span>
                    <button
                      onClick={() => setBookingDoctor(doc)}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 flex items-center gap-1 transition"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Slot</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MEDICAL ADVICE & DIGITAL PRESCRIPTIONS           */}
      {/* ======================================================== */}
      {activeTab === 'advice' && (
        <div className="space-y-4 max-w-4xl">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Medical Advice & Prescriptions Vault</h3>
            <p className="text-xs text-slate-500">
              Access your complete consultation archive, doctors' clinical diagnoses, digital prescriptions, and follow-up schedules.
            </p>
          </div>

          {medicalAdviceList.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-400 space-y-2">
              <ClipboardList className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <span className="font-semibold text-slate-600 text-sm block">No consultation records yet</span>
              <p className="text-slate-400 max-w-md mx-auto">
                Once a doctor finishes examining you during an online consultation, their formal diagnosis, medication schedule, and lifestyle advice will appear here permanently.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {medicalAdviceList.map((adv) => (
                <div
                  key={adv.consultationId}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  {/* Doctor & Date Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-sm">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{adv.doctorName}</h4>
                        <span className="text-xs text-sky-600 font-semibold">{adv.doctorSpecialty} &bull; CurePulse Medical Board</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-slate-900 text-xs block">{adv.appointmentDate}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{adv.timeSlot}</span>
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-xl text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-900 block">
                      Clinical Assessment & Diagnosis
                    </span>
                    <p className="text-slate-900 font-bold text-sm">{adv.diagnosis}</p>
                    {adv.reason && (
                      <span className="text-[11px] text-slate-500 italic block">
                        Reason for Consultation: {adv.reason}
                      </span>
                    )}
                  </div>

                  {/* Prescribed Medications Table */}
                  {adv.prescriptions && adv.prescriptions.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-serif font-black text-sky-700 italic">℞</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Prescribed Medication Schedule ({adv.prescriptions.length})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        {adv.prescriptions.map((rx, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1"
                          >
                            <span className="font-bold text-slate-900 block text-xs">
                              💊 {rx.medicine} {rx.dosage && `(${rx.dosage})`}
                            </span>
                            <div className="text-slate-600 text-[11px] space-y-0.5">
                              <div>Frequency: <span className="font-semibold text-slate-800">{rx.frequency}</span></div>
                              {rx.duration && <div>Duration: <span className="font-semibold text-slate-800">{rx.duration}</span></div>}
                              {rx.instructions && <div>Instructions: <span className="italic">{rx.instructions}</span></div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Doctor's Lifestyle Guidance */}
                  <div className="text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Physician's Guidance & Recommendations
                    </span>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-medium">
                      {adv.medicalAdvice}
                    </p>
                  </div>

                  {/* Follow-up Strip and Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      {adv.followUpDate ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Follow-up Recommended: {adv.followUpDate}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Regular routine follow-up as needed</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewPrescription(adv)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View / Print Official Rx</span>
                      </button>

                      <button
                        onClick={() => handleFollowUpBooking(adv.doctorId, adv.doctorName, adv.doctorSpecialty)}
                        className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Schedule Follow-up</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: HEALTH RECORD MANAGEMENT (EHR)                    */}
      {/* ======================================================== */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-2xl">
          <div className="border-b border-slate-100 pb-3 mb-5">
            <h3 className="font-bold text-slate-900 text-base">Personal Health Record (EHR) Dossier</h3>
            <p className="text-xs text-slate-500">
              Maintain your medical background so doctors can cross-check allergies and current medications during consultation.
            </p>
          </div>

          <form onSubmit={handleSaveHealthRecord} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={healthRecord.bloodGroup || 'Not Specified'}
                  onChange={(e) => setHealthRecord({ ...healthRecord, bloodGroup: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="Not Specified">Not Specified</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Known Drug & Food Allergies <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Peanuts, Sulfa"
                  value={healthRecord.allergies || ''}
                  onChange={(e) => setHealthRecord({ ...healthRecord, allergies: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Existing Chronic Medical Conditions</label>
              <textarea
                rows={2}
                placeholder="e.g. Hypertension, Asthma, Type 2 Diabetes"
                value={healthRecord.chronicConditions || ''}
                onChange={(e) => setHealthRecord({ ...healthRecord, chronicConditions: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Regular Medications</label>
              <input
                type="text"
                placeholder="e.g. Metformin 500mg, Lisinopril 10mg"
                value={healthRecord.currentMedications || ''}
                onChange={(e) => setHealthRecord({ ...healthRecord, currentMedications: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Emergency Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Mary Doe (Spouse)"
                  value={healthRecord.emergencyContactName || ''}
                  onChange={(e) => setHealthRecord({ ...healthRecord, emergencyContactName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Emergency Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+1 555-0199"
                  value={healthRecord.emergencyContactPhone || ''}
                  onChange={(e) => setHealthRecord({ ...healthRecord, emergencyContactPhone: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Medical Records</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: PROFILE MANAGEMENT                                */}
      {/* ======================================================== */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-xl">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-900 text-base">Account Security & Demographics</h3>
            <p className="text-xs text-slate-500">Update your verified account name, phone number, and access credentials.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Registered Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Telephone Number</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">New Security Password (Optional)</label>
              <input
                type="password"
                placeholder="Leave blank to retain current password"
                value={profileForm.password}
                onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-sm shadow-sky-600/20 transition"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS                                                   */}
      {/* ======================================================== */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
          onSuccess={() => {
            notify('success', 'Appointment scheduled successfully!');
            loadAppointments();
          }}
        />
      )}

      {activeChatApt && (
        <ChatModal
          appointment={activeChatApt}
          onClose={() => setActiveChatApt(null)}
        />
      )}

      {viewingPrescription && (
        <PrescriptionModal
          consultation={viewingPrescription}
          onClose={() => setViewingPrescription(null)}
        />
      )}
    </div>
  );
}
