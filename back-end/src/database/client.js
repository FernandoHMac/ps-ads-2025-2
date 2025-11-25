// src/helpers/prisma.js

import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// Prisma base (com logs das queries)
const prismaBase = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query'
    }
  ]
})

// Exibe no terminal as queries SQL enviadas ao banco
prismaBase.$on('query', event => {
  console.log('-'.repeat(60))
  console.log(event.query)
  if (event.params) console.log('PARAMS:', event.params)
})

// Prisma final com Accelerate
const prisma = prismaBase.$extends(withAccelerate())

export default prisma
