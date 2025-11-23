import Typography from '@mui/material/Typography'
import * as React from 'react';
import Paper from '@mui/material/Paper';
import { DataGrid } from '@mui/x-data-grid';
import { feedbackWait, feedbackNotify, feedbackConfirm } from '../../ui/Feedback'
import EditIcon from '@mui/icons-material/Edit'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import IconButton from '@mui/material/IconButton'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import AddCircleIcon from '@mui/icons-material/AddCircle'


import fetchAuth from '../../lib/fetchAuth'


export default function UsersList() {


 const columns = [
   {
     field: 'id',
     headerName: 'Cód.',
     width: 90
   },
   {
     field: 'fullname',
     headerName: 'Nome completo',
     width: 240
   },
   {
     field: 'username',
     headerName: 'Nome de usuário',
     width: 150,
   },
   {
     field: 'email',
     headerName: 'E-mail',
     width: 200,
   },
   {
     field: 'is_admin',
     headerName: 'É admin?',
     width: 150,
     renderCell: (params) => (params.row.is_admin ? <CheckBoxIcon /> : '')
   },
   {
     field: '_actions',
     headerName: 'Ações',
     width: 150,
     sortable: false,
     renderCell: (params) => {
       return <>
       {/* Link para a página de edição do carro */}
         <Link to={'./' + params.id}>
           <IconButton aria-label="editar">
             <EditIcon />
           </IconButton>
         </Link>


         {/* Botão para excluir o carro */}
         <IconButton
           aria-label="excluir"
           onClick={() => handleDeleteButtonClick(params.id)}
         >
           <DeleteForeverIcon color="error" />
         </IconButton>
       </>
     }
   }
 ];


 const [state, setState] = React.useState({
   cars: []
 });
 const {
   cars
 } = state


 React.useEffect(() => {
   loadData()
 }, [])  // Vetor de dependências vazio, executa uma vez no mount


 // Função para carregar os dados da API
 async function loadData() {
   feedbackWait(true)
   try {
     const result = await fetchAuth.get('/users')


     setState({ ...state, cars: result })
   }
   catch (error) {
     console.log(error)
     feedbackNotify('ERRO: ' + error.message, 'error')
   }
   finally {
     feedbackWait(false)
   }
 }


 // Função para excluir um carro
 async function handleDeleteButtonClick(id) {
   if(await feedbackConfirm('Deseja realmente excluir este item?')) {
     feedbackWait(true)
     try {
       // Envia a requisição para exclusão
       await fetchAuth.delete(`/users/${id}`)


       // Atualiza os dados do datagrid
       loadData()
       feedbackNotify('Exclusão efetuada com sucesso.')
     }
     catch (error) {
       console.log(error)
       feedbackNotify('ERRO: ' + error.message, 'error')
     }
     finally {
       feedbackWait(false)
     }
   }
 }


 return (
   <>
     { /* gutterBottom coloca um espaçamento extra abaixo do componente */ }
     <Typography variant="h1" gutterBottom>
       Listagem de usuários
     </Typography>


     <Box sx={{
       display: 'flex',
       justifyContent: 'right', // Alinhado à direita
       mb: 2   // Margem inferior (margin-bottom)
     }}>
       <Link to="./new">
         <Button
           variant="contained"
           size="large"
           color="secondary"
           startIcon={ <AddCircleIcon /> }
         >
           Novo usuário
         </Button>
       </Link>
     </Box>


     <Paper elevation={8} sx={{ height: 400, width: '100%' }}>
       <DataGrid
         rows={cars}
         columns={columns}
         initialState={{
           pagination: {
             paginationModel: {
               pageSize: 5,
             },
           },
         }}
         pageSizeOptions={[5]}
         checkboxSelection
         disableRowSelectionOnClick
       />
     </Paper>
   </>
 )
}
