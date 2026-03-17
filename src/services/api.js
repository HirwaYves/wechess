// Add this inside the api object
updateProfile: (data) => fetch(`${API_BASE}/users/profile`, {
  method: 'PUT',
  headers: getHeaders(),
  body: JSON.stringify(data)
}).then(handleResponse),
