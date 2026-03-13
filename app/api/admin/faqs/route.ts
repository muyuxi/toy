import { NextResponse } from 'next/server';
import { faqsStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { question, answer } = await req.json();
    const faq = faqsStore.create(question, answer);
    return NextResponse.json(faq);
  } catch (error: any) {
    console.error('FAQ创建失败:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get('id') || '0');
    faqsStore.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('FAQ删除失败:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
