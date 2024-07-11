import {Button, Paper, Stack, Typography} from "@mui/material";
import {Order, OrderState} from "../../../build/generated-ts/api/api";
import {assertNever} from "../../utils/utils.ts";
import useOrderPositionSummary from "./useOrderPositionSummary.ts";

export default function OrderButtons({order}: { order: Order }) {
  const summary = useOrderPositionSummary(order);

  const revokeButton = <Button variant="contained" color="error">
    Bestellung zurückziehen
  </Button>;

  const deleteButton = <Button variant="contained" color="error">
    Löschen
  </Button>

  const archiveButton = <Button variant="contained" color="info">
    Archivieren
  </Button>

  const create = () => {
    switch (order.orderState) {
      case OrderState.New:
        return deleteButton

      case OrderState.Open:
        return <>
          {revokeButton}

          <Button variant="contained"
                  color="success"
                  disabled={!order.infos.orderer}>
            Bestellen
          </Button>
        </>

      case OrderState.Locked:
        return <>
          {revokeButton}

          <Button variant="contained" color="warning">
            Bestellung wieder öffnen
          </Button>

          <Button variant="contained"
                  color="success"
                  disabled={!order.infos.fetcher || !order.infos.moneyCollector}>
            Ist Bestellt
          </Button>
        </>

      case OrderState.Ordered:
        return <>
          {revokeButton}

          <Button variant="contained"
                  color="success"
                  disabled={summary.paidMissing > 0}>
            Bestellung eingetroffen
          </Button>
        </>

      case OrderState.Revoked:
        return <Typography>Bestellung abgebrochen. Vielleicht ist das Restaurant geschlossen?</Typography>

      case OrderState.Delivered:
        return <>
          <Typography>Essen ist da. Guten Appetit !</Typography>

          {archiveButton}
        </>

      case OrderState.Archived:
        return null

      default:
        throw assertNever(order.orderState);
    }
  }

  const elements = create();

  if (!elements)
    return null;

  return <Paper elevation={8} sx={{padding: 1}}>
    <Stack direction="row" spacing={2} justifyContent="flex-end">
      {elements}
    </Stack>
  </Paper>
}
