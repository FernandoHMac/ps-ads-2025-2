
import React from 'react'

/*
  Em React, um contexto (context) é um recurso que permite
  compartilhar informações entre diversos componentes, em
  diferentes partes da aplicação.

  Este contexo será usado para armazenar informações do 
  usuário autenticado. Ele será preenchido quando for feito
  o login, e as informações serão consumidas, por exemplo,
  para mostrar o nome do usuário autenticado na barra superior.
*/
const AuthContext = React.createContext()

export default AuthContext

