'use client'

import { useEffect, useState, useCallback } from "react"
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  Typography,
  Chip,
  Box,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Menu,
} from "@mui/material"
import { MoreVert as MoreVertIcon } from "@mui/icons-material"
import { useFetch } from "@/app/_hooks"
import { getAllUsers, patchTurnUserIntoBarber } from "@/app/_services"
import { GetAllUsersResponse } from "@/app/_services/backend/types"
import { HttpResponse, UserTypesEnum } from "@/app/types"
import { useDebounce } from "@/app/_utils"

export default function Users() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [nameFilter, setNameFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<UserTypesEnum | undefined>(undefined);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<{ id: string, name: string } | null>(null);

  const debouncedName = useDebounce(nameFilter, 500);

  const {
    response,
    isLoading,
    runFetch,
  } = useFetch<HttpResponse<GetAllUsersResponse>>();

  const {
    isLoading: isPatching,
    response: patchResponse,
    runFetch: runPatch,
  } = useFetch();

  const fetchUsers = useCallback(() => {
    runFetch(
      getAllUsers({
        skip: page * rowsPerPage,
        take: rowsPerPage,
        name: debouncedName ?? undefined,
        userTypeId: userTypeFilter ?? undefined,
      })
    );
  }, [page, rowsPerPage, runFetch, debouncedName, userTypeFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (patchResponse) {
      fetchUsers();
    }
  }, [patchResponse, fetchUsers]);

  useEffect(() => {
    setPage(0);
  }, [debouncedName]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, userId: string, userName: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser({ id: userId, name: userName });
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleTurnIntoBarber = () => {
    if (selectedUser) {
      runPatch(patchTurnUserIntoBarber({ userId: selectedUser.id }));
    }
    handleCloseMenu();
  };

  const users = response?.data?.users || [];
  const totalCount = response?.data?.totalCount || 0;

  const getUserRoleLabel = (roleId: UserTypesEnum) => {
    switch (roleId) {
      case UserTypesEnum.BARBER:
        return { label: 'Barbeiro', color: 'primary' as const };
      case UserTypesEnum.CUSTOMER:
        return { label: 'Cliente', color: 'secondary' as const };
      default:
        return { label: 'Desconhecido', color: 'default' as const };
    }
  };

  return (
    <Box className="flex flex-col gap-6">
      <Typography variant="h4" component="h1" className="font-bold text-white">
        Listagem de Usuários
      </Typography>

      <Box className="flex flex-col md:flex-row gap-4">
        <TextField
          label="Filtrar por nome"
          variant="filled"
          size="small"
          value={nameFilter}
          onChange={(e) => {
            setNameFilter(e.target.value);
          }}
          sx={{ 
            bgcolor: '#1A1A1A', 
            borderRadius: '4px',
            flexGrow: 2,
            '& .MuiInputLabel-root': { color: '#888' }, 
            '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' },
            '& .MuiFilledInput-root': { color: 'white' },
            '& .MuiFilledInput-underline:before': { borderBottomColor: '#333' }
          }}
        />
        <FormControl variant="filled" size="small" sx={{ minWidth: 200, bgcolor: '#1A1A1A', borderRadius: '4px', flexGrow: 1 }}>
          <InputLabel sx={{ color: '#888', '&.Mui-focused': { color: 'primary.main' } }}>Tipo de Usuário</InputLabel>
          <Select
            value={userTypeFilter}
            onChange={(e) => {
              setUserTypeFilter(e.target.value as UserTypesEnum || undefined) 
              setPage(0);
            }}
            sx={{ 
              color: 'white', 
              '& .MuiSelect-icon': { color: 'white' },
              '& .MuiFilledInput-underline:before': { borderBottomColor: '#333' }
            }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value={UserTypesEnum.BARBER}>Barbeiro</MenuItem>
            <MenuItem value={UserTypesEnum.CUSTOMER}>Cliente</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden', bgcolor: '#1A1A1A', color: 'white' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
          <Table stickyHeader aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: '#262626', color: 'white', fontWeight: 'bold', width: '45%' }} variant={"head"}>Nome</TableCell>
                <TableCell sx={{ bgcolor: '#262626', color: 'white', fontWeight: 'bold', width: '15%' }} variant={"head"}>Tipo</TableCell>
                <TableCell sx={{ bgcolor: '#262626', color: 'white', fontWeight: 'bold', width: '15%' }} variant={"head"} align="right">Agendamentos Marcados</TableCell>
                <TableCell sx={{ bgcolor: '#262626', color: 'white', fontWeight: 'bold', width: '15%' }} variant={"head"} align="right">Agendamentos Realizados</TableCell>
                <TableCell sx={{ bgcolor: '#262626', color: 'white', fontWeight: 'bold', width: '10%' }} variant={"head"} align="center">Opções</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading || isPatching ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                    <CircularProgress color="primary" />
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((user) => {
                  const role = getUserRoleLabel(user.userTypeId);
                  return (
                    <TableRow hover key={user.id} sx={{ '&:hover': { bgcolor: '#333333 !important' } }}>
                      <TableCell sx={{ color: 'white', borderBottom: '1px solid #333', width: '45%' }}>
                        {user.name}
                      </TableCell>
                      <TableCell sx={{ color: 'white', borderBottom: '1px solid #333', width: '15%' }}>
                        <Chip 
                          label={role.label} 
                          color={role.color} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'white', borderBottom: '1px solid #333', width: '15%' }} align="right">
                        {user.scheduledAppointmentsAmmount}
                      </TableCell>
                      <TableCell sx={{ color: 'white', borderBottom: '1px solid #333', width: '15%' }} align="right">
                        {user.ownedAppointmentsAmmount}
                      </TableCell>
                      <TableCell sx={{ color: 'white', borderBottom: '1px solid #333', width: '10%' }} align="center">
                        <IconButton 
                          onClick={(e) => handleOpenMenu(e, user.id, user.name)}
                          sx={{ color: 'white' }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 10, color: 'gray' }}>
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ 
            bgcolor: '#262626', 
            color: 'white',
            '.MuiTablePagination-selectIcon': { color: 'white' },
            '.MuiTablePagination-actions': { color: 'white' }
          }}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
        />
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            bgcolor: '#262626',
            color: 'white',
            border: '1px solid #444',
          }
        }}
      >
        <MenuItem 
          onClick={handleTurnIntoBarber}
          disabled={users.find(u => u.id === selectedUser?.id)?.userTypeId === UserTypesEnum.BARBER}
        >
          Dar acesso de barbeiro
        </MenuItem>
      </Menu>
    </Box>
  )
}
