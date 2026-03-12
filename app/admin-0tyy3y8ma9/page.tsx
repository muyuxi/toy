'use client'
import { useEffect, useState } from 'react'

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([])
  const [modal, setModal] = useState<string | null>(null)
  const [inquiryCode, setInquiryCode] = useState('')
  const [uploading, setUploading] = useState(false)

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

  const downloadInquiry = () => {
    if (!inquiryCode.trim()) {
      alert('请输入询价码')
      return
    }
    window.open(`/q/${inquiryCode.trim().toUpperCase()}`, '_blank')
    setInquiryCode('')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      if (res.ok) {
        alert('上传成功！')
        loadProducts()
      } else {
        alert('上传失败')
      }
    } catch (error) {
      alert('上传出错')
    }
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">产品管理</h1>
        <label className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors cursor-pointer">
          {uploading ? '上传中...' : '上传 Excel'}
          <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      {/* 询价码下载 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-bold mb-3 text-blue-900">下载询价单</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="输入询价码 (如: ZEUXEV)"
            value={inquiryCode}
            onChange={(e) => setInquiryCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && downloadInquiry()}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={downloadInquiry}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            下载 Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-x-auto shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="border-b">
              <th className="p-3 text-left whitespace-nowrap">产品编号</th>
              <th className="p-3 text-left whitespace-nowrap">分类</th>
              <th className="p-3 text-left whitespace-nowrap">价格</th>
              <th className="p-3 text-left whitespace-nowrap">颜色</th>
              <th className="p-3 text-left whitespace-nowrap">图片</th>
              <th className="p-3 text-left whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-semibold whitespace-nowrap">{p.item_no}</td>
                <td className="p-3 whitespace-nowrap">{p.category}</td>
                <td className="p-3 whitespace-nowrap">${p.base_price}</td>
                <td className="p-3 text-sm">{p.colors}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm whitespace-nowrap ${p.image_count > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {p.image_count || 0} 张
                  </span>
                </td>
                <td className="p-3 whitespace-nowrap">
                  <button onClick={() => setModal(p.item_no)} className="text-blue-600 hover:underline mr-3">管理图片</button>
                  <button onClick={() => deleteProduct(p.item_no)} className="text-red-600 hover:underline">删除</button>
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
        <h2 className="text-xl font-bold mb-4">管理图片 - {itemNo}</h2>

        <div className="mb-4">
          <label className="block mb-2 font-semibold">上传图片</label>
          <input type="file" multiple accept="image/*" onChange={upload} disabled={uploading} className="w-full border rounded p-2" />
          {uploading && <p className="text-sm text-gray-600 mt-2">上传中...</p>}
          <p className="text-sm text-gray-600 mt-1">第一张图片将作为主图</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img src={img.image_path} className="w-full h-32 object-cover rounded" />
              {img.is_main === 1 && <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">主图</span>}
              <button onClick={() => deleteImage(img.image_path)} className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded opacity-0 group-hover:opacity-100 transition">×</button>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700">关闭</button>
      </div>
    </div>
  )
}
