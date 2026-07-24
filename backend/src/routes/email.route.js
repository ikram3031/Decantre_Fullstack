import { Router } from "express";
import nodemailer from "nodemailer";
import { buildInvoiceEmailHtml } from "../utils/invoiceEmailTemplate.js";

const emailRouter = Router();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: (process.env.SMTP_ENCRYPTION || "SSL").toLowerCase() === "ssl",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendEmail = async ({ toEmail, subject, text, html }) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: toEmail,
    subject,
    text,
    html,
  });
};

const handleEmailRequest = async (req, res) => {
  const email = String(req.query?.email || req.body?.email || "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      status: "error",
      message: "Valid email is required",
    });
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return res.status(500).json({
      status: "error",
      message: "SMTP credentials are not configured",
    });
  }

  try {
    await sendEmail({
      toEmail: email,
      subject: "Testing successful",
      text: "Testing successful",
      html: "<p><strong>Testing successful</strong></p>",
    });

    return res.status(200).json({
      status: "success",
      message: "Email sent successfully",
      email,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to send email",
      details: error.message,
    });
  }
};

const handleInvoiceRequest = async (req, res) => {
  const email = String(req.query?.email || req.body?.email || "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      status: "error",
      message: "Valid email is required",
    });
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return res.status(500).json({
      status: "error",
      message: "SMTP credentials are not configured",
    });
  }

  const invoiceData = {
    invoiceNumber: req.body.invoiceNumber || req.query.invoiceNumber || "INV-0001",
    issueDate: req.body.issueDate || req.query.issueDate || new Date().toLocaleDateString(),
    sellerName: "Decantre",
    sellerAddress: "House 20, Rd 10, Uttara, Dhaka 1230",
    shippingName: req.body.shippingName || req.query.shippingName || "Customer",
    shippingAddress: req.body.shippingAddress || req.query.shippingAddress || "Customer Address",
    shippingPhone: req.body.shippingPhone || req.query.shippingPhone || "",
    items: req.body.items || req.query.items || [
      {
        description: "Product Name 1",
        price: "$35.00",
        quantity: 2,
        total: "$70.00",
      },
      {
        description: "Product Name 2",
        price: "$100.00",
        quantity: 1,
        total: "$100.00",
      },
    ],
    subtotal: req.body.subtotal || req.query.subtotal || "$215.00",
    taxes: req.body.taxes || req.query.taxes || "$0.00",
    discount: req.body.discount || req.query.discount || "$0.00",
    total: req.body.total || req.query.total || "$215.00",
    invoiceUrl: req.body.invoiceUrl || req.query.invoiceUrl || "https://yourdomain.com/invoice/INV-0001",
  };   

  try {
    const html = buildInvoiceEmailHtml(invoiceData);

    await sendEmail({
      toEmail: email,
      subject: `Invoice ${invoiceData.invoiceNumber}`,
      text: `Invoice ${invoiceData.invoiceNumber}`,
      html,
    });

    return res.status(200).json({
      status: "success",
      message: "Invoice email sent successfully",
      email,
      invoiceNumber: invoiceData.invoiceNumber,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to send invoice email",
      details: error.message,
    });
  }
};

emailRouter.get("/", handleEmailRequest);
emailRouter.post("/", handleEmailRequest);
emailRouter.post("/invoice", handleInvoiceRequest);

export default emailRouter;
