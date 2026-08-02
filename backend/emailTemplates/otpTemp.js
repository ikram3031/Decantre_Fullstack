/**
 * Builds a professional, luxury-themed HTML email template for OTP verification.
 *
 * @param {Object} params
 * @param {string} params.name - The recipient's name
 * @param {string} params.otp - The One-Time Password
 * @param {string} [params.type] - Context: "registration" | "forgot-password" (default: "registration")
 * @param {string} [params.logoUrl] - URL of the Decantre logo
 * @returns {string} HTML email string
 */
export const buildOtpEmailHtml = ({
  name,
  otp,
  type = "registration",
  logoUrl = "https://server.decantrebd.com/uploads/logo.webp",
}) => {
  const finalName = name || "Valued Customer";

  const isForgotPassword = type === "forgot-password";

  const title = isForgotPassword ? "Password Reset Request" : "Verification Required";
  const bodyText = isForgotPassword
    ? "We received a request to reset your Decantre account password. Use the OTP below to proceed. If you did not request this, you can safely ignore this email."
    : "Thank you for choosing Decantre. To complete your account verification, please use the One-Time Password (OTP) provided below:";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #F5F5F5;
      color: #333333;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #F5F5F5;
      padding-top: 40px;
      padding-bottom: 40px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #EAEAEA;
    }
    .header {
      background-color: #050505;
      padding: 30px 20px;
      text-align: center;
      border-bottom: 3px solid #C5A059;
    }
    .logo {
      max-height: 50px;
      vertical-align: middle;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
      line-height: 1.6;
    }
    .title {
      font-family: 'Marcellus', 'Georgia', serif;
      font-size: 24px;
      color: #050505;
      margin-top: 0;
      margin-bottom: 20px;
      font-weight: 500;
      letter-spacing: 1px;
    }
    .greeting {
      font-size: 16px;
      color: #555555;
      margin-bottom: 25px;
      text-align: left;
    }
    .message-text {
      font-size: 15px;
      color: #666666;
      margin-bottom: 30px;
      text-align: left;
    }
    .otp-container {
      margin: 30px 0;
      padding: 20px;
      background-color: #FAF7F2;
      border: 1px dashed #C5A059;
      border-radius: 6px;
      display: inline-block;
    }
    .otp-code {
      font-size: 32px;
      font-weight: 700;
      color: #C5A059;
      letter-spacing: 8px;
      margin: 0;
      padding-left: 8px;
    }
    .expiry-text {
      font-size: 13px;
      color: #888888;
      margin-top: 10px;
      font-style: italic;
    }
    .security-notice {
      font-size: 12px;
      color: #999999;
      border-top: 1px solid #EEEEEE;
      margin-top: 40px;
      padding-top: 20px;
      text-align: left;
    }
    .footer {
      background-color: #0A0A0A;
      padding: 30px 20px;
      text-align: center;
      font-size: 12px;
      color: #777777;
      border-top: 1px solid #151515;
    }
    .footer a {
      color: #C5A059;
      text-decoration: none;
    }
    .footer p {
      margin: 8px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img class="logo" src="${logoUrl}" alt="Decantre Logo" />
      </div>
      <div class="content">
        <h1 class="title">${title}</h1>
        <p class="greeting">Hello ${finalName},</p>
        <p class="message-text">${bodyText}</p>
        <div class="otp-container">
          <div class="otp-code">${otp}</div>
        </div>
        <p class="expiry-text">This code will expire in 10 minutes.</p>
        <p class="security-notice">
          If you did not request this, please ignore this email or contact our support team if you suspect unauthorized activity.
        </p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} <a href="https://decantre.com">Decantre</a>. All rights reserved.</p>
        <p>Premium Fragrance Decants &amp; Luxuries</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};
