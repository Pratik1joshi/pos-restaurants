import { NextResponse } from 'next/server';
import Database from '@/lib/db/index';

export async function GET(request) {
  try {
    const db = Database.getInstance().db;
    
    // Check if system_settings table exists
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='system_settings'
    `).get();

    if (!tableExists) {
      // Create table if it doesn't exist
      db.prepare(`
        CREATE TABLE IF NOT EXISTS system_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          setting_key TEXT UNIQUE NOT NULL,
          setting_value TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      // Insert default settings
      const defaults = [
        { key: 'vat_percentage', value: '13' },
        { key: 'service_charge_percentage', value: '10' },
        { key: 'restaurant_name', value: 'Himalayan Restaurant' },
        { key: 'restaurant_address', value: 'Thamel, Kathmandu, Nepal' },
        { key: 'restaurant_phone', value: '01-4123456' },
        { key: 'restaurant_email', value: 'info@himalayan.com' },
        { key: 'vat_number', value: '123456789' },
        { key: 'currency_symbol', value: 'Rs' },
        { key: 'bank_qr_image', value: '' },
        { key: 'esewa_qr_image', value: '' }
      ];

      const insertStmt = db.prepare(`
        INSERT INTO system_settings (setting_key, setting_value) 
        VALUES (?, ?)
      `);

      for (const setting of defaults) {
        insertStmt.run(setting.key, setting.value);
      }
    }

    // Fetch all settings
    const settingsArray = db.prepare('SELECT setting_key, setting_value FROM system_settings').all();
    
    // Convert to object
    const settings = {};
    settingsArray.forEach(row => {
      const key = row.setting_key;
      let value = row.setting_value;
      
      // Convert numeric values
      if (key === 'vat_percentage' || key === 'service_charge_percentage') {
        value = parseFloat(value) || 0;
      }
      
      settings[key] = value;
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const db = Database.getInstance().db;

    // Update each setting
    const updateStmt = db.prepare(`
      UPDATE system_settings 
      SET setting_value = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE setting_key = ?
    `);

    for (const [key, value] of Object.entries(data)) {
      updateStmt.run(String(value), key);
    }

    return NextResponse.json({ 
      message: 'Settings updated successfully' 
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
