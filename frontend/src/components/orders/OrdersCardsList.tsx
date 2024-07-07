import {useEffect, useMemo, useState} from "react";
import {api} from "../../api/api.ts";
import {List, ListItem} from "@mui/material";
import {Order, Restaurant} from "../../../build/generated-ts/api";
import OrderCard from "./OrderCard.tsx";

type RestaurantsById = {
  [key: string]: Restaurant;
}

type OrdersCardsListProps = {
  restaurants: Restaurant[]
  onRefresh: () => void;
};

export default function OrdersCardsList({restaurants, onRefresh}: OrdersCardsListProps) {
  const [orders, setOrders] = useState<Order[] | null>(null);

  const restaurantsById: RestaurantsById = useMemo(() => {
    return restaurants.reduce((agg, cur) => ({...agg, [cur.id]: cur}), {});
  }, [restaurants]);

  useEffect(() => {
    const existsOrderWithUnreferencedRestaurant = orders?.map(order => restaurantsById[order.restaurantId])
      ?.some(restaurant => !restaurant)

    if (existsOrderWithUnreferencedRestaurant)
      onRefresh();
  }, []);

  useEffect(() => {
    const refresh = () => {
      api.orders.fetchOrders()
        .then(res => setOrders(res.data.splice(0, 3)))
    };

    refresh();

    const interval = setInterval(() => {
      refresh();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (orders === null)
    return <div>Keine Bestellung vorhanden</div>

  return <List>
    {orders.map((order, idx) => {
      return <ListItem key={order.id}>
        <OrderCard idx={idx}
                   selected={idx === 0}
                   order={order}
                   restaurant={restaurantsById[order.restaurantId]}/>
      </ListItem>
    })}
  </List>;
}
