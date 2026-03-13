import { NextResponse } from 'next/server';
import { faqsStore } from '@/lib/store';

export async function POST(req: Request) {
  const { question, answer } = await req.json();
  const faq = faqsStore.create(question, answer);
  return NextResponse.json(faq);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get('id') || '0');
  faqsStore.delete(id);
  return NextResponse.json({ success: true });
}
