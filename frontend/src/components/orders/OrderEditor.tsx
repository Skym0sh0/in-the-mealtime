import {Order, OrderPosition, OrderPositionPatch, Restaurant} from "../../../build/generated-ts/api";
import {Box, Paper, Stack, Typography} from "@mui/material";
import OrderPositionsTable from "./OrderPositionsTable.tsx";
import {useCallback, useMemo, useState} from "react";
import OrderPositionEditor from "./OrderPositionEditor.tsx";
import OrderSummary from "./OrderSummary.tsx";
import {api} from "../../api/api.ts";
import OrderInfosView from "./OrderInfosView.tsx";
import RestaurantInfos from "./RestaurantInfos.tsx";
import OrderButtons from "./OrderButtons.tsx";
import {DateTime} from "luxon";

type OrderEditorProps = {
  restaurant: Restaurant;
  order: Order;
  onChange: () => void;
}

export default function OrderEditor({restaurant, order, onChange}: OrderEditorProps) {
  const [selectedPosition, setSelectedPosition] = useState<OrderPosition | null>(null);

  const onCreatePosition: (position: OrderPositionPatch) => Promise<void> = useCallback((position: OrderPositionPatch) => {
    return api.orders.createOrderPosition(order.id, position)
      .then(() => {
        onChange()
      })
  }, [order.id, onChange]);

  const onUpdatePosition: (positionId: string, position: OrderPositionPatch) => Promise<void> = useCallback((positionId: string, position: OrderPositionPatch) => {
    return api.orders.updateOrderPosition(order.id, positionId, position)
      .then(() => {
        setSelectedPosition(null)
        onChange()
      })
  }, [onChange, order.id]);

  const onDeletePosition = useCallback((position: OrderPosition) => {
    api.orders.deleteOrderPosition(order.id, position.id)
      .then(() => {
        onChange()
      })
  }, [onChange, order.id]);

  const onSelectToEditPosition = useCallback((position: OrderPosition) => {
    setSelectedPosition(position)
  }, []);

  const onDeselect = useCallback(() => setSelectedPosition(null), [])

  const date = useMemo(() => {
    if (!order.date)
      return null

    const dt = DateTime.fromISO(order.date);
    return `${dt.toFormat("EEEE", {locale: 'de'})} (${dt.toFormat("dd.MM.yyyy", {locale: 'de'})})`;
  }, [order.date])

  return <Box sx={{minWidth: '860px'}}>
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <div/>

        <Typography variant="h6">
          Bestellung am {date}
        </Typography>

        <Typography variant="caption">
          {order.orderState}
        </Typography>
      </Stack>

      <Paper elevation={8} sx={{padding: 1}}>
        <Stack direction="row" spacing={2}>
          <OrderInfosView order={order} onUpdateInfos={onChange}/>

          <Stack spacing={2}>
            <OrderSummary order={order}/>

            <Stack spacing={1}>
              <OrderPositionsTable orderPositions={order.orderPositions}
                                   selectedPosition={selectedPosition}
                                   onSelect={onSelectToEditPosition}
                                   onDelete={onDeletePosition}/>

              <OrderPositionEditor onSave={onCreatePosition}
                                   onUpdate={onUpdatePosition}
                                   onAbort={onDeselect}
                                   inputPosition={selectedPosition}/>
            </Stack>
          </Stack>

          <RestaurantInfos restaurant={restaurant}/>
        </Stack>
      </Paper>

      <OrderButtons order={order} onRefresh={onChange}/>
    </Stack>
  </Box>
}
