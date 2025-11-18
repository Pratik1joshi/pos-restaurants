'use client'

import { BarChart3, Package, ShoppingCart, FileText, Users, Settings, Home } from 'lucide-react'

export default function Sidebar({ currentPage, setCurrentPage }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: ShoppingCart },
    { id: 'billing', label: 'Billing', icon: ShoppingCart },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="pos-sidebar w-64 flex flex-col py-6 px-4 gap-2 bg-background">
      <div className="px-2 py-4 mb-4">
        <div className="flex items-center gap-2 text-primary font-bold text-lg">
          <BarChart3 size={28} />
          <span className="hidden sm:inline">RetailPOS</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map(item => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left font-medium text-sm sm:text-base ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="pt-4 border-t border-border">
        <button className="w-full px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-medium text-left text-sm sm:text-base">
          Logout
        </button>
      </div>
    </div>
  )
}
