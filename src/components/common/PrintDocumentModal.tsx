import React from 'react'
import { Printer, X } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface PrintDocumentProps {
  open: boolean
  documentType: 'TAX INVOICE' | 'QUOTATION'
  data: any
  onClose: () => void
}

// Convert numbers to AED amount in words
function numberToWordsAED(amount: number): string {
  const rounded = Math.round(amount * 100) / 100
  const dirhams = Math.floor(rounded)
  const fils = Math.round((rounded - dirhams) * 100)

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function convertGroup(n: number): string {
    if (n === 0) return ''
    if (n < 20) return units[n] + ' '
    if (n < 100) return tens[Math.floor(n / 10)] + ' ' + (n % 10 !== 0 ? units[n % 10] + ' ' : '')
    return units[Math.floor(n / 100)] + ' Hundred ' + (n % 100 !== 0 ? convertGroup(n % 100) : '')
  }

  function toWords(n: number): string {
    if (n === 0) return 'Zero'
    let words = ''
    if (n >= 1000000) {
      words += convertGroup(Math.floor(n / 1000000)) + 'Million '
      n %= 1000000
    }
    if (n >= 1000) {
      words += convertGroup(Math.floor(n / 1000)) + 'Thousand '
      n %= 1000
    }
    if (n > 0) {
      words += convertGroup(n)
    }
    return words.trim()
  }

  let result = `(AED. ${toWords(dirhams)}`
  if (fils > 0) {
    result += ` and ${toWords(fils)} Fils`
  }
  result += ' Only)'
  return result
}

