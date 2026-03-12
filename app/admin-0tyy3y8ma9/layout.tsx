export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto">{children}</main>
    </div>
  )
}
