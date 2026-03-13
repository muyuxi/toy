import { NextResponse } from 'next/server';
import { faqsStore } from '@/lib/store';

export async function GET() {
  const faqs = faqsStore.getAll();
  return NextResponse.json(faqs);
}
