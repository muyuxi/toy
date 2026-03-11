import { NextResponse } from 'next/server'
import { inquiriesStore, productsStore } from '@/lib/store'
import * as XLSX from 'xlsx'

export async function GET(req: Request, { params }: { params: { code: string } }) {
  const inquiry = inquiriesStore.getByCode(params.code)

  if (!inquiry) return new NextResponse('Not found', { status: 404 })

  const items = JSON.parse(inquiry.data)

  const rows = items.map((item: any) => {
    const product = productsStore.getByItemNo(item.item_no)

    return {
      'Item No': item.item_no,
      'Category': product?.category || '',
      'Color': item.color,
      'Options': item.options.join(', '),
      'Quantity': item.qty,
      'Unit Price ($)': item.price.toFixed(2),
      'Subtotal ($)': (item.price * item.qty).toFixed(2),
      'GW': product?.gw || '',
      'NW': product?.nw || '',
      'Dimensions': product?.dimensions || '',
      'CBM': product?.cbm || '',
      'Loading Qty': product?.load_qty || '',
      'Your Quote (¥)': ''
    }
  })

  const totalQty = items.reduce((sum: number, item: any) => sum + item.qty, 0)
  const totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.qty, 0)

  rows.push({
    'Item No': 'TOTAL',
    'Category': '',
    'Color': '',
    'Options': '',
    'Quantity': totalQty,
    'Unit Price (¥)': '',
    'Subtotal (¥)': totalAmount.toFixed(2),
    'GW': '',
    'NW': '',
    'Dimensions': '',
    'CBM': '',
    'Loading Qty': '',
    'Your Quote (¥)': ''
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Inquiry')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="inquiry-${params.code}.xlsx"`
    }
  })
}
