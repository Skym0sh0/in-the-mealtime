import {useParams} from "react-router-dom";
import {useCallback, useEffect, useState} from "react";
import {api} from "../../api/api.ts";
import {Order, Restaurant} from "../../../build/generated-ts/api/index.ts";
import LoadingIndicator from "../../utils/LoadingIndicator.tsx";
import {Box} from "@mui/material";
import OrderEditor from "./OrderEditor.tsx";

export default function OrderView() {
  const [autoReload, ] = useState<boolean>(true);

  const params = useParams<{ orderId: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const refresh = useCallback(() => {
    if (!params.orderId)
      return;

    api.orders.fetchOrder(params.orderId)
      .then(res => res.data)
      .then(order => {
        setOrder(order);
        return api.restaurants.fetchRestaurant(order.restaurantId)
      })
      .then(res => setRestaurant(res.data))
  }, [params.orderId]);

  useEffect(() => {
    refresh()
    if (!autoReload)
      return;

    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [autoReload, refresh]);

  return <Box sx={{padding: '2em', height: '100%'}}>
    <LoadingIndicator isLoading={order === null || restaurant === null}>
      {restaurant && order && <OrderEditor restaurant={restaurant} order={order} onChange={refresh}/>}
    </LoadingIndicator>
  </Box>
}
