/**
 * API client with CSRF handling for Django session auth.
 */

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

async function request(url, options = {}) {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  let targetUrl = url;
  if (url.startsWith('/')) {
    targetUrl = `${BASE_URL}${url}`;
  }

  const defaults = {
    credentials: 'include',
    headers: {
      'X-CSRFToken': getCookie('csrftoken') || '',
    },
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    defaults.headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...defaults,
    ...options,
    headers: { ...defaults.headers, ...options.headers },
  };

  let response;
  try {
    response = await fetch(targetUrl, config);
  } catch (err) {
    const error = new Error("Preparing your memory space...");
    error.isWakeupError = true;
    error.status = 503;
    throw error;
  }

  if (response.status === 502 || response.status === 503) {
    const error = new Error("Preparing your memory space...");
    error.isWakeupError = true;
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return { ok: true, data: null };
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || data?.detail || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

const api = {
  get: (url) => request(url),
  post: (url, body) =>
    request(url, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (url, body) =>
    request(url, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: (url, body) =>
    request(url, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (url) => request(url, { method: 'DELETE' }),
};

export default api;
