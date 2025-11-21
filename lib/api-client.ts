// Direct service URLs (bypassing API Gateway due to Eureka registration issues)
const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:8081'
const EVENT_SERVICE_URL = process.env.NEXT_PUBLIC_EVENT_URL || 'http://localhost:8082'
const REGISTRATION_SERVICE_URL = process.env.NEXT_PUBLIC_REGISTRATION_URL || 'http://localhost:8083'
const TICKET_SERVICE_URL = process.env.NEXT_PUBLIC_TICKET_URL || 'http://localhost:8084'

interface ApiOptions extends RequestInit {
  headers?: Record<string, string>
}

export async function apiCall<T>(
  endpoint: string,
  options: ApiOptions = {},
  serviceUrl?: string
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Determine base URL based on endpoint or use provided serviceUrl
  let baseUrl = serviceUrl || AUTH_SERVICE_URL
  if (!serviceUrl) {
    if (endpoint.startsWith('/api/auth') || endpoint.startsWith('/auth')) {
      baseUrl = AUTH_SERVICE_URL
    } else if (endpoint.startsWith('/api/events') || endpoint.startsWith('/events')) {
      baseUrl = EVENT_SERVICE_URL
    } else if (endpoint.startsWith('/api/registrations') || endpoint.startsWith('/registrations')) {
      baseUrl = REGISTRATION_SERVICE_URL
    } else if (endpoint.startsWith('/api/tickets') || endpoint.startsWith('/tickets')) {
      baseUrl = TICKET_SERVICE_URL
    }
  }

  // Keep the endpoint as is - services expect /api prefix
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorMessage = response.statusText
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch (e) {
      // If response is not JSON, use statusText
    }
    
    const error: any = new Error(errorMessage)
    error.status = response.status
    throw error
  }

  return response.json()
}

export const authApi = {
  login: (email: string, password: string) =>
    apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  signup: (userData: { email: string; password: string; firstName: string; lastName: string; role: string }) =>
    apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userName')
    localStorage.removeItem('userId')
    localStorage.removeItem('userRole')
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
  
  update: (id: string, event: any) =>
    apiCall(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    }),
  
  delete: (id: string) =>
    apiCall(`/api/events/${id}`, { method: 'DELETE' }),
}

export const registrationApi = {
  register: (data: { eventId: number; userId: number; numberOfTickets: number; totalPrice: number; status: string; specialRequirements?: string }) => {
    console.log('📤 API CLIENT - Sending registration request:', JSON.stringify(data, null, 2))
    return apiCall('/api/registrations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  
  getUserRegistrations: (userId: string) =>
    apiCall(`/api/registrations/user/${userId}`, { method: 'GET' }),
  
  getEventRegistrations: (eventId: string) =>
    apiCall(`/api/registrations/event/${eventId}`, { method: 'GET' }),
  
  getById: (id: string) =>
    apiCall(`/api/registrations/${id}`, { method: 'GET' }),
  
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
