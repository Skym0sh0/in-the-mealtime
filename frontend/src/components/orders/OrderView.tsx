import {useNavigate, useParams} from "react-router-dom";
import {useCallback, useEffect, useState} from "react";
import {Order, Restaurant} from "../../../build/generated-ts/api/index.ts";
import LoadingIndicator from "../../utils/LoadingIndicator.tsx";
import {Box} from "@mui/material";
import OrderEditor from "./OrderEditor.tsx";
import {useApiAccess} from "../../utils/ApiAccessContext.tsx";
import {useNotification} from "../../utils/NotificationContext.tsx";

export default function OrderView() {
  const {orderApi, restaurantApi} = useApiAccess();
  const {notifyError} = useNotification();
  const navigate = useNavigate();

  const [autoReload, _] = useState(true);

  const params = useParams<{ orderId: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const refresh = useCallback(() => {
    if (!params.orderId)
      return;

    orderApi.fetchOrder(params.orderId)
      .then(res => res.data)
      .then(order => {
        setOrder(order);
        return restaurantApi.fetchRestaurant(order.restaurantId)
      })
      .then(res => setRestaurant(res.data))
      .catch(e => {
        notifyError("Order konnte nicht geladen werden", e);
        navigate("/order")
      })
  }, [params.orderId, orderApi, restaurantApi, notifyError, navigate]);

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
