import './App.css'
import AdbIcon from '@mui/icons-material/Adb';
import {AppBar, Box, Button, Container, CssBaseline, Stack, Toolbar, Typography} from "@mui/material";
import {GlobalRouting} from "./routes/Routes.tsx";

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
      Orders
    </Button>

    <Button color="inherit" href="/restaurant">
      Restaurants
    </Button>
  </Toolbar>;
}

function AppBarMenu() {
  return <Button color="inherit">
    Profile
  </Button>;
}

function App() {
  return (
    <Box sx={{paddingTop: '4em'}}>
      <CssBaseline/>

      <AppBar position="fixed" sx={{height: '4em', paddingX: '2em'}}>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Stack direction="row" spacing={2}>
            <NamedLogo/>

            <AppBarLinks/>
          </Stack>

          <AppBarMenu/>
        </Stack>
      </AppBar>

      <Box>
        <Container maxWidth="xl">

          <GlobalRouting/>

        </Container>
      </Box>
    </Box>
  )
}

export default App
