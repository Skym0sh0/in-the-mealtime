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
               title="So viele verschiedene Teilnehmer machen in dieser Bestellung mit."
               value={`${overallSum.participants} Teilnehmer`}/>

    <TextField size="small"
               disabled={true}
               label="Anzahl"
               title="So viele Gerichte sind in dieser Bestellung enthalten."
               value={`${overallSum.count} Gerichte`}/>

    <TextField size="small"
               disabled={!overallSum.countMissing}
               label="Bezahlung fehlt für"
               title="So viele Gerichte wurden bisher noch nicht als bezahlt abgehakt."
               error={!!overallSum.countMissing}
               value={`${overallSum.countMissing} Gericht${overallSum.countMissing !== 1 ? 'e' : ''}`}/>

    <TextField size="small"
               disabled={true}
               label="Summe"
               title="Das sind die gesamten Kosten für diese Bestellung inklusive Lieferung."
               value={formatMonetaryAmount(overallSum.price)}/>

    <TextField size="small"
               disabled={true}
               label="Bezahlt"
               title="Das ist der Betrag, der bisher gezahlt bzw. gesammelt wurde, inklusive Trinkgeld und Wechselgeld."
               value={formatMonetaryAmount(overallSum.paid)}/>

    <TextField size="small"
               disabled={!overallSum.paidMissing}
               label="Bezahlung fehlt"
               title="Das ist der Betrag, der bisher noch fehlt, um die Bestellung bezahlen zu können."
               error={!!overallSum.paidMissing}
               value={formatMonetaryAmount(overallSum.paidMissing)}/>

    <TextField size="small"
               disabled={true}
               label="Rückgeld"
               title="Das ist der Betrag, der zuviel gezahlt wurde und als Wechselgeld wieder an die Teilnehmer zurückgeht."
               value={formatMonetaryAmount(overallSum.changeMoney)}/>

    <TextField size="small"
               disabled={true}
               label="Trinkgeld"
               title="Das ist der Betrag, der als Trinkgeld an das Restaurant gehen soll. Hiervon wird auch die Liefergebühr bzw. die Bestellkosten bezahlt."
               value={formatMonetaryAmount(overallSum.tip)}/>
  </Stack>;
}
