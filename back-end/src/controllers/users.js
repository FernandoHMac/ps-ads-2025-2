
import prisma from '../database/client.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'




const controller = {}   // Objeto vazio

// Todas as funções de controller têm, pelo menos,
// dois parâmetros:
// req ~> representa a requisição (request)
// res ~> representa a resposta (response)
controller.create = async function(req, res) {
  try {
    // Se existe o campo 'password' em req.body,
    	// é necessário gerar o hash da senha antes
    	// de armazená-lo no BD. 12 é a quantidade de passos de criptografia

    if(req.body.password) {
       req.body.password = await bcrypt.hash(req.body.password, 12)
    	}

    // Para a inserção no BD, os dados são enviados
    // dentro de um objeto chamado "body" que vem
    // dentro da requisição ("req")
    await prisma.user.create({ data: req.body })
   
    
    

    // Se tudo der certo, enviamos o código HTTP
    // apropriado, no caso
    // HTTP 201: created
    res.status(201).end()
  }
  catch(error) {
    // Se algo de errado ocorrer, cairemos aqui
    console.error(error)  // Exibe o erro no terminal

    // Enviamos como resposta o código HTTP relativo
    // a erro interno do servidor
    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.retrieveAll = async function(req, res) {
  try {
    // Recupera todos os registros de veiculo, ordenados
    // pelo campo "name"
    const result = await prisma.user.findMany({
       omit: { password: true },
       orderBy: [ { fullname: 'asc' } ]
    })

    // HTTP 200: OK (implícito)
    res.send(result)
  }
  catch(error) {
    // Se algo de errado ocorrer, cairemos aqui
    console.error(error)  // Exibe o erro no terminal

    // Enviamos como resposta o código HTTP relativo
    // a erro interno do servidor
    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.retrieveOne = async function (req, res) {
  try {
    // Busca no banco de dados apenas o veiculo indicado
    // pelo parâmetro "id"
    const result = await prisma.user.findUnique({
      omit: { password: true },
      where: { id: Number(req.params.id) }
    })

    // Encontrou ~> HTTP 200: OK (implícito)
    if(result) res.send(result)
    // Não encontrou ~> HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    // Se algo de errado ocorrer, cairemos aqui
    console.error(error)  // Exibe o erro no terminal

    // Enviamos como resposta o código HTTP relativo
    // a erro interno do servidor
    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.update = async function(req, res) {
  try {
     // Se existe o campo 'password' em req.body,
    	// é necessário gerar o hash da senha antes
    	// de armazená-lo no BD. 12 é a quantidade de passos de criptografia
    	if(req.body.password) {
       req.body.password = await bcrypt.hash(req.body.password, 12)
    	}
    // Busca o registro no banco de dados por seu id
    // e o atualiza com as informações que vieram em req.body
    await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })

   


    // Encontrou e atualizou ~> HTTP 204: No Content
    res.status(204).end()
  }
  catch(error) {
    // Se algo de errado ocorrer, cairemos aqui
    console.error(error)  // Exibe o erro no terminal

    // Não encontrou e não atualizou ~> HTTP 404: Not Found
    if(error?.code === 'P2025') res.status(404).end()

    // Se não for erro de não encontrado, retorna o habitual
    // HTTP 500: Internal Server Error
    else res.status(500).end()
  }
}

controller.delete = async function (req, res) {
  try {
    await prisma.user.delete({
      where: { id:  Number(req.params.id) }
    })

    // Encontrou e excluiu ~> HTTP 204: No Content
    res.status(204).end()
  }
  catch(error) {
    // Se algo de errado ocorrer, cairemos aqui
    console.error(error)  // Exibe o erro no terminal

    // Não encontrou e não excluiu ~> HTTP 404: Not Found
    if(error?.code === 'P2025') res.status(404).end()

    // Se não for erro de não encontrado, retorna o habitual
    // HTTP 500: Internal Server Error
    else res.status(500).end()
  }
}


controller.login = async function (req, res) {
  try {
    // Busca o usuário no BD usando o valor dos campos
    // "username" OU "email"
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: req.body?.username },
          { email: req.body?.email }
        ]
      }
    })

    // Se o usuário não for encontrado, retorna
    // HTTP 401: Unauthorized
    if(! user) {
      console.error('ERRO DE LOGIN: usuário não encontrado')
      return res.status(401).end()
    }

    // Usuário encontrado, vamos conferir a senha
    const passwordIsValid = await bcrypt.compare(req.body?.password, user.password)

    // Se a senha estiver errada, retorna
    // HTTP 401: Unauthorized
    if(! passwordIsValid) {
      console.error('ERRO DE LOGIN: senha inválida')
      return res.status(401).end()
    }

    // Deleta o campo "password" do objeto "user" antes de usá-lo
    // no token e no valor de retorno
    if(user.password) delete user.password

    // Usuário/email e senha OK, passamos ao procedimento de gerar o token
    const token = jwt.sign(
      user,                       // Dados do usuário
      process.env.TOKEN_SECRET,   // Senha para criptografar o token
      { expiresIn: '24h' }        // Prazo de validade do token
    )

    // Retorna o token e o usuário autenticado, com o status
    // HTTP 200: OK (implícito)
    res.send({ user, token })
  }
  catch(error) {
    // Se algo de errado acontecer, cairemos aqui
    // Nesse caso, vamos exibir o erro no console e enviar
    // o código HTTP correspondente a erro do servidor
    // HTTP 500: Internal Server Error
    console.error(error)
    res.status(500).end()
  }
}


export default controller