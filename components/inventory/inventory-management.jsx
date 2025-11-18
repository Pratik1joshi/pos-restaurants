'use client'

import { useState } from 'react'
import { Plus, Search, AlertTriangle } from 'lucide-react'
import StockForm from './stock-form'
import StockHistory from './stock-history'

export default function InventoryManagement() {
  const [inventory, setInventory] = useState([
    { id: 1, product: 'Laptop', stock: 15, minStock: 5, supplier: 'Tech Corp', lastUpdate: '2025-01-10', status: 'optimal' },
    { id: 2, product: 'Shampoo', stock: 3, minStock: 10, supplier: 'Beauty Inc', lastUpdate: '2025-01-08', status: 'critical' },
    { id: 3, product: 'Aspirin', stock: 2, minStock: 20, supplier: 'Pharma Ltd', lastUpdate: '2025-01-07', status: 'critical' },
  ])
  
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredInventory = inventory.filter(item =>
    item.product.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddStock = (data) => {
    setInventory(inventory.map(item =>
      item.id === data.id
        ? { ...item, stock: item.stock + parseInt(data.quantity), lastUpdate: new Date().toISOString().split('T')[0] }
        : item
    ))
    setShowForm(false)
  }

  const criticalItems = inventory.filter(i => i.stock < i.minStock)
  const totalValue = inventory.reduce((sum, item) => sum + (item.stock * 50), 0) // Assuming avg price

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Inventory Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="pos-button-primary px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus size={20} />
          Add Stock
        </button>
      </div>

      {criticalItems.length > 0 && (
        <div className="pos-stat-card border-l-4 border-destructive bg-destructive/5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-destructive font-semibold mb-3">
            <AlertTriangle size={24} className="flex-shrink-0" />
            <span className="text-sm sm:text-base">{criticalItems.length} items running low on stock!</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs sm:text-sm">
            {criticalItems.map(item => (
              <div key={item.id} className="p-2 bg-background/50 rounded">
                {item.product}: {item.stock}/{item.minStock}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="pos-stat-card">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Total Items</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{inventory.reduce((sum, i) => sum + i.stock, 0)}</h3>
        </div>
        <div className="pos-stat-card">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Critical Alerts</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-destructive">{criticalItems.length}</h3>
        </div>
        <div className="pos-stat-card">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Inventory Value</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-primary">${totalValue.toLocaleString()}</h3>
        </div>
      </div>

      {showForm && <StockForm onSubmit={handleAddStock} onCancel={() => setShowForm(false)} inventory={inventory} />}

      <div className="pos-stat-card">
        <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 relative min-w-0">
            <Search size={20} className="absolute left-3 top-2 sm:top-3 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-2 border border-border rounded-lg bg-input text-xs sm:text-base"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-xs sm:text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr className="text-muted-foreground font-semibold">
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4">Product</th>
                <th className="text-right py-2 sm:py-3 px-3 sm:px-4">Stock</th>
                <th className="text-right py-2 sm:py-3 px-3 sm:px-4">Min Stock</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 hidden sm:table-cell">Supplier</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold">{item.product}</td>
                  <td className="py-2 sm:py-3 px-3 sm:px-4 text-right font-bold">{item.stock}</td>
                  <td className="py-2 sm:py-3 px-3 sm:px-4 text-right">{item.minStock}</td>
                  <td className="py-2 sm:py-3 px-3 sm:px-4 hidden sm:table-cell">{item.supplier}</td>
                  <td className="py-2 sm:py-3 px-3 sm:px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'critical'
                        ? 'bg-destructive/20 text-destructive'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    }`}>
                      {item.status === 'critical' ? 'Critical' : 'Optimal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StockHistory />
    </div>
  )
}
