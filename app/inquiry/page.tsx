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
    const res = await fetch('/api/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart })
    })
    const { code } = await res.json()
    const url = `${window.location.origin}/q/${code}`
    const msg = `Hi! I'm interested in these products. Please check my inquiry list and quote me your best price: ${url}`
    window.location.href = `https://wa.me/8615373932172?text=${encodeURIComponent(msg)}`
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-blue-600">←</button>
          <h1 className="text-2xl font-bold">Inquiry List</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        {cart.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Your inquiry list is empty</div>
        ) : (
          <>
            {cart.map((item, i) => (
              <div key={i} className="bg-white rounded-lg p-4 mb-3 flex gap-4">
                <img src={item.image || '/placeholder.png'} className="w-20 h-20 object-cover rounded" />
                <div className="flex-1">
                  <p className="font-semibold">{item.item_no}</p>
                  <p className="text-sm text-gray-600">Color: {item.color}</p>
                  {item.options.length > 0 && <p className="text-sm text-gray-600">Options: {item.options.join(', ')}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQty(i, -1)} className="w-8 h-8 border rounded">-</button>
                    <span className="w-12 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(i, 1)} className="w-8 h-8 border rounded">+</button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">${(item.price * item.qty).toFixed(2)}</p>
                  <button onClick={() => removeItem(i)} className="text-red-500 text-sm mt-2">🗑️ Remove</button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-2xl mx-auto p-4">
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">Total Qty: {totalQty}</span>
              <span className="text-2xl font-bold">${total.toFixed(2)}</span>
            </div>
            <button onClick={sendToWhatsApp} disabled={loading} className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold text-lg disabled:bg-gray-400">
              {loading ? 'Generating...' : '📱 Send to WhatsApp'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
