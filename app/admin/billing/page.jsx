'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/admin-layout';
import { Search, Plus, Minus, ShoppingCart, Trash2, Wallet, CreditCard, Building2, QrCode } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

export default function AdminBilling() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [discount, setDiscount] = useState(0);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [settings, setSettings] = useState({
    vat_percentage: 13,
    service_charge_percentage: 10,
    esewa_qr_image: '',
    bank_qr_image: '',
    restaurant_name: '',
    restaurant_address: '',
    vat_number: '',
    pan_number: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('pos_token');
      const response = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSettings({
          vat_percentage: data.settings.vat_percentage || 13,
          service_charge_percentage: data.settings.service_charge_percentage || 10,
          esewa_qr_image: data.settings.esewa_qr_image || '',
          bank_qr_image: data.settings.bank_qr_image || '',
          restaurant_name: data.settings.restaurant_name || 'Restaurant',
          restaurant_address: data.settings.restaurant_address || '',
          vat_number: data.settings.vat_number || '',
          pan_number: data.settings.pan_number || ''
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('pos_token');
      const response = await fetch('/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products.filter(p => p.is_available));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, change) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  const calculateTax = () => {
    return (calculateSubtotal() - calculateDiscount()) * ((settings.vat_percentage || 13) / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };

  const calculateChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    const total = calculateTotal();
    return paid - total;
  };



  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || total;

    if (paymentMethod === 'cash' && paid < total) {
      alert('Insufficient payment amount');
      return;
    }

    try {
      const token = localStorage.getItem('pos_token');
      const orderData = {
        order_number: `ORD-${Date.now()}`,
        bill_number: `BILL-${Date.now()}`,
        customer_name: customerName,
        customer_phone: '',
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        tax: calculateTax(),
        tax_percent: settings.vat_percentage || 13,
        final_total: total,
        payment_method: paymentMethod,
        amount_paid: paid,
        change_amount: paymentMethod === 'cash' ? calculateChange() : 0,
        order_type: 'takeaway',
        items: cart.map(item => ({
          menu_item_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        }))
      };

      const response = await fetch('/api/admin/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Print thermal bill
        printThermalBill({
          bill_number: orderData.bill_number,
          order_number: orderData.order_number,
          customer_name: customerName,
          items: orderData.items,
          subtotal: orderData.subtotal,
          discount: orderData.discount,
          tax: orderData.tax,
          tax_percent: orderData.tax_percent,
          total: orderData.final_total,
          payment_method: paymentMethod,
          amount_paid: paid,
          change: orderData.change_amount,
          date: new Date().toLocaleString('en-NP', { timeZone: 'Asia/Kathmandu' }),
          restaurant_name: settings.restaurant_name,
          restaurant_address: settings.restaurant_address,
          vat_number: settings.vat_number,
          pan_number: settings.pan_number
        });
        
        alert('Sale completed successfully!');
        setCart([]);
        setAmountPaid('');
        setDiscount(0);
        setPaymentMethod('cash');
        setCustomerName('Walk-in Customer');
      } else {
        const errorData = await response.json();
        alert('Failed to complete sale: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order');
    }
  };

  const printThermalBill = (billData) => {
    const printWindow = window.open('', '', 'width=300,height=600');
    
    const billHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bill - ${billData.bill_number}</title>
        <style>
          @media print {
            @page {
              size: 80mm auto;
              margin: 0mm;
            }
            body {
              margin: 0;
              padding: 3mm;
            }
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            width: 80mm;
            max-width: 80mm;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            padding: 3mm;
            line-height: 1.3;
            background: white;
          }
          table, .header, .bill-info, .totals, .payment-info, .footer {
            page-break-inside: auto;
          }
          .header {
            text-align: center;
            margin-bottom: 5px;
            border-bottom: 1px dashed #000;
            padding-bottom: 5px;
          }
          .shop-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 2px;
          }
          .bill-info {
            margin: 5px 0;
            font-size: 10px;
          }
          .bill-info div {
            margin: 2px 0;
          }
          table {
            width: 100%;
            margin: 5px 0;
            border-collapse: collapse;
          }
          th {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 3px 0;
            text-align: left;
            font-size: 10px;
          }
          td {
            padding: 2px 0;
            font-size: 10px;
          }
          .item-name {
            width: 50%;
          }
          .item-qty {
            width: 15%;
            text-align: center;
          }
          .item-price {
            width: 17.5%;
            text-align: right;
          }
          .item-total {
            width: 17.5%;
            text-align: right;
          }
          .totals {
            border-top: 1px dashed #000;
            margin-top: 5px;
            padding-top: 3px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
            font-size: 10px;
          }
          .grand-total {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 5px 0;
            margin: 5px 0;
            font-size: 13px;
            font-weight: bold;
          }
          .payment-info {
            margin: 5px 0;
            font-size: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 8px;
            border-top: 1px dashed #000;
            padding-top: 5px;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="shop-name">${billData.restaurant_name || 'RESTAURANT POS'}</div>
          ${billData.restaurant_address ? `<div style="font-size: 10px; margin-top: 3px;">${billData.restaurant_address}</div>` : ''}
          ${billData.vat_number ? `<div style="font-size: 9px; margin-top: 2px;">VAT: ${billData.vat_number}</div>` : ''}
          ${billData.pan_number ? `<div style="font-size: 9px;">PAN: ${billData.pan_number}</div>` : ''}
          <div style="margin-top: 5px;">Tax Invoice</div>
        </div>

        <div class="bill-info">
          <div><strong>Bill No:</strong> ${billData.bill_number}</div>
          <div><strong>Order No:</strong> ${billData.order_number}</div>
          <div><strong>Date:</strong> ${billData.date}</div>
          <div><strong>Customer:</strong> ${billData.customer_name}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="item-name">Item</th>
              <th class="item-qty">Qty</th>
              <th class="item-price">Price</th>
              <th class="item-total">Total</th>
            </tr>
          </thead>
          <tbody>
            ${billData.items.map(item => `
              <tr>
                <td class="item-name">${item.name}</td>
                <td class="item-qty">${item.quantity}</td>
                <td class="item-price">Rs ${item.price.toFixed(2)}</td>
                <td class="item-total">Rs ${item.subtotal.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>Rs ${billData.subtotal.toFixed(2)}</span>
          </div>
          ${billData.discount > 0 ? `
          <div class="total-row">
            <span>Discount:</span>
            <span>- Rs ${billData.discount.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="total-row">
            <span>Tax (${billData.tax_percent}%):</span>
            <span>Rs ${billData.tax.toFixed(2)}</span>
          </div>
          <div class="total-row grand-total">
            <span>GRAND TOTAL:</span>
            <span>Rs ${billData.total.toFixed(2)}</span>
          </div>
        </div>

        <div class="payment-info">
          <div class="total-row">
            <span><strong>Payment Method:</strong></span>
            <span>${billData.payment_method.toUpperCase()}</span>
          </div>
          ${billData.payment_method === 'cash' ? `
          <div class="total-row">
            <span>Amount Paid:</span>
            <span>Rs ${billData.amount_paid.toFixed(2)}</span>
          </div>
          ${billData.change > 0 ? `
          <div class="total-row">
            <span>Change:</span>
            <span>Rs ${billData.change.toFixed(2)}</span>
          </div>
          ` : ''}
          ` : ''}
        </div>

        <div class="footer">
          <div>Thank you for your visit!</div>
          <div>Please come again</div>
        </div>

        <div style="height: 10mm;"></div>

        <script>
          // Prevent double printing
          let printed = false;
          
          // Single print trigger
          window.onload = function() {
            if (!printed) {
              printed = true;
              window.focus();
              window.print();
              // Close after user finishes printing
              setTimeout(() => {
                window.close();
              }, 500);
            }
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(billHTML);
    printWindow.document.close();
    printWindow.focus();
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex h-screen overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 to-white">
          <header className="bg-white border-b-2 border-blue-200 px-8 py-6 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Point of Sale</h1>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-600 w-6 h-6" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-500 text-slate-900 text-lg"
              />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-xl border-2 border-blue-100 p-5 hover:shadow-xl hover:border-blue-400 transition-all transform hover:scale-105"
                >
                  <div className="aspect-square bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl mb-3 flex items-center justify-center">
                    <ShoppingCart className="w-14 h-14 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1 truncate">{product.name}</h3>
                  <p className="text-xs text-slate-600 mb-2">{product.category}</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(product.price || 0)}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-[500px] bg-white border-l-2 border-blue-200 flex flex-col shadow-xl">
          <div className="p-6 border-b-2 border-blue-100 bg-gradient-to-r from-blue-50 to-white flex-shrink-0">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Current Bill</h2>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
              className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
            />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="text-center text-slate-500 py-20">
                <ShoppingCart className="w-20 h-20 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-semibold">Cart is empty</p>
                <p className="text-sm">Add items to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-2">
                        <h4 className="font-bold text-slate-900 text-sm mb-0.5">{item.name}</h4>
                        <p className="text-xs text-blue-600 font-semibold">{formatCurrency(item.price || 0)} each</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-blue-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded-lg bg-white border-2 border-blue-300 flex items-center justify-center hover:bg-blue-100 font-bold text-blue-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-bold text-lg text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-lg bg-white border-2 border-blue-300 flex items-center justify-center hover:bg-blue-100 font-bold text-blue-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-bold text-lg text-blue-600">
                        {formatCurrency((item.price || 0) * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-shrink-0 border-t-2 border-blue-200 max-h-[45vh] overflow-y-auto">
          <div className="p-6 space-y-4 bg-gradient-to-r from-blue-50 to-white">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discount || ''}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 font-semibold"
                placeholder="0"
              />
            </div>

            <div className="space-y-2 text-sm bg-white rounded-xl p-4 border-2 border-blue-100">
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium">Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrency(calculateSubtotal())}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="font-medium">Discount ({discount}%)</span>
                  <span className="font-bold">- {formatCurrency(calculateDiscount())}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium">Tax ({settings.vat_percentage}%)</span>
                <span className="font-bold text-slate-900">{formatCurrency(calculateTax())}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-3 border-t-2 border-blue-200">
                <span className="text-slate-900">Total</span>
                <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-blue-200 hover:border-blue-400'
                  }`}
                >
                  <Wallet className="w-6 h-6 mx-auto mb-2" />
                  <span className="font-bold text-sm">Cash</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('online')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'online'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-blue-200 hover:border-blue-400'
                  }`}
                >
                  <QrCode className="w-6 h-6 mx-auto mb-2" />
                  <span className="font-bold text-sm">eSewa / Bank</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-blue-200 hover:border-blue-400'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mx-auto mb-2" />
                  <span className="font-bold text-sm">Card</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('credit')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'credit'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-blue-200 hover:border-blue-400'
                  }`}
                >
                  <Building2 className="w-6 h-6 mx-auto mb-2" />
                  <span className="font-bold text-sm">Credit</span>
                </button>
              </div>
            </div>

            {/* Cash Payment Details */}
            {paymentMethod === 'cash' && (
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Amount Received</label>
                <input
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold text-xl"
                  placeholder="0.00"
                />
                {amountPaid && calculateChange() >= 0 && (
                  <div className="mt-2 bg-green-50 border-2 border-green-200 rounded-lg p-3">
                    <p className="text-green-800 font-semibold">
                      Change: <span className="font-bold text-lg">{formatCurrency(calculateChange())}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Online Payment QR Codes */}
            {paymentMethod === 'online' && (
              <div className="space-y-3">
                {settings.esewa_qr_image && (
                  <div className="bg-white rounded-lg border-2 border-blue-200 p-4 text-center">
                    <p className="font-bold text-slate-900 mb-2">eSewa QR Code</p>
                    <img 
                      src={settings.esewa_qr_image} 
                      alt="eSewa QR" 
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  </div>
                )}
                {settings.bank_qr_image && (
                  <div className="bg-white rounded-lg border-2 border-blue-200 p-4 text-center">
                    <p className="font-bold text-slate-900 mb-2">Bank QR Code</p>
                    <img 
                      src={settings.bank_qr_image} 
                      alt="Bank QR" 
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  </div>
                )}
                {!settings.esewa_qr_image && !settings.bank_qr_image && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-yellow-800 font-semibold">No QR codes configured in settings</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setCart([])}
                disabled={cart.length === 0}
                className="flex-1 py-3 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all border-2 border-red-200"
              >
                Clear
              </button>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                Complete Sale
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
