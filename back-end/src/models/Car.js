import { z } from 'zod'

// Ano corrente
const currentYear = new Date().getFullYear()

// Data mínima de venda (abertura da loja)
const minSellingDate = new Date(2020, 2, 20) // 20/03/2020
// Data máxima de venda (hoje)
const maxSellingDate = new Date()

// Cores permitidas
const colors = [
  'AMARELO', 'AZUL', 'BRANCO', 'CINZA', 'DOURADO',
  'LARANJA', 'MARROM', 'PRATA', 'PRETO', 'ROSA',
  'ROXO', 'VERDE', 'VERMELHO'
]

const Car = z.object({
  brand: z.string()
    .trim()
    .min(1, { message: 'A marca deve ter, no mínimo, 1 caractere.' })
    .max(25, { message: 'A marca pode ter, no máximo, 25 caracteres.' }),

  model: z.string()
    .trim()
    .min(1, { message: 'O modelo deve ter, no mínimo, 1 caractere.' })
    .max(25, { message: 'O modelo pode ter, no máximo, 25 caracteres.' }),

  color: z.enum(colors, {
    message: 'Cor inválida. Deve ser uma das opções pré-definidas.'
  }),

  year_manufacture: z.number()
    .int({ message: 'O ano de fabricação deve ser um número inteiro.' })
    .min(1960, { message: 'O ano de fabricação não pode ser anterior a 1960.' })
    .max(currentYear, { message: `O ano de fabricação não pode ser posterior a ${currentYear}.` }),

  imported: z.boolean({
    message: 'O campo imported deve ser true ou false.'
  }),

  plates: z.string()
    .trim()
    .refine(val => val.length === 8, {
      message: 'A placa deve ter exatamente 8 caracteres.'
    }),

  selling_date: z.coerce.date()
    .min(minSellingDate, { message: 'A data de venda não pode ser anterior à abertura da loja (20/03/2020).' })
    .max(maxSellingDate, { message: 'A data de venda não pode ser posterior à data atual.' })
    .nullish(), // opcional

  selling_price: z.number()
    .min(5000, { message: 'O preço de venda deve ser, no mínimo, R$ 5.000,00.' })
    .max(5000000, { message: 'O preço de venda deve ser, no máximo, R$ 5.000.000,00.' })
    .nullish() // opcional
})

export default Car
