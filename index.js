const express = require('express')
const app = express()


const mongoose = require('mongoose')
const crypto = require ('crypto');
const Usuario = require('./models/Usuario')
const Pedido = require('./models/Pedido')
const Pagamento = require('./models/Pagamento')
const Brownie = require('./models/Brownie')



const cipher ={
  algorithm: "aes256",
  secret: "chaves",
  type: "hex"
};

async function getCrypto(password) {
  return new Promise((resolve, reject) => {
      const cipherStream = crypto.createCipher(cipher.algorithm, cipher.secret);
      let encryptedData = '';

      cipherStream.on('readable', () => {
          let chunk;
          while (null !== (chunk = cipherStream.read())) {
              encryptedData += chunk.toString(cipher.type);
          }
      });

      cipherStream.on('end', () => {
          resolve(encryptedData);
      });

      cipherStream.on('error', (error) => {
          reject(error);
      });

      cipherStream.write(password);
      cipherStream.end();
  });
}


app.use(
  express.urlencoded({
    extended: true,
  }),
)

app.use(express.json())


// cadastro
app.post('/Usuario', async (req, res) => {
  let { nome, email, usuario, senha } = req.body;
  try {
      let novaSenha = await getCrypto(senha);
      const newUsuario = new Usuario({
        nome,
        email,
        usuario,
        senha: novaSenha,
      });
      await newUsuario.save();
      res.status(201).json({ message: 'Usuario cadastrado com sucesso!' });
  } catch (error) {
      res.status(500).json({ erro: error });
  }
});


// encontra os usuários R do crud sei lá
app.get('/Usuario', async (req, res) => {
  try {
    const usuarios = await Usuario.find()
    res.status(200).json(usuarios)
  } catch (error) {
    res.status(500).json({ erro: error.message })
  }
})


//login de quem é de login

app.post('/login', async (req, res) => {
  let { usuario, senha } = req.body;
  try {
      let senhaHashada = await getCrypto(senha);
      const Usuario = await Usuario.findOne({ usuario, senha: senhaHashada });
      if (!Usuario) {
          res.status(422).json({ message: 'Credenciais inválidas!' });
          return;
      }
      res.status(200).json({ message: 'Usuário Logado', user: Usuario });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }});


// pedidos pedidos pedidos pedidos pedidos pedidos  CRUD
//cadastra
app.post('/Pedido', async (req, res) => {
  const { quantidade, precoTotal, modoPagamento, usuario, nomeProduto } = req.body;
  try {
    const userExists = await Usuario.findById(usuario);
    const productExists = await Brownie.findById(nomeProduto);

    if (!userExists || !productExists) {
      res.status(422).json({ message: 'Usuário ou Produto não encontrado!' });
      return;
    }

    const pedido = new Pedido({ quantidade, precoTotal, modoPagamento, usuario, nomeProduto });
    await pedido.save();
    res.status(201).json({ message: 'Pedido feito com sucesso!', pedido });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

//ver
app.get('/Pedido', async (req, res) => {
  try {
    const pedidos = await Pedido.find().populate('usuario').populate('nomeProduto');
    res.status(200).json(pedidos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});


//muda

app.put('/Pedido/:id', async (req, res) => {
  const { id } = req.params;
  const { quantidade, precoTotal, modoPagamento, usuario, nomeProduto } = req.body;
  try {
    const pedido = await Pedido.findByIdAndUpdate(id, { quantidade, precoTotal, modoPagamento, usuario, nomeProduto }, { new: true });
    res.status(200).json({ message: 'Pedido atualizado com sucesso!', pedido });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

//deletar cancelar apagar

app.delete('/Pedido/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Pedido.findByIdAndDelete(id);
    res.status(200).json({ message: 'Pedido excluído com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});


// pagamentos pagamentos pagamentos pagamentos pagamentos  CRUD
//cadastra
app.post('/Pagamento', async (req, res) => {
  const { numCartao, nomeCartao, cvv, senha, usuario } = req.body;
  try {
    const userExists = await Usuario.findById(usuario);

    if (!userExists) {
      res.status(422).json({ message: 'Usuário não encontrado!' });
      return;
    }

    const novoNumeroC = await getCrypto(numCartao.toString());
    const novoCVV = await getCrypto(cvv.toString());
    const novaSenha = await getCrypto(senha);

    const newPagamento = new Pagamento({
      numCartao: novoNumeroC,
      nomeCartao,
      cvv: novoCVV,
      senha: novaSenha,
      usuario,
    });
    await newPagamento.save();
    res.status(201).json({ message: 'Informações de pagamento cadastradas com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

//ver
app.get('/Pagamento', async (req, res) => {
  try {
    const pagamentos = await Pagamento.find().populate('usuario');
    res.status(200).json(pagamentos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

//muda

app.put('/Pagamento/:id', async (req, res) => {
  const { id } = req.params;
  const { numCartao, nomeCartao, cvv, senha, usuario } = req.body;
  try {
    const pagamento = await Pagamento.findByIdAndUpdate(id, { numCartao, nomeCartao, cvv, senha, usuario }, { new: true });
    res.status(200).json({ message: 'Informações de pagamento atualizadas com sucesso!', pagamento });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

//deletar cancelar apagar

app.delete('/Pagamento/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Pagamento.findByIdAndDelete(id);
    res.status(200).json({ message: 'Informações de pagamento excluídas com sucesso!' });
  } catch (error) {
    res.status{ erro: error.message });
  }
});


// brownies  brownies brownies brownies brownies brownies brownies brownies  CRUD
//cadastra
app.post('/Brownie', async (req, res) => {
  const { nomeProduto, preco, cepa } = req.body;
    try {
      const brownie = new Brownie 
      ({ nomeProduto, preco, cepa });
      await brownie.save();
      res.status(201).json({ message: 'Brownie de maconha cadastrado com sucesso!', brownie});
    }
    catch (error) {
      res.status(500).json({erro: error.message});
    }
});

//ver
app.get('/Brownie', async (req, res) => {
  try{
    const brownies = await Brownie.find();
    res.status(200).json(brownies);
  } catch (error){
    res.status(500).json ({erro: error.message});
  }
});

//muda

app.put('/Brownie/:id', async (req,res) =>{
  const {id} = req.params;
  const { nomeProduto, preco, cepa } = req.body;
  try{
    const brownie = await Brownie.findByIdAndUpdate (id,
      {nomeProduto, preco, cepa}, {new: true});
      res.status(200).json({message: 'Informações do brownie atualizadas com sucesso, seu noia!', brownie});
  }
  catch (error){
    res.status(500).json({erro: error.message});
  }
});

//deletar cancelar apagar

app.delete ('/Brownie/:id', async (req, res) => {
  const {id} = req.params;
  try{
    await Brownie.findByIdAndDelete(id);
    res.status(200).json ({message: 'Brownie obliterado com sucesso!'});
  } catch (error){
    res.status(500).json({erro: error.message});
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Teste' })
})

// conexão
mongoose.connect(`mongodb://localhost:27017`).then(()=>{
    console.log("Conectado ao mongoDB")
    app.listen(3000)
})
.catch((err)=>{
    console.log(err)
})
