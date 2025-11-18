'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Dashboard from '@/components/dashboard'
import Sidebar from '@/components/sidebar'
import ProductManagement from '@/components/products/product-management'
import InventoryManagement from '@/components/inventory/inventory-management'
import AdvancedBillingScreen from '@/components/billing/advanced-billing-screen'
import ReportsPage from '@/components/reports/reports-page'
import UserManagement from '@/components/users/user-management'
import Settings from '@/components/settings/settings'

export default function Home() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user] = useState({ name: 'Admin', role: 'Manager' })

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'products':
        return <ProductManagement />
      case 'inventory':
        return <InventoryManagement />
      case 'billing':
        return <AdvancedBillingScreen />
      case 'reports':
        return <ReportsPage />
      case 'users':
        return <UserManagement />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto transform transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={(page) => {
            setCurrentPage(page)
            setSidebarOpen(false)
          }}
        />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="pos-header px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">POS System</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm opacity-90 hidden sm:inline">{user.name} • {user.role}</span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center font-bold text-sm sm:text-base">
              {user.name[0]}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}
