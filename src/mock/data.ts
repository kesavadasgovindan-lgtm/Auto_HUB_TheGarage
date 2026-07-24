import type { Customer, Vehicle, JobCard, InventoryItem, Quotation, Invoice, Supplier, DashboardStats, RevenueDataPoint, ServiceTrendPoint, VehicleTypeData, ActivityItem } from '@/types'

export const mockCustomers: Customer[] = [
  { id: 'c1', name: 'Rajesh Kumar', phone: '9876543210', email: 'rajesh@gmail.com', address: '12, MG Road, Bangalore', gstNumber: '29AABCT1332L1ZX', notes: 'Regular customer', vehicleCount: 2, totalBilled: 45000, lastVisit: '2026-07-15', createdAt: '2025-01-10' },
  { id: 'c2', name: 'Priya Sharma', phone: '9845012345', email: 'priya.sharma@outlook.com', address: '45, Whitefield, Bangalore', vehicleCount: 1, totalBilled: 12000, lastVisit: '2026-07-10', createdAt: '2025-03-22' },
  { id: 'c3', name: 'Arjun Mehta', phone: '9900011223', email: 'arjun.mehta@company.com', address: '7, HSR Layout, Bangalore', gstNumber: '29BBBCS1234M1ZY', vehicleCount: 3, totalBilled: 89000, lastVisit: '2026-07-18', createdAt: '2024-11-05' },
  { id: 'c4', name: 'Sneha Reddy', phone: '9731234567', email: 'sneha.r@gmail.com', address: '23, Koramangala, Bangalore', vehicleCount: 1, totalBilled: 8500, lastVisit: '2026-06-30', createdAt: '2025-05-14' },
  { id: 'c5', name: 'Vikram Singh', phone: '9988776655', email: 'vikram.singh@tech.com', address: '89, Indiranagar, Bangalore', gstNumber: '29CCCDS5678N1ZZ', vehicleCount: 2, totalBilled: 67000, lastVisit: '2026-07-20', createdAt: '2024-09-01' },
  { id: 'c6', name: 'Anita Nair', phone: '9654321098', email: 'anita.nair@mail.com', address: '34, JP Nagar, Bangalore', vehicleCount: 1, totalBilled: 22000, lastVisit: '2026-07-05', createdAt: '2025-02-18' },
  { id: 'c7', name: 'Mohammed Farhan', phone: '9123456789', email: 'farhan@business.com', address: '56, Electronic City, Bangalore', gstNumber: '29DDDFT9012P1ZA', vehicleCount: 4, totalBilled: 134000, lastVisit: '2026-07-22', createdAt: '2024-06-15' },
  { id: 'c8', name: 'Kavitha Rajan', phone: '9567890123', email: 'kavitha.r@corp.com', address: '11, Bellandur, Bangalore', vehicleCount: 1, totalBilled: 5500, lastVisit: '2026-07-01', createdAt: '2026-01-20' },
]

