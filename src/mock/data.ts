import type { Customer, Vehicle, JobCard, InventoryItem, Quotation, Invoice, Supplier, DashboardStats, RevenueDataPoint, ServiceTrendPoint, VehicleTypeData, ActivityItem } from '@/types'

export const mockCustomers: Customer[] = []

export const mockVehicles: Vehicle[] = []

export const mockJobs: JobCard[] = []

export const mockInventory: InventoryItem[] = []

export const mockQuotations: Quotation[] = []

export const mockInvoices: Invoice[] = []

export const mockSuppliers: Supplier[] = []

export const mockDashboardStats: DashboardStats = {
  todayRevenue: 0,
  vehiclesInGarage: 0,
  activeJobs: 0,
  pendingDeliveries: 0,
  lowStockItems: 0,
  activeQuotations: 0,
  completedServices: 0,
  monthlyRevenue: 0,
  revenueChange: 0,
  jobsChange: 0,
}

export const mockRevenueData: RevenueDataPoint[] = []

export const mockServiceTrend: ServiceTrendPoint[] = []

export const mockVehicleTypes: VehicleTypeData[] = []

export const mockActivity: ActivityItem[] = []