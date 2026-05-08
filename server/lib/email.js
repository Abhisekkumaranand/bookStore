import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const BASE_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ─── Templates ───────────────────────────────────────────────────────────────

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>BookVista</title>
  <style>
    body { margin:0; padding:0; font-family: 'Segoe UI', Arial, sans-serif; background:#f4f4f4; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); }
    .header { background:linear-gradient(135deg,#6366f1,#10b981); padding:32px 40px; text-align:center; }
    .header h1 { margin:0; color:#fff; font-size:28px; letter-spacing:1px; }
    .header p { margin:4px 0 0; color:rgba(255,255,255,0.85); font-size:13px; }
    .body { padding:36px 40px; color:#333; line-height:1.7; }
    .body h2 { margin-top:0; color:#1a1a1a; }
    .btn { display:inline-block; margin-top:20px; padding:13px 32px; background:linear-gradient(135deg,#6366f1,#10b981); color:#fff; text-decoration:none; border-radius:8px; font-weight:600; font-size:15px; }
    .divider { border:none; border-top:1px solid #eee; margin:28px 0; }
    .footer { background:#f8f8f8; padding:20px 40px; text-align:center; font-size:12px; color:#999; }
    .footer a { color:#6366f1; text-decoration:none; }
    .info-box { background:#f0fdf4; border-left:4px solid #10b981; padding:16px 20px; border-radius:6px; margin:16px 0; font-size:14px; }
    .warning-box { background:#fff7ed; border-left:4px solid #f97316; padding:16px 20px; border-radius:6px; margin:16px 0; font-size:14px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>📚 BookVista</h1>
      <p>Your favourite book store</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} BookVista. All rights reserved.</p>
      <p><a href="${BASE_URL}">Visit our store</a></p>
    </div>
  </div>
</body>
</html>`;

// ─── Email senders ────────────────────────────────────────────────────────────

export const sendWelcomeEmail = async ({ to, name }) => {
  const html = baseTemplate(`
    <h2>Welcome, ${name}! 🎉</h2>
    <p>We're thrilled to have you join the BookVista family. Thousands of readers are already discovering great books — and now you can too!</p>
    <div class="info-box">
      ✅ Your account is ready.<br/>
      📦 Free shipping on orders over ₹499.<br/>
      🏷️ Up to 50% off on select titles.
    </div>
    <a href="${BASE_URL}/books" class="btn">Start Browsing Books</a>
    <hr class="divider"/>
    <p style="font-size:13px;color:#666;">If you didn't create this account, you can safely ignore this email.</p>
  `);

  await transporter.sendMail({
    from: `"BookVista" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Welcome to BookVista 📚",
    html,
  });
};

export const sendPasswordResetEmail = async ({ to, name, resetToken }) => {
  const resetUrl = `${BASE_URL}/reset-password?token=${resetToken}`;

  const html = baseTemplate(`
    <h2>Reset your password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset the password for your BookVista account. Click the button below to set a new password:</p>
    <a href="${resetUrl}" class="btn">Reset My Password</a>
    <div class="warning-box">
      ⏳ This link expires in <strong>15 minutes</strong>.<br/>
      🔒 If you didn't request a password reset, please ignore this email — your account is safe.
    </div>
    <hr class="divider"/>
    <p style="font-size:12px;color:#999;">Or copy and paste this URL into your browser:<br/><a href="${resetUrl}" style="color:#6366f1;">${resetUrl}</a></p>
  `);

  await transporter.sendMail({
    from: `"BookVista" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your BookVista password 🔑",
    html,
  });
};

export const sendPasswordChangedEmail = async ({ to, name }) => {
  const html = baseTemplate(`
    <h2>Password changed successfully ✅</h2>
    <p>Hi ${name},</p>
    <p>Your BookVista account password was recently changed. If this was you, no further action is needed.</p>
    <div class="warning-box">
      ⚠️ If you <strong>did not</strong> make this change, please contact us immediately or reset your password.
    </div>
    <a href="${BASE_URL}/forgot-password" class="btn">Reset Password</a>
  `);

  await transporter.sendMail({
    from: `"BookVista" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your BookVista password has been changed",
    html,
  });
};

export const sendContactConfirmationEmail = async ({ to, name, subject }) => {
  const html = baseTemplate(`
    <h2>We've received your message 📩</h2>
    <p>Hi ${name},</p>
    <p>Thank you for reaching out! We've received your message regarding <strong>"${subject}"</strong> and our team will get back to you within <strong>24–48 hours</strong>.</p>
    <div class="info-box">
      📧 Email: support@bookvista.in<br/>
      ⏰ Support hours: Mon–Sat, 9 AM – 6 PM IST
    </div>
    <a href="${BASE_URL}" class="btn">Return to BookVista</a>
  `);

  await transporter.sendMail({
    from: `"BookVista Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: "We received your message – BookVista Support",
    html,
  });
};

export const sendOrderConfirmationEmail = async ({ to, name, orderId, items, total }) => {
  const itemRows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 4px;border-bottom:1px solid #eee;">${i.title}</td>
        <td style="padding:8px 4px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td>
        <td style="padding:8px 4px;border-bottom:1px solid #eee;text-align:right;">₹${(i.price * i.quantity).toLocaleString("en-IN")}</td>
      </tr>`
    )
    .join("");

  const html = baseTemplate(`
    <h2>Order Confirmed! 🎉</h2>
    <p>Hi ${name}, thank you for your order. We're getting your books ready!</p>
    <div class="info-box">📦 Order ID: <strong>#${orderId}</strong></div>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px;">
      <thead>
        <tr style="background:#f8f8f8;">
          <th style="padding:10px 4px;text-align:left;">Book</th>
          <th style="padding:10px 4px;text-align:center;">Qty</th>
          <th style="padding:10px 4px;text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:12px 4px;font-weight:700;text-align:left;">Total</td>
          <td style="padding:12px 4px;font-weight:700;text-align:right;">₹${total.toLocaleString("en-IN")}</td>
        </tr>
      </tfoot>
    </table>
    <a href="${BASE_URL}/profile" class="btn">View My Orders</a>
  `);

  await transporter.sendMail({
    from: `"BookVista Orders" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Order Confirmed – #${orderId} | BookVista`,
    html,
  });
};