export const mockVehicles: Vehicle[] = [
  { id: 'v1', customerId: 'c1', customerName: 'Rajesh Kumar', vehicleNumber: 'KA01AB1234', brand: 'Toyota', model: 'Innova Crysta', variant: 'GX', fuelType: 'Diesel', transmission: 'Manual', year: 2022, color: 'Pearl White', odometer: 45000, engineNumber: 'ENG123456', chassisNumber: 'CHS789012', insuranceExpiry: '2027-03-15', rcExpiry: '2030-11-20', createdAt: '2025-01-10' },
  { id: 'v2', customerId: 'c1', customerName: 'Rajesh Kumar', vehicleNumber: 'KA01CD5678', brand: 'Maruti Suzuki', model: 'Swift', variant: 'ZXI', fuelType: 'Petrol', transmission: 'Manual', year: 2020, color: 'Fiery Red', odometer: 62000, engineNumber: 'ENG234567', chassisNumber: 'CHS890123', insuranceExpiry: '2026-09-10', rcExpiry: '2025-08-14', createdAt: '2025-01-10' },
  { id: 'v3', customerId: 'c2', customerName: 'Priya Sharma', vehicleNumber: 'KA02EF9012', brand: 'Honda', model: 'City', variant: 'V', fuelType: 'Petrol', transmission: 'Automatic', year: 2023, color: 'Lunar Silver', odometer: 18000, engineNumber: 'ENG345678', chassisNumber: 'CHS901234', insuranceExpiry: '2027-06-22', rcExpiry: '2033-04-05', createdAt: '2025-03-22' },
  { id: 'v4', customerId: 'c3', customerName: 'Arjun Mehta', vehicleNumber: 'KA03GH3456', brand: 'BMW', model: '3 Series', variant: '320d', fuelType: 'Diesel', transmission: 'Automatic', year: 2024, color: 'Alpine White', odometer: 8000, engineNumber: 'ENG456789', chassisNumber: 'CHS012345', insuranceExpiry: '2027-12-01', rcExpiry: '2034-08-20', createdAt: '2024-11-05' },
  { id: 'v5', customerId: 'c5', customerName: 'Vikram Singh', vehicleNumber: 'KA05IJ7890', brand: 'Hyundai', model: 'Creta', variant: 'SX', fuelType: 'Petrol', transmission: 'Automatic', year: 2023, color: 'Typhoon Silver', odometer: 25000, engineNumber: 'ENG567890', chassisNumber: 'CHS123456', insuranceExpiry: '2027-04-18', rcExpiry: '2033-07-12', createdAt: '2024-09-01' },
  { id: 'v6', customerId: 'c7', customerName: 'Mohammed Farhan', vehicleNumber: 'KA07KL2345', brand: 'Mercedes-Benz', model: 'E-Class', variant: 'E220d', fuelType: 'Diesel', transmission: 'Automatic', year: 2023, color: 'Obsidian Black', odometer: 32000, engineNumber: 'ENG678901', chassisNumber: 'CHS234567', insuranceExpiry: '2027-09-30', rcExpiry: '2033-11-25', createdAt: '2024-06-15' },
]

