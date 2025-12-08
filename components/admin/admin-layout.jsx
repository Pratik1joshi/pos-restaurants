'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Users, Package, FileText, Settings, DollarSign, ShoppingCart,
  LogOut, Menu, X, LayoutDashboard, Warehouse
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('pos_token');
    const user = JSON.parse(localStorage.getItem('pos_user') || '{}');
    
    if (!token || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    router.push('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard', color: 'text-gray-600' },
    { icon: Package, label: 'Menu', href: '/admin/products', color: 'text-blue-600' },
    { icon: Warehouse, label: 'Stock', href: '/admin/stock', color: 'text-indigo-600' },
    { icon: Users, label: 'Employees', href: '/admin/employees', color: 'text-green-600' },
    { icon: FileText, label: 'Reports', href: '/admin/reports', color: 'text-purple-600' },
    { icon: ShoppingCart, label: 'Orders', href: '/admin/orders', color: 'text-orange-600' },
    { icon: DollarSign, label: 'Billing', href: '/admin/billing', color: 'text-teal-600' },
    { icon: Users, label: 'Customers', href: '/admin/customers', color: 'text-pink-600' },
    { icon: Settings, label: 'Settings', href: '/admin/settings', color: 'text-gray-600' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} z-40`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={index}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  isActive ? 'bg-gray-100 border-l-4 border-gray-800' : 'hover:bg-gray-50'
                }`}
              >
                <item.icon className={`${item.color} ${sidebarOpen ? 'w-5 h-5' : 'w-6 h-6'}`} />
                {sidebarOpen && (
                  <span className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
          >
            <LogOut className={sidebarOpen ? 'w-5 h-5' : 'w-6 h-6'} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 min-h-screen`}>
        {children}
      </div>
    </div>
  );
}
