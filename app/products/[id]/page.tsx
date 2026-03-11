'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null)
  const [images, setImages] = useState<string[]>([])
  const [currentImg, setCurrentImg] = useState(0)
  const [color, setColor] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [qty, setQty] = useState(1)
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/products/${params.id}`).then(r => r.json()).then(data => {
      setProduct(data)
      setImages(data.images || [])
    })
  }, [params.id])

  if (!product) return <div className="p-8">Loading...</div>

  const colors = product.colors?.split(',').map((c: string) => c.trim()) || []
  const opts = product.options ? product.options.split('\n').filter(Boolean).map((o: string) => {
    const [name, price] = o.split(':')
    return { name: name.trim(), price: parseFloat(price) }
  }) : []

  const price = color ? product.base_price + opts.filter((o: any) => options.includes(o.name)).reduce((sum: number, o: any) => sum + o.price, 0) : 0

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cart.push({ item_no: product.item_no, color, options, qty, price, image: images[0] })
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('storage'))
    router.push('/inquiry')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4">
        <button onClick={() => router.back()} className="mb-4 text-blue-600">← Back</button>

        <div className="relative mb-4">
          <img src={images[currentImg] || '/placeholder.png'} className="w-full h-80 object-cover rounded-lg" />
          {images.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {images.map((img, i) => (
                <img key={i} src={img} onClick={() => setCurrentImg(i)} className={`w-16 h-16 object-cover rounded cursor-pointer ${i === currentImg ? 'ring-2 ring-blue-600' : ''}`} />
              ))}
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-4">Product No. {product.item_no}</h1>

        <div className="bg-white rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-2">Color *</h3>
          <div className="flex gap-2 flex-wrap">
            {colors.map((c: string) => (
              <button key={c} onClick={() => setColor(c)} className={`px-4 py-2 border rounded ${color === c ? 'bg-blue-600 text-white' : 'bg-white'}`}>{c}</button>
            ))}
          </div>
        </div>

        {!color && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-center">Select a color to view price</div>}

        {color && (
          <>
            <div className="bg-white rounded-lg p-4 mb-4">
              <h3 className="text-2xl font-bold text-blue-600">${price.toFixed(2)}</h3>
            </div>

            {opts.length > 0 && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-3">Configurations</h3>
                {opts.map((o: any) => (
                  <label key={o.name} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input type="checkbox" onChange={(e) => setOptions(e.target.checked ? [...options, o.name] : options.filter(x => x !== o.name))} className="w-4 h-4" />
                    <span>{o.name} <span className="text-green-600">(+${o.price.toFixed(2)})</span></span>
                  </label>
                ))}
              </div>
            )}

            {(product.features || product.gw || product.dimensions) && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-3">Specifications</h3>
                {product.features && <p className="mb-2"><span className="font-medium">Features:</span> {product.features}</p>}
                {product.gw && <p className="mb-2"><span className="font-medium">Gross Weight:</span> {product.gw}</p>}
                {product.nw && <p className="mb-2"><span className="font-medium">Net Weight:</span> {product.nw}</p>}
                {product.dimensions && <p className="mb-2"><span className="font-medium">Dimensions:</span> {product.dimensions}</p>}
                {product.cbm && <p className="mb-2"><span className="font-medium">Volume:</span> {product.cbm}</p>}
                {product.load_qty && <p className="mb-2"><span className="font-medium">Loading Qty:</span> {product.load_qty}</p>}
              </div>
            )}

            <div className="bg-white rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 border rounded-lg text-xl">-</button>
                <span className="text-2xl font-semibold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-12 h-12 border rounded-lg text-xl">+</button>
              </div>
            </div>

            <button onClick={addToCart} className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg">Add to Inquiry List</button>
          </>
        )}
      </div>
    </div>
  )
}
