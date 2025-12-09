'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/admin-layout';
import { Save, Upload, X } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    vat_percentage: 13,
    service_charge_percentage: 10,
    restaurant_name: 'Himalayan Restaurant',
    restaurant_address: 'Thamel, Kathmandu, Nepal',
    restaurant_phone: '01-4123456',
    restaurant_email: 'info@himalayan.com',
    vat_number: '',
    pan_number: '',
    bank_qr_image: '',
    esewa_qr_image: '',
    currency_symbol: 'Rs'
  });

  const [qrPreviews, setQrPreviews] = useState({
    bank_qr: null,
    esewa_qr: null
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('pos_token');
      const response = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        if (data.settings.bank_qr_image) {
          setQrPreviews(prev => ({ ...prev, bank_qr: data.settings.bank_qr_image }));
        }
        if (data.settings.esewa_qr_image) {
          setQrPreviews(prev => ({ ...prev, esewa_qr: data.settings.esewa_qr_image }));
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setSettings(prev => ({
          ...prev,
          [type === 'bank' ? 'bank_qr_image' : 'esewa_qr_image']: base64
        }));
        setQrPreviews(prev => ({
          ...prev,
          [type === 'bank' ? 'bank_qr' : 'esewa_qr']: base64
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type) => {
    setSettings(prev => ({
      ...prev,
      [type === 'bank' ? 'bank_qr_image' : 'esewa_qr_image']: ''
    }));
    setQrPreviews(prev => ({
      ...prev,
      [type === 'bank' ? 'bank_qr' : 'esewa_qr']: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('pos_token');
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        alert('Settings saved successfully');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">System Settings</h1>
            <p className="text-gray-700 mt-1">Configure restaurant and billing settings</p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Restaurant Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Restaurant Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Restaurant Name</label>
                <input
                  type="text"
                  value={settings.restaurant_name}
                  onChange={(e) => setSettings({...settings, restaurant_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Address</label>
                <input
                  type="text"
                  value={settings.restaurant_address}
                  onChange={(e) => setSettings({...settings, restaurant_address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                  <input
                    type="text"
                    value={settings.restaurant_phone}
                    onChange={(e) => setSettings({...settings, restaurant_phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.restaurant_email}
                    onChange={(e) => setSettings({...settings, restaurant_email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">VAT Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter VAT number"
                    value={settings.vat_number}
                    onChange={(e) => setSettings({...settings, vat_number: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">PAN Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter PAN number"
                    value={settings.pan_number}
                    onChange={(e) => setSettings({...settings, pan_number: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Billing Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Billing Configuration</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    VAT Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.vat_percentage}
                    onChange={(e) => setSettings({...settings, vat_percentage: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 text-gray-900"
                  />
                  <p className="text-xs text-gray-700 mt-1">Current: {settings.vat_percentage}%</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Service Charge (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.service_charge_percentage}
                    onChange={(e) => setSettings({...settings, service_charge_percentage: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 text-gray-900"
                  />
                  <p className="text-xs text-gray-700 mt-1">Current: {settings.service_charge_percentage}%</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Billing Example</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>Subtotal: Rs 1000.00</div>
                  <div>VAT ({settings.vat_percentage}%): Rs {(1000 * settings.vat_percentage / 100).toFixed(2)}</div>
                  <div>Service Charge ({settings.service_charge_percentage}%): Rs {(1000 * settings.service_charge_percentage / 100).toFixed(2)}</div>
                  <div className="font-bold border-t border-blue-300 pt-1 mt-1">
                    Total: Rs {(1000 + (1000 * settings.vat_percentage / 100) + (1000 * settings.service_charge_percentage / 100)).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment QR Codes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Payment QR Codes</h2>
            <p className="text-sm text-gray-700 mb-6">Upload QR codes for digital payment methods</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bank QR */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Bank QR Code</label>
                {qrPreviews.bank_qr ? (
                  <div className="relative">
                    <img 
                      src={qrPreviews.bank_qr} 
                      alt="Bank QR" 
                      className="w-full h-64 object-contain border-2 border-gray-300 rounded-lg bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage('bank')}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50">
                    <Upload className="w-12 h-12 text-gray-600 mb-2" />
                    <span className="text-sm text-gray-800">Click to upload Bank QR</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'bank')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* eSewa QR */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">eSewa QR Code</label>
                {qrPreviews.esewa_qr ? (
                  <div className="relative">
                    <img 
                      src={qrPreviews.esewa_qr} 
                      alt="eSewa QR" 
                      className="w-full h-64 object-contain border-2 border-gray-300 rounded-lg bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage('esewa')}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50">
                    <Upload className="w-12 h-12 text-gray-600 mb-2" />
                    <span className="text-sm text-gray-800">Click to upload eSewa QR</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'esewa')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
        </div>
      </div>
    </AdminLayout>
  );
}
