import { NextResponse } from 'next/server';
import Database from '@/lib/db/index';

export async function GET(request) {
  try {
    const db = Database.getInstance().db;
    
    // Get categories from menu_categories table
    const categories = db.prepare(`
      SELECT id, name, display_order
      FROM menu_categories
      WHERE is_active = 1
      ORDER BY display_order, name
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
