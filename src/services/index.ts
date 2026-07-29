import { apiClient } from './api'
import type { Customer, Vehicle, JobCard, InventoryItem, Quotation, Invoice, Supplier } from '@/types'

export const customersService = {
  async getAll(): Promise<Customer[]> {
    const res = await apiClient.get('/customers')
    return res.data
  },

  async create(data: Partial<Customer>): Promise<Customer> {
    const res = await apiClient.post('/customers', data)
    return res.data
  },

  async update(id: string | number, data: Partial<Customer>): Promise<Customer> {
    const res = await apiClient.put(`/customers/${id}`, data)
    return res.data
  },

  async delete(id: string | number): Promise<void> {
    await apiClient.delete(`/customers/${id}`)
  },
}

export const vehiclesService = {
  async getAll(): Promise<Vehicle[]> {
    const res = await apiClient.get('/vehicles')
    return res.data
  },

  async create(data: Partial<Vehicle>): Promise<Vehicle> {
    const res = await apiClient.post('/vehicles', data)
    return res.data
  },
}

export const jobsService = {
  async getAll(): Promise<JobCard[]> {
    const res = await apiClient.get('/jobcards')
    return res.data
  },

  async create(data: Partial<JobCard>): Promise<JobCard> {
    const res = await apiClient.post('/jobcards', data)
    return res.data
  },

  async updateStatus(id: string | number, status: string): Promise<JobCard> {
    const res = await apiClient.patch(`/jobcards/${id}/status`, { status })
    return res.data
  },
}

export const inventoryService = {
  async getAll(): Promise<InventoryItem[]> {
    const res = await apiClient.get('/items')
    return res.data
  },

  async create(data: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await apiClient.post('/items', data)
    return res.data
  },

  async update(id: string | number, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await apiClient.put(`/items/${id}`, data)
    return res.data
  },

  async stockIn(id: string | number, quantity: number): Promise<void> {
    await apiClient.post(`/items/${id}/stock-in/${quantity}`)
  },
}


export const quotationsService = {
  async getAll(): Promise<Quotation[]> {
    const res = await apiClient.get('/quotations')
    return res.data
  },

  async create(data: Partial<Quotation>): Promise<Quotation> {
    const res = await apiClient.post('/quotations', data)
    return res.data
  },

  async update(id: string | number, data: Partial<Quotation>): Promise<Quotation> {
    const res = await apiClient.put(`/quotations/${id}`, data)
    return res.data
  },

  async delete(id: string | number): Promise<void> {
    await apiClient.delete(`/quotations/${id}`)
  },

  async convertToInvoice(id: string | number): Promise<{ id: number; invoiceNumber: string }> {
    const res = await apiClient.post(`/quotations/${id}/convert`)
    return res.data
  },
}

export const billingService = {
  async getAll(): Promise<Invoice[]> {
    const res = await apiClient.get('/invoices')
    return res.data
  },

  async create(data: Partial<Invoice>): Promise<Invoice> {
    const res = await apiClient.post('/invoices', { invoice: data, items: data.items })
    return res.data
  },
}

export const suppliersService = {
  async getAll(): Promise<Supplier[]> {
    const res = await apiClient.get('/suppliers')
    return res.data
  },

  async create(data: Partial<Supplier>): Promise<Supplier> {
    const res = await apiClient.post('/suppliers', data)
    return res.data
  },
}

export const dashboardService = {
  async getStats() {
    const res = await apiClient.get('/dashboard/stats')
    return res.data
  },
  async getRevenueData() {
    return [
      { date: 'Jan', revenue: 720000, expenses: 280000 },
      { date: 'Feb', revenue: 650000, expenses: 260000 },
      { date: 'Mar', revenue: 810000, expenses: 310000 },
      { date: 'Apr', revenue: 740000, expenses: 290000 },
      { date: 'May', revenue: 890000, expenses: 320000 },
      { date: 'Jun', revenue: 950000, expenses: 350000 },
      { date: 'Jul', revenue: 892000, expenses: 330000 },
    ]
  },
  async getServiceTrend() {
    return [
      { month: 'Jan', jobs: 142, completed: 138 },
      { month: 'Feb', jobs: 128, completed: 125 },
      { month: 'Mar', jobs: 165, completed: 160 },
      { month: 'Apr', jobs: 149, completed: 145 },
      { month: 'May', jobs: 178, completed: 172 },
      { month: 'Jun', jobs: 192, completed: 185 },
      { month: 'Jul', jobs: 156, completed: 148 },
    ]
  },
  async getVehicleTypes() {
    return [
      { name: 'Sedan', value: 38, color: '#3B82F6' },
      { name: 'SUV', value: 32, color: '#F97316' },
      { name: 'Hatchback', value: 18, color: '#8B5CF6' },
      { name: 'Luxury', value: 8, color: '#EC4899' },
      { name: 'Commercial', value: 4, color: '#10B981' },
    ]
  },
  async getActivity() {
    return [
      { id: 'a1', type: 'job', title: 'New job card created', description: 'JOB-2026-003 for Sneha Reddy - Oil Change', timestamp: '2026-07-23T09:00:00' },
      { id: 'a2', type: 'invoice', title: 'Invoice paid', description: 'INV-2026-001 - ₹5,310 via UPI by Priya Sharma', timestamp: '2026-07-22T17:30:00' },
      { id: 'a3', type: 'quotation', title: 'Quotation approved', description: 'QUO-2026-001 approved by Rajesh Kumar', timestamp: '2026-07-22T15:45:00' },
    ]
  },
}

export const authService = {
  async login(email: string, password: string) {
    const res = await apiClient.post('/auth/login', { email, password })
    if (res.data.token) {
      localStorage.setItem('autohub_token', res.data.token)
      const user = { id: 'u1', name: 'User', email, role: 'admin' as const, createdAt: new Date().toISOString() }
      localStorage.setItem('autohub_user', JSON.stringify(user))
      return { user, token: res.data.token }
    }
    throw new Error('Invalid credentials')
  },

  logout() {
    localStorage.removeItem('autohub_token')
    localStorage.removeItem('autohub_user')
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('autohub_token')
  },
}
