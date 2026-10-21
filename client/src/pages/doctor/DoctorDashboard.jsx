import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { api } from '../../services/api';
import ConsultationModal from '../../components/modals/ConsultationModal';
import PatientHistoryModal from '../../components/modals/PatientHistoryModal';
import ChatModal from '../../components/modals/ChatModal';

export default function DoctorDashboard({ defaultTab = 'consultations' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [consultations, setConsultations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [patientSearchId, setPatientSearchId] = useState('');
  const [searchedPatientHistory, setSearchedPatientHistory] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', text: '' });

  // Active Modals
  const [selectedConsultationApt, setSelectedConsultationApt] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [activeChatApt, setActiveChatApt] = useState(null);

  const notify = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification({ type: '', text: '' }), 4000);
  };

  const loadConsultations = async () => {
    try {
      let query = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.getDoctorConsultations(query);
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
          // Initialize default week
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
  }, [activeTab, statusFilter]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
            Healthcare Professional Portal
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Clinical Workspace & Practice Management</h1>
          <p className="text-xs text-slate-500">Conduct consultations, issue prescriptions, review medical dossiers, and set availability.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('consultations')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'consultations' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Consultations</span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'schedule' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Schedule Management</span>
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'records' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Patient Records</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification.text && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 border ${
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

      {/* TAB 1: CONSULTATION MANAGEMENT & PROVISION */}
      {activeTab === 'consultations' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="font-semibold text-xs text-slate-700">Filter Consultations:</span>
            <div className="flex items-center gap-1.5">
              {['', 'SCHEDULED', 'COMPLETED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                    statusFilter === st
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {st || 'All Sessions'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {consultations.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          c.patientAvatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(c.patientName)}&background=0284c7&color=fff`
                        }
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{c.patientName}</h4>
                        <span className="text-[11px] text-slate-400 block">{c.patientPhone || c.patientEmail}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="mt-3 p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-700 font-medium">
                      <span>Date & Time:</span>
                      <span className="font-bold text-slate-900">{c.appointmentDate} ({c.timeSlot})</span>
                    </div>
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-700">Reason:</span> {c.reason || 'General'}
                    </div>
                  </div>

                  {c.status === 'COMPLETED' && (
                    <div className="mt-3 p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-lg text-xs space-y-1">
                      <span className="font-bold text-emerald-900 block">Diagnosis: {c.diagnosis}</span>
                      <p className="text-slate-600 line-clamp-2">{c.medicalAdvice}</p>
                      {c.prescriptions?.length > 0 && (
                        <div className="text-[11px] text-sky-700 font-semibold pt-1">
                          {c.prescriptions.length} medications prescribed
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedPatientId(c.patientId)}
                      className="p-1.5 text-slate-500 hover:text-sky-600 rounded-lg hover:bg-sky-50 text-xs flex items-center gap-1"
                      title="Inspect Medical Dossier"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium">Records</span>
                    </button>
                    <button
                      onClick={() => setActiveChatApt(c)}
                      className="p-1.5 text-slate-500 hover:text-teal-600 rounded-lg hover:bg-teal-50 text-xs flex items-center gap-1"
                      title="Chat with Patient"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium">Message</span>
                    </button>
                  </div>

                  {c.status === 'SCHEDULED' ? (
                    <button
                      onClick={() => setSelectedConsultationApt(c)}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                    >
                      Conduct Consultation
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedConsultationApt(c)}
                      className="px-2.5 py-1 text-slate-600 hover:text-sky-600 rounded text-[11px] font-medium"
                    >
                      Edit Advice
                    </button>
                  )}
                </div>
              </div>
            ))}

            {consultations.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
                No consultations found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULE MANAGEMENT */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-3xl">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Doctor Availability & Working Hours</h3>
              <p className="text-xs text-slate-500">Configure your weekly shifts, slot duration, and active booking days.</p>
            </div>
            <button
              onClick={handleSaveSchedule}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Schedule</span>
            </button>
          </div>

          <form onSubmit={handleSaveSchedule} className="space-y-3">
            {schedules.map((s, idx) => (
              <div
                key={s.dayOfWeek}
                className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs transition ${
                  s.isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'
                }`}
              >
                <div className="w-32 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(s.isActive)}
                    onChange={(e) => handleScheduleChange(idx, 'isActive', e.target.checked ? 1 : 0)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="font-bold text-slate-800">{s.dayOfWeek}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500">From:</span>
                  <input
                    type="time"
                    disabled={!s.isActive}
                    value={s.startTime}
                    onChange={(e) => handleScheduleChange(idx, 'startTime', e.target.value)}
                    className="px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  />
                  <span className="text-slate-500">To:</span>
                  <input
                    type="time"
                    disabled={!s.isActive}
                    value={s.endTime}
                    onChange={(e) => handleScheduleChange(idx, 'endTime', e.target.value)}
                    className="px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Slot Length:</span>
                  <select
                    disabled={!s.isActive}
                    value={s.slotDurationMinutes}
                    onChange={(e) => handleScheduleChange(idx, 'slotDurationMinutes', Number(e.target.value))}
                    className="px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
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

      {/* TAB 3: PATIENT RECORD ACCESS */}
      {activeTab === 'records' && (
        <div className="space-y-4 max-w-4xl">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-1">Patient Electronic Health Record Search</h3>
            <p className="text-xs text-slate-500 mb-3">Input a Patient ID to inspect their longitudinal medical records, allergies, and consultation history.</p>

            <form onSubmit={handleSearchPatientRecord} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Patient ID (e.g. u-patient-john, u-patient-jane)..."
                value={patientSearchId}
                onChange={(e) => setPatientSearchId(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Record</span>
              </button>
            </form>

            <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-500">
              <span className="font-semibold">Quick Search Examples:</span>
              <button
                type="button"
                onClick={() => { setPatientSearchId('u-patient-john'); }}
                className="text-sky-600 underline font-medium"
              >
                u-patient-john
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => { setPatientSearchId('u-patient-jane'); }}
                className="text-sky-600 underline font-medium"
              >
                u-patient-jane
              </button>
            </div>
          </div>

          {searchedPatientHistory && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center">
                    {searchedPatientHistory.patient.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{searchedPatientHistory.patient.name}</h4>
                    <span className="text-xs text-slate-500">{searchedPatientHistory.patient.email} | ID: {searchedPatientHistory.patient.id}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                  Blood Group: {searchedPatientHistory.healthRecord?.bloodGroup || 'Not Specified'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-lg">
                  <span className="font-bold text-rose-900 block mb-1">Known Allergies:</span>
                  <p className="text-slate-700">{searchedPatientHistory.healthRecord?.allergies || 'None reported'}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-900 block mb-1">Chronic Conditions:</span>
                  <p className="text-slate-700">{searchedPatientHistory.healthRecord?.chronicConditions || 'None reported'}</p>
                </div>
              </div>

              {/* Consultation History */}
              <div className="pt-2">
                <h5 className="font-bold text-slate-800 text-xs mb-2">Past Consultations & Diagnoses:</h5>
                <div className="space-y-2">
                  {searchedPatientHistory.pastConsultations?.map((pc) => (
                    <div key={pc.consultationId} className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>{pc.doctorName} ({pc.doctorSpecialty})</span>
                        <span className="text-slate-400 font-normal">{pc.appointmentDate}</span>
                      </div>
                      <p><strong className="text-slate-700">Diagnosis:</strong> {pc.diagnosis}</p>
                      <p><strong className="text-slate-700">Advice:</strong> {pc.medicalAdvice}</p>
                    </div>
                  ))}
                  {searchedPatientHistory.pastConsultations?.length === 0 && (
                    <p className="text-xs text-slate-400">No past consultations recorded for this patient.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {selectedConsultationApt && (
        <ConsultationModal
          appointment={selectedConsultationApt}
          onClose={() => setSelectedConsultationApt(null)}
          onSuccess={() => {
            notify('success', 'Consultation recorded and medical advice issued!');
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
    </div>
  );
}
