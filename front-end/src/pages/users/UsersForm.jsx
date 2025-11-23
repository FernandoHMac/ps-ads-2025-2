import React from 'react'


import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'


import { useNavigate, useParams } from 'react-router-dom'


import fetchAuth from '../../lib/fetchAuth'


import { feedbackConfirm, feedbackWait, feedbackNotify } from '../../ui/Feedback'


export default function UsersForm() {
 /*
   Por padrão, todos os campos do formulário terão como
   valor inicial uma string vazia (exceto os booleanos)
 */
 const formDefaults = {
   fullname: '',
   username: '',
   email: '',
   confirm_email: '',
   password: '',
   confirm_password: '',
   is_admin: false
 }


 const [state, setState] = React.useState(() => ({
   user: { ...formDefaults },
   showPasswordFields: false,
   formModified: false,
   inputErrors: {}
 }))
 const {
   user,
   showPasswordFields,
   formModified,
   inputErrors
 } = state


 const params = useParams()
 const navigate = useNavigate()


 function handleFieldChange(event) {
   const userCopy = { ...user }


   if(event.target.name === 'is_admin') {
     userCopy.is_admin = event.target.checked
   }
   else {
     userCopy[event.target.name] = event.target.value
   }


   setState({ ...state, user: userCopy, formModified: true })
 }


 async function handleFormSubmit(event) {
   event.preventDefault()  // Evita o recarregamento da página
   feedbackWait(true)
   try {
     // Limpa as mensagens de erro
     setState({ ...state, inputErrors: {} })


     // Validação dos campos de senha e e-mail
     user.email = user.email.toLowerCase()
     user.confirm_email = user.confirm_email.toLowerCase()
    
     const msg = []


     if(user.email !== user.confirm_email) {
       msg.push('A confirmação do e-mail não coincide com o e-mail')
       const inputErrorsCopy = { ...inputErrors, confirm_email: msg.at(-1) }
       setState({ ...state, inputErrors: inputErrorsCopy })
     }


     /*
       A validação da senha somente será processada se os respectivos
       campos estiverem visíveis
     */
     if(showPasswordFields && user.password !== user.confirm_password) {
       msg.push('A confirmação da senha não coincide com a senha.')
       const inputErrorsCopy = { ...inputErrors, confirm_password: msg.at(-1) }
       setState({ ...state, inputErrors: inputErrorsCopy })
     }


     // Lançamos uma exceção com todas as mensagens de erro caso
     // tenha havido erros de validação
     if(msg.length > 0) throw new Error(msg.join('\n'))


     // Apaga os campos de confirmação do objeto de dados que será
     // enviado ao back-end
     delete user.confirm_email
     delete user.confirm_password


     // Se os campos de senha não estiverem visíveis, apaga também o
     // campo 'password'
     if(!showPasswordFields) delete user.password


     /*
       Se houver parâmetro na rota, significa que estamos modificando um
       usuário existente. A requisição será enviada ao back-end usando o
       método PUT
     */
     if(params.id) await fetchAuth.put(`/users/${params.id}`, user)
     /*
       Caso contrário, estamos criando um novo usuário, e enviaremos a
       requisição com o método POST
     */
     else await fetchAuth.post('/users', user)


     /*
       A requisição sendo bem-sucedida, vamos exibir a mensagem de feedback
       que, quando for fechada, nos enviará de volta para a listagem de
       usuários
     */
     feedbackNotify('Item salvo com sucesso.', 'success', 2500, () => {
       navigate('..', { relative: 'path', replace: true })
     })
   }
   catch(error) {
     console.error(error)
     feedbackNotify(error.message, 'error')
   }
   finally {
     feedbackWait(false)
   }
 }


 async function loadData() {
   feedbackWait(true)
   try {
     let userTemp = { ...formDefaults }


     /*
       Se houver parâmetro na rota, precisamos buscar o usuário
       para ser editado
     */
     if(params.id) {
       userTemp = await fetchAuth.get(`/users/${params.id}`)
       // Iniciamos o campo 'confirm_email' com o mesmo valor de 'email'
       userTemp.confirm_email = userTemp.email
     }


     /*
       Se não houver parâmetro na rota, significa que estamos cadastrando
       um novo usuário e que, portanto, os campos de senha devem ser
       exibidos. Caso contrário, havendo o parâmetro, estaremos editando
       um usuário existente e os campos de senha não serão exibidos por
       padrão
     */
     setState({ ...state, user: userTemp, showPasswordFields: !(params.id) })
    
   }
   catch(error) {
     console.error(error)
     feedbackNotify(error.message, 'error')
   }
   finally {
     feedbackWait(false)
   }
 }


 /*
   useEffect() que será executado apenas uma vez, no carregamento da página
 */
 React.useEffect(() => {
   loadData()
 }, [])


 async function handleBackButtonClick() {
   if(formModified &&
     !(await feedbackConfirm('Há informações não salvas. Deseja realmente sair?'))) return   // Sai da função sem fazer nada


   // Navega de volta para a página de listagem
   navigate('..', { relative: 'path', replace: true })
 }


 return <>
   <Typography variant="h1" gutterBottom>
     { params.id ? `Editar usuário #${params.id}` : 'Cadastrar novo usuário' }
   </Typography>


   <Box className="form-fields">
     <form onSubmit={handleFormSubmit}>


       <TextField
         name="fullname"
         label="Nome completo"
         variant="filled"
         required
         fullWidth
         value={user.fullname}
         onChange={handleFieldChange}
         helperText={inputErrors?.fullname}
         error={inputErrors?.fullname}
       />


       <TextField
         name="username"
         label="Nome de usuário"
         variant="filled"
         required
         fullWidth
         value={user.username}
         onChange={handleFieldChange}
         helperText={inputErrors?.username}
         error={inputErrors?.username}
       />


       <TextField
         name="email"
         label="E-mail"
         variant="filled"
         required
         fullWidth
         value={user.email}
         onChange={handleFieldChange}
         helperText={inputErrors?.email}
         error={inputErrors?.email}
       />


       <TextField
         name="confirm_email"
         label="Confirme o e-mail"
         variant="filled"
         required
         fullWidth
         value={user.confirm_email}
         onChange={handleFieldChange}
         helperText={inputErrors?.confirm_email}
         error={inputErrors?.confirm_email}
       />


       <div class="MuiFormControl-root">
         <FormControlLabel
           control={
             <Checkbox
               name="is_admin"
               variant="filled"
               value={user.is_admin}
               checked={user.is_admin}
               onChange={handleFieldChange}
               color="primary"
             />
           }
           label="É admin?"
         />
       </div>


       { params.id &&
         <div class="MuiFormControl-root">
           <FormControlLabel
             control={
               <Checkbox
                 name="change_password"
                 variant="filled"
                 value={showPasswordFields}
                 checked={showPasswordFields}
                 onChange={
                   () => setState({ ...state, showPasswordFields: !showPasswordFields})
                 }
                 color="primary"
               />
             }
             label="Alterar senha"
           />
         </div>
       }


       { showPasswordFields &&
         <TextField
           name="password"
           label="Senha"
           variant="filled"
           required={showPasswordFields}
           fullWidth
           type="password"
           value={user.password}
           onChange={handleFieldChange}
           helperText={inputErrors?.password}
           error={inputErrors?.password}
         />
       }


       { showPasswordFields &&
         <TextField
           name="confirm_password"
           label="Confirme a senha"
           variant="filled"
           required={showPasswordFields}
           fullWidth
           type="password"
           value={user.confirm_password}
           onChange={handleFieldChange}
           helperText={inputErrors?.confirm_password}
           error={inputErrors?.confirm_password}
         />
       }


       <Box sx={{
         display: 'flex',
         justifyContent: 'space-around',
         width: '100%'
       }}>
         <Button variant="contained" color="secondary" type="submit">
           Salvar
         </Button>
         <Button variant="outlined" onClick={handleBackButtonClick}>
           Voltar
         </Button>
       </Box>


     </form>


     <Box sx={{
       fontFamily: 'monospace',
       display: 'flex',
       width: '100%'
     }}>
       { JSON.stringify(user) }
     </Box>


   </Box>
 </>
}
