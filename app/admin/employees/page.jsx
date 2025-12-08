'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/admin-layout';
import { Plus, Edit, Trash2, Key, Search, Users } from 'lucide-react';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [changingPinFor, setChangingPinFor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    role: 'waiter',
    pin: '',
    email: '',
    phone: '',
    is_active: true
  });

  const [pinData, setPinData] = useState({
    new_pin: '',
    confirm_pin: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('pos_token');
      const response = await fetch('/api/admin/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('pos_token');
      const url = editingEmployee 
        ? `/api/admin/employees/${editingEmployee.id}`
        : '/api/admin/employees';
      
      const response = await fetch(url, {
        method: editingEmployee ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchEmployees();
        setShowForm(false);
        setEditingEmployee(null);
        setFormData({
          username: '',
          full_name: '',
          role: 'waiter',
          pin: '',
          email: '',
          phone: '',
          is_active: true
        });
        alert(editingEmployee ? 'Employee updated successfully' : 'Employee added successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save employee');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save employee');
    }
  };

  const handlePinChange = async (e) => {
    e.preventDefault();
    
    if (pinData.new_pin !== pinData.confirm_pin) {
      alert('PINs do not match');
      return;
    }

    if (pinData.new_pin.length !== 4) {
      alert('PIN must be 4 digits');
      return;
    }

    try {
      const token = localStorage.getItem('pos_token');
      const response = await fetch(`/api/admin/employees/${changingPinFor.id}/pin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ pin: pinData.new_pin })
      });

      if (response.ok) {
        alert('PIN changed successfully');
        setShowPinModal(false);
        setChangingPinFor(null);
        setPinData({ new_pin: '', confirm_pin: '' });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to change PIN');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to change PIN');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      username: employee.username,
      full_name: employee.full_name,
      role: employee.role,
      pin: '', // Don't pre-fill PIN for security
      email: employee.email || '',
      phone: employee.phone || '',
      is_active: employee.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      const token = localStorage.getItem('pos_token');
      const response = await fetch(`/api/admin/employees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        fetchEmployees();
        alert('Employee deleted successfully');
      } else {
        alert('Failed to delete employee');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete employee');
    }
  };

  const filteredEmployees = employees.filter(e =>
    e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleColors = {
    admin: 'bg-purple-100 text-purple-800',
    cashier: 'bg-blue-100 text-blue-800',
    waiter: 'bg-green-100 text-green-800',
    kitchen: 'bg-orange-100 text-orange-800'
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Employee Management</h1>
              <p className="text-gray-700 mt-1">Manage staff members and access</p>
            </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingEmployee(null);
              setFormData({
                username: '',
                full_name: '',
                role: 'waiter',
                pin: '',
                email: '',
                phone: '',
                is_active: true
              });
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            <Plus className="w-5 h-5" />
            <span>Add Employee</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-700 w-5 h-5" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-900"
            />
          </div>
        </div>

        {/* Employee Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Username *</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 text-gray-900"
                      disabled={!!editingEmployee}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Role *</label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 text-gray-900"
                    >
                      <option value="waiter">Waiter</option>
                      <option value="cashier">Cashier</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {editingEmployee ? 'PIN (leave empty to keep current)' : 'PIN (4 digits) *'}
                    </label>
                    <input
                      type="password"
                      required={!editingEmployee}
                      maxLength={4}
                      pattern="[0-9]{4}"
                      value={formData.pin}
                      onChange={(e) => setFormData({...formData, pin: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 text-gray-900"
                      placeholder="4 digit PIN"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-400"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                  >
                    {editingEmployee ? 'Update' : 'Create'} Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingEmployee(null);
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PIN Change Modal */}
        {showPinModal && changingPinFor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">
                  Change PIN for {changingPinFor.full_name}
                </h2>
              </div>
              
              <form onSubmit={handlePinChange} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">New PIN (4 digits) *</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    pattern="[0-9]{4}"
                    value={pinData.new_pin}
                    onChange={(e) => setPinData({...pinData, new_pin: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 text-gray-900"
                    placeholder="Enter new PIN"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Confirm PIN *</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    pattern="[0-9]{4}"
                    value={pinData.confirm_pin}
                    onChange={(e) => setPinData({...pinData, confirm_pin: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 text-gray-900"
                    placeholder="Confirm new PIN"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                  >
                    Change PIN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPinModal(false);
                      setChangingPinFor(null);
                      setPinData({ new_pin: '', confirm_pin: '' });
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Employees Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Employee</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Username</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map(employee => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{employee.full_name}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{employee.username}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[employee.role]}`}>
                      {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {employee.email && <div>{employee.email}</div>}
                    {employee.phone && <div>{employee.phone}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      employee.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setChangingPinFor(employee);
                          setShowPinModal(true);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Change PIN"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(employee)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-800">No employees found</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </AdminLayout>
  );
}
