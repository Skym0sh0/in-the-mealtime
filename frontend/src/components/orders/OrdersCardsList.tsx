import {useCallback, useEffect, useMemo, useState} from "react";
import {api} from "../../api/api.ts";
import {List, ListItem, Stack} from "@mui/material";
import {Order, Restaurant} from "../../../build/generated-ts/api";
import OrderCard from "./OrderCard.tsx";
import LoadingIndicator from "../../utils/LoadingIndicator.tsx";
import {useNavigate, useParams} from "react-router-dom";
import NewOrderButton from "./NewOrderButton.tsx";

type RestaurantsById = {
  [key: string]: Restaurant;
}

type OrdersCardsListProps = {
  restaurants: Restaurant[]
  onRefresh: () => void;
};

export default function OrdersCardsList({restaurants, onRefresh}: OrdersCardsListProps) {
  const navigate = useNavigate();
  const params = useParams<{ orderId: string }>();

  const [autoReload, _] = useState(true);

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
    return (orders ?? []).map(o => o.restaurantId)
      .map(id => restaurantsById[id])
      .filter(r => !!r)
  }, [orders, restaurantsById]);

  // detect referenced restaurants that do not exist
  useEffect(() => {
    if (!orders)
      return;

    const existsOrderWithUnreferencedRestaurant = orders.map(o => o.restaurantId)
      .map(restaurantId => restaurantsById[restaurantId])
      .some(restaurant => !restaurant)

    if (existsOrderWithUnreferencedRestaurant)
      onRefresh();
  }, []);

  const refresh = useCallback(() => {
    api.orders.fetchOrders()
      .then(res => {
        setOrders(res.data);
      })
  }, []);

  // periodically (re-)load orders
  useEffect(() => {
    refresh();

    if (!autoReload)
      return;
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

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
  }, [orders]);

  return <Stack>
    <NewOrderButton restaurants={restaurants}
                    restaurantsWithOpenOrder={restaurantsWithOpenOrder}
                    onChange={refresh}/>

    <LoadingIndicator isLoading={orders === null}>
      <List>
        {orders && orders.map((order) => {
          return <ListItem key={order.id}>
            <OrderCard onSelect={() => select(order.id)}
                       selected={order.id === selectedOrderId}
                       order={order}
                       restaurant={restaurantsById[order.restaurantId]}/>
          </ListItem>
        })}
      </List>
    </LoadingIndicator>
  </Stack>;
}
