'use client'

import { useState } from 'react'
import StatCard from '@/components/stat-card'
import Chart from '@/components/chart'
import QuickActions from '@/components/quick-actions'
import AdminControls from '@/components/admin-controls'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function Dashboard() {
  const [period, setPeriod] = useState('today')
  const [showControls, setShowControls] = useState(false)

  const stats = {
    today: {
      sales: { value: 12450, change: 12.5, trend: 'up' },
      profit: { value: 3850, change: 8.2, trend: 'up' },
      items: { value: 1240, change: -2.3, trend: 'down' },
      alerts: { value: 5, change: 0, trend: 'neutral' },
      transactions: { value: 156, change: 5.2, trend: 'up' },
      avgOrder: { value: 79.81, change: 2.1, trend: 'up' }
    },
    weekly: {
      sales: { value: 87400, change: 24.5, trend: 'up' },
      profit: { value: 28500, change: 15.2, trend: 'up' },
      items: { value: 8920, change: 5.8, trend: 'up' },
      alerts: { value: 12, change: 0, trend: 'neutral' },
      transactions: { value: 1120, change: 12.4, trend: 'up' },
      avgOrder: { value: 78.04, change: 8.3, trend: 'up' }
    }
  }

  const currentStats = stats[period]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {period === 'today' ? 'Today\'s Performance' : 'Weekly Performance'}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              period === 'today'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              period === 'weekly'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setShowControls(!showControls)}
            className="px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all border border-border hover:bg-muted"
          >
            ⚙️ Admin
          </button>
        </div>
      </div>

      {/* Admin Controls Panel */}
      {showControls && <AdminControls />}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Sales"
          value={`$${currentStats.sales.value.toLocaleString()}`}
          change={currentStats.sales.change}
          trend={currentStats.sales.trend}
          icon="💰"
        />
        <StatCard
          title="Net Profit"
          value={`$${currentStats.profit.value.toLocaleString()}`}
          change={currentStats.profit.change}
          trend={currentStats.profit.trend}
          icon="📈"
        />
        <StatCard
          title="Items Sold"
          value={currentStats.items.value.toLocaleString()}
          change={currentStats.items.change}
          trend={currentStats.items.trend}
          icon="📦"
        />
        <StatCard
          title="Transactions"
          value={currentStats.transactions.value.toLocaleString()}
          change={currentStats.transactions.change}
          trend={currentStats.transactions.trend}
          icon="🔔"
        />
        <StatCard
          title="Avg Order"
          value={`$${currentStats.avgOrder.value.toFixed(2)}`}
          change={currentStats.avgOrder.change}
          trend={currentStats.avgOrder.trend}
          icon="🛒"
        />
        <StatCard
          title="Alerts"
          value={currentStats.alerts.value}
          change={0}
          trend="neutral"
          icon="⚠️"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Chart title="Daily Sales" span="lg:col-span-2" />
        <Chart title="Category Distribution" span="col-span-1" />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="pos-stat-card">
          <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-foreground">Top Performing Metrics</h3>
          <div className="space-y-3 sm:space-y-4">
            {[
              { label: 'Highest Selling Category', value: 'Electronics', percent: 45 },
              { label: 'Peak Transaction Time', value: '2:00 PM - 3:00 PM', percent: 85 },
              { label: 'Payment Method Preference', value: 'Card (58%)', percent: 58 },
            ].map((metric, idx) => (
              <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                  <span className="text-xs sm:text-sm font-semibold text-muted-foreground">{metric.label}</span>
                  <span className="font-bold text-primary text-sm">{metric.value}</span>
                </div>
                <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${metric.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pos-stat-card">
          <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-foreground">System Health</h3>
          <div className="space-y-3 sm:space-y-4">
            {[
              { label: 'Database Status', status: 'Healthy', color: 'green' },
              { label: 'Server Response Time', status: '45ms', color: 'green' },
              { label: 'API Sync Status', status: 'Synced', color: 'green' },
              { label: 'Backup Status', status: 'Last: 2h ago', color: 'yellow' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-muted/30 rounded-lg">
                <span className="font-semibold text-foreground text-sm sm:text-base">{item.label}</span>
                <span className={`flex items-center gap-2 font-bold text-sm ${
                  item.color === 'green' ? 'text-green-600 dark:text-green-400' : 
                  item.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    item.color === 'green' ? 'bg-green-600 dark:bg-green-400' : 
                    item.color === 'yellow' ? 'bg-yellow-600 dark:bg-yellow-400' :
                    'bg-red-600 dark:bg-red-400'
                  }`} />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="pos-stat-card">
        <h3 className="text-lg sm:text-xl font-bold mb-4 text-foreground">Recent Transactions</h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-xs sm:text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr className="text-muted-foreground font-semibold">
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4">ID</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4">Amount</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 hidden sm:table-cell">Items</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 hidden md:table-cell">Cashier</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 hidden lg:table-cell">Payment</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(8)].map((_, i) => {
                // Static data to avoid hydration mismatch
                const amounts = [125, 340, 78, 456, 223, 189, 412, 167]
                const items = [3, 7, 2, 8, 5, 4, 9, 3]
                return (
                  <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-2 sm:py-3 px-3 sm:px-4 font-mono text-primary text-xs">{`TXN${String(i+1).padStart(6, '0')}`}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 font-bold text-foreground">${amounts[i]}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 hidden sm:table-cell">{items[i]}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 hidden md:table-cell">Cashier {i%3 + 1}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 hidden lg:table-cell">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-semibold">
                        {['Cash', 'Card', 'Mobile'][i % 3]}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-muted-foreground text-xs">{String(i+1).padStart(2, '0')}:{String(i*10).padStart(2, '0')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
