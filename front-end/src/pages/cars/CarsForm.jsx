import React from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { parseISO } from 'date-fns'
import { feedbackWait, feedbackNotify, feedbackConfirm } from '../../ui/Feedback'
import { useNavigate, useParams } from 'react-router-dom'
import { useMask } from '@react-input/mask'
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import fetchAuth from '../../lib/fetchAuth'
import Car from '../../models/Car.js'  
import { ZodError } from 'zod'

// Função auxiliar para validar um campo individualmente (para onBlur)
function validateField(fieldName, value, schema) {
  try {
    const partialSchema = schema.pick({ [fieldName]: true });
    partialSchema.parse({ [fieldName]: value });
    return null; // Sem erro
  } catch (error) {
    if (error instanceof ZodError) {
      return error.issues[0]?.message || 'Erro de validação';
    }
    return error.message;
  }
}

export default function CarsForm() {

  // Ajuste: Cores em maiúsculas para coincidir com Zod
  const carsColor = [
    { value: "AMARELO", label: "Amarelo" },
    { value: "AZUL", label: "Azul" },
    { value: "BRANCO", label: "Branco" },
    { value: "CINZA", label: "Cinza" },
    { value: "DOURADO", label: "Dourado" },
    { value: "LARANJA", label: "Laranja" },  // Adicionei para coincidir com Zod
    { value: "MARROM", label: "Marrom" },
    { value: "PRATA", label: "Prata" },
    { value: "PRETO", label: "Preto" },
    { value: "ROSA", label: "Rosa" },
    { value: "ROXO", label: "Roxo" },
    { value: "VERDE", label: "Verde" },
    { value: "VERMELHO", label: "Vermelho" }
  ]

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 1951; year--) {
    years.push({ value: year, label: year.toString() });
  }

  // Ajuste: Máscara sem hífen para coincidir com Zod (8 caracteres)
  const platesRef = useMask({
    mask: "AAA9999",  // 3 letras + 4 dígitos, sem hífen
    replacement: { 
      'A': /[A-Z]/,   // Apenas maiúsculas
      '9': /[0-9]/
    },
    showMask: false
  })

  // Por padrão, todos os campos começam com uma string vazia como valor.
  // A exceção é o campo birth_date, do tipo data, que, por causa do
  // funcionamento do componente DatePicker, deve começar como null
  const formDefaults = {
    brand: '',
    model: '',
    color: '',
    year_manufacture: '',  
    imported: false,
    plates: '',
    selling_price: '',    
    selling_date: null
  }

  const navigate = useNavigate()
  const params = useParams()

  // Variáveis de estado
  const [state, setState] = React.useState({
    car: { ...formDefaults },
    formModified: false,
    inputErrors: {}
  })
  const { car, formModified, inputErrors } = state

  // Se estivermos editando um cliente, precisamos buscar os seus dados
  // no servidor assim que o componente for carregado
  React.useEffect(() => {
    // Sabemos que estamos editando (e não cadastrando um novo) cliente
    // quando a rota ativa contiver um parâmetro chamado id
    if (params.id) loadData()
  }, [])

  async function loadData() {
    feedbackWait(true)
    try {
      const result = await fetchAuth.get(`/cars/${params.id}`)

       // Converte o formato de data armazenado no banco de dados
      // para o formato reconhecido pelo componente DatePicker
      if (result.selling_date) result.selling_date = parseISO(result.selling_date)

        // Armazena os dados obttidos na variável de estado
      setState({ ...state, car: result })
    } 
    catch (error) {
      console.error(error)
      feedbackNotify('ERRO: ' + error.message)
    }
     finally {
      feedbackWait(false)
    }
  }

  /* Preenche o campo do objeto "customer" conforme o campo correspondente do
     formulário for modificado */
  function handleFieldChange(event) {
    // Vamos observar no console as informações que chegam à função
    console.log('CAMPO MODIFICADO:', {
      name: event.target.name,
      value: event.target.value
    })

    const carCopy = { ...car }
    carCopy[event.target.name] = event.target.value
    setState({ ...state, car: carCopy, formModified: true })
  }

  // Novo: Função para validação em tempo real (onBlur)
  function handleFieldBlur(event) {
    const { name, value } = event.target;
    const error = validateField(name, value, Car);
    setState(prevState => ({
      ...prevState,
      inputErrors: { ...prevState.inputErrors, [name]: error }
    }));
  }

  async function handleFormSubmit(event) {
    event.preventDefault()
    feedbackWait(true)
    try {
      // Ajuste: Converta tipos antes da validação
      const carToValidate = {
        ...car,
        year_manufacture: car.year_manufacture ? parseInt(car.year_manufacture, 10) : undefined,
        selling_price: car.selling_price ? parseFloat(car.selling_price) : undefined,
        // selling_date já é Date ou null
      }

      Car.parse(carToValidate)

      if (params.id) {
        await fetchAuth.put(`/cars/${params.id}`, carToValidate)
      } else {
        await fetchAuth.post('/cars', carToValidate)
      }

      feedbackNotify('Item salvo com sucesso.', 'success', 2500, () => {
        navigate('..', { relative: 'path', replace: true })
      })
    }
     catch (error) {
      console.error(error)

      if (error instanceof ZodError) {
        const errorMessages = {}
        for (let i of error.issues) errorMessages[i.path[0]] = i.message
        setState({ ...state, inputErrors: errorMessages })
        feedbackNotify('Há campos com valores inválidos. Verifique.', 'error')
      } else {
        feedbackNotify(error.message, 'error')
      }
    }
     finally {
      feedbackWait(false)
    }
  }

  async function handleBackButtonClick() {
    if (
      formModified &&
      !await feedbackConfirm('Há informações não salvas. Deseja realmente sair?')
    ) return    // Sai da função sem fazer nada

    // Aqui o usuário respondeu que quer voltar e perder os dados
    navigate('..', { relative: 'path', replace: true })
  }

  return <>
    <Typography variant="h1" gutterBottom>
      Cadastro de Veiculos
    </Typography>

    <Box className="form-fields">
      <form onSubmit={handleFormSubmit}>

          {/* autoFocus ~> foco do teclado no primeiro campo */}
          <TextField 
          variant="outlined"
          name="brand"
          label="Marca"
          fullWidth
          required
          autoFocus
          value={car.brand}
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}  // Adicionado para validação em tempo real
          error={inputErrors.brand}
          helperText={inputErrors.brand}
        />

        <div className="MuiFormControl-root">
          <FormControlLabel
            control={
              <Checkbox
                checked={car.imported}
                onChange={e => {
                  const event = { target: { name: 'imported', value: e.target.checked } }
                  handleFieldChange(event)
                }}
              />
            }
            label="Importado"
          />
        </div>

        <TextField
          variant="outlined"
          name="model"
          label="Modelo"
          fullWidth
          required
          value={car.model}
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
          error={inputErrors.model}
          helperText={inputErrors.model}
        />

        <TextField
          inputRef={platesRef}
          variant="outlined"
          name="plates"
          label="Placa"
          fullWidth
          required
          value={car.plates}
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
          error={inputErrors.plates}
          helperText={inputErrors.plates}
        />

        <TextField
          variant="outlined" 
          name="color"
          label="Cor" 
          fullWidth
          required
          value={car.color}
          select
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
          error={inputErrors.color}
          helperText={inputErrors?.color}
        >
          {carsColor.map(c => 
            <MenuItem key={c.value} value={c.value}>
              {c.label}
            </MenuItem>
          )}
        </TextField>
        
        <TextField
          variant="outlined"
          name="selling_price"
          label="Preço de Venda"
          fullWidth
          // Removido required, pois é opcional no Zod
          inputMode="numeric"
          value={car.selling_price}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) {
              handleFieldChange(e);
            }
          }}
          onBlur={handleFieldBlur}
          error={inputErrors.selling_price}
          helperText={inputErrors.selling_price}
        />

        <TextField
          variant="outlined"
          name="year_manufacture"
          label="Ano de Fabricação"
          fullWidth
          required
          value={car.year_manufacture}
          select
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
          error={inputErrors.year_manufacture}
          helperText={inputErrors.year_manufacture}
        >
          {years.map(y => 
            <MenuItem key={y.value} value={y.value}>
              {y.label}
            </MenuItem>
          )}
        </TextField>
        
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <DatePicker 
            label="Data de Venda"
            value={car.selling_date}
            slotProps={{
              textField: {
                variant: "outlined",
                fullWidth: true,
                // Removido required, pois é opcional
                error: inputErrors.selling_date,
                helperText: inputErrors.selling_date
              }
            }}
            onChange={ date => {
              const event = { target: { name: 'selling_date', value: date } }
              handleFieldChange(event)
            }}
            onClose={() => {  // Simula onBlur para DatePicker
              const error = validateField('selling_date', car.selling_date, Car);
              setState(prevState => ({
                ...prevState,
                inputErrors: { ...prevState.inputErrors, selling_date: error }
              }));
            }}
          />
        </LocalizationProvider>

        <Box sx={{
          display: 'flex',
          justifyContent: 'space-around',
          width: '100%'
        }}>
          <Button
            variant="contained"
            color="secondary"
            type="submit"
          >
            Salvar
          </Button>
          <Button
            variant="outlined"
            onClick={handleBackButtonClick}
          >
            Voltar
          </Button>
        </Box>

        <Box sx={{
          fontFamily: 'monospace',
          display: 'flex',
          flexDirection: 'column',
          width: '100vw'
        }}>
          { JSON.stringify(car, null, ' ') }
        </Box>

      </form>
    </Box>
  </>
}