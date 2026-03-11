import { NextResponse } from 'next/server'
import { inquiriesStore } from '@/lib/store'

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(req: Request) {
  const { items } = await req.json()
  const code = generateCode()

  inquiriesStore.create(code, JSON.stringify(items))

  return NextResponse.json({ code })
}
