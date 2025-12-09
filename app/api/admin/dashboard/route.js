import { NextResponse } from 'next/server';
import Database from '@/lib/db/index';
import { getNepaliDateString } from '@/lib/time-utils';

export async function GET(request) {
  try {
    const db = Database.getInstance().db;
    const todayNepali = getNepaliDateString(new Date());

    // Get today's sales and payments
    const todaySalesResult = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM bill_payments
      WHERE DATE(created_at) = ?
    `).get(todayNepali);

    // Get today's orders count (paid bills)
    const todayOrdersResult = db.prepare(`
      SELECT COUNT(*) as count
      FROM bills
      WHERE DATE(created_at) = ? AND status = 'paid'
    `).get(todayNepali);

    // Get total menu items count
    const productsResult = db.prepare(`
      SELECT COUNT(*) as count
      FROM menu_items
      WHERE is_available = 1
    `).get();

    // Get total employees count
    const employeesResult = db.prepare(`
      SELECT COUNT(*) as count
      FROM users
      WHERE role != 'admin'
    `).get();

    // Get weekly sales (last 7 days)
    const weeklySales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = getNepaliDateString(date);
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      
      const daySales = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM bill_payments
        WHERE DATE(created_at) = ?
      `).get(dateStr);
      
      weeklySales.push({
        day: dayName,
        sales: daySales.total || 0
      });
    }

    // Get revenue by order type (last 30 days including today)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // -29 to include today = 30 days total
    const thirtyDaysAgoStr = getNepaliDateString(thirtyDaysAgo);
    
    const revenueByType = db.prepare(`
      SELECT 
        o.order_type as order_type,
        COUNT(*) as count,
        COALESCE(SUM(b.grand_total), 0) as total
      FROM bills b
      JOIN orders o ON b.order_id = o.id
      WHERE DATE(b.created_at) >= ? AND DATE(b.created_at) <= ? AND b.status = 'paid'
      GROUP BY o.order_type
    `).all(thirtyDaysAgoStr, todayNepali);

    // Calculate total for percentages
    const totalRevenue = revenueByType.reduce((sum, r) => sum + Number(r.total || 0), 0);
    const revenueSources = revenueByType.map(r => ({
      type: String(r.order_type || 'dine-in'),
      percentage: totalRevenue > 0 ? Math.round((Number(r.total) / totalRevenue) * 100) : 0,
      amount: Number(r.total || 0)
    }));

    // Get low stock items from ingredients table
    const lowStockItems = db.prepare(`
      SELECT 
        name,
        current_stock,
        unit,
        min_stock_level
      FROM ingredients
      WHERE current_stock <= min_stock_level
      ORDER BY (current_stock - min_stock_level) ASC
      LIMIT 5
    `).all();

    // Get monthly sales (last 30 days including today)
    const thirtyDaysAgoForMonth = new Date();
    thirtyDaysAgoForMonth.setDate(thirtyDaysAgoForMonth.getDate() - 29); // -29 to include today = 30 days total
    const monthStartStr = getNepaliDateString(thirtyDaysAgoForMonth);
    
    const monthlySalesResult = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM bill_payments
      WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?
    `).get(monthStartStr, todayNepali);

    // Get last month sales for growth calculation (30 days before the current 30-day period)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 59);
    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 30);
    
    const lastMonthSalesResult = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM bill_payments
      WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?
    `).get(getNepaliDateString(sixtyDaysAgo), getNepaliDateString(thirtyOneDaysAgo));

    const growthPercent = lastMonthSalesResult.total > 0 
      ? Math.round(((monthlySalesResult.total - lastMonthSalesResult.total) / lastMonthSalesResult.total) * 100)
      : 0;

    // Calculate average order value (last 30 days)
    const avgOrderResult = db.prepare(`
      SELECT COALESCE(AVG(amount), 0) as avg
      FROM bill_payments
      WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?
    `).get(monthStartStr, todayNepali);

    // Get today's costs (mock - you can add actual costs table)
    const todayCosts = todaySalesResult.total * 0.6; // Assume 60% cost ratio

    return NextResponse.json({
      stats: {
        todaySales: todaySalesResult.total || 0,
        todayOrders: todayOrdersResult.count || 0,
        todayCosts: todayCosts,
        totalProducts: productsResult.count || 0,
        totalEmployees: employeesResult.count || 0,
        monthlySales: monthlySalesResult.total || 0,
        avgOrder: avgOrderResult.avg || 0,
        growthPercent: growthPercent,
        weeklySales: weeklySales,
        revenueSources: revenueSources,
        lowStockItems: lowStockItems.map(item => ({
          name: item.name,
          qty: item.current_stock,
          unit: item.unit,
          status: item.current_stock <= (item.min_stock_level * 0.5) ? 'critical' : 'low'
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', details: error.message },
      { status: 500 }
    );
  }
}
