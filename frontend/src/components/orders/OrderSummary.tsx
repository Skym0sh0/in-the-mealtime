import {formatMonetaryAmount} from "../../utils/moneyUtils.ts";
import {Paper, Stack, TextField, Typography} from "@mui/material";
import {styled} from '@mui/system';
import {Order} from "../../../build/generated-ts/api/api.ts";
import useOrderPositionSummary from "./useOrderPositionSummary.ts";


export default function OrderSummary({order}: { order: Order }) {
  const overallSum = useOrderPositionSummary(order);

  return <Paper elevation={2} sx={{p: 1}}>
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
        <Typography color="text.secondary">
          Summe
        </Typography>

        <Stack direction="row" spacing={2}>
          <STextField size="small"
                      disabled={true}
                      label="Teilnehmer"
                      value={`${overallSum.participants} Teilnehmer`}/>
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
                      disabled={!overallSum.countMissing}
                      label="Fehlen"
                      error={!!overallSum.countMissing}
                      value={`${overallSum.countMissing} Gerichte`}/>
          <STextField size="small"
                      disabled={!overallSum.paidMissing}
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
