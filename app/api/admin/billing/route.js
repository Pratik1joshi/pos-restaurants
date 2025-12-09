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
          status, order_type
        ) VALUES (?, ?, ?, ?, ?)
      `).run(
        orderData.order_number,
        orderData.customer_name,
        orderData.customer_phone || null,
        'served',
        orderData.order_type
      );

      const orderId = orderResult.lastInsertRowid;

      // Insert order items
      const insertItem = db.prepare(`
        INSERT INTO order_items (
          order_id, menu_item_id,
          quantity, unit_price, subtotal, status
        ) VALUES (?, ?, ?, ?, ?, 'served')
      `);

      for (const item of orderData.items) {
        insertItem.run(
          orderId,
          item.menu_item_id,
          item.quantity,
          item.price,
          item.subtotal
        );
      }

      // Create bill
      const billResult = db.prepare(`
        INSERT INTO bills (
          bill_number, order_id,
          subtotal, service_charge, service_charge_percent,
          tax, tax_percent,
          discount_amount, discount_type,
          grand_total, status, cashier_id, paid_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?, CURRENT_TIMESTAMP)
      `).run(
        orderData.bill_number,
        orderId,
        orderData.subtotal,
        0,
        0,
        orderData.tax,
        orderData.tax_percent,
        orderData.discount,
        orderData.discount > 0 ? 'amount' : null,
        orderData.final_total,
        orderData.cashier_id || null
      );

      const billId = billResult.lastInsertRowid;

      // Insert payment
      db.prepare(`
        INSERT INTO bill_payments (
          bill_id, payment_method, amount, notes
        ) VALUES (?, ?, ?, ?)
      `).run(
        billId,
        orderData.payment_method === 'online' ? 'qr' : orderData.payment_method,
        orderData.amount_paid,
        orderData.payment_method === 'cash' && orderData.change_amount > 0 
          ? `Change: ${orderData.change_amount}` 
          : null
      );

      return { orderId, billId };
    });

    const result = createOrder(data);

    return NextResponse.json({ 
      message: 'Order created successfully',
      ...result
    }, { status: 201 });
  } catch (error) {
    console.error('Create billing order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
