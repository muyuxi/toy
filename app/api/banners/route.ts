import { NextResponse } from 'next/server'
import { productsStore } from '@/lib/store'

// 禁用缓存
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const products = await productsStore.getAll()
  const banners = products
    .filter(p => p.is_banner && p.images.length > 0)
    .map(p => ({
      item_no: p.item_no,
      image: p.images.find(img => img.is_main === 1)?.image_path || p.images[0]?.image_path
    }))
  return NextResponse.json(banners)
}
