import { NextResponse } from 'next/server';
import Database from '@/lib/db/index';

export async function GET(request) {
  try {
    const db = Database.getInstance().db;
    
    // Check if category column exists, if not add it
    const tableInfo = db.prepare('PRAGMA table_info(menu_items)').all();
    const hasCategory = tableInfo.some(col => col.name === 'category');
    
    if (!hasCategory) {
      db.prepare('ALTER TABLE menu_items ADD COLUMN category TEXT DEFAULT "Uncategorized"').run();
    }
    
    // Get unique categories from menu_items
    const categories = db.prepare(`
      SELECT DISTINCT category as name
      FROM menu_items
      WHERE is_available = 1 AND category IS NOT NULL
      ORDER BY category
    `).all();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
