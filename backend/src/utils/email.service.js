const env = require('../config/env');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.mail?.user || !env.mail?.pass) {
    return null;
  }
  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (err) {
    console.warn('E-posta gönderilemiyor: nodemailer yüklü değil. Backend dizininde "npm install" çalıştırın.');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.secure,
    auth: {
      user: env.mail.user,
      pass: env.mail.pass,
    },
  });
  return transporter;
}

/**
 * Şifre sıfırlama e-postası gönderir
 */
async function sendPasswordResetEmail(toEmail, resetLink) {
  const transport = getTransporter();
  if (!transport) {
    console.warn('E-posta gönderilemiyor: MAIL_USER/MAIL_PASS tanımlı değil.');
    return { sent: false, error: 'Mail not configured' };
  }
  try {
    await transport.sendMail({
      from: env.mail.from,
      to: toEmail,
      subject: 'Şifre Sıfırlama - Proje Takip',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Şifre Sıfırlama</h2>
          <p>Şifre sıfırlama talebinde bulundunuz. Aşağıdaki bağlantıya tıklayarak yeni şifrenizi belirleyebilirsiniz.</p>
          <p style="margin: 24px 0;">
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px;">Şifreyi sıfırla</a>
          </p>
          <p style="color: #666; font-size: 14px;">Bu bağlantı 1 saat geçerlidir. Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
          <p style="color: #999; font-size: 12px;">Proje Takip</p>
        </div>
      `,
      text: `Şifre sıfırlama: ${resetLink}\n\nBu bağlantı 1 saat geçerlidir.`,
    });
    return { sent: true };
  } catch (err) {
    console.error('E-posta gönderim hatası:', err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = {
  getTransporter,
  sendPasswordResetEmail,
};
