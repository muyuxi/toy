import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { productsStore } from '@/lib/store'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const buffer = Buffer.from(await file.arrayBuffer())

  const workbook = XLSX.read(buffer)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(sheet) // 直接读取，表头就是字段名

  let imported = 0

  for (const row of data as any[]) {
    const itemNo = row['Item_No']?.toString().replace(/\n/g, ' ').trim()
    if (!itemNo) continue

    const colors = row['Colors']?.toString().replace(/\n/g, ',').trim() || ''
    const basePrice = parseFloat(row['Base_Price']?.toString() || '0')

    // 解析配置选项（格式：Remote:20 LED-lights:12）
    const optionsStr = row['Options']?.toString().trim() || ''
    const options = optionsStr ? optionsStr.split(' ').filter(Boolean) : []

    const existing = await productsStore.getByItemNo(itemNo)
    if (existing) {
      // 更新已有产品（保留图片）
      await productsStore.delete(itemNo)
    }

    await productsStore.create({
      item_no: itemNo,
      category: row['Category']?.toString().trim() || '',
      base_price: basePrice,
      colors,
      options: options.join('|'),
      features: row['Features']?.toString().replace(/\n/g, ' ').trim() || '',
      gw: row['GW']?.toString().trim() || '',
      nw: row['NW']?.toString().trim() || '',
      dimensions: row['Dimensions']?.toString().replace(/\n/g, ' ').trim() || '',
      cbm: row['CBM']?.toString().trim() || '',
      load_qty: row['Load_Qty']?.toString().trim() || ''
    })

    imported++
  }

  return NextResponse.json({ success: true, imported })
}
