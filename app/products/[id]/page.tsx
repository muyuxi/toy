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
      // 自动选中第一个颜色
      const colors = data.colors?.split(',').map((c: string) => c.trim()) || []
      if (colors.length > 0) {
        setColor(colors[0])
      }
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
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4">
        <button onClick={() => router.back()} className="mb-4 text-primary font-bold flex items-center gap-1 cursor-pointer hover:text-primary/80 transition-colors duration-200">
          ← Back
        </button>

        {/* 图片轮播 */}
        <div className="relative mb-6 bg-white rounded-clay overflow-hidden shadow-clay border-3 border-white">
          <img src={images[currentImg] || '/placeholder.svg'} className="w-full h-80 object-cover" />
          {images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {images.map((img, i) => (
                <img key={i} src={img} onClick={() => setCurrentImg(i)} className={`w-16 h-16 object-cover rounded-clay cursor-pointer transition-all duration-200 border-3 ${i === currentImg ? 'border-primary shadow-clay-sm' : 'border-gray-200 opacity-60 hover:opacity-100'}`} />
              ))}
            </div>
          )}
        </div>

        <h1 className="text-3xl font-heading font-bold mb-2 text-text">{product.item_no}</h1>
        <p className="text-text/60 mb-4 font-medium">{product.category}</p>

        {/* 价格显示 - 始终显示基础价格 */}
        <div className="bg-accent rounded-clay p-6 mb-4 shadow-clay border-3 border-accent/80">
          <p className="text-white text-sm mb-1 font-bold">Price</p>
          <h3 className="text-5xl font-heading font-bold text-white">${color ? price.toFixed(2) : product.base_price.toFixed(2)}</h3>
          {!color && <p className="text-white text-xs mt-1 opacity-90 font-medium">Base price (select color for total)</p>}
        </div>

        {/* 颜色选择 */}
        <div className="bg-white rounded-clay p-5 mb-4 shadow-clay border-3 border-white">
          <h3 className="font-heading font-bold mb-3 text-text text-lg">Select Color *</h3>
          <div className="flex gap-2 flex-wrap">
            {colors.map((c: string) => (
              <button key={c} onClick={() => setColor(c)} className={`px-6 py-3 rounded-clay font-bold transition-all duration-200 cursor-pointer border-3 ${color === c ? 'bg-primary text-white shadow-clay border-primary/80' : 'bg-white text-text shadow-clay-sm border-gray-200 hover:border-primary/30'}`}>{c}</button>
            ))}
          </div>
        </div>

        {!color && <div className="bg-yellow-100 border-3 border-yellow-400 rounded-clay p-4 mb-4 text-center text-yellow-800 font-bold shadow-clay-sm">⚠️ Please select a color to continue</div>}

        {color && (
          <>
            {/* 配置选项 */}
            {opts.length > 0 && (
              <div className="bg-white rounded-clay p-5 mb-4 shadow-clay border-3 border-white">
                <h3 className="font-heading font-bold mb-3 text-text text-lg">Add Configurations</h3>
                {opts.map((o: any) => (
                  <label key={o.name} className="flex items-center gap-3 mb-3 cursor-pointer p-3 rounded-clay hover:bg-background transition-all duration-200 border-2 border-transparent hover:border-primary/20">
                    <input type="checkbox" onChange={(e) => setOptions(e.target.checked ? [...options, o.name] : options.filter(x => x !== o.name))} className="w-5 h-5 text-primary cursor-pointer" />
                    <span className="flex-1 font-bold text-text">{o.name}</span>
                    <span className="text-accent font-bold">+${o.price.toFixed(2)}</span>
                  </label>
                ))}
              </div>
            )}

            {/* 规格参数 */}
            {(product.features || product.gw || product.dimensions) && (
              <div className="bg-white rounded-clay p-5 mb-4 shadow-clay border-3 border-white">
                <h3 className="font-heading font-bold mb-3 text-text text-lg">Specifications</h3>
                <div className="space-y-2 text-sm">
                  {product.features && <p><span className="font-bold text-text/70">Features:</span> <span className="text-text">{product.features}</span></p>}
                  {product.gw && <p><span className="font-bold text-text/70">Gross Weight:</span> <span className="text-text">{product.gw}</span></p>}
                  {product.nw && <p><span className="font-bold text-text/70">Net Weight:</span> <span className="text-text">{product.nw}</span></p>}
                  {product.dimensions && <p><span className="font-bold text-text/70">Dimensions:</span> <span className="text-text">{product.dimensions}</span></p>}
                  {product.cbm && <p><span className="font-bold text-text/70">Volume:</span> <span className="text-text">{product.cbm}</span></p>}
                  {product.load_qty && <p><span className="font-bold text-text/70">Loading Qty:</span> <span className="text-text">{product.load_qty}</span></p>}
                </div>
              </div>
            )}

            {/* 数量选择 */}
            <div className="bg-white rounded-clay p-5 mb-4 shadow-clay border-3 border-white">
              <h3 className="font-heading font-bold mb-3 text-text text-lg">Quantity</h3>
              <div className="flex items-center gap-4">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-14 h-14 bg-background hover:bg-primary hover:text-white rounded-clay text-2xl font-bold transition-all duration-200 shadow-clay-sm border-3 border-gray-200 hover:border-primary cursor-pointer">-</button>
                <span className="text-4xl font-heading font-bold text-primary">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-14 h-14 bg-background hover:bg-primary hover:text-white rounded-clay text-2xl font-bold transition-all duration-200 shadow-clay-sm border-3 border-gray-200 hover:border-primary cursor-pointer">+</button>
              </div>
            </div>

            {/* 添加到询价单按钮 */}
            <button onClick={addToCart} className="w-full bg-primary text-white py-5 rounded-clay font-heading font-bold text-xl shadow-clay hover:shadow-clay-sm transition-all duration-200 border-3 border-primary/80 cursor-pointer">
              🛒 Add to Inquiry List
            </button>
          </>
        )}
      </div>
    </div>
  )
}
