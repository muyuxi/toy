'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FAQPage() {
  const [faqs, setFaqs] = useState<any[]>([])
  const [openId, setOpenId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/faqs').then(r => r.json()).then(setFaqs)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-primary to-primary-dark text-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-white text-2xl cursor-pointer hover:opacity-80 transition-opacity">←</button>
          <h1 className="text-xl font-heading font-bold">Frequently Asked Questions</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        {faqs.length === 0 ? (
          <p className="text-center text-text-muted py-20">暂无常见问题</p>
        ) : (
          <div className="space-y-3">
            {faqs.map(faq => (
              <div key={faq.id} className="bg-card rounded-lg border border-border-light overflow-hidden">
                <button onClick={() => setOpenId(openId === faq.id ? null : faq.id)} className="w-full p-4 text-left flex justify-between items-center hover:bg-background transition-colors">
                  <span className="font-semibold text-text-primary">{faq.question}</span>
                  <span className="text-primary text-xl">{openId === faq.id ? '−' : '+'}</span>
                </button>
                {openId === faq.id && (
                  <div className="px-4 pb-4 text-text-secondary whitespace-pre-wrap">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
