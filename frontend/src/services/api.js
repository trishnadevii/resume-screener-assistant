
const API_BASE_URL = 'http://127.0.0.1:5000/api'

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options)

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong.')
  }

  return data
}

export const getDashboard = () =>
  request('/dashboard')

export const getAnalyses = (params = {}) => {
  const query = new URLSearchParams(params)
  return request(`/analyses?${query.toString()}`)
}

export const getAnalysis = (id) =>
  request(`/analyses/${id}`)

export const deleteAnalysis = (id) =>
  request(`/analyses/${id}`, {
    method: 'DELETE',
  })

export const analyzeResume = (formData) =>
  request('/analyze', {
    method: 'POST',
    body: formData,
  })
