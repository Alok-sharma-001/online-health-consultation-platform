import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  FileText,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Plus,
  Save,
  Search,
  Stethoscope,
  Printer,
  ChevronRight,
  ShieldCheck,
  Activity,
  Pill,
} from 'lucide-react';
import { api } from '../../services/api';
import ConsultationModal from '../../components/modals/ConsultationModal';
import PatientHistoryModal from '../../components/modals/PatientHistoryModal';
import ChatModal from '../../components/modals/ChatModal';
import PrescriptionModal from '../../components/modals/PrescriptionModal';

export default function DoctorDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Active tab derived directly from URL route (eliminates desync and makes Navbar 100% functional)
  const getActiveTab = () => {
    if (location.pathname.includes('/schedule')) return 'schedule';
    if (location.pathname.includes('/records')) return 'records';
    return 'consultations';
  };

  const activeTab = getActiveTab();

  const [consultationSubTab, setConsultationSubTab] = useState('ALL'); // 'ALL', 'SCHEDULED', 'COMPLETED'
  const [consultations, setConsultations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [patientSearchId, setPatientSearchId] = useState('');
  const [searchedPatientHistory, setSearchedPatientHistory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', text: '' });

  // Active Modals
  const [selectedConsultationApt, setSelectedConsultationApt] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [activeChatApt, setActiveChatApt] = useState(null);
  const [viewingPrescription, setViewingPrescription] = useState(null);

  const notify = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification({ type: '', text: '' }), 4000);
  };

  const loadConsultations = async () => {
    try {
      const res = await api.getDoctorConsultations();
      if (res.success) setConsultations(res.consultations);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const loadSchedule = async () => {
    try {
      const res = await api.getDoctorSchedule();
      if (res.success) {
        if (res.schedules.length === 0) {
          const defaultWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => ({
            dayOfWeek: d,
            startTime: '09:00',
            endTime: '17:00',
            slotDurationMinutes: 30,
            isActive: 1,
          }));
          setSchedules(defaultWeek);
        } else {
          setSchedules(res.schedules);
        }
      }
    } catch (err) {
      notify('error', err.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'consultations') loadConsultations().finally(() => setLoading(false));
    else if (activeTab === 'schedule') loadSchedule().finally(() => setLoading(false));
  }, [activeTab]);

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateDoctorSchedule(schedules);
      notify('success', res.message);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const handleScheduleChange = (index, field, value) => {
    const updated = [...schedules];
    updated[index][field] = value;
    setSchedules(updated);
  };

  const handleSearchPatientRecord = async (e) => {
    e.preventDefault();
    if (!patientSearchId.trim()) return;
    try {
      const res = await api.getPatientHistory(patientSearchId.trim());
      if (res.success) {
        setSearchedPatientHistory(res);
      }
    } catch (err) {
      notify('error', err.message || 'Patient record not found.');
      setSearchedPatientHistory(null);
    }
  };

  // Calculations for KPI Cards
  const scheduledCount = consultations.filter((c) => c.status === 'SCHEDULED').length;
  const completedCount = consultations.filter((c) => c.status === 'COMPLETED').length;
  const activeDaysCount = schedules.filter((s) => s.isActive).length;

  // Filtered consultations
  const filteredConsultations = consultations.filter((c) => {
    const matchesSubTab =
      consultationSubTab === 'ALL' || c.status === consultationSubTab;
    const matchesQuery =
      !searchQuery.trim() ||
      c.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubTab && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner (Clean, elegant, NO duplicate buttons) */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] uppercase tracking-wider font-extrabold bg-sky-400/20 text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-400/30">
              Healthcare Professional Workspace
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Practice Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Clinical Doctor Dashboard</h1>
          <p className="text-xs text-sky-200/80 mt-1 max-w-xl">
            Triage patient consultations, review longitudinal medical histories, issue official electronic prescriptions, and manage working hours.
          </p>
        </div>

        <div className="text-right hidden md:block">
          <span className="text-xs text-sky-300 font-medium block">Current View:</span>
          <span className="text-sm font-black text-white uppercase tracking-wider bg-white/10 px-3 py-1 rounded-lg inline-block mt-0.5">
            {activeTab === 'consultations' ? '📋 Consultations Manager' : activeTab === 'schedule' ? '⏰ Schedule Management' : '📂 Patient Records Dossier'}
          </span>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Waiting Queue</span>
            <span className="text-xl font-black text-slate-900">{scheduledCount}</span>
            <span className="text-[10px] text-amber-600 font-medium block">Patients to consult</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Completed Visits</span>
            <span className="text-xl font-black text-slate-900">{completedCount}</span>
            <span className="text-[10px] text-emerald-600 font-medium block">Full advice issued</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Encounters</span>
            <span className="text-xl font-black text-slate-900">{consultations.length}</span>
            <span className="text-[10px] text-sky-600 font-medium block">Lifetime patients</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Shift Coverage</span>
            <span className="text-xl font-black text-slate-900">{activeDaysCount} Days</span>
            <span className="text-[10px] text-purple-600 font-medium block">Recurring slots</span>
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
      {/* TAB 1: CONSULTATIONS (QUEUE & ARCHIVE)                   */}
      {/* ======================================================== */}
      {activeTab === 'consultations' && (
        <div className="space-y-4">
          {/* Sub-navigation & Search Toolbar */}
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setConsultationSubTab('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  consultationSubTab === 'ALL'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>All Sessions</span>
                <span className="text-[10px] bg-slate-700 text-slate-200 px-1.5 py-0.2 rounded-full">
                  {consultations.length}
                </span>
              </button>

              <button
                onClick={() => setConsultationSubTab('SCHEDULED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  consultationSubTab === 'SCHEDULED'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <span>Waiting Queue</span>
                <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.2 rounded-full">
                  {scheduledCount}
                </span>
              </button>

              <button
                onClick={() => setConsultationSubTab('COMPLETED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  consultationSubTab === 'COMPLETED'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span>Completed Archive</span>
                <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.2 rounded-full">
                  {completedCount}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search patient or diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Consultation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConsultations.map((c) => {
              const isCompleted = c.status === 'COMPLETED';

              return (
                <div
                  key={c.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                    isCompleted
                      ? 'border-emerald-200/80 hover:border-emerald-300'
                      : 'border-sky-200/80 hover:border-sky-300 ring-1 ring-sky-100'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            c.patientAvatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(c.patientName)}&background=0284c7&color=fff`
                          }
                          alt=""
                          className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{c.patientName}</h4>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            {c.patientPhone || c.patientEmail}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full border ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                        }`}
                      >
                        {isCompleted ? '✓ Completed' : '● Scheduled'}
                      </span>
                    </div>

                    {/* Appointment Schedule Strip */}
                    <div className="mt-3.5 p-2.5 bg-slate-50/90 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-400 font-medium">Session:</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {c.appointmentDate} &bull; {c.timeSlot}
                        </span>
                      </div>
                      <div className="text-slate-600 text-[11px] pt-0.5 border-t border-slate-200/60 mt-1">
                        <span className="font-semibold text-slate-700">Chief Complaint:</span> {c.reason || 'General Health Consultation'}
                      </div>
                    </div>

                    {/* Clinical Details if Completed */}
                    {isCompleted && (
                      <div className="mt-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs space-y-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                            Clinical Diagnosis
                          </span>
                          <span className="font-bold text-slate-900 block text-xs mt-0.5">
                            {c.diagnosis}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Doctor Advice
                          </span>
                          <p className="text-slate-600 text-[11px] line-clamp-2 mt-0.5">
                            {c.medicalAdvice}
                          </p>
                        </div>

                        {c.prescriptions && c.prescriptions.length > 0 && (
                          <div className="pt-1 border-t border-emerald-100/80 flex items-center justify-between text-[11px]">
                            <span className="text-sky-700 font-semibold flex items-center gap-1">
                              <Pill className="w-3 h-3" />
                              <span>{c.prescriptions.length} medications prescribed</span>
                            </span>
                          </div>
                        )}

                        {c.followUpDate && (
                          <div className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                            Follow-up: {c.followUpDate}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    {/* Patient Records & Chat */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedPatientId(c.patientId)}
                        className="px-2.5 py-1 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        title="View Full Medical Record Dossier"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Dossier</span>
                      </button>
                      <button
                        onClick={() => setActiveChatApt(c)}
                        className="px-2.5 py-1 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        title="Open Consultation Chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>
                    </div>

                    {/* Primary Status Action */}
                    {!isCompleted ? (
                      <button
                        onClick={() => setSelectedConsultationApt(c)}
                        className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 flex items-center gap-1 transition"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Conduct Consultation</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingPrescription(c)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                          title="View Official Digital Prescription (Rx)"
                        >
                          <Printer className="w-3 h-3" />
                          <span>View Rx</span>
                        </button>
                        <button
                          onClick={() => setSelectedConsultationApt(c)}
                          className="px-2 py-1.5 text-slate-500 hover:text-slate-800 rounded-lg text-[11px] font-medium transition"
                          title="Edit Clinical Advice"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredConsultations.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
                <ClipboardList className="w-10 h-10 mx-auto text-slate-300 stroke-1 mb-2" />
                <span className="font-semibold text-slate-600 text-sm block">No consultations found</span>
                <span className="text-slate-400 mt-0.5 block">Try adjusting your filter or search query.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SCHEDULE MANAGEMENT                              */}
      {/* ======================================================== */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-3xl">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Weekly Availability & Shift Management</h3>
              <p className="text-xs text-slate-500">Configure your shift hours, slot duration intervals, and active booking days for teleconsultations.</p>
            </div>
            <button
              onClick={handleSaveSchedule}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-sky-600/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Schedule</span>
            </button>
          </div>

          <form onSubmit={handleSaveSchedule} className="space-y-3">
            {schedules.map((s, idx) => (
              <div
                key={s.dayOfWeek}
                className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs transition-all ${
                  s.isActive
                    ? 'bg-white border-slate-200 shadow-xs'
                    : 'bg-slate-50 border-slate-100 opacity-60'
                }`}
              >
                <div className="w-36 flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={Boolean(s.isActive)}
                    onChange={(e) => handleScheduleChange(idx, 'isActive', e.target.checked ? 1 : 0)}
                    className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
                  />
                  <span className="font-bold text-slate-900 text-sm">{s.dayOfWeek}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Shift:</span>
                  <input
                    type="time"
                    disabled={!s.isActive}
                    value={s.startTime}
                    onChange={(e) => handleScheduleChange(idx, 'startTime', e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <span className="text-slate-400 font-medium">to</span>
                  <input
                    type="time"
                    disabled={!s.isActive}
                    value={s.endTime}
                    onChange={(e) => handleScheduleChange(idx, 'endTime', e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Slot Interval:</span>
                  <select
                    disabled={!s.isActive}
                    value={s.slotDurationMinutes}
                    onChange={(e) => handleScheduleChange(idx, 'slotDurationMinutes', Number(e.target.value))}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                </div>
              </div>
            ))}
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PATIENT RECORDS & LONGITUDINAL MEDICAL DOSSIER    */}
      {/* ======================================================== */}
      {activeTab === 'records' && (
        <div className="space-y-4 max-w-4xl">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-1">Patient Electronic Health Record (EHR) Lookup</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter any Patient ID to retrieve their full longitudinal clinical history, recurring consultations, known drug allergies, and past prescriptions.
            </p>

            <form onSubmit={handleSearchPatientRecord} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Patient ID (e.g. u-patient-john, u-patient-jane)..."
                value={patientSearchId}
                onChange={(e) => setPatientSearchId(e.target.value)}
                className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-sky-600/20"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Dossier</span>
              </button>
            </form>

            <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-500">
              <span className="font-semibold">Quick Patient Lookups:</span>
              <button
                type="button"
                onClick={() => { setPatientSearchId('u-patient-john'); }}
                className="text-sky-600 underline font-semibold hover:text-sky-800"
              >
                John Doe (u-patient-john)
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => { setPatientSearchId('u-patient-jane'); }}
                className="text-sky-600 underline font-semibold hover:text-sky-800"
              >
                Jane Roe (u-patient-jane)
              </button>
            </div>
          </div>

          {searchedPatientHistory && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              {/* Patient Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white font-black text-lg flex items-center justify-center shadow-md">
                    {searchedPatientHistory.patient.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-base">{searchedPatientHistory.patient.name}</h4>
                    <span className="text-xs text-slate-400 font-mono">
                      {searchedPatientHistory.patient.email} &bull; ID: {searchedPatientHistory.patient.id}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                    Blood Group: {searchedPatientHistory.healthRecord?.bloodGroup || 'Not Specified'}
                  </span>
                </div>
              </div>

              {/* Vitals & Allergies Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-xl space-y-1">
                  <span className="font-bold text-rose-900 flex items-center gap-1.5 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Known Drug & Food Allergies</span>
                  </span>
                  <p className="text-slate-800 font-medium">
                    {searchedPatientHistory.healthRecord?.allergies || 'None reported'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900 text-xs block">Chronic Illness & Conditions</span>
                  <p className="text-slate-700 font-medium">
                    {searchedPatientHistory.healthRecord?.chronicConditions || 'None reported'}
                  </p>
                </div>
              </div>

              {/* Longitudinal Visit Timeline */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-sky-600" />
                    <span>Longitudinal Consultation Timeline ({searchedPatientHistory.pastConsultations?.length || 0} Visits)</span>
                  </h5>
                  <span className="text-[11px] text-slate-400">Chronological visit history</span>
                </div>

                <div className="space-y-3">
                  {searchedPatientHistory.pastConsultations?.map((pc, idx) => (
                    <div key={pc.consultationId} className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between border-b border-slate-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            Visit #{searchedPatientHistory.pastConsultations.length - idx}
                          </span>
                          <span className="font-bold text-slate-900">{pc.doctorName} ({pc.doctorSpecialty})</span>
                        </div>
                        <span className="text-slate-500 font-mono text-[11px]">{pc.appointmentDate}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <strong className="text-slate-700">Clinical Diagnosis:</strong>
                          <p className="text-slate-900 font-semibold mt-0.5">{pc.diagnosis}</p>
                        </div>
                        <div>
                          <strong className="text-slate-700">Clinical Advice:</strong>
                          <p className="text-slate-600 mt-0.5">{pc.medicalAdvice}</p>
                        </div>
                      </div>

                      {pc.prescriptions && pc.prescriptions.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/50">
                          <strong className="text-slate-700 block text-[10px] uppercase font-bold text-slate-400 mb-1">
                            Prescribed Medications:
                          </strong>
                          <div className="flex flex-wrap gap-1.5">
                            {pc.prescriptions.map((rx, rIdx) => (
                              <span key={rIdx} className="bg-white border border-slate-200 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-800">
                                💊 {rx.medicine} {rx.dosage && `(${rx.dosage})`} &bull; {rx.frequency}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => setViewingPrescription(pc)}
                          className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>View Official Rx Receipt</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {searchedPatientHistory.pastConsultations?.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
                      No previous consultations recorded for this patient.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS                                                   */}
      {/* ======================================================== */}
      {selectedConsultationApt && (
        <ConsultationModal
          appointment={selectedConsultationApt}
          onClose={() => setSelectedConsultationApt(null)}
          onSuccess={() => {
            notify('success', 'Medical consultation completed and digital prescription recorded!');
            loadConsultations();
          }}
        />
      )}

      {selectedPatientId && (
        <PatientHistoryModal
          patientId={selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
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
