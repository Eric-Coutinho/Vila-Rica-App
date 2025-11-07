require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

/* ----------------- Config (via .env) ----------------- */
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/VilaRicaApp';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.sendgrid.net';
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const SMTP_USER = process.env.SMTP_USER || 'apikey';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || '';
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

if (!SMTP_PASS) {
  console.error('FATAL: SMTP_PASS (SendGrid API Key) não configurada em backend/.env -> encerrei.');
  process.exit(1);
}
if (!FROM_EMAIL) {
  console.error('FATAL: FROM_EMAIL não configurado em backend/.env -> encerrei.');
  process.exit(1);
}

/* ----------------- MongoDB (mongoose) ----------------- */
mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Mongo conectado em', MONGO_URL))
  .catch((err) => {
    console.error('Erro conectando ao Mongo:', err.message);
    process.exit(1);
  });

/* ----------------- Model user ----------------- */
const userSchema = new mongoose.Schema(
  {
    email: String,
    password: String,
    recoverCode: String,
    name: String,
  },
  { collection: 'user' }
);
const User = mongoose.model('User', userSchema);

function generateRecoverCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < length; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
}

async function ensureDefaultUser() {
  const email = 'eric.coutinhop@hotmail.com';
  const exists = await User.findOne({ email });
  if (!exists) {
    await User.create({
      email,
      password: '123456',
      recoverCode: 'abc123',
      name: 'Eric',
    });
    console.log('Usuário default criado:', email);
  } else {
    console.log('Usuário default já existe.');
  }
}

/* ----------------- Nodemailer (SendGrid SMTP) ----------------- */
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

transporter
  .verify()
  .then(() => console.log('SMTP conectado com sucesso:', SMTP_HOST))
  .catch((err) => {
    console.error('Erro ao verificar SMTP (verifique credenciais):', err);
  });

/* ----------------- Endpoints ----------------- */

/* POST /login */
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, message: 'Email e senha são obrigatórios' });

    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(404).json({ ok: false, message: 'Usuário não encontrado' });

    if (user.password !== password) return res.status(401).json({ ok: false, message: 'Senha incorreta' });

    delete user.password;
    return res.json({ ok: true, user });
  } catch (err) {
    console.error('/login erro:', err);
    return res.status(500).json({ ok: false, message: 'Erro interno' });
  }
});

/* POST /recover gera recoverCode, salva no user e envia email via SendGrid SMTP */
app.post('/recover', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ ok: false, message: 'Email é obrigatório' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ ok: false, message: 'Usuário não encontrado' });

    const newCode = generateRecoverCode(6);
    user.recoverCode = newCode;
    await user.save();
    console.log(`recoverCode atualizado para ${email}: ${newCode}`);

    const subject = 'Código de recuperação - VilaRicaApp';
    const text = `Olá ${user.name || ''},\n\nSeu código de recuperação é: ${newCode}\n\nUse-o para redefinir sua senha.\n\nAtenciosamente,\nVilaRicaApp`;
    const html = `<p>Olá ${user.name || ''},</p><p>Seu código de recuperação é: <b>${newCode}</b></p><p>Use-o para redefinir sua senha.</p>`;

    try {
      const info = await transporter.sendMail({
        from: FROM_EMAIL,
        to: user.email,
        subject,
        text,
        html,
      });
      console.log('Email enviado:', info.messageId, 'response:', info.response);
      return res.json({ ok: true, message: 'Código enviado por SMTP (SendGrid)' });
    } catch (mailErr) {
      console.error('Erro ao enviar via SMTP:', mailErr);
      return res.status(500).json({ ok: false, message: 'Erro ao enviar email (SMTP)', detail: String(mailErr) });
    }
  } catch (err) {
    console.error('/recover erro:', err);
    return res.status(500).json({ ok: false, message: 'Erro interno' });
  }
});

/* POST /verify-code verifica se o recoverCode bate */
app.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ ok: false, message: 'Email e código são obrigatórios' });

    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(404).json({ ok: false, message: 'Usuário não encontrado' });

    if (!user.recoverCode || user.recoverCode !== code) return res.status(400).json({ ok: false, message: 'Código inválido' });

    return res.json({ ok: true, message: 'Código válido' });
  } catch (err) {
    console.error('/verify-code erro:', err);
    return res.status(500).json({ ok: false, message: 'Erro interno' });
  }
});

/* POST /reset verifica código e atualiza password */
app.post('/reset', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ ok: false, message: 'Email, código e nova senha são obrigatórios' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ ok: false, message: 'Usuário não encontrado' });

    if (!user.recoverCode || user.recoverCode !== code) return res.status(400).json({ ok: false, message: 'Código inválido' });

    user.password = newPassword;
    user.recoverCode = null; // invalida o código
    await user.save();

    return res.json({ ok: true, message: 'Senha atualizada com sucesso' });
  } catch (err) {
    console.error('/reset erro:', err);
    return res.status(500).json({ ok: false, message: 'Erro interno' });
  }
});

/* ----------------- Inicia server ----------------- */
app.listen(PORT, async () => {
  console.log(`API rodando em http://localhost:${PORT} (PORT env: ${PORT})`);
  await ensureDefaultUser();
});
