import nodemailer from 'nodemailer';

// Generate a test SMTP service account from ethereal.email if we don't have real creds
let testAccount;
let transporter;

export async function sendOTP(email, otp) {
  if (!transporter) {
    testAccount = await nodemailer.createTestAccount();
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

  const info = await transporter.sendMail({
    from: '"Stake Clone" <noreply@stakeclone.com>',
    to: email,
    subject: "Your Login OTP",
    text: `Your OTP is: ${otp}`,
    html: `<b>Your OTP is: ${otp}</b><br/><br/><i>Note: This is a test email.</i>`,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  
  return nodemailer.getTestMessageUrl(info);
}
