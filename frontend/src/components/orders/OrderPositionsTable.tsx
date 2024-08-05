import {Box, IconButton, Paper, TableRow} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import UndoIcon from '@mui/icons-material/Undo';
import {formatMonetaryAmount} from "../../utils/moneyUtils.ts";
import {OrderPosition, OrderStateType} from "../../../build/generated-ts/api/api.ts";
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import {useMemo} from "react";

type TableRow = OrderPosition & {
  tableIndex: number,

  isPaid: boolean,
  returnMoney: number | null,

  isSelected: boolean,
  isEditable: boolean,
  isDeletable: boolean,
  isErroneous: boolean,
};

export default function OrderPositionsTable({
                                              height,
                                              orderState,
                                              orderPositions,
                                              selectedPosition,
                                              onSelect,
                                              onDeselect,
                                              onDelete
                                            }: {
  height: number,
  orderState: OrderStateType,
  orderPositions: OrderPosition[],
  selectedPosition: OrderPosition | null,
  onSelect: (pos: OrderPosition) => void,
  onDeselect: () => void,
  onDelete: (pos: OrderPosition) => void,
}) {
  const rows: TableRow[] = useMemo(() => {
    return orderPositions.sort((a, b) => a.index - b.index)
      .map((pos, idx) => {
        const isPaid = pos.price + (pos.tip ?? 0) <= (pos.paid ?? 0);
        const returnMoney = isPaid ? (pos.paid ?? 0) - pos.price - (pos.tip ?? 0) : null;

        const isEditable = orderState === OrderStateType.New || orderState === OrderStateType.Open
          || (!isPaid && (
            orderState === OrderStateType.Locked
            || orderState === OrderStateType.Ordered
          ));

        const obj: TableRow = {
          ...pos,
          tableIndex: idx + 1,

          isPaid: isPaid,
          returnMoney: returnMoney,

          isSelected: pos.id === selectedPosition?.id,
          isEditable: isEditable,
          isDeletable: orderState === OrderStateType.New || orderState === OrderStateType.Open,
          isErroneous: (pos.paid ?? 0) <= 0,
        };
        return obj;
      })
  }, [orderPositions, orderState, selectedPosition?.id]);

  const columns: GridColDef<TableRow>[] = useMemo(() => {
    return [
      {
        headerName: "#",
        field: 'index',
        filterable: false,
        resizable: false,
        headerAlign: 'center',
        align: 'center',
        flex: 0.1,
        valueGetter: (_, row) => row.index + 1,
        renderCell: (row) => <IndexCell position={row.row} selected={row.row.isSelected}/>,
      },
      {headerName: "Name", field: 'name', flex: 0.6,},
      {headerName: "Gericht", field: 'meal', flex: 1,},
      {headerName: "Preis", field: 'price', flex: 0.25, valueGetter: (_, row) => formatMonetaryAmount(row.price)},
      {headerName: "Bezahlt", field: 'paid', flex: 0.25, valueGetter: (_, row) => formatMonetaryAmount(row.paid)},
      {headerName: "Trinkgeld", field: 'tip', flex: 0.25, valueGetter: (_, row) => formatMonetaryAmount(row.tip)},
      {
        headerName: "Rückgeld",
        field: 'return',
        flex: 0.25,
        valueGetter: (_, row) => formatMonetaryAmount(row.returnMoney)
      },
      {
        headerName: "Actions",
        field: 'actions',
        sortable: false,
        filterable: false,
        resizable: false,
        disableColumnMenu: true,
        headerAlign: 'right',
        align: 'right',
        flex: 0.25,
        renderCell: (row) => <ActionCell row={row.row}
                                         onSelect={() => onSelect(row.row)}
                                         onDeselect={() => onDeselect()}
                                         onDelete={() => onDelete(row.row)}/>
      },
    ];
  }, [onSelect, onDeselect, onDelete]);

  return <Box component={Paper}
              sx={{
                minHeight: '240px',
                height: `${height}px`,
                maxHeight: `${height}px`,
                border: '1px solid lightgray'
              }}>
    <DataGrid
      pageSizeOptions={[100]}
      columns={columns}
      rows={rows}
      rowHeight={32}
      disableColumnMenu={true}
    />
  </Box>
}

function IndexCell({position, selected}: { position: OrderPosition, selected: boolean }) {
  const isErrornous = (position.paid ?? 0) <= 0

  if (selected)
    return <EditIcon color="warning" fontSize="small"/>;

  if (isErrornous)
    return <PriorityHighIcon color="error" fontSize="small"/>;

  return (position.index + 1);
}

function ActionCell({row, onSelect, onDeselect, onDelete}: {
  row: TableRow,
  onSelect: () => void,
  onDeselect: () => void,
  onDelete: () => void,
}) {
  return <div>
    {row.isEditable && !row.isSelected &&
      <IconButton size="small"
                  color="primary"
                  disabled={row.isSelected}
                  onClick={onSelect}>
        <EditIcon fontSize="inherit"/>
      </IconButton>
    }
    {row.isEditable && row.isSelected &&
      <IconButton size="small"
                  color="warning"
                  disabled={!row.isSelected}
                  onClick={onDeselect}>
        <UndoIcon fontSize="inherit"/>
      </IconButton>
    }

    {row.isDeletable &&
      <IconButton size="small"
                  color="error"
                  disabled={row.isSelected}
                  onClick={onDelete}>
        <DeleteIcon fontSize="inherit"/>
      </IconButton>
    }
  </div>
}
