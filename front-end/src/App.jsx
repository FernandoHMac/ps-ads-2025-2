import React from 'react'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import './App.css'
import {BrowserRouter } from 'react-router-dom'

import  CssBaseline  from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'

import TopBar from './ui/TopBar'
import FooterBar from './ui/FooterBar'

import theme from './ui/theme'
import { ThemeProvider } from '@mui/material/styles'

import AppRoutes from './routes/AppRoutes'

import AuthContext from './contexts/AuthContext'
import fetchAuth from './lib/fetchAuth'

function App() {

  const [authState, setAuthState] = React.useState({
    authUser: null,
    redirectTo: null
  })
  const {
    authUser,
    redirectTo
  } = authState

  // Função que pergunta para o back-end se há algum usuário
  // autenticado assim que a aplicação é iniciada.
  // Essa informação é guardada na variável de estado state.user.
  async function fetchAuthUser() {
    try {
      const result = await fetchAuth.get('/users/me')
      setAuthState({ ...authState, authUser: result })
      console.log('Usuário autenticado:', result)
    }
    catch(error) {
      console.error(error)
    }
  }

  // useEffect com vetor de dependências vazio para executar apenas
  // uma vez, no carregamento da aplicação
  React.useEffect(() => {
    fetchAuthUser()
  }, [])

  return (
    <>
    <ThemeProvider theme={theme}>
      <CssBaseline/> {/*Reseta o CSS */}

      <BrowserRouter>
        {/* Qualquer componente carregado entre <AuthContext.Provider> e 
            </AuthContext.Provider> poderá acessar os dados compartilhados
            por AuthProvider por meio do 'value'
        */}
        <AuthContext.Provider value={{ authState, setAuthState }} >
          
          <TopBar/>

          <Box id="innerRoot" sx={{
            m: '48px 24px'
          }}>
            <AppRoutes/>
          </Box>
          
          <FooterBar/>
        
        </AuthContext.Provider>
      </BrowserRouter>
    </ThemeProvider>
    </>
  )
}

export default App