import {Button, Stack, Typography} from "@mui/material";
import {Order, OrderStateType} from "../../../../build/generated-ts/api/api.ts";
import {assertNever} from "../../../utils/utils.ts";
import useOrderPositionSummary from "../useOrderPositionSummary.ts";
import {useCallback} from "react";
import {useNavigate} from "react-router-dom";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import CakeIcon from '@mui/icons-material/Cake';
import {useConfirmationDialog} from "../../../utils/ConfirmationDialogContext.tsx";
import {useApiAccess} from "../../../utils/ApiAccessContext.tsx";
import {useNotification} from "../../../utils/NotificationContext.tsx";

export default function OrderButtons({order, onRefresh}: { order: Order, onRefresh: () => void, }) {
  const {orderApi} = useApiAccess();
  const {notifyError, notifySuccess} = useNotification();

  const {confirmDialog} = useConfirmationDialog();

  const summary = useOrderPositionSummary(order);
  const navigate = useNavigate();

  const handleRevoke = useCallback(async () => {
    if (await confirmDialog({
      title: 'Möchtest du die Bestellung wirklich widerrufen?',
      caption: "Die Bestellung wird hiermit widerrufen und in kurzer Zeit entfernt. Keiner kann seine Bestellung ändern oder etwas hinzufügen!",
      tip: "Das ist z.B. wenn man beim Bestellen merkt, dass das Restaurant geschlossen hat oder andere unerwartete Probleme aufkommen.",
    })) {
      orderApi.revokeOrder(order.id, order.version)
        .then(() => notifySuccess("Bestellung zurückgezogen"))
        .then(() => onRefresh())
        .catch(e => notifyError("Bestellung konnte nicht zurückgezogen werden", e))
    }
  }, [order.id, onRefresh, confirmDialog, orderApi, notifyError, order.version, notifySuccess]);

  const handleDelete = useCallback(async () => {
    if (await confirmDialog({title: 'Möchtest du die Bestellung wirklich löschen?'})) {
      orderApi.deleteOrder(order.id, order.version)
        .then(() => notifySuccess("Bestellung gelöscht"))
        .then(() => navigate({pathname: `/order`}, {replace: true}))
        .catch(e => notifyError("Bestellung konnte nicht gelöscht werden", e))
    }
  }, [order.id, navigate, confirmDialog, orderApi, notifyError, order.version, notifySuccess]);

  const handleArchive = useCallback(() => {
    orderApi.archiveOrder(order.id, order.version)
      .then(() => notifySuccess("Bestellung archiviert"))
      .then(() => onRefresh())
  }, [order.id, onRefresh, orderApi, order.version, notifySuccess]);

  const handleOrdering = useCallback(async () => {
    if (await confirmDialog({
      title: 'Möchtest du die Bestellung wirklich sperren?',
      caption: "Die Bestellung wird hiermit gesperrt und keiner kann seine Bestellung ändern oder etwas hinzufügen!",
      tip: "In der Zeit sollst du die Bestellung beim Restaurant aufgeben und danach hier bestätigen. Machst du das nicht, wird die Bestellung in wenigen Minuten automatisch wieder entsperrt."
    })) {
      orderApi.lockOrder(order.id, order.version)
        .then(() => notifySuccess("Bestellung gesperrt"))
        .then(() => onRefresh())
        .catch(e => notifyError("Bestellung konnte nicht gesperrt werden", e))
    }
  }, [order.id, onRefresh, confirmDialog, orderApi, notifyError, order.version, notifySuccess]);

  const handleOrderIsOrdered = useCallback(async () => {
    if (await confirmDialog({
      title: 'Ist die Bestellung erfolgreich bestellt worden?',
      caption: "Die Bestellung wurde erfolgreich bestellt. Änderungen außer Bezahlen sind nicht mehr möglich.",
      importantCaption: "Vergiss nicht, das Eintreffen der Bestellung hier abzuhaken und dafür zu sorgen, dass alle bezahlt haben.",
    })) {
      orderApi.orderIsNowOrdered(order.id, order.version)
        .then(() => notifySuccess("Bestellung ist bestellt"))
        .then(() => onRefresh())
        .catch(e => notifyError("Bestellung konnte nicht als bestellt markiert werden", e))
    }
  }, [order.id, onRefresh, confirmDialog, orderApi, notifyError, order.version, notifySuccess]);

  const handleReopen = useCallback(async () => {
    if (await confirmDialog({
      title: 'Möchtest du die Bestellung wieder entsperren?',
      caption: "Die Bestellung wird wieder entsperrt und jeder kann seine Bestellung ändern oder etwas hinzufügen!",
      tip: "Das soll benutzt werden, wenn z.B. das Restaurant noch nicht offen hat oder das Telefon besetzt ist und später nochmal versucht werden muss zu bestellen.",
    })) {
      orderApi.reopenOrder(order.id, order.version)
        .then(() => notifySuccess("Bestellung wieder entsperrt"))
        .then(() => onRefresh())
        .catch(e => notifyError("Bestellung konnte nicht wiedereröffnet werden", e))
    }
  }, [order.id, onRefresh, confirmDialog, orderApi, notifyError, order.version, notifySuccess]);

  const handleDelivery = useCallback(() => {
    orderApi.orderIsNowDelivered(order.id, order.version)
      .then(() => notifySuccess("Bestellung ist geliefert"))
      .then(() => onRefresh())
      .catch(e => notifyError("Bestellung konnte nicht als geliefert markiert werden", e))
  }, [order.id, onRefresh, orderApi, notifyError, order.version, notifySuccess]);

  const revokeButton = <Button id="btn-order-state-revoke"
                               variant="contained"
                               size="small"
                               color="error"
                               title="Zieht die Bestellung zurück und entfernt sie somit. Das ist z.B. für den Fall gedacht, wo ein Restaurant unerwarteterweise geschlossen hat."
                               onClick={handleRevoke}
                               startIcon={<HighlightOffIcon/>}>
    Bestellung zurückziehen
  </Button>;

  const deleteButton = <Button id="btn-order-state-delete"
                               variant="contained"
                               size="small"
                               color="error"
                               title="Entfernt die Bestellung und alles, was daran hängt, als ob es sie niemals gegeben hätte."
                               onClick={handleDelete}
                               startIcon={<DeleteIcon/>}>
    Löschen
  </Button>

  const archiveButton = <Button id="btn-order-state-archive"
                                variant="contained"
                                size="small"
                                color="info"
                                title="Archiviert die Bestellung, so dass sie nach einer kurzen Übergangszeit nicht mehr angezeigt wird."
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
                  title="Sperrt die Bestellung, um so Zeit zu geben die Bestellung beim Restaurant zu bestellen."
                  disabled={!order.infos.orderer || !order.infos.fetcher || !order.infos.moneyCollector || !summary.feeIsSatisfied}
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
                  title="Öffnet die gesperrte Bestellung wieder. Das ist z.B. für den Fall, dass das Restaurant gerade nicht erreichbar oder aktuell noch geschlossen ist."
                  onClick={handleReopen}
                  startIcon={<LockOpenIcon/>}>
            Bestellung wieder öffnen
          </Button>

          <Button id="btn-order-state-is-ordered"
                  variant="contained"
                  size="small"
                  color="success"
                  title="Markiert die Bestellung als beim Restaurant bestellt. D.h. ab jetzt heisst es Warten auf das Eintreffen der Bestellung."
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
                  title="Markiert die Bestellung als geliefert und benachrichtigt alle Teilnehmer darüber."
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
