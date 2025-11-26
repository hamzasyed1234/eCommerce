// src/api.js
const BASE_URL = "http://localhost:5000/api";

export async function apiFetch(endpoint, method = "GET", body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
  }

  if (!response.ok) throw new Error(data.message || 'API error');
  return data;
}
