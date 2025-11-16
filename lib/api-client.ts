const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface ApiOptions extends RequestInit {
  headers?: Record<string, string>
}

export async function apiCall<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}

export const authApi = {
  login: (email: string, password: string) =>
    apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  signup: (email: string, password: string, name: string) =>
    apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),
  
  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userName')
    localStorage.removeItem('userId')
  }
}

export const eventsApi = {
  getAll: () =>
    apiCall('/api/events', { method: 'GET' }),
  
  getById: (id: string) =>
    apiCall(`/api/events/${id}`, { method: 'GET' }),
  
  getByCategory: (category: string) =>
    apiCall(`/api/events/category/${category}`, { method: 'GET' }),
  
  search: (keyword: string) =>
    apiCall(`/api/events/search/${keyword}`, { method: 'GET' }),
  
  create: (event: any) =>
    apiCall('/api/events', {
      method: 'POST',
      body: JSON.stringify(event),
    }),
}

export const registrationApi = {
  register: (eventId: number, userId: number, numberOfTickets: number) =>
    apiCall('/api/registrations', {
      method: 'POST',
      body: JSON.stringify({ eventId, userId, numberOfTickets }),
    }),
  
  getUserRegistrations: (userId: string) =>
    apiCall(`/api/registrations/user/${userId}`, { method: 'GET' }),
  
  getEventRegistrations: (eventId: string) =>
    apiCall(`/api/registrations/event/${eventId}`, { method: 'GET' }),
  
  cancelRegistration: (id: string) =>
    apiCall(`/api/registrations/${id}`, { method: 'DELETE' }),
}

export const ticketsApi = {
  getUserTickets: (userId: string) =>
    apiCall(`/api/tickets/user/${userId}`, { method: 'GET' }),
  
  getEventTickets: (eventId: string) =>
    apiCall(`/api/tickets/event/${eventId}`, { method: 'GET' }),
  
  getTicketById: (id: string) =>
    apiCall(`/api/tickets/${id}`, { method: 'GET' }),
  
  createTicket: (registrationId: number, eventId: number, userId: number) =>
    apiCall('/api/tickets', {
      method: 'POST',
      body: JSON.stringify({ registrationId, eventId, userId }),
    }),
  
  validateTicket: (ticketNumber: string) =>
    apiCall(`/api/tickets/${ticketNumber}/validate`, { method: 'POST' }),
}
