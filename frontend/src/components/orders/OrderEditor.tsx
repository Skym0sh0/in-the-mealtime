import {Order, OrderPosition, OrderPositionPatch, Restaurant} from "../../../build/generated-ts/api";
import {Box, Paper, Stack, Typography} from "@mui/material";
import OrderPositionsTable from "./OrderPositionsTable.tsx";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import OrderPositionEditor from "./OrderPositionEditor.tsx";
import OrderSummary from "./OrderSummary.tsx";
import {api} from "../../api/api.ts";
import OrderInfosView from "./OrderInfosView.tsx";
import RestaurantInfos from "./RestaurantInfos.tsx";
import OrderButtons from "./OrderButtons.tsx";
import {DateTime} from "luxon";
import useWindowSizing from "../../utils/useWindowSizing.ts";

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

  const tableParentElement = useRef<HTMLDivElement | null>(null);
  const [tableHeight, setTableHeight] = useState(10);
  const [, windowheight] = useWindowSizing();

  useEffect(() => {
    if (tableParentElement.current) {
      setTableHeight(tableParentElement.current.clientHeight);
    }
  }, [windowheight]);

  return <Paper sx={{padding: '1em', width: '100%', height: '100%'}}>
    <Stack direction="column" spacing={2} sx={{height: '100%'}}>
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
        <Typography variant="h5" color="black">
          Bestellung "{restaurant.name}" am {date}
        </Typography>

        <div style={{flexGrow: '1'}}>
          <OrderButtons order={order} onRefresh={onChange}/>
        </div>

        <Typography variant="caption">
          {order.orderState}
        </Typography>
      </Stack>

      <Paper sx={{height: '100%', flexGrow: '1'}}>
        <Stack direction="column" spacing={2} sx={{height: '100%'}}>
          <Stack direction="row" spacing={1} style={{flexGrow: '1'}}>
            <Paper elevation={4} sx={{minWidth: '5em', width: '15%'}}>
              <OrderInfosView order={order} onUpdateInfos={onChange}/>
            </Paper>

            <Box sx={{minWidth: '15em', width: '70%', flexGrow: '1'}}>
              <Stack direction="column" spacing={1} style={{height: '100%'}}>
                <div style={{flexGrow: '1', height: '100%'}}
                     ref={tableParentElement}>
                  <OrderPositionsTable height={tableHeight}
                                       orderState={order.orderState}
                                       orderPositions={order.orderPositions}
                                       selectedPosition={selectedPosition}
                                       onSelect={onSelectToEditPosition}
                                       onDelete={onDeletePosition}/>
                </div>

                <OrderSummary order={order}/>
              </Stack>
            </Box>

            <Paper elevation={4} sx={{minWidth: '5em', width: '15%'}}>
              <RestaurantInfos restaurant={restaurant}/>
            </Paper>
          </Stack>

          <OrderPositionEditor orderState={order.orderState}
                               onSave={onCreatePosition}
                               onUpdate={onUpdatePosition}
                               onAbort={onDeselect}
                               inputPosition={selectedPosition}/>
        </Stack>
      </Paper>
    </Stack>
  </Paper>
}