export function PrintDocumentModal({ open, documentType, data, onClose }: PrintDocumentProps) {
  if (!open || !data) return null

  const handlePrint = () => {
    window.print()
  }

  const items = data.items || data.Items || []
  const custName = data.customerName || data.customer?.name || data.Customer?.Name || 'NIZAM HILTON SOBIN'
  const custPhone = data.customerPhone || data.customer?.phone || data.Customer?.Phone || '0549960403'
  const vehNum = data.vehicleNumber || data.vehicle?.vehicleNumber || data.Vehicle?.VehicleNumber || 'hyundai accent D 82961'
  const makeModel = data.vehicleName || (data.vehicle ? `${data.vehicle.brand} ${data.vehicle.model}` : 'hyundai accent')
  
  const docDate = data.invoiceDate || data.date || data.createdAt || new Date().toISOString()
  const docNum = data.invoiceNumber || data.quotationNumber || data.InvoiceNumber || data.QuotationNumber || `219`
  const paymentMode = data.paymentMode || data.paymentMethod || 'Cash'

  // Add Labour Charge as line item if present
  const labourCharges = data.labourCharges || data.LabourCharges || 0
  const allItems = [...items]
  if (labourCharges > 0 && !allItems.some((i: any) => (i.description || i.Description || '').toUpperCase().includes('LABOUR'))) {
    allItems.push({
      description: 'LABOUR CHARGE',
      code: '10065',
      rate: labourCharges,
      quantity: 1,
      vatPercent: 5, // 5% VAT on Labour
      isLabour: true
    })
  }

  // Per-item VAT calculations matching sample document
  let calculatedGross = 0
  let calculatedVat = 0

  const processedItems = allItems.map((item: any, idx: number) => {
    const desc = item.description || item.Description || item.partName || 'Service Item'
    const code = item.code || item.itemCode || item.partNumber || (1000 + idx + 1)
    const rate = item.rate ?? item.unitPrice ?? 0
    const qty = item.quantity ?? 1
    const gross = rate * qty
    
    // Per-item VAT from inventory setting (0% if vatApplicable === false, else vatPercent or 5%)
    let vatRate = 0.05
    if (item.vatApplicable === false || item.vatPercent === 0) {
      vatRate = 0
    } else if (typeof item.vatPercent === 'number') {
      vatRate = item.vatPercent / 100
    }

    const vat = gross * vatRate
    const net = gross + vat

    calculatedGross += gross
    calculatedVat += vat

    return { idx: idx + 1, code, desc, rate, qty, gross, vat, net, vatPercent: vatRate * 100 }
  })

  const grossTotal = calculatedGross
  const totalVat = calculatedVat
  const netTotal = grossTotal + totalVat

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      {/* Control Action Bar */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all"
        >
          <Printer className="w-4 h-4" /> Print Document
        </button>
        <button
          onClick={onClose}
          className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Printable Sheet */}
      <div className="w-full max-w-[800px] bg-white text-black p-8 rounded-xl shadow-2xl my-8 print:m-0 print:p-6 print:w-full print:shadow-none font-sans text-xs">
        
        {/* Header Section */}
        <div className="flex justify-between items-start pb-4 border-b-2 border-gray-800 mb-4">
          <div className="w-1/3">
            <h1 className="font-extrabold text-base tracking-wide text-gray-900">AUTO HUB GARAGE</h1>
            <p className="text-[11px] text-red-600 font-medium">Mobile : 054 371 0766</p>
            <p className="text-[11px] text-red-600 leading-tight">Al Qasidat,<br />Behind Kuzam Street,<br />Ras Al Khaimah - U.A.E</p>
          </div>

          <div className="w-1/3 text-center flex flex-col items-center">
            <div className="w-12 h-12 mb-1 flex items-center justify-center rounded-full bg-red-600 text-white font-bold text-lg border-2 border-gray-900">
              AH
            </div>
            <div className="bg-slate-800 text-white px-4 py-1.5 rounded-sm font-bold text-sm tracking-wider uppercase">
              {documentType}
            </div>
            <p className="text-[10px] font-semibold mt-1 text-slate-800">TRN : 105052803100003</p>
          </div>

          <div className="w-1/3 text-right">
            <h1 className="font-extrabold text-base text-red-700 font-arabic">كراج أوتو هب</h1>
            <p className="text-[11px] text-red-600 font-medium font-arabic">متحرك : ٠٥٤ ٣٧١ ٠٧٦٦</p>
            <p className="text-[11px] text-red-600 leading-tight font-arabic">القصيدات<br />خلف شارع خزام<br />رأس الخيمة</p>
          </div>
        </div>

        {/* Metadata Section */}
        <div className="grid grid-cols-2 gap-4 mb-4 pb-3 border-b border-gray-300">
          <div className="space-y-1">
            <div className="flex"><span className="w-24 font-bold">Customer</span><span>: {custName}</span></div>
            <div className="flex"><span className="w-24 font-bold">Telephone</span><span>: {custPhone}</span></div>
            <div className="flex"><span className="w-24 font-bold">Vehicle No</span><span>: {vehNum}</span></div>
            <div className="flex"><span className="w-24 font-bold">Make & Model</span><span>: {makeModel}</span></div>
            <div className="flex"><span className="w-24 font-bold">TRN Number</span><span>: {data.trn || '—'}</span></div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between"><span className="font-bold">{documentType === 'TAX INVOICE' ? 'Invoice Date' : 'Quotation Date'}</span><span>: {formatDate(docDate)}</span></div>
            <div className="flex justify-between"><span className="font-bold">{documentType === 'TAX INVOICE' ? 'Invoice Number' : 'Quotation Number'}</span><span>: {docNum}</span></div>
            <div className="flex justify-between"><span className="font-bold">PO Number</span><span>: {data.poNumber || '—'}</span></div>
            <div className="flex justify-between"><span className="font-bold">Invoice Mode</span><span>: {paymentMode}</span></div>
            <div className="flex justify-between"><span className="font-bold">QuotationNo</span><span>: {data.quotationNo || '0'}</span></div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse border border-gray-400 text-[11px] mb-4">
          <thead>
            <tr className="bg-gray-100 text-gray-800 font-bold border-b border-gray-400">
              <th className="border border-gray-400 px-1.5 py-1 text-center w-8">SL</th>
              <th className="border border-gray-400 px-1.5 py-1 text-left w-14">Code</th>
              <th className="border border-gray-400 px-2 py-1 text-left">Description</th>
              <th className="border border-gray-400 px-2 py-1 text-right w-16">Rate</th>
              <th className="border border-gray-400 px-1.5 py-1 text-center w-12">Qty</th>
              <th className="border border-gray-400 px-2 py-1 text-right w-16">Gross</th>
              <th className="border border-gray-400 px-2 py-1 text-right w-16">Vat 5%</th>
              <th className="border border-gray-400 px-2 py-1 text-right w-20">Net Amount</th>
            </tr>
          </thead>
          <tbody>
            {processedItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="border border-gray-400 p-4 text-center text-gray-500 italic">No line items</td>
              </tr>
            ) : (
              processedItems.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-300">
                  <td className="border border-gray-300 px-1.5 py-1 text-center">{item.idx}</td>
                  <td className="border border-gray-300 px-1.5 py-1 text-left">{item.code}</td>
                  <td className="border border-gray-300 px-2 py-1 text-left font-medium">{item.desc}</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">{item.rate.toFixed(2)}</td>
                  <td className="border border-gray-300 px-1.5 py-1 text-center">{item.qty.toFixed(2)}</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">{item.gross.toFixed(2)}</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">{item.vat.toFixed(2)}</td>
                  <td className="border border-gray-300 px-2 py-1 text-right font-bold">{item.net.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-gray-50">
              <td colSpan={7} className="border border-gray-400 px-2 py-1 text-right">Net Amount</td>
              <td className="border border-gray-400 px-2 py-1 text-right text-gray-900">{netTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Summary Footer */}
        <div className="grid grid-cols-2 gap-4 mb-8 pt-2">
          <div>
            <p className="font-bold mb-1">Amount In Words</p>
            <p className="font-semibold text-gray-800 text-[11px] leading-tight mb-4">
              {numberToWordsAED(netTotal)}
            </p>
            <p className="font-bold mb-1">Remarks</p>
            <p className="text-gray-700 italic">{data.remarks || data.Remarks || 'Thank you for choosing Auto Hub Garage!'}</p>
          </div>

          <div className="space-y-1 text-right">
            <div className="flex justify-between border-b border-gray-200 py-0.5"><span className="font-bold">Gross Amount</span><span className="font-semibold">{grossTotal.toFixed(2)}</span></div>
            <div className="flex justify-between border-b border-gray-200 py-0.5"><span className="font-bold">Less Discount</span><span className="font-semibold">0.00</span></div>
            <div className="flex justify-between border-b border-gray-200 py-0.5"><span className="font-bold">Taxable Amount</span><span className="font-semibold">{grossTotal.toFixed(2)}</span></div>
            <div className="flex justify-between border-b border-gray-200 py-0.5"><span className="font-bold">Vat 5%</span><span className="font-semibold">{totalVat.toFixed(2)}</span></div>
            <div className="flex justify-between pt-1 text-sm font-black"><span className="font-bold">Net Amount</span><span>{netTotal.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Signatures Footer */}
        <div className="pt-8 flex justify-between items-end border-t border-gray-400 text-[11px]">
          <div>
            <div className="w-36 border-b border-gray-600 mb-1"></div>
            <p className="font-bold">Reciever's Signature</p>
          </div>
          <div className="text-center text-gray-500 text-[10px]">
            <p>Mechanic, Denting & Painting etc..</p>
            <p>autohubrak@gmail.com</p>
          </div>
          <div className="text-right">
            <div className="w-36 border-b border-gray-600 mb-1"></div>
            <p className="font-bold">Authorized Signature</p>
          </div>
        </div>

      </div>
    </div>
  )
}
