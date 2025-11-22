import React from 'react'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useNavigate } from 'react-router-dom'
import { feedbackNotify, feedbackWait } from '../ui/Feedback'

import fetchAuth from '../lib/fetchAuth'

import AuthContext from '../contexts/AuthContext'

export default function LoginPage() {

  const [state, setState] = React.useState({
    email: '',
    password: '',
    showPassword: false
  })
  const {
    email,
    password,
    showPassword
  } = state

   const { authState, setAuthState } = React.useContext(AuthContext)

  const navigate = useNavigate()

  function handleChange(event) {
    // Atualiza a variável de estado associada ao input que foi modificado
    setState({ ...state, [event.target.name]: event.target.value })
  }

  function handleShowPasswordClick(event) {
    // Alterna a visiblidade da senha
    setState({ ...state, showPassword: !showPassword })
  }

  async function handleSubmit(event) {
    event.preventDefault()    // Evita o recarregamento da página
    feedbackWait(true)
    try {
      const loginData = { password }

      // Verificamos se no valor da variável de estado "email" existe
      // um caractere de @. Caso contrário, tratamos o valor como
      // nome de usuário
      if(email.includes('@')) loginData.email = email
      else loginData.username = email

      // Envia email (ou username) e password para o back-end para fazer
      // a autenticação
      const result = await fetchAuth.post('/users/login', loginData)

      // Armazena o token retornado no localStorage para posterior utilização
      window.localStorage.setItem(
        import.meta.env.VITE_AUTH_TOKEN_NAME,
        result.token
      )

      // Guarda no contexto as informações sobre o usuário autenticado
       setAuthState({ ...authState, authUser: result.user })

      feedbackNotify(
        'Autenticação realizada com sucesso', 
        'success', 
        2000,
        () => navigate('/')  // Vai para a página inicial
      )
    }
    catch(error) {
      console.error(error)
      feedbackNotify(error.message, 'error')
    }
    finally {
      feedbackWait(false)
    }
  }

  return <>
    { /* gutterBottom coloca um espaçamento extra abaixo do componente */ }
    <Typography variant="h1" gutterBottom align="center">
      Autentique-se
    </Typography>

    <Paper
      elevation={6}
      sx={{
        padding: '24px',
        maxWidth: '500px',
        margin: 'auto'
      }}
    >
      <form onSubmit={handleSubmit}>

        <TextField 
          name="email"
          value={email}
          label="Nome de usuário ou e-mail"
          variant="filled"
          fullWidth
          autoFocus
          onChange={handleChange}
          sx={{ mb: '24px' /* mb = marginBottom */}}
        />

        <TextField 
          name="password"
          value={password}
          label="Senha"
          variant="filled"
          type={ showPassword ? 'text' : 'password' }
          fullWidth
          onChange={handleChange}
          sx={{ mb: '24px' /* mb = marginBottom */}}
          slotProps={{
            input: {
              endAdornment:
                <InputAdornment position="end">
                  <IconButton
                    aria-label="alterna a visibilidade da senha"
                    onClick={handleShowPasswordClick}
                    edge="end"
                  >
                    { showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
            }
          }}
        />

        <Button
          variant="contained"
          type="submit"
          color="secondary"
          fullWidth
        >
          Enviar
        </Button>

      </form>
    </Paper>
  </>
}