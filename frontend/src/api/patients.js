import client from './client'

export function listPatients(page, pageSize = 10, search = '') {
  return client.get('/patients/', { params: { page, page_size: pageSize, search: search || undefined } }).then(response => response.data)
}

export function createPatient(data) {
  return client.post('/patients/', data).then(response => response.data)
}

export function updatePatient(id, data) {
  return client.patch(`/patients/${id}/`, data).then(response => response.data)
}

export function deletePatient(id) {
  return client.delete(`/patients/${id}/`).then(response => response.data)
}

export function createPatientVisit(data) {
  return client.post('/patient-visits/', data).then(response => response.data)
}
