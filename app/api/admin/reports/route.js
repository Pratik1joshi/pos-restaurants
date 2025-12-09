import { NextResponse } from 'next/server';
import Database from '@/lib/db/index';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = Database.getInstance().db;
    let dateCondition = '';
    let params = [];

    // Build date condition based on period
    if (period === 'today') {
      const today = new Date().toISOString().split('T')[0];
      dateCondition = 'DATE(o.created_at) = ?';
      params = [today];
    } else if (period === 'week') {
      // Last 7 days including today
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 6); // -6 to include today = 7 days
      dateCondition = 'DATE(o.created_at) BETWEEN ? AND ?';
      params = [weekAgo.toISOString().split('T')[0], today.toISOString().split('T')[0]];
    } else if (period === 'month') {
      // Last 30 days including today
      const today = new Date();
      const monthAgo = new Date();
      monthAgo.setDate(today.getDate() - 29); // -29 to include today = 30 days
      dateCondition = 'DATE(o.created_at) BETWEEN ? AND ?';
      params = [monthAgo.toISOString().split('T')[0], today.toISOString().split('T')[0]];
    } else if (period === 'custom' && startDate && endDate) {
      dateCondition = 'DATE(o.created_at) BETWEEN ? AND ?';
      params = [startDate, endDate];
    } else {
      dateCondition = '1=1'; // All time
    }

    // Get total sales and orders
    const summaryQuery = `
      SELECT 
        COALESCE(SUM(b.grand_total), 0) as totalSales,
        COUNT(DISTINCT b.id) as totalOrders,
        COUNT(DISTINCT o.customer_name) as uniqueCustomers,
        CASE 
          WHEN COUNT(DISTINCT b.id) > 0 
          THEN SUM(b.grand_total) / COUNT(DISTINCT b.id)
          ELSE 0 
        END as avgOrderValue
      FROM bills b
      LEFT JOIN orders o ON b.order_id = o.id
      WHERE ${dateCondition.replace(/o\./g, 'b.')}
    `;

    const summary = db.prepare(summaryQuery).get(...params);

    // Get payment methods breakdown  
    const paymentQuery = `
      SELECT 
        bp.payment_method,
        COUNT(*) as count,
        SUM(bp.amount) as amount
      FROM bill_payments bp
      JOIN bills b ON bp.bill_id = b.id
      WHERE ${dateCondition.replace(/o\./g, 'b.')} AND bp.payment_method IS NOT NULL
      GROUP BY bp.payment_method
    `;

    const paymentData = db.prepare(paymentQuery).all(...params);
    
    const paymentMethods = {};
    paymentData.forEach(row => {
      paymentMethods[row.payment_method] = {
        count: row.count,
        amount: row.amount
      };
    });

    // Get top selling items
    const topItemsQuery = `
      SELECT 
        mi.name as name,
        SUM(oi.quantity) as quantity,
        SUM(oi.subtotal) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN bills b ON b.order_id = o.id
      WHERE ${dateCondition.replace(/o\./g, 'b.')}
      GROUP BY mi.name
      ORDER BY revenue DESC
      LIMIT 10
    `;

    const topItems = db.prepare(topItemsQuery).all(...params);

    return NextResponse.json({
      totalSales: summary.totalSales,
      totalOrders: summary.totalOrders,
      avgOrderValue: summary.avgOrderValue,
      uniqueCustomers: summary.uniqueCustomers,
      paymentMethods,
      topItems
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
