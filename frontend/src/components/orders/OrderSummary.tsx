import {useMemo} from "react";
import {OrderPosition} from "./OrderPositionsTable.tsx";
import {formatMonetaryAmount} from "../../utils/moneyUtils.ts";
import {Paper, Stack, TextField, Typography} from "@mui/material";
import {styled} from '@mui/system';

export default function OrderSummary({orderPositions}: { orderPositions: OrderPosition[] }) {
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

  return <Paper elevation={2} sx={{p: 1}}>
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
        <Typography color="text.secondary">
          Summe
        </Typography>

        <Stack direction="row" spacing={2}>
          <STextField size="small"
                      disabled={true}
                      label="Anzahl"
                      value={`${overallSum.count} Gerichte`}/>
          <STextField size="small"
                      disabled={true}
                      label="Summe"
                      value={formatMonetaryAmount(overallSum.price)}/>
          <STextField size="small"
                      disabled={true}
                      label="Bezahlt"
                      value={formatMonetaryAmount(overallSum.paid)}/>
          <STextField size="small"
                      disabled={true}
                      label="Trinkgeld"
                      value={formatMonetaryAmount(overallSum.tip)}/>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
        <Typography color="text.secondary">
          Fehlen
        </Typography>

        <Stack direction="row" spacing={2}>
          <STextField size="small"
                      disabled={true}
                      label="Fehlen"
                      error={!!overallSum.countMissing}
                      value={`${overallSum.countMissing} Gerichte`}/>
          <STextField size="small"
                      disabled={true}
                      label="Bezahlung fehlt"
                      error={!!overallSum.paidMissing}
                      value={formatMonetaryAmount(overallSum.paidMissing)}/>
        </Stack>
      </Stack>
    </Stack>
  </Paper>
}

const STextField = styled(TextField)`
    width: 150px;

    & .MuiInputBase-input {
        padding: 0.25em 0.5em;
    }
`;
