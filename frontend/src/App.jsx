import { useEffect, useRef, useState } from 'react'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { createPatient, createPatientVisit, deletePatient as removePatient, listPatients, updatePatient } from './api/patients'
import PatientVisitModal from './components/PatientVisitModal'
import './tokens.css'
import './App.css'

const emptyForm = { first_name: '', last_name: '', mobile: '', age: '', gender: 'MALE', blood_group: 'O+', address: '', password: '' }

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

function App() {
  const [data, setData] = useState({ count: 0, results: [] })
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [visitTarget, setVisitTarget] = useState(null)
  const [visitErrors, setVisitErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const modalRef = useRef(null)

  async function loadPatients() {
    setLoading(true)
    try {
      setData(await listPatients(page, 10, search))
    } catch {
      setNotice({ type: 'error', message: 'Could not load patients. Check that the backend is running.' })
    } finally { setLoading(false) }
  }

  useEffect(() => {
    let active = true
    async function fetchPatients() {
      setLoading(true)
      try {
        if (active) setData(await listPatients(page, 10, search))
      } catch {
        if (active) setNotice({ type: 'error', message: 'Could not load patients. Check that the backend is running.' })
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchPatients()
    return () => { active = false }
  }, [page, search])
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])
  useEffect(() => {
    if (!modal) return undefined
    modalRef.current?.querySelector('input, select, textarea, button')?.focus()
    function closeOnEscape(event) {
      if (event.key === 'Escape' && !submitting) setModal(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [modal, submitting])
  function openCreate() { setForm(emptyForm); setErrors({}); setModal({ mode: 'create' }) }
  function openEdit(patient) { setForm({ ...patient, password: '' }); setErrors({}); setModal({ mode: 'edit', patient }) }
  function openVisit(patient) { setVisitErrors({}); setVisitTarget(patient) }
  function closeModal() { if (!submitting) setModal(null) }

  async function savePatient(event) {
    event.preventDefault(); setSubmitting(true); setErrors({})
    const payload = { ...form, age: Number(form.age) }
    if (modal.mode === 'edit' && !payload.password) delete payload.password
    try {
      if (modal.mode === 'create') await createPatient(payload)
      else await updatePatient(modal.patient.id, payload)
      setModal(null); setNotice({ type: 'success', message: modal.mode === 'create' ? 'Patient added.' : 'Patient updated.' }); await loadPatients()
    } catch (error) {
      const responseErrors = error.response?.data || {}
      setErrors(responseErrors)
      const message = responseErrors.detail || responseErrors.non_field_errors?.[0]
      setNotice({ type: 'error', message: message || (!Object.keys(responseErrors).length ? 'Could not save the patient.' : 'Please correct the highlighted fields.') })
    } finally { setSubmitting(false) }
  }

  async function deletePatient() {
    setSubmitting(true)
    try {
      await removePatient(deleteTarget.id)
      setDeleteTarget(null); setNotice({ type: 'success', message: 'Patient deleted.' })
      if (data.results.length === 1 && page > 1) setPage(page - 1); else await loadPatients()
    } catch { setNotice({ type: 'error', message: 'Could not delete the patient.' }) } finally { setSubmitting(false) }
  }

  async function recordVisit(payload) {
    setSubmitting(true); setVisitErrors({})
    try {
      await createPatientVisit(payload)
      setVisitTarget(null); setNotice({ type: 'success', message: 'Visit recorded.' }); await loadPatients()
    } catch (error) {
      const responseErrors = error.response?.data || {}
      setVisitErrors(responseErrors)
      const message = responseErrors.detail || responseErrors.non_field_errors?.[0]
      setNotice({ type: 'error', message: message || (!Object.keys(responseErrors).length ? 'Could not record the visit.' : 'Please correct the highlighted visit fields.') })
    } finally { setSubmitting(false) }
  }

  const pageCount = Math.max(1, Math.ceil(data.count / 10))
  return <>
    <header className="topbar"><strong>Patients</strong><span>Care operations</span></header>
    <main className="container">
      <div className="page-header"><div><h1>Patients</h1><p>{data.count} {data.count === 1 ? 'patient' : 'patients'}</p></div><div className="header-actions"><label className="search-box"><Search size={16} /><span className="sr-only">Search patients</span><input value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder="Search patients" /></label><button className="primary" onClick={openCreate}><Plus size={16} /> Add patient</button></div></div>
      {notice && <div className={`notice ${notice.type}`} role="status">{notice.message}<button aria-label="Dismiss" onClick={() => setNotice(null)}><X size={16} /></button></div>}
      <section className="surface"><div className="table-wrap"><table><thead><tr><th>Name</th><th>Mobile</th><th>Age</th><th>Gender</th><th>Blood group</th><th>Address</th><th>Visits</th><th>Last visit</th><th>Actions</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="9" className="empty">Loading patients...</td></tr> : data.results.length === 0 ? <tr><td colSpan="9" className="empty"><span>No patients yet</span><button className="primary empty-action" onClick={openCreate}><Plus size={16} /> Add patient</button></td></tr> : data.results.map(patient => <tr key={patient.id}><td className="name">{patient.first_name} {patient.last_name}</td><td>{patient.mobile}</td><td>{patient.age}</td><td>{patient.gender[0] + patient.gender.slice(1).toLowerCase()}</td><td><span className="badge">{patient.blood_group}</span></td><td>{patient.address || '—'}</td><td>{patient.total_visits}</td><td>{formatDate(patient.last_visit_date)}</td><td><div className="actions"><button className="small" onClick={() => openVisit(patient)}><Plus size={14} /> Record visit</button><button className="small" onClick={() => openEdit(patient)}><Pencil size={14} /> Edit</button><button className="small danger" onClick={() => setDeleteTarget(patient)}><Trash2 size={14} /> Delete</button></div></td></tr>)}
      </tbody></table></div><footer className="pagination"><span>{data.count ? `Showing ${(page - 1) * 10 + 1} to ${Math.min(page * 10, data.count)} of ${data.count}` : 'Showing 0 patients'}</span><div><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pageCount}</span><button disabled={page >= pageCount} onClick={() => setPage(page + 1)}>Next</button></div></footer></section>
    </main>
    {modal && <div className="backdrop" onMouseDown={event => event.target === event.currentTarget && closeModal()}><form ref={modalRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="patient-dialog-title" onSubmit={savePatient}><div className="modal-head"><div><h2 id="patient-dialog-title">{modal.mode === 'create' ? 'Add patient' : 'Edit patient'}</h2><p>Patient details</p></div><button type="button" className="icon-button" aria-label="Close" onClick={closeModal}><X size={18} /></button></div><div className="form-grid">{[['first_name', 'First name'], ['last_name', 'Last name'], ['mobile', 'Mobile'], ['age', 'Age']].map(([key, label]) => <label key={key}>{label}<input className={errors[key] ? 'invalid' : ''} aria-invalid={Boolean(errors[key])} value={form[key]} onChange={event => setForm({ ...form, [key]: event.target.value })} required={key !== 'last_name'} />{errors[key] && <small className="field-error">{errors[key][0]}</small>}</label>)}<label>Gender<select className={errors.gender ? 'invalid' : ''} aria-invalid={Boolean(errors.gender)} value={form.gender} onChange={event => setForm({ ...form, gender: event.target.value })}><option>MALE</option><option>FEMALE</option><option>OTHER</option></select>{errors.gender && <small className="field-error">{errors.gender[0]}</small>}</label><label>Blood group<select className={errors.blood_group ? 'invalid' : ''} aria-invalid={Boolean(errors.blood_group)} value={form.blood_group} onChange={event => setForm({ ...form, blood_group: event.target.value })}>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => <option key={group}>{group}</option>)}</select>{errors.blood_group && <small className="field-error">{errors.blood_group[0]}</small>}</label><label className="wide">Address<textarea className={errors.address ? 'invalid' : ''} aria-invalid={Boolean(errors.address)} rows="3" value={form.address} onChange={event => setForm({ ...form, address: event.target.value })} />{errors.address && <small className="field-error">{errors.address[0]}</small>}</label><label className="wide">Password<input className={errors.password ? 'invalid' : ''} aria-invalid={Boolean(errors.password)} type="password" minLength="6" required={modal.mode === 'create'} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} />{modal.mode === 'edit' && <small>Leave blank to keep current password</small>}{errors.password && <small className="field-error">{errors.password[0]}</small>}</label></div><div className="modal-actions"><button type="button" onClick={closeModal}>Cancel</button><button className="primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save patient'}</button></div></form></div>}
    {visitTarget && <PatientVisitModal patient={visitTarget} submitting={submitting} errors={visitErrors} onClose={() => setVisitTarget(null)} onSubmit={recordVisit} />}
    {deleteTarget && <div className="backdrop"><div className="confirm"><h2>Delete {deleteTarget.first_name} {deleteTarget.last_name}?</h2><p>This also removes their visit records.</p><div className="modal-actions"><button onClick={() => setDeleteTarget(null)}>Cancel</button><button className="confirm-delete" disabled={submitting} onClick={deletePatient}>Delete</button></div></div></div>}
  </>
}

export default App
