import {useCallback, useEffect, useMemo, useState} from "react";
import {api} from "../../api/api.ts";
import {List, ListItem} from "@mui/material";
import {Order, Restaurant} from "../../../build/generated-ts/api";
import OrderCard from "./OrderCard.tsx";
import LoadingIndicator from "../../utils/LoadingIndicator.tsx";
import {useNavigate, useParams} from "react-router-dom";

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

  const [autoReload, setAutoReload] = useState(false);

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(() => {
    console.log(params)
    return params?.orderId ?? null;
  });

  const select = useCallback((orderId: string | null) => {
    console.log("use select callback")
    setSelectedOrderId(orderId)

    if (!orderId)
      navigate({pathname: `/order`});
    else
      navigate({pathname: `/order/${orderId}`});
  }, [navigate]);

  const restaurantsById: RestaurantsById = useMemo(() => {
    return restaurants.reduce((agg, cur) => ({...agg, [cur.id]: cur}), {});
  }, [restaurants]);

  // detect referenced restaurants that do not exist
  useEffect(() => {
    const existsOrderWithUnreferencedRestaurant = orders?.map(order => restaurantsById[order.restaurantId])
      ?.some(restaurant => !restaurant)

    if (existsOrderWithUnreferencedRestaurant)
      onRefresh();
  }, []);

  // periodically (re-)load orders
  useEffect(() => {
    const refresh = () => {
      console.log("refresh")
      api.orders.fetchOrders()
        .then(res => {
          console.log("refreshed")
          setOrders(res.data.splice(0, 3));
        })
    };

    refresh();

    if (!autoReload)
      return;

    const interval = setInterval(() => {
      refresh();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // handle if selected order does not exist anymore or if there is something to auto select
  useEffect(() => {
    console.log("changed orders")
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

  return <LoadingIndicator isLoading={orders === null}>
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
  </LoadingIndicator>;
}
