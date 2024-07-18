import {formatMonetaryAmount} from "../../utils/moneyUtils.ts";
import {Stack, TextField, Typography} from "@mui/material";
import {Order} from "../../../build/generated-ts/api/api.ts";
import useOrderPositionSummary from "./useOrderPositionSummary.ts";


export default function OrderSummary({order}: { order: Order }) {
  const overallSum = useOrderPositionSummary(order);

  return <Stack direction="column" spacing={2} justifyContent="flex-start" alignItems="center">
    <Typography variant="h6">
      Summe
    </Typography>

    <TextField size="small"
               disabled={true}
               label="Teilnehmer"
               value={`${overallSum.participants} Teilnehmer`}/>

    <TextField size="small"
               disabled={true}
               label="Anzahl"
               value={`${overallSum.count} Gerichte`}/>

    <TextField size="small"
               disabled={!overallSum.countMissing}
               label="Bezahlung fehlt für"
               error={!!overallSum.countMissing}
               value={`${overallSum.countMissing} Gericht${overallSum.countMissing !== 1 ? 'e' : ''}`}/>

    <TextField size="small"
               disabled={true}
               label="Summe"
               value={formatMonetaryAmount(overallSum.price)}/>

    <TextField size="small"
               disabled={true}
               label="Bezahlt"
               value={formatMonetaryAmount(overallSum.paid)}/>

    <TextField size="small"
               disabled={!overallSum.paidMissing}
               label="Bezahlung fehlt"
               error={!!overallSum.paidMissing}
               value={formatMonetaryAmount(overallSum.paidMissing)}/>

    <TextField size="small"
               disabled={true}
               label="Rückgeld"
               value={formatMonetaryAmount(overallSum.changeMoney)}/>

    <TextField size="small"
               disabled={true}
               label="Trinkgeld"
               value={formatMonetaryAmount(overallSum.tip)}/>
  </Stack>;
}
