import { NextResponse } from 'next/server'
import { inquiriesStore, productsStore } from '@/lib/store'
import ExcelJS from 'exceljs'
import fs from 'fs'
import path from 'path'

export async function GET(req: Request, { params }: { params: { code: string } }) {
  const inquiry = await inquiriesStore.getByCode(params.code)

  if (!inquiry) return new NextResponse('Not found', { status: 404 })

  const items = JSON.parse(inquiry.data)

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Inquiry')

  // 设置列宽
  worksheet.columns = [
    { header: 'Image', key: 'image', width: 15 },
    { header: 'Item_No', key: 'item_no', width: 15 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Base_Price', key: 'base_price', width: 12 },
    { header: 'Colors', key: 'colors', width: 15 },
    { header: 'Options', key: 'options', width: 20 },
    { header: 'Features', key: 'features', width: 25 },
    { header: 'GW', key: 'gw', width: 10 },
    { header: 'NW', key: 'nw', width: 10 },
    { header: 'Dimensions', key: 'dimensions', width: 15 },
    { header: 'CBM', key: 'cbm', width: 10 },
    { header: 'Load_Qty', key: 'load_qty', width: 12 },
    { header: 'Quantity', key: 'quantity', width: 10 },
    { header: 'Total_Price', key: 'total_price', width: 12 }
  ]

  // 添加数据行
  let rowIndex = 2
  for (const item of items) {
    const product = await productsStore.getByItemNo(item.item_no)

    worksheet.addRow({
      item_no: item.item_no,
      category: product?.category || '',
      base_price: product?.base_price || '',
      colors: item.color,
      options: item.options.join(', '),
      features: product?.features || '',
      gw: product?.gw || '',
      nw: product?.nw || '',
      dimensions: product?.dimensions || '',
      cbm: product?.cbm || '',
      load_qty: product?.load_qty || '',
      quantity: item.qty,
      total_price: (item.price * item.qty).toFixed(2)
    })

    // 设置行高以适应图片
    worksheet.getRow(rowIndex).height = 80

    // 添加图片
    const imagePath = product?.images?.[0]?.image_path
    if (imagePath) {
      try {
        const fullPath = path.join(process.cwd(), 'public', imagePath)
        if (fs.existsSync(fullPath)) {
          const imageBuffer = fs.readFileSync(fullPath)
          const imageId = workbook.addImage({
            buffer: imageBuffer as any,
            extension: path.extname(imagePath).slice(1) as any
          })
          worksheet.addImage(imageId, {
            tl: { col: 0, row: rowIndex - 1 },
            ext: { width: 100, height: 100 }
          })
        }
      } catch (error) {
        console.error('Error adding image:', error)
      }
    }

    rowIndex++
  }

  // 添加总计行
  const totalQty = items.reduce((sum: number, item: any) => sum + item.qty, 0)
  const totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.qty, 0)

  worksheet.addRow({
    item_no: 'TOTAL',
    quantity: totalQty,
    total_price: totalAmount.toFixed(2)
  })

  // 导出为buffer
  const buffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="inquiry-${params.code}.xlsx"`
    }
  })
}
