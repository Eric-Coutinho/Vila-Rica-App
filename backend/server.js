// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// string de conexão (MongoDB Compass / local)
const MONGO_URL = 'mongodb://localhost:27017/VilaRicaApp';

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Mongo conectado em', MONGO_URL))
  .catch(err => {
    console.error('Erro conectando ao Mongo:', err.message);
    process.exit(1);
  });

// schema mínimo (a collection se chama "user")
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  recoverCode: String,
  name: String
}, { collection: 'user' });

const User = mongoose.model('User', userSchema);

// cria usuário default se não existir (útil pro seu mock)
async function ensureDefaultUser() {
  const email = 'eric.coutinhop@hotmail.com';
  const exists = await User.findOne({ email });
  if (!exists) {
    await User.create({
      email,
      password: '123456',
      recoverCode: 'abc123',
      name: 'Eric'
    });
    console.log('Usuário default criado:', email);
  } else {
    console.log('Usuário default já existe.');
  }
}

// rota de login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, message: 'Email e senha são obrigatórios' });

    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(404).json({ ok: false, message: 'Usuário não encontrado' });

    if (user.password !== password) return res.status(401).json({ ok: false, message: 'Senha incorreta' });

    // remove password antes de enviar
    delete user.password;
    return res.json({ ok: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Erro interno' });
  }
});

const PORT = 3000;
app.listen(PORT, async () => {
  console.log(`API rodando em http://localhost:${PORT}`);
  await ensureDefaultUser();
});
