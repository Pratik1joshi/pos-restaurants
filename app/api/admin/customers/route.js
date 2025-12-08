import { NextResponse } from 'next/server';
import Database from '@/lib/db/index';

export async function GET(request) {
  try {
    const db = Database.getInstance().db;
    
    const customers = db.prepare(`
      SELECT 
        c.*,
        COALESCE(SUM(CASE WHEN cp.status = 'pending' THEN cp.amount ELSE 0 END), 0) as credit_balance
      FROM customers c
      LEFT JOIN credit_payments cp ON c.id = cp.customer_id
      GROUP BY c.id
      ORDER BY c.name
    `).all();

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const db = Database.getInstance().db;

    // Check if customers table exists, if not create it
    db.prepare(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT,
        credit_limit REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    const result = db.prepare(`
      INSERT INTO customers (name, phone, email, address, credit_limit)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      data.name,
      data.phone || null,
      data.email || null,
      data.address || null,
      data.credit_limit || 0
    );

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({ 
      message: 'Customer created successfully',
      customer 
    }, { status: 201 });
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const db = Database.getInstance().db;

    db.prepare(`
      UPDATE customers 
      SET name = ?, phone = ?, email = ?, address = ?, credit_limit = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      data.name,
      data.phone || null,
      data.email || null,
      data.address || null,
      data.credit_limit || 0,
      data.id
    );

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(data.id);

    return NextResponse.json({ 
      message: 'Customer updated successfully',
      customer 
    });
  } catch (error) {
    console.error('Update customer error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const db = Database.getInstance().db;
    db.prepare('DELETE FROM customers WHERE id = ?').run(id);

    return NextResponse.json({ 
      message: 'Customer deleted successfully' 
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
