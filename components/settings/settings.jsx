'use client'

import { useState } from 'react'
import { Save, Download, Upload } from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState({
    businessName: 'My Retail Store',
    businessPhone: '+1-800-RETAIL',
    vat: 15,
    printFormat: 'thermal',
    currency: 'USD'
  })

  const handleSave = () => {
    alert('Settings saved successfully!')
  }

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-3xl font-bold">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Business Details */}
          <div className="pos-stat-card">
            <h3 className="text-xl font-bold mb-6 text-foreground">Business Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Business Name</label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Business Phone</label>
                <input
                  type="tel"
                  value={settings.businessPhone}
                  onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">VAT Percentage (%)</label>
                <input
                  type="number"
                  value={settings.vat}
                  onChange={(e) => setSettings({ ...settings, vat: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input"
                />
              </div>
            </div>
          </div>

          {/* Print Settings */}
          <div className="pos-stat-card">
            <h3 className="text-xl font-bold mb-6 text-foreground">Print Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Print Format</label>
                <select
                  value={settings.printFormat}
                  onChange={(e) => setSettings({ ...settings, printFormat: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input"
                >
                  <option value="thermal">Thermal (80mm)</option>
                  <option value="a4">A4 Paper</option>
                  <option value="a5">A5 Paper</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="pos-button-primary px-8 py-3 rounded-lg font-semibold flex items-center gap-2 w-full justify-center"
          >
            <Save size={20} />
            Save Settings
          </button>
        </div>

        {/* Data Management */}
        <div className="space-y-4">
          <div className="pos-stat-card">
            <h3 className="text-lg font-bold mb-4">Data Management</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 border border-border px-4 py-3 rounded-lg hover:bg-muted transition-colors font-semibold">
                <Download size={18} />
                Backup Data
              </button>
              <button className="w-full flex items-center justify-center gap-2 border border-border px-4 py-3 rounded-lg hover:bg-muted transition-colors font-semibold">
                <Upload size={18} />
                Restore Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
