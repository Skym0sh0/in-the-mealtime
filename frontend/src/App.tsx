import './App.css'
import AdbIcon from '@mui/icons-material/Adb';
import {
  AppBar,
  Box,
  Button,
  Container,
  createTheme,
  CssBaseline,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography
} from "@mui/material";
import {GlobalRouting} from "./routes/Routes.tsx";
import {AdapterLuxon} from '@mui/x-date-pickers/AdapterLuxon'
import {LocalizationProvider} from "@mui/x-date-pickers";

function NamedLogo() {
  return <Stack direction="row" spacing={1} alignItems="center">
    <AdbIcon/>

    <Typography variant="h5"
                component="div"
                sx={{
                  mr: 2,
                  display: {xs: 'none', md: 'flex'},
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '.3rem',
                  color: 'inherit',
                  textDecoration: 'none',
                }}>
      Meal Ordering
    </Typography>
  </Stack>;
}

function AppBarLinks() {
  return <Toolbar>
    <Button color="inherit" href="/order">
      Bestellungen
    </Button>

    <Button color="inherit" href="/restaurant">
      Restaurants
    </Button>
  </Toolbar>;
}

function AppBarMenu() {
  return <Button color="inherit">
    Profil
  </Button>;
}

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <Box sx={{display: 'flex'}}>
          <CssBaseline/>

          <AppBar position="fixed" sx={{paddingX: '2em', zIndex: (theme) => theme.zIndex.drawer + 1}}>
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Stack direction="row" spacing={2}>
                <NamedLogo/>

                <AppBarLinks/>
              </Stack>

              <AppBarMenu/>
            </Stack>
          </AppBar>

          <Box component="main" sx={{flexGrow: 1, p: 3}}>
            <Toolbar/>

            <Container maxWidth="xl">

              <GlobalRouting/>

            </Container>
          </Box>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App
