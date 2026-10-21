import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Heart, Pill, Calendar, Phone } from 'lucide-react';
import { api } from '../../services/api';

export default function PatientHistoryModal({ patientId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.getPatientHistory(patientId);
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch medical record.');
      } finally {
        setLoading(false);
      }
    }
    if (patientId) loadHistory();
  }, [patientId]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400" />
            <h3 className="text-lg font-bold">Patient Health Records & Clinical History</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 text-rose-700 rounded-lg text-sm">{error}</div>
          ) : data ? (
            <>
              {/* Patient Basic Demographics Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      data.patient.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(data.patient.name)}&background=0284c7&color=fff`
                    }
                    alt={data.patient.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{data.patient.name}</h4>
                    <span className="text-xs text-slate-500">{data.patient.email} | ID: {data.patient.id}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{data.patient.phone || 'No phone recorded'}</span>
                </div>
              </div>

              {/* EHR Vitals & Alert Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Blood & Allergies */}
                <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-800 font-semibold text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Allergies & Critical Warnings</span>
                  </div>
                  <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-rose-100 font-medium">
                    {data.healthRecord?.allergies || 'No known drug allergies.'}
                  </p>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">Blood Group:</span>
                    <span className="font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                      {data.healthRecord?.bloodGroup || 'Not Specified'}
                    </span>
                  </div>
                </div>

                {/* Chronic Conditions & Current Meds */}
                <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-sky-800 font-semibold text-sm">
                    <Pill className="w-4 h-4 text-sky-600" />
                    <span>Existing Conditions & Medications</span>
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <p><strong className="text-slate-900">Chronic Illness:</strong> {data.healthRecord?.chronicConditions || 'None'}</p>
                    <p><strong className="text-slate-900">Current Medications:</strong> {data.healthRecord?.currentMedications || 'None'}</p>
                    <p><strong className="text-slate-900">Emergency Contact:</strong> {data.healthRecord?.emergencyContactName || 'None'} ({data.healthRecord?.emergencyContactPhone || 'N/A'})</p>
                  </div>
                </div>
              </div>

              {/* Consultation History */}
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <span>Past Consultations & Medical Summaries ({data.pastConsultations?.length || 0})</span>
                </h4>

                {data.pastConsultations?.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
                    No previous consultations logged for this patient yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.pastConsultations.map((c) => (
                      <div key={c.consultationId} className="p-4 bg-white border border-slate-200 rounded-xl text-xs space-y-2 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-800 text-sm">{c.doctorName} ({c.doctorSpecialty})</span>
                          <span className="text-slate-400">{c.appointmentDate}</span>
                        </div>
                        <div>
                          <strong className="text-slate-700">Diagnosis:</strong>
                          <p className="text-slate-600 font-medium mt-0.5">{c.diagnosis}</p>
                        </div>
                        <div>
                          <strong className="text-slate-700">Clinical Advice:</strong>
                          <p className="text-slate-600 mt-0.5">{c.medicalAdvice}</p>
                        </div>
                        {c.prescriptions && c.prescriptions.length > 0 && (
                          <div className="pt-2">
                            <strong className="text-slate-700 block mb-1">Prescriptions:</strong>
                            <div className="flex flex-wrap gap-1.5">
                              {c.prescriptions.map((rx, idx) => (
                                <span key={idx} className="bg-sky-50 text-sky-800 border border-sky-100 px-2 py-0.5 rounded text-[11px]">
                                  {rx.medicine} {rx.dosage && `(${rx.dosage})`} - {rx.frequency}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {c.followUpDate && (
                          <div className="text-[11px] text-amber-700 font-semibold pt-1">
                            Follow-up advised: {c.followUpDate}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
