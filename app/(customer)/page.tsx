'use client'

import { useContext, useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation";
import { AuthContext } from "../_contexts";
import { getAvailableHours, postCreateAppointment } from "../_services/backend/route-requests";
import { GetAvailableHoursResponse } from "../_services/backend/types";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";

type HourObj = GetAvailableHoursResponse['days'][number]['hours'][number];

function getLocalYYYYMMDD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Home() {
  const router = useRouter();

  const { authLoaded, user } = useContext(AuthContext);

  const [availableDays, setAvailableDays] = useState<GetAvailableHoursResponse['days']>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedHour, setSelectedHour] = useState<HourObj | null>(null);
  const [selectedBarberId, setSelectedBarberId] = useState<string>('');
  
  const [submitting, setSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const next7Days = useMemo(() => {
    const days = [];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    for (let i = 0; i < 7; i++) {
      const d = new Date(tomorrow);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const loadAvailableHours = async () => {
    setLoading(true);

    const hours = await getAvailableHours();

    if (hours.status === 200 && hours.data.data) {
      setAvailableDays(hours.data.data.days);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (authLoaded && !user) {
      router.push('/login')
    }
  }, [authLoaded, user, router]);

  useEffect(() => {
    if (!user) return;

    loadAvailableHours();
  }, [user]);

  const hoursMapByDate = useMemo(() => {
    const map: Record<string, HourObj[]> = {};
    availableDays.forEach(day => {
      if (day.hours && day.hours.length > 0) {
        const firstHour = new Date(day.hours[0].datetime);
        map[getLocalYYYYMMDD(firstHour)] = day.hours;
      }
    });
    return map;
  }, [availableDays]);

  if (!user || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedHour(null);
    setSelectedBarberId('');
  };

  const handleHourClick = (hour: HourObj) => {
    if (!hour.isAvailable) return;
    setSelectedHour(hour);
    setSelectedBarberId('');
  };

  const handleSubmit = async () => {
    if (!selectedHour || !selectedBarberId) return;
    setSubmitting(true);
    try {
      const res = await postCreateAppointment({
        barberId: selectedBarberId,
        dateTime: new Date(selectedHour.datetime)
      });
      
      const successMsg = res.data?.message || 'Agendamento criado com sucesso!';
      setSnackbar({
        open: true,
        message: successMsg,
        severity: 'success'
      });

      setSelectedDate('');
      setSelectedHour(null);
      setSelectedBarberId('');
      
      const newHoursRes = await getAvailableHours();
      if (newHoursRes.data?.data?.days) {
        setAvailableDays(newHoursRes.data.data.days);
      }
    } catch (e: unknown) {
      console.error(e);
      
      const axiosError = e as { response?: { data?: { message?: string | string[] } } };
      const rawMessage = axiosError.response?.data?.message;
      let errMsg = 'Erro ao criar agendamento.';
      
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
      setSubmitting(false);
    }
  };

  const hoursForSelectedDate = selectedDate ? (hoursMapByDate[selectedDate] || []) : [];
  const availableBarbers = selectedHour ? selectedHour.availableBarbers : [];

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, p: 4, height: '100%' }}>
      <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Typography variant="h5" color="primary.main" fontWeight="bold">
          Dias Disponíveis
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          {next7Days.map((date) => {
            const dateStr = getLocalYYYYMMDD(date);
            const isSelected = selectedDate === dateStr;
            const weekDay = date.toLocaleDateString('pt-BR', { weekday: 'short' });
            const dayNum = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            
            return (
              <Box key={dateStr}>
                <Card 
                  sx={{ 
                    border: isSelected ? '2px solid' : '2px solid transparent',
                    borderColor: isSelected ? 'primary.main' : 'transparent',
                    bgcolor: isSelected ? '#3A3A3A' : '#2A2A2A',
                    color: '#FFF'
                  }}
                >
                  <CardActionArea onClick={() => handleDateClick(dateStr)}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle2" textTransform="capitalize">
                        {weekDay.replace('.', '')}
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {dayNum}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            )
          })}
        </Box>

        {selectedDate && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" color="primary.main" mb={2}>
              Horários para o dia {selectedDate.split('-').reverse().join('/')}
            </Typography>
            {hoursForSelectedDate.length === 0 ? (
              <Typography color="text.secondary">Nenhum horário disponível para este dia.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {hoursForSelectedDate.map((hour, idx) => {
                  const hourDate = new Date(hour.datetime);
                  const timeStr = hourDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  const isSelected = selectedHour?.datetime === hour.datetime;
                  const isAvailable = hour.isAvailable;

                  return (
                    <Box key={idx}>
                      <Button
                        variant={isSelected ? 'contained' : 'outlined'}
                        color="primary"
                        disabled={!isAvailable}
                        onClick={() => handleHourClick(hour)}
                        sx={{ 
                          minWidth: 80, 
                          color: isSelected ? '#FFF' : (isAvailable ? 'primary.main' : '#666'),
                          borderColor: isAvailable ? 'primary.main' : '#444'
                        }}
                      >
                        {timeStr}
                      </Button>
                    </Box>
                  )
                })}
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ flex: 1, borderLeft: { md: '1px solid #444' }, pl: { md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h5" color="primary.main" fontWeight="bold">
          Agendar
        </Typography>

        {!selectedHour ? (
          <Typography color="text.secondary">
            Selecione um dia e um horário ao lado para continuar.
          </Typography>
        ) : (
          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle2" color="grey">Horário Selecionado</Typography>
              <Typography variant="h6" color="#FFF">
                {new Date(selectedHour.datetime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="grey" mb={1}>Selecione o Barbeiro</Typography>
              {availableBarbers.length === 0 ? (
                <Typography color="error">Nenhum barbeiro disponível neste horário.</Typography>
              ) : (
                <Select
                  fullWidth
                  value={selectedBarberId}
                  onChange={(e) => setSelectedBarberId(e.target.value)}
                  displayEmpty
                  sx={{ 
                    color: '#FFF', 
                    '.MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
                    '.MuiSvgIcon-root': { color: '#FFF' }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: { bgcolor: '#2A2A2A', color: '#FFF' }
                    }
                  }}
                >
                  <MenuItem value="" disabled sx={{ color: '#AAA' }}>
                    <em>Escolha um barbeiro</em>
                  </MenuItem>
                  {availableBarbers.map(({ id, name }) => (
                    <MenuItem key={id} value={id} sx={{ '&:hover': { bgcolor: '#3A3A3A' }, '&.Mui-selected': { bgcolor: 'primary.dark' } }}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </Box>

            <Button
              variant="contained"
              size="large"
              color="primary"
              disabled={!selectedBarberId || submitting}
              onClick={handleSubmit}
              sx={{ mt: 2, color: '#FFF', fontWeight: 'bold' }}
            >
              {submitting ? 'Agendando...' : 'Marcar'}
            </Button>
          </Stack>
        )}
      </Box>
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
  )
}
