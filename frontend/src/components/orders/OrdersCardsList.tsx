import {useCallback, useEffect, useMemo, useState} from "react";
import {List, ListItem, Stack} from "@mui/material";
import {Order, Restaurant} from "../../../build/generated-ts/api";
import OrderCard from "./OrderCard.tsx";
import LoadingIndicator from "../../utils/LoadingIndicator.tsx";
import {useNavigate, useParams} from "react-router-dom";
import NewOrderButton from "./NewOrderButton.tsx";
import {useApiAccess} from "../../utils/ApiAccessContext.tsx";
import {useNotification} from "../../utils/NotificationContext.tsx";

type RestaurantsById = {
  [key: string]: Restaurant;
}

type OrdersCardsListProps = {
  restaurants: Restaurant[],
  orderableRestaurantIds: string[],
  onRefresh: () => void,
};

export default function OrdersCardsList({restaurants, orderableRestaurantIds, onRefresh}: OrdersCardsListProps) {
  const {orderApi} = useApiAccess();
  const {notifyError} = useNotification();

  const navigate = useNavigate();
  const params = useParams<{ orderId: string }>();

  const [autoReload, _] = useState(true);

  const [hasError, setHasError] = useState(false)
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // initialize and react to selected order
  useEffect(() => {
    setSelectedOrderId(params?.orderId ?? null)
  }, [params?.orderId]);

  const select = useCallback((orderId: string | null) => {
    setSelectedOrderId(orderId)

    if (!orderId)
      navigate({pathname: `/order`});
    else
      navigate({pathname: `/order/${orderId}`});
  }, [navigate]);

  const restaurantsById: RestaurantsById = useMemo(() => {
    return restaurants.reduce((agg, cur) => ({...agg, [cur.id]: cur}), {});
  }, [restaurants]);

  const restaurantsWithOpenOrder = useMemo(() => {
    return restaurants.filter(r => !orderableRestaurantIds.includes(r.id))
  }, [orderableRestaurantIds, restaurants]);

  // detect referenced restaurants that do not exist
  useEffect(() => {
    if (!orders)
      return;

    const existsOrderWithUnreferencedRestaurant = orders.map(o => o.restaurantId)
      .map(restaurantId => restaurantsById[restaurantId])
      .some(restaurant => !restaurant)

    if (existsOrderWithUnreferencedRestaurant)
      onRefresh();
  }, [onRefresh, orders, restaurantsById]);

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

  // handle if selected order does not exist anymore or if there is something to auto select
  useEffect(() => {
    if (!orders) {
      return;
    }
    if (!orders || !orders.length) {
      select(null)
      return;
    }

    if (!orders.some(order => order.id === selectedOrderId)) {
      select(null)
    }

    if (!selectedOrderId)
      select(orders[0].id)
  }, [orders, select, selectedOrderId]);

  return <Stack sx={{padding: '0.5em'}}>
    <NewOrderButton restaurants={restaurants}
                    restaurantsWithOpenOrder={restaurantsWithOpenOrder}
                    onChange={refresh}/>

    <LoadingIndicator isLoading={orders === null}>
      <List>
        {!hasError && orders &&
          orders.map((order) => {
            return <ListItem key={order.id}>
              <OrderCard onSelect={() => select(order.id)}
                         selected={order.id === selectedOrderId}
                         order={order}
                         restaurant={restaurantsById[order.restaurantId]}/>
            </ListItem>
          })
        }
      </List>
    </LoadingIndicator>
  </Stack>;
}
