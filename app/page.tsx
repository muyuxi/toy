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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-3">Toy Catalog</h1>
          <input
            type="text"
            placeholder="Search by Item No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </header>

      {banners.length > 0 && (
        <div className="relative h-64 md:h-96 overflow-x-auto scrollbar-hide flex snap-x snap-mandatory">
          {banners.map((b, i) => (
            <Link key={i} href={`/products/${b.item_no}`} className="min-w-full snap-center">
              <img src={b.image} alt="" className="w-full h-64 md:h-96 object-cover" />
            </Link>
          ))}
        </div>
      )}

      <div className="bg-white border-b px-4 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 mb-2">
          <span className="text-sm font-semibold whitespace-nowrap py-2">Category:</span>
          <button onClick={() => setSelectedCategory('')} className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>All</button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{cat}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <span className="text-sm font-semibold whitespace-nowrap py-2">Color:</span>
          <button onClick={() => setSelectedColor('')} className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${!selectedColor ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>All</button>
          {colors.map(col => (
            <button key={col} onClick={() => setSelectedColor(col)} className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${selectedColor === col ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{col}</button>
          ))}
        </div>
      </div>

      <div className="flex">
        <aside className="w-64 bg-white p-4 sticky top-20 h-screen overflow-y-auto hidden lg:block">
          <div className="mb-6">
            <h3 className="font-bold mb-3">By Category</h3>
            <button onClick={() => setSelectedCategory('')} className={`block w-full text-left px-3 py-2 rounded mb-1 ${!selectedCategory ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>All</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`block w-full text-left px-3 py-2 rounded mb-1 ${selectedCategory === cat ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>{cat}</button>
            ))}
          </div>
          <div>
            <h3 className="font-bold mb-3">By Color</h3>
            <button onClick={() => setSelectedColor('')} className={`block w-full text-left px-3 py-2 rounded mb-1 ${!selectedColor ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>All</button>
            {colors.map(col => (
              <button key={col} onClick={() => setSelectedColor(col)} className={`block w-full text-left px-3 py-2 rounded mb-1 ${selectedColor === col ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>{col}</button>
            ))}
          </div>
        </aside>

        <main className="flex-1 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => (
              <Link key={p.id} href={`/products/${p.item_no}`} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <img src={p.image || '/placeholder.png'} alt={p.item_no} className="w-full h-48 object-cover rounded-t-lg" />
                <div className="p-3">
                  <p className="font-semibold">{p.item_no}</p>
                  <p className="text-sm text-gray-600">{p.category}</p>
                </div>
              </Link>
            ))}
          </div>
          {products.length < allProducts.length && (
            <button onClick={loadMore} disabled={loading} className="w-full mt-6 py-3 bg-gray-200 rounded-lg">
              {loading ? 'Loading...' : 'Load More'}
            </button>
          )}
        </main>
      </div>

      <Link href="/inquiry" className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-30">
        🛒
        {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>}
      </Link>
    </div>
  )
}
