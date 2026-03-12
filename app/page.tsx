'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [banners, setBanners] = useState<any[]>([])
  const [currentBanner, setCurrentBanner] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(data => {
      setAllProducts(data)
      setProducts(data.slice(0, 20))

      const cats = [...new Set(data.map((p: any) => p.category).filter(Boolean))] as string[]
      setCategories(cats)

      const cols = [...new Set(data.flatMap((p: any) => p.colors?.split(',').map((c: string) => c.trim()) || []))] as string[]
      setColors(cols)
    })

    fetch('/api/banners').then(r => r.json()).then(setBanners)

    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartCount(cart.length)

    window.addEventListener('storage', () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartCount(cart.length)
    })
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [banners.length])

  useEffect(() => {
    let filtered = allProducts
    if (selectedCategory) filtered = filtered.filter(p => p.category === selectedCategory)
    if (selectedColor) filtered = filtered.filter(p => p.colors?.includes(selectedColor))
    if (searchQuery) filtered = filtered.filter(p => p.item_no?.toLowerCase().includes(searchQuery.toLowerCase()))
    setProducts(filtered.slice(0, page * 20))
  }, [selectedCategory, selectedColor, searchQuery, page, allProducts])

  const loadMore = () => {
    if (loading) return
    setLoading(true)
    setTimeout(() => {
      setPage(p => p + 1)
      setLoading(false)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="bg-card border-b border-border-light sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-heading font-semibold text-text-primary">Kids Ride-On Toys</h1>
            <Link href="/inquiry" className="relative cursor-pointer">
              <span className="text-2xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-price text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
          <input
            type="text"
            placeholder="Search by Item No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </header>

      {/* Banner轮播 */}
      {banners.length > 0 && (
        <div className="relative h-72 md:h-96 overflow-hidden">
          <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
            {banners.map((b, i) => (
              <Link key={i} href={`/products/${b.item_no}`} className="min-w-full cursor-pointer">
                <img src={b.image} alt="" className="w-full h-72 md:h-96 object-cover" />
              </Link>
            ))}
          </div>
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, i) => (
                <button key={i} onClick={() => setCurrentBanner(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentBanner ? 'bg-white w-6' : 'bg-white/50'}`} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 筛选标签 */}
      <div className="bg-card border-b border-border-light sticky top-[88px] z-10">
        <div className="px-4 py-3 border-b border-border-light">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button onClick={() => setSelectedCategory('')} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${!selectedCategory ? 'bg-primary text-white' : 'bg-background text-text-secondary hover:bg-border-light'}`}>All</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-background text-text-secondary hover:bg-border-light'}`}>{cat}</button>
            ))}
          </div>
        </div>
        <div className="px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button onClick={() => setSelectedColor('')} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${!selectedColor ? 'bg-text-secondary text-white' : 'bg-background text-text-secondary hover:bg-border-light'}`}>All Colors</button>
            {colors.map(col => (
              <button key={col} onClick={() => setSelectedColor(col)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${selectedColor === col ? 'bg-text-secondary text-white' : 'bg-background text-text-secondary hover:bg-border-light'}`}>{col}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 产品网格 */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <Link key={p.id} href={`/products/${p.item_no}`} className="bg-card rounded-lg border border-border-light hover:border-primary hover:shadow-md transition-all overflow-hidden group cursor-pointer">
              <div className="relative overflow-hidden">
                <img src={p.image || '/placeholder.svg'} alt={p.item_no} className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2 bg-price text-white text-sm font-bold px-2 py-1 rounded">
                  ${p.base_price}
                </div>
              </div>
              <div className="p-3">
                <p className="font-heading font-semibold text-text-primary truncate">{p.item_no}</p>
                <p className="text-sm text-text-muted">{p.category}</p>
              </div>
            </Link>
          ))}
        </div>
        {products.length < allProducts.length && (
          <button onClick={loadMore} disabled={loading} className="w-full mt-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-semibold hover:shadow-lg transition-all cursor-pointer disabled:opacity-50">
            {loading ? 'Loading...' : 'Load More'}
          </button>
        )}
      </main>

      <Link href="/inquiry" className="fixed bottom-6 right-6 bg-gradient-to-br from-primary to-primary-dark text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-30 hover:shadow-xl transition-all cursor-pointer">
        🛒
        {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-price text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">{cartCount}</span>}
      </Link>
    </div>
  )
}
