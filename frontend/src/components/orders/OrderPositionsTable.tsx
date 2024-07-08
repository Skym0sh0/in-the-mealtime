import {Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow} from "@mui/material";
import {useMemo} from "react";

export type OrderPosition = {
  id: string;
  index: number;
  name: string;
  meal: string;
  price: number;
  paid: number | null;
  tip: number | null;
};

export default function OrderPositionsTable({orderPositions}: { orderPositions: OrderPosition[] }) {
  const overallSum = useMemo(() => {
    const add = (mapper: (pos: OrderPosition) => number, filter: (pos: OrderPosition) => boolean = () => true) => {
      return orderPositions.filter(filter)
        .map(mapper)
        .reduce((agg, cur) => agg + cur, 0)
    };

    const tmp = {
      count: orderPositions.length,
      price: add(l => l.price),
      paid: add(l => l.paid ?? 0),
      tip: add(l => l.tip ?? 0),

      countMissing: orderPositions.filter(pos => !pos.paid).length,
      paidMissing: add(pos => pos.price, pos => !pos.paid),
    }

    return {
      ...tmp
    };
  }, [orderPositions]);

  return <TableContainer component={Paper} sx={{maxHeight: '50vh'}}>
    <Table size="small" stickyHeader={true}>
      <TableHead>
        <TableRow>
          <TableCell align="left">#</TableCell>
          <TableCell align="left">Name</TableCell>
          <TableCell align="left">Gericht</TableCell>
          <TableCell align="right">Preis</TableCell>
          <TableCell align="right">Bezahlt</TableCell>
          <TableCell align="right">Trinkgeld</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {
          orderPositions.map((line, idx) => <OrderTableRow key={line.id} idx={idx} position={line}/>)
        }
      </TableBody>

      <TableFooter>
        <TableRow>
          <TableCell colSpan={6}/>
        </TableRow>

        <TableRow>
          <TableCell colSpan={2}>
            Summe
          </TableCell>
          <TableCell align="left">
            {overallSum.count} Gerichte
          </TableCell>
          <TableCell align="right">
            {overallSum.price}€
          </TableCell>
          <TableCell align="right">
            {overallSum.paid}€
          </TableCell>
          <TableCell align="right">
            {overallSum.tip}€
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell colSpan={2}>Fehlen</TableCell>
          <TableCell align="left" sx={{color: 'red'}}>
            {overallSum.countMissing} Gerichte
          </TableCell>
          <TableCell align="right" sx={{color: 'red'}}>
            {overallSum.paidMissing}€
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </TableContainer>;
}

function OrderTableRow({position, idx}: { position: OrderPosition, idx: number }) {
  return <TableRow>
    <TableCell align="left" color="text.secondary">
      {idx + 1}
    </TableCell>
    <TableCell align="left">
      {position.name}
    </TableCell>
    <TableCell align="left">
      {position.meal}
    </TableCell>
    <TableCell align="right">
      {position.price}€
    </TableCell>
    <TableCell align="right">
      {position.paid}
    </TableCell>
    <TableCell align="right">
      {position.tip}
    </TableCell>
  </TableRow>
}
