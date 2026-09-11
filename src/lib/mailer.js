import nodemailer from 'nodemailer';

// Generate a test SMTP service account from ethereal.email if we don't have real creds
let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
}

export async function sendOTP(email, otp) {
  const activeTransporter = await getTransporter();

  const info = await activeTransporter.sendMail({
    from: process.env.SMTP_FROM || '"Stake Clone" <noreply@stakeclone.com>',
    to: email,
    subject: "Your Login OTP",
    text: `Your OTP is: ${otp}`,
    html: `<b>Your OTP is: ${otp}</b><br/><br/><i>Note: This is a test email.</i>`,
  });

  console.log("Message sent: %s", info.messageId);
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("Preview URL: %s", previewUrl);
  }
  
  return previewUrl || null;
}
