import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { productsStore } from '@/lib/store'

export async function POST(req: Request) {
  const formData = await req.formData()
  const itemNo = formData.get('item_no') as string
  const images = formData.getAll('images') as File[]

  await mkdir(path.join(process.cwd(), 'public', 'uploads'), { recursive: true })

  const product = await productsStore.getByItemNo(itemNo)
  const currentCount = product?.images.length || 0

  for (let i = 0; i < images.length; i++) {
    const file = images[i]
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filename = `${itemNo}_${Date.now()}_${i}.jpg`
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename)
    await writeFile(filepath, buffer)

    await productsStore.addImage(itemNo, {
      image_path: `/uploads/${filename}`,
      is_main: currentCount === 0 && i === 0 ? 1 : 0,
      sort_order: currentCount + i
    })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const itemNo = searchParams.get('item_no')
  const imagePath = searchParams.get('image_path')

  if (itemNo && imagePath) {
    await productsStore.deleteImage(itemNo, imagePath)
  }
  return NextResponse.json({ success: true })
}
