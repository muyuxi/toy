import { NextResponse } from 'next/server'
import { productsStore } from '@/lib/store'

// 禁用缓存，确保每次都读取最新数据
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const products = await productsStore.getAll()

  // 添加主图片字段
  const productsWithImage = products.map(p => ({
    ...p,
    image: p.images.find((img: any) => img.is_main === 1)?.image_path || p.images[0]?.image_path || null
  }))

  return NextResponse.json(productsWithImage)
}
