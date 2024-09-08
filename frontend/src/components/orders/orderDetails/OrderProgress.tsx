import {Step, StepLabel, Stepper, SvgIcon, SvgIconTypeMap, Typography} from "@mui/material";
import {Order, OrderStateType} from "../../../../build/generated-ts/api";
import {DateTime} from "luxon";
import LockIcon from '@mui/icons-material/Lock';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CakeIcon from '@mui/icons-material/Cake';
import InterpreterModeIcon from '@mui/icons-material/InterpreterMode';
import {OverridableComponent} from "@mui/material/OverridableComponent";
import {useMemo} from "react";

type OrderStateStep = {
  label: string;
  timestamp?: string | null;
  error?: boolean;
  completed?: boolean;
  icon: OverridableComponent<SvgIconTypeMap> & { muiName: string };
};

export default function OrderProgress({order}: { order: Order }) {
  const steps: OrderStateStep[] = useMemo(() => {
    const rawSteps: Omit<OrderStateStep, 'completed'>[] = [
      {label: "Offen", timestamp: order.createdAt, icon: InterpreterModeIcon},
      {label: "Gesperrt", timestamp: order.stateManagement.locked_at, icon: LockIcon},
      {label: "Bestellt", timestamp: order.stateManagement.ordered_at, icon: ScheduleSendIcon},
      {label: "Geliefert", timestamp: order.stateManagement.delivered_at, icon: CakeIcon},
    ];

    if (order.orderState !== OrderStateType.Delivered && order.orderState !== OrderStateType.Archived) {
      rawSteps.push({
        label: "Zurückgezogen",
        timestamp: order.stateManagement.revoked_at,
        error: !!order.stateManagement.revoked_at,
        icon: HighlightOffIcon
      })
    }

    return rawSteps.map(step => {
      return {
        ...step,
        completed: !!step.timestamp,
      }
    })
  }, [order.createdAt, order.orderState, order.stateManagement.delivered_at, order.stateManagement.locked_at, order.stateManagement.ordered_at, order.stateManagement.revoked_at]);

  return <Stepper>
    {steps.map(s => {
      return <Step key={s.label} completed={s.completed}>
        <StepLabel error={s.error}
                   icon={<SvgIcon component={s.icon}
                                  inheritViewBox={true}
                                  fontSize="small"
                                  color={s.completed ? (!s.error ? "primary" : "error") : "disabled"}
                   />}
                   optional={s.completed && s.timestamp &&
                     <Typography style={{fontSize: '12px'}} color={s.error ? "error" : "inherit"}>
                       {DateTime.fromISO(s.timestamp).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}
                     </Typography>
                   }>
          <Typography style={{fontSize: '14px'}}>
            {s.label}
          </Typography>
        </StepLabel>
      </Step>;
    })}
  </Stepper>;
}
