import { NextResponse } from 'next/server';
import Database from '@/lib/db/index';

export async function GET(request) {
  try {
    const db = Database.getInstance().db;
    
    const employees = db.prepare(`
      SELECT id, username, full_name, role, email, phone, is_active, created_at
      FROM users
      ORDER BY created_at DESC
    `).all();

    return NextResponse.json({ employees });
  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const db = Database.getInstance().db;

    // Check if username already exists
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(data.username);
    if (existing) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    const result = db.prepare(`
      INSERT INTO users (
        username, full_name, role, pin, email, phone, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.username,
      data.full_name,
      data.role,
      data.pin,
      data.email || null,
      data.phone || null,
      data.is_active ? 1 : 0
    );

    const employee = db.prepare(`
      SELECT id, username, full_name, role, email, phone, is_active, created_at
      FROM users WHERE id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json({ 
      message: 'Employee created successfully',
      employee 
    }, { status: 201 });
  } catch (error) {
    console.error('Create employee error:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const db = Database.getInstance().db;

    // Check if username is taken by another user
    const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(data.username, data.id);
    if (existing) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Update without PIN if not provided
    if (data.pin) {
      db.prepare(`
        UPDATE users 
        SET username = ?, full_name = ?, role = ?, pin = ?, 
            email = ?, phone = ?, is_active = ?
        WHERE id = ?
      `).run(
        data.username,
        data.full_name,
        data.role,
        data.pin,
        data.email || null,
        data.phone || null,
        data.is_active ? 1 : 0,
        data.id
      );
    } else {
      db.prepare(`
        UPDATE users 
        SET username = ?, full_name = ?, role = ?, 
            email = ?, phone = ?, is_active = ?
        WHERE id = ?
      `).run(
        data.username,
        data.full_name,
        data.role,
        data.email || null,
        data.phone || null,
        data.is_active ? 1 : 0,
        data.id
      );
    }

    const employee = db.prepare(`
      SELECT id, username, full_name, role, email, phone, is_active, created_at
      FROM users WHERE id = ?
    `).get(data.id);

    return NextResponse.json({ 
      message: 'Employee updated successfully',
      employee 
    });
  } catch (error) {
    console.error('Update employee error:', error);
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const db = Database.getInstance().db;
    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    return NextResponse.json({ 
      message: 'Employee deleted successfully' 
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