export const mockJobs: JobCard[] = [
  { id: 'j1', jobNumber: 'JOB-2026-001', customerId: 'c1', customerName: 'Rajesh Kumar', customerPhone: '9876543210', vehicleId: 'v1', vehicleNumber: 'KA01AB1234', vehicleName: 'Toyota Innova Crysta', complaint: 'Engine noise at idle, AC not cooling properly', inspectionNotes: 'Found worn engine mounts and low refrigerant level', repairNotes: 'Replaced engine mounts, recharged AC with R134a', estimatedCompletion: '2026-07-24', mechanicId: 'm1', mechanicName: 'Suresh Kumar', priority: 'High', status: 'Repairing', labourCharges: 3500, parts: [{ partId: 'p1', partName: 'Engine Mount (Front)', partNumber: 'EM-TOY-001', quantity: 2, unitPrice: 1200, total: 2400 }, { partId: 'p2', partName: 'R134a Refrigerant', partNumber: 'REF-134A', quantity: 1, unitPrice: 800, total: 800 }], statusHistory: [{ status: 'Received', changedAt: '2026-07-22T09:00:00', changedBy: 'Amit Patel' }, { status: 'Inspection', changedAt: '2026-07-22T10:30:00', changedBy: 'Suresh Kumar' }, { status: 'Repairing', changedAt: '2026-07-22T14:00:00', changedBy: 'Suresh Kumar' }], createdAt: '2026-07-22', updatedAt: '2026-07-22' },
  { id: 'j2', jobNumber: 'JOB-2026-002', customerId: 'c2', customerName: 'Priya Sharma', customerPhone: '9845012345', vehicleId: 'v3', vehicleNumber: 'KA02EF9012', vehicleName: 'Honda City V', complaint: 'Brake pads worn, vibration while braking', inspectionNotes: 'Front brake pads at 10%, rotors need machining', estimatedCompletion: '2026-07-23', mechanicId: 'm2', mechanicName: 'Ramesh Babu', priority: 'High', status: 'Quality Check', labourCharges: 2000, parts: [{ partId: 'p3', partName: 'Front Brake Pads Set', partNumber: 'BP-HON-F01', quantity: 1, unitPrice: 2500, total: 2500 }], statusHistory: [{ status: 'Received', changedAt: '2026-07-21T08:30:00', changedBy: 'Amit Patel' }, { status: 'Inspection', changedAt: '2026-07-21T09:00:00', changedBy: 'Ramesh Babu' }, { status: 'Repairing', changedAt: '2026-07-21T11:00:00', changedBy: 'Ramesh Babu' }, { status: 'Quality Check', changedAt: '2026-07-22T16:00:00', changedBy: 'Ramesh Babu' }], createdAt: '2026-07-21', updatedAt: '2026-07-22' },
  { id: 'j3', jobNumber: 'JOB-2026-003', customerId: 'c4', customerName: 'Sneha Reddy', customerPhone: '9731234567', vehicleId: 'v5', vehicleNumber: 'KA05IJ7890', vehicleName: 'Hyundai Creta SX', complaint: 'Oil change and general service', priority: 'Normal', status: 'Received', labourCharges: 1500, parts: [{ partId: 'p4', partName: 'Engine Oil 5W-30 (4L)', partNumber: 'OIL-5W30-4', quantity: 1, unitPrice: 1200, total: 1200 }, { partId: 'p5', partName: 'Oil Filter', partNumber: 'OF-HYN-001', quantity: 1, unitPrice: 350, total: 350 }], statusHistory: [{ status: 'Received', changedAt: '2026-07-23T09:00:00', changedBy: 'Amit Patel' }], createdAt: '2026-07-23', updatedAt: '2026-07-23' },
  { id: 'j4', jobNumber: 'JOB-2026-004', customerId: 'c7', customerName: 'Mohammed Farhan', customerPhone: '9123456789', vehicleId: 'v6', vehicleNumber: 'KA07KL2345', vehicleName: 'Mercedes-Benz E220d', complaint: 'Check engine light on, poor fuel efficiency', inspectionNotes: 'EGR valve faulty, DPF clogged', estimatedCompletion: '2026-07-26', mechanicId: 'm1', mechanicName: 'Suresh Kumar', priority: 'Urgent', status: 'Waiting for Parts', labourCharges: 8000, parts: [{ partId: 'p6', partName: 'EGR Valve', partNumber: 'EGR-MB-E22', quantity: 1, unitPrice: 15000, total: 15000 }], statusHistory: [{ status: 'Received', changedAt: '2026-07-20T10:00:00', changedBy: 'Amit Patel' }, { status: 'Inspection', changedAt: '2026-07-20T11:30:00', changedBy: 'Suresh Kumar' }, { status: 'Waiting for Parts', changedAt: '2026-07-20T15:00:00', changedBy: 'Suresh Kumar' }], createdAt: '2026-07-20', updatedAt: '2026-07-20' },
  { id: 'j5', jobNumber: 'JOB-2026-005', customerId: 'c5', customerName: 'Vikram Singh', customerPhone: '9988776655', vehicleId: 'v5', vehicleNumber: 'KA05IJ7890', vehicleName: 'Hyundai Creta SX', complaint: 'Tyre rotation and wheel alignment', priority: 'Normal', status: 'Completed', labourCharges: 800, parts: [], statusHistory: [{ status: 'Received', changedAt: '2026-07-19T08:00:00', changedBy: 'Amit Patel' }, { status: 'Repairing', changedAt: '2026-07-19T09:00:00', changedBy: 'Ramesh Babu' }, { status: 'Completed', changedAt: '2026-07-19T11:00:00', changedBy: 'Ramesh Babu' }], createdAt: '2026-07-19', updatedAt: '2026-07-19' },
]

