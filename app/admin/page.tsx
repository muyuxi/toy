'use client'
import { useEffect, useState } from 'react'

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([])
  const [modal, setModal] = useState<string | null>(null)

  const loadProducts = () => {
    fetch('/api/admin/products').then(r => r.json()).then(setProducts)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const deleteProduct = async (itemNo: string) => {
    if (!confirm(`确定删除产品 ${itemNo}?`)) return
    await fetch(`/api/admin/products?item_no=${itemNo}`, { method: 'DELETE' })
    loadProducts()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Product Management</h1>
      <div className="bg-white rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="border-b">
              <th className="p-3 text-left">Item No</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Colors</th>
              <th className="p-3 text-left">Images</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-semibold">{p.item_no}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">${p.base_price}</td>
                <td className="p-3 text-sm">{p.colors}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm ${p.image_count > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {p.image_count || 0} images
                  </span>
                </td>
                <td className="p-3">
                  <button onClick={() => setModal(p.item_no)} className="text-blue-600 hover:underline mr-3">Manage Images</button>
                  <button onClick={() => deleteProduct(p.item_no)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && <ImageModal itemNo={modal} onClose={() => { setModal(null); loadProducts(); }} />}
    </div>
  )
}

function ImageModal({ itemNo, onClose }: { itemNo: string, onClose: () => void }) {
  const [images, setImages] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/images/${itemNo}`).then(r => r.json()).then(setImages)
  }, [itemNo])

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    const formData = new FormData()
    formData.append('item_no', itemNo)
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i])
    }

    await fetch('/api/admin/images', { method: 'POST', body: formData })
    const newImages = await fetch(`/api/admin/images/${itemNo}`).then(r => r.json())
    setImages(newImages)
    setUploading(false)
  }

  const deleteImage = async (imagePath: string) => {
    const deleteId = `${itemNo}::${imagePath}`
    await fetch(`/api/admin/images/delete/${encodeURIComponent(deleteId)}`, { method: 'DELETE' })
    setImages(images.filter(img => img.image_path !== imagePath))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Manage Images - {itemNo}</h2>

        <div className="mb-4">
          <label className="block mb-2 font-semibold">Upload Images</label>
          <input type="file" multiple accept="image/*" onChange={upload} disabled={uploading} className="w-full border rounded p-2" />
          {uploading && <p className="text-sm text-gray-600 mt-2">Uploading...</p>}
          <p className="text-sm text-gray-600 mt-1">First image will be the main image</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img src={img.image_path} className="w-full h-32 object-cover rounded" />
              {img.is_main === 1 && <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">Main</span>}
              <button onClick={() => deleteImage(img.image_path)} className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded opacity-0 group-hover:opacity-100 transition">×</button>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700">Close</button>
      </div>
    </div>
  )
}
