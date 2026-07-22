import { Sidebar } from '@/components/layout/Sidebar'

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="layout-coach">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
