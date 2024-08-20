import {useCallback, useEffect, useState} from "react";
import {useApiAccess} from "../../../utils/ApiAccessContext.tsx";
import {useNotification} from "../../../utils/NotificationContext.tsx";
import {ChangeEventEventTypeEnum, Order} from "../../../../build/generated-ts/api";
import useServerEvents from "../useServerEvents.ts";

export type OrderPollingResultType = {
  orders: Order[] | null,
  refresh: () => void,
  hasError: boolean,
}

export default function useOrderPolling(onRefresh: () => void): OrderPollingResultType {
  const [autoReload] = useState(false);

  const {orderApi} = useApiAccess();
  const {notifyError} = useNotification();

  const event = useServerEvents(ChangeEventEventTypeEnum.OrdersChanged, ChangeEventEventTypeEnum.RestaurantsChanged, ChangeEventEventTypeEnum.RestaurantUpdated);

  const [hasError, setHasError] = useState(false)
  const [orders, setOrders] = useState<Order[] | null>(null);

  const refresh = useCallback(() => {
    onRefresh();

    orderApi.fetchOrders()
      .then(res => {
        setHasError(false)
        setOrders(res.data);
      })
      .catch(e => {
        setHasError(true)
        setOrders([])
        notifyError("Konnte Orders nicht laden", e);
      })
  }, [onRefresh, orderApi, notifyError]);

  // periodically (re-)load orders
  useEffect(() => {
    refresh();

    if (!autoReload)
      return;
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [autoReload, refresh]);

  useEffect(() => {
    if (event)
      refresh();
  }, [event, refresh]);

  return {
    orders: orders,
    refresh: refresh,
    hasError: hasError,
  }
}
