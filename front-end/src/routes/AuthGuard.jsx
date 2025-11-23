import React from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { feedbackWait } from '../ui/Feedback'
import AuthContext from '../contexts/AuthContext'
import fetchAuth from '../lib/fetchAuth'

import { UserLevel } from './routes'

export default function AuthGuard({ children, userLevel = UserLevel.ANY }) {
  
  const { authState, setAuthState } = React.useContext(AuthContext)
  const {
    authUser
  } = authState

  const [status, setStatus] = React.useState('IDLE')

  const navigate = useNavigate()
  const location = useLocation()

  async function checkAuthUser() {
    /*
      Sempre que se tentar acessar uma nova rota de front-end, esta
      função será executada para consultar o back-end se há um usuário
      autenticado
    */
    setStatus('PROCESSING')
    feedbackWait(true)
    try {
      const user = await fetchAuth.get('/users/me')
      setAuthState({ ...authState, authUser: user })
    }
    catch(error) {
      setAuthState({ ...authState, authUser: null })
      console.error(error)
      navigate('/login', { replace: true })
    }
    finally {
      feedbackWait(false)
      setStatus('DONE')
    }
  }

  // Este useEffect será executado sempre que a rota (location) for alterada
  React.useEffect(() => {
    /*
      Salva a rota atual para posterior redirecionamento (caso a rota atual
      não seja o próprio login)
    */
    if(! location.pathname.includes('login')) {
      setAuthState({ ...authState, redirectTo: location })
    }

    checkAuthUser()
  }, [location])

  if(['IDLE', 'PROCESSING'].includes(status)) return <></>

  /*
    Se não há usuário autenticado e o nível de acesso assim o
    exige, redirecionamos para a página de login
  */
  if(!authUser && userLevel > UserLevel.ANY) {
    console.log({authUser, userLevel})
    return <Navigate to="/login" replace />
  }

  /*
    Senão, se há um usuário não administrador tentando acessar uma
    rota de nível UserLevel.ADMIN, mostramos uma mensagem de acesso negado
  */
  if(!(authUser?.is_admin) && userLevel === UserLevel.ADMIN) return (
    <Box>
      <Typography variant="h2" color="error">
        Acesso negado
      </Typography>
    </Box>
  )

  /*
    Se chegou até aqui, é porque a rota é liberada para qualquer
    um ou o usuário possui autorização para acessar o
    nível
  */
  return children
}