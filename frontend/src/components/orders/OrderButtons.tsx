import {Button, Paper, Stack, Typography} from "@mui/material";
import {Order, OrderStateType} from "../../../build/generated-ts/api/api";
import {assertNever} from "../../utils/utils.ts";
import useOrderPositionSummary from "./useOrderPositionSummary.ts";
import {api} from "../../api/api.ts";
import {useCallback} from "react";
import {useNavigate} from "react-router-dom";

export default function OrderButtons({order, onRefresh}: { order: Order, onRefresh: () => void, }) {
  const summary = useOrderPositionSummary(order);
  const navigate = useNavigate();

  const handleRevoke = useCallback(() => {
    api.orders.revokeOrder(order.id)
      .then(() => onRefresh())
  }, [order.id, onRefresh]);

  const handleDelete = useCallback(() => {
    api.orders.deleteOrder(order.id)
      .then(() => navigate({pathname: `/order`}, {replace: true}))
  }, [order.id, navigate]);

  const handleArchive = useCallback(() => {
    api.orders.archiveOrder(order.id)
      .then(() => onRefresh())
  }, [order.id, onRefresh]);

  const handleOrdering = useCallback(() => {
    api.orders.lockOrder(order.id)
      .then(() => onRefresh())
  }, [order.id, onRefresh]);

  const handleOrderIsOrdered = useCallback(() => {
    api.orders.orderIsNowOrdered(order.id)
      .then(() => onRefresh())
  }, [order.id, onRefresh]);

  const handleReopen = useCallback(() => {
    api.orders.reopenOrder(order.id)
      .then(() => onRefresh())
  }, [order.id, onRefresh]);

  const handleDelivery = useCallback(() => {
    api.orders.orderIsNowDelivered(order.id)
      .then(() => onRefresh())
  }, [order.id, onRefresh]);


  const revokeButton = <Button variant="contained" color="error" onClick={handleRevoke}>
    Bestellung zurückziehen
  </Button>;

  const deleteButton = <Button variant="contained" color="error" onClick={handleDelete}>
    Löschen
  </Button>

  const archiveButton = <Button variant="contained" color="info" onClick={handleArchive}>
    Archivieren
  </Button>

  const create = () => {
    switch (order.orderState) {
      case OrderStateType.New:
        return deleteButton

      case OrderStateType.Open:
        return <>
          {revokeButton}

          <Button variant="contained"
                  color="success"
                  disabled={!order.infos.orderer}
                  onClick={handleOrdering}>
            Bestellen
          </Button>
        </>

      case OrderStateType.Locked:
        return <>
          {revokeButton}

          <Button variant="contained" color="warning" onClick={handleReopen}>
            Bestellung wieder öffnen
          </Button>

          <Button variant="contained"
                  color="success"
                  disabled={!order.infos.fetcher || !order.infos.moneyCollector}
                  onClick={handleOrderIsOrdered}>
            Ist Bestellt
          </Button>
        </>

      case OrderStateType.Ordered:
        return <>
          {revokeButton}

          <Button variant="contained"
                  color="success"
                  disabled={summary.paidMissing > 0}
                  onClick={handleDelivery}>
            Bestellung eingetroffen
          </Button>
        </>

      case OrderStateType.Revoked:
        return <Typography>Bestellung abgebrochen. Vielleicht ist das Restaurant geschlossen?</Typography>

      case OrderStateType.Delivered:
        return <>
          <Typography>Essen ist da. Guten Appetit !</Typography>

          {archiveButton}
        </>

      case OrderStateType.Archived:
        return <Typography>Bestellung ist archiviert</Typography>

      default:
        throw assertNever(order.orderState);
    }
  }

  const elements = create();

  if (!elements)
    return null;

  return <Paper elevation={8} sx={{padding: 1}}>
    <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
      {elements}
    </Stack>
  </Paper>
}
