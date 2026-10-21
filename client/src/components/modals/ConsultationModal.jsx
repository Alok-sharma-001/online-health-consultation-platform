import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export default function ConsultationModal({ appointment, onClose, onSuccess }) {
  const [diagnosis, setDiagnosis] = useState('');
  const [medicalAdvice, setMedicalAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [prescriptions, setPrescriptions] = useState([
    { medicine: '', dosage: '', frequency: '', duration: '', instructions: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAddMedicine = () => {
    setPrescriptions([
      ...prescriptions,
      { medicine: '', dosage: '', frequency: '', duration: '', instructions: '' },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim() || !medicalAdvice.trim()) {
      setError('Please provide both diagnosis and medical advice.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Filter out empty prescription rows
      const validPrescriptions = prescriptions.filter((p) => p.medicine.trim() !== '');

      const res = await api.provideConsultation({
        appointmentId: appointment.id,
        diagnosis,
        medicalAdvice,
        prescriptions: validPrescriptions,
        followUpDate: followUpDate || null,
      });

      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit consultation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Conduct Consultation & Issue Advice</h3>
            <p className="text-xs text-slate-400">
              Patient: <span className="text-sky-300 font-semibold">{appointment.patientName}</span> | Slot: {appointment.appointmentDate} ({appointment.timeSlot})
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Patient Complaint */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">Patient's Chief Complaint:</span>
            <p className="text-slate-600 mt-0.5">{appointment.reason || 'None specified'}</p>
          </div>

          {/* Clinical Diagnosis */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Clinical Diagnosis <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Essential Hypertension stage 1, Acute bronchitis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Medical Advice & Recommendations */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Medical Advice & Recommendations <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe clinical recommendations, dietary instructions, hydration, physical activity..."
              value={medicalAdvice}
              onChange={(e) => setMedicalAdvice(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Digital Prescriptions Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">
                Prescriptions & Medication Plan
              </label>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            <div className="space-y-3">
              {prescriptions.map((rx, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 relative group">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-500 block mb-0.5">Medicine Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Amoxicillin"
                        value={rx.medicine}
                        onChange={(e) => handlePrescriptionChange(idx, 'medicine', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Dosage</label>
                      <input
                        type="text"
                        placeholder="e.g. 500mg"
                        value={rx.dosage}
                        onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Frequency</label>
                      <input
                        type="text"
                        placeholder="e.g. 3x Daily"
                        value={rx.frequency}
                        onChange={(e) => handlePrescriptionChange(idx, 'frequency', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-500 block mb-0.5">Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 7 days"
                        value={rx.duration}
                        onChange={(e) => handlePrescriptionChange(idx, 'duration', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-500 block mb-0.5">Instructions</label>
                      <input
                        type="text"
                        placeholder="e.g. Take after meals"
                        value={rx.instructions}
                        onChange={(e) => handlePrescriptionChange(idx, 'instructions', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {prescriptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(idx)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up date */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Recommended Follow-Up Date (Optional)
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 shadow-md shadow-sky-600/20 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Complete Consultation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
