import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertTriangle, Pill, Calendar, Clock, Stethoscope } from 'lucide-react';
import { api } from '../../services/api';

export default function ConsultationModal({ appointment, onClose, onSuccess }) {
  const [diagnosis, setDiagnosis] = useState(appointment?.diagnosis || '');
  const [medicalAdvice, setMedicalAdvice] = useState(appointment?.medicalAdvice || '');
  const [followUpDate, setFollowUpDate] = useState(appointment?.followUpDate || '');
  const [prescriptions, setPrescriptions] = useState(
    appointment?.prescriptions && appointment.prescriptions.length > 0
      ? appointment.prescriptions
      : [{ medicine: '', dosage: '', frequency: 'Once daily after food', duration: '7 days', instructions: 'Take with water' }]
  );
  const [patientVitals, setPatientVitals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch patient medical summary to display safety warnings (allergies)
  useEffect(() => {
    async function loadPatientVitals() {
      if (appointment?.patientId) {
        try {
          const res = await api.getPatientHistory(appointment.patientId);
          if (res.success) {
            setPatientVitals(res);
          }
        } catch (err) {
          console.error('Could not load patient vitals:', err);
        }
      }
    }
    loadPatientVitals();
  }, [appointment?.patientId]);

  const handleAddMedicine = () => {
    setPrescriptions([
      ...prescriptions,
      { medicine: '', dosage: '', frequency: 'Twice daily after meals', duration: '5 days', instructions: 'Take with water' },
    ]);
  };

  const handleRemoveMedicine = (idx) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== idx));
  };

  const handlePrescriptionChange = (idx, field, value) => {
    const updated = [...prescriptions];
    updated[idx][field] = value;
    setPrescriptions(updated);
  };

  // Quick follow-up helper
  const setQuickFollowUp = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFollowUpDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim() || !medicalAdvice.trim()) {
      setError('Please provide both clinical diagnosis and medical advice.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const validPrescriptions = prescriptions.filter((p) => p.medicine.trim() !== '');

      const res = await api.provideConsultation({
        appointmentId: appointment.id,
        diagnosis: diagnosis.trim(),
        medicalAdvice: medicalAdvice.trim(),
        prescriptions: validPrescriptions,
        followUpDate: followUpDate || null,
      });

      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit consultation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/30 text-sky-400 flex items-center justify-center border border-sky-400/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Conduct Teleconsultation & Issue Rx</h3>
              <p className="text-xs text-slate-400">
                Patient: <span className="text-sky-300 font-bold">{appointment.patientName}</span> &bull; Slot: {appointment.appointmentDate} ({appointment.timeSlot})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Patient Complaint & Safety Alert Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block mb-0.5">Chief Complaint / Reason:</span>
              <p className="text-slate-900 font-medium">{appointment.reason || 'General Health Consultation'}</p>
            </div>

            <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200">
              <span className="font-bold text-rose-900 flex items-center gap-1.5 mb-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Known Allergies:</span>
              </span>
              <p className="text-slate-800 font-semibold">
                {patientVitals?.healthRecord?.allergies || 'Checking patient records...'}
              </p>
            </div>
          </div>

          {/* Clinical Assessment & Diagnosis */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Clinical Diagnosis <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Type 2 Diabetes Mellitus, Essential Hypertension, Acute Bronchitis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Physician's Advice & Lifestyle Guidance */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Physician's Guidance & Medical Advice <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Enter lifestyle recommendations, dietary precautions, hydration, resting guidelines, and clinical notes..."
              value={medicalAdvice}
              onChange={(e) => setMedicalAdvice(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Prescription (Rx) Builder */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="text-lg font-serif italic text-sky-700">℞</span>
                <span>Prescribed Medications ({prescriptions.length})</span>
              </label>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {prescriptions.map((rx, idx) => (
                <div key={idx} className="p-3 bg-slate-50/90 rounded-xl border border-slate-200 relative group text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Medicine Name & Strength</label>
                      <input
                        type="text"
                        placeholder="e.g. Metformin, Amoxicillin"
                        value={rx.medicine}
                        onChange={(e) => handlePrescriptionChange(idx, 'medicine', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Dosage</label>
                      <input
                        type="text"
                        placeholder="e.g. 500mg, 1 tablet"
                        value={rx.dosage}
                        onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Frequency</label>
                      <input
                        type="text"
                        placeholder="e.g. 2x Daily after meals"
                        value={rx.frequency}
                        onChange={(e) => handlePrescriptionChange(idx, 'frequency', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 7 days, 1 month"
                        value={rx.duration}
                        onChange={(e) => handlePrescriptionChange(idx, 'duration', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Special Instructions</label>
                      <input
                        type="text"
                        placeholder="e.g. Take with warm water, avoid milk"
                        value={rx.instructions}
                        onChange={(e) => handlePrescriptionChange(idx, 'instructions', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {prescriptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(idx)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 p-1 rounded"
                      title="Remove medicine"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Follow-up */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-bold text-slate-700">Recommend Next Follow-up Visit:</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuickFollowUp(7)}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
                >
                  +1 Week
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFollowUp(14)}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
                >
                  +2 Weeks
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFollowUp(30)}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
                >
                  +1 Month
                </button>
              </div>
            </div>

            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Action Footer */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 disabled:opacity-50 transition"
            >
              {loading ? 'Authorizing & Submitting...' : 'Sign & Complete Consultation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
