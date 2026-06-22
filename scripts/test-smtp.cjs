require('dotenv').config();
const nodemailer = require('nodemailer');

const HOST = process.env.SMTP_HOST;
const PORT = Number(process.env.SMTP_PORT || 587);
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;

console.log('Testing SMTP connection:', { HOST, PORT, USER, PASS: PASS ? '*'.repeat(PASS.length) : '(empty)' });

const transporter = nodemailer.createTransport({
  host: HOST,
  port: PORT,
  secure: PORT === 465,
  auth: { user: USER, pass: PASS },
});

transporter.verify()
  .then(() => console.log('SUCCESS: SMTP connection and authentication OK.'))
  .catch((err) => {
    console.error('FAILED:', err.message);
    if (err.response) console.error('Server response:', err.response);
    process.exit(1);
  });