export const mockInventory: InventoryItem[] = [
  { id: 'p1', partNumber: 'EM-TOY-001', name: 'Engine Mount (Front)', category: 'Engine Parts', brand: 'Toyota Genuine', supplierId: 's1', supplierName: 'AutoParts Express', purchasePrice: 900, sellingPrice: 1200, mrp: 1500, quantity: 8, minimumStock: 5, rackLocation: 'A-1-3', createdAt: '2025-01-01', updatedAt: '2026-07-22' },
  { id: 'p2', partNumber: 'REF-134A', name: 'R134a Refrigerant (1kg)', category: 'Accessories', brand: 'Honeywell', supplierId: 's2', supplierName: 'CoolTech Supplies', purchasePrice: 600, sellingPrice: 800, mrp: 950, quantity: 12, minimumStock: 10, rackLocation: 'C-2-1', createdAt: '2025-01-01', updatedAt: '2026-07-22' },
  { id: 'p3', partNumber: 'BP-HON-F01', name: 'Front Brake Pads Set (Honda)', category: 'Body Parts', brand: 'Brembo', supplierId: 's1', supplierName: 'AutoParts Express', purchasePrice: 1800, sellingPrice: 2500, mrp: 3000, quantity: 3, minimumStock: 5, rackLocation: 'B-3-2', createdAt: '2025-02-15', updatedAt: '2026-07-21' },
  { id: 'p4', partNumber: 'OIL-5W30-4', name: 'Engine Oil 5W-30 (4L)', category: 'Lubricants', brand: 'Castrol GTX', supplierId: 's3', supplierName: 'LubeKing', purchasePrice: 850, sellingPrice: 1200, mrp: 1450, quantity: 24, minimumStock: 20, rackLocation: 'D-1-1', createdAt: '2025-01-01', updatedAt: '2026-07-23' },
  { id: 'p5', partNumber: 'OF-HYN-001', name: 'Oil Filter (Hyundai)', category: 'Engine Parts', brand: 'Mann Filter', supplierId: 's1', supplierName: 'AutoParts Express', purchasePrice: 220, sellingPrice: 350, mrp: 450, quantity: 18, minimumStock: 10, rackLocation: 'A-2-1', createdAt: '2025-01-01', updatedAt: '2026-07-23' },
  { id: 'p6', partNumber: 'EGR-MB-E22', name: 'EGR Valve (Mercedes E220d)', category: 'Engine Parts', brand: 'Bosch', supplierId: 's4', supplierName: 'Euro Auto Parts', purchasePrice: 11000, sellingPrice: 15000, mrp: 18000, quantity: 0, minimumStock: 2, rackLocation: 'A-4-5', createdAt: '2025-06-10', updatedAt: '2026-07-20' },
  { id: 'p7', partNumber: 'TYR-195-65-15', name: 'Tyre 195/65 R15 (MRF)', category: 'Tyres', brand: 'MRF', supplierId: 's5', supplierName: 'TyreMart', purchasePrice: 3500, sellingPrice: 4500, mrp: 5200, quantity: 16, minimumStock: 8, rackLocation: 'E-1-1', createdAt: '2025-01-01', updatedAt: '2026-07-15' },
  { id: 'p8', partNumber: 'SF-UNI-001', name: 'Spark Plug (Iridium)', category: 'Electrical', brand: 'NGK', supplierId: 's1', supplierName: 'AutoParts Express', purchasePrice: 280, sellingPrice: 420, mrp: 500, quantity: 4, minimumStock: 20, rackLocation: 'C-1-2', createdAt: '2025-01-01', updatedAt: '2026-07-10' },
  { id: 'p9', partNumber: 'AB-UNI-SHK', name: 'Shock Absorber (Front)', category: 'Suspension', brand: 'Monroe', supplierId: 's6', supplierName: 'Suspension World', purchasePrice: 2800, sellingPrice: 4000, mrp: 4800, quantity: 6, minimumStock: 4, rackLocation: 'F-2-3', createdAt: '2025-03-01', updatedAt: '2026-07-12' },
  { id: 'p10', partNumber: 'ATF-DX3-4', name: 'ATF Dexron III (4L)', category: 'Lubricants', brand: 'Valvoline', supplierId: 's3', supplierName: 'LubeKing', purchasePrice: 1100, sellingPrice: 1600, mrp: 1900, quantity: 8, minimumStock: 10, rackLocation: 'D-1-3', createdAt: '2025-01-01', updatedAt: '2026-07-18' },
]

