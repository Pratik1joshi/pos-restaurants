'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export default function StockForm({ onSubmit, onCancel, inventory }) {
  const [formData, setFormData] = useState({
    id: inventory[0]?.id || '',
    quantity: '',
    supplier: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({ id: '', quantity: '', supplier: '' })
  }

  return (
    <div className="pos-stat-card border-2 border-secondary">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Add Stock</h3>
        <button
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Product *</label>
            <select
              required
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-input"
            >
              <option value="">Select Product</option>
              {inventory.map(item => (
                <option key={item.id} value={item.id}>{item.product}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Quantity *</label>
            <input
              type="number"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-input"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Supplier</label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-input"
              placeholder="Supplier name"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-border">
          <button
            type="submit"
            className="pos-button-primary px-6 py-2 rounded-lg font-semibold flex-1"
          >
            Add Stock
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-border rounded-lg font-semibold hover:bg-muted flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
