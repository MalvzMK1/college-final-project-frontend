'use client'

import { AppBar, Toolbar, Box, Button, Typography } from "@mui/material";
import Image from "next/image";
import {
  Logout as LogoutIcon
} from "@mui/icons-material";
import { AuthContext } from "@/app/_contexts";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Pages = 'calendar' | 'history';

export default function Navbar() {
  const router = useRouter();
  const { authLoaded, user, cleanToken } = useContext(AuthContext);

  const [currentPage, setCurrentPage] = useState<Pages>('calendar');

  const handleLogout = () => {
    cleanToken();
    router.push('/login')
  }

  const changePage = (destiny: Pages) => {
    if (destiny === currentPage) return;

    setCurrentPage(destiny);

    let route = '';

    if (destiny === "calendar") {
      route = '/';
    } else if (destiny === "history") {
      route = '/historico'
    }

    router.push(route);
  }

  useEffect(() => {
    if (authLoaded && !user) {
      router.push('/login')
    }
  }, [authLoaded, user])

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: "#262626"
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          paddingX: 8,
          paddingY: 2,
          justifyContent: 'space-between',
        }}
      >
        <Image
          src="/logo.png"
          alt="Logo" 
          width={64} 
          height={64} 
          className="rounded-full"
        />
        
        <Box
          sx={{
            display: 'flex',
            gap: 2
          }}
        >
          <Button
            variant={currentPage === 'calendar' ? 'outlined' : 'contained'}
            onClick={() => changePage('calendar')}
          >
            Calendário
          </Button>
          <Button
            variant={currentPage === 'history' ? 'outlined' : 'contained'}
            onClick={() => changePage('history')}
          >
            Histórico
          </Button>
        </Box>

        <Box>
          <Button
            fullWidth
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              justifyContent: 'flex-start',
              p: 1.5,
              borderRadius: 2,
              color: 'error.main',
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'error.main',
                opacity: .5,
              },
            }}
          >
            <Typography
              variant="body1" 
              fontWeight="medium"
              sx={{ 
                display: { xs: 'none', md: 'block' },
              }}
            >
              Sair
            </Typography>
          </Button>
        </Box>
      </Toolbar> 
    </AppBar>
  )
}
