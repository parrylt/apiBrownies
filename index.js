const express = require('express')
const app = express()


const mongoose = require('mongoose')
const crypto = require ('crypto');
const Usuario = require('./models/Usuario')


// conexão
mongoose.connect(`mongodb://localhost:27017`).then(()=>{
    console.log("Conectamos ao mongoDB")
    app.listen(3000)
})
.catch((err)=>{
    console.log(err)
})



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
  let { usuario, senha } = req.body;
  try {
      let novaSenha = await getCrypto(senha);
      const Usuario = {
          usuario,
          senha: novaSenha,
      };
      await Usuario.create(Usuario);
      res.status(201).json({ message: 'Usuario cadastrado com sucesso!' });
  } catch (error) {
      res.status(500).json({ erro: error });
  }
});


// encontra cadastro 
app.get('/Usuario', async (req, res) => {
  try {
    const people = await Usuario.find()

    res.status(200).json(people)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})



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
  }
});





// O R do CRUD 
app.get('/Usuario/:id', async (req, res) => {
  const id = req.params.id

  try {
    const Usuario = await Usuario.findOne({ _id: id })

    if (!Usuario) {
      res.status(422).json({ message: 'Usuário não encontrado!' })
      return
    }

    res.status(200).json(Usuario)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

// O U do CRUD 
app.patch('/Usuario/:id', async (req, res) => {
  const id = req.params.id

  const { name, salary, approved } = req.body

  const Usuario = {
    name,
    salary,
    approved,
  }

  try {
    const updatedUsuario = await Usuario.updateOne({ _id: id }, Usuario)

    if (updatedUsuario.matchedCount === 0) {
      res.status(422).json({ message: 'Usuário não encontrado!' })
      return
    }

    res.status(200).json(Usuario)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

// O D do CRUD 
app.delete('/Usuario/:id', async (req, res) => {
  const id = req.params.id

  const Usuario = await Usuario.findOne({ _id: id })

  if (!Usuario) {
    res.status(422).json({ message: 'Usuário não encontrado!' })
    return
  }

  try {
    await Usuario.deleteOne({ _id: id })

    res.status(200).json({ message: 'Usuário removido com sucesso!' })
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

app.get('/', (req, res) => {
  res.json({ message: 'Oi Express!' })
})