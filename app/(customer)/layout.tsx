import {
  Stack,
} from "@mui/material";
import { AuthenticatedUser } from "../types";
import Navbar from "./_components/navbar";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Stack
      component="main"
      spacing={2}
      sx={{
        height: '100vh',
        width: '100%',
        bgcolor: '#1A1A1A',
        overflow: 'auto',
      }}
      className="h-screen w-full bg-background flex flex-col gap-4 overflow-y-auto"
    >
      <Navbar />
      {children}
    </Stack>
  )
}
function useEffect(arg0: () => void, arg1: (boolean | AuthenticatedUser | null)[]) {
    throw new Error("Function not implemented.");
}