export const mockQuotations: Quotation[] = [
  { id: 'q1', quotationNumber: 'QUO-2026-001', customerId: 'c1', customerName: 'Rajesh Kumar', customerPhone: '9876543210', vehicleId: 'v1', vehicleNumber: 'KA01AB1234', vehicleName: 'Toyota Innova Crysta', date: '2026-07-22', validUntil: '2026-08-22', items: [{ description: 'Engine Mount Replacement', type: 'labour', quantity: 1, unitPrice: 2000, discount: 0, total: 2000 }, { description: 'Engine Mount (Front) x2', type: 'part', partId: 'p1', quantity: 2, unitPrice: 1200, discount: 0, total: 2400 }, { description: 'AC Gas Recharge', type: 'labour', quantity: 1, unitPrice: 1500, discount: 0, total: 1500 }, { description: 'R134a Refrigerant', type: 'part', partId: 'p2', quantity: 1, unitPrice: 800, discount: 0, total: 800 }], labourCharges: 3500, subtotal: 6700, discountAmount: 0, discountPercent: 0, gstPercent: 18, gstAmount: 1206, grandTotal: 7906, status: 'Approved', notes: 'Customer approved over phone', createdAt: '2026-07-22', updatedAt: '2026-07-22' },
  { id: 'q2', quotationNumber: 'QUO-2026-002', customerId: 'c7', customerName: 'Mohammed Farhan', customerPhone: '9123456789', vehicleId: 'v6', vehicleNumber: 'KA07KL2345', vehicleName: 'Mercedes-Benz E220d', date: '2026-07-20', validUntil: '2026-08-20', items: [{ description: 'EGR Valve Replacement', type: 'labour', quantity: 1, unitPrice: 5000, discount: 0, total: 5000 }, { description: 'EGR Valve', type: 'part', partId: 'p6', quantity: 1, unitPrice: 15000, discount: 0, total: 15000 }, { description: 'DPF Cleaning', type: 'labour', quantity: 1, unitPrice: 3000, discount: 0, total: 3000 }], labourCharges: 8000, subtotal: 23000, discountAmount: 1000, discountPercent: 4.3, gstPercent: 18, gstAmount: 3960, grandTotal: 25960, status: 'Pending', notes: 'Waiting for customer approval', createdAt: '2026-07-20', updatedAt: '2026-07-20' },
  { id: 'q3', quotationNumber: 'QUO-2026-003', customerId: 'c3', customerName: 'Arjun Mehta', customerPhone: '9900011223', vehicleId: 'v4', vehicleNumber: 'KA03GH3456', vehicleName: 'BMW 320d', date: '2026-07-18', validUntil: '2026-08-18', items: [{ description: '30,000 km Service', type: 'labour', quantity: 1, unitPrice: 4000, discount: 0, total: 4000 }, { description: 'Engine Oil 5W-30', type: 'part', partId: 'p4', quantity: 2, unitPrice: 1200, discount: 0, total: 2400 }], labourCharges: 4000, subtotal: 6400, discountAmount: 0, discountPercent: 0, gstPercent: 18, gstAmount: 1152, grandTotal: 7552, status: 'Draft', createdAt: '2026-07-18', updatedAt: '2026-07-18' },
]

export const mockInvoices: Invoice[] = [
  { id: 'i1', invoiceNumber: 'INV-2026-001', customerId: 'c2', customerName: 'Priya Sharma', customerPhone: '9845012345', customerEmail: 'priya.sharma@outlook.com', vehicleId: 'v3', vehicleNumber: 'KA02EF9012', vehicleName: 'Honda City V', items: [{ description: 'Brake Pad Replacement (Front)', type: 'labour', quantity: 1, unitPrice: 2000, discount: 0, total: 2000 }, { description: 'Front Brake Pads Set', type: 'part', quantity: 1, unitPrice: 2500, discount: 0, total: 2500 }], labourCharges: 2000, subtotal: 4500, discountAmount: 0, discountPercent: 0, gstPercent: 18, gstAmount: 810, grandTotal: 5310, amountPaid: 5310, amountDue: 0, paymentMode: 'UPI', status: 'Paid', createdAt: '2026-07-22', updatedAt: '2026-07-22' },
  { id: 'i2', invoiceNumber: 'INV-2026-002', customerId: 'c5', customerName: 'Vikram Singh', customerPhone: '9988776655', vehicleId: 'v5', vehicleNumber: 'KA05IJ7890', vehicleName: 'Hyundai Creta SX', items: [{ description: 'Tyre Rotation & Balancing', type: 'labour', quantity: 1, unitPrice: 500, discount: 0, total: 500 }, { description: 'Wheel Alignment', type: 'labour', quantity: 1, unitPrice: 300, discount: 0, total: 300 }], labourCharges: 800, subtotal: 800, discountAmount: 0, discountPercent: 0, gstPercent: 18, gstAmount: 144, grandTotal: 944, amountPaid: 944, amountDue: 0, paymentMode: 'Cash', status: 'Paid', createdAt: '2026-07-19', updatedAt: '2026-07-19' },
]

