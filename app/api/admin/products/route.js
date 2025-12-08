import { NextResponse } from 'next/server';
import Database from '@/lib/db/index';

export async function GET(request) {
  try {
    const db = Database.getInstance().db;
    
    const products = db.prepare(`
      SELECT *, base_price as price
      FROM menu_items
      ORDER BY name
    `).all();

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const db = Database.getInstance().db;

    const result = db.prepare(`
      INSERT INTO menu_items (
        name, item_code, category, price, description, 
        is_available, is_vegetarian
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.name,
      data.item_code || `ITEM-${Date.now()}`,
      data.category || 'General',
      data.price,
      data.description || null,
      data.is_available ? 1 : 0,
      data.is_vegetarian ? 1 : 0
    );

    const product = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({ 
      message: 'Product created successfully',
      product 
    }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const db = Database.getInstance().db;

    db.prepare(`
      UPDATE menu_items 
      SET name = ?, category = ?, price = ?, 
          description = ?, is_available = ?, is_vegetarian = ?
      WHERE id = ?
    `).run(
      data.name,
      data.category || 'General',
      data.price,
      data.description || null,
      data.is_available ? 1 : 0,
      data.is_vegetarian ? 1 : 0,
      data.id
    );

    const product = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(data.id);

    return NextResponse.json({ 
      message: 'Product updated successfully',
      product 
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const db = Database.getInstance().db;
    db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);

    return NextResponse.json({ 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
