import {Drawer, Paper, Toolbar} from "@mui/material";


export default function OrdersOverview() {
  const drawerWidth = 240;

  return <Paper elevation={8}>
    {
      Array(25)
        .fill(null)
        .map((_, idx) => {
          return <p key={idx}>Orders Overview {idx}</p>
        })
    }
    <Drawer variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: {
                width: drawerWidth,
                boxSizing: 'border-box'
              },
            }}>
      <Toolbar/>
      <Paper sx={{height: '100%', maxHeight: '100%'}}>
        <p>Keine Bestellungen vorhanden</p>
      </Paper>
    </Drawer>
  </Paper>;
}
