import { env } from '../config/env'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

function readCsrfToken() {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

function messageFor(status) {
  if (status === 400 || status === 422) return 'Some details are not valid. Check the form and try again.'
  if (status === 401) return 'Your session has ended. Sign in again to continue.'
  if (status === 403) return 'You do not have permission to do that.'
  if (status === 413) return 'That upload is too large. Use files under 5 MB.'
  if (status === 429) return 'Too many attempts. Wait a minute and try again.'
  return 'Something went wrong on our side. Try again in a moment.'
}

export async function apiRequest(path, { method = 'GET', body, signal } = {}) {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData
  const headers = { Accept: 'application/json' }
  if (body && !isForm) headers['Content-Type'] = 'application/json'
  if (method !== 'GET') headers['X-CSRF-Token'] = readCsrfToken()

  let response
  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
      credentials: 'include',
      cache: 'no-store',
      signal,
    })
  } catch {
    throw new ApiError('We could not reach the server. Check your connection and try again.', 0)
  }
  if (!response.ok) throw new ApiError(messageFor(response.status), response.status)
  return response.json()
}

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
