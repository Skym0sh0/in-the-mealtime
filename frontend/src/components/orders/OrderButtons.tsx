import {Button, Stack, Typography} from "@mui/material";
import {Order, OrderStateType} from "../../../build/generated-ts/api/api";
import {assertNever} from "../../utils/utils.ts";
import useOrderPositionSummary from "./useOrderPositionSummary.ts";
import {api} from "../../api/api.ts";
import {useCallback} from "react";
import {useNavigate} from "react-router-dom";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import CakeIcon from '@mui/icons-material/Cake';

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


  const revokeButton = <Button id="btn-order-state-revoke"
                               variant="contained"
                               size="small"
                               color="error"
                               onClick={handleRevoke}
                               startIcon={<HighlightOffIcon/>}>
    Bestellung zurückziehen
  </Button>;

  const deleteButton = <Button id="btn-order-state-delete"
                               variant="contained"
                               size="small"
                               color="error"
                               onClick={handleDelete}
                               startIcon={<DeleteIcon/>}>
    Löschen
  </Button>

  const archiveButton = <Button id="btn-order-state-archive"
                                variant="contained"
                                size="small"
                                color="info"
                                onClick={handleArchive}>
    Archivieren
  </Button>

  const create = () => {
    switch (order.orderState) {
      case OrderStateType.New:
        return deleteButton

      case OrderStateType.Open:
        return <>
          {revokeButton}

          <Button id="btn-order-state-lock-order"
                  variant="contained"
                  size="small"
                  color="success"
                  disabled={!order.infos.orderer || !order.infos.fetcher || !order.infos.moneyCollector}
                  onClick={handleOrdering}
                  startIcon={<LockIcon/>}>
            Bestellung aufgeben
          </Button>
        </>

      case OrderStateType.Locked:
        return <>
          {revokeButton}

          <Button id="btn-order-state-reopen"
                  variant="contained"
                  size="small"
                  color="warning"
                  onClick={handleReopen}
                  startIcon={<LockOpenIcon/>}>
            Bestellung wieder öffnen
          </Button>

          <Button id="btn-order-state-is-ordered"
                  variant="contained"
                  size="small"
                  color="success"
                  disabled={!order.infos.fetcher || !order.infos.moneyCollector}
                  onClick={handleOrderIsOrdered}
                  endIcon={<ScheduleSendIcon/>}>
            Ist Bestellt
          </Button>
        </>

      case OrderStateType.Ordered:
        return <>
          {revokeButton}

          <Button id="btn-order-state-delivered"
                  variant="contained"
                  size="small"
                  color="success"
                  disabled={summary.paidMissing > 0}
                  onClick={handleDelivery}
                  startIcon={<CakeIcon/>}>
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

  return <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
    {elements}
  </Stack>
}
