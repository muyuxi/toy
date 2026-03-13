import { NextResponse } from 'next/server'
import { productsStore } from '@/lib/store'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const product = await productsStore.getByItemNo(params.id)
  const images = product?.images.sort((a, b) => a.sort_order - b.sort_order) || []
  return NextResponse.json(images)
}
