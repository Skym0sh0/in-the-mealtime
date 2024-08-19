import {useApiAccess} from "../../../utils/ApiAccessContext.tsx";
import {useNotification} from "../../../utils/NotificationContext.tsx";
import {useNavigate} from "react-router-dom";
import {useCallback, useEffect, useMemo, useState} from "react";
import {Order, Restaurant} from "../../../../build/generated-ts/api";

export type OrderRefreshPollingResultType = {
  order: Order | null,
  restaurant: Restaurant | null,
  refresh: () => void,
}

export default function useOrderRefreshPolling(orderId: string | undefined): OrderRefreshPollingResultType {
  const {orderApi, restaurantApi} = useApiAccess();
  const {notifyError} = useNotification();
  const navigate = useNavigate();

  const [autoReload,] = useState(true);

  const [order, setOrder] = useState<Order | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const refresh = useCallback(() => {
    if (!orderId)
      return;

    orderApi.fetchOrder(orderId)
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
  }, [orderId, orderApi, restaurantApi, notifyError, navigate]);


  useEffect(() => {
    refresh()
    if (!autoReload)
      return;

    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [autoReload, refresh]);

  return useMemo(() => {
    return {
      order: order,
      restaurant: restaurant,
      refresh: refresh
    }
  }, [order, refresh, restaurant]);
}
