/**
 * Invoice utility functions for generating printable receipts
 * and downloadable HTML invoices for orders.
 */

/**
 * Opens a new browser window with a printable receipt and triggers print dialog.
 * @param {Object} order - The order object containing orderNumber, items, total, etc.
 */
export const printInvoice = (order) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print invoices');
    return;
  }
  
  const invoiceHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${order.orderNumber}</title>
      <style>
        body { font-family: sans-serif; color: #111; margin: 0; padding: 20px; font-size: 13px; }
        .receipt-header { text-align: center; margin-bottom: 20px; }
        .receipt-title { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
        .receipt-subtitle { font-size: 11px; color: #666; }
        .divider { border-top: 1px dashed #ccc; margin: 12px 0; }
        .meta-info table { width: 100%; font-size: 12px; }
        .meta-info td { padding: 2px 0; }
        .items-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .items-table th { text-align: left; border-bottom: 1px dashed #ccc; padding-bottom: 6px; }
        .items-table td { padding: 6px 0; }
        .items-table tr.total-row td { font-weight: bold; font-size: 13px; border-top: 1px dashed #ccc; padding-top: 8px; }
        .text-right { text-align: right; }
        .footer { text-align: center; font-size: 10px; color: #555; margin-top: 30px; }
        @media print {
          body { padding: 0; }
          @page { margin: 0.5cm; }
        }
      </style>
    </head>
    <body>
      <div class="receipt-header">
        <div class="receipt-title">RETAIL STORE</div>
        <div class="receipt-subtitle">Direct Store Sale Receipt</div>
        <div class="receipt-subtitle">100 Main Street, New York, NY</div>
      </div>
      
      <div class="divider"></div>
      
      <div class="meta-info">
        <table>
          <tr>
            <td><strong>Receipt #:</strong> ${order.orderNumber}</td>
            <td class="text-right"><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td><strong>Customer:</strong> ${order.customerName}</td>
            <td class="text-right"><strong>Payment:</strong> Paid</td>
          </tr>
          <tr>
            <td colspan="2"><strong>Email:</strong> ${order.customerEmail || 'Guest'}</td>
          </tr>
        </table>
      </div>
      
      <div class="divider"></div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th class="text-right" style="width: 50px;">Qty</th>
            <th class="text-right" style="width: 80px;">Price</th>
            <th class="text-right" style="width: 80px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item) => `
            <tr>
              <td>${item.name}${item.size ? ` (${item.size})` : ''}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">৳${Number(item.price || 0).toFixed(2)}</td>
              <td class="text-right">৳${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="3" class="text-right">Total Amount:</td>
            <td colspan="2" class="text-right">৳${Number(order.total || 0).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="divider"></div>
      
      <div class="footer">
        Thank you for shopping with us!<br>
        We hope to see you again soon.<br>
        Payment via ${order.paymentMethod}
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 500);
        }
      </script>
    </body>
    </html>
  `;
  printWindow.document.write(invoiceHtml);
  printWindow.document.close();
};

/**
 * Generates and downloads a high-fidelity HTML invoice file.
 * @param {Object} order - The order object containing orderNumber, items, total, etc.
 */
export const downloadInvoice = (order) => {
  const invoiceHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice - ${order.orderNumber}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); font-size: 14px; line-height: 24px; color: #555; }
        .invoice-box table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
        .invoice-box table td { padding: 5px; vertical-align: top; }
        .invoice-box table tr td:nth-child(2) { text-align: right; }
        .invoice-box table tr.top table td { padding-bottom: 20px; }
        .invoice-box table tr.top table td.title { font-size: 24px; line-height: 24px; color: #111; font-weight: bold; letter-spacing: -0.5px; }
        .invoice-box table tr.information table td { padding-bottom: 40px; }
        .invoice-box table tr.heading td { background: #f9fafb; border-bottom: 1px solid #ddd; font-weight: bold; padding: 10px; }
        .invoice-box table tr.details td { padding-bottom: 20px; }
        .invoice-box table tr.item td { border-bottom: 1px solid #eee; padding: 12px 10px; }
        .invoice-box table tr.item.last td { border-bottom: none; }
        .invoice-box table tr.total td:nth-child(2) { border-top: 2px solid #111; font-weight: bold; font-size: 16px; padding: 15px 10px; color: #111; }
        .badge { display: inline-block; padding: 3px 10px; font-size: 11px; font-weight: bold; border-radius: 4px; text-transform: uppercase; }
        .badge-success { background: #d1fae5; color: #065f46; }
        .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <table cellpadding="0" cellspacing="0">
          <tr class="top">
            <td colspan="2">
              <table>
                <tr>
                  <td class="title">
                    STORE DIRECT SALE INVOICE
                  </td>
                  <td>
                    <strong>Invoice #:</strong> ${order.orderNumber}<br>
                    <strong>Created:</strong> ${new Date(order.date).toLocaleDateString()}<br>
                    <strong>Payment Method:</strong> ${order.paymentMethod}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr class="information">
            <td colspan="2">
              <table>
                <tr>
                  <td>
                    <strong>Store Details:</strong><br>
                    Retail Store POS Terminal<br>
                    100 Main Street<br>
                    New York, NY 10001<br>
                    support@store.com
                  </td>
                  <td>
                    <strong>Customer Details:</strong><br>
                    ${order.customerName}<br>
                    ${order.customerEmail || 'Guest Customer'}<br>
                    ${order.notes || 'No notes provided'}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr class="heading">
            <td>Payment Status</td>
            <td>Status</td>
          </tr>
          
          <tr class="details">
            <td>
              <span class="badge badge-success">Paid</span>
            </td>
            <td>
              <span class="badge badge-success">Sold Directly</span>
            </td>
          </tr>
          
          <tr class="heading">
            <td>Item</td>
            <td style="text-align: right;">Price</td>
          </tr>
          
          ${order.items.map((item) => `
            <tr class="item">
              <td>
                <strong>${item.name}${item.size ? ` (${item.size})` : ''}</strong><br>
                <span style="font-size: 11px; color: #777;">Qty: ${item.quantity} @ ৳${Number(item.price || 0).toFixed(2)} each</span>
              </td>
              <td style="text-align: right;">
                ৳${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
              </td>
            </tr>
          `).join('')}
          
          <tr class="total">
            <td></td>
            <td>Total: ৳${Number(order.total || 0).toFixed(2)}</td>
          </tr>
        </table>
        
        <div class="footer">
          Thank you for your purchase! We appreciate your business.<br>
          For any questions or returns, please contact support@store.com.
        </div>
      </div>
    </body>
    </html>
  `;

  // Create a blob and download it
  const blob = new Blob([invoiceHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Invoice-${order.orderNumber}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
