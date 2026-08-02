import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { buildInvoiceEmailHtml } from "../src/utils/invoiceEmailTemplate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const recipient = process.argv[2]?.trim() || "ikramul.web@gmail.com";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: (process.env.SMTP_ENCRYPTION || "SSL").toLowerCase() === "ssl",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendDummyInvoiceEmail = async () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error("SMTP credentials are not configured in the environment");
  }

  await transporter.verify();

  const invoiceNumber = "INV-1001";
  const invoiceData = {
    invoiceNumber,
    createdDate: "02 Aug 2026",
    dueDate: "09 Aug 2026",
    sellerName: "Decantre",
    sellerAddress: "House 20, Rd 10, Uttara, Dhaka 1230",
    buyerName: "Dummy Customer",
    buyerAddress: "Dummy Address",
    buyerEmail: recipient,
    paymentMethod: "Bank Transfer",
    paymentReference: "DUMMY-001",
    items: [
      { description: "Sample product", price: "$100.00", total: "$100.00" },
      { description: "Shipping", price: "$15.00", total: "$15.00" },
    ],
    subtotal: "$115.00",
    taxes: "$0.00",
    discount: "$0.00",
    total: "$115.00",
    invoiceUrl: "https://example.com/invoice/INV-1001",
    notes: "This is a dummy invoice generated for testing.",
    logoUrl: "https://sparksuite.github.io/simple-html-invoice-template/images/logo.png",
  };

  const html = buildInvoiceEmailHtml(invoiceData);
  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: recipient,
    subject: `Invoice ${invoiceNumber}`,
    text: `Dummy invoice ${invoiceNumber}`,
    html,
  });

  console.log(`Dummy invoice email sent successfully to ${recipient}`);
  console.log(`Message ID: ${info.messageId}`);
};

sendDummyInvoiceEmail().catch((error) => {
  console.error("Failed to send dummy invoice email:", error.message);
  process.exit(1);
});
