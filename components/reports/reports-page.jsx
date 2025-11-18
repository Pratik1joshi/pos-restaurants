'use client'

import { useState } from 'react'
import { DownloadCloud, FileText } from 'lucide-react'

export default function ReportsPage() {
  const [reportType, setReportType] = useState('daily')

  const reports = {
    daily: {
      title: 'Daily Sales Report',
      date: '2025-01-15',
      sales: 12450,
      transactions: 156,
      avgTransaction: 79.81
    },
    monthly: {
      title: 'Monthly Sales Report',
      date: 'January 2025',
      sales: 87400,
      transactions: 1120,
      avgTransaction: 78.04
    }
  }

  const currentReport = reports[reportType]

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Reports & Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <button
          onClick={() => setReportType('daily')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            reportType === 'daily'
              ? 'bg-primary text-primary-foreground'
              : 'border border-border hover:bg-muted'
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setReportType('monthly')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            reportType === 'monthly'
              ? 'bg-primary text-primary-foreground'
              : 'border border-border hover:bg-muted'
          }`}
        >
          Monthly
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="pos-stat-card">
          <p className="text-sm text-muted-foreground mb-2">Total Sales</p>
          <h3 className="text-4xl font-bold text-primary">${currentReport.sales.toLocaleString()}</h3>
          <p className="text-xs text-muted-foreground mt-2">{currentReport.date}</p>
        </div>
        <div className="pos-stat-card">
          <p className="text-sm text-muted-foreground mb-2">Total Transactions</p>
          <h3 className="text-4xl font-bold">{currentReport.transactions.toLocaleString()}</h3>
        </div>
        <div className="pos-stat-card">
          <p className="text-sm text-muted-foreground mb-2">Avg. Transaction</p>
          <h3 className="text-4xl font-bold text-secondary">${currentReport.avgTransaction.toFixed(2)}</h3>
        </div>
      </div>

      <div className="pos-stat-card">
        <h3 className="text-xl font-bold mb-6">Sales by Category</h3>
        <div className="space-y-4">
          {[
            { category: 'Electronics', sales: 4500, percent: 36 },
            { category: 'Cosmetics', sales: 3200, percent: 26 },
            { category: 'Medicine', sales: 2800, percent: 22 },
            { category: 'Food', sales: 1950, percent: 16 },
          ].map(item => (
            <div key={item.category}>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">{item.category}</span>
                <span className="text-primary font-bold">${item.sales.toLocaleString()}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pos-stat-card">
        <h3 className="text-xl font-bold mb-6">Best Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr className="text-muted-foreground font-semibold">
                <th className="text-left py-3 px-4">Product</th>
                <th className="text-right py-3 px-4">Qty Sold</th>
                <th className="text-right py-3 px-4">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Laptop', qty: 45, revenue: 40499 },
                { name: 'Shampoo', qty: 320, revenue: 5118 },
                { name: 'Aspirin', qty: 890, revenue: 5331 },
              ].map(product => (
                <tr key={product.name} className="border-b border-border hover:bg-muted/30">
                  <td className="py-3 px-4 font-semibold">{product.name}</td>
                  <td className="py-3 px-4 text-right">{product.qty}</td>
                  <td className="py-3 px-4 text-right font-bold text-primary">${product.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
          <DownloadCloud size={20} />
          Download as PDF
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 border border-border px-6 py-3 rounded-lg font-semibold hover:bg-muted transition-colors">
          <FileText size={20} />
          Download as Excel
        </button>
      </div>
    </div>
  )
}
