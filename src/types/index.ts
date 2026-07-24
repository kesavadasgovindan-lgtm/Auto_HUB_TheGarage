// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'mechanic' | 'receptionist'
  avatar?: string
  phone?: string
  createdAt: string
}

// ─── Customer ────────────────────────────────────────────────────────────────

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  gstNumber?: string
  notes?: string
  vehicleCount: number
  totalBilled: number
  lastVisit?: string
  createdAt: string
}

// ─── Vehicle ─────────────────────────────────────────────────────────────────

export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid' | 'LPG'
export type TransmissionType = 'Manual' | 'Automatic' | 'CVT' | 'AMT' | 'DCT'

export interface Vehicle {
  id: string
  customerId: string
  customerName: string
  vehicleNumber: string
  brand: string
  model: string
  variant?: string
  fuelType: FuelType
  transmission: TransmissionType
  year: number
  vin?: string
  engineNumber?: string
  chassisNumber?: string
  color?: string
  odometer: number
  insuranceExpiry?: string
  rcExpiry?: string
  createdAt: string
}

// ─── Job Card ────────────────────────────────────────────────────────────────

export type JobStatus =
  | 'Received'
  | 'Inspection'
  | 'Repairing'
  | 'Waiting for Parts'
  | 'Quality Check'
  | 'Completed'
  | 'Delivered'

export type JobPriority = 'Low' | 'Normal' | 'High' | 'Urgent'

export interface JobPart {
  partId: string
  partName: string
  partNumber: string
  quantity: number
  unitPrice: number
  total: number
}

export interface JobCard {
  id: string
  jobNumber: string
  customerId: string
  customerName: string
  customerPhone: string
  vehicleId: string
  vehicleNumber: string
  vehicleName: string
  complaint: string
  inspectionNotes?: string
  repairNotes?: string
  estimatedCompletion?: string
  mechanicId?: string
  mechanicName?: string
  priority: JobPriority
  status: JobStatus
  labourCharges: number
  parts: JobPart[]
  photos?: string[]
  attachments?: string[]
  customerNotes?: string
  statusHistory: StatusHistoryEntry[]
  createdAt: string
  updatedAt: string
}

export interface StatusHistoryEntry {
  status: JobStatus
  changedAt: string
  changedBy: string
  notes?: string
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export type PartCategory =
  | 'Engine Parts'
  | 'Body Parts'
  | 'Electrical'
  | 'Suspension'
  | 'Tyres'
  | 'Lubricants'
  | 'Accessories'
  | 'Tools'

export interface InventoryItem {
  id: string
  partNumber: string
  barcode?: string
  name: string
  category: PartCategory
  brand: string
  supplierId?: string
  supplierName?: string
  purchasePrice: number
  sellingPrice: number
  mrp: number
  quantity: number
  minimumStock: number
  rackLocation?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface StockAdjustment {
  id: string
  partId: string
  partName: string
  type: 'addition' | 'deduction' | 'correction'
  quantity: number
  previousStock: number
  newStock: number
  reason: string
  createdAt: string
  createdBy: string
}

// ─── Supplier ────────────────────────────────────────────────────────────────

export interface Supplier {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  gstNumber?: string
  contactPerson?: string
  paymentTerms?: string
  notes?: string
  totalPurchases: number
  createdAt: string
}

// ─── Purchase ────────────────────────────────────────────────────────────────

export interface PurchaseItem {
  partId: string
  partName: string
  partNumber: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Purchase {
  id: string
  purchaseNumber: string
  supplierId: string
  supplierName: string
  items: PurchaseItem[]
  subtotal: number
  gst: number
  total: number
  status: 'Draft' | 'Ordered' | 'Received' | 'Partial'
  invoiceNumber?: string
  expectedDate?: string
  receivedDate?: string
  notes?: string
  createdAt: string
}

// ─── Quotation ───────────────────────────────────────────────────────────────

export type QuotationStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Expired'

export interface QuotationItem {
  description: string
  type: 'part' | 'labour' | 'other'
  partId?: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

export interface Quotation {
  id: string
  quotationNumber: string
  customerId: string
  customerName: string
  customerPhone: string
  vehicleId: string
  vehicleNumber: string
  vehicleName: string
  date: string
  validUntil?: string
  items: QuotationItem[]
  labourCharges: number
  subtotal: number
  discountAmount: number
  discountPercent: number
  gstPercent: number
  gstAmount: number
  grandTotal: number
  status: QuotationStatus
  termsAndConditions?: string
  notes?: string
  invoiceId?: string
  createdAt: string
  updatedAt: string
}

// ─── Invoice / Billing ───────────────────────────────────────────────────────

export type PaymentMode = 'Cash' | 'UPI' | 'Credit Card' | 'Bank Transfer' | 'Credit'
export type InvoiceStatus = 'Draft' | 'Unpaid' | 'Partial' | 'Paid' | 'Cancelled'

export interface InvoiceItem {
  description: string
  type: 'part' | 'labour' | 'other'
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  quotationId?: string
  customerId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  customerAddress?: string
  customerGst?: string
  vehicleId?: string
  vehicleNumber?: string
  vehicleName?: string
  jobCardId?: string
  items: InvoiceItem[]
  labourCharges: number
  subtotal: number
  discountAmount: number
  discountPercent: number
  gstPercent: number
  gstAmount: number
  grandTotal: number
  amountPaid: number
  amountDue: number
  paymentMode: PaymentMode
  status: InvoiceStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  todayRevenue: number
  vehiclesInGarage: number
  activeJobs: number
  pendingDeliveries: number
  lowStockItems: number
  activeQuotations: number
  completedServices: number
  monthlyRevenue: number
  revenueChange: number
  jobsChange: number
}

export interface RevenueDataPoint {
  date: string
  revenue: number
  expenses: number
}

export interface ServiceTrendPoint {
  month: string
  jobs: number
  completed: number
}

export interface VehicleTypeData {
  name: string
  value: number
  color: string
}

export interface ActivityItem {
  id: string
  type: 'job' | 'invoice' | 'quotation' | 'customer' | 'vehicle' | 'stock'
  title: string
  description: string
  timestamp: string
  icon?: string
}

// ─── Report ──────────────────────────────────────────────────────────────────

export interface ReportFilter {
  startDate: string
  endDate: string
  type?: string
}

export interface RevenueReport {
  period: string
  revenue: number
  expenses: number
  profit: number
  invoiceCount: number
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchResult {
  id: string
  type: 'customer' | 'vehicle' | 'job' | 'quotation' | 'invoice' | 'part'
  title: string
  subtitle: string
  url: string
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface GarageSettings {
  name: string
  tagline?: string
  phone: string
  email?: string
  address: string
  gstNumber?: string
  logo?: string
  invoicePrefix: string
  quotationPrefix: string
  jobPrefix: string
  gstPercent: number
  termsAndConditions?: string
}
