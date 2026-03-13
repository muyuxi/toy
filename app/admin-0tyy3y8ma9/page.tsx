'use client'
import { useEffect, useState } from 'react'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState<any[]>([])
  const [faqs, setFaqs] = useState<any[]>([])
  const [modal, setModal] = useState<string | null>(null)
  const [inquiryCode, setInquiryCode] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showFaqForm, setShowFaqForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')

  const loadProducts = () => {
    fetch('/api/admin/products').then(r => r.json()).then(setProducts)
  }

  const loadFaqs = () => {
    fetch('/api/faqs').then(r => r.json()).then(setFaqs)
  }

  useEffect(() => {
    loadProducts()
    loadFaqs()
  }, [])

  const deleteProduct = async (itemNo: string) => {
    if (!confirm(`确定删除产品 ${itemNo}?`)) return
    await fetch(`/api/admin/products?item_no=${itemNo}`, { method: 'DELETE' })
    loadProducts()
  }

  const toggleBanner = async (itemNo: string, isBanner: boolean) => {
    await fetch('/api/admin/banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_no: itemNo, is_banner: !isBanner })
    })
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

  const addFaq = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      alert('请填写问题和答案')
      return
    }
    await fetch('/api/admin/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: newQuestion, answer: newAnswer })
    })
    setNewQuestion('')
    setNewAnswer('')
    setShowFaqForm(false)
    loadFaqs()
  }

  const deleteFaq = async (id: number) => {
    if (!confirm('确定删除此问题?')) return
    await fetch(`/api/admin/faqs?id=${id}`, { method: 'DELETE' })
    loadFaqs()
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-heading font-bold text-text-primary">后台管理</h1>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2 mb-6 border-b border-border-light">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 font-semibold transition-all ${activeTab === 'products' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-text-primary'}`}
        >
          产品管理
        </button>
        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-6 py-3 font-semibold transition-all ${activeTab === 'faqs' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-text-primary'}`}
        >
          常见问题管理
        </button>
      </div>

      {/* 产品管理 */}
      {activeTab === 'products' && (
        <>
          <div className="flex justify-end mb-4">
            <label className="px-6 py-2 bg-gradient-to-r from-success to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all cursor-pointer">
              {uploading ? '上传中...' : '上传 Excel'}
              <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} disabled={uploading} className="hidden" />
            </label>
          </div>

          {/* 询价码下载 */}
          <div className="bg-card border border-border-light rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3 text-text-primary">下载询价单</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="输入询价码 (如: ZEUXEV)"
                value={inquiryCode}
                onChange={(e) => setInquiryCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && downloadInquiry()}
                className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
              />
              <button
                onClick={downloadInquiry}
                className="px-6 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-semibold hover:shadow-lg transition-all whitespace-nowrap"
              >
                下载 Excel
              </button>
            </div>
          </div>

          <div className="bg-card rounded-lg overflow-x-auto border border-border-light">
            <table className="w-full">
              <thead className="bg-background">
                <tr className="border-b border-border-light">
                  <th className="p-3 text-left whitespace-nowrap text-text-primary font-semibold">产品编号</th>
                  <th className="p-3 text-left whitespace-nowrap text-text-primary font-semibold">分类</th>
                  <th className="p-3 text-left whitespace-nowrap text-text-primary font-semibold">价格</th>
                  <th className="p-3 text-left whitespace-nowrap text-text-primary font-semibold">颜色</th>
                  <th className="p-3 text-left whitespace-nowrap text-text-primary font-semibold">图片</th>
                  <th className="p-3 text-left whitespace-nowrap text-text-primary font-semibold">轮播</th>
                  <th className="p-3 text-left whitespace-nowrap text-text-primary font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-border-light hover:bg-background">
                    <td className="p-3 font-semibold whitespace-nowrap text-text-primary">{p.item_no}</td>
                    <td className="p-3 whitespace-nowrap text-text-secondary">{p.category}</td>
                    <td className="p-3 whitespace-nowrap text-price font-semibold">¥{p.base_price}</td>
                    <td className="p-3 text-sm text-text-secondary">{p.colors}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-sm whitespace-nowrap ${p.image_count > 0 ? 'bg-green-50 text-success border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                        {p.image_count || 0} 张
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleBanner(p.item_no, p.is_banner)}
                        className={`px-3 py-1 rounded text-sm whitespace-nowrap font-medium transition-all ${p.is_banner ? 'bg-primary text-white' : 'bg-background text-text-secondary border border-border hover:border-primary'}`}
                      >
                        {p.is_banner ? '已设置' : '设为轮播'}
                      </button>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <button onClick={() => setModal(p.item_no)} className="text-primary hover:text-primary-dark font-medium mr-3">管理图片</button>
                      <button onClick={() => deleteProduct(p.item_no)} className="text-red-600 hover:text-red-700 font-medium">删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* FAQ管理 */}
      {activeTab === 'faqs' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowFaqForm(!showFaqForm)} className="px-6 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-semibold hover:shadow-lg transition-all">
              {showFaqForm ? '取消' : '添加问题'}
            </button>
          </div>

          {showFaqForm && (
            <div className="bg-card rounded-lg p-4 mb-4 border border-border-light">
              <input type="text" placeholder="问题" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg mb-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              <textarea placeholder="答案" value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} rows={4} className="w-full px-4 py-2 border border-border rounded-lg mb-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              <button onClick={addFaq} className="px-6 py-2 bg-success text-white rounded-lg font-semibold hover:shadow-lg transition-all">保存</button>
            </div>
          )}

          <div className="bg-card rounded-lg border border-border-light overflow-hidden">
            <table className="w-full">
              <thead className="bg-background">
                <tr className="border-b border-border-light">
                  <th className="p-3 text-left text-text-primary font-semibold">问题</th>
                  <th className="p-3 text-left text-text-primary font-semibold">答案</th>
                  <th className="p-3 text-left text-text-primary font-semibold w-24">操作</th>
                </tr>
              </thead>
              <tbody>
                {faqs.map(faq => (
                  <tr key={faq.id} className="border-b border-border-light hover:bg-background">
                    <td className="p-3 text-text-primary font-medium">{faq.question}</td>
                    <td className="p-3 text-text-secondary text-sm">{faq.answer.substring(0, 50)}...</td>
                    <td className="p-3">
                      <button onClick={() => deleteFaq(faq.id)} className="text-red-600 hover:text-red-700 font-medium">删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
      <div className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border-light">
        <h2 className="text-xl font-heading font-bold mb-4 text-text-primary">管理图片 - {itemNo}</h2>

        <div className="mb-4">
          <label className="block mb-2 font-semibold text-text-primary">上传图片</label>
          <input type="file" multiple accept="image/*" onChange={upload} disabled={uploading} className="w-full border border-border rounded p-2 text-text-primary" />
          {uploading && <p className="text-sm text-text-secondary mt-2">上传中...</p>}
          <p className="text-sm text-text-muted mt-1">第一张图片将作为主图</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img src={img.image_path} className="w-full h-32 object-cover rounded border border-border-light" />
              {img.is_main === 1 && <span className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-1 rounded font-medium">主图</span>}
              <button onClick={() => deleteImage(img.image_path)} className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded opacity-0 group-hover:opacity-100 transition">×</button>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="w-full bg-text-secondary text-white py-2 rounded-lg hover:bg-text-primary transition-colors font-semibold">关闭</button>
      </div>
    </div>
  )
}
