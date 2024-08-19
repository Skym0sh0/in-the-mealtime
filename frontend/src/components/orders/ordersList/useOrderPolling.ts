import {useCallback, useEffect, useState} from "react";
import {useApiAccess} from "../../../utils/ApiAccessContext.tsx";
import {useNotification} from "../../../utils/NotificationContext.tsx";
import {Order} from "../../../../build/generated-ts/api";

export type OrderPollingResultType = {
  orders: Order[] | null,
  refresh: () => void,
  hasError: boolean,
}

export default function useOrderPolling(onRefresh: () => void): OrderPollingResultType {
  const [autoReload] = useState(true);

  const {orderApi} = useApiAccess();
  const {notifyError} = useNotification();

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

  return {
    orders: orders,
    refresh: refresh,
    hasError: hasError,
  }
}
