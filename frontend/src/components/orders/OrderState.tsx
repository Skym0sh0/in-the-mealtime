import {Box, LinearProgress, Tooltip, Typography} from "@mui/material";
import {Order} from "../../../build/generated-ts/api";
import React, {useCallback, useEffect, useState} from "react";
import {DateTime, Duration} from "luxon";
import {OrderStateType} from "../../../build/generated-ts/api/api.ts";
import {assertNever} from "../../utils/utils.ts";

function translateState(state: OrderStateType) {
  switch (state) {
    case OrderStateType.New:
      return "Neu"
    case OrderStateType.Open:
      return "Offen";
    case OrderStateType.Locked:
      return "Gesperrt";
    case OrderStateType.Ordered:
      return "Bestellt";
    case OrderStateType.Delivered:
      return "Geliefert"
    case OrderStateType.Archived:
      return "Archiviert"
    case OrderStateType.Revoked:
      return "Zurückgezogen";
    default:
      throw assertNever(state);
  }
}

function StateTimeTooltip({state, timeleft}: { state: OrderStateType, timeleft: Duration }) {
  const timeString = timeleft.toFormat("hh:mm:ss");

  switch (state) {
    case OrderStateType.New:
    case OrderStateType.Open:
      return <p>Offene Bestellung wird in {timeString} automatisch geschlossen.</p>;

    case OrderStateType.Locked:
      return <p>Aktuell wird bestellt. In {timeString} wird die Bestellung wieder automatisch entsperrt, weil davon
        ausgegangen wird, dass der Bestellvorgang vergessen worden oder fehlgeschlagen ist.</p>;

    case OrderStateType.Ordered:
      return <p>Die Bestellung ist beim Restaurant bestellt worden. Warten auf Lieferung/Abholung. Falls die
        Lieferung/Abholung nicht bestätigt wird, wird diese automatisch in {timeString} bestätigt.</p>;

    case OrderStateType.Delivered:
      return <p>Bestellung ist geliefert/geholt worden. Viel Spass ! Die Bestellung wird in {timeString} automatisch
        archiviert.</p>;

    case OrderStateType.Archived:
      return <p>Die erfolgreiche Bestellung ist archiviert.</p>;

    case OrderStateType.Revoked:
      return <p>Die Bestellung ist zurückgezogen worden und wird automatisch in {timeString} entfernt.</p>;

    default:
      throw assertNever(state);
  }
}

export default function ({order}: { order: Order }) {
  const [timeLeft, setTimeLeft] = useState<Duration | null>(null)
  const [progress, setProgress] = useState<number | null>(null);

  const refresh = useCallback(() => {
    if (!order.stateManagement.next_transition_duration || !order.stateManagement.next_transition_timestamp)
      return;

    const now = DateTime.now();

    const duration = Duration.fromISO(order.stateManagement.next_transition_duration);
    const targetTime = DateTime.fromISO(order.stateManagement.next_transition_timestamp);

    const diff = now.until(targetTime).toDuration().normalize();

    setTimeLeft(diff)
    setProgress((diff.toMillis() / duration.toMillis()) * 100);
  }, [order.stateManagement.next_transition_duration, order.stateManagement.next_transition_timestamp]);

  useEffect(() => {
    refresh();

    const interval = setInterval(() => {
      refresh();
    }, 500)

    return () => clearInterval(interval)
  }, [refresh]);

  return <Tooltip arrow={true} title={
    <React.Fragment>
      {timeLeft &&
        <StateTimeTooltip state={order.orderState} timeleft={timeLeft}/>
      }
    </React.Fragment>
  }>
    <Box>
      <Typography variant="caption" color="text.secondary">
        {translateState(order.orderState)}
      </Typography>

      {progress &&
        <LinearProgress variant="determinate" value={progress}/>
      }
    </Box>
  </Tooltip>
}
