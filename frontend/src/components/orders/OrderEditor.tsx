import {Order, Restaurant} from "../../../build/generated-ts/api";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";

type OrderEditorProps = {
  restaurant: Restaurant;
  order: Order;
}

function OrderTable() {
  return <TableContainer>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell></TableCell>
          <TableCell>#</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Gericht</TableCell>
          <TableCell>Preis</TableCell>
          <TableCell>Bezahlt</TableCell>
          <TableCell>Trinkgeld</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {
          Array(5).fill(null)
            .map((_, idx) => {
              return <TableRow key={idx}>
                <TableCell color="text.secondary">
                  {idx + 1}
                </TableCell>
                <TableCell>
                  {idx + 1}
                </TableCell>
                <TableCell>
                  Name #{idx + 1}
                </TableCell>
                <TableCell>
                  {Math.round(30 + Math.random() * 30)}
                </TableCell>
                <TableCell>
                  9€
                </TableCell>
                <TableCell>
                  10€
                </TableCell>
                <TableCell>
                  1€
                </TableCell>
              </TableRow>
            })
        }
      </TableBody>

      <TableFooter>
        <TableRow>
          <TableCell>5</TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell>45€</TableCell>
          <TableCell>50€</TableCell>
          <TableCell>5€</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </TableContainer>;
}

export default function OrderEditor({restaurant, order}: OrderEditorProps) {
  return <Box>
    <Typography variant="h6">
      Bestellung bei {restaurant.name}
    </Typography>

    <Box sx={{
      minWidth: '600px',
    }}>
      <OrderTable/>

    </Box>

    {false && <div style={{borderBottom: "1px solid gray", backgroundColor: "lightgrey"}}>
      My order {JSON.stringify(order)} at {JSON.stringify(restaurant)}
    </div>}
  </Box>
}
