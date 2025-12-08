import { NextResponse } from 'next/server';
import Database from '@/lib/db/index';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { new_pin } = await request.json();

    if (!new_pin || new_pin.length !== 4) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    const db = Database.getInstance().db;
    db.prepare('UPDATE users SET pin = ? WHERE id = ?').run(new_pin, id);

    return NextResponse.json({ 
      message: 'PIN updated successfully' 
    });
  } catch (error) {
    console.error('Update PIN error:', error);
    return NextResponse.json(
      { error: 'Failed to update PIN' },
      { status: 500 }
    );
  }
}
