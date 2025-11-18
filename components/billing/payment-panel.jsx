'use client'

import { useState } from 'react'
import { Printer, Check } from 'lucide-react'

export default function PaymentPanel({ total, onComplete, onPrint }) {
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [cashReceived, setCashReceived] = useState('')
  const [discount, setDiscount] = useState(0)

  const finalTotal = total - discount
  const change = paymentMethod === 'cash' ? (parseFloat(cashReceived) || 0) - finalTotal : 0

  const handleComplete = () => {
    if (paymentMethod === 'cash' && !cashReceived) {
      alert('Enter cash received amount')
      return
    }

    onComplete({
      method: paymentMethod,
      cashReceived: parseFloat(cashReceived) || 0,
      discount,
      change
    })
  }

  return (
    <div className="pos-stat-card border-2 border-secondary space-y-3">
      <h3 className="font-semibold text-foreground">Payment</h3>

      {/* Discount */}
      <div>
        <label className="text-sm text-muted-foreground block mb-1">Discount ($)</label>
        <input
          type="number"
          value={discount}
          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
          step="0.01"
          className="w-full px-3 py-2 border border-border rounded bg-input text-foreground text-sm"
        />
      </div>

      {/* Payment Method */}
      <div>
        <label className="text-sm text-muted-foreground block mb-1">Payment Method</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded bg-input text-foreground text-sm font-semibold"
        >
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="online">Online</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>

      {/* Cash Input */}
      {paymentMethod === 'cash' && (
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Cash Received ($)</label>
          <input
            type="number"
            value={cashReceived}
            onChange={(e) => setCashReceived(e.target.value)}
            step="0.01"
            className="w-full px-3 py-2 border border-border rounded bg-input text-foreground text-sm font-semibold"
            placeholder="0.00"
            autoFocus
          />
          {change > 0 && (
            <div className="mt-2 p-2 bg-green-500/10 border border-green-500 rounded text-sm font-bold text-green-700 dark:text-green-400">
              Change: ${change.toFixed(2)}
            </div>
          )}
        </div>
      )}

      {/* Total Display */}
      <div className="border-t border-border pt-2 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Final Total:</span>
          <span className="font-bold text-lg text-primary">${finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <button
          onClick={handleComplete}
          className="w-full bg-green-600 dark:bg-green-700 text-white py-3 rounded-lg font-bold hover:bg-green-700 dark:hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
        >
          <Check size={18} />
          Complete Sale (Ctrl+P)
        </button>
        <button
          onClick={onPrint}
          className="w-full flex items-center justify-center gap-2 border border-border py-2 rounded-lg hover:bg-muted transition-colors font-semibold"
        >
          <Printer size={16} />
          Print Receipt
        </button>
      </div>
    </div>
  )
}
