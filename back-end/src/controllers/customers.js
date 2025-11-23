import prisma from '../database/client.js'
import Customer from '../models/Customer.js'
import { ZodError } from 'zod'



const controller = {}   // Objeto vazio

// Todas as funções de controller têm, pelo menos,
// dois parâmetros:
// req ~> representa a requisição (request)
// res ~> representa a resposta (response)
controller.create = async function(req, res) {
  try {
     // Sempre que houver um campo que represente uma data,
   // precisamos garantir sua conversão para o tipo Date
   // antes de passá-lo ao Zod para validação
   if(req.body.birth_date) req.body.birth_date = new Date(req.body.birth_date)


   // Invoca a validação do modelo do Zod para os dados que
   // vieram em req.body
   Customer.parse(req.body)

    // Para a inserção no BD, os dados são enviados
    // dentro de um objeto chamado "body" que vem
    // dentro da requisição ("req")
    await prisma.customer.create({ data: req.body })

    // Se tudo der certo, enviamos o código HTTP
    // apropriado, no caso
    // HTTP 201: created
    res.status(201).end()
  }
  catch(error) {
    // Se algo de errado ocorrer, cairemos aqui
    console.error(error)  // Exibe o erro no terminal

     
   // Se for erro de validação do Zod, retorna
   // HTTP 422: Unprocessable Entity
   if(error instanceof ZodError) res.status(422).send(error.issues)

    // Enviamos como resposta o código HTTP relativo
    // a erro interno do servidor
    // HTTP 500: Internal Server Error
    else res.status(500).end()
  }
}

controller.retrieveAll = async function(req, res) {
  try {
    // Recupera todos os registros de clientes, ordenados
    // pelo campo "name"
    const result = await prisma.customer.findMany({
      orderBy: [ { name: 'asc' } ]
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
    // Busca no banco de dados apenas o cliente indicado
    // pelo parâmetro "id"
    const result = await prisma.customer.findUnique({
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
     // Sempre que houver um campo que represente uma data,
   // precisamos garantir sua conversão para o tipo Date
   // antes de passá-lo ao Zod para validação
   if(req.body.birth_date) req.body.birth_date = new Date(req.body.birth_date)


   // Invoca a validação do modelo do Zod para os dados que
   // vieram em req.body
   Customer.parse(req.body)

    // Busca o registro no banco de dados por seu id
    // e o atualiza com as informações que vieram em req.body
    await prisma.customer.update({
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

       // Erro do Zod ~> HTTP 422: Unprocessable Entity
   else if(error instanceof ZodError) res.status(422).send(error.issues)

    // Se não for erro de não encontrado, retorna o habitual
    // HTTP 500: Internal Server Error
    else res.status(500).end()
  }
}

controller.delete = async function (req, res) {
  try {
    await prisma.customer.delete({
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


export default controller