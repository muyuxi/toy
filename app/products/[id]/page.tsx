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
  const [showOptions, setShowOptions] = useState(false)
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
  const opts = product.options ? product.options.split('|').filter(Boolean).map((o: string) => {
    const [name, price] = o.split(':')
    return { name: name.trim(), price: parseFloat(price) || 0 }
  }) : []

  const price = color ? parseFloat(product.base_price) + opts.filter((o: any) => options.includes(o.name)).reduce((sum: number, o: any) => sum + o.price, 0) : 0

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
        <button onClick={() => router.back()} className="mb-4 text-primary font-semibold flex items-center gap-1 cursor-pointer hover:text-primary-dark transition-colors">
          ← Back
        </button>

        {/* 图片轮播 */}
        <div className="relative mb-6 bg-card rounded-lg overflow-hidden border border-border-light">
          <img src={images[currentImg] || '/placeholder.svg'} className="w-full h-80 object-cover" />
          {images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {images.map((img, i) => (
                <img key={i} src={img} onClick={() => setCurrentImg(i)} className={`w-16 h-16 object-cover rounded cursor-pointer transition-all border-2 ${i === currentImg ? 'border-primary' : 'border-border-light opacity-60 hover:opacity-100'}`} />
              ))}
            </div>
          )}
        </div>

        <h1 className="text-2xl font-heading font-bold mb-2 text-text-primary">{product.item_no}</h1>
        <p className="text-text-muted mb-4">{product.category}</p>

        {/* 价格显示 */}
        <div className="bg-gradient-to-r from-price to-red-400 rounded-lg p-5 mb-4">
          <p className="text-white text-sm mb-1 font-medium">Price</p>
          <h3 className="text-4xl font-heading font-bold text-white">¥{color ? price.toFixed(2) : product.base_price.toFixed(2)}</h3>
          {!color && <p className="text-white text-xs mt-1 opacity-90">Base price (select color for total)</p>}
        </div>

        {/* 颜色选择 */}
        <div className="bg-card rounded-lg p-4 mb-4 border border-border-light">
          <h3 className="font-heading font-semibold mb-3 text-text-primary">Select Color *</h3>
          <div className="flex gap-2 flex-wrap">
            {colors.map((c: string) => (
              <button key={c} onClick={() => setColor(c)} className={`px-5 py-2 rounded-full font-medium transition-all cursor-pointer ${color === c ? 'bg-primary text-white' : 'bg-background text-text-secondary border border-border hover:border-primary'}`}>{c}</button>
            ))}
          </div>
        </div>

        {!color && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-center text-yellow-800 text-sm">⚠️ Please select a color to continue</div>}

        {color && (
          <>
            {/* 规格参数 */}
            {(product.features || product.gw || product.dimensions) && (
              <div className="bg-card rounded-lg p-4 mb-4 border border-border-light">
                <h3 className="font-heading font-bold mb-3 text-text-primary">Specifications</h3>
                <div className="space-y-3 text-sm">
                  {product.features && <div><p className="font-bold text-text-primary mb-1">Features:</p><p className="text-text-primary whitespace-pre-wrap">{product.features}</p></div>}
                  {product.gw && <div><p className="font-bold text-text-primary mb-1">Gross Weight:</p><p className="text-text-primary whitespace-pre-wrap">{product.gw}</p></div>}
                  {product.nw && <div><p className="font-bold text-text-primary mb-1">Net Weight:</p><p className="text-text-primary whitespace-pre-wrap">{product.nw}</p></div>}
                  {product.dimensions && <div><p className="font-bold text-text-primary mb-1">Dimensions:</p><p className="text-text-primary whitespace-pre-wrap">{product.dimensions}</p></div>}
                  {product.cbm && <div><p className="font-bold text-text-primary mb-1">Volume:</p><p className="text-text-primary whitespace-pre-wrap">{product.cbm}</p></div>}
                  {product.load_qty && <div><p className="font-bold text-text-primary mb-1">Loading Qty:</p><p className="text-text-primary whitespace-pre-wrap">{product.load_qty}</p></div>}
                </div>
              </div>
            )}

            {/* 配置选项 */}
            {opts.length > 0 && (
              <div className="bg-card rounded-lg mb-4 border border-border-light">
                <button onClick={() => setShowOptions(!showOptions)} className="w-full p-4 flex justify-between items-center hover:bg-background transition-colors">
                  <h3 className="font-heading font-semibold text-text-primary">Add Configurations <span className="text-sm text-text-muted font-normal">(Optional)</span></h3>
                  <span className="text-primary text-xl">{showOptions ? '−' : '+'}</span>
                </button>
                {showOptions && (
                  <div className="px-4 pb-4">
                    {opts.map((o: any) => (
                      <label key={o.name} className="flex items-center gap-3 mb-2 cursor-pointer p-2 rounded hover:bg-background transition-all">
                        <input type="checkbox" onChange={(e) => setOptions(e.target.checked ? [...options, o.name] : options.filter(x => x !== o.name))} className="w-4 h-4 text-primary cursor-pointer" />
                        <span className="flex-1 text-text-primary">{o.name}</span>
                        <span className="text-primary font-semibold">+¥{o.price.toFixed(2)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 数量选择 */}
            <div className="bg-card rounded-lg p-4 mb-4 border border-border-light">
              <h3 className="font-heading font-semibold mb-3 text-text-primary">Quantity</h3>
              <div className="flex items-center gap-4">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 bg-background hover:bg-primary hover:text-white rounded-lg text-xl font-bold transition-all border border-border hover:border-primary cursor-pointer">-</button>
                <span className="text-3xl font-heading font-bold text-primary">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-12 h-12 bg-background hover:bg-primary hover:text-white rounded-lg text-xl font-bold transition-all border border-border hover:border-primary cursor-pointer">+</button>
              </div>
            </div>

            {/* 添加到询价单按钮 */}
            <button onClick={addToCart} className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-4 rounded-lg font-heading font-bold text-lg hover:shadow-lg transition-all cursor-pointer">
              🛒 Add to Inquiry List
            </button>
          </>
        )}
      </div>
    </div>
  )
}
