import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow
} from "@mui/material";
import {useMemo} from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {formatMonetaryAmount} from "../../utils/moneyUtils.ts";

export type OrderPosition = {
  id: string;
  index?: number;
  name: string;
  meal: string;
  price: number;
  paid?: number;
  tip?: number;
};

export default function OrderPositionsTable({orderPositions, onDelete}: {
  orderPositions: OrderPosition[],
  onDelete: (pos: OrderPosition) => void
}) {
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

  return <TableContainer component={Paper} sx={{minHeight: '50vh', maxHeight: '50vh'}}>
    <Table size="small" stickyHeader={true}>
      <TableHead>
        <TableRow>
          <TableCell align="left">#</TableCell>
          <TableCell align="left">Name</TableCell>
          <TableCell align="left">Gericht</TableCell>
          <TableCell align="right">Preis</TableCell>
          <TableCell align="right">Bezahlt</TableCell>
          <TableCell align="right">Trinkgeld</TableCell>
          <TableCell align="right"/>
        </TableRow>
      </TableHead>

      <TableBody>
        {
          orderPositions.map((line, idx) => {
            return <OrderTableRow key={line.id}
                                  idx={idx}
                                  position={line}
                                  onDelete={onDelete}
            />;
          })
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
            {formatMonetaryAmount(overallSum.price)}
          </TableCell>
          <TableCell align="right">
            {formatMonetaryAmount(overallSum.paid)}
          </TableCell>
          <TableCell align="right">
            {formatMonetaryAmount(overallSum.tip)}
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell colSpan={2}>Fehlen</TableCell>
          <TableCell align="left" sx={{color: 'red'}}>
            {overallSum.countMissing} Gerichte
          </TableCell>
          <TableCell align="right" sx={{color: 'red'}}>
            {formatMonetaryAmount(overallSum.paidMissing)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </TableContainer>;
}

function OrderTableRow({idx, position, onDelete}: {
  idx: number,
  position: OrderPosition,
  onDelete: (pos: OrderPosition) => void
}) {
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
      {formatMonetaryAmount(position.price)}
    </TableCell>
    <TableCell align="right">
      {formatMonetaryAmount(position.paid)}
    </TableCell>
    <TableCell align="right">
      {formatMonetaryAmount(position.tip)}
    </TableCell>

    <TableCell align="right">
      <IconButton size="small" color="primary">
        <EditIcon fontSize="inherit"/>
      </IconButton>
      <IconButton size="small" color="secondary" onClick={() => onDelete(position)}>
        <DeleteIcon fontSize="inherit"/>
      </IconButton>
    </TableCell>
  </TableRow>
}
