import { NextResponse } from 'next/server'
import { productsStore } from '@/lib/store'
import { unlink } from 'fs/promises'
import path from 'path'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const [itemNo, imagePath] = params.id.split('::')

  if (itemNo && imagePath) {
    try {
      await unlink(path.join(process.cwd(), 'public', imagePath))
    } catch (e) {}

    await productsStore.deleteImage(itemNo, imagePath)
  }

  return NextResponse.json({ success: true })
}
