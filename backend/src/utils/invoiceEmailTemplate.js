export const buildInvoiceEmailHtml = ({
  invoiceNumber,
  issueDate,
  shippingName,
  shippingAddress,
  shippingPhone,
  items,
  subtotal,
  taxes,
  discount,
  total,
  invoiceUrl,
}) => {
  const sellerName = "Decantre";
  const sellerAddress = "House 20, Rd 10, Uttara, Dhaka 1230";

  const itemsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 12px;">${item.description}</td>
        <td style="padding: 12px; text-align: right;">${item.price}</td>
        <td style="padding: 12px; text-align: right;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">${item.total}</td>
      </tr>
    `,
    )
    .join("");

  return `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 700px; margin: 0 auto; background: #f5f7fb; padding: 24px;">
    <div style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.08);">
      <div style="background: #ffffff; padding: 24px 32px; border-bottom: 1px solid #eaeaea; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 14px; font-weight: 700; color: #222; letter-spacing: 1px;">YOUR LOGO</div>
          <div style="margin-top: 6px; color: #666; font-size: 12px;">Invoice</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 14px; color: #999;">INVOICE NO.</div>
          <div style="font-size: 18px; font-weight: 700; color: #1b6ec2; margin-top: 4px;">${invoiceNumber}</div>
        </div>
      </div>

      <div style="padding: 24px 32px;">
        <div style="display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 220px;">
            <div style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Supplier</div>
            <h3 style="margin: 8px 0 4px; color: #222;">${sellerName}</h3>
            <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">${sellerAddress}</p>
          </div>
          <div style="flex: 1; min-width: 220px;">
            <div style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Shipping Address</div>
            <h3 style="margin: 8px 0 4px; color: #222;">${shippingName}</h3>
            <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">${shippingAddress}</p>
            ${shippingPhone ? `<p style="margin: 8px 0 0; color: #555; font-size: 14px; line-height: 1.6;">Phone: ${shippingPhone}</p>` : ""}
          </div>
        </div>

        <div style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 20px; flex-wrap: wrap;">
          <div style="text-align: right;">
            <div style="font-size: 12px; color: #999;">Issue Date</div>
            <div style="font-size: 16px; font-weight: 700; color: #222;">${issueDate}</div>
          </div>
        </div>
      </div>

      <div style="padding: 0 32px 24px;">
        <table style="width: 100%; border-collapse: collapse; background: #fff;">
          <thead>
            <tr style="background: #1b6ec2; color: #fff; text-align: left;">
              <th style="padding: 12px;">Item Description</th>
              <th style="padding: 12px; text-align: right;">Price</th>
              <th style="padding: 12px; text-align: right;">Quantity</th>
              <th style="padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 24px; display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: end;">
          <div>
            <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">Notes:</p>
            <p style="margin: 8px 0 0; color: #555; font-size: 13px; line-height: 1.7;">Please make payment by the due date. If you have any questions, reply to this email.</p>
          </div>
          <div style="min-width: 240px; padding: 18px; background: #f7faff; border-radius: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #555;"><span>Subtotal</span><span>${subtotal}</span></div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #555;"><span>Taxes</span><span>${taxes}</span></div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #555;"><span>Discount</span><span>${discount}</span></div>
            <div style="border-top: 1px solid #ddd; margin-top: 10px; padding-top: 10px; font-size: 16px; font-weight: 700; color: #222; display: flex; justify-content: space-between;"> <span>Total</span><span>${total}</span></div>
          </div>
        </div>

        <div style="margin-top: 28px; text-align: center;">
          <a href="${invoiceUrl}" style="display: inline-block; padding: 12px 24px; background: #1b6ec2; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700;">View this invoice online</a>
        </div>
      </div>

      <div style="background: #f1f7ff; padding: 18px 32px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="font-size: 13px; color: #777;">Need help? Reply to this email or contact support.</div>
        <div style="display: flex; gap: 10px; font-size: 13px; color: #777;">
          <span>support@yourdomain.com</span>
          <span>|</span>
          <span>+1 800 123 4567</span>
        </div>
      </div>
    </div>
  </div>
  `;
};
