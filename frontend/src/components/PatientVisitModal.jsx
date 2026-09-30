import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

function today() {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10)
}

export default function PatientVisitModal({ patient, submitting, errors, onClose, onSubmit }) {
  const [form, setForm] = useState({ doctor_name: '', visit_date: today(), clinical_note: '' })
  const modalRef = useRef(null)

  useEffect(() => {
    modalRef.current?.querySelector('input, textarea, button')?.focus()
    function closeOnEscape(event) {
      if (event.key === 'Escape' && !submitting) onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose, submitting])

  function submit(event) {
    event.preventDefault()
    onSubmit({ patient: patient.id, ...form })
  }

  return <div className="backdrop" onMouseDown={event => event.target === event.currentTarget && !submitting && onClose()}>
    <form ref={modalRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="visit-dialog-title" onSubmit={submit}>
      <div className="modal-head">
        <div><h2 id="visit-dialog-title">Record visit</h2><p>{patient.first_name} {patient.last_name || ''}</p></div>
        <button type="button" className="icon-button" aria-label="Close" onClick={onClose} disabled={submitting}><X size={18} /></button>
      </div>
      <div className="form-grid">
        <label className="wide">Patient<input value={`${patient.first_name} ${patient.last_name || ''}`.trim()} readOnly /></label>
        <label>Doctor name<input className={errors.doctor_name ? 'invalid' : ''} aria-invalid={Boolean(errors.doctor_name)} value={form.doctor_name} onChange={event => setForm({ ...form, doctor_name: event.target.value })} required />{errors.doctor_name && <small className="field-error">{errors.doctor_name[0]}</small>}</label>
        <label>Visit date<input className={errors.visit_date ? 'invalid' : ''} aria-invalid={Boolean(errors.visit_date)} type="date" max={today()} value={form.visit_date} onChange={event => setForm({ ...form, visit_date: event.target.value })} required />{errors.visit_date && <small className="field-error">{errors.visit_date[0]}</small>}</label>
        <label className="wide">Clinical note<textarea className={errors.clinical_note ? 'invalid' : ''} aria-invalid={Boolean(errors.clinical_note)} rows="4" value={form.clinical_note} onChange={event => setForm({ ...form, clinical_note: event.target.value })} />{errors.clinical_note && <small className="field-error">{errors.clinical_note[0]}</small>}</label>
      </div>
      <div className="modal-actions"><button type="button" onClick={onClose} disabled={submitting}>Cancel</button><button className="primary" disabled={submitting}>{submitting ? 'Recording...' : 'Record visit'}</button></div>
    </form>
  </div>
}
