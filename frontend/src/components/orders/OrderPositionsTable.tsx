import {IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
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

export default function OrderPositionsTable({orderPositions, selectedPosition, onSelect, onDelete}: {
  orderPositions: OrderPosition[],
  selectedPosition: OrderPosition | null,
  onSelect: (pos: OrderPosition) => void
  onDelete: (pos: OrderPosition) => void
}) {
  return <TableContainer component={Paper} sx={{minHeight: '50vh', maxHeight: '50vh', border: '1px solid lightgray'}}>
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
                                  selected={line.id === selectedPosition?.id}
                                  position={line}
                                  onSelect={onSelect}
                                  onDelete={onDelete}
            />;
          })
        }
      </TableBody>
    </Table>
  </TableContainer>;
}

function OrderTableRow({idx, position, selected, onSelect, onDelete}: {
  idx: number,
  position: OrderPosition,
  selected: boolean,
  onSelect: (pos: OrderPosition) => void
  onDelete: (pos: OrderPosition) => void
}) {
  return <TableRow selected={selected}>
    <TableCell align="left" color="text.secondary">
      {
        selected
          ? <EditIcon color="warning" fontSize="small"/>
          : (idx + 1)
      }
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
      <IconButton size="small"
                  color="primary"
                  disabled={selected}
                  onClick={() => onSelect(position)}>
        <EditIcon fontSize="inherit"/>
      </IconButton>
      <IconButton size="small"
                  color="secondary"
                  disabled={selected}
                  onClick={() => onDelete(position)}>
        <DeleteIcon fontSize="inherit"/>
      </IconButton>
    </TableCell>
  </TableRow>
}
