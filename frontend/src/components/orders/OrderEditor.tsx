import {Order, Restaurant} from "../../../build/generated-ts/api";
import {Box, Paper, Stack, Typography} from "@mui/material";
import OrderPositionsTable, {OrderPosition} from "./OrderPositionsTable.tsx";
import {useCallback, useState} from "react";
import OrderPositionEditor from "./OrderPositionEditor.tsx";
import OrderSummary from "./OrderSummary.tsx";
import {api} from "../../api/api.ts";

type OrderEditorProps = {
  restaurant: Restaurant;
  order: Order;
  onChange: () => void;
}

export default function OrderEditor({restaurant, order, onChange}: OrderEditorProps) {
  const [selectedPosition, setSelectedPosition] = useState<OrderPosition | null>(null);

  const onCreatePosition: (position: OrderPosition) => Promise<void> = useCallback((position: OrderPosition) => {
    return api.orders.createOrderPosition(order.id, position)
      .then(() => {
        onChange()
      })
  }, [order.id, onChange]);

  const onUpdatePosition: (position: OrderPosition) => Promise<void> = useCallback((position: OrderPosition) => {
    return api.orders.updateOrderPosition(order.id, position.id, position)
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

  return <Box sx={{minWidth: '860px'}}>
    <Stack spacing={2}>
      <Typography variant="h6">
        Bestellung bei {restaurant.name}
      </Typography>

      <Paper elevation={8} sx={{padding: 1}}>
        <Stack spacing={2}>
          <OrderSummary orderPositions={order.orderPositions}/>

          <Stack spacing={1}>
            <OrderPositionsTable orderPositions={order.orderPositions}
                                 selectedPosition={selectedPosition}
                                 onSelect={onSelectToEditPosition}
                                 onDelete={onDeletePosition}/>

            <OrderPositionEditor onSave={onCreatePosition}
                                 onUpdate={onUpdatePosition}
                                 inputPosition={selectedPosition}/>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  </Box>
}
