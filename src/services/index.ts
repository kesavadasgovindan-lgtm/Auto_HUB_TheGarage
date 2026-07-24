import { mockCustomers } from '@/mock/data'
import type { Customer } from '@/types'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

let customers = [...mockCustomers]

export const customersService = {
  async getAll(): Promise<Customer[]> {
    await delay(300)
    return customers
  },

  async getById(id: string): Promise<Customer | undefined> {
    await delay(200)
    return customers.find((c) => c.id === id)
  },

  async search(query: string): Promise<Customer[]> {
    await delay(200)
    const q = query.toLowerCase()
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email?.toLowerCase().includes(q)
    )
  },

  async create(data: Omit<Customer, 'id' | 'vehicleCount' | 'totalBilled' | 'createdAt'>): Promise<Customer> {
    await delay(400)
    const newCustomer: Customer = {
      ...data,
      id: `c${Date.now()}`,
      vehicleCount: 0,
      totalBilled: 0,
      createdAt: new Date().toISOString(),
    }
    customers = [newCustomer, ...customers]
    return newCustomer
  },

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    await delay(400)
    customers = customers.map((c) => (c.id === id ? { ...c, ...data } : c))
    return customers.find((c) => c.id === id)!
  },

  async delete(id: string): Promise<void> {
    await delay(300)
    customers = customers.filter((c) => c.id !== id)
  },
}

export const vehiclesService = {
  async getAll() {
    await delay(300)
    const { mockVehicles } = await import('@/mock/data')
    return mockVehicles
  },
  async getByCustomer(customerId: string) {
    await delay(200)
    const { mockVehicles } = await import('@/mock/data')
    return mockVehicles.filter((v) => v.customerId === customerId)
  },
  async getById(id: string) {
    await delay(200)
    const { mockVehicles } = await import('@/mock/data')
    return mockVehicles.find((v) => v.id === id)
  },
}

export const jobsService = {
  async getAll() {
    await delay(300)
    const { mockJobs } = await import('@/mock/data')
    return mockJobs
  },
  async getById(id: string) {
    await delay(200)
    const { mockJobs } = await import('@/mock/data')
    return mockJobs.find((j) => j.id === id)
  },
  async getByStatus(status: string) {
    await delay(200)
    const { mockJobs } = await import('@/mock/data')
    return mockJobs.filter((j) => j.status === status)
  },
}

export const inventoryService = {
  async getAll() {
    await delay(300)
    const { mockInventory } = await import('@/mock/data')
    return mockInventory
  },
  async getLowStock() {
    await delay(200)
    const { mockInventory } = await import('@/mock/data')
    return mockInventory.filter((i) => i.quantity <= i.minimumStock)
  },
  async search(query: string) {
    await delay(200)
    const { mockInventory } = await import('@/mock/data')
    const q = query.toLowerCase()
    return mockInventory.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.partNumber.toLowerCase().includes(q) ||
        i.brand.toLowerCase().includes(q)
    )
  },
}

export const quotationsService = {
  async getAll() {
    await delay(300)
    const { mockQuotations } = await import('@/mock/data')
    return mockQuotations
  },
  async getById(id: string) {
    await delay(200)
    const { mockQuotations } = await import('@/mock/data')
    return mockQuotations.find((q) => q.id === id)
  },
}

export const billingService = {
  async getAll() {
    await delay(300)
    const { mockInvoices } = await import('@/mock/data')
    return mockInvoices
  },
  async getById(id: string) {
    await delay(200)
    const { mockInvoices } = await import('@/mock/data')
    return mockInvoices.find((i) => i.id === id)
  },
}

export const dashboardService = {
  async getStats() {
    await delay(400)
    const { mockDashboardStats } = await import('@/mock/data')
    return mockDashboardStats
  },
  async getRevenueData() {
    await delay(300)
    const { mockRevenueData } = await import('@/mock/data')
    return mockRevenueData
  },
  async getServiceTrend() {
    await delay(300)
    const { mockServiceTrend } = await import('@/mock/data')
    return mockServiceTrend
  },
  async getVehicleTypes() {
    await delay(200)
    const { mockVehicleTypes } = await import('@/mock/data')
    return mockVehicleTypes
  },
  async getActivity() {
    await delay(200)
    const { mockActivity } = await import('@/mock/data')
    return mockActivity
  },
}

export const authService = {
  async login(email: string, password: string) {
    await delay(800)
    if (email === 'admin@autohub.com' && password === 'admin123') {
      const token = 'mock_jwt_token_' + Date.now()
      localStorage.setItem('autohub_token', token)
      return {
        user: {
          id: 'u1',
          name: 'Amit Patel',
          email: 'admin@autohub.com',
          role: 'admin' as const,
          createdAt: '2025-01-01',
        },
        token,
      }
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
