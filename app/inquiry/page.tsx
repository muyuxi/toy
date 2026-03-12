'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InquiryPage() {
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'))
  }, [])

  const updateQty = (index: number, delta: number) => {
    const newCart = [...cart]
    newCart[index].qty = Math.max(1, newCart[index].qty + delta)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const removeItem = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('storage'))
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0)

  const sendToWhatsApp = async () => {
    if (cart.length === 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart })
      })
      if (!res.ok) {
        throw new Error('Failed to create inquiry')
      }
      const { code } = await res.json()
      const msg = `Hi! I'm interested in these products. Please check my inquiry list and quote me your best price: ${code}`
      window.location.href = `https://wa.me/8615373932172?text=${encodeURIComponent(msg)}`
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to send inquiry. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* 顶部导航 */}
      <header className="bg-gradient-to-r from-primary to-primary-dark text-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-white text-2xl cursor-pointer hover:opacity-80 transition-opacity">←</button>
          <h1 className="text-xl font-heading font-bold">Inquiry List</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        {cart.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-text-muted text-lg">Your inquiry list is empty</p>
            <button onClick={() => router.push('/')} className="mt-6 px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-semibold hover:shadow-lg transition-all cursor-pointer">
              Browse Products
            </button>
          </div>
        ) : (
          <>
            {cart.map((item, i) => (
              <div key={i} className="bg-card rounded-lg p-4 mb-3 border border-border-light flex gap-4">
                <img src={item.image || '/placeholder.svg'} className="w-24 h-24 object-cover rounded border border-border-light" />
                <div className="flex-1">
                  <p className="font-heading font-semibold text-text-primary">{item.item_no}</p>
                  <p className="text-sm text-text-secondary">Color: {item.color}</p>
                  {item.options.length > 0 && <p className="text-xs text-text-muted">+{item.options.join(', ')}</p>}
                  <div className="flex items-center gap-3 mt-3">
                    <button onClick={() => updateQty(i, -1)} className="w-8 h-8 bg-background rounded font-semibold hover:bg-primary hover:text-white transition-all border border-border cursor-pointer">-</button>
                    <span className="w-10 text-center font-semibold text-text-primary">{item.qty}</span>
                    <button onClick={() => updateQty(i, 1)} className="w-8 h-8 bg-background rounded font-semibold hover:bg-primary hover:text-white transition-all border border-border cursor-pointer">+</button>
                  </div>
                </div>
                <div className="text-right flex flex-col justify-between">
                  <p className="font-heading font-bold text-lg text-price">${(item.price * item.qty).toFixed(2)}</p>
                  <button onClick={() => removeItem(i)} className="text-red-500 text-sm cursor-pointer hover:text-red-600 transition-colors">🗑️</button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border-light shadow-lg">
          <div className="max-w-2xl mx-auto p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-text-secondary">Total Items: {totalQty}</p>
                <p className="text-3xl font-heading font-bold text-price">${total.toFixed(2)}</p>
              </div>
              <button onClick={sendToWhatsApp} disabled={loading} className="px-8 py-3 bg-success text-white rounded-lg font-heading font-bold hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer">
                {loading ? '⏳ Generating...' : '💬 Send to WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
