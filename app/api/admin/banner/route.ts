import { NextResponse } from 'next/server'
import { productsStore } from '@/lib/store'

export async function POST(req: Request) {
  const { item_no, is_banner } = await req.json()
  await productsStore.updateBanner(item_no, is_banner)
  return NextResponse.json({ success: true })
}