export const mockSuppliers: Supplier[] = [
  { id: 's1', name: 'AutoParts Express', phone: '9900001111', email: 'sales@autopartsexpress.com', address: 'Industrial Area, Peenya, Bangalore', gstNumber: '29XXXXX0001A1Z5', contactPerson: 'Mahesh Kumar', paymentTerms: 'Net 30', totalPurchases: 450000, createdAt: '2024-01-01' },
  { id: 's2', name: 'CoolTech Supplies', phone: '9900002222', email: 'info@cooltech.com', address: 'Rajajinagar, Bangalore', contactPerson: 'Ramesh', paymentTerms: 'Net 15', totalPurchases: 85000, createdAt: '2024-03-15' },
  { id: 's3', name: 'LubeKing', phone: '9900003333', email: 'orders@lubeking.com', address: 'Yeshwanthpur, Bangalore', gstNumber: '29YYYYY0002B2Z6', contactPerson: 'Ravi Shankar', paymentTerms: 'Immediate', totalPurchases: 220000, createdAt: '2024-01-01' },
  { id: 's4', name: 'Euro Auto Parts', phone: '9900004444', email: 'india@euroauto.com', address: 'Cunningham Road, Bangalore', gstNumber: '29ZZZZZ0003C3Z7', contactPerson: 'Sanjay', paymentTerms: 'Net 45', totalPurchases: 380000, createdAt: '2024-06-01' },
]

export const mockDashboardStats: DashboardStats = {
  todayRevenue: 47250,
  vehiclesInGarage: 12,
  activeJobs: 7,
  pendingDeliveries: 3,
  lowStockItems: 4,
  activeQuotations: 5,
  completedServices: 28,
  monthlyRevenue: 892000,
  revenueChange: 12.5,
  jobsChange: 8.3,
}

export const mockRevenueData: RevenueDataPoint[] = [
  { date: 'Jan', revenue: 720000, expenses: 280000 },
  { date: 'Feb', revenue: 650000, expenses: 260000 },
  { date: 'Mar', revenue: 810000, expenses: 310000 },
  { date: 'Apr', revenue: 740000, expenses: 290000 },
  { date: 'May', revenue: 890000, expenses: 320000 },
  { date: 'Jun', revenue: 950000, expenses: 350000 },
  { date: 'Jul', revenue: 892000, expenses: 330000 },
]

export const mockServiceTrend: ServiceTrendPoint[] = [
  { month: 'Jan', jobs: 142, completed: 138 },
  { month: 'Feb', jobs: 128, completed: 125 },
  { month: 'Mar', jobs: 165, completed: 160 },
  { month: 'Apr', jobs: 149, completed: 145 },
  { month: 'May', jobs: 178, completed: 172 },
  { month: 'Jun', jobs: 192, completed: 185 },
  { month: 'Jul', jobs: 156, completed: 148 },
]

export const mockVehicleTypes: VehicleTypeData[] = [
  { name: 'Sedan', value: 38, color: '#3B82F6' },
  { name: 'SUV', value: 32, color: '#F97316' },
  { name: 'Hatchback', value: 18, color: '#8B5CF6' },
  { name: 'Luxury', value: 8, color: '#EC4899' },
  { name: 'Commercial', value: 4, color: '#10B981' },
]

export const mockActivity: ActivityItem[] = [
  { id: 'a1', type: 'job', title: 'New job card created', description: 'JOB-2026-003 for Sneha Reddy - Oil Change', timestamp: '2026-07-23T09:00:00' },
  { id: 'a2', type: 'invoice', title: 'Invoice paid', description: 'INV-2026-001 - ₹5,310 via UPI by Priya Sharma', timestamp: '2026-07-22T17:30:00' },
  { id: 'a3', type: 'quotation', title: 'Quotation approved', description: 'QUO-2026-001 approved by Rajesh Kumar', timestamp: '2026-07-22T15:45:00' },
  { id: 'a4', type: 'job', title: 'Job status updated', description: 'JOB-2026-002 moved to Quality Check', timestamp: '2026-07-22T16:00:00' },
  { id: 'a5', type: 'stock', title: 'Low stock alert', description: 'EGR Valve (EGR-MB-E22) is out of stock', timestamp: '2026-07-22T14:00:00' },
  { id: 'a6', type: 'customer', title: 'New customer registered', description: 'Kavitha Rajan - 9567890123', timestamp: '2026-07-22T11:00:00' },
  { id: 'a7', type: 'vehicle', title: 'Vehicle added', description: 'KA07KL2345 - Mercedes-Benz E220d', timestamp: '2026-07-20T10:00:00' },
]