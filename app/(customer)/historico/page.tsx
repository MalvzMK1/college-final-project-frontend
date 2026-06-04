'use client'

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../_contexts";
import { getLastYearCustomerAppointments, patchCustomerCancelAppointment } from "../../_services/backend/route-requests";
import { GetLastAppointmentsOutputDTO } from "../../_services/backend/types";
import { AppointmentStatusEnum } from "../../types";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Divider,
  Snackbar,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  History as HistoryIcon,
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

export default function CustomerHistory() {
  const router = useRouter();
  const { authLoaded, user } = useContext(AuthContext);

  const [appointments, setAppointments] = useState<GetLastAppointmentsOutputDTO>([] as GetLastAppointmentsOutputDTO);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Dialog and cancel states
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [apptToCancel, setApptToCancel] = useState<GetLastAppointmentsOutputDTO[number] | null>(null);
  const [canceling, setCanceling] = useState<boolean>(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getLastYearCustomerAppointments();
      if (res.status === 200 && res.data.data) {
        setAppointments(res.data.data);
      } else {
        setAppointments([]);
      }
    } catch (err: unknown) {
      console.error("Error fetching customer appointments:", err);
      const axiosError = err as { response?: { data?: { message?: string | string[] } } };
      const rawMessage = axiosError.response?.data?.message;
      let errMsg = 'Erro ao carregar o histórico de agendamentos.';
      
      if (typeof rawMessage === 'string') {
        errMsg = rawMessage;
      } else if (Array.isArray(rawMessage)) {
        errMsg = rawMessage.join(', ');
      }

      setSnackbar({
        open: true,
        message: errMsg,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoaded && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchAppointments();
    }
  }, [authLoaded, user, router]);

  const handleOpenConfirm = (appt: GetLastAppointmentsOutputDTO[number]) => {
    setApptToCancel(appt);
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    if (canceling) return; // Prevent closing while API request is in progress
    setApptToCancel(null);
    setConfirmOpen(false);
  };

  const handleCancelAppointment = async () => {
    if (!apptToCancel) return;
    setCanceling(true);

    try {
      const res = await patchCustomerCancelAppointment(apptToCancel.id);
      
      if (res.status === 200 || res.status === 204) {
        const successMsg = res.data?.message || 'Agendamento cancelado com sucesso!';
        setSnackbar({
          open: true,
          message: successMsg,
          severity: 'success'
        });
        // Refresh appointments list
        await fetchAppointments();
      } else {
        throw new Error("Erro na resposta da API");
      }
    } catch (err: unknown) {
      console.error("Error canceling appointment:", err);
      
      const axiosError = err as { response?: { data?: { message?: string | string[] } } };
      const rawMessage = axiosError.response?.data?.message;
      let errMsg = 'Erro ao cancelar o agendamento.';
      
      if (typeof rawMessage === 'string') {
        errMsg = rawMessage;
      } else if (Array.isArray(rawMessage)) {
        errMsg = rawMessage.join(', ');
      }
      
      setSnackbar({
        open: true,
        message: errMsg,
        severity: 'error'
      });
    } finally {
      setCanceling(false);
      setConfirmOpen(false);
      setApptToCancel(null);
    }
  };

  const formatDateTime = (dateStr: Date | string) => {
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeFormatted = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${dateFormatted} às ${timeFormatted}`;
  };

  const getStatusConfig = (statusId: number) => {
    switch (statusId) {
      case AppointmentStatusEnum.PENDING:
        return {
          label: 'Aguardando',
          bg: 'rgba(242, 142, 19, 0.1)',
          text: '#F28E13'
        };
      case AppointmentStatusEnum.APPROVED:
        return {
          label: 'Confirmado',
          bg: 'rgba(46, 125, 50, 0.1)',
          text: '#2E7D32'
        };
      case AppointmentStatusEnum.REJECTED:
        return {
          label: 'Recusado',
          bg: 'rgba(198, 40, 40, 0.1)',
          text: '#C62828'
        };
      case AppointmentStatusEnum.COMPLETED:
        return {
          label: 'Concluído',
          bg: 'rgba(21, 101, 192, 0.1)',
          text: '#1565C0'
        };
      case AppointmentStatusEnum.NO_SHOW:
        return {
          label: 'Falta',
          bg: 'rgba(255, 255, 255, 0.05)',
          text: '#888888'
        };
      case AppointmentStatusEnum.CANCELED:
        return {
          label: 'Cancelado',
          bg: 'rgba(255, 255, 255, 0.05)',
          text: '#888888'
        };
      default:
        return {
          label: 'Desconhecido',
          bg: 'rgba(255, 255, 255, 0.05)',
          text: '#888888'
        };
    }
  };

  const checkCancellationEligibility = (dateTimeStr: Date | string, statusId: number) => {
    const allowedStatuses = new Set([AppointmentStatusEnum.PENDING, AppointmentStatusEnum.APPROVED]);
    
    if (!allowedStatuses.has(statusId)) {
      return { allowed: false, hideButton: true };
    }

    const today = new Date();
    const apptDate = new Date(dateTimeStr);

    if (apptDate < today) {
      console.log(apptDate.toISOString(), today.toISOString())
      return { allowed: false, hideButton: true };
    }

    const oneDayInMs = 24 * 60 * 60 * 1000;
    const isMoreThan24Hours = apptDate.getTime() - today.getTime() >= oneDayInMs;

    return {
      allowed: isMoreThan24Hours,
      hideButton: false,
      reason: isMoreThan24Hours ? null : 'Não é possível cancelar com menos de 24h de antecedência.'
    };
  };

  if (!user || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress color="primary" size={50} />
      </Box>
    );
  }

  return (
    <Box className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-6">
      {/* Title */}
      <Box className="flex flex-col gap-1">
        <Box className="flex items-center gap-3">
          <HistoryIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h4" component="h1" className="font-bold text-white">
            Meus Agendamentos
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ color: '#aaa' }}>
          Histórico de agendamentos realizados no último ano.
        </Typography>
      </Box>

      {appointments.length === 0 ? (
        /* Empty State */
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 8,
            bgcolor: '#262626',
            borderRadius: 3,
            border: '1px solid #333',
            textAlign: 'center',
            gap: 2,
            mt: 4
          }}
        >
          <CalendarIcon sx={{ color: '#555', fontSize: 64 }} />
          <Typography variant="h6" className="text-white font-semibold">
            Nenhum agendamento encontrado
          </Typography>
          <Typography variant="body2" sx={{ color: '#888', maxW: '400px' }}>
            Você não realizou nenhum agendamento nos últimos 12 meses. Que tal marcar um horário agora?
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/')}
            sx={{ mt: 2, color: '#FFF', fontWeight: 'bold', px: 4 }}
          >
            Agendar Horário
          </Button>
        </Paper>
      ) : (
        /* Card Grid */
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr',
            },
            gap: 3,
          }}
        >
          {appointments.map((appt) => {
            const statusConfig = getStatusConfig(appt.status.id);
            const cancelEligibility = checkCancellationEligibility(appt.dateTime, appt.status.id);

            return (
              <Card
                key={appt.id}
                elevation={0}
                sx={{
                  bgcolor: '#262626',
                  borderRadius: 3,
                  border: '1px solid #333',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  },
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Card Header (Barber & Status) */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PersonIcon sx={{ color: '#888', fontSize: 20 }} />
                      <Typography variant="h6" className="font-bold text-white" sx={{ fontSize: '1.1rem' }}>
                        {appt.barberName}
                      </Typography>
                    </Stack>
                    <Chip
                      label={statusConfig.label}
                      size="small"
                      sx={{
                        bgcolor: statusConfig.bg,
                        color: statusConfig.text,
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>

                  <Divider sx={{ borderColor: '#333' }} />

                  {/* Card Body (Datetime) */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                      <AccessTimeIcon sx={{ fontSize: 18 }} />
                      <Typography variant="body1" className="font-semibold" sx={{ color: 'white' }}>
                        {formatDateTime(appt.dateTime)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#888' }}>
                      Agendado em: {formatDateTime(appt.createdAt)}
                    </Typography>
                  </Box>

                  {/* Actions Section */}
                  {!cancelEligibility.hideButton && (
                    <Box sx={{ mt: 'auto', pt: 2 }}>
                      <Stack spacing={1}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          disabled={!cancelEligibility.allowed}
                          onClick={() => handleOpenConfirm(appt)}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 'bold',
                            borderRadius: 2,
                            borderColor: cancelEligibility.allowed ? 'rgba(211, 47, 47, 0.4)' : '#444',
                            '&:hover': {
                              borderColor: 'error.main',
                              bgcolor: 'rgba(211, 47, 47, 0.05)',
                            },
                          }}
                        >
                          Cancelar Agendamento
                        </Button>
                        {!cancelEligibility.allowed && cancelEligibility.reason && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#e57373', mt: 0.5 }}>
                            <InfoIcon sx={{ fontSize: 14 }} />
                            <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                              {cancelEligibility.reason}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={handleCloseConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            bgcolor: '#262626',
            color: '#FFF',
            border: '1px solid #444',
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 'bold', pb: 1 }}>
          {"Confirmar cancelamento?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ color: '#aaa', fontSize: '0.95rem' }}>
            Você está prestes a cancelar seu agendamento com <strong>{apptToCancel?.barberName}</strong> marcado para o dia <strong>{apptToCancel && formatDateTime(apptToCancel.dateTime)}</strong>.
            <br />
            <br />
            Esta ação não poderá ser desfeita. Deseja continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleCloseConfirm}
            disabled={canceling}
            sx={{
              color: '#888',
              textTransform: 'none',
              fontWeight: 'semibold'
            }}
          >
            Voltar
          </Button>
          <Button
            onClick={handleCancelAppointment}
            variant="contained"
            color="error"
            disabled={canceling}
            startIcon={canceling ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              color: '#FFF',
              fontWeight: 'bold',
              textTransform: 'none',
              px: 3,
              borderRadius: 2
            }}
          >
            {canceling ? 'Cancelando...' : 'Confirmar Cancelamento'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
