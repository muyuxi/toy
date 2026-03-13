import { NextResponse } from 'next/server';
import { faqsStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const faqs = await faqsStore.getAll();
  return NextResponse.json(faqs);
}
