import { NextResponse } from 'next/server';
import Database from '@/lib/db/index';

export async function POST(request) {
  try {
    const data = await request.json();
    const db = Database.getInstance().db;

    // Start transaction
    const createOrder = db.transaction((orderData) => {
      // Insert order
      const orderResult = db.prepare(`
        INSERT INTO orders (
          order_number, customer_name, customer_phone, 
          total, discount, tax, final_total,
          payment_method, amount_paid, change_amount,
          status, order_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        orderData.order_number,
        orderData.customer_name,
        orderData.customer_phone || null,
        orderData.total,
        orderData.discount,
        orderData.tax,
        orderData.final_total,
        orderData.payment_method,
        orderData.amount_paid,
        orderData.change_amount,
        orderData.status,
        orderData.order_type
      );

      const orderId = orderResult.lastInsertRowid;

      // Insert order items
      const insertItem = db.prepare(`
        INSERT INTO order_items (
          order_id, menu_item_id, menu_item_name,
          quantity, price, subtotal, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'completed')
      `);

      for (const item of orderData.items) {
        insertItem.run(
          orderId,
          item.menu_item_id,
          item.menu_item_name,
          item.quantity,
          item.price,
          item.subtotal
        );
      }

      return orderId;
    });

    const orderId = createOrder(data);

    return NextResponse.json({ 
      message: 'Order created successfully',
      orderId 
    }, { status: 201 });
  } catch (error) {
    console.error('Create billing order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
