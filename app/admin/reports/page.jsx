'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/admin-layout';
import { Calendar, Download, TrendingUp, DollarSign, ShoppingCart, Users, Award, Zap, Target, ArrowUp, ArrowDown } from 'lucide-react';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [reports, setReports] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('pos_token');
      let url = `/api/admin/reports?period=${period}`;
      
      if (period === 'custom' && customDates.start && customDates.end) {
        url += `&startDate=${customDates.start}&endDate=${customDates.end}`;
      }
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const exportReport = () => {
    const dataStr = JSON.stringify(reports, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${period}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
              <p className="text-gray-700 mt-1">Sales and performance insights</p>
            </div>
            <button
              onClick={exportReport}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>

        {/* Period Selector */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setPeriod('today')}
              className={`px-4 py-2 rounded-lg font-medium ${period === 'today' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Today
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 rounded-lg font-medium ${period === 'week' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              This Week
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-lg font-medium ${period === 'month' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriod('custom')}
              className={`px-4 py-2 rounded-lg font-medium ${period === 'custom' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Custom Range
            </button>
            
            {period === 'custom' && (
              <div className="flex items-center space-x-2 ml-4">
                <input
                  type="date"
                  value={customDates.start}
                  onChange={(e) => setCustomDates({...customDates, start: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <span>to</span>
                <input
                  type="date"
                  value={customDates.end}
                  onChange={(e) => setCustomDates({...customDates, end: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={fetchReports}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {reports && (
          <>
            {/* Summary Cards with Gradients */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <TrendingUp className="w-4 h-4 text-white" />
                    <span className="text-xs text-white font-medium">+12%</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white">Rs {reports.totalSales?.toFixed(2) || '0.00'}</h3>
                <p className="text-green-100 text-sm mt-1 font-medium">Total Sales Revenue</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <ArrowUp className="w-4 h-4 text-white" />
                    <span className="text-xs text-white font-medium">+8%</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white">{reports.totalOrders || 0}</h3>
                <p className="text-blue-100 text-sm mt-1 font-medium">Total Orders</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <TrendingUp className="w-4 h-4 text-white" />
                    <span className="text-xs text-white font-medium">+5%</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white">Rs {reports.avgOrderValue?.toFixed(2) || '0.00'}</h3>
                <p className="text-purple-100 text-sm mt-1 font-medium">Avg Order Value</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Zap className="w-4 h-4 text-white" />
                    <span className="text-xs text-white font-medium">Active</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white">{reports.uniqueCustomers || 0}</h3>
                <p className="text-orange-100 text-sm mt-1 font-medium">Total Customers</p>
              </div>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Payment Methods Breakdown</h2>
              </div>
              <div className="space-y-6">
                {reports.paymentMethods && Object.entries(reports.paymentMethods).map(([method, data], index) => {
                  const percentage = (data.amount / reports.totalSales * 100) || 0;
                  const colors = ['from-blue-500 to-blue-600', 'from-green-500 to-green-600', 'from-purple-500 to-purple-600', 'from-orange-500 to-orange-600'];
                  return (
                    <div key={method} className="group">
                      <div className="flex justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[index % colors.length]}`}></div>
                          <span className="font-semibold text-gray-800 capitalize">{method}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 text-lg">Rs {data.amount?.toFixed(2) || '0.00'}</span>
                          <span className="text-gray-600 text-sm ml-2">({data.count || 0} orders)</span>
                        </div>
                      </div>
                      <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-1000 ease-out group-hover:opacity-80`}
                          style={{ width: `${percentage}%` }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-700">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Selling Items */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Top Selling Items</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reports.topItems?.slice(0, 10).map((item, index) => {
                      const maxRevenue = reports.topItems[0]?.revenue || 1;
                      const percentage = (item.revenue / maxRevenue * 100);
                      const medals = ['🥇', '🥈', '🥉'];
                      return (
                        <tr key={index} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all group">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {index < 3 ? (
                                <span className="text-2xl">{medals[index]}</span>
                              ) : (
                                <span className="font-bold text-gray-500">#{index + 1}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                              {item.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                              {item.quantity} sold
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-green-600 text-lg">Rs {item.revenue?.toFixed(2)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end space-x-3">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-1000"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold text-gray-700 w-12 text-right">{percentage.toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Quick Insights */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-bold text-blue-900">Best Seller</span>
                  </div>
                  <p className="text-lg font-bold text-blue-800">{reports.topItems?.[0]?.name || 'N/A'}</p>
                  <p className="text-sm text-blue-700">{reports.topItems?.[0]?.quantity || 0} units sold</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-bold text-green-900">Top Revenue</span>
                  </div>
                  <p className="text-lg font-bold text-green-800">Rs {reports.topItems?.[0]?.revenue?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-green-700">From best seller</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-bold text-purple-900">Total Items</span>
                  </div>
                  <p className="text-lg font-bold text-purple-800">{reports.topItems?.length || 0}</p>
                  <p className="text-sm text-purple-700">Items in top list</p>
                </div>
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </AdminLayout>
  );
}
