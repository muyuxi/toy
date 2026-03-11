'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex gap-6">
          <Link href="/admin" className="font-semibold">Products</Link>
          <Link href="/admin/upload" className="text-gray-600">Upload Excel</Link>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-4">{children}</main>
    </div>
  )
}
