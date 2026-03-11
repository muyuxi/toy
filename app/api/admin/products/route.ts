import { NextResponse } from 'next/server'
import { productsStore } from '@/lib/store'

export async function GET() {
  const products = productsStore.getAll()
  const productsWithCount = products.map(p => ({
    ...p,
    image_count: p.images.length
  }))
  return NextResponse.json(productsWithCount)
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const itemNo = searchParams.get('item_no')
  if (itemNo) {
    productsStore.delete(itemNo)
  }
  return NextResponse.json({ success: true })
}
