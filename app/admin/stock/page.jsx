'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/admin-layout';
import { Plus, Edit, Trash2, Search, Package, DollarSign, Receipt, AlertTriangle } from 'lucide-react';

export default function StockManagement() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventoryItems, setInventoryItems] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [inventoryForm, setInventoryForm] = useState({
    item_name: '',
    quantity: '',
    unit: 'pieces',
    cost_per_unit: '',
    selling_price: '',
    min_stock_level: '',
    supplier: '',
    notes: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    category: 'raw_materials',
    amount: '',
    purchase_date: new Date().toISOString().split('T')[0],
    supplier: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('pos_token');
      
      const invResponse = await fetch('/api/admin/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (invResponse.ok) {
        const data = await invResponse.json();
        setInventoryItems(data.items || []);
      }

      const expResponse = await fetch('/api/admin/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (expResponse.ok) {
        const data = await expResponse.json();
        setExpenses(data.expenses || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleInventorySubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('pos_token');
      const url = editingItem 
        ? `/api/admin/inventory?id=${editingItem.id}`
        : '/api/admin/inventory';
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(inventoryForm)
      });

      if (response.ok) {
        fetchData();
        setShowForm(false);
        setEditingItem(null);
        resetInventoryForm();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('pos_token');
      const url = editingItem 
        ? `/api/admin/expenses?id=${editingItem.id}`
        : '/api/admin/expenses';
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(expenseForm)
      });

      if (response.ok) {
        fetchData();
        setShowForm(false);
        setEditingItem(null);
        resetExpenseForm();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetInventoryForm = () => {
    setInventoryForm({
      item_name: '',
      quantity: '',
      unit: 'pieces',
      cost_per_unit: '',
      selling_price: '',
      min_stock_level: '',
      supplier: '',
      notes: ''
    });
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      description: '',
      category: 'raw_materials',
      amount: '',
      purchase_date: new Date().toISOString().split('T')[0],
      supplier: '',
      notes: ''
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    if (activeTab === 'inventory') {
      setInventoryForm({
        item_name: item.item_name,
        quantity: item.quantity,
        unit: item.unit,
        cost_per_unit: item.cost_per_unit,
        selling_price: item.selling_price || '',
        min_stock_level: item.min_stock_level || '',
        supplier: item.supplier || '',
        notes: item.notes || ''
      });
    } else {
      setExpenseForm({
        description: item.description,
        category: item.category,
        amount: item.amount,
        purchase_date: item.purchase_date || new Date().toISOString().split('T')[0],
        supplier: item.supplier || '',
        notes: item.notes || ''
      });
    }
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const token = localStorage.getItem('pos_token');
      const endpoint = activeTab === 'inventory' ? 'inventory' : 'expenses';
      await fetch(`/api/admin/${endpoint}?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredInventory = inventoryItems.filter(item => 
    item.item_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExpenses = expenses.filter(expense => 
    expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.cost_per_unit), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const lowStockItems = inventoryItems.filter(item => item.quantity <= (item.min_stock_level || 5)).length;

  const getCategoryColor = (category) => {
    const colors = {
      raw_materials: 'bg-blue-100 text-blue-800',
      utilities: 'bg-green-100 text-green-800',
      packaging: 'bg-yellow-100 text-yellow-800',
      beverages: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const getStockStatus = (quantity, minLevel) => {
    if (quantity <= minLevel) return { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50' };
    if (quantity <= minLevel * 2) return { label: 'Low', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: 'Good', color: 'text-green-600', bg: 'bg-green-50' };
  };

  return (
    <AdminLayout>
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Stock & Expenses</h1>
            <p className="text-purple-100 mt-2">Manage inventory items & track expenses</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingItem(null);
              if (activeTab === 'inventory') {
                resetInventoryForm();
              } else {
                resetExpenseForm();
              }
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-white text-purple-600 rounded-xl hover:bg-purple-50 font-semibold shadow-lg transform hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add {activeTab === 'inventory' ? 'Inventory' : 'Expense'}</span>
          </button>
        </div>
      </header>

      <div className="p-8 bg-gray-50">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Inventory Value</p>
                <h3 className="text-3xl font-bold text-white mt-2">Rs {totalInventoryValue.toFixed(2)}</h3>
              </div>
              <Package className="w-12 h-12 text-white opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Total Expenses</p>
                <h3 className="text-3xl font-bold text-white mt-2">Rs {totalExpenses.toFixed(2)}</h3>
              </div>
              <DollarSign className="w-12 h-12 text-white opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Low Stock Items</p>
                <h3 className="text-3xl font-bold text-white mt-2">{lowStockItems}</h3>
              </div>
              <AlertTriangle className="w-12 h-12 text-white opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Items</p>
                <h3 className="text-3xl font-bold text-white mt-2">{inventoryItems.length}</h3>
              </div>
              <Receipt className="w-12 h-12 text-white opacity-80" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all ${
                activeTab === 'inventory'
                  ? 'text-purple-600 border-b-4 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-5 h-5 inline-block mr-2" />
              Inventory Items ({inventoryItems.length})
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all ${
                activeTab === 'expenses'
                  ? 'text-purple-600 border-b-4 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <DollarSign className="w-5 h-5 inline-block mr-2" />
              Expenses ({expenses.length})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'inventory' ? 'inventory items' : 'expenses'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              {activeTab === 'inventory' ? (
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold">Item Name</th>
                      <th className="px-6 py-4 text-left font-bold">Quantity</th>
                      <th className="px-6 py-4 text-left font-bold">Unit</th>
                      <th className="px-6 py-4 text-left font-bold">Cost/Unit</th>
                      <th className="px-6 py-4 text-left font-bold">Selling Price</th>
                      <th className="px-6 py-4 text-left font-bold">Total Value</th>
                      <th className="px-6 py-4 text-left font-bold">Status</th>
                      <th className="px-6 py-4 text-left font-bold">Supplier</th>
                      <th className="px-6 py-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredInventory.length > 0 ? (
                      filteredInventory.map((item) => {
                        const status = getStockStatus(item.quantity, item.min_stock_level || 5);
                        const totalValue = item.quantity * item.cost_per_unit;
                        return (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-gray-900">{item.item_name}</td>
                            <td className="px-6 py-4 text-gray-900">{item.quantity}</td>
                            <td className="px-6 py-4 text-gray-700">{item.unit}</td>
                            <td className="px-6 py-4 text-gray-900">Rs {item.cost_per_unit.toFixed(2)}</td>
                            <td className="px-6 py-4 text-gray-900">
                              {item.selling_price ? `Rs ${item.selling_price.toFixed(2)}` : '-'}
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-900">Rs {totalValue.toFixed(2)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color} ${status.bg}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-700">{item.supplier || '-'}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-600 hover:text-blue-800 mr-3"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="9" className="px-6 py-20 text-center text-gray-500">
                          No inventory items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold">Description</th>
                      <th className="px-6 py-4 text-left font-bold">Category</th>
                      <th className="px-6 py-4 text-left font-bold">Amount</th>
                      <th className="px-6 py-4 text-left font-bold">Purchase Date</th>
                      <th className="px-6 py-4 text-left font-bold">Supplier</th>
                      <th className="px-6 py-4 text-left font-bold">Notes</th>
                      <th className="px-6 py-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredExpenses.length > 0 ? (
                      filteredExpenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-900">{expense.description}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(expense.category)}`}>
                              {expense.category.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">Rs {expense.amount.toFixed(2)}</td>
                          <td className="px-6 py-4 text-gray-700">
                            {expense.purchase_date ? new Date(expense.purchase_date).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 text-gray-700">{expense.supplier || '-'}</td>
                          <td className="px-6 py-4 text-gray-700">{expense.notes || '-'}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleEdit(expense)}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-20 text-center text-gray-500">
                          No expenses found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">
                {editingItem ? 'Edit' : 'Add'} {activeTab === 'inventory' ? 'Inventory Item' : 'Expense'}
              </h2>
            </div>
            
            {activeTab === 'inventory' ? (
              <form onSubmit={handleInventorySubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Item Name *</label>
                    <input
                      type="text"
                      required
                      value={inventoryForm.item_name}
                      onChange={(e) => setInventoryForm({...inventoryForm, item_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900"
                      placeholder="e.g., Coca Cola, Chicken Breast"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Quantity *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={inventoryForm.quantity}
                      onChange={(e) => setInventoryForm({...inventoryForm, quantity: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Unit *</label>
                    <select
                      required
                      value={inventoryForm.unit}
                      onChange={(e) => setInventoryForm({...inventoryForm, unit: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900"
                    >
                      <option value="pieces">Pieces</option>
                      <option value="kg">kg (Kilograms)</option>
                      <option value="L">L (Liters)</option>
                      <option value="packets">Packets</option>
                      <option value="boxes">Boxes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Cost Per Unit *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={inventoryForm.cost_per_unit}
                      onChange={(e) => setInventoryForm({...inventoryForm, cost_per_unit: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Selling Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={inventoryForm.selling_price}
                      onChange={(e) => setInventoryForm({...inventoryForm, selling_price: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Min Stock Level</label>
                    <input
                      type="number"
                      value={inventoryForm.min_stock_level}
                      onChange={(e) => setInventoryForm({...inventoryForm, min_stock_level: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900"
                      placeholder="5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Supplier</label>
                    <input
                      type="text"
                      value={inventoryForm.supplier}
                      onChange={(e) => setInventoryForm({...inventoryForm, supplier: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900"
                      placeholder="Supplier name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Notes</label>
                  <textarea
                    value={inventoryForm.notes}
                    onChange={(e) => setInventoryForm({...inventoryForm, notes: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900"
                    rows="3"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                  >
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                    }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Description *</label>
                    <input
                      type="text"
                      required
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900"
                      placeholder="e.g., Gas Cylinder, Electricity Bill"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Category *</label>
                    <select
                      required
                      value={expenseForm.category}
                      onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900"
                    >
                      <option value="raw_materials">Raw Materials</option>
                      <option value="utilities">Utilities (Gas, Electricity)</option>
                      <option value="packaging">Packaging</option>
                      <option value="beverages">Beverages</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Purchase Date</label>
                    <input
                      type="date"
                      value={expenseForm.purchase_date}
                      onChange={(e) => setExpenseForm({...expenseForm, purchase_date: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Supplier</label>
                    <input
                      type="text"
                      value={expenseForm.supplier}
                      onChange={(e) => setExpenseForm({...expenseForm, supplier: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900"
                      placeholder="Supplier name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Notes</label>
                  <textarea
                    value={expenseForm.notes}
                    onChange={(e) => setExpenseForm({...expenseForm, notes: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900"
                    rows="3"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                  >
                    {editingItem ? 'Update Expense' : 'Add Expense'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                    }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
