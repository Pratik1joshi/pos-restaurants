'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/admin-layout';
import {
  Users, Package, DollarSign, ShoppingCart, TrendingUp, TrendingDown, PieChart, BarChart3, Activity, Zap, AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { getNepaliDateString } from '@/lib/time-utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('pos_token');
      const response = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Calculate profit (mock data - you'll get real data from API)
  const calculateProfit = () => {
    const revenue = stats?.todaySales || 0;
    const costs = stats?.todayCosts || 0;
    return revenue - costs;
  };

  const profitMargin = stats?.todaySales ? ((calculateProfit() / stats.todaySales) * 100) : 0;

  return (
    <AdminLayout>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Dashboard</h1>
            <p className="text-blue-100 mt-2 text-lg">Welcome back, Admin • {getNepaliDateString(new Date())}</p>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
            <Activity className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">Live</span>
          </div>
        </div>
      </header>

      <div className="p-8 bg-gray-50">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full">
                <TrendingUp className="w-4 h-4 text-white" />
                <span className="text-xs text-white font-bold">+15%</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white">{formatCurrency(stats?.todaySales || 0)}</h3>
            <p className="text-blue-100 text-sm mt-2 font-medium">Today's Sales</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full">
                <Zap className="w-4 h-4 text-white" />
                <span className="text-xs text-white font-bold">{profitMargin.toFixed(1)}%</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white">{formatCurrency(calculateProfit())}</h3>
            <p className="text-green-100 text-sm mt-2 font-medium">Today's Profit</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full">
                <TrendingUp className="w-4 h-4 text-white" />
                <span className="text-xs text-white font-bold">+8%</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white">{stats?.todayOrders || 0}</h3>
            <p className="text-purple-100 text-sm mt-2 font-medium">Today's Orders</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full">
                <Activity className="w-4 h-4 text-white" />
                <span className="text-xs text-white font-bold">Active</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white">{stats?.totalEmployees || 0}</h3>
            <p className="text-orange-100 text-sm mt-2 font-medium">Total Staff</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Weekly Sales</h2>
              </div>
            </div>
            <div className="space-y-4">
              {(stats?.weeklySales || []).map((dayData, index) => {
                const maxSales = Math.max(...(stats?.weeklySales || []).map(d => d.sales), 1);
                const percentage = (dayData.sales / maxSales) * 100;
                return (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-gray-700">{dayData.day}</span>
                      <span className="font-bold text-gray-900">{formatCurrency(dayData.sales)}</span>
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Distribution Pie Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <PieChart className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Revenue Sources</h2>
              </div>
            </div>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-64 h-64">
                {/* Pie Chart Visual */}
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="75.4 251.2" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="62.8 251.2" strokeDashoffset="-75.4" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="50.24 251.2" strokeDashoffset="-138.2" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray="62.8 251.2" strokeDashoffset="-188.44" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">100%</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(stats?.revenueSources || []).map((item, index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-red-500'];
                const typeLabels = {
                  'dine-in': 'Dine-in',
                  'takeaway': 'Takeaway',
                  'delivery': 'Delivery',
                  'online': 'Online'
                };
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{typeLabels[item.type] || item.type}</p>
                      <p className="text-xs text-gray-600">{item.percentage}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Row - Inventory Alerts & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Stock Alerts</h2>
            </div>
            <div className="space-y-3">
              {(stats?.lowStockItems || []).length > 0 ? (
                (stats?.lowStockItems || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${item.status === 'critical' ? 'bg-red-500' : 'bg-yellow-500'} animate-pulse`} />
                      <span className="font-semibold text-gray-900">{item.name}</span>
                    </div>
                    <span className={`text-sm font-bold ${item.status === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {item.qty} {item.unit}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>All stock levels are good!</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Quick Stats</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-1">Menu Items</p>
                <p className="text-2xl font-bold text-blue-700">{stats?.totalProducts || 0}</p>
                <p className="text-xs text-blue-600 mt-1">Available now</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <p className="text-sm font-semibold text-purple-900 mb-1">Avg Order</p>
                <p className="text-2xl font-bold text-purple-700">{formatCurrency(stats?.avgOrder || 0)}</p>
                <p className="text-xs text-purple-600 mt-1">Per customer</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <p className="text-sm font-semibold text-green-900 mb-1">Monthly Sales</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(stats?.monthlySales || 0)}</p>
                <p className="text-xs text-green-600 mt-1">This month</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <p className="text-sm font-semibold text-orange-900 mb-1">Growth</p>
                <p className={`text-2xl font-bold ${(stats?.growthPercent || 0) >= 0 ? 'text-orange-700' : 'text-red-700'}`}>
                  {(stats?.growthPercent || 0) >= 0 ? '+' : ''}{stats?.growthPercent || 0}%
                </p>
                <p className="text-xs text-orange-600 mt-1">vs last month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
