import { NextResponse } from 'next/server'
import { productsStore } from '@/lib/store'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const product = await productsStore.getByItemNo(params.id)
  if (!product) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    ...product,
    images: product.images.sort((a, b) => a.sort_order - b.sort_order).map(img => img.image_path)
  })
}
