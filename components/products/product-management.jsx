'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import ProductForm from './product-form'
import ProductTable from './product-table'
import SmartProductFlow from './smart-product-flow'

export default function ProductManagement() {
  const [products, setProducts] = useState([
    { id: 1, name: 'Laptop', barcode: '8901234567890', category: 'Electronics', price: 899.99, cost: 650, stock: 15, expiry: null },
    { id: 2, name: 'Organic Shampoo', barcode: '8901234567891', category: 'Cosmetics', price: 15.99, cost: 8, stock: 45, expiry: '2025-12-31' },
    { id: 3, name: 'Aspirin', barcode: '8901234567892', category: 'Medicine', price: 5.99, cost: 1.5, stock: 3, expiry: '2025-06-30' },
  ])
  
  const [showForm, setShowForm] = useState(false)
  const [showSmartFlow, setShowSmartFlow] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null)

  const handleAddProduct = (product) => {
    if (editingId) {
      setProducts(products.map(p => p.id === editingId ? { ...product, id: editingId } : p))
      setEditingId(null)
    } else {
      setProducts([...products, { ...product, id: Date.now() }])
    }
    setShowForm(false)
  }

  const handleSmartProductAdded = (product) => {
    setProducts([...products, product])
    setShowSmartFlow(false)
  }

  const handleDelete = (id) => {
    setProducts(products.filter(p => p.id !== id))
  }

  const handleEdit = (product) => {
    setEditingId(product.id)
    setShowForm(true)
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Product Management</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => setShowSmartFlow(true)}
            className="pos-button-primary px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-sm sm:text-base"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Smart Add</span>
            <span className="sm:hidden">Smart</span>
          </button>
          <button
            onClick={() => {
              setEditingId(null)
              setShowForm(!showForm)
            }}
            className="pos-button-primary px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Manual Add</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {showForm && (
        <ProductForm
          onSubmit={handleAddProduct}
          onCancel={() => {
            setShowForm(false)
            setEditingId(null)
          }}
          editingProduct={editingId ? products.find(p => p.id === editingId) : null}
        />
      )}

      {showSmartFlow && (
        <SmartProductFlow
          products={products}
          onProductAdded={handleSmartProductAdded}
          onCancel={() => setShowSmartFlow(false)}
        />
      )}

      <div className="pos-stat-card">
        <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 relative min-w-0">
            <Search size={20} className="absolute left-3 top-2 sm:top-3 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground text-xs sm:text-base"
            />
          </div>
        </div>

        <ProductTable
          products={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
