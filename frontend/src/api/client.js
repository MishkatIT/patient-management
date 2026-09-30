import axios from 'axios'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const apiOrigin = /^https?:\/\//.test(configuredBaseUrl)
  ? configuredBaseUrl
  : `https://${configuredBaseUrl}`
const apiBaseUrl = apiOrigin.endsWith('/api') ? apiOrigin : `${apiOrigin}/api`

export default axios.create({
  baseURL: apiBaseUrl,
})
