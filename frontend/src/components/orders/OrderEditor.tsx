import {Order, OrderPosition, OrderPositionPatch, Restaurant} from "../../../build/generated-ts/api";
import {Box, Divider, Paper, Stack, Typography} from "@mui/material";
import OrderPositionsTable from "./OrderPositionsTable.tsx";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import OrderPositionEditor from "./OrderPositionEditor.tsx";
import OrderSummary from "./OrderSummary.tsx";
import OrderInfosView from "./OrderInfosView.tsx";
import RestaurantInfos from "./RestaurantInfos.tsx";
import OrderButtons from "./OrderButtons.tsx";
import {DateTime} from "luxon";
import useWindowSizing from "../../utils/useWindowSizing.ts";
import OrderState from "./OrderState.tsx";
import {useApiAccess} from "../../utils/ApiAccessContext.tsx";

type OrderEditorProps = {
  restaurant: Restaurant;
  order: Order;
  onChange: () => void;
}

export default function OrderEditor({restaurant, order, onChange}: OrderEditorProps) {
  const {orderApi} = useApiAccess();

  const [selectedPosition, setSelectedPosition] = useState<OrderPosition | null>(null);

  const onCreatePosition: (position: OrderPositionPatch) => Promise<void> = useCallback((position: OrderPositionPatch) => {
    return orderApi.createOrderPosition(order.id, position)
      .then(() => {
        onChange()
      })
  }, [order.id, onChange, orderApi]);

  const onUpdatePosition: (positionId: string, position: OrderPositionPatch) => Promise<void> = useCallback((positionId: string, position: OrderPositionPatch) => {
    return orderApi.updateOrderPosition(order.id, positionId, position)
      .then(() => {
        setSelectedPosition(null)
        onChange()
      })
  }, [onChange, order.id, orderApi]);

  const onDeletePosition = useCallback((position: OrderPosition) => {
    orderApi.deleteOrderPosition(order.id, position.id)
      .then(() => {
        onChange()
      })
  }, [onChange, order.id, orderApi]);

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

        <OrderState order={order}/>
      </Stack>

      <Paper sx={{height: '100%', flexGrow: '1'}}>
        <Stack direction="column" spacing={2} sx={{height: '100%'}}>
          <Stack direction="row" spacing={1} style={{flexGrow: '1'}}>
            <Paper elevation={4} sx={{minWidth: '5em', width: '15%'}}>
              <Stack justifyContent="space-between" sx={{height: '100%'}}>
                <div style={{flexGrow: 1, padding: '1em'}}>
                  <OrderInfosView order={order} onUpdateInfos={onChange}/>
                </div>

                <Divider orientation="horizontal"/>

                <div style={{flexGrow: 1, padding: '1em'}}>
                  <OrderSummary order={order}/>
                </div>
              </Stack>
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
                                       onDeselect={onDeselect}
                                       onDelete={onDeletePosition}/>
                </div>

                <OrderPositionEditor orderState={order.orderState}
                                     canAddNew={order.orderPositions.length < (order.infos.maximumMealCount ?? 32768)}
                                     onSave={onCreatePosition}
                                     onUpdate={onUpdatePosition}
                                     onAbort={onDeselect}
                                     inputPosition={selectedPosition}/>

              </Stack>
            </Box>

            <Paper elevation={4} sx={{minWidth: '5em', width: '15%'}}>
              <RestaurantInfos restaurant={restaurant}/>
            </Paper>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  </Paper>
}
