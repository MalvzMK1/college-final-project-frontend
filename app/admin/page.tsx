'use client'

import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../_contexts"
import { UserTypesEnum, AppointmentStatusEnum } from "../types"
import { useRouter } from "next/navigation"
import { getWeekAppointments, patchUpdateScheduleStatus } from "../_services"
import { GetWeekAppointmentsResponse } from "../_services/backend/types"

import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Stack,
  Divider,
  Snackbar,
  Alert,
  Tooltip,
  Paper,
  IconButton,
} from '@mui/material'

import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  StickyNote2 as NoteIcon,
  CalendarMonth as CalendarIcon,
  PendingActions as PendingIcon,
} from '@mui/icons-material'

export default function Admin() {
  const router = useRouter();
  const { authLoaded, user } = useContext(AuthContext);

  const [refDate, setRefDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<GetWeekAppointmentsResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const getStartOfWeek = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);

    return start;
  };

  const getEndOfWeek = (startOfWeek: Date) => {
    const end = new Date(startOfWeek);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return end;
  };

  const getWeekDays = (startOfWeek: Date) => {
    const days = [];
    const dayNames = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado'
    ];

    for (let i = 0; i < 7; i++) {
      const current = new Date(startOfWeek);
      current.setDate(startOfWeek.getDate() + i);
      days.push({
        name: dayNames[i],
        date: current,
        formattedDate: current.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        dateString: getLocalDateString(current)
      });
    }

    return days;
  };

  const startOfWeek = getStartOfWeek(refDate);
  const endOfWeek = getEndOfWeek(startOfWeek);
  const weekDays = getWeekDays(startOfWeek);

  const getAppointmentLocalDateString = (dateTimeStr: Date | string) => {
    const date = new Date(dateTimeStr);

    return getLocalDateString(date);
  };

  const formatWeekRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const endStr = end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return `Semana: ${startStr} a ${endStr}`;
  };

  const formatTime = (dateTimeStr: Date | string) => {
    const date = new Date(dateTimeStr);

    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusConfig = (statusId: number | undefined) => {
    switch (statusId) {
      case AppointmentStatusEnum.PENDING:
        return {
          label: 'Aguardando',
          color: 'warning' as const,
          bg: '#FFF8E1',
          text: '#B78103'
        };
      case AppointmentStatusEnum.APPROVED:
        return {
          label: 'Confirmado',
          color: 'success' as const,
          bg: '#E8F5E9',
          text: '#2E7D32'
        };
      case AppointmentStatusEnum.REJECTED:
        return {
          label: 'Recusado',
          color: 'error' as const,
          bg: '#FFEBEE',
          text: '#C62828'
        };
      case AppointmentStatusEnum.COMPLETED:
        return {
          label: 'Concluído',
          color: 'info' as const,
          bg: '#E3F2FD',
          text: '#1565C0'
        };
      case AppointmentStatusEnum.NO_SHOW:
        return {
          label: 'Falta',
          color: 'default' as const,
          bg: '#ECEFF1',
          text: '#455A64'
        };
      case AppointmentStatusEnum.CANCELED:
        return {
          label: 'Cancelado',
          color: 'default' as const,
          bg: '#F5F5F5',
          text: '#616161'
        };
      default:
        return {
          label: 'Desconhecido',
          color: 'default' as const,
          bg: '#F5F5F5',
          text: '#616161'
        };
    }
  };

  const fetchWeekAppointments = async (date: Date) => {
    setLoading(true);

    try {
      const dateStr = getLocalDateString(date);
      const res = await getWeekAppointments(dateStr);

      if (res.data && res.data.data) {
        console.log("Appointments API Response:", res.data.data);
        setAppointments(res.data.data);
      } else {
        console.log("Appointments API returned no data");
        setAppointments([]);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);

      setSnackbar({
        open: true,
        message: 'Erro ao carregar os agendamentos da semana.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoaded) return;

    if (authLoaded && !user) {
      router.push('/login');
      return;
    }

    if (user?.roleId !== UserTypesEnum.BARBER) {
      router.push('../');
      return;
    }

    fetchWeekAppointments(refDate);
  }, [user, authLoaded, refDate]);

  const handleUpdateStatus = async (appointmentId: number, statusId: AppointmentStatusEnum) => {
    setUpdatingIds(prev => {
      const next = new Set(prev);
      next.add(appointmentId);
      return next;
    });

    try {
      await patchUpdateScheduleStatus({
        barberId: user?.id || '',
        appointmentId,
        statusId
      });

      setAppointments(prev => prev.map(appt => {
        if (appt.id === appointmentId) {
          return {
            ...appt,
            status: {
              id: statusId,
              name: statusId === AppointmentStatusEnum.APPROVED ? 'APPROVED' : 'REJECTED'
            }
          };
        }

        return appt;
      }));

      setSnackbar({
        open: true,
        message: statusId === AppointmentStatusEnum.APPROVED
          ? 'Agendamento aceito com sucesso!'
          : 'Agendamento recusado com sucesso.',
        severity: statusId === AppointmentStatusEnum.APPROVED ? 'success' : 'info'
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar o status do agendamento.',
        severity: 'error'
      });
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(appointmentId);
        return next;
      });
    }
  };

  const handlePrevWeek = () => {
    const prev = new Date(refDate);
    prev.setDate(prev.getDate() - 7);
    setRefDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(refDate);
    next.setDate(next.getDate() + 7);
    setRefDate(next);
  };

  const handleToday = () => {
    setRefDate(new Date());
  };

  if (!user) return <></>;

  const pendingCount = appointments.filter(
    appt => appt.status?.id === AppointmentStatusEnum.PENDING
  ).length;

  return (
    <Box className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Box className="flex items-center gap-3">
          <CalendarIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h4" component="h1" className="font-bold text-white">
            Agenda da Semana
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#1A1A1A',
            border: '1px solid #333',
            borderRadius: 2,
            p: 0.5
          }}
        >
          <Tooltip title="Semana Anterior">
            <IconButton onClick={handlePrevWeek} sx={{ color: 'white' }}>
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
          <Button
            onClick={handleToday}
            startIcon={<TodayIcon />}
            sx={{
              color: 'white',
              px: 2,
              fontWeight: 'medium',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
            }}
          >
            Hoje
          </Button>
          <Tooltip title="Próxima Semana">
            <IconButton onClick={handleNextWeek} sx={{ color: 'white' }}>
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
        </Paper>
      </Box>

      <Typography variant="subtitle1" sx={{ color: '#aaa', mt: -2 }}>
        {formatWeekRange(startOfWeek, endOfWeek)}
      </Typography>

      {pendingCount > 0 && (
        <Alert
          severity="warning"
          variant="outlined"
          icon={<PendingIcon />}
          sx={{
            bgcolor: 'rgba(242, 142, 19, 0.05)',
            borderColor: 'rgba(242, 142, 19, 0.3)',
            color: '#F28E13',
            borderRadius: 2,
            '& .MuiAlert-icon': { color: '#F28E13' }
          }}
        >
          Você tem <strong>{pendingCount}</strong> {pendingCount === 1 ? 'agendamento pendente' : 'agendamentos pendentes'} aguardando sua confirmação nesta semana.
        </Alert>
      )}

      {loading ? (
        <Box className="flex justify-center items-center py-20">
          <CircularProgress color="primary" size={50} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {weekDays.map((day) => {
            const dayAppointments = appointments.filter((appt) => {
              const apptDateStr = getAppointmentLocalDateString(appt.dateTime);
              console.log(`Comparing appointment ${appt.id}: apptDateStr="${apptDateStr}" with day.dateString="${day.dateString}" (Match: ${apptDateStr === day.dateString})`);
              return apptDateStr === day.dateString;
            });

            const isToday = getLocalDateString(new Date()) === day.dateString;

            return (
              <Grid item xs={12} md={6} lg={4} key={day.dateString}>
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: '#1A1A1A',
                    borderRadius: 3,
                    border: isToday ? '1.5px solid #F28E13' : '1px solid #2A2A2A',
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      px: 3,
                      py: 2,
                      bgcolor: isToday ? 'rgba(242, 142, 19, 0.1)' : '#262626',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="h6" className="font-bold text-white text-base">
                      {day.name}
                    </Typography>
                    <Chip
                      label={`${day.formattedDate}${isToday ? ' (Hoje)' : ''}`}
                      size="small"
                      color={isToday ? 'primary' : 'default'}
                      variant={isToday ? 'filled' : 'outlined'}
                      sx={{
                        fontWeight: 'bold',
                        color: 'white',
                        borderColor: isToday ? 'primary.main' : '#444'
                      }}
                    />
                  </Box>
                  <Divider sx={{ borderColor: '#2A2A2A' }} />

                  <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayAppointments.length === 0 ? (
                      <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, my: 'auto' }}>
                        <CalendarIcon sx={{ color: '#444', fontSize: 36 }} />
                        <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
                          Nenhum agendamento
                        </Typography>
                      </Box>
                    ) : (
                      dayAppointments.map((appt) => {
                        const statusConfig = getStatusConfig(appt.status?.id);
                        const isPending = appt.status?.id === AppointmentStatusEnum.PENDING;
                        const isUpdating = updatingIds.has(appt.id);

                        return (
                          <Card
                            key={appt.id}
                            elevation={0}
                            sx={{
                              bgcolor: '#121212',
                              border: '1px solid #222',
                              borderRadius: 2,
                              position: 'relative',
                              overflow: 'visible',
                            }}
                          >
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <PersonIcon sx={{ color: '#888', fontSize: 18 }} />
                                  <Typography variant="body1" className="font-semibold text-white" sx={{ fontSize: '0.95rem' }}>
                                    {appt.customerName}
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

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: '#aaa' }}>
                                <AccessTimeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  {formatTime(appt.dateTime)}
                                </Typography>
                              </Box>

                              {appt.note && (
                                <Box
                                  sx={{
                                    display: 'flex',
                                    gap: 1,
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: 'rgba(255,255,255,0.02)',
                                    borderLeft: '2px solid #555',
                                    mt: 1,
                                    mb: isPending ? 2 : 0
                                  }}
                                >
                                  <NoteIcon sx={{ fontSize: 14, color: '#666', mt: 0.2 }} />
                                  <Typography variant="caption" sx={{ color: '#888', fontStyle: 'italic', wordBreak: 'break-word' }}>
                                    {appt.note}
                                  </Typography>
                                </Box>
                              )}

                              {isPending && (
                                <Box sx={{ mt: 1.5 }}>
                                  <Divider sx={{ borderColor: '#222', mb: 1.5 }} />
                                  <Stack direction="row" spacing={1}>
                                    <Button
                                      fullWidth
                                      size="small"
                                      variant="contained"
                                      color="success"
                                      startIcon={isUpdating ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
                                      onClick={() => handleUpdateStatus(appt.id, AppointmentStatusEnum.APPROVED)}
                                      disabled={isUpdating}
                                      sx={{
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        borderRadius: 1.5,
                                        boxShadow: 'none',
                                        '&:hover': { boxShadow: 'none' }
                                      }}
                                    >
                                      Aceitar
                                    </Button>
                                    <Button
                                      fullWidth
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      startIcon={isUpdating ? <CircularProgress size={16} color="inherit" /> : <CloseIcon />}
                                      onClick={() => handleUpdateStatus(appt.id, AppointmentStatusEnum.REJECTED)}
                                      disabled={isUpdating}
                                      sx={{
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        borderRadius: 1.5,
                                        borderColor: 'rgba(211, 47, 47, 0.4)',
                                        '&:hover': {
                                          borderColor: 'error.main',
                                          bgcolor: 'rgba(211, 47, 47, 0.05)'
                                        }
                                      }}
                                    >
                                      Recusar
                                    </Button>
                                  </Stack>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

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
