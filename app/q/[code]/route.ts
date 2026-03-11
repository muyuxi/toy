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
      'Item_No': item.item_no,
      'Category': product?.category || '',
      'Base_Price': product?.base_price || '',
      'Colors': item.color,
      'Options': item.options.join(', '),
      'Features': product?.features || '',
      'GW': product?.gw || '',
      'NW': product?.nw || '',
      'Dimensions': product?.dimensions || '',
      'CBM': product?.cbm || '',
      'Load_Qty': product?.load_qty || '',
      'Quantity': item.qty,
      'Total_Price': (item.price * item.qty).toFixed(2)
    }
  })

  const totalQty = items.reduce((sum: number, item: any) => sum + item.qty, 0)
  const totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.qty, 0)

  rows.push({
    'Item_No': 'TOTAL',
    'Category': '',
    'Base_Price': '',
    'Colors': '',
    'Options': '',
    'Features': '',
    'GW': '',
    'NW': '',
    'Dimensions': '',
    'CBM': '',
    'Load_Qty': '',
    'Quantity': totalQty,
    'Total_Price': totalAmount.toFixed(2)
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
